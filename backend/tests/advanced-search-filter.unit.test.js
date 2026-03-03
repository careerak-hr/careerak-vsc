/**
 * Advanced Search & Filter System - Unit Tests
 * 
 * Tests individual components and functions in isolation
 * Coverage: SearchService, FilterService, MatchingEngine, SavedSearchService, AlertService
 */

const SearchService = require('../src/services/searchService');
const FilterService = require('../src/services/filterService');
const MatchingEngine = require('../src/services/matchingEngine');
const SavedSearchService = require('../src/services/savedSearchService');
const AlertService = require('../src/services/alertService');
const JobPosting = require('../src/models/JobPosting');
const SavedSearch = require('../src/models/SavedSearch');
const SearchAlert = require('../src