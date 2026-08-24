import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://suqrvgtsaalblkplolml.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1cXJ2Z3RzYWFsYmxrcGxvbG1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5MDU5NzMsImV4cCI6MjEwMTQ4MTk3M30.E7jzB1l1_O8jZ6GU6fyUt8zCrP-KVShiVTB8xgD5gYQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data, error } = await supabase
    .from('sync_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

test();
