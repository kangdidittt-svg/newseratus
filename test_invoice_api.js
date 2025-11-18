const fetch = require('node-fetch');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const AUTH_TOKEN = 'your-auth-token'; // You need to login first to get this

async function testInvoiceAPI() {
  console.log('🧪 Testing Invoice API Endpoints...\n');

  try {
    // Test 1: Get Projects (for invoice creation)
    console.log('📋 Test 1: Getting projects...');
    const projectsResponse = await fetch(`${BASE_URL}/api/projects`, {
      credentials: 'include'
    });
    
    if (projectsResponse.ok) {
      const projectsData = await projectsResponse.json();
      console.log('✅ Projects fetched successfully:', projectsData.projects.length, 'projects');
      
      if (projectsData.projects.length > 0) {
        const testProject = projectsData.projects[0];
        
        // Test 2: Create Invoice
        console.log('\n📄 Test 2: Creating invoice...');
        const createInvoiceData = {
          projectId: testProject._id,
          billedToName: testProject.client,
          items: [
            {
              description: 'Test development work',
              quantity: 10,
              rate: 100000,
              amount: 1000000
            }
          ],
          taxPercent: 10,
          subtotal: 1000000,
          total: 1100000
        };
        
        const createResponse = await fetch(`${BASE_URL}/api/invoices`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(createInvoiceData)
        });
        
        if (createResponse.ok) {
          const createdInvoice = await createResponse.json();
          console.log('✅ Invoice created successfully:', createdInvoice.invoice.invoiceNumber);
          
          // Test 3: Get Invoices
          console.log('\n📊 Test 3: Getting invoices...');
          const invoicesResponse = await fetch(`${BASE_URL}/api/invoices`, {
            credentials: 'include'
          });
          
          if (invoicesResponse.ok) {
            const invoicesData = await invoicesResponse.json();
            console.log('✅ Invoices fetched successfully:', invoicesData.invoices.length, 'invoices');
            
            if (invoicesData.invoices.length > 0) {
              const testInvoice = invoicesData.invoices[0];
              
              // Test 4: Get Single Invoice
              console.log('\n📋 Test 4: Getting single invoice...');
              const singleInvoiceResponse = await fetch(`${BASE_URL}/api/invoices/${testInvoice._id}`, {
                credentials: 'include'
              });
              
              if (singleInvoiceResponse.ok) {
                console.log('✅ Single invoice fetched successfully');
                
                // Test 5: Export PDF
                console.log('\n📄 Test 5: Exporting PDF...');
                const pdfResponse = await fetch(`${BASE_URL}/api/invoices/${testInvoice._id}/pdf`, {
                  method: 'POST',
                  credentials: 'include'
                });
                
                if (pdfResponse.ok) {
                  console.log('✅ PDF exported successfully');
                  
                  // Test 6: Bulk Export
                  console.log('\n📦 Test 6: Bulk export...');
                  const bulkResponse = await fetch(`${BASE_URL}/api/invoices/bulk-pdf`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ invoiceIds: [testInvoice._id] })
                  });
                  
                  if (bulkResponse.ok) {
                    console.log('✅ Bulk export successful');
                    
                    // Test 7: Update Invoice (client name)
                    console.log('\n✏️ Test 7: Updating invoice client name...');
                    const updateResponse = await fetch(`${BASE_URL}/api/invoices/${testInvoice._id}`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      credentials: 'include',
                      body: JSON.stringify({ billedToName: 'Updated Client Name' })
                    });
                    
                    if (updateResponse.ok) {
                      console.log('✅ Invoice updated successfully');
                      console.log('\n🎉 All tests passed! Invoice system is working correctly.');
                    } else {
                      console.log('❌ Failed to update invoice');
                    }
                  } else {
                    console.log('❌ Bulk export failed');
                  }
                } else {
                  console.log('❌ PDF export failed');
                }
              } else {
                console.log('❌ Failed to fetch single invoice');
              }
            }
          } else {
            console.log('❌ Failed to fetch invoices');
          }
        } else {
          const errorData = await createResponse.json();
          console.log('❌ Failed to create invoice:', errorData.error);
        }
      }
    } else {
      console.log('❌ Failed to fetch projects');
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run tests
console.log('🚀 Starting Invoice API Tests...');
console.log('Make sure the application is running on http://localhost:3000');
console.log('And you have logged in to get proper authentication\n');

testInvoiceAPI();