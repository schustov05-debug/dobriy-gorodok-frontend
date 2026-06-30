// src/api/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://phugltuiwowvwbegtmem.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBodWdsdHVpd293dndiZWd0bWVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MDg0NzgsImV4cCI6MjA5ODE4NDQ3OH0.qJPXUQ1ekKYrIXpi8KVy8ipMBHZPNadLMC6Bsy8xGIY';

// Этот клиент будет автоматически подхватывать токен из localStorage
export const supabase = createClient(supabaseUrl, supabaseKey);