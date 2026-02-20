import * as jose from "jose";

// Optional: you can set this securely in your environment variables.
const SECRET_KEY = new TextEncoder().encode("mutabaah-jannahflow-secret-key");

/**
 * Verifies if the request is running on a valid domain and has a valid Pro token.
 * We bypass localhost automatically since this is a local development/personal project.
 */
export async function verifyProToken(token: string | null | undefined, hostname: string): Promise<boolean> {
  // 1. Bypass check for localhost or local IPs
  if (
    hostname === "localhost" ||
    hostname.startsWith("127.") ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") // Vercel dev sometimes uses this
  ) {
    return true;
  }

  // 2. No token provided
  if (!token) {
    return false;
  }

  // 3. Verify JWT token
  try {
    const { payload } = await jose.jwtVerify(token, SECRET_KEY, {
      // You can define specific issuers or audiences if needed
      // issuer: 'jannahflow',
    });

    // Check if the token's allowed domain matches the current hostname
    if (payload.domain && payload.domain !== hostname) {
      console.warn("Pro Token domain mismatch", { expected: payload.domain, actual: hostname });
      return false; // Domain mismatch
    }

    return true; // Valid token
  } catch (error) {
    console.error("Invalid Pro Token", error);
    return false;
  }
}
