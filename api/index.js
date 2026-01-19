const connectDB = require('../backend/src/config/database');
const app = require('../backend/src/index.js');

// ذاكرة مؤقتة للاتصال لضمان عدم التكرار في Vercel
let isConnected = false;

module.exports = async (req, res) => {
  try {
    if (!isConnected) {
      console.log("Initializing cold start connection...");
      await connectDB();
      isConnected = true;
    }

    // توجيه الطلب لتطبيق express
    return app(req, res);
  } catch (error) {
    console.error("Vercel Function Error:", error);
    res.status(500).json({
      error: "Server Initialization Failed",
      details: error.message
    });
  }
};
