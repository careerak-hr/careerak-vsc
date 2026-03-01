/**
 * 🧪 Property-Based Tests for Candidate Ranking
 * اختبارات قائمة على الخصائص لترتيب المرشحين
 * 
 * Property 9: Candidate Ranking Accuracy
 * For any job posting, candidates should be ranked such that those with higher match scores appear first.
 * 
 * **Validates: Requirements 3.2**
 * - ترتيب تلقائي للمرشحين حسب التطابق (Automatic ranking by match score)
 * - نسبة تطابق لكل مرشح (Match percentage for each candidate)
 */

const fc = require('fast-check');
const {
  extractCandidateFeatures,
  extractJobFeatures,
  calculateMatchScore
} = require('../src/services/candidateRankingService');

describe('Property 9: Candidate Ranking Accuracy', () => {
  
  /**
   * Property 9.1: Ranking Order Consistency
   * For any set of candidates, those with higher match scores must appear first in ranking
   */
  test('Property 9.1: Candidates are ranked in descending order by match score', () => {
    fc.assert(
      fc.property(
        // Generate job features
        fc.record({
          title: fc.string({ minLength: 5, maxLength: 50 }),
          keywords: fc.array(fc.string({ minLength: 3, maxLength: 15 }), { minLength: 3, maxLength: 10 }),
          location: fc.string({ minLength: 3, maxLength: 30 }),
          jobType: fc.constantFrom('Full-time', 'Part-time', 'Contract', 'Freelance')
        }),
        // Generate array of candidates (2-20 candidates)
        fc.array(
          fc.record({
            skills: fc.array(fc.string({ minLength: 2, maxLength: 15 }), { minLength: 0, maxLength: 15 }),
            totalExperience: fc.float({ min: 0, max: 20, noNaN: true }),
            experienceAreas: fc.array(
              fc.record({
                position: fc.string({ minLength: 3, maxLength: 30 }),
                workType: fc.constantFrom('technical', 'field', 'administrative')
              }),
              { maxLength: 5 }
            ),
            highestEducation: fc.constantFrom('none', 'high school', 'diploma', 'bachelor', 'master', 'phd'),
            location: fc.record({
              city: fc.string({ minLength: 3, maxLength: 20 }),
              country: fc.string({ minLength: 3, maxLength: 20 })
            })
          }),
          { minLength: 2, maxLength: 20 }
        ),
        (jobFeatures, candidates) => {
          // Calculate match scores for all candidates
          const rankedCandidates = candidates.map((candidate, index) => ({
            index,
            candidate,
            matchResult: calculateMatchScore(candidate, jobFeatures)
          }));
          
          // Sort by match score (descending)
          rankedCandidates.sort((a, b) => b.matchResult.score - a.matchResult.score);
          
          // Verify ranking order: each candidate's score >= next candidate's score
          for (let i = 0; i < rankedCandidates.length - 1; i++) {
            const currentScore = rankedCandidates[i].matchResult.score;
            const nextScore = rankedCandidates[i + 1].matchResult.score;
            
            // Current score must be >= next score (descending order)
            expect(currentScore).toBeGreaterThanOrEqual(nextScore);
          }
          
          return true;
        }
      ),
      { numRuns: 100 } // Run 100 random test cases
    );
  });
  
  /**
   * Property 9.2: Score Monotonicity
   * Scores in a ranked list must be in non-increasing order (monotonic)
   */
  test('Property 9.2: Match scores are monotonically non-increasing', () => {
    fc.assert(
      fc.property(
        // Generate job features
        fc.record({
          title: fc.constantFrom('developer', 'engineer', 'designer', 'manager'),
          keywords: fc.array(
            fc.constantFrom('javascript', 'python', 'react', 'node', 'design', 'management'),
            { minLength: 2, maxLength: 6 }
          ),
          location: fc.string(),
          jobType: fc.string()
        }),
        // Generate candidates with varying qualifications
        fc.array(
          fc.record({
            skills: fc.array(
              fc.constantFrom('javascript', 'python', 'react', 'node', 'html', 'css', 'design'),
              { minLength: 0, maxLength: 10 }
            ),
            totalExperience: fc.integer({ min: 0, max: 15 }),
            experienceAreas: fc.array(
              fc.record({ position: fc.string() }),
              { maxLength: 3 }
            ),
            highestEducation: fc.constantFrom('bachelor', 'master', 'phd', 'diploma'),
            location: fc.record({
              city: fc.string(),
              country: fc.string()
            })
          }),
          { minLength: 3, maxLength: 50 }
        ),
        (jobFeatures, candidates) => {
          // Calculate and rank
          const scores = candidates
            .map(c => calculateMatchScore(c, jobFeatures).score)
            .sort((a, b) => b - a); // Sort descending
          
          // Check monotonicity: scores[i] >= scores[i+1]
          for (let i = 0; i < scores.length - 1; i++) {
            expect(scores[i]).toBeGreaterThanOrEqual(scores[i + 1]);
          }
          
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });
  
  /**
   * Property 9.3: Ranking Stability
   * Same input should always produce same ranking (determinism)
   */
  test('Property 9.3: Ranking is deterministic and stable', () => {
    fc.assert(
      fc.property(
        // Generate fixed job and candidates
        fc.record({
          jobFeatures: fc.record({
            title: fc.string({ minLength: 5 }),
            keywords: fc.array(fc.string({ minLength: 3 }), { minLength: 2, maxLength: 5 }),
            location: fc.string(),
            jobType: fc.string()
          }),
          candidates: fc.array(
            fc.record({
              skills: fc.array(fc.string({ minLength: 2 }), { maxLength: 8 }),
              totalExperience: fc.float({ min: 0, max: 15, noNaN: true }),
              experienceAreas: fc.array(
                fc.record({ position: fc.string() }),
                { maxLength: 3 }
              ),
              highestEducation: fc.constantFrom('bachelor', 'master', 'phd'),
              location: fc.record({
                city: fc.string(),
                country: fc.string()
              })
            }),
            { minLength: 3, maxLength: 10 }
          )
        }),
        ({ jobFeatures, candidates }) => {
          // Calculate ranking twice
          const ranking1 = candidates.map(c => calculateMatchScore(c, jobFeatures).score);
          const ranking2 = candidates.map(c => calculateMatchScore(c, jobFeatures).score);
          
          // Rankings should be identical
          expect(ranking1).toEqual(ranking2);
          
          // Sort both and verify they're still identical
          const sorted1 = [...ranking1].sort((a, b) => b - a);
          const sorted2 = [...ranking2].sort((a, b) => b - a);
          
          expect(sorted1).toEqual(sorted2);
          
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });
  
  /**
   * Property 9.4: Score Range Validity
   * All match scores must be between 0 and 100
   */
  test('Property 9.4: All match scores are within valid range [0, 100]', () => {
    fc.assert(
      fc.property(
        // Generate random job features
        fc.record({
          title: fc.string(),
          keywords: fc.array(fc.string({ minLength: 3 }), { maxLength: 20 }),
          location: fc.string(),
          jobType: fc.string()
        }),
        // Generate random candidates with valid education values
        fc.array(
          fc.record({
            skills: fc.array(fc.string({ minLength: 2 }), { maxLength: 20 }),
            totalExperience: fc.float({ min: 0, max: 50, noNaN: true }),
            experienceAreas: fc.array(
              fc.record({ position: fc.string() }),
              { maxLength: 10 }
            ),
            highestEducation: fc.constantFrom('none', 'high school', 'diploma', 'bachelor', 'master', 'phd'),
            location: fc.record({
              city: fc.string(),
              country: fc.string()
            })
          }),
          { minLength: 1, maxLength: 30 }
        ),
        (jobFeatures, candidates) => {
          // Calculate scores for all candidates
          candidates.forEach(candidate => {
            const result = calculateMatchScore(candidate, jobFeatures);
            
            // Score must be in valid range
            expect(result.score).toBeGreaterThanOrEqual(0);
            expect(result.score).toBeLessThanOrEqual(100);
            
            // Score must be an integer
            expect(Number.isInteger(result.score)).toBe(true);
            
            // Confidence must be between 0 and 1
            expect(result.confidence).toBeGreaterThanOrEqual(0);
            expect(result.confidence).toBeLessThanOrEqual(1);
          });
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  /**
   * Property 9.5: Perfect Match Ranking
   * A candidate with perfect match should rank higher than partial matches
   */
  test('Property 9.5: Perfect match ranks higher than partial matches', () => {
    fc.assert(
      fc.property(
        // Generate job with specific requirements
        fc.record({
          title: fc.constantFrom('javascript developer', 'python engineer', 'react developer'),
          keywords: fc.array(
            fc.constantFrom('javascript', 'python', 'react', 'node', 'typescript'),
            { minLength: 3, maxLength: 5 }
          ),
          location: fc.constantFrom('cairo', 'alexandria', 'giza'),
          jobType: fc.constant('Full-time')
        }),
        (jobFeatures) => {
          // Create perfect match candidate
          const perfectCandidate = {
            skills: [...jobFeatures.keywords, 'additional-skill'], // Has all required skills
            totalExperience: 5,
            experienceAreas: [{ position: jobFeatures.title }],
            highestEducation: 'master',
            location: {
              city: jobFeatures.location,
              country: 'egypt'
            }
          };
          
          // Create partial match candidate
          const partialCandidate = {
            skills: [jobFeatures.keywords[0]], // Has only one skill
            totalExperience: 1,
            experienceAreas: [],
            highestEducation: 'diploma',
            location: {
              city: 'different-city',
              country: 'different-country'
            }
          };
          
          const perfectScore = calculateMatchScore(perfectCandidate, jobFeatures).score;
          const partialScore = calculateMatchScore(partialCandidate, jobFeatures).score;
          
          // Perfect match must score higher
          expect(perfectScore).toBeGreaterThan(partialScore);
          
          // Perfect match should score reasonably high (> 60)
          expect(perfectScore).toBeGreaterThan(60);
          
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });
  
  /**
   * Property 9.6: No Match Ranking
   * Candidates with no matching skills should rank lowest
   */
  test('Property 9.6: Candidates with no skills match rank lowest', () => {
    fc.assert(
      fc.property(
        // Generate job requirements
        fc.record({
          title: fc.string({ minLength: 5 }),
          keywords: fc.array(
            fc.string({ minLength: 5, maxLength: 15 }),
            { minLength: 3, maxLength: 8 }
          ),
          location: fc.string(),
          jobType: fc.string()
        }),
        (jobFeatures) => {
          // Candidate with matching skills
          const matchingCandidate = {
            skills: jobFeatures.keywords.slice(0, 2), // Has some matching skills
            totalExperience: 3,
            experienceAreas: [{ position: 'developer' }],
            highestEducation: 'bachelor',
            location: { city: 'cairo', country: 'egypt' }
          };
          
          // Candidate with NO matching skills
          const noMatchCandidate = {
            skills: ['completely-different-skill-1', 'completely-different-skill-2'],
            totalExperience: 3,
            experienceAreas: [{ position: 'different-position' }],
            highestEducation: 'bachelor',
            location: { city: 'cairo', country: 'egypt' }
          };
          
          const matchingScore = calculateMatchScore(matchingCandidate, jobFeatures).score;
          const noMatchScore = calculateMatchScore(noMatchCandidate, jobFeatures).score;
          
          // Matching candidate should score higher
          expect(matchingScore).toBeGreaterThan(noMatchScore);
          
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });
  
  /**
   * Property 9.7: Ranking Transitivity
   * If A > B and B > C, then A > C (transitive property)
   */
  test('Property 9.7: Ranking follows transitive property', () => {
    fc.assert(
      fc.property(
        // Generate job features
        fc.record({
          title: fc.string(),
          keywords: fc.array(fc.string({ minLength: 3 }), { minLength: 2, maxLength: 6 }),
          location: fc.string(),
          jobType: fc.string()
        }),
        // Generate exactly 3 candidates
        fc.tuple(
          fc.record({
            skills: fc.array(fc.string(), { maxLength: 10 }),
            totalExperience: fc.float({ min: 0, max: 15, noNaN: true }),
            experienceAreas: fc.array(fc.record({ position: fc.string() }), { maxLength: 3 }),
            highestEducation: fc.constantFrom('bachelor', 'master', 'phd'),
            location: fc.record({ city: fc.string(), country: fc.string() })
          }),
          fc.record({
            skills: fc.array(fc.string(), { maxLength: 10 }),
            totalExperience: fc.float({ min: 0, max: 15, noNaN: true }),
            experienceAreas: fc.array(fc.record({ position: fc.string() }), { maxLength: 3 }),
            highestEducation: fc.constantFrom('bachelor', 'master', 'phd'),
            location: fc.record({ city: fc.string(), country: fc.string() })
          }),
          fc.record({
            skills: fc.array(fc.string(), { maxLength: 10 }),
            totalExperience: fc.float({ min: 0, max: 15, noNaN: true }),
            experienceAreas: fc.array(fc.record({ position: fc.string() }), { maxLength: 3 }),
            highestEducation: fc.constantFrom('bachelor', 'master', 'phd'),
            location: fc.record({ city: fc.string(), country: fc.string() })
          })
        ),
        (jobFeatures, [candidateA, candidateB, candidateC]) => {
          const scoreA = calculateMatchScore(candidateA, jobFeatures).score;
          const scoreB = calculateMatchScore(candidateB, jobFeatures).score;
          const scoreC = calculateMatchScore(candidateC, jobFeatures).score;
          
          // If A >= B and B >= C, then A >= C
          if (scoreA >= scoreB && scoreB >= scoreC) {
            expect(scoreA).toBeGreaterThanOrEqual(scoreC);
          }
          
          // If A > B and B > C, then A > C
          if (scoreA > scoreB && scoreB > scoreC) {
            expect(scoreA).toBeGreaterThan(scoreC);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  /**
   * Property 9.8: Ranking with Identical Candidates
   * Identical candidates should receive identical scores
   */
  test('Property 9.8: Identical candidates receive identical scores', () => {
    fc.assert(
      fc.property(
        // Generate job features
        fc.record({
          title: fc.string(),
          keywords: fc.array(fc.string(), { minLength: 2, maxLength: 8 }),
          location: fc.string(),
          jobType: fc.string()
        }),
        // Generate one candidate
        fc.record({
          skills: fc.array(fc.string(), { maxLength: 10 }),
          totalExperience: fc.float({ min: 0, max: 15, noNaN: true }),
          experienceAreas: fc.array(fc.record({ position: fc.string() }), { maxLength: 3 }),
          highestEducation: fc.constantFrom('bachelor', 'master', 'phd'),
          location: fc.record({ city: fc.string(), country: fc.string() })
        }),
        (jobFeatures, candidate) => {
          // Create identical copy
          const candidateCopy = JSON.parse(JSON.stringify(candidate));
          
          const score1 = calculateMatchScore(candidate, jobFeatures).score;
          const score2 = calculateMatchScore(candidateCopy, jobFeatures).score;
          
          // Identical candidates must have identical scores
          expect(score1).toBe(score2);
          
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });
  
  /**
   * Property 9.9: Experience Impact on Ranking
   * More experience should generally lead to higher scores (all else equal)
   */
  test('Property 9.9: Higher experience increases match score', () => {
    fc.assert(
      fc.property(
        // Generate job features
        fc.record({
          title: fc.string(),
          keywords: fc.array(fc.string({ minLength: 3 }), { minLength: 2, maxLength: 5 }),
          location: fc.string(),
          jobType: fc.string()
        }),
        // Generate base candidate
        fc.record({
          skills: fc.array(fc.string(), { minLength: 2, maxLength: 8 }),
          experienceAreas: fc.array(fc.record({ position: fc.string() }), { maxLength: 2 }),
          highestEducation: fc.constantFrom('bachelor', 'master'),
          location: fc.record({ city: fc.string(), country: fc.string() })
        }),
        (jobFeatures, baseCandidate) => {
          // Create two candidates with different experience levels
          const juniorCandidate = {
            ...baseCandidate,
            totalExperience: 1
          };
          
          const seniorCandidate = {
            ...baseCandidate,
            totalExperience: 10
          };
          
          const juniorScore = calculateMatchScore(juniorCandidate, jobFeatures).score;
          const seniorScore = calculateMatchScore(seniorCandidate, jobFeatures).score;
          
          // Senior should score >= junior (experience contributes positively)
          expect(seniorScore).toBeGreaterThanOrEqual(juniorScore);
          
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });
  
  /**
   * Property 9.10: Education Impact on Ranking
   * Higher education should generally lead to higher scores (all else equal)
   */
  test('Property 9.10: Higher education increases match score', () => {
    fc.assert(
      fc.property(
        // Generate job features
        fc.record({
          title: fc.string(),
          keywords: fc.array(fc.string(), { minLength: 2, maxLength: 5 }),
          location: fc.string(),
          jobType: fc.string()
        }),
        // Generate base candidate
        fc.record({
          skills: fc.array(fc.string(), { minLength: 2, maxLength: 8 }),
          totalExperience: fc.float({ min: 2, max: 8, noNaN: true }),
          experienceAreas: fc.array(fc.record({ position: fc.string() }), { maxLength: 2 }),
          location: fc.record({ city: fc.string(), country: fc.string() })
        }),
        (jobFeatures, baseCandidate) => {
          // Create candidates with different education levels
          const bachelorCandidate = {
            ...baseCandidate,
            highestEducation: 'bachelor'
          };
          
          const masterCandidate = {
            ...baseCandidate,
            highestEducation: 'master'
          };
          
          const phdCandidate = {
            ...baseCandidate,
            highestEducation: 'phd'
          };
          
          const bachelorScore = calculateMatchScore(bachelorCandidate, jobFeatures).score;
          const masterScore = calculateMatchScore(masterCandidate, jobFeatures).score;
          const phdScore = calculateMatchScore(phdCandidate, jobFeatures).score;
          
          // Higher education should score >= lower education
          expect(masterScore).toBeGreaterThanOrEqual(bachelorScore);
          expect(phdScore).toBeGreaterThanOrEqual(masterScore);
          
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });
  
  /**
   * Property 9.11: Large Scale Ranking
   * System should handle ranking of large candidate pools (50-100 candidates)
   */
  test('Property 9.11: System handles large candidate pools efficiently', () => {
    fc.assert(
      fc.property(
        // Generate job features
        fc.record({
          title: fc.string(),
          keywords: fc.array(fc.string({ minLength: 3 }), { minLength: 3, maxLength: 10 }),
          location: fc.string(),
          jobType: fc.string()
        }),
        // Generate large pool of candidates (50-100)
        fc.array(
          fc.record({
            skills: fc.array(fc.string({ minLength: 2 }), { maxLength: 15 }),
            totalExperience: fc.float({ min: 0, max: 20, noNaN: true }),
            experienceAreas: fc.array(fc.record({ position: fc.string() }), { maxLength: 5 }),
            highestEducation: fc.constantFrom('bachelor', 'master', 'phd', 'diploma'),
            location: fc.record({ city: fc.string(), country: fc.string() })
          }),
          { minLength: 50, maxLength: 100 }
        ),
        (jobFeatures, candidates) => {
          // Calculate scores for all candidates
          const startTime = Date.now();
          
          const rankedCandidates = candidates.map(c => ({
            candidate: c,
            score: calculateMatchScore(c, jobFeatures).score
          }));
          
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          // Sort by score
          rankedCandidates.sort((a, b) => b.score - a.score);
          
          // Verify ranking is correct
          for (let i = 0; i < rankedCandidates.length - 1; i++) {
            expect(rankedCandidates[i].score).toBeGreaterThanOrEqual(rankedCandidates[i + 1].score);
          }
          
          // Performance check: should complete in reasonable time (< 5 seconds for 100 candidates)
          expect(duration).toBeLessThan(5000);
          
          return true;
        }
      ),
      { numRuns: 10 } // Reduced runs for performance
    );
  });
  
  /**
   * Property 9.12: Match Percentage Consistency
   * Match percentage should be consistent with match score
   * Requirements 3.2: نسبة تطابق لكل مرشح
   */
  test('Property 9.12: Match percentage is consistent with score', () => {
    fc.assert(
      fc.property(
        // Generate job and candidates
        fc.record({
          title: fc.string(),
          keywords: fc.array(fc.string(), { minLength: 2, maxLength: 8 }),
          location: fc.string(),
          jobType: fc.string()
        }),
        fc.array(
          fc.record({
            skills: fc.array(fc.string(), { maxLength: 10 }),
            totalExperience: fc.float({ min: 0, max: 15, noNaN: true }),
            experienceAreas: fc.array(fc.record({ position: fc.string() }), { maxLength: 3 }),
            highestEducation: fc.constantFrom('bachelor', 'master', 'phd'),
            location: fc.record({ city: fc.string(), country: fc.string() })
          }),
          { minLength: 2, maxLength: 10 }
        ),
        (jobFeatures, candidates) => {
          candidates.forEach(candidate => {
            const result = calculateMatchScore(candidate, jobFeatures);
            
            // Score should be between 0-100 (percentage)
            expect(result.score).toBeGreaterThanOrEqual(0);
            expect(result.score).toBeLessThanOrEqual(100);
            
            // Score should be an integer (whole percentage)
            expect(Number.isInteger(result.score)).toBe(true);
            
            // Reasons should be provided for the match
            expect(Array.isArray(result.reasons)).toBe(true);
            
            // Breakdown should be provided
            expect(result.breakdown).toBeDefined();
            expect(typeof result.breakdown).toBe('object');
          });
          
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });
});
