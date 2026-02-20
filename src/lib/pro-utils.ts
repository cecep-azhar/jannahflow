import * as jose from "jose";

// Master secret — must match the obfuscated value in the license generator HTML.
const MASTER_SECRET = new TextEncoder().encode("bahagiabersamacacubehinggajannah");

/**
 * Derives a domain-specific signing key:
 *   derivedKey = HMAC-SHA256(masterSecret, domain)
 *
 * Each domain produces a cryptographically unique 32-byte key, so a token
 * minted for "app.familyA.com" is mathematically invalid on "app.familyB.com".
 */
async function getDomainKey(domain: string): Promise<Uint8Array> {
  const masterKey = await crypto.subtle.importKey(
    "raw",
    MASTER_SECRET,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const derived = await crypto.subtle.sign(
    "HMAC",
    masterKey,
    new TextEncoder().encode(domain)
  );
  return new Uint8Array(derived); // 32 bytes, unique per domain
}

// A valid compact JWS has exactly 3 non-empty base64url segments.
function looksLikeJWT(token: string): boolean {
  const parts = token.split(".");
  return parts.length === 3 && parts.every((p) => p.length > 0);
}

/**
 * Verifies a JannahFlow Pro JWT license token.
 *
 * Rules:
 *  - Token must be signed with HMAC-SHA256(masterSecret, hostname).
 *  - Token payload must carry a `domain` claim that exactly matches hostname.
 *  - localhost / LAN IPs are NOT bypassed — a valid token is always required.
 */
export async function verifyProToken(
  token: string | null | undefined,
  hostname: string
): Promise<boolean> {
  if (!token || !looksLikeJWT(token)) return false;

  try {
    // Derive the key expected for this hostname
    const domainKey = await getDomainKey(hostname);

    const { payload } = await jose.jwtVerify(token, domainKey);

    // Double-check the embedded domain claim
    if (!payload.domain || payload.domain !== hostname) return false;

    return true;
  } catch {
    // Invalid signature, expired, or malformed token — silently reject
    return false;
  }
}



