// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// Vite usa import.meta.env para leer las variables que empiezan con VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)