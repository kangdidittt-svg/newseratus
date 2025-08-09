require('dotenv').config();
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function resetPassword() {
  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db('freelance-trackers');
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const result = await db.collection('users').updateOne(
      { username: 'admini' },
      { $set: { password: hashedPassword } }
    );
    
    if (result.modifiedCount > 0) {
      console.log('Password updated successfully for user "admini"');
      console.log('New password: admin123');
    } else {
      console.log('User "admini" not found or password not updated');
    }
    
    await client.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

resetPassword();