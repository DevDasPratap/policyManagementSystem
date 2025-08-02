import { workerData, parentPort } from 'worker_threads';
import fs from 'fs';
import csv from 'csv-parser';
import { MongoClient } from 'mongodb';

const insertDataToMongoDB = async (users, policies) => {
  const uri = process.env.MONGO_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('insuranceDB');
    const usersCollection = db.collection('users');
    const policiesCollection = db.collection('policies');

    if (users.length > 0) await usersCollection.insertMany(users);
    if (policies.length > 0) await policiesCollection.insertMany(policies);
    
    parentPort.postMessage({ success: true });
  } catch (error) {
    console.error('❌ MongoDB insert error:', error);
    throw error;
  } finally {
    await client.close();
  }
};

const users = [];
const policies = [];

fs.createReadStream(workerData.filePath)
  .pipe(csv())
  .on('data', (row) => {
    // User schema mapping
    const user = {
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

    // Policy schema mapping
    const policy = {
      agentName: row.agent || null,
      accountName: row.account_name || null,
      policyCategory: row.category_name || null,
      policyCarrier: row.company_name || null,
      policyNumber: row.policy_number || null,
      startDate: row.policy_start_date || null,
      endDate: row.policy_end_date || null,
      userEmail: row.email || null,
    };

    users.push(user);
    policies.push(policy);
  })
  .on('end', async () => {
    try {
      await insertDataToMongoDB(users, policies);
    } catch (err) {
      parentPort.postMessage({ success: false, error: err.message });
    }
  });
