// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

// Ważne: zmienne muszą się zaczynać od VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Brakuje zmiennych środowiskowych Supabase! Sprawdź .env.local')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)