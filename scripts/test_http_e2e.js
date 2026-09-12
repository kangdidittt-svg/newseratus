// Comprehensive HTTP End-to-End API Test
async function runHttpE2ETest() {
  console.log('=== RUNNING HTTP END-TO-END VERIFICATION ===\n');

  // Step 1: Login
  console.log('1. Testing Login API (/api/auth/login)...');
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admini', password: 'admin123' })
  });

  if (!loginRes.ok) {
    throw new Error(`Login failed with status ${loginRes.status}`);
  }

  const cookie = loginRes.headers.get('set-cookie');
  console.log('✓ Login successful! Auth cookie obtained.');

  const authHeaders = {
    'Content-Type': 'application/json',
    'Cookie': cookie || ''
  };

  // Step 2: GET /api/clients
  console.log('\n2. Testing GET /api/clients (all clients for user)...');
  const clientsRes = await fetch('http://localhost:3000/api/clients', {
    headers: authHeaders
  });
  if (!clientsRes.ok) throw new Error(`GET /api/clients failed: ${clientsRes.status}`);
  const clientsData = await clientsRes.json();
  console.log(`✓ Retrieved ${clientsData.clients.length} clients.`);
  console.log('Sample client:', {
    name: clientsData.clients[0]?.name,
    projectCount: clientsData.clients[0]?.projectCount,
    invoiceCount: clientsData.clients[0]?.invoiceCount
  });

  // Step 3: GET /api/clients?search=sohail (case-insensitive search)
  console.log('\n3. Testing GET /api/clients?search=sohail (case-insensitive filter)...');
  const searchRes = await fetch('http://localhost:3000/api/clients?search=sohail', {
    headers: authHeaders
  });
  const searchData = await searchRes.json();
  const foundSohail = searchData.clients.some((c) => c.name.toLowerCase().includes('sohail'));
  if (!foundSohail) throw new Error('Search for "sohail" did not find Mr Sohail!');
  console.log(`✓ Found ${searchData.clients.length} matching client(s) for "sohail":`, searchData.clients.map((c) => c.name));

  // Step 4: GET /api/clients/check-duplicate?name=mr.sohail
  console.log('\n4. Testing GET /api/clients/check-duplicate?name=mr.sohail (duplicate check)...');
  const checkDupRes = await fetch('http://localhost:3000/api/clients/check-duplicate?name=mr.sohail', {
    headers: authHeaders
  });
  const checkDupData = await checkDupRes.json();
  if (!checkDupData.exists || !checkDupData.client) {
    throw new Error('Duplicate check failed to detect "mr.sohail" as existing client!');
  }
  console.log(`✓ Duplicate detection verified! Matched existing client: "${checkDupData.client.name}"`);

  // Step 5: POST /api/clients - Duplicate Prevention test
  console.log('\n5. Testing POST /api/clients duplicate rejection (409 Conflict)...');
  const dupCreateRes = await fetch('http://localhost:3000/api/clients', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ name: 'MR. SOHAIL' })
  });
  if (dupCreateRes.status !== 409) {
    throw new Error(`Expected 409 Conflict for duplicate client, got ${dupCreateRes.status}`);
  }
  const dupCreateData = await dupCreateRes.json();
  console.log('✓ Duplicate creation prevented with 409 Conflict:', dupCreateData.error);

  // Step 6: POST /api/clients - Create New Unique Client
  const uniqueName = 'Acme Studios ' + Date.now();
  console.log(`\n6. Testing POST /api/clients creating new client: "${uniqueName}"...`);
  const createClientRes = await fetch('http://localhost:3000/api/clients', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: uniqueName,
      email: 'contact@acmestudios.com',
      phone: '+1 555-0199',
      company: 'Acme Studios Global'
    })
  });
  if (createClientRes.status !== 201) {
    throw new Error(`Failed to create client: ${createClientRes.status}`);
  }
  const createClientData = await createClientRes.json();
  const newClientId = createClientData.client._id;
  console.log('✓ Created client successfully! ID:', newClientId, 'Name:', createClientData.client.name);

  // Step 7: POST /api/projects - Create Project linking new Client
  console.log('\n7. Testing POST /api/projects with clientId link...');
  const createProjRes = await fetch('http://localhost:3000/api/projects', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      title: 'Acme Website Redesign',
      clientId: newClientId,
      category: 'web-development',
      priority: 'high',
      status: 'active',
      budget: 3500,
      description: 'Full redesign with Next.js'
    })
  });
  if (createProjRes.status !== 201) {
    const errText = await createProjRes.text();
    throw new Error(`Failed to create project: ${createProjRes.status} ${errText}`);
  }
  const createProjData = await createProjRes.json();
  const newProjectId = createProjData.project._id;
  console.log('✓ Project created successfully! ID:', newProjectId);
  console.log('  project.clientId:', createProjData.project.clientId);
  console.log('  project.client:', createProjData.project.client);

  // Step 8: POST /api/invoices - Create Invoice inheriting clientId from project
  console.log('\n8. Testing POST /api/invoices inheriting clientId from project...');
  const createInvRes = await fetch('http://localhost:3000/api/invoices', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      projectId: newProjectId,
      billedToName: uniqueName,
      items: [
        {
          description: 'Initial deposit & sprint 1',
          quantity: 1,
          rate: 1750,
          amount: 1750
        }
      ],
      taxPercent: 0,
      subtotal: 1750,
      total: 1750
    })
  });
  if (createInvRes.status !== 201) {
    const errText = await createInvRes.text();
    throw new Error(`Failed to create invoice: ${createInvRes.status} ${errText}`);
  }
  const createInvData = await createInvRes.json();
  console.log('✓ Invoice created successfully! ID:', createInvData.invoice._id);
  console.log('  invoice.projectId:', createInvData.invoice.projectId);
  console.log('  invoice.clientId:', createInvData.invoice.clientId);
  console.log('  invoice.billedToName:', createInvData.invoice.billedToName);

  if (createInvData.invoice.clientId !== newClientId) {
    throw new Error(`Invoice clientId mismatch: expected ${newClientId}, got ${createInvData.invoice.clientId}`);
  }
  console.log('✓ Invoice accurately inherited the Client entity ID!');

  // Cleanup test entities
  console.log('\n9. Cleaning up test records...');
  await fetch(`http://localhost:3000/api/projects/${newProjectId}`, {
    method: 'DELETE',
    headers: authHeaders
  });
  console.log('✓ Cleanup completed.');

  console.log('\n=== ALL E2E HTTP INTEGRATION TESTS PASSED! ===');
}

runHttpE2ETest().catch((err) => {
  console.error('E2E Test Failed:', err);
  process.exit(1);
});
