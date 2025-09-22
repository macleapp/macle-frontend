// src/utils/authStorage.ts
import EncryptedStorage from 'react-native-encrypted-storage';

export async function saveTokens(t:{accessToken:string; refreshToken:string}) {
  await EncryptedStorage.setItem('auth', JSON.stringify(t));
}
export async function getTokens() {
  const raw = await EncryptedStorage.getItem('auth');
  return raw ? JSON.parse(raw) as {accessToken:string; refreshToken:string} : null;
}
export async function clearTokens() { await EncryptedStorage.removeItem('auth'); }