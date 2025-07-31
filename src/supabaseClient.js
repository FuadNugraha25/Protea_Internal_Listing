import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qyglgvyvbbbbfwpgjknh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5Z2xndnl2YmJiYmZ3cGdqa25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NzAyMjAsImV4cCI6MjA2OTI0NjIyMH0.rLQ00_GDP03Ucr3-ZZQ-m8v09QekzifZHOJ3bc-UfAk'

export const supabase = createClient(supabaseUrl, supabaseKey)
