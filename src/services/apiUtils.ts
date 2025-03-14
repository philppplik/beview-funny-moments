
// Helper for handling API responses
export const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || `API error: ${response.status}`);
  }
  return response.json();
};

// CORS proxy URL for development
export const PROXY_URL = "https://cors-anywhere.herokuapp.com/";

// BeReal API base URL
export const BEREAL_API_BASE_URL = "https://mobile.bereal.com/api";
