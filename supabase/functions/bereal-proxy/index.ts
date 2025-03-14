
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

// These headers will be applied to all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, bereal-app-version, bereal-device-id, bereal-device-language, user-agent',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// BeReal API base URL
const BEREAL_API_BASE_URL = "https://mobile.bereal.com/api";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request URL to get the endpoint path
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/bereal-proxy/');
    
    if (pathSegments.length < 2) {
      return new Response(
        JSON.stringify({ error: "Invalid endpoint. Use /bereal-proxy/path-to-endpoint" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Extract the endpoint path (everything after /bereal-proxy/)
    const endpoint = pathSegments[1];
    
    // Create the full BeReal API URL
    const targetUrl = `${BEREAL_API_BASE_URL}/${endpoint}${url.search}`;
    
    console.log(`Proxying request to: ${targetUrl}`);

    // Get request body if present
    let requestBody = null;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      requestBody = await req.text();
    }

    // Forward all headers from the original request except host
    const headers = new Headers();
    for (const [key, value] of req.headers.entries()) {
      if (key.toLowerCase() !== 'host') {
        headers.append(key, value);
      }
    }
    
    // Add BeReal-specific headers if not present
    if (!headers.has('bereal-app-version')) {
      headers.append('bereal-app-version', '0.30.0');
    }
    if (!headers.has('bereal-device-id')) {
      headers.append('bereal-device-id', 'ios');
    }
    if (!headers.has('bereal-device-language')) {
      headers.append('bereal-device-language', 'en-US');
    }
    if (!headers.has('user-agent')) {
      headers.append('user-agent', 'BeReal/8309 CFNetwork/1399 Darwin/22.1.0');
    }

    // Make the request to the BeReal API
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: requestBody,
    });

    // Optional: Log the request to the database
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      );
      
      // Extract user ID from the authorization header if available
      let userId = null;
      const authHeader = req.headers.get('authorization');
      if (authHeader) {
        const { data } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));
        userId = data?.user?.id;
      }
      
      // Only log if we have a user ID
      if (userId) {
        await supabaseClient.from('api_requests').insert({
          endpoint,
          status: response.status,
          user_id: userId
        });
      }
    } catch (logError) {
      // Don't fail the request if logging fails
      console.error("Failed to log API request:", logError);
    }

    // Read the response body
    const responseBody = await response.text();

    // Return the proxied response with CORS headers
    return new Response(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...Object.fromEntries(response.headers),
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to proxy request", details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
