import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI');
  process.exit(1);
}

function normalizeClientName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Function to pick the most aesthetically capitalized name (e.g., "Mr Sohail" > "mr sohail")
function pickBestDisplayName(names) {
  if (!names || names.length === 0) return '';
  // Sort by count of uppercase letters descending, then length
  return [...names].sort((a, b) => {
    const aUpper = (a.match(/[A-Z]/g) || []).length;
    const bUpper = (b.match(/[A-Z]/g) || []).length;
    if (bUpper !== aUpper) return bUpper - aUpper;
    return a.length - b.length;
  })[0].trim();
}

async function runMigration() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  console.log('--- START CLIENT MIGRATION ---');

  // Ensure index on clients collection
  await db.collection('clients').createIndex({ userId: 1, nameNormalized: 1 }, { unique: true });
  await db.collection('clients').createIndex({ userId: 1 });

  const projects = await db.collection('projects').find({}).toArray();
  console.log(`Found ${projects.length} projects to check/migrate.`);

  // Group projects by user and normalized client name
  const userClientGroups = new Map(); // key: `${userId}_${normalized}`

  for (const proj of projects) {
    if (!proj.client || !proj.userId) continue;
    const userIdStr = proj.userId.toString();
    const normalized = normalizeClientName(proj.client);
    if (!normalized) continue;

    const groupKey = `${userIdStr}:::${normalized}`;
    if (!userClientGroups.has(groupKey)) {
      userClientGroups.set(groupKey, {
        userId: proj.userId,
        normalized,
        rawNames: [],
        projectIds: []
      });
    }

    const group = userClientGroups.get(groupKey);
    group.rawNames.push(proj.client);
    group.projectIds.push(proj._id);
  }

  console.log(`Identified ${userClientGroups.size} unique normalized client groups across all users.`);

  let clientsCreated = 0;
  let clientsExisting = 0;
  let projectsUpdated = 0;

  for (const group of userClientGroups.values()) {
    const bestName = pickBestDisplayName(group.rawNames);

    // Check if client already exists
    let clientDoc = await db.collection('clients').findOne({
      userId: group.userId,
      nameNormalized: group.normalized
    });

    if (!clientDoc) {
      const now = new Date();
      const insertRes = await db.collection('clients').insertOne({
        name: bestName,
        nameNormalized: group.normalized,
        userId: group.userId,
        createdAt: now,
        updatedAt: now
      });
      clientDoc = { _id: insertRes.insertedId, name: bestName };
      clientsCreated++;
      console.log(`Created Client: "${bestName}" (normalized: "${group.normalized}")`);
    } else {
      clientsExisting++;
    }

    // Update projects with this clientId
    const updateRes = await db.collection('projects').updateMany(
      { _id: { $in: group.projectIds } },
      { $set: { clientId: clientDoc._id } }
    );
    projectsUpdated += updateRes.modifiedCount;
  }

  // Next, update invoices
  const invoices = await db.collection('invoices').find({}).toArray();
  console.log(`Found ${invoices.length} invoices to check/migrate.`);
  let invoicesUpdated = 0;

  for (const inv of invoices) {
    let targetClientId = null;

    // 1. Try to inherit from project
    if (inv.projectId) {
      const parentProject = await db.collection('projects').findOne({ _id: inv.projectId });
      if (parentProject && parentProject.clientId) {
        targetClientId = parentProject.clientId;
      }
    }

    // 2. If no project client found, try to match by billedToName
    if (!targetClientId && inv.billedToName && inv.userId) {
      const normBilled = normalizeClientName(inv.billedToName);
      let matchClient = await db.collection('clients').findOne({
        userId: inv.userId,
        nameNormalized: normBilled
      });

      if (!matchClient && inv.billedToName !== 'Multiple Clients') {
        const now = new Date();
        const insertRes = await db.collection('clients').insertOne({
          name: inv.billedToName.trim(),
          nameNormalized: normBilled,
          userId: inv.userId,
          createdAt: now,
          updatedAt: now
        });
        matchClient = { _id: insertRes.insertedId };
        clientsCreated++;
      }

      if (matchClient) {
        targetClientId = matchClient._id;
      }
    }

    if (targetClientId) {
      await db.collection('invoices').updateOne(
        { _id: inv._id },
        { $set: { clientId: targetClientId } }
      );
      invoicesUpdated++;
    }
  }

  console.log('--- MIGRATION COMPLETE ---');
  console.log({
    clientsCreated,
    clientsExisting,
    projectsUpdated,
    invoicesUpdated
  });

  await mongoose.disconnect();
}

runMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
