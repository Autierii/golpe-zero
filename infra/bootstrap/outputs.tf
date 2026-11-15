# Estes valores NÃO são senhas (são identificadores públicos), mas vão para
# GitHub Secrets mesmo assim, para não ficarem espalhados no código.
output "AZURE_CLIENT_ID" {
  value = azurerm_user_assigned_identity.github.client_id
}

output "AZURE_TENANT_ID" {
  value = data.azurerm_client_config.atual.tenant_id
}

output "AZURE_SUBSCRIPTION_ID" {
  value = var.subscription_id
}

output "TFSTATE_STORAGE_ACCOUNT" {
  value = azurerm_storage_account.tfstate.name
}

output "TFSTATE_RESOURCE_GROUP" {
  value = azurerm_resource_group.tfstate.name
}

output "RESOURCE_GROUP_PROD" {
  value = azurerm_resource_group.prod.name
}
