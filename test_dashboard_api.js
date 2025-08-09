import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config({ path: '.env.local' });

const JWT_SECRET = process.env.JWT_SECRET;
const BASE_URL = 'http://localhost:3002';

// Create a test token for demo user
const createTestToken = () => {
  const payload = {
    userId: '6896367b1ca7a546acd009e2', // demo user ID from check_users.js
    username: 'demo',
    role: 'user'
  };
  
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: '1h',
    issuer: 'seratusstudio',
    audience: 'seratusstudio-users'
  });
};

const testDashboardAPI = async () => {
  try {
    console.log('Testing Dashboard API...');
    
    const token = createTestToken();
    console.log('Generated token for demo user');
    
    const response = await fetch(`${BASE_URL}/api/dashboard/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth-token=${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('\n=== DASHBOARD API RESPONSE ===');
      console.log('Stats:', JSON.stringify(data.stats, null, 2));
      console.log('\nRecent Projects:', data.recentProjects?.length || 0, 'projects');
      console.log('Projects by Status:', data.projectsByStatus);
      console.log('Monthly Earnings:', data.monthlyEarnings?.length || 0, 'months');
      
      // Compare with database check
      console.log('\n=== COMPARISON WITH DATABASE ===');
      console.log('API Total Projects:', data.stats.totalProjects);
      console.log('API Completed Projects:', data.stats.completedProjects);
      console.log('API Total Earnings:', data.stats.totalEarnings);
      console.log('API Total Hours:', data.stats.totalHours);
      console.log('API Average Hourly Rate:', data.stats.averageHourlyRate);
      console.log('API Pending Payments:', data.stats.totalPendingPayments);
      
    } else {
      console.error('API Error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
};

testDashboardAPI();