output "public_ip" {
  description = "Elastic IP of the Ollama host."
  value       = aws_eip.this.public_ip
}

output "instance_id" {
  description = "EC2 instance id."
  value       = aws_instance.this.id
}

output "ollama_base_url" {
  description = "Value for OLLAMA_BASE_URL in the app env."
  value       = var.domain != "" ? "https://${var.domain}" : "http://${aws_eip.this.public_ip}"
}

output "ollama_api_token" {
  description = "Value for OLLAMA_API_KEY in the app env (Authorization: Bearer)."
  value       = random_password.ollama_token.result
  sensitive   = true
}
