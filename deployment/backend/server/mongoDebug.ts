import { MongoClient } from 'mongodb';

async function debugMongoConnection() {
  const mongoUri = process.env.MONGODB_URI;
  
  console.log('MongoDB Connection Debug');
  console.log('======================');
  
  if (!mongoUri) {
    console.log('❌ MONGODB_URI not found in environment');
    return;
  }

  // Parse the connection string to check components
  try {
    const url = new URL(mongoUri.replace('mongodb+srv://', 'https://'));
    console.log('✓ Connection string format appears valid');
    console.log('  Host:', url.hostname);
    console.log('  Database from URI:', mongoUri.split('/').pop()?.split('?')[0]);
  } catch (e) {
    console.log('❌ Invalid connection string format');
    return;
  }

  // Test different connection approaches
  const connectionOptions = [
    {
      name: 'Standard Atlas Connection',
      options: {
        retryWrites: true,
        serverSelectionTimeoutMS: 5000,
      }
    },
    {
      name: 'Relaxed TLS Connection',
      options: {
        retryWrites: true,
        serverSelectionTimeoutMS: 5000,
        tls: true,
        tlsAllowInvalidCertificates: true,
      }
    },
    {
      name: 'No Retry Connection',
      options: {
        retryWrites: false,
        serverSelectionTimeoutMS: 3000,
      }
    }
  ];

  for (const config of connectionOptions) {
    console.log(`\nTesting: ${config.name}`);
    console.log('------------------------');
    
    try {
      const client = new MongoClient(mongoUri, config.options);
      
      console.log('  Attempting connection...');
      await client.connect();
      
      console.log('  ✓ Connected successfully');
      
      const db = client.db('vcards_icul');
      await db.admin().ping();
      console.log('  ✓ Database ping successful');
      
      // List collections to verify access
      const collections = await db.listCollections().toArray();
      console.log(`  ✓ Collections accessible: ${collections.length} found`);
      
      await client.close();
      console.log('  ✓ Connection closed cleanly');
      console.log('  🎉 This configuration works!');
      
      return config;
      
    } catch (error) {
      console.log(`  ❌ Failed: ${(error as any).message}`);
      if ((error as any).code) {
        console.log(`  Error code: ${(error as any).code}`);
      }
    }
  }
  
  console.log('\n❌ All connection attempts failed');
  console.log('\nTroubleshooting suggestions:');
  console.log('1. Check if your IP is whitelisted in MongoDB Atlas');
  console.log('2. Verify the username/password in the connection string');
  console.log('3. Ensure the database user has proper permissions');
  console.log('4. Check if the cluster is running and accessible');
}

debugMongoConnection();