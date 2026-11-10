import { apiClient } from "./apiClient";

export async function uploadResume(file) {
  const formData = new FormData();
  formData.append("resume", file);
  const { data } = await apiClient.post("/resumes", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data.data.resume;
}

export async function listResumes(params = {}) {
  const { data } = await apiClient.get("/resumes", { params });
  return data.data;
}

export async function getResume(id) {
  const { data } = await apiClient.get(`/resumes/${id}`);
  return data.data.resume;
}

export async function updateResumeTitle(id, title) {
  const { data } = await apiClient.patch(`/resumes/${id}`, { title });
  return data.data.resume;
}

export async function updateStructuredContent(id, structuredContent) {
  const { data } = await apiClient.patch(`/resumes/${id}/structured-content`, { structuredContent });
  return data.data.resume;
}

export async function deleteResume(id) {
  await apiClient.delete(`/resumes/${id}`);
}

export async function exportResumePdf(id) {
  const response = await apiClient.post(`/resumes/${id}/export-pdf`, {}, { responseType: "blob" });
  return response.data;
}
