import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://sqhjsctsxlnivcbeclrn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxaGpzY3RzeGxuaXZjYmVjbHJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDU4MTkyMiwiZXhwIjoyMDgwMTU3OTIyfQ.IRUXYS8UD0SabErfBIWubztC2EdHGygxSVLuNYpx5Hg'
);

const TENANT_ID = 'd82147fa-f5e3-474c-bb39-6936ad3b519a';

async function checkData() {
  // Check categories
  console.log('\n=== CATEGORIES ===');
  const { data: categories } = await supabase.from('categories').select('*').eq('tenant_id', TENANT_ID);
  console.log(JSON.stringify(categories, null, 2));
  
  // Check items
  console.log('\n=== ITEMS (first 3) ===');
  const { data: items } = await supabase.from('items').select('*').eq('tenant_id', TENANT_ID).limit(3);
  console.log(JSON.stringify(items, null, 2));
  
  // Check orders
  console.log('\n=== ORDERS (first 3) ===');
  const { data: orders } = await supabase.from('orders').select('*').eq('tenant_id', TENANT_ID).limit(3);
  console.log(JSON.stringify(orders, null, 2));
  
  // Check modifier_groups
  console.log('\n=== MODIFIER GROUPS ===');
  const { data: modGroups } = await supabase.from('modifier_groups').select('*').eq('tenant_id', TENANT_ID);
  console.log(JSON.stringify(modGroups, null, 2));
  
  // Check modifiers
  console.log('\n=== MODIFIERS ===');
  const { data: modifiers } = await supabase.from('modifiers').select('*').limit(5);
  console.log(JSON.stringify(modifiers, null, 2));
  
  // Check tenant
  console.log('\n=== TENANT ===');
  const { data: tenant } = await supabase.from('tenants').select('*').eq('id', TENANT_ID);
  console.log(JSON.stringify(tenant, null, 2));
  
  // Check branch
  console.log('\n=== BRANCH ===');
  const { data: branch } = await supabase.from('branches').select('*').eq('tenant_id', TENANT_ID);
  console.log(JSON.stringify(branch, null, 2));
  
  // Check users
  console.log('\n=== USERS ===');
  const { data: users } = await supabase.from('users').select('*').eq('tenant_id', TENANT_ID);
  console.log(JSON.stringify(users, null, 2));
}

checkData();
