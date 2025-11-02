const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

if (process.env.NODE_ENV === 'production') {
  require('dotenv').config({ path: '.env.production' });
} else {
  require('dotenv').config({ path: '.env.development' });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function main() {
  const products = [
    { name: 'Vintage T-Shirt', description: 'A cool vintage t-shirt.', price: 25.99, image_url: 'https://via.placeholder.com/150' },
    { name: 'Retro Jeans', description: 'Stylish retro jeans.', price: 79.99, image_url: 'https://via.placeholder.com/150' },
    { name: 'Classic Hoodie', description: 'A comfortable classic hoodie.', price: 49.99, image_url: 'https://via.placeholder.com/150' },
  ];

  for (const product of products) {
    const { data, error } = await supabase.from('products').insert(product);
    if (error) {
      console.error('Error inserting product:', error);
    } else {
      console.log('Inserted product:', data);
    }
  }
}

main();