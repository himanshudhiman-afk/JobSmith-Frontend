import { apiClient } from "./apiClient";

export async function createInterviewPrep(payload) {
  const { data } = await apiClient.post("/interviews/generate", payload);
  return data.data.preparation;
}

export async function listInterviewPreps(params = {}) {
  const { data } = await apiClient.get("/interviews", { params });
  return data.data;
}

export async function getInterviewPrep(id) {
  const { data } = await apiClient.get(`/interviews/${id}`);
  return data.data.preparation;
}

export async function deleteInterviewPrep(id) {
  await apiClient.delete(`/interviews/${id}`);
}

export async function toggleQuestionCompleted(prepId, questionId, completed) {
  const { data } = await apiClient.patch(`/interviews/${prepId}/questions/${questionId}`, { completed });
  return data.data.preparation;
}

export async function toggleTaskCompleted(prepId, taskId, completed) {
  const { data } = await apiClient.patch(`/interviews/${prepId}/tasks/${taskId}`, { completed });
  return data.data.preparation;
}
