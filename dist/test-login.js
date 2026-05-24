"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: '.env.local' });
// Fix the import paths to match what's actually in the dist folder
const { supabase } = require('./dist/lib/supabaseClient');
async function testLogin() {
    try {
        console.log('=== Testing Login Function ===');
        // First, let's create a test user to login with
        console.log('\n1. Creating test user...');
        const testEmail = `login_test_${Date.now()}@example.com`;
        const testPassword = 'TestPassword123!';
        const testName = 'Login Test User';
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
            options: {
                data: {
                    name: testName,
                    phone: '+1234567890',
                },
            },
        });
        if (signupError) {
            console.error('❌ Error creating test user:', signupError);
            // Continue anyway - maybe user already exists
        }
        else {
            console.log('✅ Test user created (or already existed)');
            console.log('   User ID:', signupData.user?.id);
            console.log('   Email confirmed:', !!signupData.user?.email_confirmed_at);
        }
        // Now try to login
        console.log('\n2. Attempting to login...');
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: testPassword,
        });
        if (loginError) {
            console.error('❌ Login error:', loginError);
            // Check for common issues
            if (loginError.message && loginError.message.includes('email not confirmed')) {
                console.log('\n💡 SOLUTION NEEDED: Email confirmation is required');
                console.log('   In Supabase Dashboard → Settings → Auth → Email');
                console.log('   Disable "Confirm email" for immediate login, OR');
                console.log('   Implement email verification flow in your application');
            }
            else if (loginError.message && loginError.message.includes('Invalid login credentials')) {
                console.log('\n💡 Check that the email/password are correct');
            }
            return false;
        }
        if (!loginData.user) {
            console.error('❌ No user returned from login');
            return false;
        }
        console.log('✅ Login successful!');
        console.log('   User ID:', loginData.user.id);
        console.log('   Email:', loginData.user.email);
        console.log('   Has access token:', !!loginData.session?.access_token);
        // Test getting user profile (what our login function does)
        console.log('\n3. Fetching user profile...');
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', loginData.user.id)
            .single();
        if (profileError) {
            console.error('❌ Error fetching profile:', profileError);
            console.log('   This would cause login to fail in our app!');
            return false;
        }
        if (!profileData) {
            console.error('❌ No profile found for user');
            console.log('   This would cause login to fail in our app!');
            console.log('   Run the SQL to create profiles table or check if insert worked');
            return false;
        }
        console.log('✅ Profile found:', {
            id: profileData.id,
            name: profileData.name,
            email: profileData.email,
            role: profileData.role
        });
        console.log('\n🎉 All tests passed! Login should work in the application.');
        return true;
    }
    catch (err) {
        console.error('❌ Unexpected error:', err);
        return false;
    }
}
testLogin();
