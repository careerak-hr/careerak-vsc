import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  ExternalLink,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Eye
} from 'lucide-react';
import './ProfilePreview.css';

/**
 * Profile Preview Component (Employer View)
 * Requirements: 10.2
 */
const ProfilePreview = ({ onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPreviewData();
  }, []);

  const fetchPreviewData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/profile/preview');
      setData(response.data.data);
    } catch (err) {
      setError('حدث خطأ أثناء تحميل المعاينة');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="preview-overlay flex items-center justify-center bg-white/90 z-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
        <p className="text-gray-500 font-amiri">جاري تجهيز معاينة ملفك...</p>
      </div>
    </div>
  );

  if (!data) return null;

  return (
    <div className="preview-overlay overflow-y-auto bg-gray-50 z-50">
      <div className="max-w-5xl mx-auto min-h-screen bg-white shadow-2xl relative">
        {/* Top bar */}
        <div className="sticky top-0 z-20 bg-primary text-white p-4 flex justify-between items-center shadow-md">
          <button onClick={onClose} className="flex items-center gap-2 hover:text-accent transition-colors">
            <ChevronLeft size={20} />
            <span>العودة للتعديل</span>
          </button>
          <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-sm">
            <Eye size={16} />
            <span>هذه هي الطريقة التي يراك بها أصحاب العمل</span>
          </div>
        </div>

        {/* Profile Header */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-12">
          <div className="flex flex-col md:flex-row gap-8 items-center text-center md:text-right">
            <img
              src={data.profileImage || '/logo.jpg'}
              alt={data.name}
              className="w-40 h-40 rounded-full border-4 border-white/20 object-cover shadow-xl"
            />
            <div className="flex-1">
              <h1 className="text-4xl font-bold font-amiri mb-2">{data.name}</h1>
              <p className="text-xl text-accent font-medium mb-4">{data.title}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-white/80">
                <div className="flex items-center gap-2"><Mail size={16} /> {data.email}</div>
                <div className="flex items-center gap-2"><Phone size={16} /> {data.phone}</div>
                <div className="flex items-center gap-2"><MapPin size={16} /> {data.location.city}, {data.location.country}</div>
              </div>
            </div>
            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/10 min-w-[200px]">
              <div className="text-xs uppercase tracking-wider text-white/60 mb-1">تقييم الملف</div>
              <div className="text-2xl font-bold text-accent mb-2">{data.evaluation.rating}</div>
              <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                <div className="bg-accent h-full" style={{ width: `${data.evaluation.percentage}%` }}></div>
              </div>
              <div className="text-right text-xs mt-1">{data.evaluation.percentage}% مكتمل</div>
            </div>
          </div>
        </div>

        <div className="p-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* About */}
            <section>
              <h3 className="text-2xl font-bold text-primary mb-4 font-amiri border-b-2 border-accent/20 pb-2">نبذة تعريفية</h3>
              <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap">{data.bio}</p>
            </section>

            {/* Experience */}
            <section>
              <h3 className="text-2xl font-bold text-primary mb-6 font-amiri border-b-2 border-accent/20 pb-2">الخبرة العملية</h3>
              <div className="space-y-8">
                {data.experience.map((exp, idx) => (
                  <div key={idx} className="relative pl-8 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-0.5 before:bg-gray-200">
                    <div className="absolute left-[-4px] top-2 w-2.5 h-2.5 rounded-full bg-accent"></div>
                    <h4 className="text-lg font-bold text-gray-800">{exp.position}</h4>
                    <div className="text-primary font-medium">{exp.company}</div>
                    <div className="text-sm text-gray-400 mb-2">{new Date(exp.from).getFullYear()} - {exp.to ? new Date(exp.to).getFullYear() : 'الحالي'}</div>
                    <p className="text-gray-600 text-sm">{exp.tasks}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Portfolio */}
            <section>
              <h3 className="text-2xl font-bold text-primary mb-6 font-amiri border-b-2 border-accent/20 pb-2">معرض الأعمال</h3>
              <div className="grid grid-cols-2 gap-4">
                {data.portfolio.map((item, idx) => (
                  <div key={idx} className="group relative rounded-xl overflow-hidden aspect-video bg-gray-100">
                    <img src={item.thumbnailUrl || item.fileUrl} className="w-full h-full object-cover" alt={item.title} />
                    <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                      <h5 className="text-white font-bold">{item.title}</h5>
                      <p className="text-white/70 text-xs line-clamp-1">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-10">
            {/* Strengths & Improvements */}
            <div className="space-y-6">
              <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                <h4 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                  <CheckCircle2 size={18} /> نقاط القوة
                </h4>
                <ul className="space-y-3">
                  {data.evaluation.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-green-700">
                      <strong>{s.title}:</strong> {s.description}
                    </li>
                  ))}
                </ul>
              </div>

              {data.evaluation.improvements.length > 0 && (
                <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-100">
                  <h4 className="font-bold text-yellow-800 mb-4 flex items-center gap-2">
                    <AlertCircle size={18} /> نصائح للتحسين
                  </h4>
                  <ul className="space-y-3">
                    {data.evaluation.improvements.map((s, i) => (
                      <li key={i} className="text-sm text-yellow-700">
                        <strong>{s.title}:</strong> {s.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Skills */}
            <section>
              <h4 className="font-bold text-primary mb-4 uppercase text-xs tracking-widest">المهارات</h4>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-secondary/30 text-primary rounded-full text-sm font-medium border border-primary/5">
                    {skill.name}
                  </span>
                ))}
              </div>
            </section>

            {/* Social Links */}
            <section>
              <h4 className="font-bold text-primary mb-4 uppercase text-xs tracking-widest">روابط التواصل</h4>
              <div className="space-y-3">
                {data.socialLinks.map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-gray-600 hover:text-accent transition-colors">
                    <ExternalLink size={16} />
                    <span className="capitalize">{link.platform}</span>
                  </a>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePreview;
