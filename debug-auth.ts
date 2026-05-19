import { config } from 'dotenv';
config({ path: '.env.local' });

import { supabase } from './lib/supabaseClient';

async function debugAuthFlow() {
  try {
    console.log('=== Starting Auth Flow Debug ===');
    
    // Test 1: Check if we can connect
    console.log('\n1. Testing basic connection...');
    const { data: dbData, error: dbError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
      
    if (dbError) {
      console.error('❌ Database connection error:', dbError);
      return;
    }
    console.log('✅ Database connection successful');
    
    // Test 2: Try to register a new user
    console.log('\n2. Testing user registration...');
    const testEmail = `debug_${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    const testName = 'Debug User';
    const testPhone = '+1234567890';
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: testName,
          phone: testPhone,
        },
      },
    });
    
    if (authError) {
      console.error('❌ Registration error:', authError);
      return;
    }
    
    if (!authData.user) {
      console.error('❌ No user returned from registration');
      return;
    }
    
    console.log('✅ Registration successful!');
    console.log('   User ID:', authData.user.id);
    console.log('   Email:', authData.user.email);
    console.log('   Email confirmed:', !!authData.user.email_confirmed_at);
    
    // Test 3: Check if profile was created
    console.log('\n3. Checking if profile was created...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();
      
    if (profileError) {
      console.error('❌ Error fetching profile:', profileError);
    } else if (!profileData) {
      console.log('⚠️  No profile found for user');
    } else {
      console.log('✅ Profile found:', {
        id: profileData.id,
        name: profileData.name,
        email: profileData.email,
        role: profileData.role
      });
    }
    
    // Test 4: Try to login immediately after registration
    console.log('\n4. Testing login after registration...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });
    
    if (loginError) {
      console.error('❌ Login error:', loginError);
      
      // Check if it's an email confirmation issue
      if (loginError.message && loginError.message.includes('email not confirmed')) {
        console.log('   → This appears to be an email confirmation issue');
        console.log('   → In Supabase settings, disable "Confirm email" for immediate login,');
        console.log('      or implement email verification flow in your app');
      }
    } else {
      console.log('✅ Login successful!');
      console.log('   User ID:', loginData.user.id);
      console.log('   Access token length:', loginData.session?.access_token?.length || 0);
    }
    
    // Test 5: Check auth users (requires service role, but let's see what we get)
    console.log('\n5. Checking auth users (if possible)...');
    try {
      const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
      if (usersError) {
        console.log('⚠️  Cannot list users (expected without service role):', usersError.message);
      } else {
        console.log(`✅ Found ${usersData.users.length} users in auth system`);
        const testUser = usersData.users.find(u => u.id === authData.user.id);
        if (testUser) {
          console.log('   Found our test user:', {
            id: testUser.id,
            email: testUser.email,
            emailConfirmed: !!testUser.email_confirmed_at,
            createdAt: testUser.created_at
          });
        }
      }
    } catch (err) {
      console.log('⚠️  Error listing users:', err.message);
    }
    
    console.log('\n=== Auth Flow Debug Complete ===');
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

debugAuthFlow();