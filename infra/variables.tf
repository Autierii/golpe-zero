variable "subscription_id" {
  description = "ID da assinatura Azure (no CI vem de GitHub Secrets via TF_VAR_subscription_id)"
  type        = string
}

variable "resource_group_name" {
  description = "RG de produção criado pelo bootstrap"
  type        = string
  default     = "rg-golpezero-prod"
}

variable "prefixo" {
  description = "Prefixo dos nomes dos recursos"
  type        = string
  default     = "golpezero"
}

variable "dominio_label" {
  description = "Rótulo DNS: vira <label>.<região>.cloudapp.azure.com (único na região)"
  type        = string
  default     = "golpezero"
}

variable "vm_size" {
  description = "Tamanho da VM. D4as_v5 = 4 vCPU/16 GB (LLM 3B responde em ~10-25 s). Mais barato: Standard_D2as_v5"
  type        = string
  default     = "Standard_D4as_v5"
}

variable "ollama_model" {
  description = "Modelo servido pelo Ollama (mesmo do benchmark de GenAI)"
  type        = string
  default     = "qwen2.5:3b"
}

variable "registry" {
  description = "Registro das imagens (GHCR do dono do repositório, minúsculo)"
  type        = string
  default     = "ghcr.io/autierii"
}

variable "github_repo" {
  description = "Repositório dono/nome (de onde a VM baixa o compose e o Caddyfile)"
  type        = string
  default     = "Autierii/golpe-zero"
}
