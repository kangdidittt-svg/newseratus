import mongoose from 'mongoose';
import Client, { normalizeClientName } from '../src/models/Client.ts';
import Project from '../src/models/Project.ts';
import Invoice from '../src/models/Invoice.ts';

const MONGODB_URI = process.env.MONGODB_URI;

async function runTests() {
  console.log('--- STARTING CLIENT FEATURE AUTOMATED TESTS ---');
  await mongoose.connect(MONGODB_URI);

  // 1. Test Normalization
  console.log('Test 1: Normalization function test...');
  const tests = [
    { input: 'Mr Sohail', expected: 'mr sohail' },
    { input: 'mr sohail', expected: 'mr sohail' },
    { input: 'MR SOHAIL', expected: 'mr sohail' },
    { input: 'Mr. Sohail', expected: 'mr sohail' },
    { input: '  Mr.  Sohail  ', expected: 'mr sohail' },
    { input: 'John-Smith, Inc.', expected: 'john smith inc' }
  ];

  for (const t of tests) {
    const result = normalizeClientName(t.input);
    if (result !== t.expected) {
      throw new Error(`Normalization failed for "${t.input}": got "${result}", expected "${t.expected}"`);
    }
  }
  console.log('✓ Normalization passed for all test cases.');

  // 2. Test DB Duplicate Prevention
  console.log('\nTest 2: Database duplicate prevention test...');
  const testUserId = new mongoose.Types.ObjectId();

  // Create initial client
  const client1 = new Client({
    name: 'Test Acme Corp',
    userId: testUserId,
    email: 'acme@test.com',
    phone: '+1 555-1234'
  });
  await client1.save();
  console.log('✓ Saved client1: "Test Acme Corp"');

  // Attempt to create duplicate with different casing & punctuation: "test acme corp."
  let duplicateCaught = false;
  try {
    const clientDuplicate = new Client({
      name: 'test acme corp.',
      userId: testUserId,
      email: 'other@test.com'
    });
    await clientDuplicate.save();
  } catch (err) {
    if (err.code === 11000 || err.message.includes('duplicate key')) {
      duplicateCaught = true;
      console.log('✓ Duplicate prevented by unique index as expected!');
    } else {
      throw err;
    }
  }

  if (!duplicateCaught) {
    throw new Error('Duplicate creation was NOT caught!');
  }

  // 3. Test Project with clientId link
  console.log('\nTest 3: Project with clientId reference...');
  const project1 = new Project({
    title: 'Test Client Project',
    client: client1.name,
    clientId: client1._id,
    category: 'web-development',
    budget: 1200,
    userId: testUserId
  });
  await project1.save();
  console.log(`✓ Project saved with clientId=${project1.clientId}`);

  // Verify population
  const populatedProj = await Project.findById(project1._id).populate('clientId');
  if (!populatedProj.clientId || populatedProj.clientId.name !== 'Test Acme Corp') {
    throw new Error('Project clientId population failed!');
  }
  console.log(`✓ Project successfully populated client: ${populatedProj.clientId.name}`);

  // 4. Test Invoice inheriting clientId
  console.log('\nTest 4: Invoice inheriting clientId from project...');
  const invoice1 = new Invoice({
    invoiceNumber: 'INV-TEST-' + Date.now(),
    projectId: project1._id,
    clientId: project1.clientId,
    projectTitle: project1.title,
    billedToName: client1.name,
    items: [
      {
        description: 'Web development work',
        quantity: 1,
        rate: 1200,
        amount: 1200
      }
    ],
    subtotal: 1200,
    taxPercent: 0,
    total: 1200,
    userId: testUserId
  });
  await invoice1.save();
  console.log(`✓ Invoice saved with clientId=${invoice1.clientId}`);

  const populatedInv = await Invoice.findById(invoice1._id).populate('clientId');
  if (!populatedInv.clientId || populatedInv.clientId.name !== 'Test Acme Corp') {
    throw new Error('Invoice clientId population failed!');
  }
  console.log(`✓ Invoice successfully populated client: ${populatedInv.clientId.name}`);

  // 5. Cleanup Test Records
  console.log('\nCleaning up test records...');
  await Invoice.deleteMany({ userId: testUserId });
  await Project.deleteMany({ userId: testUserId });
  await Client.deleteMany({ userId: testUserId });
  console.log('✓ Cleanup complete.');

  console.log('\n--- ALL AUTOMATED TESTS PASSED SUCCESSFULLY! ---');
  await mongoose.disconnect();
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
