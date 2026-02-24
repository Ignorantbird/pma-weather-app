import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:8000/api" });

export const getCurrentWeather = (location) =>
  api.get("/weather/current", { params: { location } });

export const getForecast = (location) =>
  api.get("/weather/forecast", { params: { location } });

export const getYoutubeVideos = (location) =>
  api.get("/weather/youtube", { params: { location } });

export const getMapsKey = () =>
  api.get("/weather/maps-key");

export const createRecord = (data) =>
  api.post("/records/", data);

export const getRecords = () =>
  api.get("/records/");

export const updateRecord = (id, data) =>
  api.patch(`/records/${id}`, data);

export const deleteRecord = (id) =>
  api.delete(`/records/${id}`);

export const exportData = (format) =>
  api.get(`/export/${format}`, { responseType: "blob" });