import type { StoragePlatform } from "@/platform/contracts";

export const webStorage: StoragePlatform = {
  getItem(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {}
  },
  removeItem(key) {
    try {
      window.localStorage.removeItem(key);
    } catch {}
  },
};
