import { supabase } from "./supabaseClient";

const supabaseUrl = "https://zebpzfrsmwgiswoaxxel.supabase.co";
const supabaseAnonKey = "sb_publishable_Z0AltV4dRng56zuK4aZMfA_KrcsF9Ie";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
