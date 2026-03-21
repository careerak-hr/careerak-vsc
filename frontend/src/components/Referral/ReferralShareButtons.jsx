import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import './ReferralShareButtons.css';

const translations = {
  ar: {
    title: 'مشاركة رابط الإحالة',
    whatsapp: 'مشاركة عبر واتساب',
    email: 'مشاركة عبر البريد',
    copy: 'نسخ الرابط',
    copied: 'تم النسخ!',
    whatsappMessage: 'انضم إلى كاريرك باستخدام رابط الإحالة الخاص بي',
    emailSubject: 'دعوة للانضمام إلى كاريرك',
    emailBody: 'مرحباً،\n\nأدعوك للانضمام إلى منصة كاريرك لفرص العمل والتطوير المهني.\n\nاستخدم رابط الإحالة الخاص بي:\n',
  },
  en: {
    title: 'Share Referral Link',
    whatsapp: 'Share via WhatsApp',
    email: 'Share via Email',
    copy: 'Copy Link',
    copied: 'Copied!',
    whatsappMessage: 'Join Careerak using my referral link',
    emailSubject: 'Invitation to join Careerak',
    emailBody: 'Hello,\n\nI invite you to join Careerak for job opportunities and professional development.\n\nUse my referral link:\n',
  },
  fr: {
    title: 'Partager le lien de parrainage',
    whatsapp: 'Partager via WhatsApp',
    email: 'Partager par email',
    copy: 'Copier le lien',
    copied: 'Copié!',
    whatsappMessage: 'Rejoignez Careerak avec mon lien de parrainage',
    emailSubject: 'Invitation à rejoindre Careerak',
    emailBody: 'Bonjour,\n\nJe vous invite à rejoindre Careerak pour des opportunités d\'emploi et le développement professionnel.\n\nUtilisez mon lien de parrainage:\n',
  },
};

const ReferralShareButtons = ({ referralCode, referralLink }) => {
  const { language } = useApp();
  const [copied, setCopied] = useState(false);

  const t = translations[language] || translations.ar;
  const isRTL = language === 'ar';

  const link = referralLink || (referralCode ? `https://careerak.com/join?ref=${referralCode}` : '');

  const handleWhatsApp = () => {
    const message = encodeURIComponent(`${t.whatsappMessage}: ${link}`);
    window.open(`https://wa.me/?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(t.emailSubject);
    const body = encodeURIComponent(`${t.emailBody}${link}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleCopy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = link;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="referral-share-buttons" dir={isRTL ? 'rtl' : 'ltr'}>
      <p className="referral-share-title">{t.title}</p>
      <div className="referral-share-actions">
        <button
          className="referral-share-btn referral-share-btn--whatsapp"
          onClick={handleWhatsApp}
          aria-label={t.whatsapp}
          title={t.whatsapp}
          disabled={!link}
        >
          <svg className="referral-share-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span>{t.whatsapp}</span>
        </button>

        <button
          className="referral-share-btn referral-share-btn--email"
          onClick={handleEmail}
          aria-label={t.email}
          title={t.email}
          disabled={!link}
        >
          <svg className="referral-share-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          <span>{t.email}</span>
        </button>

        <button
          className={`referral-share-btn referral-share-btn--copy${copied ? ' referral-share-btn--copied' : ''}`}
          onClick={handleCopy}
          aria-label={copied ? t.copied : t.copy}
          title={copied ? t.copied : t.copy}
          disabled={!link}
        >
          {copied ? (
            <svg className="referral-share-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ) : (
            <svg className="referral-share-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
          )}
          <span>{copied ? t.copied : t.copy}</span>
        </button>
      </div>
    </div>
  );
};

export default ReferralShareButtons;
