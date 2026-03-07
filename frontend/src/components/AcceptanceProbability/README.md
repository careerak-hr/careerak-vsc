# Acceptance Probability Component

مكون لعرض احتمالية قبول المرشح للوظيفة.

## الاستخدام

### عرض كامل (Full)
```jsx
import AcceptanceProbability from './AcceptanceProbability';

<AcceptanceProbability
  probability={75}
  level="high"
  factors={[
    "تطابق ممتاز مع متطلبات الوظيفة",
    "لديك معظم المهارات المطلوبة",
    "خبرتك مناسبة للوظيفة"
  ]}
  matchScore={82}
  details={{
    competition: 90,
    experience: 85,
    skills: 88,
    education: 100
  }}
  compact={false}
/>
```

### عرض مضغوط (Compact)
```jsx
<AcceptanceProbability
  probability={75}
  level="high"
  compact={true}
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `probability` | number | ✅ | - | النسبة المئوية (0-100) |
| `level` | string | ✅ | - | المستوى (high, medium, low) |
| `factors` | array | ❌ | [] | العوامل المؤثرة |
| `matchScore` | number | ❌ | - | نسبة التطابق |
| `details` | object | ❌ | {} | التفاصيل |
| `compact` | boolean | ❌ | false | عرض مضغوط أو كامل |

## المستويات

- **high** (70%+): 🟢 أخضر - فرصة ممتازة
- **medium** (40-70%): 🟡 برتقالي - فرصة جيدة
- **low** (< 40%): 🔴 أحمر - فرصة محدودة

## الميزات

- ✅ عرضان (كامل ومضغوط)
- ✅ ألوان واضحة حسب المستوى
- ✅ شرح العوامل المؤثرة
- ✅ نصائح للتحسين
- ✅ RTL/LTR Support
- ✅ Dark Mode Support
- ✅ Responsive Design

## مع Hooks

```jsx
import { useAcceptanceProbability } from '../../hooks/useAcceptanceProbability';

function JobCard({ jobId }) {
  const { probability, loading } = useAcceptanceProbability(jobId);

  if (loading) return <div>جاري التحميل...</div>;

  return (
    <AcceptanceProbability
      probability={probability.probability}
      level={probability.level}
      compact={true}
    />
  );
}
```

## التوثيق الكامل

راجع:
- `docs/ACCEPTANCE_PROBABILITY_IMPLEMENTATION.md`
- `docs/ACCEPTANCE_PROBABILITY_QUICK_START.md`
- `frontend/src/examples/AcceptanceProbabilityExample.jsx`
