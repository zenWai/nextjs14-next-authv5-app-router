// This is an example with web crypto api
// The hashIp cryptography is not viable for passwords
export { hashIp, hashPassword, verifyPassword };

const CURRENT_VERSION = 'v1';
const ITERATIONS = 310000;
const HASH_LENGTH = 256; // bits
const SALT_LENGTH = 16; // bytes

/**
 * Creates a deterministic SHA-256 hash of an IP address
 * Using Web Crypto API compatible with edge
 * Used for storing IPs in the database
 */
const hashIp = async (ipAddress: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(ipAddress);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return bufferToHex(hashBuffer);
};

/**
 * Hashes a password using PBKDF2
 * Compatible with edge
 * @param password - The password to hash
 * @returns A versioned, salted hash string
 */
const hashPassword = async (password: string): Promise<string> => {
  const salt = generateSalt();
  const hash = await generateHash(password, salt);
  return formatHash(salt, hash);
};

/**
 * Verifies a password against a stored hash and checks if the hash needs upgrading
 * @param password - The password to verify
 * @param storedHash - The stored hash to verify against
 * @returns An object containing:
 *          - isPasswordValid: boolean - True if password matches
 *          - passwordNeedsUpdate: boolean - True if the hash should be upgraded to current version
 */
const verifyPassword = async (
  password: string,
  storedHash: string
): Promise<{
  isPasswordValid: boolean;
  passwordNeedsUpdate: boolean;
}> => {
  if (storedHash.startsWith('$2')) {
    return {
      isPasswordValid: false,
      passwordNeedsUpdate: true,
    };
  }
  try {
    const { version, salt, hash } = parseHash(storedHash);
    const newHash = await generateHash(password, salt);
    return {
      isPasswordValid: newHash === hash,
      passwordNeedsUpdate: version !== CURRENT_VERSION,
    };
  } catch (error) {
    // likely an invalid or corrupted hash
    console.error(error);
    return { isPasswordValid: false, passwordNeedsUpdate: true };
  }
};

// Helper functions (not exported)
function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

async function generateHash(password: string, salt: Uint8Array): Promise<string> {
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);
  const keyMaterial = await crypto.subtle.importKey('raw', passwordData, 'PBKDF2', false, ['deriveBits']);
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    HASH_LENGTH
  );
  return bufferToHex(hashBuffer);
}

function formatHash(salt: Uint8Array, hash: string): string {
  const saltHex = bufferToHex(salt);
  return `${CURRENT_VERSION}.${saltHex}.${hash}`;
}

/**
 * Parses a stored hash string into its components
 * @throws Error if the hash format is invalid
 */
function parseHash(storedHash: string): {
  version: string;
  salt: Uint8Array;
  hash: string;
} {
  const [version, saltHex, hash] = storedHash.split('.');
  if (!version || !saltHex || !hash) {
    throw new Error('Invalid hash format');
  }
  const salt = hexToBuffer(saltHex);
  return { version, salt, hash };
}

function bufferToHex(buffer: ArrayBuffer | Uint8Array): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuffer(hex: string): Uint8Array {
  const pairs = hex.match(/.{1,2}/g) || [];
  return new Uint8Array(pairs.map((byte) => parseInt(byte, 16)));
}
