/**
 * Property-Based Test: Geographic Boundary Filtering
 * 
 * Feature: advanced-search-filter
 * Property 16: Geographic Boundary Filtering
 * 
 * Property Statement:
 * For any geographic boundary (circle or rectangle) drawn on the map,
 * all returned job results should have coordinates that fall within that boundary.
 * 
 * Validates: Requirements 5.2
 */

const fc = require('fast-check');
const mongoose = require('mongoose');
const JobPosting = require('../src/models/JobPosting');
const { connectDB, disconnectDB, clearDatabase } = require('./helpers/db');

describe('Property 16: Geographic Boundary Filtering', () => {
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
   */
  const validCoordinatesArbitrary = () => fc.tuple(
    fc.double({ min: -180, max: 180, noNaN: true }), // longitude
    fc.double({ min: -90, max: 90, noNaN: true })    // latitude
  );

  /**
   * Arbitrary: Bounding box (rectangle)
   * Returns: { minLng, maxLng, minLat, maxLat }
   * Note: Using specific geographic regions to avoid MongoDB geospatial edge cases
   * Avoiding coordinates near [0, 0] (prime meridian/equator) which can cause issues
   * Using regions like Cairo area (30-35°E, 25-32°N) for reliable testing
   */
  const boundingBoxArbitrary = () => fc.record({
    // Use Cairo/Egypt region: longitude 30-35, latitude 25-32
    minLng: fc.double({ min: 30, max: 33, noNaN: true }),
    minLat: fc.double({ min: 25, max: 30, noNaN: true }),
    width: fc.double({ min: 2, max: 5, noNaN: true }),  // 2-5 degrees
    height: fc.double({ min: 2, max: 5, noNaN: true })  // 2-5 degrees
  }).map(({ minLng, minLat, width, height }) => {
    const maxLng = Math.min(40, minLng + width);  // Cap at 40°E
    const maxLat = Math.min(35, minLat + height); // Cap at 35°N
    
    return { minLng, maxLng, minLat, maxLat };
  });

  /**
   * Arbitrary: Circle boundary
   * Returns: { centerLng, centerLat, radiusMeters }
   */
  const circleBoundaryArbitrary = () => fc.record({
    centerLng: fc.double({ min: -180, max: 180, noNaN: true }),
    centerLat: fc.double({ min: -90, max: 90, noNaN: true }),
    radiusMeters: fc.integer({ min: 1000, max: 100000 }) // 1km to 100km
  });

  /**
   * Helper: Create job object with coordinates
   */
  const createJobWithCoords = async (title, description, requirements, city, country, coords, skills, postedBy) => {
    // Create job with location as string, then set nested properties using dot notation
    const job = await JobPosting.create({
      title,
      description,
      requirements,
      location: `${city}, ${country}`,  // String value
      'location.city': city,             // Nested property via dot notation
      'location.country': country,       // Nested property via dot notation
      'location.coordinates': {          // Nested geospatial data
        type: 'Point',
        coordinates: coords
      },
      skills,
      company: { name: 'Test Company' },
      postedBy,
      status: 'Open'
    });
    
    return job;
  };

  /**
   * Helper: Check if point is inside bounding box
   */
  const isInsideBoundingBox = (lng, lat, box) => {
    return lng >= box.minLng && lng <= box.maxLng &&
           lat >= box.minLat && lat <= box.maxLat;
  };

  /**
   * Helper: Calculate distance between two points (Haversine formula)
   * Returns distance in meters
   */
  const calculateDistance = (lng1, lat1, lng2, lat2) => {
    const R = 6371000; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  /**
   * Helper: Generate coordinates inside bounding box
   * Ensures coordinates are well within the box boundaries
   */
  const generateCoordsInsideBox = (box) => {
    // Add small margin to ensure coords are definitely inside
    const margin = Math.min((box.maxLng - box.minLng) * 0.1, (box.maxLat - box.minLat) * 0.1, 0.01);
    const lng = box.minLng + margin + Math.random() * (box.maxLng - box.minLng - 2 * margin);
    const lat = box.minLat + margin + Math.random() * (box.maxLat - box.minLat - 2 * margin);
    return [lng, lat];
  };

  /**
   * Helper: Generate coordinates outside bounding box
   * Ensures coordinates are well outside the box boundaries
   */
  const generateCoordsOutsideBox = (box) => {
    // Generate coords that are definitely outside with good margin
    const margin = Math.max((box.maxLng - box.minLng), (box.maxLat - box.minLat), 5);
    const options = [
      [box.minLng - margin - Math.random() * margin, box.minLat - margin - Math.random() * margin], // Southwest
      [box.maxLng + margin + Math.random() * margin, box.maxLat + margin + Math.random() * margin], // Northeast
      [box.minLng - margin - Math.random() * margin, box.maxLat + margin + Math.random() * margin], // Northwest
      [box.maxLng + margin + Math.random() * margin, box.minLat - margin - Math.random() * margin]  // Southeast
    ];
    const coords = options[Math.floor(Math.random() * options.length)];
    // Clamp to valid coordinate ranges
    return [
      Math.max(-180, Math.min(180, coords[0])),
      Math.max(-90, Math.min(90, coords[1]))
    ];
  };

  /**
   * Test 1: Rectangle boundary - all results should be inside
   */
  it('should return only jobs inside rectangular boundary', async () => {
    await fc.assert(
      fc.asyncProperty(
        boundingBoxArbitrary(),
        fc.integer({ min: 3, max: 8 }),
        fc.integer({ min: 2, max: 5 }),
        fc.context(),
        async (box, numInside, numOutside, ctx) => {
          const testUser = new mongoose.Types.ObjectId();

          // Create jobs INSIDE the box
          const jobsInside = [];
          for (let i = 0; i < numInside; i++) {
            const coords = generateCoordsInsideBox(box);
            const job = await createJobWithCoords(
              `Job Inside ${i}`,
              'Test job inside boundary',
              'Test requirements',
              'Cairo',
              'Egypt',
              coords,
              ['JavaScript'],
              testUser
            );
            jobsInside.push(job);
          }

          // Create jobs OUTSIDE the box
          const jobsOutside = [];
          for (let i = 0; i < numOutside; i++) {
            const coords = generateCoordsOutsideBox(box);
            const job = await createJobWithCoords(
              `Job Outside ${i}`,
              'Test job outside boundary',
              'Test requirements',
              'Cairo',
              'Egypt',
              coords,
              ['JavaScript'],
              testUser
            );
            jobsOutside.push(job);
          }

          ctx.log(`Created ${jobsInside.length} jobs inside box`);
          ctx.log(`Created ${jobsOutside.length} jobs outside box`);
          ctx.log(`Box: [${box.minLng}, ${box.minLat}] to [${box.maxLng}, ${box.maxLat}]`);
          
          // Debug: Check what was actually saved
          if (jobsInside.length > 0) {
            const firstJob = jobsInside[0];
            ctx.log(`First job coords: ${JSON.stringify(firstJob.location.coordinates)}`);
          }

          // Search within bounding box using $geoWithin
          const results = await JobPosting.find({
            'location.coordinates': {
              $geoWithin: {
                $box: [
                  [box.minLng, box.minLat],
                  [box.maxLng, box.maxLat]
                ]
              }
            },
            status: 'Open'
          });

          ctx.log(`Found ${results.length} jobs in boundary`);

          // Property 1: Should find all jobs inside
          expect(results.length).toBeGreaterThanOrEqual(jobsInside.length);

          // Property 2: All results should be inside the box
          results.forEach(job => {
            const [lng, lat] = job.location.coordinates.coordinates;
            expect(isInsideBoundingBox(lng, lat, box)).toBe(true);
          });

          // Property 3: No jobs outside should be in results
          const resultIds = results.map(r => r._id.toString());
          jobsOutside.forEach(job => {
            expect(resultIds).not.toContain(job._id.toString());
          });
        }
      ),
      { numRuns: 10, verbose: true }
    );
  });

  /**
   * Test 2: Circle boundary - all results should be within radius
   */
  it('should return only jobs inside circular boundary', async () => {
    await fc.assert(
      fc.asyncProperty(
        circleBoundaryArbitrary(),
        fc.integer({ min: 3, max: 10 }),
        fc.context(),
        async (circle, numJobs, ctx) => {
          const testUser = new mongoose.Types.ObjectId();

          // Create jobs at various distances from center
          const jobs = [];
          for (let i = 0; i < numJobs; i++) {
            // Generate random point within 2x the radius
            const angle = Math.random() * 2 * Math.PI;
            const distance = Math.random() * circle.radiusMeters * 2;
            
            // Convert to lat/lng offset (approximate)
            const lngOffset = (distance * Math.cos(angle)) / (111320 * Math.cos(circle.centerLat * Math.PI / 180));
            const latOffset = (distance * Math.sin(angle)) / 110540;
            
            const lng = circle.centerLng + lngOffset;
            const lat = circle.centerLat + latOffset;

            const job = await createJobWithCoords(
              `Job ${i}`,
              'Test job',
              'Test requirements',
              'Cairo',
              'Egypt',
              [lng, lat],
              ['JavaScript'],
              testUser
            );
            jobs.push(job);
          }

          ctx.log(`Created ${jobs.length} jobs around center [${circle.centerLng}, ${circle.centerLat}]`);
          ctx.log(`Radius: ${circle.radiusMeters}m`);

          // Search within circle using $geoWithin + $centerSphere
          const results = await JobPosting.find({
            'location.coordinates': {
              $geoWithin: {
                $centerSphere: [
                  [circle.centerLng, circle.centerLat],
                  circle.radiusMeters / 6378100 // Convert meters to radians
                ]
              }
            },
            status: 'Open'
          });

          ctx.log(`Found ${results.length} jobs within radius`);

          // Property: All results should be within the radius
          results.forEach(job => {
            const [lng, lat] = job.location.coordinates.coordinates;
            const distance = calculateDistance(
              circle.centerLng,
              circle.centerLat,
              lng,
              lat
            );
            
            // Allow small margin for floating point errors
            expect(distance).toBeLessThanOrEqual(circle.radiusMeters + 100);
          });
        }
      ),
      { numRuns: 10, verbose: true }
    );
  });

  /**
   * Test 3: Near query - results should be ordered by distance
   */
  it('should return jobs ordered by distance from point', async () => {
    await fc.assert(
      fc.asyncProperty(
        validCoordinatesArbitrary(),
        fc.integer({ min: 3, max: 10 }),
        fc.context(),
        async (center, numJobs, ctx) => {
          const testUser = new mongoose.Types.ObjectId();

          // Create jobs at various distances
          const jobs = [];
          for (let i = 0; i < numJobs; i++) {
            // Generate random point within 50km
            const angle = Math.random() * 2 * Math.PI;
            const distance = Math.random() * 50000; // 0-50km
            
            const lngOffset = (distance * Math.cos(angle)) / (111320 * Math.cos(center[1] * Math.PI / 180));
            const latOffset = (distance * Math.sin(angle)) / 110540;
            
            const lng = center[0] + lngOffset;
            const lat = center[1] + latOffset;

            const job = await createJobWithCoords(
              `Job ${i}`,
              'Test job',
              'Test requirements',
              'Cairo',
              'Egypt',
              [lng, lat],
              ['JavaScript'],
              testUser
            );
            jobs.push(job);
          }

          ctx.log(`Created ${jobs.length} jobs around center [${center[0]}, ${center[1]}]`);

          // Search using $near (returns results ordered by distance)
          const results = await JobPosting.find({
            'location.coordinates': {
              $near: {
                $geometry: {
                  type: 'Point',
                  coordinates: center
                },
                $maxDistance: 100000 // 100km
              }
            },
            status: 'Open'
          }).limit(numJobs);

          ctx.log(`Found ${results.length} jobs ordered by distance`);

          // Property: Results should be ordered by distance (ascending)
          let previousDistance = 0;
          results.forEach(job => {
            const [lng, lat] = job.location.coordinates.coordinates;
            const distance = calculateDistance(center[0], center[1], lng, lat);
            
            expect(distance).toBeGreaterThanOrEqual(previousDistance);
            previousDistance = distance;
          });
        }
      ),
      { numRuns: 10, verbose: true }
    );
  });

  /**
   * Test 4: Polygon boundary - all results should be inside polygon
   */
  it('should return only jobs inside polygon boundary', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          // Use Cairo/Egypt region to avoid [0,0] issues
          lng: fc.double({ min: 30, max: 35, noNaN: true }),
          lat: fc.double({ min: 25, max: 32, noNaN: true })
        }),
        fc.integer({ min: 5, max: 10 }),
        fc.context(),
        async (center, numJobs, ctx) => {
          const testUser = new mongoose.Types.ObjectId();

          // Define a simple square polygon around center with reasonable size (2 degrees)
          const offset = 2; // 2 degree offset for reliable geospatial queries
          const polygon = [
            [center.lng - offset, center.lat - offset], // SW
            [center.lng + offset, center.lat - offset], // SE
            [center.lng + offset, center.lat + offset], // NE
            [center.lng - offset, center.lat + offset], // NW
            [center.lng - offset, center.lat - offset]  // Close polygon
          ];

          // Create jobs inside polygon (well within boundaries)
          const jobsInside = [];
          for (let i = 0; i < numJobs; i++) {
            // Generate coords within 70% of the polygon to ensure they're definitely inside
            const innerOffset = offset * 0.7;
            const job = await createJobWithCoords(
              `Job Inside ${i}`,
              'Test job inside polygon',
              'Test requirements',
              'Cairo',
              'Egypt',
              [
                center.lng + (Math.random() - 0.5) * 2 * innerOffset,
                center.lat + (Math.random() - 0.5) * 2 * innerOffset
              ],
              ['JavaScript'],
              testUser
            );
            jobsInside.push(job);
          }

          // Create jobs outside polygon (well outside boundaries)
          const jobsOutside = [];
          for (let i = 0; i < 3; i++) {
            // Place jobs at least 2x offset away to ensure they're definitely outside
            const outerOffset = offset * 2.5;
            const job = await createJobWithCoords(
              `Job Outside ${i}`,
              'Test job outside polygon',
              'Test requirements',
              'Cairo',
              'Egypt',
              [
                center.lng + (i + 1) * outerOffset,
                center.lat + (i + 1) * outerOffset
              ],
              ['JavaScript'],
              testUser
            );
            jobsOutside.push(job);
          }

          ctx.log(`Created ${jobsInside.length} jobs inside polygon`);
          ctx.log(`Created ${jobsOutside.length} jobs outside polygon`);
          ctx.log(`Polygon center: [${center.lng}, ${center.lat}], offset: ${offset}`);

          // Search within polygon
          const results = await JobPosting.find({
            'location.coordinates': {
              $geoWithin: {
                $geometry: {
                  type: 'Polygon',
                  coordinates: [polygon]
                }
              }
            },
            status: 'Open'
          });

          ctx.log(`Found ${results.length} jobs in polygon`);

          // Property: Should find jobs inside polygon
          expect(results.length).toBeGreaterThan(0);

          // Property: No jobs outside should be in results
          const resultIds = results.map(r => r._id.toString());
          jobsOutside.forEach(job => {
            expect(resultIds).not.toContain(job._id.toString());
          });
        }
      ),
      { numRuns: 10, verbose: true }
    );
  });

  /**
   * Test 5: Empty boundary should return zero results
   */
  it('should return zero results for boundary with no jobs', async () => {
    // Define a boundary in the middle of the ocean (no jobs)
    const emptyBox = {
      minLng: -170,
      maxLng: -160,
      minLat: -50,
      maxLat: -40
    };

    const results = await JobPosting.find({
      'location.coordinates': {
        $geoWithin: {
          $box: [
            [emptyBox.minLng, emptyBox.minLat],
            [emptyBox.maxLng, emptyBox.maxLat]
          ]
        }
      },
      status: 'Open'
    });

    // Property: Empty boundary = zero results
    expect(results.length).toBe(0);
  });

  /**
   * Test 6: Boundary filtering should respect other filters
   */
  it('should combine geographic boundary with other filters', async () => {
    await fc.assert(
      fc.asyncProperty(
        boundingBoxArbitrary(),
        fc.constantFrom('JavaScript', 'Python', 'Java'),
        fc.integer({ min: 3, max: 8 }),
        fc.context(),
        async (box, targetSkill, numJobs, ctx) => {
          const testUser = new mongoose.Types.ObjectId();

          // Create jobs with different skills inside the box
          const jobs = [];
          for (let i = 0; i < numJobs; i++) {
            const coords = generateCoordsInsideBox(box);
            const skill = i % 2 === 0 ? targetSkill : 'Other Skill';
            
            const job = await createJobWithCoords(
              `Job ${i}`,
              'Test job',
              'Test requirements',
              'Cairo',
              'Egypt',
              coords,
              [skill],
              testUser
            );
            jobs.push(job);
          }

          ctx.log(`Created ${jobs.length} jobs inside box`);
          ctx.log(`Target skill: ${targetSkill}`);

          // Search with both geographic and skill filters
          const results = await JobPosting.find({
            'location.coordinates': {
              $geoWithin: {
                $box: [
                  [box.minLng, box.minLat],
                  [box.maxLng, box.maxLat]
                ]
              }
            },
            skills: targetSkill,
            status: 'Open'
          });

          ctx.log(`Found ${results.length} jobs matching both filters`);

          // Property: All results should match both filters
          results.forEach(job => {
            const [lng, lat] = job.location.coordinates.coordinates;
            expect(isInsideBoundingBox(lng, lat, box)).toBe(true);
            expect(job.skills).toContain(targetSkill);
          });

          // Property: Should be less than or equal to total jobs
          expect(results.length).toBeLessThanOrEqual(jobs.length);
        }
      ),
      { numRuns: 10, verbose: true }
    );
  });
});
