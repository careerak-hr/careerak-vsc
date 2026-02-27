/**
 * 🎯 Candidate Comparison Usage Example
 * مثال استخدام مقارنة المرشحين
 * 
 * Requirements: 3.4 (مقارنة جنباً إلى جنب - side-by-side)
 */

import React, { useState } from 'react';
import CandidateComparison from '../components/CandidateComparison/CandidateComparison';

const CandidateComparisonExample = () => {
  const [showComparison, setShowComparison] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [jobId, setJobId] = useState('');

  // مثال: قائمة المرشحين المتاحة
  const availableCandidates = [
    { id: '1', name: 'أحمد محمد', score: 85 },
    { id: '2', name: 'فاطمة علي', score: 78 },
    { id: '3', name: 'محمود حسن', score: 72 },
    { id: '4', name: 'سارة خالد', score: 68 },
    { id: '5', name: 'عمر يوسف', score: 65 }
  ];

  const handleCandidateSelect = (candidateId) => {
    if (selectedCandidates.includes(candidateId)) {
      setSelectedCandidates(selectedCandidates.filter(id => id !== candidateId));
    } else {
      if (selectedCandidates.length < 5) {
        setSelectedCandidates([...selectedCandidates, candidateId]);
      } else {
        alert('يمكنك مقارنة 5 مرشحين كحد أقصى');
      }
    }
  };

  const handleCompare = () => {
    if (selectedCandidates.length < 2) {
      alert('يجب اختيار مرشحين على الأقل للمقارنة');
      return;
    }
    
    if (!jobId) {
      alert('يجب تحديد الوظيفة');
      return;
    }
    
    setShowComparison(true);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>مثال مقارنة المرشحين</h1>
      
      {/* Job Selection */}
      <div style={{ marginBottom: '20px' }}>
        <label>
          <strong>الوظيفة:</strong>
          <input
            type="text"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            placeholder="أدخل معرف الوظيفة"
            style={{
              marginLeft: '10px',
              padding: '8px',
              borderRadius: '4px',
              border: '2px solid #D4816180'
            }}
          />
        </label>
      </div>

      {/* Candidate Selection */}
      <div style={{ marginBottom: '20px' }}>
        <h3>اختر المرشحين للمقارنة (2-5 مرشحين):</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
          {availableCandidates.map(candidate => (
            <div
              key={candidate.id}
              onClick={() => handleCandidateSelect(candidate.id)}
              style={{
                padding: '16px',
                border: `2px solid ${selectedCandidates.includes(candidate.id) ? '#4CAF50' : '#D4816180'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: selectedCandidates.includes(candidate.id) ? 'rgba(76, 175, 80, 0.1)' : 'white',
                transition: 'all 0.3s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{candidate.name}</strong>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    درجة التطابق: {candidate.score}%
                  </div>
                </div>
                {selectedCandidates.includes(candidate.id) && (
                  <span style={{ color: '#4CAF50', fontSize: '24px' }}>✓</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Count */}
      <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#E3DAD1', borderRadius: '8px' }}>
        <strong>المرشحون المختارون:</strong> {selectedCandidates.length} / 5
      </div>

      {/* Compare Button */}
      <button
        onClick={handleCompare}
        disabled={selectedCandidates.length < 2 || !jobId}
        style={{
          padding: '12px 32px',
          backgroundColor: selectedCandidates.length >= 2 && jobId ? '#304B60' : '#ccc',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: selectedCandidates.length >= 2 && jobId ? 'pointer' : 'not-allowed',
          transition: 'all 0.3s'
        }}
      >
        مقارنة المرشحين
      </button>

      {/* Comparison Modal */}
      {showComparison && (
        <CandidateComparison
          candidateIds={selectedCandidates}
          jobId={jobId}
          onClose={() => setShowComparison(false)}
        />
      )}

      {/* Usage Instructions */}
      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>كيفية الاستخدام:</h3>
        <ol>
          <li>أدخل معرف الوظيفة في الحقل أعلاه</li>
          <li>اختر من 2 إلى 5 مرشحين من القائمة</li>
          <li>اضغط على زر "مقارنة المرشحين"</li>
          <li>سيتم عرض مقارنة تفصيلية جنباً إلى جنب</li>
        </ol>

        <h3>الميزات:</h3>
        <ul>
          <li>مقارنة شاملة لجميع جوانب المرشحين</li>
          <li>درجات التطابق التفصيلية</li>
          <li>نقاط القوة والضعف لكل مرشح</li>
          <li>الفروقات الرئيسية بين المرشحين</li>
          <li>توصيات للتوظيف</li>
          <li>تحديد أفضل مرشح تلقائياً</li>
        </ul>

        <h3>API Endpoint:</h3>
        <pre style={{ backgroundColor: '#304B60', color: '#E3DAD1', padding: '12px', borderRadius: '4px', overflow: 'auto' }}>
{`POST /api/recommendations/candidates/compare

Body:
{
  "candidateIds": ["id1", "id2", "id3"],
  "jobId": "jobId"
}

Response:
{
  "success": true,
  "data": {
    "job": { ... },
    "candidatesCount": 3,
    "comparisonTable": { ... },
    "analysis": { ... }
  }
}`}
        </pre>
      </div>
    </div>
  );
};

export default CandidateComparisonExample;
