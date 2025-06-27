import { MongoClient } from 'mongodb';

async function testMongoConnection() {
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    console.error('MONGODB_URI environment variable not found');
    return false;
  }

  console.log('Testing MongoDB connection...');
  console.log('URI pattern:', mongoUri.substring(0, 20) + '...');

  try {
    const client = new MongoClient(mongoUri, {
      tls: true,
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false,
      retryWrites: true,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    await client.connect();
    console.log('✓ Connected to MongoDB successfully');
    
    const db = client.db('vcards_icul');
    await db.admin().ping();
    console.log('✓ Database ping successful');
    
    // Test basic operations
    const testCollection = db.collection('test');
    const testDoc = { test: true, timestamp: new Date() };
    await testCollection.insertOne(testDoc);
    console.log('✓ Test write successful');
    
    const found = await testCollection.findOne({ test: true });
    console.log('✓ Test read successful:', found ? 'Document found' : 'No document');
    
    await testCollection.deleteMany({ test: true });
    console.log('✓ Test cleanup successful');
    
    await client.close();
    console.log('✓ Connection closed successfully');
    
    return true;
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    return false;
  }
}

// Run the test
testMongoConnection().then(success => {
  console.log('MongoDB test result:', success ? 'PASSED' : 'FAILED');
  process.exit(success ? 0 : 1);
});