// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://lilwrisysdrnxqswttxv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpbHdyaXN5c2Rybnhxc3d0dHh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1NTIwMDEsImV4cCI6MjA1OTEyODAwMX0.v6tkvSejL8gZ1O_LR1c00DFhzpyx58oL1XGCuxKndY4";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);