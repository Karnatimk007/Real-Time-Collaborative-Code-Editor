import { API } from "./apis";

export const loginUser    = (data) => API.post("/auth/login", data);
export const registerUser = (data) => API.post("/auth/register", data);
export const logoutUser   = ()     => API.post("/auth/logout");
export const getMe        = ()     => API.get("/auth/me");

// Room API calls
export const createRoom   = (data) => API.post("/room/create", data);
export const validateRoom = (roomId, data) => API.post(`/room/validate/${roomId}`, data);
export const getRoom      = (roomId) => API.get(`/room/${roomId}`);