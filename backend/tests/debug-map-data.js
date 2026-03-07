const mongoose = require('mongoose');
const JobPosting = require('../src/models/JobPosting');
const { User } = require('../src/models/User');

async function debugMapData() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careerak-test');
    console.log('Connected to database');

    // Create test user
    const testUser = await User.create({
      name: 'Debug User',
      email: `debug-${Date.now()}@example.com`,
      password: 'password123',
      phone: '+201234567890',
      role: 'HR'
    });
    console.log('Created test user:', testUser._id);

    // Clear existing jobs
    await JobPosting.deleteMany({});
    console.log('Cleared existing jobs');

    // Method 1: Using dot notation (current approach)
    console.log('\n=== Method 1: Dot Notation ===');
    const job1 = await JobPosting.create({
      title: 'Job with Dot Notation',
      description: 'Test job',
      requirements: 'Test requirements',
      company: { name: 'Company A' },
      location: 'Cairo, Egypt',
      'location.city': 'Cairo',
      'location.country': 'Egypt',
      'location.coordinates': {
        type: 'Point',
        coordinates: [31.2357, 30.0444]
      },
      postedBy: testUser._id,
      status: 'Open'
    });
    console.log('Job 1 created:', job1._id);
    console.log('Job 1 location:', JSON.stringify(job1.location, null, 2));

    // Method 2: Using nested object (alternative approach)
    console.log('\n=== Method 2: Nested Object ===');
    const job2 = new JobPosting({
      title: 'Job with Nested Object',
      description: 'Test job',
      requirements: 'Test requirements',
      company: { name: 'Company B' },
      postedBy: testUser._id,
      status: 'Open'
    });
    job2.location = 'Giza, Egypt';
    job2.location.city = 'Giza';
    job2.location.country = 'Egypt';
    job2.location.coordinates = {
      type: 'Point',
      coordinates: [31.2118, 30.0131]
    };
    await job2.save();
    console.log('Job 2 created:', job2._id);
    console.log('Job 2 location:', JSON.stringify(job2.location, null, 2));

    // Method 3: Set location as object directly
    console.log('\n=== Method 3: Direct Object ===');
    const job3 = await JobPosting.create({
      title: 'Job with Direct Object',
      description: 'Test job',
      requirements: 'Test requirements',
      company: { name: 'Company C' },
      location: {
        type: String,
        value: 'Alexandria, Egypt',
        city: 'Alexandria',
        country: 'Egypt',
        coordinates: {
          type: 'Point',
          coordinates: [29.9187, 31.2001]
        }
      },
      postedBy: testUser._id,
      status: 'Open'
    });
    console.log('Job 3 created:', job3._id);
    console.log('Job 3 location:', JSON.stringify(job3.location, null, 2));

    // Query all jobs and check their structure
    console.log('\n=== Querying All Jobs ===');
    const allJobs = await JobPosting.find({});
    console.log(`Found ${allJobs.length} jobs`);
    
    allJobs.forEach((job, index) => {
      console.log(`\nJob ${index + 1}:`);
      console.log('  Title:', job.title);
      console.log('  Location type:', typeof job.location);
      console.log('  Location value:', job.location);
      console.log('  Has coordinates?:', job.location?.coordinates ? 'Yes' : 'No');
      if (job.location?.coordinates) {
        console.log('  Coordinates:', job.location.coordinates);
      }
    });

    // Test geospatial query
    console.log('\n=== Testing Geospatial Query ===');
    const bounds = {
      minLng: 31.2,
      maxLng: 31.3,
      minLat: 30.0,
      maxLat: 30.1
    };
    
    const results = await JobPosting.find({
      'location.coordinates': {
        $geoWithin: {
          $box: [
            [bounds.minLng, bounds.minLat],
            [bounds.maxLng, bounds.maxLat]
          ]
        }
      },
      status: 'Open'
    });
    
    console.log(`Found ${results.length} jobs in bounds`);
    results.forEach(job => {
      console.log(`  - ${job.title}: ${job.location.coordinates?.coordinates}`);
    });

    // Check indexes
    console.log('\n=== Checking Indexes ===');
    const indexes = await JobPosting.collection.getIndexes();
    console.log('Indexes:', JSON.stringify(indexes, null, 2));

    // Cleanup
    await User.findByIdAndDelete(testUser._id);
    await JobPosting.deleteMany({});
    console.log('\nCleanup complete');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from database');
  }
}

debugMapData();
