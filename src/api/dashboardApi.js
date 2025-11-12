import api from "./axiosInstance";
export async function fetchDiaryStats() {
    const r = await api.get("/diary/stats");
    return r.data;
}
