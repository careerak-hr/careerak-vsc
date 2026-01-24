const cloudinary = require('../config/cloudinary');

exports.uploadCV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // تحويل buffer إلى upload stream
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'careerak/cv',
          resource_type: 'raw', // مهم لـ PDF و DOCX
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      stream.end(req.file.buffer);
    });

    // النتيجة
    res.status(200).json({
      message: 'Upload successful',
      url: result.secure_url,
      public_id: result.public_id,
    });

  } catch (err) {
    console.error('❌ Upload failed:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
};
