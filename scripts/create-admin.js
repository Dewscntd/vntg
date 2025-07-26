const { createClient } = require('@supabase/supabase-js');

if (process.env.NODE_ENV === 'production') {
  require('dotenv').config({ path: '.env.production' });
} else {
  require('dotenv').config({ path: '.env.development' });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const email = 'michaelvx@gmail.com';
  const password = '1q1q1q1q';

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    console.error('Error creating admin user:', error);
    return;
  }

  console.log('Admin user created successfully:', data);

  const { error: updateError } = await supabase
    .from('users')
    .update({ role: 'admin' })
    .eq('id', data.user.id);

  if (updateError) {
    console.error('Error updating user role:', updateError);
  } else {
    console.log('User role updated to admin');
  }
}

main();