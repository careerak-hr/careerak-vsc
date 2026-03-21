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
    // في التطوير والاختبار، نسجل البريد فقط
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      logger.info('📧 Email sent (simulated)', {
        to,
        subject,
        preview: text ? text.substring(0, 100) : html.substring(0, 100)
      });
      
      // طباعة في console للتطوير
      if (process.env.NODE_ENV === 'development') {
        console.log('\n=== EMAIL SENT (SIMULATED) ===');
        console.log('To:', to);
        console.log('Subject:', subject);
        console.log('Content:', text || html);
        console.log('==============================\n');
      }
      
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

/**
 * إرسال بريد دعوة لمقابلة فيديو
 */
const sendVideoInterviewInvitation = async (appointment, videoInterview, participants) => {
  const interviewUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/video-interview/${videoInterview.roomId}`;
  const scheduledDate = new Date(appointment.scheduledAt);
  const formattedDate = scheduledDate.toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = scheduledDate.toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // إرسال بريد لكل مشارك
  const emailPromises = participants.map(async (participant) => {
    const subject = `دعوة لمقابلة فيديو - ${appointment.title} | Careerak`;
    
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
          .info-box { background: white; border: 2px solid #D48161; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .info-label { font-weight: bold; color: #304B60; }
          .button { display: inline-block; background: #D48161; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-size: 16px; font-weight: bold; }
          .button:hover { background: #c06f51; }
          .link-box { background: #e0e0e0; padding: 15px; border-radius: 5px; word-break: break-all; margin: 15px 0; }
          .tips { background: #e8f4f8; border-right: 4px solid #304B60; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; color: #666; margin-top: 20px; font-size: 12px; }
          .icon { font-size: 24px; margin-left: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📹 دعوة لمقابلة فيديو</h1>
          </div>
          <div class="content">
            <p>مرحباً ${participant.firstName || participant.name || 'عزيزي المستخدم'},</p>
            
            <p>تم دعوتك لحضور مقابلة فيديو على منصة Careerak.</p>
            
            <div class="info-box">
              <h3 style="color: #304B60; margin-top: 0;">📋 تفاصيل المقابلة</h3>
              <div class="info-row">
                <span class="info-label">العنوان:</span>
                <span>${appointment.title}</span>
              </div>
              ${appointment.description ? `
              <div class="info-row">
                <span class="info-label">الوصف:</span>
                <span>${appointment.description}</span>
              </div>
              ` : ''}
              <div class="info-row">
                <span class="info-label">📅 التاريخ:</span>
                <span>${formattedDate}</span>
              </div>
              <div class="info-row">
                <span class="info-label">🕐 الوقت:</span>
                <span>${formattedTime}</span>
              </div>
              <div class="info-row">
                <span class="info-label">⏱️ المدة:</span>
                <span>${appointment.duration} دقيقة</span>
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="${interviewUrl}" class="button">🎥 الانضمام للمقابلة</a>
            </div>
            
            <p style="text-align: center; color: #666; font-size: 14px;">
              أو انسخ الرابط التالي والصقه في متصفحك:
            </p>
            <div class="link-box">
              ${interviewUrl}
            </div>
            
            <div class="tips">
              <h4 style="margin-top: 0; color: #304B60;">💡 نصائح للمقابلة:</h4>
              <ul style="margin: 10px 0; padding-right: 20px;">
                <li>تأكد من اتصال إنترنت مستقر</li>
                <li>اختبر الكاميرا والميكروفون قبل المقابلة</li>
                <li>اختر مكاناً هادئاً ومضاءً جيداً</li>
                <li>انضم قبل 5 دقائق من الموعد</li>
                <li>استخدم متصفح Chrome أو Firefox للحصول على أفضل تجربة</li>
              </ul>
            </div>
            
            <p><strong>ملاحظة:</strong> يمكنك الانضمام للمقابلة قبل 5 دقائق من الموعد المحدد.</p>
            
            ${appointment.notes ? `
            <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <strong>📝 ملاحظات إضافية:</strong>
              <p style="margin: 10px 0 0 0;">${appointment.notes}</p>
            </div>
            ` : ''}
            
            <p>إذا كان لديك أي استفسارات، لا تتردد في التواصل معنا.</p>
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
مرحباً ${participant.firstName || participant.name || 'عزيزي المستخدم'},

تم دعوتك لحضور مقابلة فيديو على منصة Careerak.

📋 تفاصيل المقابلة:
- العنوان: ${appointment.title}
${appointment.description ? `- الوصف: ${appointment.description}` : ''}
- التاريخ: ${formattedDate}
- الوقت: ${formattedTime}
- المدة: ${appointment.duration} دقيقة

🎥 رابط المقابلة:
${interviewUrl}

💡 نصائح للمقابلة:
- تأكد من اتصال إنترنت مستقر
- اختبر الكاميرا والميكروفون قبل المقابلة
- اختر مكاناً هادئاً ومضاءً جيداً
- انضم قبل 5 دقائق من الموعد
- استخدم متصفح Chrome أو Firefox للحصول على أفضل تجربة

ملاحظة: يمكنك الانضمام للمقابلة قبل 5 دقائق من الموعد المحدد.

${appointment.notes ? `📝 ملاحظات إضافية:\n${appointment.notes}\n` : ''}

إذا كان لديك أي استفسارات، لا تتردد في التواصل معنا.

© 2026 Careerak
careerak.hr@gmail.com
    `;

    return await sendEmail({
      to: participant.email,
      subject,
      html,
      text
    });
  });

  return await Promise.all(emailPromises);
};

/**
 * إرسال تذكير بمقابلة فيديو قادمة
 */
const sendVideoInterviewReminder = async (appointment, videoInterview, participant, minutesBefore) => {
  const interviewUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/video-interview/${videoInterview.roomId}`;
  const scheduledDate = new Date(appointment.scheduledAt);
  const formattedTime = scheduledDate.toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const subject = `تذكير: مقابلة فيديو خلال ${minutesBefore} دقيقة - ${appointment.title} | Careerak`;
  
  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #D48161; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .urgent { background: #fff3cd; border: 2px solid #ffc107; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .button { display: inline-block; background: #10b981; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-size: 18px; font-weight: bold; }
        .button:hover { background: #059669; }
        .footer { text-align: center; color: #666; margin-top: 20px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ تذكير بمقابلة فيديو</h1>
        </div>
        <div class="content">
          <p>مرحباً ${participant.firstName || participant.name || 'عزيزي المستخدم'},</p>
          
          <div class="urgent">
            <h2 style="margin: 0; color: #d97706;">⚠️ مقابلتك ستبدأ خلال ${minutesBefore} دقيقة!</h2>
          </div>
          
          <p style="font-size: 16px;"><strong>العنوان:</strong> ${appointment.title}</p>
          <p style="font-size: 16px;"><strong>الوقت:</strong> ${formattedTime}</p>
          <p style="font-size: 16px;"><strong>المدة:</strong> ${appointment.duration} دقيقة</p>
          
          <div style="text-align: center;">
            <a href="${interviewUrl}" class="button">🎥 انضم الآن</a>
          </div>
          
          <p style="text-align: center; color: #666;">
            تأكد من أن الكاميرا والميكروفون يعملان بشكل صحيح
          </p>
        </div>
        <div class="footer">
          <p>© 2026 Careerak. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
مرحباً ${participant.firstName || participant.name || 'عزيزي المستخدم'},

⏰ تذكير: مقابلتك ستبدأ خلال ${minutesBefore} دقيقة!

العنوان: ${appointment.title}
الوقت: ${formattedTime}
المدة: ${appointment.duration} دقيقة

🎥 رابط المقابلة:
${interviewUrl}

تأكد من أن الكاميرا والميكروفون يعملان بشكل صحيح.

© 2026 Careerak
careerak.hr@gmail.com
  `;

  return await sendEmail({
    to: participant.email,
    subject,
    html,
    text
  });
};

/**
 * إرسال بريد إلكتروني عند إعادة جدولة مقابلة فيديو
 */
const sendInterviewRescheduledEmail = async (to, data) => {
  const { recipientName, requesterName, oldDate, newDate, reason, interviewUrl } = data;

  const oldDateFormatted = new Date(oldDate).toLocaleString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const newDateFormatted = new Date(newDate).toLocaleString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const subject = 'تم إعادة جدولة المقابلة - Careerak';
  
  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 20px;
          direction: rtl;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #304B60 0%, #D48161 100%);
          color: #ffffff;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .content {
          padding: 30px;
        }
        .greeting {
          font-size: 18px;
          color: #333;
          margin-bottom: 20px;
        }
        .message {
          font-size: 16px;
          color: #555;
          line-height: 1.6;
          margin-bottom: 20px;
        }
        .schedule-box {
          background-color: #f9f9f9;
          border-right: 4px solid #D48161;
          padding: 20px;
          margin: 20px 0;
          border-radius: 5px;
        }
        .schedule-item {
          margin: 10px 0;
        }
        .schedule-label {
          font-weight: bold;
          color: #304B60;
          display: inline-block;
          width: 120px;
        }
        .schedule-value {
          color: #555;
        }
        .old-date {
          text-decoration: line-through;
          color: #999;
        }
        .new-date {
          color: #D48161;
          font-weight: bold;
        }
        .reason-box {
          background-color: #fff3e0;
          border-right: 4px solid #ff9800;
          padding: 15px;
          margin: 20px 0;
          border-radius: 5px;
        }
        .reason-label {
          font-weight: bold;
          color: #ff9800;
          margin-bottom: 5px;
        }
        .button {
          display: inline-block;
          background-color: #D48161;
          color: #ffffff;
          text-decoration: none;
          padding: 15px 30px;
          border-radius: 5px;
          font-size: 16px;
          font-weight: bold;
          margin: 20px 0;
          text-align: center;
        }
        .button:hover {
          background-color: #c06f51;
        }
        .footer {
          background-color: #f9f9f9;
          padding: 20px;
          text-align: center;
          font-size: 14px;
          color: #777;
        }
        .footer a {
          color: #D48161;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔄 تم إعادة جدولة المقابلة</h1>
        </div>
        <div class="content">
          <div class="greeting">
            مرحباً ${recipientName}،
          </div>
          <div class="message">
            نود إعلامك بأن <strong>${requesterName}</strong> قام بإعادة جدولة المقابلة.
          </div>
          
          <div class="schedule-box">
            <div class="schedule-item">
              <span class="schedule-label">الموعد القديم:</span>
              <span class="schedule-value old-date">${oldDateFormatted}</span>
            </div>
            <div class="schedule-item">
              <span class="schedule-label">الموعد الجديد:</span>
              <span class="schedule-value new-date">${newDateFormatted}</span>
            </div>
          </div>

          ${reason && reason !== 'لم يتم تحديد سبب' ? `
          <div class="reason-box">
            <div class="reason-label">السبب:</div>
            <div>${reason}</div>
          </div>
          ` : ''}

          <div class="message">
            يرجى التأكد من توفرك في الموعد الجديد. إذا كان لديك أي استفسار أو تحتاج لإعادة الجدولة مرة أخرى، يرجى التواصل مع الطرف الآخر.
          </div>

          <div style="text-align: center;">
            <a href="${interviewUrl}" class="button">
              عرض تفاصيل المقابلة
            </a>
          </div>

          <div class="message" style="margin-top: 30px; font-size: 14px; color: #777;">
            💡 <strong>تذكير:</strong> يمكنك الانضمام للمقابلة قبل 5 دقائق من الموعد المحدد.
          </div>
        </div>
        <div class="footer">
          <p>هذا البريد الإلكتروني تم إرساله تلقائياً من منصة Careerak</p>
          <p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}">زيارة الموقع</a> | 
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings">الإعدادات</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
مرحباً ${recipientName}،

تم إعادة جدولة المقابلة

قام ${requesterName} بإعادة جدولة المقابلة.

الموعد القديم: ${oldDateFormatted}
الموعد الجديد: ${newDateFormatted}

${reason && reason !== 'لم يتم تحديد سبب' ? `السبب: ${reason}\n` : ''}

يرجى التأكد من توفرك في الموعد الجديد.

رابط المقابلة: ${interviewUrl}

تذكير: يمكنك الانضمام للمقابلة قبل 5 دقائق من الموعد المحدد.

---
Careerak - منصة التوظيف والتدريب
${process.env.FRONTEND_URL || 'http://localhost:3000'}
  `;

  return sendEmail({ to, subject, html, text });
};

/**
 * إرسال بريد إلكتروني عند إصدار شهادة جديدة
 */
const sendCertificateIssuedEmail = async (user, certificate, course) => {
  const certificateUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/certificates/${certificate.certificateId}`;
  const verificationUrl = certificate.verificationUrl;
  const pdfUrl = certificate.pdfUrl || certificateUrl;

  const lang = user.language || user.preferredLanguage || 'ar';
  const isAr = lang === 'ar';
  const isFr = lang === 'fr';

  const emailTexts = {
    ar: {
      subject: `تهانينا! شهادتك جاهزة - ${course.title} | Careerak`,
      dir: 'rtl', htmlLang: 'ar',
      greeting: `مرحباً <strong>${user.firstName} ${user.lastName}</strong>،`,
      congrats: 'تهانينا!',
      ready: 'شهادتك جاهزة للتحميل',
      completed: `نهنئك على إكمال دورة <strong>"${course.title}"</strong> بنجاح! 🎓`,
      certIdLabel: 'رقم الشهادة',
      issueDateLabel: 'تاريخ الإصدار',
      downloadBtn: '📥 تحميل الشهادة (PDF)',
      viewBtn: '👁️ عرض الشهادة',
      featuresTitle: '✨ ميزات شهادتك:',
      features: ['✅ <strong>شهادة رسمية معتمدة</strong> من Careerak','🔐 <strong>رقم فريد</strong> للتحقق من الصحة','📱 <strong>QR Code</strong> للمشاركة والتحقق السريع','🌐 <strong>رابط تحقق عام</strong> يمكن مشاركته مع أي جهة','💼 <strong>قابلة للمشاركة</strong> على LinkedIn وجميع المنصات'],
      shareTitle: '📢 شارك إنجازك!',
      shareDesc: 'أضف شهادتك إلى ملفك الشخصي على LinkedIn وشاركها مع شبكتك المهنية',
      shareBtn: 'مشاركة على LinkedIn',
      verifyTitle: '🔍 التحقق من الشهادة',
      verifyDesc: 'يمكن لأي شخص التحقق من صحة شهادتك باستخدام:',
      verifyLink: 'رابط التحقق',
      closing: 'نتمنى لك التوفيق في مسيرتك المهنية! 🚀',
      contact: 'إذا كان لديك أي استفسارات، لا تتردد في التواصل معنا.',
      footer: '© 2026 Careerak. جميع الحقوق محفوظة.',
      dateLocale: 'ar-EG',
    },
    en: {
      subject: `Congratulations! Your certificate is ready - ${course.title} | Careerak`,
      dir: 'ltr', htmlLang: 'en',
      greeting: `Hello <strong>${user.firstName} ${user.lastName}</strong>,`,
      congrats: 'Congratulations!',
      ready: 'Your certificate is ready to download',
      completed: `Congratulations on successfully completing <strong>"${course.title}"</strong>! 🎓`,
      certIdLabel: 'Certificate ID',
      issueDateLabel: 'Issue Date',
      downloadBtn: '📥 Download Certificate (PDF)',
      viewBtn: '👁️ View Certificate',
      featuresTitle: '✨ Your certificate features:',
      features: ['✅ <strong>Official certificate</strong> from Careerak','🔐 <strong>Unique ID</strong> for authenticity verification','📱 <strong>QR Code</strong> for quick sharing and verification','🌐 <strong>Public verification link</strong> shareable with anyone','💼 <strong>Shareable</strong> on LinkedIn and all platforms'],
      shareTitle: '📢 Share your achievement!',
      shareDesc: 'Add your certificate to your LinkedIn profile and share it with your professional network',
      shareBtn: 'Share on LinkedIn',
      verifyTitle: '🔍 Certificate Verification',
      verifyDesc: 'Anyone can verify your certificate using:',
      verifyLink: 'Verification link',
      closing: 'We wish you success in your career! 🚀',
      contact: 'If you have any questions, feel free to contact us.',
      footer: '© 2026 Careerak. All rights reserved.',
      dateLocale: 'en-US',
    },
    fr: {
      subject: `Félicitations! Votre certificat est prêt - ${course.title} | Careerak`,
      dir: 'ltr', htmlLang: 'fr',
      greeting: `Bonjour <strong>${user.firstName} ${user.lastName}</strong>,`,
      congrats: 'Félicitations!',
      ready: 'Votre certificat est prêt à télécharger',
      completed: `Félicitations pour avoir complété avec succès <strong>"${course.title}"</strong>! 🎓`,
      certIdLabel: 'N° de certificat',
      issueDateLabel: 'Date d\'émission',
      downloadBtn: '📥 Télécharger le certificat (PDF)',
      viewBtn: '👁️ Voir le certificat',
      featuresTitle: '✨ Caractéristiques de votre certificat:',
      features: ['✅ <strong>Certificat officiel</strong> de Careerak','🔐 <strong>Identifiant unique</strong> pour la vérification','📱 <strong>QR Code</strong> pour le partage et la vérification rapide','🌐 <strong>Lien de vérification public</strong> partageable avec n\'importe qui','💼 <strong>Partageable</strong> sur LinkedIn et toutes les plateformes'],
      shareTitle: '📢 Partagez votre réussite!',
      shareDesc: 'Ajoutez votre certificat à votre profil LinkedIn et partagez-le avec votre réseau professionnel',
      shareBtn: 'Partager sur LinkedIn',
      verifyTitle: '🔍 Vérification du certificat',
      verifyDesc: 'N\'importe qui peut vérifier votre certificat en utilisant:',
      verifyLink: 'Lien de vérification',
      closing: 'Nous vous souhaitons du succès dans votre carrière! 🚀',
      contact: 'Si vous avez des questions, n\'hésitez pas à nous contacter.',
      footer: '© 2026 Careerak. Tous droits réservés.',
      dateLocale: 'fr-FR',
    },
  };

  const tx = emailTexts[lang] || emailTexts.ar;
  const subject = tx.subject;
  
  const formattedDate = new Date(certificate.issueDate).toLocaleDateString(tx.dateLocale, {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const html = `
    <!DOCTYPE html>
    <html dir="${tx.dir}" lang="${tx.htmlLang}">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: ${tx.dir}; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #304B60 0%, #D48161 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0; font-size: 32px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .certificate-box { background: white; border: 3px solid #D48161; padding: 25px; border-radius: 10px; margin: 20px 0; text-align: center; }
        .certificate-title { color: #304B60; font-size: 24px; font-weight: bold; margin: 15px 0; }
        .certificate-info { color: #666; font-size: 16px; margin: 10px 0; }
        .button { display: inline-block; background: #D48161; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 10px 5px; font-size: 16px; font-weight: bold; }
        .button-secondary { background: #304B60; }
        .features { background: #e8f4f8; border-${tx.dir === 'rtl' ? 'right' : 'left'}: 4px solid #304B60; padding: 20px; margin: 20px 0; }
        .features ul { margin: 10px 0; padding-${tx.dir === 'rtl' ? 'right' : 'left'}: 20px; }
        .features li { margin: 8px 0; }
        .share-section { background: #fff3e0; border: 2px solid #ff9800; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .footer { text-align: center; color: #666; margin-top: 20px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div style="font-size: 64px; margin-bottom: 10px;">🎉</div>
          <h1>${tx.congrats}</h1>
          <p style="font-size: 18px; margin: 10px 0 0 0;">${tx.ready}</p>
        </div>
        <div class="content">
          <p style="font-size: 18px;">${tx.greeting}</p>
          <p>${tx.completed}</p>
          <div class="certificate-box">
            <div style="font-size: 48px; margin-bottom: 15px;">📜</div>
            <div class="certificate-title">${course.title}</div>
            <div class="certificate-info">
              <p><strong>${tx.certIdLabel}:</strong> ${certificate.certificateId}</p>
              <p><strong>${tx.issueDateLabel}:</strong> ${formattedDate}</p>
            </div>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${pdfUrl}" class="button">${tx.downloadBtn}</a>
            <a href="${certificateUrl}" class="button button-secondary">${tx.viewBtn}</a>
          </div>
          <div class="features">
            <h3 style="color: #304B60; margin-top: 0;">${tx.featuresTitle}</h3>
            <ul>${tx.features.map(f => `<li>${f}</li>`).join('')}</ul>
          </div>
          <div class="share-section">
            <h3 style="color: #ff9800; margin-top: 0;">${tx.shareTitle}</h3>
            <p>${tx.shareDesc}</p>
            <a href="${certificateUrl}" class="button" style="background: #0077b5;">${tx.shareBtn}</a>
          </div>
          <div style="background: white; border: 2px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #10b981; margin-top: 0;">${tx.verifyTitle}</h3>
            <p>${tx.verifyDesc}</p>
            <ul style="margin: 10px 0; padding-${tx.dir === 'rtl' ? 'right' : 'left'}: 20px;">
              <li><strong>${tx.certIdLabel}:</strong> ${certificate.certificateId}</li>
              <li><strong>${tx.verifyLink}:</strong> <a href="${verificationUrl}" style="color: #10b981;">${verificationUrl}</a></li>
            </ul>
          </div>
          <p style="font-size: 16px; color: #555; margin-top: 30px;">${tx.closing}</p>
          <p style="font-size: 14px; color: #777;">${tx.contact}</p>
        </div>
        <div class="footer">
          <p>${tx.footer}</p>
          <p>careerak.hr@gmail.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `${tx.congrats}\n${tx.greeting.replace(/<[^>]+>/g, '')}\n\n${tx.completed.replace(/<[^>]+>/g, '')}\n\n${tx.certIdLabel}: ${certificate.certificateId}\n${tx.issueDateLabel}: ${formattedDate}\n\n${tx.downloadBtn.replace(/📥 /, '')}: ${pdfUrl}\n${tx.viewBtn.replace(/👁️ /, '')}: ${certificateUrl}\n\n${tx.verifyLink}: ${verificationUrl}\n\n${tx.closing}\n\n© 2026 Careerak\ncareerak.hr@gmail.com`;

  return await sendEmail({
    to: user.email,
    subject,
    html,
    text
  });
};

/**
 * إرسال بريد إلكتروني تأكيد الموعد للطرفين
 */
const sendAppointmentConfirmationEmail = async (appointment, companyUser, jobSeekerUser) => {
  const scheduledDate = new Date(appointment.scheduledAt);
  const formattedDate = scheduledDate.toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = scheduledDate.toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const buildHtml = (recipientName, role) => `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; background: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: #304B60; color: white; padding: 25px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .info-box { background: #f9f9f9; border: 2px solid #D48161; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .info-row { padding: 8px 0; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; }
        .info-row:last-child { border-bottom: none; }
        .label { font-weight: bold; color: #304B60; }
        .button { display: inline-block; background: #D48161; color: white; padding: 14px 35px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-size: 16px; font-weight: bold; }
        .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #777; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ تم تأكيد الموعد</h1>
        </div>
        <div class="content">
          <p>مرحباً <strong>${recipientName}</strong>،</p>
          <p>نؤكد لك تأكيد موعد المقابلة التالية:</p>
          <div class="info-box">
            <div class="info-row">
              <span class="label">عنوان المقابلة:</span>
              <span>${appointment.title}</span>
            </div>
            <div class="info-row">
              <span class="label">📅 التاريخ:</span>
              <span>${formattedDate}</span>
            </div>
            <div class="info-row">
              <span class="label">🕐 الوقت:</span>
              <span>${formattedTime}</span>
            </div>
            <div class="info-row">
              <span class="label">⏱️ المدة:</span>
              <span>${appointment.duration} دقيقة</span>
            </div>
            ${appointment.location ? `
            <div class="info-row">
              <span class="label">📍 المكان:</span>
              <span>${appointment.location}</span>
            </div>` : ''}
            ${(appointment.meetLink || appointment.googleMeetLink) ? `
            <div class="info-row" style="background: #e8f5e9; border-radius: 5px; padding: 10px;">
              <span class="label">🎥 رابط Google Meet:</span>
              <span><a href="${appointment.meetLink || appointment.googleMeetLink}" style="color: #1a73e8; font-weight: bold;">${appointment.meetLink || appointment.googleMeetLink}</a></span>
            </div>` : appointment.meetingLink ? `
            <div class="info-row">
              <span class="label">🔗 رابط المقابلة:</span>
              <span><a href="${appointment.meetingLink}">${appointment.meetingLink}</a></span>
            </div>` : ''}
            <div class="info-row">
              <span class="label">👤 الشركة:</span>
              <span>${companyUser.companyName || companyUser.firstName || 'الشركة'}</span>
            </div>
            <div class="info-row">
              <span class="label">👤 المرشح:</span>
              <span>${jobSeekerUser.firstName || ''} ${jobSeekerUser.lastName || ''}</span>
            </div>
          </div>
          ${(appointment.meetLink || appointment.googleMeetLink) ? `
          <div style="text-align: center;">
            <a href="${appointment.meetLink || appointment.googleMeetLink}" class="button">🎥 الانضمام عبر Google Meet</a>
          </div>` : appointment.meetingLink ? `
          <div style="text-align: center;">
            <a href="${appointment.meetingLink}" class="button">🎥 الانضمام للمقابلة</a>
          </div>` : ''}
          ${appointment.notes ? `
          <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>📝 ملاحظات:</strong>
            <p style="margin: 8px 0 0 0;">${appointment.notes}</p>
          </div>` : ''}
          <p>إذا كان لديك أي استفسارات، لا تتردد في التواصل معنا.</p>
        </div>
        <div class="footer">
          <p>© 2026 Careerak. جميع الحقوق محفوظة.</p>
          <p>careerak.hr@gmail.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const buildText = (recipientName) => `
مرحباً ${recipientName}،

✅ تم تأكيد موعد المقابلة

عنوان المقابلة: ${appointment.title}
التاريخ: ${formattedDate}
الوقت: ${formattedTime}
المدة: ${appointment.duration} دقيقة
${appointment.location ? `المكان: ${appointment.location}\n` : ''}${(appointment.meetLink || appointment.googleMeetLink) ? `رابط Google Meet: ${appointment.meetLink || appointment.googleMeetLink}\n` : appointment.meetingLink ? `رابط المقابلة: ${appointment.meetingLink}\n` : ''}الشركة: ${companyUser.companyName || companyUser.firstName || 'الشركة'}
المرشح: ${jobSeekerUser.firstName || ''} ${jobSeekerUser.lastName || ''}
${appointment.notes ? `\nملاحظات: ${appointment.notes}\n` : ''}
© 2026 Careerak
careerak.hr@gmail.com
  `;

  const subject = `تأكيد موعد المقابلة: ${appointment.title} | Careerak`;

  const emailPromises = [];

  if (jobSeekerUser?.email) {
    emailPromises.push(sendEmail({
      to: jobSeekerUser.email,
      subject,
      html: buildHtml(`${jobSeekerUser.firstName || ''} ${jobSeekerUser.lastName || ''}`.trim(), 'seeker'),
      text: buildText(`${jobSeekerUser.firstName || ''} ${jobSeekerUser.lastName || ''}`.trim()),
    }));
  }

  if (companyUser?.email) {
    emailPromises.push(sendEmail({
      to: companyUser.email,
      subject,
      html: buildHtml(companyUser.companyName || companyUser.firstName || 'الشركة', 'company'),
      text: buildText(companyUser.companyName || companyUser.firstName || 'الشركة'),
    }));
  }

  return await Promise.all(emailPromises);
};

/**
 * إرسال بريد إلكتروني تذكير بموعد مقابلة
 * Requirements: 3.4 (دعم البريد الإلكتروني للتذكيرات)
 * 
 * @param {Object} appointment - بيانات الموعد
 * @param {Object} recipient - بيانات المستلم { firstName, lastName, email }
 * @param {'24h'|'1h'} reminderType - نوع التذكير
 */
const sendAppointmentReminderEmail = async (appointment, recipient, reminderType) => {
  const scheduledDate = new Date(appointment.scheduledAt);
  const formattedDate = scheduledDate.toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = scheduledDate.toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const timeLabel = reminderType === '24h' ? 'غداً' : 'خلال ساعة';
  const urgencyColor = reminderType === '1h' ? '#D48161' : '#304B60';
  const recipientName = `${recipient.firstName || ''} ${recipient.lastName || ''}`.trim() || 'عزيزي المستخدم';

  const subject = `تذكير: موعد مقابلة ${timeLabel} - ${appointment.title} | Careerak`;

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; background: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: ${urgencyColor}; color: white; padding: 25px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .info-box { background: #f9f9f9; border: 2px solid #D48161; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .info-row { padding: 8px 0; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; }
        .info-row:last-child { border-bottom: none; }
        .label { font-weight: bold; color: #304B60; }
        .button { display: inline-block; background: #D48161; color: white; padding: 14px 35px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-size: 16px; font-weight: bold; }
        .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #777; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ تذكير بموعد مقابلة</h1>
          <p style="margin: 8px 0 0 0; font-size: 16px;">موعدك ${timeLabel}</p>
        </div>
        <div class="content">
          <p>مرحباً <strong>${recipientName}</strong>،</p>
          <p>هذا تذكير بموعد مقابلتك القادمة:</p>
          <div class="info-box">
            <div class="info-row">
              <span class="label">عنوان المقابلة:</span>
              <span>${appointment.title}</span>
            </div>
            <div class="info-row">
              <span class="label">📅 التاريخ:</span>
              <span>${formattedDate}</span>
            </div>
            <div class="info-row">
              <span class="label">🕐 الوقت:</span>
              <span>${formattedTime}</span>
            </div>
            <div class="info-row">
              <span class="label">⏱️ المدة:</span>
              <span>${appointment.duration} دقيقة</span>
            </div>
            ${appointment.location ? `
            <div class="info-row">
              <span class="label">📍 المكان:</span>
              <span>${appointment.location}</span>
            </div>` : ''}
            ${(appointment.meetLink || appointment.googleMeetLink) ? `
            <div class="info-row" style="background: #e8f5e9; border-radius: 5px; padding: 10px;">
              <span class="label">🎥 رابط Google Meet:</span>
              <span><a href="${appointment.meetLink || appointment.googleMeetLink}" style="color: #1a73e8; font-weight: bold;">${appointment.meetLink || appointment.googleMeetLink}</a></span>
            </div>` : appointment.meetingLink ? `
            <div class="info-row">
              <span class="label">🔗 رابط المقابلة:</span>
              <span><a href="${appointment.meetingLink}">${appointment.meetingLink}</a></span>
            </div>` : ''}
          </div>
          ${(appointment.meetLink || appointment.googleMeetLink) ? `
          <div style="text-align: center;">
            <a href="${appointment.meetLink || appointment.googleMeetLink}" class="button">🎥 الانضمام عبر Google Meet</a>
          </div>` : appointment.meetingLink ? `
          <div style="text-align: center;">
            <a href="${appointment.meetingLink}" class="button">🎥 الانضمام للمقابلة</a>
          </div>` : ''}
          <p style="color: #666; font-size: 14px;">إذا كنت بحاجة إلى إلغاء أو تعديل الموعد، يرجى التواصل في أقرب وقت ممكن.</p>
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
مرحباً ${recipientName}،

⏰ تذكير: موعد مقابلتك ${timeLabel}

عنوان المقابلة: ${appointment.title}
التاريخ: ${formattedDate}
الوقت: ${formattedTime}
المدة: ${appointment.duration} دقيقة
${appointment.location ? `المكان: ${appointment.location}\n` : ''}${(appointment.meetLink || appointment.googleMeetLink) ? `رابط Google Meet: ${appointment.meetLink || appointment.googleMeetLink}\n` : appointment.meetingLink ? `رابط المقابلة: ${appointment.meetingLink}\n` : ''}
إذا كنت بحاجة إلى إلغاء أو تعديل الموعد، يرجى التواصل في أقرب وقت ممكن.

© 2026 Careerak
careerak.hr@gmail.com
  `;

  return await sendEmail({
    to: recipient.email,
    subject,
    html,
    text,
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendVideoInterviewInvitation,
  sendVideoInterviewReminder,
  sendInterviewRescheduledEmail,
  sendCertificateIssuedEmail,
  sendAppointmentConfirmationEmail,
  sendAppointmentReminderEmail,
};
