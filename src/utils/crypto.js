export async function deriveKey(password, salt) {
  const encoder = new TextEncoder();
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptData(text, password, saltHex) {
  if (!text) return '';
  const encoder = new TextEncoder();
  const salt = hexToBytes(saltHex);
  const key = await deriveKey(password, salt);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(text)
  );
  
  const ivHex = bytesToHex(iv);
  const encryptedHex = bytesToHex(new Uint8Array(encrypted));
  return `${ivHex}:${encryptedHex}`;
}

export async function decryptData(cipherText, password, saltHex) {
  if (!cipherText) return '';
  const parts = cipherText.split(':');
  if (parts.length !== 2) return '';
  const iv = hexToBytes(parts[0]);
  const encrypted = hexToBytes(parts[1]);
  const salt = hexToBytes(saltHex);
  try {
    const key = await deriveKey(password, salt);
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (e) {
    console.error("Decryption failed:", e);
    throw new Error("Contraseña incorrecta o datos corruptos");
  }
}

function bytesToHex(bytes) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

export function generateSalt() {
  const arr = window.crypto.getRandomValues(new Uint8Array(16));
  return bytesToHex(arr);
}

export async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hash = await window.crypto.subtle.digest('SHA-256', data);
  return bytesToHex(new Uint8Array(hash));
}

export function validatePasswordCompliance(password, userName) {
  const errors = [];
  
  if (password.length < 7) {
    errors.push("Debe tener al menos 7 caracteres (Sección 5.11.2, regla c).");
  }
  
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  if (!hasLetter || !hasNumber) {
    errors.push("Debe combinar caracteres alfabéticos y numéricos (Sección 5.11.2, regla b).");
  }
  
  if (/(.)\1\1/.test(password)) {
    errors.push("No debe tener más de dos caracteres idénticos consecutivos (ej: 'aaa' o '111').");
  }
  
  const consecutiveSequences = [
    "qwerty", "asdfgh", "zxcvbn", "123456", "012345"
  ];
  const lowerPassword = password.toLowerCase();
  for (const seq of consecutiveSequences) {
    if (lowerPassword.includes(seq)) {
      errors.push(`No debe contener secuencias consecutivas del teclado como '${seq}'.`);
    }
  }
  
  if (userName && userName.length > 3) {
    const cleanUserName = userName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanUserName && lowerPassword.includes(cleanUserName)) {
      errors.push("No debe basarse en el nombre de usuario o empresa.");
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
