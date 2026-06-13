import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:7143/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
