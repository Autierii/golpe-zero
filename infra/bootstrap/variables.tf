variable "subscription_id" {
  description = "ID da assinatura Azure for Students (az account show --query id -o tsv)"
  type        = string
}

variable "github_repo" {
  description = "Repositório no formato dono/nome, autorizado a fazer deploy via OIDC"
  type        = string
  default     = "Autierii/golpe-zero"
}

variable "prefixo" {
  description = "Prefixo curto (só letras minúsculas e números) dos nomes dos recursos"
  type        = string
  default     = "golpezero"
  validation {
    condition     = can(regex("^[a-z0-9]{3,10}$", var.prefixo))
    error_message = "Use de 3 a 10 letras minúsculas ou números."
  }
}

variable "location" {
  description = "Região Azure (precisa ser permitida pela política do Azure for Students)"
  type        = string
  default     = "eastus2"
}

variable "email_alerta_custo" {
  description = "E-mail que recebe alerta de orçamento. Vazio = não cria o budget."
  type        = string
  default     = ""
  sensitive   = true
}

variable "orcamento_usd" {
  description = "Orçamento mensal do RG de produção, em dólares"
  type        = number
  default     = 60
}
