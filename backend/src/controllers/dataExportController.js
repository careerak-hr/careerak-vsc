const dataExportService = require('../services/dataExportService');
const DataExportRequest = require('../models/DataExportRequest');

/**
 * Request data export
 * POST /api/settings/data/export
 */
exports.requestExport = async (req, res) => {
  try {
    const userId = req.user._id;
    const { dataTypes, format } = req.body;

    const exportRequest = await dataExportService.requestExport(userId, {
      dataTypes,
      format
    });

    res.status(201).json({
      success: true,
      message: 'Export request created successfully',
      data: {
        requestId: exportRequest._id,
        status: exportRequest.status,
        requestedAt: exportRequest.requestedAt
      }
    });
  } catch (error) {
    console.error('Request export error:', error);
    res.status(400).json({
      success: false,
      error: {
        code: 'EXPORT_REQUEST_FAILED',
        message: error.message
      }
    });
  }
};

/**
 * Get export status
 * GET /api/settings/data/export/:id
 */
exports.getExportStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    // Verify ownership
    const exportRequest = await DataExportRequest.findById(id);
    if (!exportRequest) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'EXPORT_NOT_FOUND',
          message: 'Export request not found'
        }
      });
    }

    if (exportRequest.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to access this export'
        }
      });
    }

    const status = await dataExportService.getExportStatus(id);

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Get export status error:', error);
    res.status(400).json({
      success: false,
      error: {
        code: 'GET_STATUS_FAILED',
        message: error.message
      }
    });
  }
};

/**
 * Download export file
 * GET /api/settings/data/download/:token
 */
exports.downloadExport = async (req, res) => {
  try {
    const { token } = req.params;

    const fileInfo = await dataExportService.downloadExport(token);

    // Set headers for file download
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.fileName}"`);
    res.setHeader('Content-Length', fileInfo.fileSize);

    // Stream file
    const fs = require('fs');
    const fileStream = fs.createReadStream(fileInfo.filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Download export error:', error);
    res.status(400).json({
      success: false,
      error: {
        code: 'DOWNLOAD_FAILED',
        message: error.message
      }
    });
  }
};

/**
 * Get user's export history
 * GET /api/settings/data/exports
 */
exports.getExportHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 10 } = req.query;

    const exports = await DataExportRequest.find({ userId })
      .sort({ requestedAt: -1 })
      .limit(parseInt(limit))
      .select('-downloadToken -__v');

    res.json({
      success: true,
      data: exports
    });
  } catch (error) {
    console.error('Get export history error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_HISTORY_FAILED',
        message: error.message
      }
    });
  }
};

/**
 * Cancel pending export
 * DELETE /api/settings/data/export/:id
 */
exports.cancelExport = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const exportRequest = await DataExportRequest.findById(id);
    
    if (!exportRequest) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'EXPORT_NOT_FOUND',
          message: 'Export request not found'
        }
      });
    }

    if (exportRequest.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to cancel this export'
        }
      });
    }

    if (exportRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CANNOT_CANCEL',
          message: 'Can only cancel pending exports'
        }
      });
    }

    await exportRequest.setFailed('Cancelled by user');

    res.json({
      success: true,
      message: 'Export request cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel export error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CANCEL_FAILED',
        message: error.message
      }
    });
  }
};

module.exports = exports;
