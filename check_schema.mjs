import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://sqhjsctsxlnivcbeclrn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxaGpzY3RzeGxuaXZjYmVjbHJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDU4MTkyMiwiZXhwIjoyMDgwMTU3OTIyfQ.IRUXYS8UD0SabErfBIWubztC2EdHGygxSVLuNYpx5Hg'
);

async function checkSchema() {
  console.log('Checking existing Supabase tables...\n');
  
  // Try known table names for POS system
  const knownTables = ['tenants', 'branches', 'categories', 'items', 'orders', 'order_items', 'customers', 'users', 'modifier_groups', 'modifiers', 'menu_categories', 'menu_items', 'staff'];
  
  for (const table of knownTables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(2);
      if (!error) {
        console.log(`✅ ${table} - EXISTS (${data?.length || 0} rows sampled)`);
        if (data && data[0]) {
          console.log(`   Columns: ${Object.keys(data[0]).join(', ')}`);
        }
      } else {
        console.log(`❌ ${table} - ${error.message}`);
      }
    } catch (e) {
      console.log(`❌ ${table} - Error: ${e.message}`);
    }
  }
}

checkSchema();
