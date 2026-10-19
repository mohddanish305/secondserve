// js/config.js — PUBLIC values only. RLS (not secrecy) protects the data.
// Replace with your real Supabase Project URL and anon public key from Supabase Dashboard -> Project Settings -> API.
// NEVER put the service_role / secret key here.

export const SUPABASE_URL = localStorage.getItem('SS_SUPABASE_URL') || "https://second-serve-demo.supabase.co";
export const SUPABASE_ANON_KEY = localStorage.getItem('SS_SUPABASE_ANON_KEY') || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlY29uZC1zZXJ2ZS1kZW1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkzMjQ4MDAsImV4cCI6MjA0NDkwMDgwMH0.placeholder";
