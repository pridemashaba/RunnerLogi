"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: '.env.local' });
const supabaseClient_1 = require("./lib/supabaseClient");
async function testConnection() {
    try {
        console.log('Testing Supabase connection...');
        console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.log('Key present:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
        // Test basic connection by trying a simple query
        const { data, error } = await supabaseClient_1.supabase.from('profiles').select('count').limit(1);
        if (error) {
            console.error('Supabase connection error:', error);
            return false;
        }
        console.log('Supabase connection successful!');
        console.log('Query result:', data);
        return true;
    }
    catch (err) {
        console.error('Unexpected error:', err);
        return false;
    }
}
testConnection();
