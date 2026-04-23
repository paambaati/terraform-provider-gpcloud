import { types, Attribute, Schema, Diagnostics } from "terrably";
import type {
  Provider,
  Resource,
  DataSource,
  ResourceClass,
  DataSourceClass,
  State,
} from "terrably";
import { GpcloudItem } from "./resources/item.js";

export class GpcloudProvider implements Provider {
  getFullName(): string {
    // Must match the `source` field in your required_providers block.
    // Format: <hostname>/<namespace>/<type>
    return "registry.terraform.io/paambaati/gpcloud";
  }

  getModelPrefix(): string {
    // Combined with each resource's getName() to form Terraform type names.
    // e.g. "gpcloud" + "item" → "gpcloud_item"
    return "gpcloud";
  }

  getProviderSchema(_diags: Diagnostics): Schema {
    return new Schema([
      new Attribute("api_url", types.string(), { optional: true }),
    ]);
  }

  validateConfig(_diags: Diagnostics, _config: State): void {}

  configure(_diags: Diagnostics, _config: State): void {}

  getResources(): ResourceClass[] {
    return [GpcloudItem];
  }

  getDataSources(): DataSourceClass[] {
    return [];
  }

  newResource(cls: ResourceClass): Resource {
    return new cls(this);
  }

  newDataSource(cls: DataSourceClass): DataSource {
    return new cls(this);
  }
}
