# Ollama EC2 (Terraform)

## Layout

```text
infra/terraform/
├─ versions.tf            # terraform + provider versions, AWS provider (region)
├─ main.tf               # calls the ollama-host module
├─ variables.tf          # root inputs (region + module passthrough)
├─ outputs.tf            # re-exports module outputs
├─ terraform.tfvars.example
└─ modules/
   └─ ollama-host/        # reusable module: EC2 + EIP + SG + Caddy/Ollama bootstrap
      ├─ main.tf
      ├─ variables.tf
      ├─ outputs.tf
      ├─ versions.tf      # required_providers only (no provider config)
      └─ user_data.sh.tftpl
```

The root composes the module and owns the provider/region; the module is
environment-agnostic and reusable (e.g. for staging/prod or another region).

## What it provisions

Provisions a single EC2 host that serves the app's private LLM:

- EC2 instance (Ubuntu 22.04) + 30GB gp3 root volume
- Elastic IP (stable address that survives stop/start)
- Security group: **80/443 open** (Caddy), Ollama's **11434 stays internal**
- User data that installs Ollama, pulls the model, and fronts it with **Caddy + a bearer token**

Ollama has no auth of its own, so it binds to `127.0.0.1` and only Caddy (which
checks `Authorization: Bearer <token>`) is reachable from the internet. This is
the access model because Vercel's egress IPs aren't static and can't be
allowlisted.

## Usage

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars   # edit as needed
terraform init
terraform apply
```

## Wire into the app

After apply:

```bash
terraform output ollama_base_url      # -> OLLAMA_BASE_URL
terraform output -raw ollama_api_token # -> OLLAMA_API_KEY
```

Set those plus `LLM_PROVIDER=ollama` and `OLLAMA_MODEL` in the app `.env` and in
Vercel's environment variables.

## HTTP now, HTTPS later

- With no `domain`, Caddy serves on **HTTP :80** (token still enforced). Fine for
  local testing; browsers/Vercel will block this from an HTTPS site.
- Set `domain` (and point its A record at the `public_ip` output), then
  `terraform apply` again — Caddy obtains a TLS cert automatically and
  `ollama_base_url` becomes `https://...`.

## Notes

- `terraform destroy` removes the instance, EIP, and security group.
- The token lives in Terraform state — keep state private (use a remote backend
  with encryption for anything shared).
- GPU: switch `instance_type` to e.g. `g4dn.xlarge` for larger/faster models.
