import { config } from 'dotenv';
config({ path: '.env.local' });

// Use relative paths since we're running outside of Next.js context
import { register } from './lib/auth';

async function testRegister() {
  try {
    console.log('Testing user registration...');
    
    const testUser = {
      name: 'Test User',
      email: `test_${Date.now()}@example.com`,
      phone: '+1234567890',
      password: 'TestPassword123!'
    };
    
    console.log('Attempting to register:', testUser.email);
    
    const result = await register(testUser);
    
    if (result) {
      console.log('Registration successful!');
      console.log('User:', result.user);
      console.log('Token:', result.token.substring(0, 20) + '...'); // Show first 20 chars of token
      return true;
    } else {
      console.log('Registration failed - returned null');
      return false;
    }
  } catch (err) {
    console.error('Registration error:', err);
    return false;
  }
}

testRegister();