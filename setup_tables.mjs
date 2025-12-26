import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://sqhjsctsxlnivcbeclrn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxaGpzY3RzeGxuaXZjYmVjbHJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDU4MTkyMiwiZXhwIjoyMDgwMTU3OTIyfQ.IRUXYS8UD0SabErfBIWubztC2EdHGygxSVLuNYpx5Hg'
);

// Check existing tables and create new ones if needed
async function setupTables() {
  const tablesToCheck = [
    'coupons',
    'loyalty_settings', 
    'loyalty_rewards',
    'customer_points',
    'integrations'
  ];

  for (const table of tablesToCheck) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (!error) {
      console.log(`✅ ${table} - EXISTS`);
    } else {
      console.log(`❌ ${table} - NOT FOUND: ${error.message}`);
    }
  }
}

setupTables();
