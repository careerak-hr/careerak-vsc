const exportService = require('../services/exportService');
const activityLogService = require('../services/activityLogService');

/**
 * Export Controller
 * Handles export requests for various data types
 */

/**
 * Export users data
 * POST /api/admin/export/users
 */
exports.exportUsers = async (req, res) => {
  try {
    const { format, dateRange, filters } = req.body;

    // Validate format
    if (!['excel', 'csv', 'pdf'].includes(format)) {
      return res.status(400).json({ error: 'Invalid export format. Must be excel, csv, or pdf.' });
    }

    // Validate date range if provided
    if (dateRange) {
      if (!dateRange.start || !dateRange.end) {
        return res.status(400).json({ error: 'Date range must include start and end dates.' });
      }
      if (new Date(dateRange.start) > new Date(dateRange.end)) {
        return res.status(400).json({ error: 'Start date must be before end date.' });
      }
    }

    // Process export asynchronously
    const result = await exportService.processExportJob({
      dataType: 'users',
      format,
      filters: { ...filters, dateRange }
    });

    // Log activity
    await activityLogService.createActivityLog({
      actorId: req.user._id,
      actorName: req.user.name,
      actionType: 'data_exported',
      targetType: 'users',
      targetId: req.user._id,
      details: `Exported users data in ${format} format`,
      ipAddress: req.ip
    });

    res.json({
      success: true,
      downloadUrl: result.downloadUrl,
      expiresAt: result.expiresAt,
      filename: result.filename,
      size: result.size
    });
  } catch (error) {
    console.error('Export users error:', error);
    res.status(500).json({ error: 'Failed to export users data' });
  }
};

/**
 * Export jobs data
 * POST /api/admin/export/jobs
 */
exports.exportJobs = async (req, res) => {
  try {
    const { format, dateRange, filters } = req.body;

    // Validate format
    if (!['excel', 'csv', 'pdf'].includes(format)) {
      return res.status(400).json({ error: 'Invalid export format. Must be excel, csv, or pdf.' });
    }

    // Validate date range if provided
    if (dateRange) {
      if (!dateRange.start || !dateRange.end) {
        return res.status(400).json({ error: 'Date range must include start and end dates.' });
      }
      if (new Date(dateRange.start) > new Date(dateRange.end)) {
        return res.status(400).json({ error: 'Start date must be before end date.' });
      }
    }

    // Process export asynchronously
    const result = await exportService.processExportJob({
      dataType: 'jobs',
      format,
      filters: { ...filters, dateRange }
    });

    // Log activity
    await activityLogService.createActivityLog({
      actorId: req.user._id,
      actorName: req.user.name,
      actionType: 'data_exported',
      targetType: 'jobs',
      targetId: req.user._id,
      details: `Exported jobs data in ${format} format`,
      ipAddress: req.ip
    });

    res.json({
      success: true,
      downloadUrl: result.downloadUrl,
      expiresAt: result.expiresAt,
      filename: result.filename,
      size: result.size
    });
  } catch (error) {
    console.error('Export jobs error:', error);
    res.status(500).json({ error: 'Failed to export jobs data' });
  }
};

/**
 * Export applications data
 * POST /api/admin/export/applications
 */
exports.exportApplications = async (req, res) => {
  try {
    const { format, dateRange, filters } = req.body;

    // Validate format
    if (!['excel', 'csv', 'pdf'].includes(format)) {
      return res.status(400).json({ error: 'Invalid export format. Must be excel, csv, or pdf.' });
    }

    // Validate date range if provided
    if (dateRange) {
      if (!dateRange.start || !dateRange.end) {
        return res.status(400).json({ error: 'Date range must include start and end dates.' });
      }
      if (new Date(dateRange.start) > new Date(dateRange.end)) {
        return res.status(400).json({ error: 'Start date must be before end date.' });
      }
    }

    // Process export asynchronously
    const result = await exportService.processExportJob({
      dataType: 'applications',
      format,
      filters: { ...filters, dateRange }
    });

    // Log activity
    await activityLogService.createActivityLog({
      actorId: req.user._id,
      actorName: req.user.name,
      actionType: 'data_exported',
      targetType: 'applications',
      targetId: req.user._id,
      details: `Exported applications data in ${format} format`,
      ipAddress: req.ip
    });

    res.json({
      success: true,
      downloadUrl: result.downloadUrl,
      expiresAt: result.expiresAt,
      filename: result.filename,
      size: result.size
    });
  } catch (error) {
    console.error('Export applications error:', error);
    res.status(500).json({ error: 'Failed to export applications data' });
  }
};

/**
 * Export courses data
 * POST /api/admin/export/courses
 */
exports.exportCourses = async (req, res) => {
  try {
    const { format, dateRange, filters } = req.body;

    // Validate format
    if (!['excel', 'csv', 'pdf'].includes(format)) {
      return res.status(400).json({ error: 'Invalid export format. Must be excel, csv, or pdf.' });
    }

    // Validate date range if provided
    if (dateRange) {
      if (!dateRange.start || !dateRange.end) {
        return res.status(400).json({ error: 'Date range must include start and end dates.' });
      }
      if (new Date(dateRange.start) > new Date(dateRange.end)) {
        return res.status(400).json({ error: 'Start date must be before end date.' });
      }
    }

    // Process export asynchronously
    const result = await exportService.processExportJob({
      dataType: 'courses',
      format,
      filters: { ...filters, dateRange }
    });

    // Log activity
    await activityLogService.createActivityLog({
      actorId: req.user._id,
      actorName: req.user.name,
      actionType: 'data_exported',
      targetType: 'courses',
      targetId: req.user._id,
      details: `Exported courses data in ${format} format`,
      ipAddress: req.ip
    });

    res.json({
      success: true,
      downloadUrl: result.downloadUrl,
      expiresAt: result.expiresAt,
      filename: result.filename,
      size: result.size
    });
  } catch (error) {
    console.error('Export courses error:', error);
    res.status(500).json({ error: 'Failed to export courses data' });
  }
};

/**
 * Export activity log data
 * POST /api/admin/export/activity-log
 */
exports.exportActivityLog = async (req, res) => {
  try {
    const { format, dateRange, filters } = req.body;

    // Validate format
    if (!['excel', 'csv', 'pdf'].includes(format)) {
      return res.status(400).json({ error: 'Invalid export format. Must be excel, csv, or pdf.' });
    }

    // Validate date range if provided
    if (dateRange) {
      if (!dateRange.start || !dateRange.end) {
        return res.status(400).json({ error: 'Date range must include start and end dates.' });
      }
      if (new Date(dateRange.start) > new Date(dateRange.end)) {
        return res.status(400).json({ error: 'Start date must be before end date.' });
      }
    }

    // Process export asynchronously
    const result = await exportService.processExportJob({
      dataType: 'activity_log',
      format,
      filters: { ...filters, dateRange }
    });

    // Log activity
    await activityLogService.createActivityLog({
      actorId: req.user._id,
      actorName: req.user.name,
      actionType: 'data_exported',
      targetType: 'activity_log',
      targetId: req.user._id,
      details: `Exported activity log in ${format} format`,
      ipAddress: req.ip
    });

    res.json({
      success: true,
      downloadUrl: result.downloadUrl,
      expiresAt: result.expiresAt,
      filename: result.filename,
      size: result.size
    });
  } catch (error) {
    console.error('Export activity log error:', error);
    res.status(500).json({ error: 'Failed to export activity log' });
  }
};

/**
 * Download exported file
 * GET /api/admin/export/download/:filename
 */
exports.downloadExport = async (req, res) => {
  try {
    const { filename } = req.params;

    // Validate filename (prevent directory traversal)
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    // Get file
    const fileBuffer = await exportService.getExportFile(filename);

    // Determine content type
    let contentType;
    if (filename.endsWith('.xlsx')) {
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else if (filename.endsWith('.csv')) {
      contentType = 'text/csv';
    } else if (filename.endsWith('.pdf')) {
      contentType = 'application/pdf';
    } else {
      contentType = 'application/octet-stream';
    }

    // Set headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', fileBuffer.length);

    // Send file
    res.send(fileBuffer);
  } catch (error) {
    console.error('Download export error:', error);
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'Export file not found or expired' });
    }
    res.status(500).json({ error: 'Failed to download export file' });
  }
};
