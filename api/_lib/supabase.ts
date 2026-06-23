import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("Missing Supabase credentials. Serverless API will run in sandbox fallback mode.");
}

const customFetch = async (url: string | URL | Request, options?: any): Promise<Response> => {
  const maxRetries = 3;
  let lastError: any = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const fetchOptions = { ...options };
      try {
        const undici = await import('undici');
        if (undici && undici.Agent) {
          fetchOptions.dispatcher = new undici.Agent({
            connect: { timeout: 60000 },
            headersTimeout: 60000,
            bodyTimeout: 60000,
            keepAliveTimeout: 60000,
          });
        }
      } catch (e) {
        // Fallback if undici is not directly importable
      }

      const res = await fetch(url, fetchOptions);
      return res;
    } catch (err: any) {
      lastError = err;
      const isNetworkError = err.message?.includes('fetch failed') || 
                             err.code === 'ECONNRESET' || 
                             err.code === 'UND_ERR_CONNECT_TIMEOUT' ||
                             err.message?.includes('timeout') ||
                             err.message?.includes('Timeout');
                             
      if (isNetworkError && attempt < maxRetries) {
        const delay = attempt * 1500;
        console.warn(`Supabase customFetch: Attempt ${attempt} failed (${err.message || err}). Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw err;
      }
    }
  }
  throw lastError;
};

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
  global: {
    fetch: customFetch,
  },
});

