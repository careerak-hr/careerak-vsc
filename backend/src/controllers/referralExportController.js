/**
 * Referral Export Controller
 * تصدير تقارير الإحالات والمكافآت - Requirements: 7.4
 */

const exportService = require('../services/referralExportService');

/**
 * GET /api/referrals/export?format=pdf|excel
 * تصدير تقرير الإحالات الشخصية للمستخدم
 */
async function exportMyReferrals(req, res) {
  try {
    const { format = 'excel' } = req.query;

    if (!['pdf', 'excel'].includes(format)) {
      return res.status(400).json({ error: 'صيغة غير مدعومة. استخدم pdf أو excel' });
    }

    const userId = req.user._id;
    let fileBuffer, contentType, filename;

    if (format === 'excel') {
      fileBuffer = await exportService.exportUserReferralsExcel(userId);
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      filename = `referrals_${Date.now()}.xlsx`;
    } else {
      fileBuffer = await exportService.exportUserReferralsPDF(userId);
      contentType = 'application/pdf';
      filename = `referrals_${Date.now()}.pdf`;
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', fileBuffer.length);
    res.send(fileBuffer);
  } catch (err) {
    console.error('Export referrals error:', err);
    res.status(500).json({ error: 'فشل تصدير التقرير' });
  }
}

/**
 * GET /api/admin/referrals/export?format=pdf|excel
 * تصدير تقرير الإحالات الإداري الشامل
 */
async function exportAdminReferrals(req, res) {
  try {
    const { format = 'excel', startDate, endDate, status } = req.query;

    if (!['pdf', 'excel'].includes(format)) {
      return res.status(400).json({ error: 'صيغة غير مدعومة. استخدم pdf أو excel' });
    }

    const filters = {};
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (status) filters.status = status;

    let fileBuffer, contentType, filename;

    if (format === 'excel') {
      fileBuffer = await exportService.exportAdminReferralsExcel(filters);
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      filename = `admin_referrals_${Date.now()}.xlsx`;
    } else {
      fileBuffer = await exportService.exportAdminReferralsPDF(filters);
      contentType = 'application/pdf';
      filename = `admin_referrals_${Date.now()}.pdf`;
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', fileBuffer.length);
    res.send(fileBuffer);
  } catch (err) {
    console.error('Admin export referrals error:', err);
    res.status(500).json({ error: 'فشل تصدير التقرير الإداري' });
  }
}

module.exports = { exportMyReferrals, exportAdminReferrals };
