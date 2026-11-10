import { apiClient } from "./apiClient";

export async function createAnalysis(payload) {
  const { data } = await apiClient.post("/analyses", payload);
  return data.data.analysis;
}

export async function listAnalyses(params = {}) {
  const { data } = await apiClient.get("/analyses", { params });
  return data.data;
}

export async function getAnalysis(id) {
  const { data } = await apiClient.get(`/analyses/${id}`);
  return data.data.analysis;
}

export async function deleteAnalysis(id) {
  await apiClient.delete(`/analyses/${id}`);
}

export async function addOptimization(analysisId, optimization) {
  const { data } = await apiClient.post(`/analyses/${analysisId}/optimizations`, optimization);
  return data.data.analysis;
}
