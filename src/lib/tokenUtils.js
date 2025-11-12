export const getToken = () => {
    try {
        return localStorage.getItem("token") ?? undefined;
    }
    catch {
        return undefined;
    }
};
export const setToken = (t) => { try {
    localStorage.setItem("token", t);
}
catch { } };
export const removeToken = () => { try {
    localStorage.removeItem("token");
}
catch { } };
