import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, ExternalLink, Trash2, Edit2, FileText, Image as ImageIcon } from 'lucide-react';
import PortfolioUploadModal from './PortfolioUploadModal';
import './Portfolio.css';

/**
 * Portfolio Gallery Component
 * Requirements: 5.2
 */
const PortfolioGallery = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/portfolio/items');
      setItems(response.data.data || []);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا العمل؟')) return;
    try {
      await axios.delete(`/api/portfolio/items/${id}`);
      setItems(prev => prev.filter(item => item._id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const openUploadModal = (item = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  if (loading) return <div className="animate-pulse h-64 bg-gray-50 rounded-2xl"></div>;

  return (
    <div className="portfolio-gallery bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-amiri text-2xl text-primary dark:text-white">معرض الأعمال</h3>
        <button
          onClick={() => openUploadModal()}
          className="btn-primary flex items-center gap-2 py-2 px-4 text-sm"
        >
          <Plus size={18} />
          إضافة عمل
        </button>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item._id} className="portfolio-card group relative bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md">
              {/* Preview Area */}
              <div className="aspect-video w-full overflow-hidden bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                {item.type === 'image' ? (
                  <img src={item.thumbnailUrl || item.fileUrl} alt={item.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                ) : item.type === 'pdf' ? (
                  <div className="text-gray-400 flex flex-col items-center gap-2">
                    <FileText size={48} />
                    <span className="text-xs font-bold uppercase">PDF Document</span>
                  </div>
                ) : (
                  <div className="text-gray-400 flex flex-col items-center gap-2">
                    <ExternalLink size={48} />
                    <span className="text-xs font-bold uppercase">External Link</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-primary dark:text-white truncate">{item.title}</h4>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openUploadModal(item)} className="text-gray-400 hover:text-accent"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(item._id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{item.description}</p>
                {item.category && (
                  <span className="inline-block mt-3 px-2 py-1 bg-accent/10 text-accent text-[10px] font-bold rounded uppercase">
                    {item.category}
                  </span>
                )}
              </div>

              {/* View Overlay */}
              <a
                href={item.externalLink || item.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 z-10 opacity-0"
                aria-label="View Project"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800">
          <ImageIcon className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500">لا يوجد أعمال مضافة حالياً. ابدأ بإضافة عملك الأول!</p>
        </div>
      )}

      {isModalOpen && (
        <PortfolioUploadModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchPortfolio}
          item={editingItem}
        />
      )}
    </div>
  );
};

export default PortfolioGallery;
