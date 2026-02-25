const XLSX = require('xlsx');
const Papa = require('papaparse');
const { jsPDF } = require('jspdf');
require('jspdf-autotable');
const { User } = require('../models/User');
const JobPosting = require('../models/JobPosting');
const JobApplication = require('../models/JobApplication');
const EducationalCourse = require('../models/EducationalCourse');
const TrainingCourse = require('../models/TrainingCourse');
const ActivityLog = require('../models/ActivityLog');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

/**
 * Export Service
 * Handles data export in multiple formats (Excel, CSV, PDF)
 * with async processing and filter support
 */

class ExportService {
  constructor() {
    this.exportDir = path.join(__dirname, '../../exports');
    this.jobQueue = [];
    this.isProcessing = false;
    this.ensureExportDir();
  }

  /**
   * Ensure export directory exists
   */
  async ensureExportDir() {
    try {
      await fs.mkdir(this.exportDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create export directory:', error);
    }
  }

  /**
   * Fetch data for export with filter support
   * @param {string} dataType - Type of data to export
   * @param {object} filters - Filter criteria
   * @returns {Promise<Array>} Filtered data
   */
  async fetchDataForExport(dataType, filters = {}) {
    let query = {};
    
    // Apply date range filter if provided
    if (filters.dateRange) {
      query.createdAt = {
        $gte: new Date(filters.dateRange.start),
        $lte: new Date(filters.dateRange.end)
      };
    }

    switch (dataType) {
      case 'users':
        // Apply user-specific filters
        if (filters.type) query.type = filters.type;
        if (filters.status) query.status = filters.status;
        
        return await User.find(query)
          .select('-password -__v')
          .lean();

      case 'jobs':
        // Apply job-specific filters
        if (filters.field) query.field = filters.field;
        if (filters.status) query.status = filters.status;
        
        return await JobPosting.find(query)
          .populate('companyId', 'name email')
          .lean();

      case 'applications':
        // Apply application-specific filters
        if (filters.status) query.status = filters.status;
        
        return await JobApplication.find(query)
          .populate('userId', 'name email')
          .populate('jobId', 'title')
          .lean();

      case 'courses':
        // Fetch both educational and training courses
        const eduQuery = { ...query };
        const trainQuery = { ...query };
        
        if (filters.field) {
          eduQuery.field = filters.field;
          trainQuery.field = filters.field;
        }
        
        const eduCourses = await EducationalCourse.find(eduQuery).lean();
        const trainCourses = await TrainingCourse.find(trainQuery).lean();
        
        return [
          ...eduCourses.map(c => ({ ...c, courseType: 'educational' })),
          ...trainCourses.map(c => ({ ...c, courseType: 'training' }))
        ];

      case 'activity_log':
        // Apply activity log filters
        if (filters.actionType) query.actionType = filters.actionType;
        if (filters.actorId) query.actorId = filters.actorId;
        
        return await ActivityLog.find(query)
          .populate('actorId', 'name email')
          .lean();

      default:
        throw new Error(`Unknown data type: ${dataType}`);
    }
  }

  /**
   * Generate Excel file
   * @param {Array} data - Data to export
   * @param {string} dataType - Type of data
   * @returns {Promise<Buffer>} Excel file buffer
   */
  async generateExcel(data, dataType) {
    const workbook = XLSX.utils.book_new();

    switch (dataType) {
      case 'users':
        this._addUsersSheet(workbook, data);
        break;

      case 'jobs':
        this._addJobsSheet(workbook, data);
        break;

      case 'applications':
        this._addApplicationsSheet(workbook, data);
        break;

      case 'courses':
        this._addCoursesSheet(workbook, data);
        break;

      case 'activity_log':
        this._addActivityLogSheet(workbook, data);
        break;

      default:
        throw new Error(`Unknown data type: ${dataType}`);
    }

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * Add users sheet to workbook
   */
  _addUsersSheet(workbook, users) {
    const userData = users.map(user => ({
      'الاسم': user.name || '',
      'البريد الإلكتروني': user.email || '',
      'نوع المستخدم': user.type || '',
      'الحالة': user.status || 'active',
      'رقم الهاتف': user.phone || '',
      'المدينة': user.city || '',
      'الدولة': user.country || '',
      'تاريخ التسجيل': user.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-EG') : ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(userData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'المستخدمون');

    // Add summary sheet
    const summary = [
      { 'المقياس': 'إجمالي المستخدمين', 'القيمة': users.length },
      { 'المقياس': 'باحثون عن عمل', 'القيمة': users.filter(u => u.type === 'jobSeeker').length },
      { 'المقياس': 'شركات', 'القيمة': users.filter(u => u.type === 'company').length },
      { 'المقياس': 'مستقلون', 'القيمة': users.filter(u => u.type === 'freelancer').length }
    ];
    const summarySheet = XLSX.utils.json_to_sheet(summary);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'الملخص');
  }

  /**
   * Add jobs sheet to workbook
   */
  _addJobsSheet(workbook, jobs) {
    const jobData = jobs.map(job => ({
      'عنوان الوظيفة': job.title || '',
      'الشركة': job.companyId?.name || '',
      'المجال': job.field || '',
      'الموقع': job.location || '',
      'نوع الوظيفة': job.jobType || '',
      'الحالة': job.status || '',
      'عدد المتقدمين': job.applicationsCount || 0,
      'تاريخ النشر': job.createdAt ? new Date(job.createdAt).toLocaleDateString('ar-EG') : ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(jobData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'الوظائف');

    // Add summary sheet
    const summary = [
      { 'المقياس': 'إجمالي الوظائف', 'القيمة': jobs.length },
      { 'المقياس': 'وظائف نشطة', 'القيمة': jobs.filter(j => j.status === 'active').length },
      { 'المقياس': 'وظائف مغلقة', 'القيمة': jobs.filter(j => j.status === 'closed').length }
    ];
    const summarySheet = XLSX.utils.json_to_sheet(summary);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'الملخص');
  }

  /**
   * Add applications sheet to workbook
   */
  _addApplicationsSheet(workbook, applications) {
    const appData = applications.map(app => ({
      'المتقدم': app.userId?.name || '',
      'البريد الإلكتروني': app.userId?.email || '',
      'الوظيفة': app.jobId?.title || '',
      'الحالة': app.status || '',
      'تاريخ التقديم': app.createdAt ? new Date(app.createdAt).toLocaleDateString('ar-EG') : '',
      'تاريخ التحديث': app.updatedAt ? new Date(app.updatedAt).toLocaleDateString('ar-EG') : ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(appData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'الطلبات');

    // Add summary sheet
    const summary = [
      { 'المقياس': 'إجمالي الطلبات', 'القيمة': applications.length },
      { 'المقياس': 'قيد المراجعة', 'القيمة': applications.filter(a => a.status === 'pending').length },
      { 'المقياس': 'مقبولة', 'القيمة': applications.filter(a => a.status === 'accepted').length },
      { 'المقياس': 'مرفوضة', 'القيمة': applications.filter(a => a.status === 'rejected').length }
    ];
    const summarySheet = XLSX.utils.json_to_sheet(summary);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'الملخص');
  }

  /**
   * Add courses sheet to workbook
   */
  _addCoursesSheet(workbook, courses) {
    const courseData = courses.map(course => ({
      'عنوان الدورة': course.title || '',
      'النوع': course.courseType === 'educational' ? 'تعليمية' : 'تدريبية',
      'المجال': course.field || '',
      'المدة': course.duration || '',
      'السعر': course.price || 0,
      'عدد المسجلين': course.enrollmentsCount || 0,
      'تاريخ النشر': course.createdAt ? new Date(course.createdAt).toLocaleDateString('ar-EG') : ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(courseData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'الدورات');

    // Add summary sheet
    const summary = [
      { 'المقياس': 'إجمالي الدورات', 'القيمة': courses.length },
      { 'المقياس': 'دورات تعليمية', 'القيمة': courses.filter(c => c.courseType === 'educational').length },
      { 'المقياس': 'دورات تدريبية', 'القيمة': courses.filter(c => c.courseType === 'training').length }
    ];
    const summarySheet = XLSX.utils.json_to_sheet(summary);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'الملخص');
  }

  /**
   * Add activity log sheet to workbook
   */
  _addActivityLogSheet(workbook, logs) {
    const logData = logs.map(log => ({
      'التاريخ والوقت': log.timestamp ? new Date(log.timestamp).toLocaleString('ar-EG') : '',
      'المستخدم': log.actorId?.name || log.actorName || '',
      'نوع الإجراء': log.actionType || '',
      'نوع الهدف': log.targetType || '',
      'التفاصيل': log.details || '',
      'عنوان IP': log.ipAddress || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(logData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'سجل النشاطات');
  }

  /**
   * Generate CSV file
   * @param {Array} data - Data to export
   * @param {string} dataType - Type of data
   * @returns {Promise<string>} CSV string
   */
  async generateCSV(data, dataType) {
    let csvData;

    switch (dataType) {
      case 'users':
        csvData = data.map(user => ({
          'الاسم': user.name || '',
          'البريد الإلكتروني': user.email || '',
          'نوع المستخدم': user.type || '',
          'الحالة': user.status || 'active',
          'رقم الهاتف': user.phone || '',
          'المدينة': user.city || '',
          'الدولة': user.country || '',
          'تاريخ التسجيل': user.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-EG') : ''
        }));
        break;

      case 'jobs':
        csvData = data.map(job => ({
          'عنوان الوظيفة': job.title || '',
          'الشركة': job.companyId?.name || '',
          'المجال': job.field || '',
          'الموقع': job.location || '',
          'نوع الوظيفة': job.jobType || '',
          'الحالة': job.status || '',
          'عدد المتقدمين': job.applicationsCount || 0,
          'تاريخ النشر': job.createdAt ? new Date(job.createdAt).toLocaleDateString('ar-EG') : ''
        }));
        break;

      case 'applications':
        csvData = data.map(app => ({
          'المتقدم': app.userId?.name || '',
          'البريد الإلكتروني': app.userId?.email || '',
          'الوظيفة': app.jobId?.title || '',
          'الحالة': app.status || '',
          'تاريخ التقديم': app.createdAt ? new Date(app.createdAt).toLocaleDateString('ar-EG') : '',
          'تاريخ التحديث': app.updatedAt ? new Date(app.updatedAt).toLocaleDateString('ar-EG') : ''
        }));
        break;

      case 'courses':
        csvData = data.map(course => ({
          'عنوان الدورة': course.title || '',
          'النوع': course.courseType === 'educational' ? 'تعليمية' : 'تدريبية',
          'المجال': course.field || '',
          'المدة': course.duration || '',
          'السعر': course.price || 0,
          'عدد المسجلين': course.enrollmentsCount || 0,
          'تاريخ النشر': course.createdAt ? new Date(course.createdAt).toLocaleDateString('ar-EG') : ''
        }));
        break;

      case 'activity_log':
        csvData = data.map(log => ({
          'التاريخ والوقت': log.timestamp ? new Date(log.timestamp).toLocaleString('ar-EG') : '',
          'المستخدم': log.actorId?.name || log.actorName || '',
          'نوع الإجراء': log.actionType || '',
          'نوع الهدف': log.targetType || '',
          'التفاصيل': log.details || '',
          'عنوان IP': log.ipAddress || ''
        }));
        break;

      default:
        throw new Error(`Unknown data type: ${dataType}`);
    }

    return Papa.unparse(csvData, {
      delimiter: ',',
      header: true,
      encoding: 'utf-8'
    });
  }

  /**
   * Generate PDF file
   * @param {Array} data - Data to export
   * @param {string} dataType - Type of data
   * @returns {Promise<Buffer>} PDF file buffer
   */
  async generatePDF(data, dataType) {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Add logo (placeholder - replace with actual logo path)
    const logoText = 'Careerak';
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text(logoText, 14, 15);

    // Add timestamp
    const timestamp = new Date().toLocaleString('ar-EG');
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`تاريخ التصدير: ${timestamp}`, 14, 25);

    // Add title
    const titles = {
      users: 'تقرير المستخدمين',
      jobs: 'تقرير الوظائف',
      applications: 'تقرير الطلبات',
      courses: 'تقرير الدورات',
      activity_log: 'سجل النشاطات'
    };
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(titles[dataType] || 'تقرير', 14, 35);

    // Prepare table data
    let tableData = [];
    let headers = [];

    switch (dataType) {
      case 'users':
        headers = ['الاسم', 'البريد الإلكتروني', 'النوع', 'الحالة', 'تاريخ التسجيل'];
        tableData = data.slice(0, 100).map(user => [
          user.name || '',
          user.email || '',
          user.type || '',
          user.status || 'active',
          user.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-EG') : ''
        ]);
        break;

      case 'jobs':
        headers = ['العنوان', 'الشركة', 'المجال', 'الحالة', 'المتقدمين', 'تاريخ النشر'];
        tableData = data.slice(0, 100).map(job => [
          job.title || '',
          job.companyId?.name || '',
          job.field || '',
          job.status || '',
          job.applicationsCount || 0,
          job.createdAt ? new Date(job.createdAt).toLocaleDateString('ar-EG') : ''
        ]);
        break;

      case 'applications':
        headers = ['المتقدم', 'الوظيفة', 'الحالة', 'تاريخ التقديم'];
        tableData = data.slice(0, 100).map(app => [
          app.userId?.name || '',
          app.jobId?.title || '',
          app.status || '',
          app.createdAt ? new Date(app.createdAt).toLocaleDateString('ar-EG') : ''
        ]);
        break;

      case 'courses':
        headers = ['العنوان', 'النوع', 'المجال', 'السعر', 'المسجلين'];
        tableData = data.slice(0, 100).map(course => [
          course.title || '',
          course.courseType === 'educational' ? 'تعليمية' : 'تدريبية',
          course.field || '',
          course.price || 0,
          course.enrollmentsCount || 0
        ]);
        break;

      case 'activity_log':
        headers = ['التاريخ', 'المستخدم', 'الإجراء', 'التفاصيل'];
        tableData = data.slice(0, 100).map(log => [
          log.timestamp ? new Date(log.timestamp).toLocaleString('ar-EG') : '',
          log.actorId?.name || log.actorName || '',
          log.actionType || '',
          log.details || ''
        ]);
        break;

      default:
        throw new Error(`Unknown data type: ${dataType}`);
    }

    // Add table
    doc.autoTable({
      head: [headers],
      body: tableData,
      startY: 45,
      styles: {
        font: 'helvetica',
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [48, 75, 96], // #304B60
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [227, 218, 209] // #E3DAD1
      },
      margin: { top: 45 }
    });

    // Add footer with page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `صفحة ${i} من ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // Add note if data was truncated
    if (data.length > 100) {
      doc.setPage(pageCount);
      doc.setFontSize(8);
      doc.setTextColor(255, 0, 0);
      doc.text(
        `ملاحظة: تم عرض أول 100 سجل فقط من إجمالي ${data.length} سجل`,
        14,
        doc.internal.pageSize.getHeight() - 20
      );
    }

    return Buffer.from(doc.output('arraybuffer'));
  }

  /**
   * Process export job asynchronously
   * @param {object} job - Export job configuration
   * @returns {Promise<string>} Download URL
   */
  async processExportJob(job) {
    try {
      // Fetch data
      const data = await this.fetchDataForExport(job.dataType, job.filters);

      // Generate file based on format
      let fileBuffer;
      let fileExtension;

      switch (job.format) {
        case 'excel':
          fileBuffer = await this.generateExcel(data, job.dataType);
          fileExtension = 'xlsx';
          break;

        case 'csv':
          const csvString = await this.generateCSV(data, job.dataType);
          fileBuffer = Buffer.from(csvString, 'utf-8');
          fileExtension = 'csv';
          break;

        case 'pdf':
          fileBuffer = await this.generatePDF(data, job.dataType);
          fileExtension = 'pdf';
          break;

        default:
          throw new Error(`Unknown format: ${job.format}`);
      }

      // Generate unique filename
      const filename = `${job.dataType}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${fileExtension}`;
      const filepath = path.join(this.exportDir, filename);

      // Save file
      await fs.writeFile(filepath, fileBuffer);

      // Generate download URL (expires in 1 hour)
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      return {
        downloadUrl: `/api/admin/export/download/${filename}`,
        expiresAt,
        filename,
        size: fileBuffer.length
      };
    } catch (error) {
      console.error('Export job failed:', error);
      throw error;
    }
  }

  /**
   * Add export job to queue
   * @param {object} job - Export job configuration
   * @returns {Promise<string>} Job ID
   */
  async queueExportJob(job) {
    const jobId = crypto.randomBytes(16).toString('hex');
    const jobWithId = { ...job, id: jobId, status: 'queued', createdAt: new Date() };
    
    this.jobQueue.push(jobWithId);
    
    // Start processing if not already processing
    if (!this.isProcessing) {
      this.processQueue();
    }
    
    return jobId;
  }

  /**
   * Process job queue
   */
  async processQueue() {
    if (this.isProcessing || this.jobQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.jobQueue.length > 0) {
      const job = this.jobQueue.shift();
      
      try {
        job.status = 'processing';
        const result = await this.processExportJob(job);
        job.status = 'completed';
        job.result = result;
      } catch (error) {
        job.status = 'failed';
        job.error = error.message;
      }
    }

    this.isProcessing = false;
  }

  /**
   * Get file from exports directory
   * @param {string} filename - Filename to retrieve
   * @returns {Promise<Buffer>} File buffer
   */
  async getExportFile(filename) {
    const filepath = path.join(this.exportDir, filename);
    return await fs.readFile(filepath);
  }

  /**
   * Clean up old export files (older than 1 hour)
   */
  async cleanupOldFiles() {
    try {
      const files = await fs.readdir(this.exportDir);
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;

      for (const file of files) {
        const filepath = path.join(this.exportDir, file);
        const stats = await fs.stat(filepath);
        
        if (now - stats.mtimeMs > oneHour) {
          await fs.unlink(filepath);
          console.log(`Deleted old export file: ${file}`);
        }
      }
    } catch (error) {
      console.error('Failed to cleanup old files:', error);
    }
  }
}

// Create singleton instance
const exportService = new ExportService();

// Schedule cleanup every hour
setInterval(() => {
  exportService.cleanupOldFiles();
}, 60 * 60 * 1000);

module.exports = exportService;
