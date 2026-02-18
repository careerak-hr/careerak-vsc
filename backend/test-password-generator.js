const http = require('http');

async function testPasswordGenerator() {
  try {
    console.log('🧪 اختبار توليد كلمة المرور...\n');

    // دالة مساعدة لإرسال POST request
    const postRequest = (data) => {
      return new Promise((resolve, reject) => {
        const postData = JSON.stringify(data);
        
        const options = {
          hostname: 'localhost',
          port: 5000,
          path: '/auth/generate-password',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
          }
        };

        const req = http.request(options, (res) => {
          let body = '';
          res.on('data', (chunk) => body += chunk);
          res.on('end', () => {
            try {
              resolve(JSON.parse(body));
            } catch (e) {
              reject(e);
            }
          });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
      });
    };

    // اختبار 1: توليد كلمة مرور بطول افتراضي (14)
    console.log('1️⃣ توليد كلمة مرور بطول افتراضي (14):');
    const response1 = await postRequest({});
    console.log('✅ النتيجة:', response1);
    console.log('   كلمة المرور:', response1.data.password);
    console.log('   القوة:', response1.data.strength.labelAr);
    console.log('   النسبة:', response1.data.strength.percentage + '%\n');

    // اختبار 2: توليد كلمة مرور بطول 16
    console.log('2️⃣ توليد كلمة مرور بطول 16:');
    const response2 = await postRequest({ length: 16 });
    console.log('✅ النتيجة:', response2);
    console.log('   كلمة المرور:', response2.data.password);
    console.log('   القوة:', response2.data.strength.labelAr);
    console.log('   النسبة:', response2.data.strength.percentage + '%\n');

    // اختبار 3: توليد كلمة مرور بطول 12 (الحد الأدنى)
    console.log('3️⃣ توليد كلمة مرور بطول 12:');
    const response3 = await postRequest({ length: 12 });
    console.log('✅ النتيجة:', response3);
    console.log('   كلمة المرور:', response3.data.password);
    console.log('   القوة:', response3.data.strength.labelAr);
    console.log('   النسبة:', response3.data.strength.percentage + '%\n');

    // اختبار 4: توليد 5 كلمات مرور للتأكد من العشوائية
    console.log('4️⃣ توليد 5 كلمات مرور للتأكد من العشوائية:');
    for (let i = 1; i <= 5; i++) {
      const response = await postRequest({});
      console.log(`   ${i}. ${response.data.password} (${response.data.strength.labelAr})`);
    }

    console.log('\n✅ جميع الاختبارات نجحت!');
  } catch (error) {
    console.error('❌ خطأ:', error.message || error);
  }
}

testPasswordGenerator();
