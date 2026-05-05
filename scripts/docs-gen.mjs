#!/usr/bin/env node
/**
 * docs-gen.mjs
 *
 * Generates the docs/ directory from the live provider schema using tfplugindocs.
 *
 * Prerequisites –
 *   - Provider binary built:  pnpm run build
 *   - terraform CLI in PATH
 *   - tfplugindocs in PATH:   go install github.com/hashicorp/terraform-plugin-docs/cmd/tfplugindocs@latest
 *
 * Usage:
 *   pnpm run docs:gen
 */

import { execSync, execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TF_WORKSPACE = path.join(ROOT, "tf-workspace");
const BIN_DIR = path.join(ROOT, "bin");
const PROVIDER_SOURCE = "registry.terraform.io/paambaati/gpcloud";
const SCHEMA_KEY = "gpcloud"; // short name tfplugindocs expects

// ── 1. Write a temporary .terraformrc that overrides with the local binary ────
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "terrably-docs-"));
const tfrcPath = path.join(tmpDir, ".terraformrc");
fs.writeFileSync(
  tfrcPath,
  `provider_installation {\n  dev_overrides { "paambaati/gpcloud" = "${BIN_DIR}" }\n  direct {}\n}\n`
);

// ── 2. Extract schema from the local provider binary ─────────────────────────
process.stdout.write("▶ Extracting provider schema...\n");
const schemaJson = execSync("terraform providers schema -json", {
  cwd: TF_WORKSPACE,
  env: { ...process.env, TF_CLI_CONFIG_FILE: tfrcPath },
  stdio: ["pipe", "pipe", "inherit"],
}).toString();

const schema = JSON.parse(schemaJson);
const providerSchema = schema.provider_schemas?.[PROVIDER_SOURCE];
if (!providerSchema) {
  process.stderr.write(`✗ Could not find "${PROVIDER_SOURCE}" in schema output.\n`);
  process.exit(1);
}

// Re-key to the short name so tfplugindocs can locate it
const schemaForDocs = {
  format_version: schema.format_version,
  provider_schemas: { [SCHEMA_KEY]: providerSchema },
};
const schemaPath = path.join(tmpDir, "schema.json");
fs.writeFileSync(schemaPath, JSON.stringify(schemaForDocs, null, 2));
process.stdout.write(`  Schema written to ${schemaPath}\n`);

// ── 3. Run tfplugindocs ────────────────────────────────────────────────────────
process.stdout.write("▶ Running tfplugindocs generate...\n");
execSync(
  [
    "tfplugindocs generate",
    `--provider-name ${SCHEMA_KEY}`,
    `--rendered-provider-name GPCloud`,
    `--providers-schema ${schemaPath}`,
  ].join(" "),
  { cwd: ROOT, stdio: "inherit" }
);

// ── 4. Clean up ───────────────────────────────────────────────────────────────
fs.rmSync(tmpDir, { recursive: true, force: true });
process.stdout.write("✅  Docs generated in docs/\n");
