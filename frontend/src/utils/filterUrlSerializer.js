/**
 * Filter URL Serialization Utility
 * 
 * يوفر دوال لتحويل الفلاتر إلى URL parameters والعكس
 * يدعم جميع أنواع الفلاتر: نصوص، أرقام، مصفوفات، تواريخ
 */

/**
 * تحويل كائن الفلاتر إلى URL query string
 * @param {Object} filters - كائن الفلاتر
 * @returns {string} - URL query string
 */
export function serializeFiltersToURL(filters) {
  if (!filters || typeof filters !== 'object') {
    return '';
  }

  const params = new URLSearchParams();

  // معالجة كل نوع من الفلاتر
  Object.entries(filters).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      return; // تخطي القيم الفارغة
    }

    // معالجة المصفوفات
    if (Array.isArray(value)) {
      if (value.length > 0) {
        params.set(key, value.join(','));
      }
    }
    // معالجة الكائنات (مثل نطاق الراتب)
    else if (typeof value === 'object') {
      Object.entries(value).forEach(([subKey, subValue]) => {
        if (subValue !== null && subValue !== undefined && subValue !== '') {
          params.set(`${key}.${subKey}`, String(subValue));
        }
      });
    }
    // معالجة القيم البسيطة
    else {
      params.set(key, String(value));
    }
  });

  return params.toString();
}

/**
 * تحويل URL query string إلى كائن فلاتر
 * @param {string} queryString - URL query string
 * @returns {Object} - كائن الفلاتر
 */
export function deserializeFiltersFromURL(queryString) {
  if (!queryString || typeof queryString !== 'string') {
    return {};
  }

  // إزالة علامة الاستفهام إذا كانت موجودة
  const cleanQuery = queryString.startsWith('?') 
    ? queryString.substring(1) 
    : queryString;

  const params = new URLSearchParams(cleanQuery);
  const filters = {};

  params.forEach((value, key) => {
    // معالجة الكائنات المتداخلة (مثل salary.min)
    if (key.includes('.')) {
      const [parentKey, childKey] = key.split('.');
      
      if (!filters[parentKey]) {
        filters[parentKey] = {};
      }
      
      // تحويل إلى رقم إذا كان رقماً
      filters[parentKey][childKey] = isNumeric(value) 
        ? Number(value) 
        : value;
    }
    // معالجة المصفوفات (قيم مفصولة بفواصل أو قيمة واحدة)
    else if (value.includes(',')) {
      filters[key] = value.split(',').map(item => {
        const trimmed = item.trim();
        return isNumeric(trimmed) ? Number(trimmed) : trimmed;
      });
    }
    // معالجة المصفوفات ذات العنصر الواحد (بدون فواصل)
    // نفترض أن المفاتيح التي تنتهي بـ Type أو Level أو skills هي مصفوفات
    else if (key.endsWith('Type') || key.endsWith('Level') || key === 'skills' || key.endsWith('s')) {
      // تحويل إلى مصفوفة إذا كانت القيمة ليست رقماً
      if (!isNumeric(value)) {
        filters[key] = [value];
      } else {
        filters[key] = value;
      }
    }
    // معالجة القيم البسيطة
    else {
      filters[key] = isNumeric(value) ? Number(value) : value;
    }
  });

  return filters;
}

/**
 * تحديث URL بالفلاتر الحالية بدون إعادة تحميل الصفحة
 * @param {Object} filters - كائن الفلاتر
 * @param {boolean} replace - استخدام replaceState بدلاً من pushState
 */
export function updateURLWithFilters(filters, replace = false) {
  const queryString = serializeFiltersToURL(filters);
  const newURL = queryString 
    ? `${window.location.pathname}?${queryString}`
    : window.location.pathname;

  if (replace) {
    window.history.replaceState({ filters }, '', newURL);
  } else {
    window.history.pushState({ filters }, '', newURL);
  }
}

/**
 * الحصول على الفلاتر من URL الحالي
 * @returns {Object} - كائن الفلاتر
 */
export function getFiltersFromCurrentURL() {
  return deserializeFiltersFromURL(window.location.search);
}

/**
 * مسح جميع الفلاتر من URL
 * @param {boolean} replace - استخدام replaceState بدلاً من pushState
 */
export function clearFiltersFromURL(replace = true) {
  const newURL = window.location.pathname;
  
  if (replace) {
    window.history.replaceState({}, '', newURL);
  } else {
    window.history.pushState({}, '', newURL);
  }
}

/**
 * التحقق من أن القيمة رقمية
 * @param {string} value - القيمة المراد فحصها
 * @returns {boolean}
 */
function isNumeric(value) {
  return !isNaN(value) && !isNaN(parseFloat(value));
}

/**
 * إنشاء رابط قابل للمشاركة مع الفلاتر
 * @param {Object} filters - كائن الفلاتر
 * @param {string} basePath - المسار الأساسي (افتراضي: المسار الحالي)
 * @returns {string} - رابط كامل
 */
export function createShareableLink(filters, basePath = window.location.pathname) {
  const queryString = serializeFiltersToURL(filters);
  const baseURL = `${window.location.origin}${basePath}`;
  
  return queryString ? `${baseURL}?${queryString}` : baseURL;
}

/**
 * نسخ رابط قابل للمشاركة إلى الحافظة
 * @param {Object} filters - كائن الفلاتر
 * @returns {Promise<boolean>} - true إذا نجح النسخ
 */
export async function copyShareableLinkToClipboard(filters) {
  try {
    const link = createShareableLink(filters);
    await navigator.clipboard.writeText(link);
    return true;
  } catch (error) {
    console.error('Failed to copy link to clipboard:', error);
    return false;
  }
}

/**
 * مقارنة كائنين من الفلاتر للتحقق من التساوي
 * @param {Object} filters1 - الفلاتر الأولى
 * @param {Object} filters2 - الفلاتر الثانية
 * @returns {boolean}
 */
export function areFiltersEqual(filters1, filters2) {
  // تحويل إلى URLSearchParams للمقارنة بغض النظر عن الترتيب
  const params1 = new URLSearchParams(serializeFiltersToURL(filters1));
  const params2 = new URLSearchParams(serializeFiltersToURL(filters2));
  
  // فرز المفاتيح للمقارنة
  const keys1 = Array.from(params1.keys()).sort();
  const keys2 = Array.from(params2.keys()).sort();
  
  // التحقق من تطابق عدد المفاتيح
  if (keys1.length !== keys2.length) {
    return false;
  }
  
  // التحقق من تطابق المفاتيح
  if (keys1.join(',') !== keys2.join(',')) {
    return false;
  }
  
  // التحقق من تطابق القيم
  for (const key of keys1) {
    if (params1.get(key) !== params2.get(key)) {
      return false;
    }
  }
  
  return true;
}
