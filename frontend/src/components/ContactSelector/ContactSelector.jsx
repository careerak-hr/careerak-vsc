import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaTimes, FaUser, FaBuilding, FaPaperPlane } from 'react-icons/fa';
import { useApp } from '../../context/AppContext';
import './ContactSelector.css';

const translations = {
  ar: {
    title: 'مشاركة عبر المحادثة',
    search: 'ابحث عن جهة اتصال...',
    noContacts: 'لا توجد محادثات حديثة',
    send: 'إرسال',
    sending: 'جارٍ الإرسال...',
    sent: 'تم الإرسال!',
    error: 'فشل الإرسال، حاول مجدداً',
    selectContact: 'اختر جهة اتصال',
    recentChats: 'المحادثات الأخيرة',
    loading: 'جارٍ التحميل...',
  },
  en: {
    title: 'Share via Chat',
    search: 'Search contacts...',
    noContacts: 'No recent conversations',
    send: 'Send',
    sending: 'Sending...',
    sent: 'Sent!',
    error: 'Failed to send, try again',
    selectContact: 'Select a contact',
    recentChats: 'Recent Chats',
    loading: 'Loading...',
  },
  fr: {
    title: 'Partager via Chat',
    search: 'Rechercher un contact...',
    noContacts: 'Aucune conversation récente',
    send: 'Envoyer',
    sending: 'Envoi...',
    sent: 'Envoyé !',
    error: "Échec de l'envoi, réessayez",
    selectContact: 'Sélectionner un contact',
    recentChats: 'Discussions récentes',
    loading: 'Chargement...',
  },
};

const ContactSelector = ({ content, contentType, onClose, onSent }) => {
  const { language, token } = useApp();
  const t = translations[language] || translations.ar;
  const isRTL = language === 'ar';

  const [contacts, setContacts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  // Fetch recent conversations
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/chat/conversations?limit=30`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        const conversations = data.conversations || data.data || [];
        setContacts(conversations);
        setFiltered(conversations);
      } catch {
        setContacts([]);
        setFiltered([]);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchContacts();
    else setLoading(false);
  }, [token]);

  // Filter contacts by search
  useEffect(() => {
    if (!search.trim()) {
      setFiltered(contacts);
      return;
    }
    const q = search.toLowerCase();
    setFiltered(
      contacts.filter((c) => {
        const name = getContactName(c).toLowerCase();
        return name.includes(q);
      })
    );
  }, [search, contacts]);

  const getContactName = useCallback((conversation) => {
    const other = conversation.otherParticipant || conversation.participants?.[0];
    if (!other) return '';
    const user = other.user || other;
    return (
      user.firstName
        ? `${user.firstName} ${user.lastName || ''}`.trim()
        : user.companyName || user.name || user.username || ''
    );
  }, []);

  const getContactAvatar = useCallback((conversation) => {
    const other = conversation.otherParticipant || conversation.participants?.[0];
    if (!other) return null;
    const user = other.user || other;
    return user.profilePicture || user.logo || null;
  }, []);

  const isCompany = useCallback((conversation) => {
    const other = conversation.otherParticipant || conversation.participants?.[0];
    if (!other) return false;
    const user = other.user || other;
    return !!user.companyName;
  }, []);

  const handleSend = async () => {
    if (!selected) return;
    setSending(true);
    setError('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const contentId = content._id || content.id;
      const contentTitle =
        content.title || content.name || content.firstName || '';

      // Build share URL
      const paths = { job: 'job-postings', course: 'courses', profile: 'profile', company: 'companies' };
      const shareUrl = `https://careerak.com/${paths[contentType] || contentType}/${contentId}`;

      // Send message with shared_content type
      const res = await fetch(`${apiUrl}/api/chat/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversationId: selected._id,
          type: 'shared_content',
          content: shareUrl,
          sharedContent: {
            contentType,
            contentId,
            title: contentTitle,
            url: shareUrl,
          },
        }),
      });

      if (!res.ok) throw new Error('Send failed');

      // Record share event
      fetch(`${apiUrl}/api/shares`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ contentType, contentId, shareMethod: 'internal_chat' }),
      }).catch(() => {});

      setSent(true);
      setTimeout(() => {
        onSent?.();
        onClose?.();
      }, 1200);
    } catch {
      setError(t.error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="contact-selector" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="contact-selector-header">
        <h4 className="contact-selector-title">{t.title}</h4>
        <button className="contact-selector-close" onClick={onClose} aria-label="إغلاق">
          <FaTimes />
        </button>
      </div>

      {/* Search */}
      <div className="contact-selector-search">
        <FaSearch className="contact-selector-search-icon" />
        <input
          type="text"
          className="contact-selector-search-input"
          placeholder={t.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Contact List */}
      <div className="contact-selector-list">
        {loading ? (
          <p className="contact-selector-empty">{t.loading}</p>
        ) : filtered.length === 0 ? (
          <p className="contact-selector-empty">{t.noContacts}</p>
        ) : (
          filtered.map((conv) => {
            const name = getContactName(conv);
            const avatar = getContactAvatar(conv);
            const company = isCompany(conv);
            const isSelected = selected?._id === conv._id;

            return (
              <button
                key={conv._id}
                className={`contact-item ${isSelected ? 'contact-item-selected' : ''}`}
                onClick={() => setSelected(isSelected ? null : conv)}
              >
                <div className="contact-item-avatar">
                  {avatar ? (
                    <img src={avatar} alt={name} />
                  ) : company ? (
                    <FaBuilding />
                  ) : (
                    <FaUser />
                  )}
                </div>
                <div className="contact-item-info">
                  <span className="contact-item-name">{name}</span>
                  {conv.lastMessage?.content && (
                    <span className="contact-item-last">
                      {conv.lastMessage.content.slice(0, 40)}
                    </span>
                  )}
                </div>
                {isSelected && <div className="contact-item-check">✓</div>}
              </button>
            );
          })
        )}
      </div>

      {/* Error */}
      {error && <p className="contact-selector-error">{error}</p>}

      {/* Send Button */}
      <button
        className="contact-selector-send"
        onClick={handleSend}
        disabled={!selected || sending || sent}
      >
        {sent ? (
          t.sent
        ) : sending ? (
          t.sending
        ) : (
          <>
            <FaPaperPlane />
            <span>{t.send}</span>
          </>
        )}
      </button>
    </div>
  );
};

export default ContactSelector;
