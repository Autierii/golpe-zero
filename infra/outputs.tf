output "url_mvp" {
  description = "URL pública do MVP (HTTPS automático pelo Caddy)"
  value       = "https://${azurerm_public_ip.app.fqdn}"
}

output "fqdn" {
  value = azurerm_public_ip.app.fqdn
}

output "ip_publico" {
  value = azurerm_public_ip.app.ip_address
}

output "vm_name" {
  value = azurerm_linux_virtual_machine.app.name
}

output "resource_group" {
  value = data.azurerm_resource_group.prod.name
}

output "grafana_url" {
  value = "https://${azurerm_public_ip.app.fqdn}/grafana/"
}

output "grafana_admin_password" {
  description = "Senha do admin do Grafana (terraform output -raw grafana_admin_password)"
  value       = random_password.grafana_admin.result
  sensitive   = true
}

output "metrics_token" {
  description = "Token do /metrics para o Prometheus local (terraform output -raw metrics_token)"
  value       = random_password.metrics_token.result
  sensitive   = true
}
