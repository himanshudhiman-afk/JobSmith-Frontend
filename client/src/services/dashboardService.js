import { apiClient } from "./apiClient";

export async function getDashboardSummary() {
  const { data } = await apiClient.get("/dashboard/summary");
  return data.data;
}

export async function getDashboardActivity(limit = 10) {
  const { data } = await apiClient.get("/dashboard/activity", { params: { limit } });
  return data.data.activity;
}
