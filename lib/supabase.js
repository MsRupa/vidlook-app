import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if URL is a valid HTTP/HTTPS URL
const isValidUrl = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

// Only create client if credentials are valid URLs (prevents build errors)
let supabase = null;

if (isValidUrl(supabaseUrl) && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('Supabase credentials not configured or invalid. API calls will fail until valid credentials are provided.');
}

export { supabase };
export default supabase;
