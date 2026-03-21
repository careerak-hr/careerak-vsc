import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import './CalendarView.css';

const translations = {
  ar: {
    today: 'اليوم',
    month: 'شهر',
    week: 'أسبوع',
    day: 'يوم',
    prev: 'السابق',
    next: 'التالي',
    available: 'متاح',
    booked: 'محجوز',
    blocked: 'مغلق',
    past: 'منتهي',
    noSlots: 'لا توجد أوقات متاحة',
    loading: 'جاري التحميل...',
    error: 'حدث خطأ في تحميل البيانات',
    selectSlot: 'اختر وقتاً',
    days: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
    months: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
             'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  },
  en: {
    today: 'Today',
    month: 'Month',
    week: 'Week',
    day: 'Day',
    prev: 'Previous',
    next: 'Next',
    available: 'Available',
    booked: 'Booked',
    blocked: 'Blocked',
    past: 'Past',
    noSlots: 'No available slots',
    loading: 'Loading...',
    error: 'Error loading data',
    selectSlot: 'Select a slot',
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    months: ['January', 'February', 'March', 'April', 'May', 'June',
             'July', 'August', 'September', 'October', 'November', 'December'],
  },
  fr: {
    today: "Aujourd'hui",
    month: 'Mois',
    week: 'Semaine',
    day: 'Jour',
    prev: 'Précédent',
    next: 'Suivant',
    available: 'Disponible',
    booked: 'Réservé',
    blocked: 'Bloqué',
    past: 'Passé',
    noSlots: 'Aucun créneau disponible',
    loading: 'Chargement...',
    error: 'Erreur lors du chargement',
    selectSlot: 'Choisir un créneau',
    days: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
    months: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
             'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
  },
};

const API_BASE = import.meta.env.VITE_API_URL || '';

function formatTime(date) {
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

function isSameDay(a, b) {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate();
}

function isPast(date) {
  return new Date(date) < new Date();
}

function getSlotStatus(slot) {
  if (isPast(slot.startTime)) return 'past';
  return slot.status; // 'available' | 'booked' | 'blocked'
}

// --- Month View ---
function MonthView({ currentDate, slots, selectedSlot, onSlotSelect, onDayClick, t, isRTL }) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  return (
    <div className="cv-month-grid">
      {t.days.map((day) => (
        <div key={day} className="cv-day-header">{day}</div>
      ))}
      {cells.map((date, idx) => {
        if (!date) return <div key={`empty-${idx}`} className="cv-cell cv-cell--empty" />;

        const daySlots = slots.filter((s) => isSameDay(s.startTime, date));
        const hasAvailable = daySlots.some((s) => s.status === 'available' && !isPast(s.startTime));
        const hasBooked = daySlots.some((s) => s.status === 'booked');
        const isToday = isSameDay(date, today);
        const isSelected = selectedSlot && isSameDay(selectedSlot.startTime, date);
        const isClickable = daySlots.length > 0 && onDayClick;

        let cellClass = 'cv-cell';
        if (isToday) cellClass += ' cv-cell--today';
        if (isSelected) cellClass += ' cv-cell--selected';
        if (hasAvailable) cellClass += ' cv-cell--has-available';
        if (hasBooked && !hasAvailable) cellClass += ' cv-cell--has-booked';
        if (isClickable) cellClass += ' cv-cell--clickable';

        const handleClick = () => {
          if (isClickable) onDayClick(date);
        };

        const handleKeyDown = (e) => {
          if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onDayClick(date);
          }
        };

        return (
          <div
            key={date.toISOString()}
            className={cellClass}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : undefined}
            aria-label={isClickable ? `${date.getDate()} ${t.months[date.getMonth()]}` : undefined}
          >
            <span className="cv-cell-date">{date.getDate()}</span>
            <div className="cv-cell-dots">
              {hasAvailable && <span className="cv-dot cv-dot--available" title={t.available} />}
              {hasBooked && <span className="cv-dot cv-dot--booked" title={t.booked} />}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- Week View ---
function WeekView({ currentDate, slots, selectedSlot, onSlotSelect, t, isRTL }) {
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const today = new Date();

  return (
    <div className="cv-week-grid">
      {weekDays.map((date) => {
        const daySlots = slots.filter((s) => isSameDay(s.startTime, date));
        const isToday = isSameDay(date, today);

        return (
          <div key={date.toISOString()} className={`cv-week-col${isToday ? ' cv-week-col--today' : ''}`}>
            <div className="cv-week-day-header">
              <span className="cv-week-day-name">{t.days[date.getDay()]}</span>
              <span className="cv-week-day-num">{date.getDate()}</span>
            </div>
            <div className="cv-week-slots">
              {daySlots.length === 0 && (
                <div className="cv-no-slots">{t.noSlots}</div>
              )}
              {daySlots.map((slot) => (
                <SlotChip
                  key={slot.id}
                  slot={slot}
                  selected={selectedSlot?.id === slot.id}
                  onSelect={onSlotSelect}
                  t={t}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- Day View ---
function DayView({ currentDate, slots, selectedSlot, onSlotSelect, t }) {
  const daySlots = slots.filter((s) => isSameDay(s.startTime, currentDate));

  return (
    <div className="cv-day-view">
      {daySlots.length === 0 ? (
        <div className="cv-empty-state">{t.noSlots}</div>
      ) : (
        daySlots.map((slot) => (
          <SlotChip
            key={slot.id}
            slot={slot}
            selected={selectedSlot?.id === slot.id}
            onSelect={onSlotSelect}
            t={t}
            showDate
          />
        ))
      )}
    </div>
  );
}

// --- Slot Chip ---
function SlotChip({ slot, selected, onSelect, t, showDate }) {
  const status = getSlotStatus(slot);
  const isClickable = status === 'available';

  const handleClick = () => {
    if (isClickable) onSelect(slot);
  };

  return (
    <button
      className={`cv-slot cv-slot--${status}${selected ? ' cv-slot--selected' : ''}`}
      onClick={handleClick}
      disabled={!isClickable}
      aria-label={`${formatTime(slot.startTime)} - ${t[status] || status}`}
      aria-pressed={selected}
    >
      <span className="cv-slot-time">{formatTime(slot.startTime)}</span>
      {showDate && (
        <span className="cv-slot-end"> – {formatTime(slot.endTime)}</span>
      )}
      <span className="cv-slot-status">{t[status] || status}</span>
    </button>
  );
}

// --- Main Component ---
const CalendarView = ({
  companyId,
  onSlotSelect,
  viewMode: initialViewMode = 'week',
  userRole = 'jobseeker',
}) => {
  const { language } = useApp();
  const t = translations[language] || translations.ar;
  const isRTL = language === 'ar';

  const [viewMode, setViewMode] = useState(initialViewMode);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const fetchSlots = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const dateStr = currentDate.toISOString().split('T')[0];
      const month = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

      const [slotsRes, appointmentsRes] = await Promise.all([
        fetch(`${API_BASE}/api/availability/slots?companyId=${companyId}&date=${dateStr}`),
        fetch(`${API_BASE}/api/appointments?companyId=${companyId}&month=${month}`),
      ]);

      const slotsData = slotsRes.ok ? await slotsRes.json() : { slots: [] };
      const appointmentsData = appointmentsRes.ok ? await appointmentsRes.json() : { appointments: [] };

      // Merge: mark booked slots
      const bookedIds = new Set(
        (appointmentsData.appointments || []).map((a) => a.slotId).filter(Boolean)
      );

      const merged = (slotsData.slots || []).map((s) => ({
        ...s,
        status: bookedIds.has(s.id) ? 'booked' : s.status,
      }));

      setSlots(merged);
    } catch (err) {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  }, [companyId, currentDate, t.error]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const navigate = (direction) => {
    const d = new Date(currentDate);
    if (viewMode === 'month') d.setMonth(d.getMonth() + direction);
    else if (viewMode === 'week') d.setDate(d.getDate() + direction * 7);
    else d.setDate(d.getDate() + direction);
    setCurrentDate(d);
  };

  const goToday = () => setCurrentDate(new Date());

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    if (onSlotSelect) onSlotSelect(slot);
  };

  const handleDayClick = (date) => {
    setCurrentDate(date);
    setViewMode('day');
  };

  const headerTitle = () => {
    if (viewMode === 'month') {
      return `${t.months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
    if (viewMode === 'week') {
      const start = new Date(currentDate);
      start.setDate(currentDate.getDate() - currentDate.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return `${start.getDate()} ${t.months[start.getMonth()]} – ${end.getDate()} ${t.months[end.getMonth()]}`;
    }
    return `${currentDate.getDate()} ${t.months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  };

  return (
    <div className={`cv-root${isRTL ? ' cv-rtl' : ' cv-ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Toolbar */}
      <div className="cv-toolbar">
        <div className="cv-toolbar-nav">
          <button className="cv-btn cv-btn--ghost" onClick={() => navigate(-1)} aria-label={t.prev}>
            {isRTL ? '›' : '‹'}
          </button>
          <button className="cv-btn cv-btn--ghost cv-btn--today" onClick={goToday}>
            {t.today}
          </button>
          <button className="cv-btn cv-btn--ghost" onClick={() => navigate(1)} aria-label={t.next}>
            {isRTL ? '‹' : '›'}
          </button>
        </div>

        <h2 className="cv-title">{headerTitle()}</h2>

        <div className="cv-view-switcher">
          {['month', 'week', 'day'].map((v) => (
            <button
              key={v}
              className={`cv-btn cv-btn--view${viewMode === v ? ' cv-btn--active' : ''}`}
              onClick={() => setViewMode(v)}
            >
              {t[v]}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="cv-legend">
        <span className="cv-legend-item">
          <span className="cv-dot cv-dot--available" /> {t.available}
        </span>
        <span className="cv-legend-item">
          <span className="cv-dot cv-dot--booked" /> {t.booked}
        </span>
        <span className="cv-legend-item">
          <span className="cv-dot cv-dot--past" /> {t.past}
        </span>
      </div>

      {/* Content */}
      <div className="cv-body">
        {loading && <div className="cv-loading">{t.loading}</div>}
        {error && <div className="cv-error">{error}</div>}
        {!loading && !error && (
          <>
            {viewMode === 'month' && (
              <MonthView
                currentDate={currentDate}
                slots={slots}
                selectedSlot={selectedSlot}
                onSlotSelect={handleSlotSelect}
                onDayClick={handleDayClick}
                t={t}
                isRTL={isRTL}
              />
            )}
            {viewMode === 'week' && (
              <WeekView
                currentDate={currentDate}
                slots={slots}
                selectedSlot={selectedSlot}
                onSlotSelect={handleSlotSelect}
                t={t}
                isRTL={isRTL}
              />
            )}
            {viewMode === 'day' && (
              <DayView
                currentDate={currentDate}
                slots={slots}
                selectedSlot={selectedSlot}
                onSlotSelect={handleSlotSelect}
                t={t}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CalendarView;
