import { apiClient } from "./apiClient";

export async function createMockInterview(payload) {
  const { data } = await apiClient.post("/mock-interviews", payload);
  return data.data.mockInterview;
}

export async function getMockInterview(id) {
  const { data } = await apiClient.get(`/mock-interviews/${id}`);
  return data.data.mockInterview;
}

export async function listMockInterviews(params = {}) {
  const { data } = await apiClient.get("/mock-interviews", { params });
  return data.data;
}

export async function submitAnswer(id, { answer, feedback }) {
  const { data } = await apiClient.post(`/mock-interviews/${id}/answers`, { answer, feedback });
  return data.data.mockInterview;
}

export async function nextQuestion(id, question) {
  const { data } = await apiClient.post(`/mock-interviews/${id}/next-question`, question);
  return data.data.mockInterview;
}

export async function finishMockInterview(id, finalReport) {
  const { data } = await apiClient.post(`/mock-interviews/${id}/finish`, { finalReport });
  return data.data;
}

export async function deleteMockInterview(id) {
  await apiClient.delete(`/mock-interviews/${id}`);
}
