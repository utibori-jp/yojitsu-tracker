import { createApiClient } from "../generated/api";
// TODO: ビルドにするときに管理方法再考。
const baseUrl = import.meta.env.VITE_API_BASE_URL;
if (!baseUrl) {
  console.warn(
    "VITE_API_BASE_URL is not defined. API calls may fail or use an incorrect path. Please ensure it is set in your .env file."
  );
}

export const apiClient = createApiClient(import.meta.env.VITE_API_BASE_URL, {
  axiosConfig: {
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
});
