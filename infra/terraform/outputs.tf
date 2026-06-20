output "public_ip" {
  description = "Elastic IP of the Ollama host."
  value       = module.ollama_host.public_ip
}

output "instance_id" {
  description = "EC2 instance id."
  value       = module.ollama_host.instance_id
}

output "ollama_base_url" {
  description = "Value for OLLAMA_BASE_URL in the app env."
  value       = module.ollama_host.ollama_base_url
}

output "ollama_api_token" {
  description = "Value for OLLAMA_API_KEY in the app env (Authorization: Bearer)."
  value       = module.ollama_host.ollama_api_token
  sensitive   = true
}
