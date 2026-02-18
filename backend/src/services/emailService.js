/**
 * خدمة البريد الإلكتروني
 * ملاحظة: هذه نسخة بسيطة للتطوير. في الإنتاج، استخدم خدمة مثل SendGrid أو AWS SES
 */

const logger = require('../utils/logger');

/**
 * إرسال بريد إلكتروني (محاكاة)
 * في الإنتاج، استبدل هذا بخدمة حقيقية
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    // في التطوير، نسجل البريد فقط
    if (process.env.NODE_ENV === 'development') {
      logger.info('📧 Email sent (simulated)', {
        to,
        subject,
        preview: text ? text.substring(0, 100) : html.substring(0, 100)
      });
      
      // طباعة في console للتطوير
      console.log('\n=== EMAIL SENT (SIMULATED) ===');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('Content:', text || html);
      console.log('==============================\n');
      
      return { success: true, messageId: 'simulated-' + Date.now() };
    }

    // في الإنتاج، استخدم nodemailer أو SendGrid
    // مثال مع nodemailer:
    /*
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html
    });

    return { success: true, messageId: info.messageId };
    */

    // للإنتاج بدون إعداد SMTP، نسجل فقط
    logger.warn('Email service not configured for production', { to, subject });
    return { success: false, error: 'Email service not configured' };

  } catch (error) {
    logger.error('Error sending email', { error: error.message, to, subject });
    throw error;
  }
};

/**
 * إرسال بريد تأكيد البريد الإلكتروني
 */
const sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  
  const subject = 'تأكيد البريد الإلكتروني - Careerak';
  
  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #304B60; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #D48161; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; color: #666; margin-top: 20px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>مرحباً بك في Careerak</h1>
        </div>
        <div class="content">
          <p>مرحباً ${user.firstName || user.companyName || 'عزيزي المستخدم'},</p>
          
          <p>شكراً لتسجيلك في Careerak! لإكمال عملية التسجيل، يرجى تأكيد بريدك الإلكتروني بالنقر على الزر أدناه:</p>
          
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">تأكيد البريد الإلكتروني</a>
          </div>
          
          <p>أو انسخ الرابط التالي والصقه في متصفحك:</p>
          <p style="background: #e0e0e0; padding: 10px; border-radius: 5px; word-break: break-all;">
            ${verificationUrl}
          </p>
          
          <p><strong>ملاحظة:</strong> هذا الرابط صالح لمدة 24 ساعة فقط.</p>
          
          <p>إذا لم تقم بإنشاء حساب على Careerak، يرجى تجاهل هذا البريد.</p>
        </div>
        <div class="footer">
          <p>© 2026 Careerak. جميع الحقوق محفوظة.</p>
          <p>careerak.hr@gmail.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
مرحباً ${user.firstName || user.companyName || 'عزيزي المستخدم'},

شكراً لتسجيلك في Careerak! لإكمال عملية التسجيل، يرجى تأكيد بريدك الإلكتروني بزيارة الرابط التالي:

${verificationUrl}

ملاحظة: هذا الرابط صالح لمدة 24 ساعة فقط.

إذا لم تقم بإنشاء حساب على Careerak، يرجى تجاهل هذا البريد.

© 2026 Careerak
careerak.hr@gmail.com
  `;

  return await sendEmail({
    to: user.email,
    subject,
    html,
    text
  });
};

/**
 * إرسال بريد إعادة تعيين كلمة المرور
 */
const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  
  const subject = 'إعادة تعيين كلمة المرور - Careerak';
  
  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #304B60; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #D48161; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; color: #666; margin-top: 20px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>إعادة تعيين كلمة المرور</h1>
        </div>
        <div class="content">
          <p>مرحباً ${user.firstName || user.companyName || 'عزيزي المستخدم'},</p>
          
          <p>تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك على Careerak.</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">إعادة تعيين كلمة المرور</a>
          </div>
          
          <p>أو انسخ الرابط التالي والصقه في متصفحك:</p>
          <p style="background: #e0e0e0; padding: 10px; border-radius: 5px; word-break: break-all;">
            ${resetUrl}
          </p>
          
          <div class="warning">
            <strong>⚠️ تحذير أمني:</strong>
            <ul>
              <li>هذا الرابط صالح لمدة ساعة واحدة فقط</li>
              <li>يمكن استخدامه مرة واحدة فقط</li>
              <li>لا تشارك هذا الرابط مع أي شخص</li>
            </ul>
          </div>
          
          <p>إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد. حسابك آمن.</p>
        </div>
        <div class="footer">
          <p>© 2026 Careerak. جميع الحقوق محفوظة.</p>
          <p>careerak.hr@gmail.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
مرحباً ${user.firstName || user.companyName || 'عزيزي المستخدم'},

تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك على Careerak.

لإعادة تعيين كلمة المرور، يرجى زيارة الرابط التالي:

${resetUrl}

⚠️ تحذير أمني:
- هذا الرابط صالح لمدة ساعة واحدة فقط
- يمكن استخدامه مرة واحدة فقط
- لا تشارك هذا الرابط مع أي شخص

إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد. حسابك آمن.

© 2026 Careerak
careerak.hr@gmail.com
  `;

  return await sendEmail({
    to: user.email,
    subject,
    html,
    text
  });
};

/**
 * إرسال بريد تأكيد تغيير كلمة المرور
 */
const sendPasswordChangedEmail = async (user) => {
  const subject = 'تم تغيير كلمة المرور - Careerak';
  
  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .warning { background: #fee; border: 1px solid #f00; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; color: #666; margin-top: 20px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ تم تغيير كلمة المرور</h1>
        </div>
        <div class="content">
          <p>مرحباً ${user.firstName || user.companyName || 'عزيزي المستخدم'},</p>
          
          <p>نؤكد لك أنه تم تغيير كلمة المرور لحسابك على Careerak بنجاح.</p>
          
          <p><strong>التاريخ والوقت:</strong> ${new Date().toLocaleString('ar-EG')}</p>
          
          <div class="warning">
            <strong>⚠️ لم تقم بهذا التغيير؟</strong>
            <p>إذا لم تقم بتغيير كلمة المرور، يرجى الاتصال بنا فوراً على:</p>
            <p><strong>careerak.hr@gmail.com</strong></p>
          </div>
          
          <p>للحفاظ على أمان حسابك:</p>
          <ul>
            <li>لا تشارك كلمة المرور مع أي شخص</li>
            <li>استخدم كلمة مرور قوية وفريدة</li>
            <li>قم بتغيير كلمة المرور بشكل دوري</li>
          </ul>
        </div>
        <div class="footer">
          <p>© 2026 Careerak. جميع الحقوق محفوظة.</p>
          <p>careerak.hr@gmail.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
مرحباً ${user.firstName || user.companyName || 'عزيزي المستخدم'},

نؤكد لك أنه تم تغيير كلمة المرور لحسابك على Careerak بنجاح.

التاريخ والوقت: ${new Date().toLocaleString('ar-EG')}

⚠️ لم تقم بهذا التغيير؟
إذا لم تقم بتغيير كلمة المرور، يرجى الاتصال بنا فوراً على:
careerak.hr@gmail.com

للحفاظ على أمان حسابك:
- لا تشارك كلمة المرور مع أي شخص
- استخدم كلمة مرور قوية وفريدة
- قم بتغيير كلمة المرور بشكل دوري

© 2026 Careerak
careerak.hr@gmail.com
  `;

  return await sendEmail({
    to: user.email,
    subject,
    html,
    text
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail
};
