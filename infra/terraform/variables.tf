variable "region" {
  description = "AWS region. 13.53.x.x is eu-north-1 (Stockholm)."
  type        = string
  default     = "eu-north-1"
}

variable "name" {
  description = "Name prefix for all resources."
  type        = string
  default     = "ollama"
}

variable "instance_type" {
  description = "EC2 instance type. t3.small suits tiny CPU models; bump up or use g4dn/g5 for larger/GPU."
  type        = string
  default     = "t3.small"
}

variable "ollama_model" {
  description = "Model tag pulled at boot (must match OLLAMA_MODEL in the app env)."
  type        = string
  default     = "llama3.2:1b"
}

variable "root_volume_gb" {
  description = "Root EBS size in GB."
  type        = number
  default     = 30
}

variable "domain" {
  description = "Optional FQDN for HTTPS via Caddy auto-TLS. Empty = HTTP-only on port 80 (token still required)."
  type        = string
  default     = ""
}

variable "ssh_cidr" {
  description = "CIDR allowed to SSH. Lock to your IP; empty string disables SSH ingress."
  type        = string
  default     = ""
}

variable "key_name" {
  description = "Existing EC2 key pair name for SSH. Null = none."
  type        = string
  default     = null
}

variable "tags" {
  description = "Extra tags applied to all resources."
  type        = map(string)
  default     = {}
}
