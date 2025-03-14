
// Helper for handling API responses
export const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || `API error: ${response.status}`);
  }
  return response.json();
};

// CORS proxy URL - using our Supabase Edge Function
export const PROXY_URL = "https://ekdizcuhtpxlxyodpdmb.supabase.co/functions/v1/bereal-proxy/";

// BeReal API base URL (kept for reference)
export const BEREAL_API_BASE_URL = "https://mobile.bereal.com/api";
