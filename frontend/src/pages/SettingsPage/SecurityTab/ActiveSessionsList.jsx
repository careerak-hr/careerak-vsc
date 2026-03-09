import React from 'react';
import SessionCard from './SessionCard';
import './ActiveSessionsList.css';

const ActiveSessionsList = ({ sessions, onLogout, language }) => {
    const translations = {
        ar: {
            noSessions: 'لا توجد جلسات نشطة',
            currentSession: 'الجلسة الحالية'
        },
        en: {
            noSessions: 'No active sessions',
            currentSession: 'Current Session'
        },
        fr: {
            noSessions: 'Aucune session active',
            currentSession: 'Session actuelle'
        }
    };

    const t = translations[language] || translations.en;

    if (!sessions || sessions.length === 0) {
        return (
            <div className="no-sessions">
                <p>{t.noSessions}</p>
            </div>
        );
    }

    return (
        <div className="active-sessions-list">
            {sessions.map((session) => (
                <SessionCard
                    key={session.id}
                    session={session}
                    onLogout={onLogout}
                    language={language}
                />
            ))}
        </div>
    );
};

export default ActiveSessionsList;
