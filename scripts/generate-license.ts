/**
 * JannahFlow Pro — License Generator Script
 * 
 * Usage (one-time generate):
 *   npx tsx scripts/generate-license.ts --domain=app.keluargamu.com --label="Keluarga Maju"
 * 
 * Or run interactively:
 *   npx tsx scripts/generate-license.ts
 */

import * as jose from "jose";
import * as readline from "readline";

// Master secret (prefer setting LICENSE_MASTER_SECRET in environment)
const MASTER_SECRET_STR = process.env.LICENSE_MASTER_SECRET || "bahagiabersamacacubehinggajannah";
const MASTER_SECRET = new TextEncoder().encode(MASTER_SECRET_STR);

// Derive a domain-specific key: HMAC-SHA256(masterSecret, domain)
import { createHmac } from "crypto";
function deriveDomainKey(master: Uint8Array, domain: string) {
  const h = createHmac("sha256", Buffer.from(master)).update(domain).digest();
  return new Uint8Array(h);
}

async function generateLicense(domain: string, label: string, expiryDays?: number): Promise<string> {
  const derivedKey = deriveDomainKey(MASTER_SECRET, domain);

  const jwt = new jose.SignJWT({ domain, label })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("jannahflow-cacube");

  if (expiryDays) jwt.setExpirationTime(`${expiryDays}d`);

  return await jwt.sign(derivedKey);
}

async function main() {
  // Parse CLI args: --domain=xxx --label=yyy
  const args = Object.fromEntries(
    process.argv.slice(2)
      .filter((a) => a.startsWith("--"))
      .map((a) => {
        const [k, ...v] = a.slice(2).split("=");
        return [k, v.join("=")];
      })
  );

  let domain: string = args.domain || "";
  let label: string = args.label || "";

  if (!domain || !label) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const ask = (q: string) => new Promise<string>((res) => rl.question(q, res));

    if (!domain) domain = await ask("Domain pelanggan (contoh: app.keluargabahagia.com): ");
    if (!label) label = await ask("Label / Nama Keluarga: ");
    rl.close();
  }

  domain = domain.trim().toLowerCase();
  label = label.trim();

  if (!domain) {
    console.error("❌  Domain tidak boleh kosong.");
    process.exit(1);
  }

  // allow optional expiry argument from CLI (days)
  const expiry = args.expiry ? parseInt(args.expiry, 10) : undefined;

  const token = await generateLicense(domain, label, expiry);

  console.log("\n─────────────────────────────────────────────────────");
  console.log(`✅  License berhasil dibuat untuk: ${domain}`);
  console.log(`    Label: ${label}${expiry ? ` — berlaku ${expiry} hari` : ''}`);
  console.log("─────────────────────────────────────────────────────");
  console.log("\n📋  JWT Token (salin ke pengaturan JannahFlow):\n");
  console.log(token);
  console.log("\n─────────────────────────────────────────────────────\n");
}

main().catch((e) => { console.error(e); process.exit(1); });
