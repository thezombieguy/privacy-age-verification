// wallet.js — sessionStorage wallet abstraction

const STORAGE_KEY = 'agerelay_credential';

export const wallet = {
  store(credential) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(credential));
  },

  get() {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  clear() {
    sessionStorage.removeItem(STORAGE_KEY);
  },

  has() {
    return sessionStorage.getItem(STORAGE_KEY) !== null;
  },
};
