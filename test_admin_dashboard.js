import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3002';
const JWT_SECRET = process.env.JWT_SECRET;
const MONGODB_URI = process.env.MONGODB_URI;

if (!JWT_SECRET || !MONGODB_URI) {
  console.error('Missing required environment variables');
  process.exit(1);
}

// User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
  username: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function testAdminDashboard() {
  try {
    console.log('Testing Admin Dashboard API...');
    
    // Connect to database to get admin user
    await mongoose.connect(MONGODB_URI);
    const adminUser = await User.findOne({ username: 'admini' });
    
    if (!adminUser) {
      console.error('Admin user with username "admini" not found!');
      return;
    }

    // Generate token for admin user
    const token = jwt.sign(
      { 
        userId: adminUser._id.toString(),
        username: adminUser.username || adminUser.email,
        role: 'admin'
      },
      JWT_SECRET,
      { 
        expiresIn: '7d',
        issuer: 'seratusstudio',
        audience: 'seratusstudio-users'
      }
    );
    
    console.log('Generated token for admin user:', adminUser.email);
    await mongoose.disconnect();

    // Test dashboard stats API
    const statsResponse = await fetch(`${BASE_URL}/api/dashboard/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!statsResponse.ok) {
      console.error('Stats API failed:', statsResponse.status, statsResponse.statusText);
      const errorText = await statsResponse.text();
      console.error('Error details:', errorText);
      return;
    }

    const statsData = await statsResponse.json();
    
    console.log('\n=== ADMIN DASHBOARD API RESPONSE ===');
    console.log('Stats:', JSON.stringify(statsData.stats, null, 2));
    console.log('\nRecent Projects:', statsData.recentProjects?.length || 0, 'projects');
    console.log('Projects by Status:', statsData.projectsByStatus);
    console.log('Monthly Earnings:', statsData.monthlyEarnings?.length || 0, 'months');

    console.log('\n=== ADMIN DATA SUMMARY ===');
    console.log('Admin Total Projects:', statsData.stats?.totalProjects || 0);
    console.log('Admin Active Projects:', statsData.stats?.activeProjects || 0);
    console.log('Admin Completed Projects:', statsData.stats?.completedProjects || 0);
    console.log('Admin Total Earnings:', statsData.stats?.totalEarnings || 0);
    console.log('Admin Total Hours:', statsData.stats?.totalHours || 0);
    console.log('Admin Pending Payments:', statsData.stats?.totalPendingPayments || 0);

    if (statsData.recentProjects && statsData.recentProjects.length > 0) {
      console.log('\n=== ADMIN RECENT PROJECTS ===');
      statsData.recentProjects.forEach((project, index) => {
        console.log(`${index + 1}. ${project.title}`);
        console.log(`   Status: ${project.status}`);
        console.log(`   Budget: $${project.budget || 0}`);
        console.log(`   Created: ${new Date(project.createdAt).toLocaleDateString()}`);
      });
    }

  } catch (error) {
    console.error('Error testing admin dashboard:', error.message);
  }
}

testAdminDashboard();