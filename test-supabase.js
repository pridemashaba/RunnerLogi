"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabaseClient_1 = require("@/lib/supabaseClient");
async function testConnection() {
    try {
        // Test basic connection by fetching version or trying a simple query
        const { data, error } = await supabaseClient_1.supabase.from('profiles').select('*').limit(1);
        if (error) {
            console.error('Supabase connection error:', error);
            return false;
        }
        console.log('Supabase connection successful!');
        console.log('Data:', data);
        return true;
    }
    catch (err) {
        console.error('Unexpected error:', err);
        return false;
    }
}
testConnection();
