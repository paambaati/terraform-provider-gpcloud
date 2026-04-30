# terraform-provider-gpcloud

A Terraform / OpenTofu provider for **GPCloud** (an _imaginary_ cloud infrastructure provider), built with [terrably](https://github.com/paambaati/terrably) — a framework for writing Terraform providers in TypeScript.

This repository serves as both a sample working provider and the live end-to-end test target for the terrably SDK.

[![terrably tests](https://github.com/paambaati/terraform-provider-gpcloud/actions/workflows/e2e-terrably-upgrade.yml/badge.svg)](https://github.com/paambaati/terraform-provider-gpcloud/actions/workflows/e2e-terrably-upgrade.yml)

---

## Requirements

- [Terraform](https://developer.hashicorp.com/terraform/downloads) ≥ 1.0 or [OpenTofu](https://opentofu.org/docs/intro/install/) ≥ 1.6
- Node.js ≥ 25.5.0 **or** [Bun](https://bun.sh) ≥ 0.6.0 (only needed to build from source)

---

## Using the provider

```hcl
terraform {
  required_providers {
    gpcloud = {
      source  = "paambaati/gpcloud"
      version = "~> 0.0"
    }
  }
}

provider "gpcloud" {
  api_url = "https://api.gpcloud.example.com"
}
```

Run `terraform init` to download the provider from the [Terraform Registry](https://registry.terraform.io/providers/paambaati/gpcloud).

---

## Provider configuration

| Argument  | Type   | Required | Description                                  |
|-----------|--------|----------|----------------------------------------------|
| `api_url` | string | No       | Base URL of the GPCloud API. Defaults to the production endpoint. |

---

## Resources

### `gpcloud_item`

Manages a GPCloud item.

#### Example

```hcl
resource "gpcloud_item" "example" {
  name = "hello"
}

output "item_id" {
  value = gpcloud_item.example.id
}
```

#### Argument reference

| Argument | Type   | Required | Description            |
|----------|--------|----------|------------------------|
| `name`   | string | Yes      | Name of the item.      |

#### Attribute reference

| Attribute | Type   | Description                         |
|-----------|--------|-------------------------------------|
| `id`      | string | Computed unique identifier for the item (`item-{name}`). |

---

## Building from source

```bash
# Install dependencies
pnpm install

# Type-check
pnpm run typecheck

# Build a Node.js self-contained binary → bin/terraform-provider-gpcloud
pnpm run build

# Build a Bun binary for a specific target
bun node_modules/terrably/dist/src/cli/index.js build --target bun-linux-x64
```

---

## Local development

To use a locally built binary during development, create a [`dev_overrides`](https://developer.hashicorp.com/terraform/cli/config/config-file#development-overrides-for-provider-developers) file –

```hcl
# tf-workspace/.terraformrc
provider_installation {
  dev_overrides {
    "paambaati/gpcloud" = "/absolute/path/to/terraform-provider-gpcloud/bin"
  }
  direct {}
}
```

Then point Terraform at it:

```bash
export TF_CLI_CONFIG_FILE="$(pwd)/tf-workspace/.terraformrc"
terraform -chdir=tf-workspace plan
```

---

## Publishing a release

Releases are built and published automatically via the [terrably E2E workflow](.github/workflows/e2e-terrably-upgrade.yml). To publish manually –

```bash
# Build all platform binaries first, then:
pnpm run publish \
  --release-version 1.2.3 \
  --binaries-dir release \
  --gpg-key YOUR_GPG_FINGERPRINT \
  --github-release
```

See [`tf-workspace/README.md`](tf-workspace/README.md) for a ready-to-use Terraform workspace that exercises the published provider end-to-end.

---

## Project structure

```
src/
  main.ts          Entry point — wires the provider into the terrably runtime
  provider.ts      GpcloudProvider class — schema, resource list, configuration
  resources/
    item.ts        gpcloud_item resource implementation
tf-workspace/
  main.tf          Example Terraform configuration using this provider
  README.md        How to use the workspace
```

---

## License

See [LICENSE](../../LICENSE).
