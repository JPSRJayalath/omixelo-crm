import { argon2id } from "hash-wasm";

const SALT_LENGTH = 16;
const HASH_LENGTH = 32;

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string): Uint8Array {
  if (!/^(?:[0-9a-f]{2})+$/i.test(hex) || hex.length % 2 !== 0) {
    throw new Error("Invalid hexadecimal string");
  }

  return new Uint8Array(
    hex.match(/.{2}/g)!.map((byte) => parseInt(byte, 16)),
  );
}

async function derivePinHash(
  pin: string,
  salt: Uint8Array,
): Promise<Uint8Array> {
  const result = await argon2id({
    password: pin,
    salt,
    parallelism: 1,
    iterations: 3,
    memorySize: 65536,
    hashLength: HASH_LENGTH,
    outputType: "binary",
  });

  return result as Uint8Array;
}

export async function hashPin(pin: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const hash = await derivePinHash(pin, salt);

  return `${bytesToHex(salt)}:${bytesToHex(hash)}`;
}