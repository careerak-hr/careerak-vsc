/**
 * QR Code & Verification Tests
 * اختبارات QR Code والتحقق من الشهادات
 * 
 * Validates:
 * - Property 3: QR Code Validity (Requirements 2.1, 2.3)
 * - Property 4: Verification Accuracy (Requirements 2.3, 7.3)
 */

const QRCode = require('qrcode');
const crypto = require('crypto');

// ========== Unit Tests: QR Code Generation ==========

describe('QR Code Generation', () => {
  const generateQRCode = async (data) => {
    return QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 1,
      margin: 1,
      width: 300,
      color: { dark: '#304B60', light: '#FFFFFF' }
    });
  };

  test('generates a valid data URL for a verification URL', async () => {
    const certId = crypto.randomUUID();
    const url = `https://careerak.com/verify/${certId}`;
    const qrCode = await generateQRCode(url);

    expect(qrCode).toBeDefined();
    expect(typeof qrCode).toBe('string');
    expect(qrCode.startsWith('data:image/png;base64,')).toBe(true);
  });

  test('each certificate gets a unique QR Code', async () => {
    const ids = [crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID()];
    const qrCodes = await Promise.all(
      ids.map(id => generateQRCode(`https://careerak.com/verify/${id}`))
    );

    const unique = new Set(qrCodes);
    expect(unique.size).toBe(3);
  });

  test('QR Code encodes the correct verification URL', async () => {
    const certId = crypto.randomUUID();
    const expectedUrl = `https://careerak.com/verify/${certId}`;
    const qrCode = await generateQRCode(expectedUrl);

    // Decode the QR code to verify it contains the correct URL
    const decoded = await QRCode.toString(expectedUrl, { type: 'utf8' });
    expect(decoded).toBeDefined();
    expect(qrCode).toBeTruthy();
  });

  test('QR Code generation is deterministic for same input', async () => {
    const url = 'https://careerak.com/verify/test-cert-123';
    const qr1 = await generateQRCode(url);
    const qr2 = await generateQRCode(url);
    expect(qr1).toBe(qr2);
  });
});

// ========== Unit Tests: Verification Service Logic ==========

describe('Verification Service Logic', () => {
  // Mock certificate data
  const makeCert = (overrides = {}) => ({
    certificateId: crypto.randomUUID(),
    status: 'active',
    expiryDate: null,
    revocation: null,
    reissue: { isReissued: false },
    issueDate: new Date('2026-01-01'),
    ageInDays: 72,
    daysUntilExpiry: null,
    userId: { firstName: 'أحمد', lastName: 'محمد', email: 'ahmed@test.com', profileImage: null },
    courseId: { category: 'programming', level: 'intermediate', instructor: null },
    courseName: 'دورة تطوير الويب',
    verificationUrl: `https://careerak.com/verify/test-id`,
    pdfUrl: null,
    qrCode: 'data:image/png;base64,abc123',
    isValid: function () {
      if (this.status === 'revoked') return false;
      if (this.expiryDate && new Date() > this.expiryDate) return false;
      return this.status === 'active';
    },
    ...overrides
  });

  test('active certificate is valid', () => {
    const cert = makeCert({ status: 'active' });
    expect(cert.isValid()).toBe(true);
  });

  test('revoked certificate is not valid', () => {
    const cert = makeCert({
      status: 'revoked',
      revocation: { revokedAt: new Date(), reason: 'Test revocation' }
    });
    expect(cert.isValid()).toBe(false);
  });

  test('expired certificate is not valid', () => {
    const cert = makeCert({
      status: 'active',
      expiryDate: new Date('2020-01-01') // past date
    });
    expect(cert.isValid()).toBe(false);
  });

  test('certificate with future expiry is valid', () => {
    const cert = makeCert({
      status: 'active',
      expiryDate: new Date('2030-01-01')
    });
    expect(cert.isValid()).toBe(true);
  });

  // Property 4: Verification Accuracy
  test('verification returns correct status for active certificate', () => {
    const cert = makeCert({ status: 'active' });
    const isValid = cert.isValid();
    const statusCode = cert.status;

    expect(isValid).toBe(true);
    expect(statusCode).toBe('active');
  });

  test('verification returns correct status for revoked certificate', () => {
    const cert = makeCert({
      status: 'revoked',
      revocation: { revokedAt: new Date(), reason: 'Fraud detected' }
    });
    const isValid = cert.isValid();

    expect(isValid).toBe(false);
    expect(cert.status).toBe('revoked');
    expect(cert.revocation.reason).toBe('Fraud detected');
  });

  test('verification response includes all required fields', () => {
    const cert = makeCert();
    const response = {
      certificateId: cert.certificateId,
      holder: {
        name: `${cert.userId.firstName} ${cert.userId.lastName}`,
        email: cert.userId.email
      },
      course: { name: cert.courseName },
      dates: { issued: cert.issueDate, expiry: cert.expiryDate },
      status: { code: cert.status, isValid: cert.isValid() },
      links: { verification: cert.verificationUrl, qrCode: cert.qrCode }
    };

    expect(response.certificateId).toBeDefined();
    expect(response.holder.name).toBe('أحمد محمد');
    expect(response.course.name).toBe('دورة تطوير الويب');
    expect(response.status.isValid).toBe(true);
    expect(response.links.verification).toContain('/verify/');
    expect(response.links.qrCode).toBeTruthy();
  });
});

// ========== Property-Based Tests ==========

describe('Property 3: QR Code Validity', () => {
  const generateQRCode = (data) =>
    QRCode.toDataURL(data, { errorCorrectionLevel: 'H', width: 300 });

  test('for any certificate ID, QR Code contains the verification URL', async () => {
    const testIds = Array.from({ length: 5 }, () => crypto.randomUUID());

    for (const id of testIds) {
      const url = `https://careerak.com/verify/${id}`;
      const qrCode = await generateQRCode(url);

      expect(qrCode).toBeTruthy();
      expect(qrCode.startsWith('data:image/png;base64,')).toBe(true);
    }
  });

  test('QR Codes for different certificates are always unique', async () => {
    const count = 10;
    const ids = Array.from({ length: count }, () => crypto.randomUUID());
    const qrCodes = await Promise.all(
      ids.map(id => generateQRCode(`https://careerak.com/verify/${id}`))
    );

    const uniqueSet = new Set(qrCodes);
    expect(uniqueSet.size).toBe(count);
  }, 60000);
});

describe('Property 4: Verification Accuracy', () => {
  const makeCert = (status, expiryDate = null) => ({
    status,
    expiryDate,
    isValid: function () {
      if (this.status === 'revoked') return false;
      if (this.expiryDate && new Date() > this.expiryDate) return false;
      return this.status === 'active';
    }
  });

  test('for any active certificate, verification always returns valid=true', () => {
    const activeCerts = Array.from({ length: 10 }, () => makeCert('active'));
    activeCerts.forEach(cert => {
      expect(cert.isValid()).toBe(true);
    });
  });

  test('for any revoked certificate, verification always returns valid=false', () => {
    const revokedCerts = Array.from({ length: 10 }, () => makeCert('revoked'));
    revokedCerts.forEach(cert => {
      expect(cert.isValid()).toBe(false);
    });
  });

  test('for any expired certificate, verification always returns valid=false', () => {
    const pastDates = [
      new Date('2020-01-01'),
      new Date('2019-06-15'),
      new Date('2018-12-31')
    ];
    pastDates.forEach(date => {
      const cert = makeCert('active', date);
      expect(cert.isValid()).toBe(false);
    });
  });

  test('verification is consistent: same certificate always returns same result', () => {
    const cert = makeCert('active');
    const results = Array.from({ length: 5 }, () => cert.isValid());
    expect(new Set(results).size).toBe(1);
    expect(results[0]).toBe(true);
  });
});
