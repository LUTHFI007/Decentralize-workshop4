import { webcrypto } from "crypto";

// #############
// ### Utils ###
// #############

// Function to convert ArrayBuffer to Base64 string
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return Buffer.from(buffer).toString("base64");
}

// Function to convert Base64 string to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  var buff = Buffer.from(base64, "base64");
  return buff.buffer.slice(buff.byteOffset, buff.byteOffset + buff.byteLength);
}

// ################
// ### RSA keys ###
// ################

// Generates a pair of private / public RSA keys
type GenerateRsaKeyPair = {
  publicKey: webcrypto.CryptoKey;
  privateKey: webcrypto.CryptoKey;
};
export async function generateRsaKeyPair(): Promise<GenerateRsaKeyPair> {
  // TODO implement this function using the crypto package to generate a public and private RSA key pair.
  //      the public key should be used for encryption and the private key for decryption. Make sure the
  //      keys are extractable.

  const keyPair = await webcrypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048, // The length of the key
      publicExponent: new Uint8Array([1, 0, 1]), // Exponent for RSA encryption
      hash: "SHA-256", // Hashing function for RSA
    },
    true, // Whether the keys are extractable
    ["encrypt", "decrypt"] // Key usage for encryption and decryption
  );

  // remove this
  return { 
    publicKey: keyPair.publicKey, 
    privateKey: keyPair.privateKey,
  };
}

// Export a crypto public key to a base64 string format
export async function exportPubKey(key: webcrypto.CryptoKey): Promise<string> {
  // TODO implement this function to return a base64 string version of a public key

  const exported = await webcrypto.subtle.exportKey("spki", key);
  return arrayBufferToBase64(exported); // Convert ArrayBuffer to Base64
}

// Export a crypto private key to a base64 string format
export async function exportPrvKey(
  key: webcrypto.CryptoKey | null
): Promise<string | null> {
  // TODO implement this function to return a base64 string version of a private key

  if (key === null) {
    return null;
  }
  const exported = await webcrypto.subtle.exportKey("pkcs8", key);
  return arrayBufferToBase64(exported); // Convert ArrayBuffer to Base64
}

// Import a base64 string public key to its native format
export async function importPubKey(
  strKey: string
): Promise<webcrypto.CryptoKey> {
  // TODO implement this function to go back from the result of the exportPubKey function to it's native crypto key object

  const arrayBuffer = base64ToArrayBuffer(strKey);
  return await webcrypto.subtle.importKey(
    "spki", // The key format
    arrayBuffer,
    { name: "RSA-OAEP", hash: "SHA-256" }, // The key algorithm
    true, // Whether the key is extractable
    ["encrypt"] // Key usage
  );
}

// Import a base64 string private key to its native format
export async function importPrvKey(
  strKey: string
): Promise<webcrypto.CryptoKey> {
  // TODO implement this function to go back from the result of the exportPrvKey function to it's native crypto key object

  const arrayBuffer = base64ToArrayBuffer(strKey);
  return await webcrypto.subtle.importKey(
    "pkcs8", // The key format
    arrayBuffer,
    { name: "RSA-OAEP", hash: "SHA-256" }, // The key algorithm
    true, // Whether the key is extractable
    ["decrypt"] // Key usage
  );
}

// Encrypt a message using an RSA public key
export async function rsaEncrypt(
  b64Data: string,
  strPublicKey: string
): Promise<string> {
  // TODO implement this function to encrypt a base64 encoded message with a public key
  // tip: use the provided base64ToArrayBuffer function

  const publicKey = await importPubKey(strPublicKey); // Import the public key
  const encodedData = new TextEncoder().encode(b64Data); // Encode the data as Uint8Array
  const encryptedData = await webcrypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    encodedData
  );
  return arrayBufferToBase64(encryptedData); // Convert encrypted data to Base64
}

// Decrypts a message using an RSA private key
export async function rsaDecrypt(
  data: string,
  privateKey: webcrypto.CryptoKey
): Promise<string> {
  // TODO implement this function to decrypt a base64 encoded message with a private key
  // tip: use the provided base64ToArrayBuffer function

  const encryptedData = base64ToArrayBuffer(data); // Convert Base64 to ArrayBuffer
  const decryptedData = await webcrypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    encryptedData
  );
  return new TextDecoder().decode(decryptedData); // Convert decrypted data to string
}

// ######################
// ### Symmetric keys ###
// ######################

// Generates a random symmetric key
export async function createRandomSymmetricKey(): Promise<webcrypto.CryptoKey> {
  // TODO implement this function using the crypto package to generate a symmetric key.
  //      the key should be used for both encryption and decryption. Make sure the
  //      keys are extractable.

  return await webcrypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 }, // AES-GCM symmetric algorithm
    true, // Whether the key is extractable
    ["encrypt", "decrypt"] // Key usage
  );
}

// Export a crypto symmetric key to a base64 string format
export async function exportSymKey(key: webcrypto.CryptoKey): Promise<string> {
  // TODO implement this function to return a base64 string version of a symmetric key

  const exported = await webcrypto.subtle.exportKey("raw", key);
  return arrayBufferToBase64(exported); // Convert ArrayBuffer to Base64
}

// Import a base64 string format to its crypto native format
export async function importSymKey(
  strKey: string
): Promise<webcrypto.CryptoKey> {
  // TODO implement this function to go back from the result of the exportSymKey function to it's native crypto key object

  const arrayBuffer = base64ToArrayBuffer(strKey);
  return await webcrypto.subtle.importKey(
    "raw", // The key format
    arrayBuffer,
    { name: "AES-GCM" }, // The key algorithm
    true, // Whether the key is extractable
    ["encrypt", "decrypt"] // Key usage
  );
}

// Encrypt a message using a symmetric key
export async function symEncrypt(
  key: webcrypto.CryptoKey,
  data: string
): Promise<string> {
  // TODO implement this function to encrypt a base64 encoded message with a public key
  // tip: encode the data to a uin8array with TextEncoder

  const encodedData = new TextEncoder().encode(data); // Encode data as Uint8Array
  const iv = crypto.getRandomValues(new Uint8Array(12)); // Initialization Vector (IV)
  const encryptedData = await webcrypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encodedData
  );
  return arrayBufferToBase64(encryptedData); // Convert encrypted data to Base64
}

// Decrypt a message using a symmetric key
export async function symDecrypt(
  strKey: string,
  encryptedData: string
): Promise<string> {
  // TODO implement this function to decrypt a base64 encoded message with a private key
  // tip: use the provided base64ToArrayBuffer function and use TextDecode to go back to a string format

  const key = await importSymKey(strKey); // Import the symmetric key
  const encryptedArrayBuffer = base64ToArrayBuffer(encryptedData); // Convert Base64 to ArrayBuffer
  const iv = encryptedArrayBuffer.slice(0, 12); // Extract IV (12 bytes)
  const data = encryptedArrayBuffer.slice(12); // Extract the encrypted data
  const decryptedData = await webcrypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );
  return new TextDecoder().decode(decryptedData); // Convert decrypted data back to string
}
