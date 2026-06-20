data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Token the app must send as `Authorization: Bearer <token>`. Caddy checks it
# before forwarding to Ollama, so the instance can be internet-reachable without
# leaving the model open to anyone. Generated here and exposed as an output.
resource "random_password" "ollama_token" {
  length  = 48
  special = false
}

locals {
  # HTTPS site label when a domain is given, otherwise plain HTTP on :80.
  caddy_site = var.domain != "" ? var.domain : ":80"

  caddyfile = <<-CADDY
    ${local.caddy_site} {
        @authorized header Authorization "Bearer ${random_password.ollama_token.result}"
        handle @authorized {
            reverse_proxy 127.0.0.1:11434
        }
        respond "Unauthorized" 401
    }
  CADDY

  user_data = templatefile("${path.module}/user_data.sh.tftpl", {
    ollama_model = var.ollama_model
    caddyfile    = local.caddyfile
  })

  tags = merge({ Project = var.name }, var.tags)
}

resource "aws_security_group" "this" {
  name        = "${var.name}-sg"
  description = "Ollama host: public HTTP/HTTPS via Caddy, Ollama port stays internal"

  # Caddy reverse proxy (token-protected). 11434 is intentionally NOT exposed.
  ingress {
    description = "HTTP (Caddy / ACME challenge)"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS (Caddy)"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  dynamic "ingress" {
    for_each = var.ssh_cidr != "" ? [var.ssh_cidr] : []
    content {
      description = "SSH"
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = [ingress.value]
    }
  }

  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = local.tags
}

resource "aws_instance" "this" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = var.key_name
  vpc_security_group_ids = [aws_security_group.this.id]
  user_data              = local.user_data

  root_block_device {
    volume_size = var.root_volume_gb
    volume_type = "gp3"
  }

  # Re-provision if the bootstrap script (model or proxy config) changes.
  user_data_replace_on_change = true

  tags = local.tags
}

resource "aws_eip" "this" {
  instance = aws_instance.this.id
  domain   = "vpc"
  tags     = local.tags
}
