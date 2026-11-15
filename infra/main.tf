# ---------------------------------------------------------------------------
# Infraestrutura de produção do Golpe Zero (Azure)
#   VNet + Subnet + NSG (só 80/443; NENHUMA porta de administração aberta)
#   IP público estático com DNS  <label>.<região>.cloudapp.azure.com
#   VM Ubuntu 24.04 com Docker, Trusted Launch, sem senha e sem SSH exposto
# Administração da VM: `az vm run-command` (plano de controle da Azure,
# autenticado por Entra ID e auditado no Activity Log) — não precisa de porta 22.
# State remoto no Storage Account criado pelo bootstrap (backend.hcl).
# ---------------------------------------------------------------------------
terraform {
  required_version = ">= 1.9"
  required_providers {
    azurerm = { source = "hashicorp/azurerm", version = "~> 4.50" }
    random  = { source = "hashicorp/random", version = "~> 3.7" }
    tls     = { source = "hashicorp/tls", version = "~> 4.1" }
  }
  backend "azurerm" {
    # valores em backend.hcl (local) ou -backend-config (CI)
    container_name   = "tfstate"
    key              = "golpe-zero/prod.tfstate"
    use_azuread_auth = true
  }
}

provider "azurerm" {
  features {}
  subscription_id     = var.subscription_id
  storage_use_azuread = true
  # a identidade do CI só tem permissão no RG; não tentar registrar providers
  resource_provider_registrations = "none"
}

data "azurerm_resource_group" "prod" {
  name = var.resource_group_name
}

locals {
  nome     = var.prefixo
  location = data.azurerm_resource_group.prod.location
  tags = {
    projeto    = "golpe-zero"
    ambiente   = "producao"
    gerenciado = "terraform"
  }
}

# ---------------- rede ----------------
resource "azurerm_virtual_network" "vnet" {
  name                = "vnet-${local.nome}"
  resource_group_name = data.azurerm_resource_group.prod.name
  location            = local.location
  address_space       = ["10.20.0.0/16"]
  tags                = local.tags
}

resource "azurerm_subnet" "app" {
  name                            = "snet-app"
  resource_group_name             = data.azurerm_resource_group.prod.name
  virtual_network_name            = azurerm_virtual_network.vnet.name
  address_prefixes                = ["10.20.1.0/24"]
  default_outbound_access_enabled = false
}

resource "azurerm_network_security_group" "app" {
  name                = "nsg-${local.nome}-app"
  resource_group_name = data.azurerm_resource_group.prod.name
  location            = local.location
  tags                = local.tags

  # Únicas entradas permitidas: HTTP (redireciona p/ HTTPS + desafio do
  # Let's Encrypt) e HTTPS (TCP e UDP/HTTP3). É um site público para idosos,
  # então a origem é a internet. Portas de administração: nenhuma.
  security_rule {
    name                       = "permitir-http-https"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_address_prefix      = "Internet"
    source_port_range          = "*"
    destination_address_prefix = "*"
    destination_port_ranges    = ["80", "443"]
  }
  security_rule {
    name                       = "permitir-http3"
    priority                   = 110
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Udp"
    source_address_prefix      = "Internet"
    source_port_range          = "*"
    destination_address_prefix = "*"
    destination_port_range     = "443"
  }
  # Negação explícita de todo o resto (inclui 22/SSH e 3389/RDP).
  security_rule {
    name                       = "negar-todo-o-resto"
    priority                   = 4096
    direction                  = "Inbound"
    access                     = "Deny"
    protocol                   = "*"
    source_address_prefix      = "*"
    source_port_range          = "*"
    destination_address_prefix = "*"
    destination_port_range     = "*"
  }
}

resource "azurerm_subnet_network_security_group_association" "app" {
  subnet_id                 = azurerm_subnet.app.id
  network_security_group_id = azurerm_network_security_group.app.id
}

resource "azurerm_public_ip" "app" {
  name                = "pip-${local.nome}"
  resource_group_name = data.azurerm_resource_group.prod.name
  location            = local.location
  allocation_method   = "Static"
  sku                 = "Standard"
  domain_name_label   = var.dominio_label
  tags                = local.tags
}

resource "azurerm_network_interface" "app" {
  name                = "nic-${local.nome}"
  resource_group_name = data.azurerm_resource_group.prod.name
  location            = local.location
  tags                = local.tags

  ip_configuration {
    name                          = "primaria"
    subnet_id                     = azurerm_subnet.app.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.app.id
  }
}

# ---------------- segredos gerados (ficam só no state remoto) ----------------
# Token que protege /metrics e /node-metrics. O Prometheus local lê com
# `terraform output -raw metrics_token`.
resource "random_password" "metrics_token" {
  length  = 40
  special = false
}

resource "random_password" "grafana_admin" {
  length  = 24
  special = false
}

# A Azure exige uma chave SSH em VMs Linux sem senha. A chave é gerada e
# NUNCA usada: a porta 22 está fechada no NSG e não existe output dela.
resource "tls_private_key" "nao_usada" {
  algorithm = "ED25519"
}

# ---------------- VM ----------------
resource "azurerm_linux_virtual_machine" "app" {
  name                            = "vm-${local.nome}"
  resource_group_name             = data.azurerm_resource_group.prod.name
  location                        = local.location
  size                            = var.vm_size
  admin_username                  = "azureops"
  disable_password_authentication = true
  network_interface_ids           = [azurerm_network_interface.app.id]
  secure_boot_enabled             = true
  vtpm_enabled                    = true
  patch_mode                      = "ImageDefault" # unattended-upgrades do Ubuntu (cloud-init)
  provision_vm_agent              = true
  tags                            = local.tags

  admin_ssh_key {
    username   = "azureops"
    public_key = tls_private_key.nao_usada.public_key_openssh
  }

  os_disk {
    name                 = "osdisk-${local.nome}"
    caching              = "ReadWrite"
    storage_account_type = "StandardSSD_LRS"
    disk_size_gb         = 64
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "ubuntu-24_04-lts"
    sku       = "server"
    version   = "latest"
  }

  boot_diagnostics {} # storage gerenciado pela Azure

  custom_data = base64encode(templatefile("${path.module}/cloud-init.yaml", {
    dominio       = azurerm_public_ip.app.fqdn
    metrics_token = random_password.metrics_token.result
    grafana_senha = random_password.grafana_admin.result
    ollama_model  = var.ollama_model
    registry      = var.registry
    github_repo   = var.github_repo
  }))

  # cloud-init só roda na criação; trocar o template não deve recriar a VM
  lifecycle { ignore_changes = [custom_data] }
}
