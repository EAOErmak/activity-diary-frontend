// src/lib/tokenUtils.ts
const TOKEN_KEY = "token";
export function getToken() {
    try {
        return localStorage.getItem(TOKEN_KEY);
    }
    catch {
        return null;
    }
}
export function setToken(token) {
    try {
        localStorage.setItem(TOKEN_KEY, token);
    }
    catch {
        // В некоторых окружениях (например, SSR) localStorage может быть недоступен
    }
}
export function removeToken() {
    try {
        localStorage.removeItem(TOKEN_KEY);
    }
    catch { }
}
// Алиасы для совместимости, если в коде уже использовались другие имена:
export const saveTokenToStorage = setToken;
export const removeTokenFromStorage = removeToken;
export const fetchTokenFromStorage = getToken;
