variable "name" {
  description = "Name prefix for all resources."
  type        = string
  default     = "ollama"
}

variable "instance_type" {
  description = "EC2 instance type. t3.large (8GB) is fine for small CPU models like llama3.2:1b. Use a g4dn/g5 for GPU."
  type        = string
  default     = "t3.small"
}

variable "ollama_model" {
  description = "Model tag pulled at boot (must match OLLAMA_MODEL in the app env)."
  type        = string
  default     = "llama3.2:1b"
}

variable "root_volume_gb" {
  description = "Root EBS size. Needs room for the OS, Ollama, and pulled models."
  type        = number
  default     = 30
}

variable "domain" {
  description = "Optional FQDN for HTTPS via Caddy auto-TLS. Leave empty for HTTP-only on port 80 (token still required)."
  type        = string
  default     = ""
}

variable "ssh_cidr" {
  description = "CIDR allowed to SSH (port 22). Lock this to your IP; empty string disables SSH ingress."
  type        = string
  default     = ""
}

variable "key_name" {
  description = "Existing EC2 key pair name for SSH. Null = no key pair attached."
  type        = string
  default     = null
}

variable "tags" {
  description = "Extra tags applied to all resources."
  type        = map(string)
  default     = {}
}
