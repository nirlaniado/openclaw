module "ollama_host" {
  source = "./modules/ollama-host"

  name           = var.name
  instance_type  = var.instance_type
  ollama_model   = var.ollama_model
  root_volume_gb = var.root_volume_gb
  domain         = var.domain
  ssh_cidr       = var.ssh_cidr
  key_name       = var.key_name
  tags           = var.tags
}
