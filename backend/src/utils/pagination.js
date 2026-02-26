/**
 * Pagination Utility
 * 
 * Provides helper functions for implementing pagination in API endpoints.
 * Implements Requirement 11.3 - Query result pagination
 */

/**
 * Parse pagination parameters from request query
 * @param {Object} query - Request query object
 * @param {Object} options - Default options
 * @param {number} options.defaultPage - Default page number (default: 1)
 * @param {number} options.defaultLimit - Default items per page (default: 50)
 * @param {number} options.maxLimit - Maximum items per page (default: 100)
 * @returns {Object} Parsed pagination parameters
 */
const parsePaginationParams = (query, options = {}) => {
  const {
    defaultPage = 1,
    defaultLimit = 50,
    maxLimit = 100
  } = options;
  
  // Parse page number
  let page = parseInt(query.page, 10);
  if (isNaN(page) || page < 1) {
    page = defaultPage;
  }
  
  // Parse limit
  let limit = parseInt(query.limit, 10);
  if (isNaN(limit) || limit < 1) {
    limit = defaultLimit;
  }
  
  // Enforce max limit
  if (limit > maxLimit) {
    limit = maxLimit;
  }
  
  // Calculate skip
  const skip = (page - 1) * limit;
  
  return {
    page,
    limit,
    skip
  };
};

/**
 * Build pagination metadata for response
 * @param {number} total - Total number of items
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {Object} Pagination metadata
 */
const buildPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: hasPrevPage ? page - 1 : null
  };
};

/**
 * Apply pagination to a Mongoose query
 * @param {Object} query - Mongoose query object
 * @param {Object} params - Pagination parameters from parsePaginationParams
 * @returns {Object} Query with pagination applied
 */
const applyPagination = (query, params) => {
  return query.skip(params.skip).limit(params.limit);
};

/**
 * Execute paginated query and return results with metadata
 * @param {Object} model - Mongoose model
 * @param {Object} filter - Query filter
 * @param {Object} options - Query options
 * @param {Object} options.pagination - Pagination params from parsePaginationParams
 * @param {Object} options.sort - Sort options (e.g., { createdAt: -1 })
 * @param {string|Object} options.populate - Populate options
 * @param {Object} options.select - Field selection
 * @returns {Promise<Object>} Paginated results with metadata
 */
const executePaginatedQuery = async (model, filter = {}, options = {}) => {
  const {
    pagination,
    sort = { createdAt: -1 },
    populate,
    select
  } = options;
  
  // Build query
  let query = model.find(filter);
  
  // Apply sorting
  if (sort) {
    query = query.sort(sort);
  }
  
  // Apply field selection
  if (select) {
    query = query.select(select);
  }
  
  // Apply population
  if (populate) {
    query = query.populate(populate);
  }
  
  // Apply pagination
  if (pagination) {
    query = applyPagination(query, pagination);
  }
  
  // Execute query and count in parallel
  const [items, total] = await Promise.all([
    query.exec(),
    model.countDocuments(filter)
  ]);
  
  // Build response
  const response = {
    items,
    pagination: pagination ? buildPaginationMeta(total, pagination.page, pagination.limit) : {
      total
    }
  };
  
  return response;
};

/**
 * Execute paginated aggregation and return results with metadata
 * @param {Object} model - Mongoose model
 * @param {Array} pipeline - Aggregation pipeline
 * @param {Object} options - Options
 * @param {Object} options.pagination - Pagination params from parsePaginationParams
 * @returns {Promise<Object>} Paginated results with metadata
 */
const executePaginatedAggregation = async (model, pipeline = [], options = {}) => {
  const { pagination } = options;
  
  if (!pagination) {
    // No pagination, execute pipeline as-is
    const items = await model.aggregate(pipeline);
    return {
      items,
      pagination: {
        total: items.length
      }
    };
  }
  
  // Create pipeline with facet for pagination
  const paginatedPipeline = [
    ...pipeline,
    {
      $facet: {
        metadata: [
          { $count: 'total' }
        ],
        items: [
          { $skip: pagination.skip },
          { $limit: pagination.limit }
        ]
      }
    }
  ];
  
  // Execute aggregation
  const result = await model.aggregate(paginatedPipeline);
  
  const total = result[0]?.metadata[0]?.total || 0;
  const items = result[0]?.items || [];
  
  return {
    items,
    pagination: buildPaginationMeta(total, pagination.page, pagination.limit)
  };
};

/**
 * Build pagination links for API responses (HATEOAS)
 * @param {string} baseUrl - Base URL for the endpoint
 * @param {Object} pagination - Pagination metadata
 * @param {Object} queryParams - Additional query parameters
 * @returns {Object} Pagination links
 */
const buildPaginationLinks = (baseUrl, pagination, queryParams = {}) => {
  const buildUrl = (page) => {
    const params = new URLSearchParams({
      ...queryParams,
      page: page.toString(),
      limit: pagination.limit.toString()
    });
    return `${baseUrl}?${params.toString()}`;
  };
  
  const links = {
    self: buildUrl(pagination.page),
    first: buildUrl(1),
    last: buildUrl(pagination.totalPages)
  };
  
  if (pagination.hasNextPage) {
    links.next = buildUrl(pagination.nextPage);
  }
  
  if (pagination.hasPrevPage) {
    links.prev = buildUrl(pagination.prevPage);
  }
  
  return links;
};

module.exports = {
  parsePaginationParams,
  buildPaginationMeta,
  applyPagination,
  executePaginatedQuery,
  executePaginatedAggregation,
  buildPaginationLinks
};
