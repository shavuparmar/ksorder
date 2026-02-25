import { api } from "./client";

export const api = {
  login: (payload) => api.post("/users/login", payload),
  me: () => api.get("/users/me"),
  logout: () => api.post("/users/logout"),
};
