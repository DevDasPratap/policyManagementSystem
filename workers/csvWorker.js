// workers/csvWorker.js
import { workerData, parentPort } from 'worker_threads';
import fs from 'fs';
import csv from 'csv-parser';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

const collections = {};
const bulkUsers = [];

const getOrInsert = async (collection, query, data) => {
  const existing = await collections[collection].findOne(query);
  if (existing) return existing._id;
  const result = await collections[collection].insertOne(data);
  return result.insertedId;
};

const processRow = async (row) => {
  const userData = {
    firstName: row.firstname || null,
    dob: row.dob || null,
    address: row.address || null,
    phone: row.phone || null,
    state: row.state || null,
    zipCode: row.zip || null,
    email: row.email || null,
    gender: row.gender || null,
    userType: row.userType || null,
  };

  const agentId = await getOrInsert('agents', { name: row.agent }, { name: row.agent });
  const accountId = await getOrInsert('accounts', { name: row.account_name }, { name: row.account_name });
  const categoryId = await getOrInsert('categories', { name: row.category_name }, { name: row.category_name });
  const carrierId = await getOrInsert('carriers', { name: row.company_name }, { name: row.company_name });

  // Check if user already exists
  let user = await collections['users'].findOne({ email: userData.email });
  let userId;
  if (!user) {
    const res = await collections['users'].insertOne(userData);
    userId = res.insertedId;
  } else {
    userId = user._id;
  }

  // Policy referencing user, carrier, category
  const policy = {
    agentId,
    accountId,
    policyNumber: row.policy_number || null,
    premiumAmount: parseFloat(row.premium_amount || 0),
    premiumAmountWritten: parseFloat(row.premium_amount_written || 0),
    policyMode: row.policy_mode || null,
    csr: row.csr || null,
    startDate: row.policy_start_date || null,
    endDate: row.policy_end_date || null,
    userId,
    carrierId,
    categoryId,
  };

  await collections['policies'].insertOne(policy);
};

(async () => {
  try {
    await client.connect();
    const db = client.db('insuranceDB');

    // Initialize collections
    collections['users'] = db.collection('users');
    collections['agents'] = db.collection('agents');
    collections['accounts'] = db.collection('accounts');
    collections['categories'] = db.collection('categories');
    collections['carriers'] = db.collection('carriers');
    collections['policies'] = db.collection('policies');

    const rows = [];

    fs.createReadStream(workerData.filePath)
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', async () => {
        for (const row of rows) {
          try {
            await processRow(row);
          } catch (err) {
            console.error('Error processing row:', err.message);
          }
        }

        await client.close();
        parentPort.postMessage({ success: true });
      });
  } catch (err) {
    console.error('Worker failed:', err.message);
    parentPort.postMessage({ success: false, error: err.message });
    await client.close();
  }
})();
