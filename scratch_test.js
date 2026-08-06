import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://suqrvgtsaalblkplolml.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1cXJ2Z3RzYWFsYmxrcGxvbG1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5MDU5NzMsImV4cCI6MjEwMTQ4MTk3M30.E7jzB1l1_O8jZ6GU6fyUt8zCrP-KVShiVTB8xgD5gYQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log('Testing connection...');
  const { data: perhitData, error: perhitErr } = await supabase.from('perhitungan').select('*').limit(3);
  console.log('Perhitungan query result:', { count: perhitData?.length, error: perhitErr, sample: perhitData?.[0] });

  const { data: sphData, error: sphErr } = await supabase.from('sph').select('*').limit(3);
  console.log('SPH query result:', { count: sphData?.length, error: sphErr, sample: sphData?.[0] });

  const { data: rpcPerhit, error: rpcPerhitErr } = await supabase.rpc('fn_query_perhitungan_paginated', { p_page: 1, p_limit: 2 });
  console.log('RPC perhitungan result:', { error: rpcPerhitErr, data: rpcPerhit });

  const { data: rpcSph, error: rpcSphErr } = await supabase.rpc('fn_query_sph_paginated', { p_page: 1, p_limit: 2 });
  console.log('RPC SPH result:', { error: rpcSphErr, data: rpcSph });
}

test();
