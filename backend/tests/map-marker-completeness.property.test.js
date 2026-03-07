/**
 * Property-Based Test: Map Marker Completeness
 * 
 * Feature: advanced-search-filter
 * Property 15: Map Marker Completeness
 * 
 * Property Statement:
 * For any set of job postings with valid geographic coordinates,
 * when displayed on the map, the number of markers (or marker clusters)
 * should represent all jobs in the dataset.
 * 
 * Validates: Requirements 5.1
 */

const fc = require('fast-check');
const mongoose = require('mongoose');
const JobPosting = require('../src/models/JobPosting');
const { connectDB, disconnectDB, clearDatabase } = require('./helpers/db');

describe('Property 15: Map Marker Completeness', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  /**
   * Arbitrary: Valid coordinates (longitude, latitude)
   * Longitude: -180 to 180
   * Latitude: -90 to 90
   */
  const validCoordinatesArbitrary = () => fc.tuple(
    fc.double({ min: -180, max: 180, noNaN: true }), // longitude
    fc.double({ min: -90, max: 90, noNaN: true })    // latitude
  );

  /**
   * Arbitrary: Job posting with valid coordinates
   * Note: location field in JobPosting model is now a subdocument
   */
  const jobWithCoordinatesArbitrary = () => {
    return fc.record({
      title: fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length >= 5),
      description: fc.string({ minLength: 10, maxLength: 500 }).filter(s => s.trim().length >= 10),
      requirements: fc.string({ minLength: 10, maxLength: 300 }).filter(s => s.trim().length >= 10),
      skills: fc.array(fc.string({ minLength: 2, maxLength: 20 }).filter(s => s.trim().length >= 2), { minLength: 1, maxLength: 5 }),
      company: fc.record({
        name: fc.string({ minLength: 3, maxLength: 50 }).filter(s => s.trim().length >= 3)
      }),
      status: fc.constant('Open')
    }).chain(baseJob => {
      return validCoordinatesArbitrary().map(coords => {
        const city = ['Cairo', 'Alexandria', 'Giza', 'Riyadh', 'Dubai'][Math.floor(Math.random() * 5)];
        const country = ['Egypt', 'Saudi Arabia', 'UAE'][Math.floor(Math.random() * 3)];
        
        // Create job with location as subdocument
        return {
          ...baseJob,
          location: {
            type: `${city}, ${country}`,
            city: city,
            country: country,
            coordinates: {
              type: 'Point',
              coordinates: coords
            }
          }
        };
      });
    });
  };

  /**
   * Test 1: All jobs with coordinates should be represented in map results
   */
  it('should return all jobs with valid coordinates in map search', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(jobWithCoordinatesArbitrary(), { minLength: 1, maxLength: 20 }),
        fc.context(),
        async (jobsData, ctx) => {
          // Create a test user
          const testUser = new mongoose.Types.ObjectId();

          // Insert jobs with coordinates
          const jobs = await JobPosting.insertMany(
            jobsData.map(job => ({
              ...job,
              postedBy: testUser
            }))
          );

          ctx.log(`Created ${jobs.length} jobs with coordinates`);

          // Define a bounding box that includes all jobs
          const allLongitudes = jobs.map(j => j.location.coordinates.coordinates[0]);
          const allLatitudes = jobs.map(j => j.location.coordinates.coordinates[1]);

          const minLng = Math.min(...allLongitudes) - 1;
          const maxLng = Math.max(...allLongitudes) + 1;
          const minLat = Math.min(...allLatitudes) - 1;
          const maxLat = Math.max(...allLatitudes) + 1;

          ctx.log(`Bounding box: [${minLng}, ${minLat}] to [${maxLng}, ${maxLat}]`);

          // Search within bounding box
          const results = await JobPosting.find({
            'location.coordinates': {
              $geoWithin: {
                $box: [
                  [minLng, minLat],
                  [maxLng, maxLat]
                ]
              }
            },
            status: 'Open'
          });

          ctx.log(`Found ${results.length} jobs in bounding box`);

          // Property: All jobs should be found
          expect(results.length).toBe(jobs.length);

          // Verify each job is in results
          const resultIds = results.map(r => r._id.toString());
          jobs.forEach(job => {
            expect(resultIds).toContain(job._id.toString());
          });
        }
      ),
      { numRuns: 20, verbose: true }
    );
  });

  /**
   * Test 2: Jobs without coordinates should not appear in map results
   */
  it('should exclude jobs without coordinates from map search', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(jobWithCoordinatesArbitrary(), { minLength: 1, maxLength: 10 }),
        fc.integer({ min: 1, max: 5 }),
        fc.context(),
        async (jobsWithCoords, numJobsWithoutCoords, ctx) => {
          const testUser = new mongoose.Types.ObjectId();

          // Insert jobs WITH coordinates
          const jobsWithCoordinates = await JobPosting.insertMany(
            jobsWithCoords.map(job => ({
              ...job,
              postedBy: testUser
            }))
          );

          // Insert jobs WITHOUT coordinates
          const jobsWithoutCoordinates = await JobPosting.insertMany(
            Array(numJobsWithoutCoords).fill(null).map((_, i) => {
              const job = {
                title: `Job Without Coords ${i}`,
                description: 'Test job without coordinates',
                requirements: 'Test requirements',
                location: 'Cairo, Egypt', // String only
                skills: ['JavaScript'],
                company: { name: 'Test Company' },
                postedBy: testUser,
                status: 'Open'
              };
              
              // Add nested city and country but NO coordinates
              job['location.city'] = 'Cairo';
              job['location.country'] = 'Egypt';
              
              return job;
            })
          );

          ctx.log(`Created ${jobsWithCoordinates.length} jobs WITH coordinates`);
          ctx.log(`Created ${jobsWithoutCoordinates.length} jobs WITHOUT coordinates`);

          // Define bounding box
          const allLongitudes = jobsWithCoordinates.map(j => j.location.coordinates.coordinates[0]);
          const allLatitudes = jobsWithCoordinates.map(j => j.location.coordinates.coordinates[1]);

          const minLng = Math.min(...allLongitudes) - 1;
          const maxLng = Math.max(...allLongitudes) + 1;
          const minLat = Math.min(...allLatitudes) - 1;
          const maxLat = Math.max(...allLatitudes) + 1;

          // Search within bounding box
          const results = await JobPosting.find({
            'location.coordinates': {
              $geoWithin: {
                $box: [
                  [minLng, minLat],
                  [maxLng, maxLat]
                ]
              }
            },
            status: 'Open'
          });

          ctx.log(`Found ${results.length} jobs in map search`);

          // Property: Only jobs with coordinates should be found
          expect(results.length).toBe(jobsWithCoordinates.length);

          // Verify no jobs without coordinates are in results
          const resultIds = results.map(r => r._id.toString());
          jobsWithoutCoordinates.forEach(job => {
            expect(resultIds).not.toContain(job._id.toString());
          });
        }
      ),
      { numRuns: 15, verbose: true }
    );
  });

  /**
   * Test 3: Marker count should equal unique coordinate pairs
   */
  it('should group jobs at same location into single marker', async () => {
    await fc.assert(
      fc.asyncProperty(
        validCoordinatesArbitrary(),
        fc.integer({ min: 2, max: 5 }),
        fc.context(),
        async (sharedCoords, numJobsAtLocation, ctx) => {
          const testUser = new mongoose.Types.ObjectId();

          // Create multiple jobs at the same location
          const city = 'Cairo';
          const country = 'Egypt';
          const jobs = await JobPosting.insertMany(
            Array(numJobsAtLocation).fill(null).map((_, i) => {
              const job = {
                title: `Job ${i} at shared location`,
                description: 'Test job',
                requirements: 'Test requirements',
                location: `${city}, ${country}`,
                skills: ['JavaScript'],
                company: { name: 'Test Company' },
                postedBy: testUser,
                status: 'Open'
              };
              
              job['location.city'] = city;
              job['location.country'] = country;
              job['location.coordinates'] = {
                type: 'Point',
                coordinates: sharedCoords
              };
              
              return job;
            })
          );

          ctx.log(`Created ${jobs.length} jobs at coordinates [${sharedCoords[0]}, ${sharedCoords[1]}]`);

          // Search for jobs at this location
          const results = await JobPosting.find({
            'location.coordinates.coordinates': sharedCoords,
            status: 'Open'
          });

          ctx.log(`Found ${results.length} jobs at this location`);

          // Property: All jobs at same location should be found
          expect(results.length).toBe(numJobsAtLocation);

          // Group by coordinates (for marker clustering)
          const markerGroups = {};
          results.forEach(job => {
            const key = job.location.coordinates.coordinates.join(',');
            if (!markerGroups[key]) {
              markerGroups[key] = [];
            }
            markerGroups[key].push(job);
          });

          // Property: Should have exactly 1 marker (all jobs at same location)
          expect(Object.keys(markerGroups).length).toBe(1);
          expect(markerGroups[sharedCoords.join(',')].length).toBe(numJobsAtLocation);
        }
      ),
      { numRuns: 15, verbose: true }
    );
  });

  /**
   * Test 4: Empty dataset should return zero markers
   */
  it('should return zero markers for empty dataset', async () => {
    // No jobs in database
    const results = await JobPosting.find({
      'location.coordinates': { $exists: true },
      status: 'Open'
    });

    // Property: Empty dataset = zero markers
    expect(results.length).toBe(0);
  });

  /**
   * Test 5: Closed jobs should not appear in map markers
   */
  it('should exclude closed jobs from map markers', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(jobWithCoordinatesArbitrary(), { minLength: 2, maxLength: 10 }),
        fc.context(),
        async (jobsData, ctx) => {
          const testUser = new mongoose.Types.ObjectId();

          // Split jobs into open and closed
          const halfIndex = Math.floor(jobsData.length / 2);
          const openJobs = jobsData.slice(0, halfIndex);
          const closedJobs = jobsData.slice(halfIndex);

          // Insert open jobs
          const insertedOpenJobs = await JobPosting.insertMany(
            openJobs.map(job => ({
              ...job,
              postedBy: testUser,
              status: 'Open'
            }))
          );

          // Insert closed jobs
          const insertedClosedJobs = await JobPosting.insertMany(
            closedJobs.map(job => ({
              ...job,
              postedBy: testUser,
              status: 'Closed'
            }))
          );

          ctx.log(`Created ${insertedOpenJobs.length} open jobs`);
          ctx.log(`Created ${insertedClosedJobs.length} closed jobs`);

          // Get all jobs with coordinates (regardless of status)
          const allJobs = [...insertedOpenJobs, ...insertedClosedJobs];
          const allLongitudes = allJobs.map(j => j.location.coordinates.coordinates[0]);
          const allLatitudes = allJobs.map(j => j.location.coordinates.coordinates[1]);

          const minLng = Math.min(...allLongitudes) - 1;
          const maxLng = Math.max(...allLongitudes) + 1;
          const minLat = Math.min(...allLatitudes) - 1;
          const maxLat = Math.max(...allLatitudes) + 1;

          // Search for OPEN jobs only
          const results = await JobPosting.find({
            'location.coordinates': {
              $geoWithin: {
                $box: [
                  [minLng, minLat],
                  [maxLng, maxLat]
                ]
              }
            },
            status: 'Open'
          });

          ctx.log(`Found ${results.length} open jobs in map search`);

          // Property: Only open jobs should be in results
          expect(results.length).toBe(insertedOpenJobs.length);

          // Verify no closed jobs are in results
          const resultIds = results.map(r => r._id.toString());
          insertedClosedJobs.forEach(job => {
            expect(resultIds).not.toContain(job._id.toString());
          });
        }
      ),
      { numRuns: 15, verbose: true }
    );
  });
});
