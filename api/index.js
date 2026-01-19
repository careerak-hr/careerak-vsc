const connectDB = require('../backend/src/config/database');
const app = require('../backend/src/index.js');

// ✅ البوابة الذكية: التأكد من الاتصال بقاعدة البيانات قبل معالجة أي طلب
module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error("Critical Start Error:", error);
    res.status(500).send("Server Initialization Failed");
  }
};
