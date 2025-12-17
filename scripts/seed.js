const { createClient } = require('@supabase/supabase-js');

if (process.env.NODE_ENV === 'production') {
  require('dotenv').config({ path: '.env.production' });
} else {
  require('dotenv').config({ path: '.env.development' });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  const products = [
    { name: 'Vintage T-Shirt', description: 'A cool vintage t-shirt.', price: 25.99, image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop' },
    { name: 'Retro Jeans', description: 'Stylish retro jeans.', price: 79.99, image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop' },
    { name: 'Classic Hoodie', description: 'A comfortable classic hoodie.', price: 49.99, image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop' },
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