import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://sqhjsctsxlnivcbeclrn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxaGpzY3RzeGxuaXZjYmVjbHJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDU4MTkyMiwiZXhwIjoyMDgwMTU3OTIyfQ.IRUXYS8UD0SabErfBIWubztC2EdHGygxSVLuNYpx5Hg'
);

async function checkCoupons() {
  const { data, error } = await supabase.from('coupons').select('*').limit(1);
  if (!error && data) {
    console.log('Coupons table structure:');
    if (data[0]) {
      console.log(JSON.stringify(Object.keys(data[0]), null, 2));
      console.log('Sample:', JSON.stringify(data[0], null, 2));
    } else {
      console.log('Table exists but empty');
    }
  } else {
    console.log('Error:', error);
  }
}

checkCoupons();
