import api from "./axiosInstance.new";
export const getMyEntries = async () => {
    const r = await api.get("/diary/mine");
    return r.data;
};
export const getEntry = async (id) => {
    const r = await api.get(`/diary/${id}`);
    return r.data;
};
export const createEntry = async (payload) => {
    const r = await api.post("/diary", payload);
    return r.data;
};
export const updateEntry = async (id, payload) => {
    const r = await api.put(`/diary/${id}`, payload);
    return r.data;
};
export const deleteEntry = async (id) => {
    await api.delete(`/diary/${id}`);
};
export const diaryApi = {
    getMyEntries,
    getEntry,
    createEntry,
    updateEntry,
    deleteEntry,
};
