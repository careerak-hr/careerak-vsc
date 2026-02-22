import React from 'react';
import { useApp } from '../context/AppContext';

/**
 * Hover Effects Demo
 * 
 * Demonstrates all hover effects implemented for FR-ANIM-4
 * Task: 4.5.1 - Add hover animations to buttons (scale, color)
 * 
 * Features demonstrated:
 * - Link hover effects (color transitions)
 * - Card hover effects (lift and shadow)
 * - Button hover effects (scale and color)
 * - Icon hover effects (scale and rotate)
 * - Input hover effects (border and shadow)
 * - Badge hover effects (scale and color)
 * - Image hover effects (zoom and brightness)
 * 
 * All effects:
 * - Use smooth transitions (200-300ms)
 * - Respect prefers-reduced-motion
 * - Support dark mode
 * - Are GPU-accelerated
 */
const HoverEffectsDemo = () => {
  const { language } = useApp();

  const content = {
    ar: {
      title: 'عرض تأثيرات التمرير',
      subtitle: 'مرر الماوس فوق العناصر لرؤية التأثيرات',
      links: 'الروابط',
      linkExample: 'مرر فوق هذا الرابط',
      cards: 'البطاقات',
      cardTitle: 'بطاقة تفاعلية',
      cardDescription: 'مرر فوق هذه البطاقة لرؤية تأثير الرفع',
      buttons: 'الأزرار',
      primaryBtn: 'زر أساسي',
      secondaryBtn: 'زر ثانوي',
      iconBtn: '🔔',
      icons: 'الأيقونات',
      inputs: 'حقول الإدخال',
      inputPlaceholder: 'مرر فوق هذا الحقل',
      badges: 'الشارات',
      badgeNew: 'جديد',
      badgeHot: 'ساخن',
      images: 'الصور',
      imageAlt: 'صورة تفاعلية',
      tabs: 'التبويبات',
      tab1: 'التبويب 1',
      tab2: 'التبويب 2',
      tab3: 'التبويب 3',
      note: 'ملاحظة: جميع التأثيرات تحترم إعداد prefers-reduced-motion'
    },
    en: {
      title: 'Hover Effects Demo',
      subtitle: 'Hover over elements to see the effects',
      links: 'Links',
      linkExample: 'Hover over this link',
      cards: 'Cards',
      cardTitle: 'Interactive Card',
      cardDescription: 'Hover over this card to see the lift effect',
      buttons: 'Buttons',
      primaryBtn: 'Primary Button',
      secondaryBtn: 'Secondary Button',
      iconBtn: '🔔',
      icons: 'Icons',
      inputs: 'Input Fields',
      inputPlaceholder: 'Hover over this field',
      badges: 'Badges',
      badgeNew: 'New',
      badgeHot: 'Hot',
      images: 'Images',
      imageAlt: 'Interactive image',
      tabs: 'Tabs',
      tab1: 'Tab 1',
      tab2: 'Tab 2',
      tab3: 'Tab 3',
      note: 'Note: All effects respect prefers-reduced-motion setting'
    },
    fr: {
      title: 'Démo des Effets de Survol',
      subtitle: 'Survolez les éléments pour voir les effets',
      links: 'Liens',
      linkExample: 'Survolez ce lien',
      cards: 'Cartes',
      cardTitle: 'Carte Interactive',
      cardDescription: 'Survolez cette carte pour voir l\'effet de levée',
      buttons: 'Boutons',
      primaryBtn: 'Bouton Principal',
      secondaryBtn: 'Bouton Secondaire',
      iconBtn: '🔔',
      icons: 'Icônes',
      inputs: 'Champs de Saisie',
      inputPlaceholder: 'Survolez ce champ',
      badges: 'Badges',
      badgeNew: 'Nouveau',
      badgeHot: 'Chaud',
      images: 'Images',
      imageAlt: 'Image interactive',
      tabs: 'Onglets',
      tab1: 'Onglet 1',
      tab2: 'Onglet 2',
      tab3: 'Onglet 3',
      note: 'Note: Tous les effets respectent le paramètre prefers-reduced-motion'
    }
  };

  const t = content[language] || content.ar;

  return (
    <div className="min-h-screen bg-[#E3DAD1] dark:bg-[#1a1a1a] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#304B60] dark:text-[#e0e0e0] mb-4">
            {t.title}
          </h1>
          <p className="text-lg text-[#304B60]/70 dark:text-[#e0e0e0]/70">
            {t.subtitle}
          </p>
        </div>

        {/* Links Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#304B60] dark:text-[#e0e0e0] mb-4">
            {t.links}
          </h2>
          <div className="space-y-4">
            <a href="#" className="text-[#D48161] hover:text-[#C26F50] transition-colors">
              {t.linkExample}
            </a>
            <br />
            <a href="#" className="nav-link text-[#304B60] dark:text-[#e0e0e0]">
              Navigation Link
            </a>
          </div>
        </section>

        {/* Cards Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#304B60] dark:text-[#e0e0e0] mb-4">
            {t.cards}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card bg-white dark:bg-[#2d2d2d] p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-[#304B60] dark:text-[#e0e0e0] mb-2">
                {t.cardTitle} 1
              </h3>
              <p className="text-[#304B60]/70 dark:text-[#e0e0e0]/70">
                {t.cardDescription}
              </p>
            </div>
            <div className="job-card bg-white dark:bg-[#2d2d2d] p-6 rounded-lg shadow-md border border-[#304B60]/10">
              <h3 className="text-xl font-bold text-[#304B60] dark:text-[#e0e0e0] mb-2">
                Job Card
              </h3>
              <p className="text-[#304B60]/70 dark:text-[#e0e0e0]/70">
                Hover for enhanced effect
              </p>
            </div>
            <div className="course-card bg-white dark:bg-[#2d2d2d] p-6 rounded-lg shadow-md border border-[#304B60]/10">
              <h3 className="text-xl font-bold text-[#304B60] dark:text-[#e0e0e0] mb-2">
                Course Card
              </h3>
              <p className="text-[#304B60]/70 dark:text-[#e0e0e0]/70">
                Hover for enhanced effect
              </p>
            </div>
          </div>
        </section>

        {/* Buttons Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#304B60] dark:text-[#e0e0e0] mb-4">
            {t.buttons}
          </h2>
          <div className="flex flex-wrap gap-4">
            <button className="px-6 py-3 bg-[#D48161] text-white rounded-lg">
              {t.primaryBtn}
            </button>
            <button className="px-6 py-3 bg-[#E3DAD1] dark:bg-[#2d2d2d] text-[#304B60] dark:text-[#e0e0e0] rounded-lg border border-[#304B60]/20">
              {t.secondaryBtn}
            </button>
            <button className="icon-btn p-3 bg-[#D48161] text-white rounded-full text-2xl">
              {t.iconBtn}
            </button>
          </div>
        </section>

        {/* Icons Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#304B60] dark:text-[#e0e0e0] mb-4">
            {t.icons}
          </h2>
          <div className="flex gap-6">
            <span className="icon-interactive text-4xl cursor-pointer">🏠</span>
            <span className="icon-interactive text-4xl cursor-pointer">⚙️</span>
            <span className="icon-interactive text-4xl cursor-pointer">📧</span>
            <span className="icon-interactive text-4xl cursor-pointer">🔍</span>
          </div>
        </section>

        {/* Inputs Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#304B60] dark:text-[#e0e0e0] mb-4">
            {t.inputs}
          </h2>
          <div className="space-y-4 max-w-md">
            <input
              type="text"
              placeholder={t.inputPlaceholder}
              className="w-full px-4 py-3 rounded-lg border-2 border-[#D4816180] bg-[#E8DFD6] dark:bg-[#2d2d2d] text-[#304B60] dark:text-[#e0e0e0]"
            />
            <select className="w-full px-4 py-3 rounded-lg border-2 border-[#D4816180] bg-[#E8DFD6] dark:bg-[#2d2d2d] text-[#304B60] dark:text-[#e0e0e0]">
              <option>Option 1</option>
              <option>Option 2</option>
              <option>Option 3</option>
            </select>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-5 h-5" />
                <span className="text-[#304B60] dark:text-[#e0e0e0]">Checkbox</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="demo" className="w-5 h-5" />
                <span className="text-[#304B60] dark:text-[#e0e0e0]">Radio</span>
              </label>
            </div>
          </div>
        </section>

        {/* Badges Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#304B60] dark:text-[#e0e0e0] mb-4">
            {t.badges}
          </h2>
          <div className="flex gap-4">
            <span className="badge px-4 py-2 bg-[#D48161] text-white rounded-full cursor-pointer">
              {t.badgeNew}
            </span>
            <span className="badge px-4 py-2 bg-[#304B60] text-white rounded-full cursor-pointer">
              {t.badgeHot}
            </span>
          </div>
        </section>

        {/* Images Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#304B60] dark:text-[#e0e0e0] mb-4">
            {t.images}
          </h2>
          <div className="flex gap-6">
            <div className="avatar w-24 h-24 rounded-full bg-[#D48161] cursor-pointer"></div>
            <div className="thumbnail w-32 h-32 rounded-lg bg-[#304B60] cursor-pointer"></div>
          </div>
        </section>

        {/* Tabs Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#304B60] dark:text-[#e0e0e0] mb-4">
            {t.tabs}
          </h2>
          <div className="flex gap-2">
            <button className="tab px-6 py-3 bg-[#E3DAD1] dark:bg-[#2d2d2d] text-[#304B60] dark:text-[#e0e0e0] rounded-t-lg">
              {t.tab1}
            </button>
            <button className="tab px-6 py-3 bg-[#E3DAD1] dark:bg-[#2d2d2d] text-[#304B60] dark:text-[#e0e0e0] rounded-t-lg">
              {t.tab2}
            </button>
            <button className="tab px-6 py-3 bg-[#E3DAD1] dark:bg-[#2d2d2d] text-[#304B60] dark:text-[#e0e0e0] rounded-t-lg">
              {t.tab3}
            </button>
          </div>
        </section>

        {/* Note */}
        <div className="mt-12 p-6 bg-[#E8DFD6] dark:bg-[#2d2d2d] rounded-lg border-l-4 border-[#D48161]">
          <p className="text-[#304B60] dark:text-[#e0e0e0]">
            ℹ️ {t.note}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HoverEffectsDemo;
