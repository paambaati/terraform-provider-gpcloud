terraform {
  required_providers {
    gpcloud = {
      source = "paambaati/gpcloud"
      version = "0.0.2"
    }
  }
}

provider "gpcloud" {
  api_url = "http://127.0.0.1:8765"
}

resource "gpcloud_item" "example" {
  name = "hello"
}

output "item_id" { value = gpcloud_item.example.id }
