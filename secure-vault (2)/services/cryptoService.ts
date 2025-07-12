// This tells TypeScript that CryptoJS is a global variable from the script loaded in index.html
declare var CryptoJS: any;

const ITERATIONS = 500000; // Increased iterations for stronger key derivation

/**
 * Generates a random salt.
 * @returns {string} Hex-encoded salt.
 */
export const generateSalt = (): string => {
    return CryptoJS.lib.WordArray.random(128 / 8).toString(CryptoJS.enc.Hex);
};

/**
 * Derives a 512-bit key from a password and salt using PBKDF2, then splits it
 * into a 256-bit encryption key and a 256-bit MAC key.
 * @param {string} password The user's master password.
 * @param {string} salt The hex-encoded salt.
 * @returns {{encKey: string, macKey: string}} The encryption and MAC keys.
 */
export const deriveKey = (password: string, salt: string): { encKey: string; macKey: string } => {
    const key = CryptoJS.PBKDF2(password, CryptoJS.enc.Hex.parse(salt), {
        keySize: 512 / 32, // Derive a 512-bit key (256 for encryption, 256 for MAC)
        iterations: ITERATIONS,
        hasher: CryptoJS.algo.SHA256
    }).toString(CryptoJS.enc.Hex);

    return {
        encKey: key.substring(0, 64),  // First 256 bits for AES encryption
        macKey: key.substring(64, 128) // Last 256 bits for HMAC
    };
};

/**
 * Encrypts data using AES-256-CBC and then creates an HMAC-SHA256 signature
 * of the IV and ciphertext (Encrypt-then-MAC).
 * @param {string} data The plaintext data to encrypt.
 * @param {string} encKey The hex-encoded encryption key.
 * @param {string} macKey The hex-encoded MAC key.
 * @returns {string} A string containing iv:hmac:ciphertext.
 */
export const encrypt = (data: string, encKey: string, macKey: string): string => {
    const iv = CryptoJS.lib.WordArray.random(128 / 8);
    const cipherParams = CryptoJS.AES.encrypt(data, CryptoJS.enc.Hex.parse(encKey), {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
    });

    const ivHex = iv.toString(CryptoJS.enc.Hex);
    const ciphertextHex = cipherParams.ciphertext.toString(CryptoJS.enc.Hex);

    // Create HMAC for IV + ciphertext to ensure integrity and authenticity
    const hmacData = ivHex + ciphertextHex;
    const hmac = CryptoJS.HmacSHA256(CryptoJS.enc.Hex.parse(hmacData), CryptoJS.enc.Hex.parse(macKey)).toString(CryptoJS.enc.Hex);

    // Format: iv:hmac:ciphertext
    return `${ivHex}:${hmac}:${ciphertextHex}`;
};

/**
 * Decrypts data by first verifying the HMAC signature and then decrypting
 * the ciphertext with AES-256-CBC.
 * @param {string} encryptedData The iv:hmac:ciphertext string.
 * @param {string} encKey The hex-encoded encryption key.
 * @param {string} macKey The hex-encoded MAC key.
 * @returns {string | null} The decrypted plaintext or null if decryption fails.
 */
export const decrypt = (encryptedData: string, encKey: string, macKey: string): string | null => {
    try {
        const parts = encryptedData.split(':');
        if (parts.length !== 3) {
            console.error("Invalid encrypted data format.");
            return null;
        }

        const ivHex = parts[0];
        const hmac = parts[1];
        const ciphertextHex = parts[2];

        // Verify HMAC first to prevent timing attacks and ensure integrity
        const hmacData = ivHex + ciphertextHex;
        const calculatedHmac = CryptoJS.HmacSHA256(CryptoJS.enc.Hex.parse(hmacData), CryptoJS.enc.Hex.parse(macKey)).toString(CryptoJS.enc.Hex);

        if (!CryptoJS.lib.WordArray.create(CryptoJS.enc.Hex.parse(hmac)).equals(CryptoJS.lib.WordArray.create(CryptoJS.enc.Hex.parse(calculatedHmac)))) {
            console.error("HMAC verification failed. Data may be tampered.");
            return null;
        }

        const iv = CryptoJS.enc.Hex.parse(ivHex);
        const cipherParams = CryptoJS.lib.CipherParams.create({
            ciphertext: CryptoJS.enc.Hex.parse(ciphertextHex)
        });

        const decrypted = CryptoJS.AES.decrypt(cipherParams, CryptoJS.enc.Hex.parse(encKey), {
            iv: iv,
            padding: CryptoJS.pad.Pkcs7,
            mode: CryptoJS.mode.CBC
        });

        const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
        if (!decryptedText) {
            // This can happen if the key is wrong, resulting in empty/garbled output
            return null;
        }
        return decryptedText;
    } catch (error) {
        console.error("Decryption failed:", error);
        return null;
    }
};