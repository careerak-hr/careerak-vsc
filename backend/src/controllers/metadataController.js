const metadataService = require('../services/metadataService');

/**
 * GET /api/metadata/job/:id
 */
async function getJobMetadata(req, res) {
  try {
    const metadata = await metadataService.generateAllMetaTags('job', req.params.id);
    if (!metadata) {
      return res.status(404).json({ success: false, error: 'Content not found' });
    }
    res.json({ success: true, data: metadata });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/metadata/course/:id
 */
async function getCourseMetadata(req, res) {
  try {
    const metadata = await metadataService.generateAllMetaTags('course', req.params.id);
    if (!metadata) {
      return res.status(404).json({ success: false, error: 'Content not found' });
    }
    res.json({ success: true, data: metadata });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/metadata/profile/:id
 */
async function getProfileMetadata(req, res) {
  try {
    const metadata = await metadataService.generateAllMetaTags('profile', req.params.id);
    if (!metadata) {
      return res.status(404).json({ success: false, error: 'Content not found' });
    }
    res.json({ success: true, data: metadata });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/metadata/company/:id
 */
async function getCompanyMetadata(req, res) {
  try {
    const metadata = await metadataService.generateAllMetaTags('company', req.params.id);
    if (!metadata) {
      return res.status(404).json({ success: false, error: 'Content not found' });
    }
    res.json({ success: true, data: metadata });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = { getJobMetadata, getCourseMetadata, getProfileMetadata, getCompanyMetadata };
