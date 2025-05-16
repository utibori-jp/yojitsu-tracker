import { createApiClient } from "../generated/api";

export const apiClient = createApiClient(import.meta.env.VITE_API_BASE_URL);
