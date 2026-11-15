# ---------------------------------------------------------------------------
# BOOTSTRAP — roda UMA vez, no seu PC, logado com `az login`.
# Cria o que precisa existir antes do pipeline:
#   1. Storage Account privado para o state remoto do Terraform (fora do repo);
#   2. Resource Group de produção;
#   3. Identidade gerenciada que o GitHub Actions usa via OIDC (sem senha
#      guardada em lugar nenhum), com o mínimo de permissão necessário.
# O state DESTE bootstrap fica local (terraform.tfstate está no .gitignore).
# ---------------------------------------------------------------------------
terraform {
  required_version = ">= 1.9"
  required_providers {
    azurerm = { source = "hashicorp/azurerm", version = "~> 4.50" }
    random  = { source = "hashicorp/random", version = "~> 3.7" }
  }
}

provider "azurerm" {
  features {}
  subscription_id     = var.subscription_id
  storage_use_azuread = true
}

data "azurerm_client_config" "atual" {}

resource "random_string" "sufixo" {
  length  = 6
  upper   = false
  special = false
}

locals {
  tags = {
    projeto    = "golpe-zero"
    disciplina = "secure-devops-cloud"
    gerenciado = "terraform"
  }
}

# ---------------- state remoto ----------------
resource "azurerm_resource_group" "tfstate" {
  name     = "rg-${var.prefixo}-tfstate"
  location = var.location
  tags     = local.tags
}

resource "azurerm_storage_account" "tfstate" {
  name                              = "st${var.prefixo}tf${random_string.sufixo.result}"
  resource_group_name               = azurerm_resource_group.tfstate.name
  location                          = azurerm_resource_group.tfstate.location
  account_tier                      = "Standard"
  account_replication_type          = "LRS"
  min_tls_version                   = "TLS1_2"
  https_traffic_only_enabled        = true
  allow_nested_items_to_be_public   = false
  shared_access_key_enabled         = false # só Entra ID (RBAC); nada de chave de acesso
  infrastructure_encryption_enabled = true

  blob_properties {
    versioning_enabled = true # dá para voltar um state corrompido
    delete_retention_policy { days = 14 }
    container_delete_retention_policy { days = 14 }
  }
  tags = local.tags
}

resource "azurerm_storage_container" "tfstate" {
  name                  = "tfstate"
  storage_account_id    = azurerm_storage_account.tfstate.id
  container_access_type = "private"
  depends_on            = [azurerm_role_assignment.voce_state]
}

# você (quem roda o bootstrap) também precisa ler/gravar o state
resource "azurerm_role_assignment" "voce_state" {
  scope                = azurerm_storage_account.tfstate.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = data.azurerm_client_config.atual.object_id
}

# ---------------- produção ----------------
resource "azurerm_resource_group" "prod" {
  name     = "rg-${var.prefixo}-prod"
  location = var.location
  tags     = local.tags
}

# ---------------- identidade do GitHub Actions (OIDC) ----------------
resource "azurerm_user_assigned_identity" "github" {
  name                = "id-${var.prefixo}-github"
  resource_group_name = azurerm_resource_group.tfstate.name
  location            = azurerm_resource_group.tfstate.location
  tags                = local.tags
}

# Só jobs do repositório certo, no environment "producao", trocam o token do
# GitHub por um token da Azure. Fork, PR ou outra branch não conseguem.
resource "azurerm_federated_identity_credential" "github_producao" {
  name                = "github-${var.prefixo}-producao"
  resource_group_name = azurerm_resource_group.tfstate.name
  parent_id           = azurerm_user_assigned_identity.github.id
  audience            = ["api://AzureADTokenExchange"]
  issuer              = "https://token.actions.githubusercontent.com"
  subject             = "repo:${var.github_repo}:environment:producao"
}

# Privilégio mínimo: Contributor só no RG de produção (não na assinatura)...
resource "azurerm_role_assignment" "github_prod" {
  scope                = azurerm_resource_group.prod.id
  role_definition_name = "Contributor"
  principal_id         = azurerm_user_assigned_identity.github.principal_id
}

# ...e leitura/escrita só nos blobs do state.
resource "azurerm_role_assignment" "github_state" {
  scope                = azurerm_storage_container.tfstate.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = azurerm_user_assigned_identity.github.principal_id
}

# ---------------- controle de custo ----------------
resource "azurerm_consumption_budget_resource_group" "prod" {
  count             = var.email_alerta_custo == "" ? 0 : 1
  name              = "budget-${var.prefixo}-prod"
  resource_group_id = azurerm_resource_group.prod.id
  amount            = var.orcamento_usd
  time_grain        = "Monthly"

  time_period {
    start_date = formatdate("YYYY-MM-01'T'00:00:00Z", timestamp())
  }

  notification {
    enabled        = true
    threshold      = 50
    operator       = "GreaterThan"
    contact_emails = [var.email_alerta_custo]
  }
  notification {
    enabled        = true
    threshold      = 80
    operator       = "GreaterThan"
    threshold_type = "Forecasted"
    contact_emails = [var.email_alerta_custo]
  }

  lifecycle { ignore_changes = [time_period] }
}
