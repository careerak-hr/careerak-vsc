import React from 'react';
import ShareOnLinkedIn from '../components/certificates/ShareOnLinkedIn';

/**
 * مثال على استخدام مكون ShareOnLinkedIn
 * يوضح كيفية دمج زر المشاركة في صفحة الشهادة
 */
const ShareOnLinkedInExample = () => {
  // بيانات الشهادة (مثال)
  const certificateData = {
    certificateId: '550e8400-e29b-41d4-a716-446655440000',
    userName: 'أحمد محمد',
    courseName: 'تطوير تطبيقات الويب الحديثة',
    issueDate: new Date('2026-03-10'),
    verificationUrl: 'https://careerak.com/verify/550e8400-e29b-41d4-a716-446655440000',
    qrCode: 'data:image/png;base64,...',
    pdfUrl: 'https://res.cloudinary.com/careerak/raw/upload/v1234567890/certificates/certificate-550e8400.pdf'
  };

  return (
    <div className="certificate-page-example">
      <div className="certificate-container">
        {/* عرض الشهادة */}
        <div className="certificate-display">
          <div className="certificate-header">
            <h1>شهادة إتمام</h1>
            <p className="certificate-subtitle">Certificate of Completion</p>
          </div>

          <div className="certificate-body">
            <p className="certificate-text">
              هذا يشهد بأن
            </p>
            <h2 className="certificate-name">{certificateData.userName}</h2>
            <p className="certificate-text">
              قد أتم بنجاح دورة
            </p>
            <h3 className="certificate-course">{certificateData.courseName}</h3>
            <p className="certificate-date">
              تاريخ الإصدار: {certificateData.issueDate.toLocaleDateString('ar-EG')}
            </p>
          </div>

          <div className="certificate-footer">
            <div className="certificate-qr">
              <img src={certificateData.qrCode} alt="QR Code" />
              <p>امسح للتحقق</p>
            </div>
            <div className="certificate-signature">
              <div className="signature-line"></div>
              <p>التوقيع</p>
            </div>
          </div>
        </div>

        {/* أزرار الإجراءات */}
        <div className="certificate-actions">
          {/* زر التحميل */}
          <a
            href={certificateData.pdfUrl}
            download
            className="action-button download-button"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
            تحميل PDF
          </a>

          {/* زر المشاركة على LinkedIn */}
          <ShareOnLinkedIn
            certificateId={certificateData.certificateId}
            certificateData={certificateData}
          />

          {/* زر التحقق */}
          <a
            href={certificateData.verificationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="action-button verify-button"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 16l-4-4 1.41-1.41L11 15.17l6.59-6.59L19 10l-8 8z"/>
            </svg>
            التحقق من الشهادة
          </a>
        </div>

        {/* معلومات إضافية */}
        <div className="certificate-info">
          <div className="info-card">
            <h4>معلومات الشهادة</h4>
            <ul>
              <li>
                <strong>رقم الشهادة:</strong> {certificateData.certificateId}
              </li>
              <li>
                <strong>تاريخ الإصدار:</strong> {certificateData.issueDate.toLocaleDateString('ar-EG')}
              </li>
              <li>
                <strong>الحالة:</strong> <span className="status-active">صالحة</span>
              </li>
            </ul>
          </div>

          <div className="info-card">
            <h4>كيفية المشاركة على LinkedIn</h4>
            <ol>
              <li>انقر على زر "مشاركة على LinkedIn"</li>
              <li>إذا لم تكن قد ربطت حسابك، سيُطلب منك ذلك</li>
              <li>اختر "مشاركة كمنشور" أو "إضافة إلى الشهادات"</li>
              <li>سيتم نشر الشهادة تلقائياً على ملفك الشخصي</li>
            </ol>
          </div>

          <div className="info-card">
            <h4>فوائد المشاركة على LinkedIn</h4>
            <ul>
              <li>✅ زيادة ظهورك المهني</li>
              <li>✅ إثبات مهاراتك للموظفين</li>
              <li>✅ بناء شبكة علاقات احترافية</li>
              <li>✅ تحسين فرص التوظيف</li>
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        .certificate-page-example {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
          font-family: 'Amiri', serif;
        }

        .certificate-container {
          background-color: white;
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .certificate-display {
          padding: 60px 40px;
          background: linear-gradient(135deg, #E3DAD1 0%, #F5F5F5 100%);
          border: 8px solid #304B60;
          margin: 20px;
          border-radius: 12px;
        }

        .certificate-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .certificate-header h1 {
          font-size: 48px;
          color: #304B60;
          margin: 0;
          font-weight: 700;
        }

        .certificate-subtitle {
          font-size: 24px;
          color: #D48161;
          margin: 8px 0 0 0;
          font-family: 'Cormorant Garamond', serif;
        }

        .certificate-body {
          text-align: center;
          margin: 40px 0;
        }

        .certificate-text {
          font-size: 20px;
          color: #666;
          margin: 16px 0;
        }

        .certificate-name {
          font-size: 36px;
          color: #304B60;
          margin: 24px 0;
          font-weight: 700;
        }

        .certificate-course {
          font-size: 28px;
          color: #D48161;
          margin: 24px 0;
          font-weight: 600;
        }

        .certificate-date {
          font-size: 18px;
          color: #999;
          margin: 16px 0;
        }

        .certificate-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 60px;
          padding-top: 40px;
          border-top: 2px solid #D48161;
        }

        .certificate-qr {
          text-align: center;
        }

        .certificate-qr img {
          width: 120px;
          height: 120px;
          border: 2px solid #304B60;
          border-radius: 8px;
          padding: 8px;
          background-color: white;
        }

        .certificate-qr p {
          margin: 8px 0 0 0;
          font-size: 14px;
          color: #666;
        }

        .certificate-signature {
          text-align: center;
        }

        .signature-line {
          width: 200px;
          height: 2px;
          background-color: #304B60;
          margin-bottom: 8px;
        }

        .certificate-signature p {
          margin: 0;
          font-size: 14px;
          color: #666;
        }

        .certificate-actions {
          display: flex;
          gap: 16px;
          padding: 32px;
          background-color: #f9f9f9;
          flex-wrap: wrap;
          justify-content: center;
        }

        .action-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .download-button {
          background-color: #4CAF50;
          color: white;
        }

        .download-button:hover {
          background-color: #45a049;
          transform: translateY(-2px);
        }

        .verify-button {
          background-color: #304B60;
          color: white;
        }

        .verify-button:hover {
          background-color: #243a4d;
          transform: translateY(-2px);
        }

        .action-button svg {
          width: 20px;
          height: 20px;
        }

        .certificate-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
          padding: 32px;
        }

        .info-card {
          background-color: #f9f9f9;
          padding: 24px;
          border-radius: 12px;
          border: 2px solid #e0e0e0;
        }

        .info-card h4 {
          margin: 0 0 16px 0;
          font-size: 20px;
          color: #304B60;
          font-weight: 700;
        }

        .info-card ul,
        .info-card ol {
          margin: 0;
          padding-right: 20px;
          line-height: 1.8;
        }

        .info-card li {
          margin-bottom: 8px;
          color: #666;
        }

        .status-active {
          color: #4CAF50;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .certificate-display {
            padding: 40px 20px;
            margin: 10px;
          }

          .certificate-header h1 {
            font-size: 32px;
          }

          .certificate-name {
            font-size: 28px;
          }

          .certificate-course {
            font-size: 22px;
          }

          .certificate-footer {
            flex-direction: column;
            gap: 24px;
            align-items: center;
          }

          .certificate-actions {
            flex-direction: column;
          }

          .action-button {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default ShareOnLinkedInExample;
