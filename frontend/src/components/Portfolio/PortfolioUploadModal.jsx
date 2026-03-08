import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Upload, Link as LinkIcon, FileText, Check } from 'lucide-react';
import './Portfolio.css';

/**
 * Modal for uploading or editing portfolio items
 * Requirements: 5.2
 */
const PortfolioUploadModal = ({ isOpen, onClose, onSuccess, item = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    externalLink: '',
    tags: ''
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title || '',
        description: item.description || '',
        category: item.category || 'other',
        externalLink: item.externalLink || '',
        tags: item.tags ? item.tags.join(', ') : ''
      });
      setPreview(item.thumbnailUrl || item.fileUrl);
    }
  }, [item]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validation (Requirement 5.3/Property 6)
    const maxSize = selectedFile.type === 'application/pdf' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError(`حجم الملف كبير جداً. الحد الأقصى هو ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Create preview if image
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('externalLink', formData.externalLink);
      data.append('tags', formData.tags);
      if (file) data.append('file', file);

      if (item) {
        await axios.put(`/api/portfolio/items/${item._id}`, data);
      } else {
        await axios.post('/api/portfolio/items', data);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'حدث خطأ أثناء حفظ العمل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portfolio-modal-overlay">
      <div className="portfolio-modal bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
          <h3 className="font-amiri text-2xl text-primary dark:text-white">
            {item ? 'تعديل عمل' : 'إضافة عمل جديد'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">عنوان العمل *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-accent/20 bg-secondary/30 focus:border-accent outline-none transition-all dark:bg-gray-900 dark:text-white"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="مثال: موقع تجارة إلكترونية"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">الفئة</label>
                <select
                  className="w-full px-4 py-3 rounded-xl border-2 border-accent/20 bg-secondary/30 focus:border-accent outline-none transition-all dark:bg-gray-900 dark:text-white"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="design">تصميم</option>
                  <option value="development">برمجة</option>
                  <option value="writing">كتابة محتوى</option>
                  <option value="marketing">تسويق</option>
                  <option value="other">أخرى</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">رابط خارجي (اختياري)</label>
                <div className="relative">
                  <LinkIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-accent/20 bg-secondary/30 focus:border-accent outline-none transition-all dark:bg-gray-900 dark:text-white"
                    value={formData.externalLink}
                    onChange={(e) => setFormData({...formData, externalLink: e.target.value})}
                    placeholder="https://behance.net/..."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">الصور أو الملفات</label>
              <div
                className="upload-area aspect-square rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer"
                onClick={() => document.getElementById('portfolio-file').click()}
              >
                {preview ? (
                  <>
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white text-sm font-bold">تغيير الملف</span>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="text-gray-300 group-hover:text-accent transition-colors mb-2" size={48} />
                    <span className="text-xs text-gray-400 text-center px-4">اسحب وأفلت صورة أو ملف PDF<br/>(Max 5MB images, 10MB PDF)</span>
                  </>
                )}
                <input id="portfolio-file" type="file" hidden onChange={handleFileChange} accept="image/*,application/pdf" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">وصف العمل</label>
            <textarea
              rows="3"
              className="w-full px-4 py-3 rounded-xl border-2 border-accent/20 bg-secondary/30 focus:border-accent outline-none transition-all dark:bg-gray-900 dark:text-white"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="اشرح باختصار ماذا فعلت في هذا المشروع..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary py-4 rounded-2xl font-black text-lg shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? 'جاري الحفظ...' : (
                <>
                  <Check size={20} />
                  {item ? 'تحديث العمل' : 'إضافة العمل الآن'}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 rounded-2xl border-2 border-gray-100 dark:border-gray-700 font-bold text-gray-500"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PortfolioUploadModal;
