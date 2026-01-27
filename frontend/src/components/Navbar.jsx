import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslate } from '../hooks/useTranslate';

export const Navbar = () => {
  const { language, logout, audioEnabled, setAudioEnabled } = useAuth();
  const t = useTranslate();
  const navT = t.navbar;
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock notifications data
  const notifications = [
    { id: 1, type: 'application', message: t.new_job_application, time: '2h ago' },
    { id: 2, type: 'message', message: t.new_message_received, time: '1d ago' },
    { id: 3, type: 'system', message: t.profile_updated_successfully, time: '3d ago' }
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[5000] bg-white/80 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-gray-100 shadow-sm" dir="rtl">
        <div className="flex items-center gap-3">
           <img src="/logo.jpg" alt="Logo" className="w-10 h-10 rounded-full border-2 border-[#1A365D]" />
           <span className="font-black text-[#1A365D] italic text-xl">Careerak</span>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search Button */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 text-gray-600 hover:text-[#304B60] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-600 hover:text-[#304B60] transition-colors relative"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM15 7v5h5l-5 5v-5H9V7h6z" />
              </svg>
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-[#304B60]">{t('notifications')}</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div key={notification.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                        <p className="text-sm text-gray-800">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      {t('no_notifications')}
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-gray-200">
                  <button className="w-full text-[#304B60] hover:text-[#1e3a4d] font-medium">
                    {t('view_all_notifications')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={() => setShowSettings(true)}
          className="w-12 h-12 rounded-2xl bg-[#1A365D]/5 flex items-center justify-center text-2xl hover:bg-[#1A365D]/10 transition-all"
        >
          ⚙️
        </button>
      </nav>

      {/* لوحة التحكم الجانبية / المودال */}
      {showSettings && (
        <div className="fixed inset-0 z-[10000] bg-black/40 backdrop-blur-sm flex justify-end" onClick={() => setShowSettings(false)}>
          <div className="w-80 h-full bg-white shadow-2xl p-8 flex flex-col animate-slide-in-right" onClick={e => e.stopPropagation()} dir="rtl">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-black text-[#1A365D]">{navT.settings}</h3>
              <button onClick={() => setShowSettings(false)} className="text-2xl">✕</button>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto">
              {/* خيارات التحكم */}
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                <span className="font-bold text-sm text-[#1A365D]">{navT.music}</span>
                <input type="checkbox" checked={audioEnabled} onChange={() => setAudioEnabled(!audioEnabled)} className="w-6 h-6" />
              </div>

              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                <span className="font-bold text-sm text-[#1A365D]">{navT.voice}</span>
                <input type="checkbox" defaultChecked className="w-6 h-6" />
              </div>

              <button className="w-full p-4 bg-gray-50 rounded-2xl flex justify-between items-center hover:bg-gray-100 transition-all">
                <span className="font-bold text-sm text-[#1A365D]">{navT.notifications}</span>
                <span>🔔</span>
              </button>

              <button className="w-full p-4 bg-gray-50 rounded-2xl flex justify-between items-center hover:bg-gray-100 transition-all">
                <span className="font-bold text-sm text-[#1A365D]">{navT.changePass}</span>
                <span>🔑</span>
              </button>

              <hr className="border-gray-100" />

              <button onClick={logout} className="w-full p-4 bg-red-50 text-red-600 rounded-2xl font-black text-sm text-right flex justify-between items-center">
                <span>{navT.logout}</span>
                <span>🚪</span>
              </button>

              <button className="w-full p-4 bg-red-600 text-white rounded-2xl font-black text-sm text-right flex justify-between items-center shadow-lg shadow-red-200">
                <span>{navT.deleteAccount}</span>
                <span>⚠️</span>
              </button>
            </div>

            <div className="mt-auto">
               <button className="w-full py-5 bg-[#1A365D] text-white rounded-2xl font-black text-sm">
                  {navT.exit}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* شريط البحث */}
      {showSearch && (
        <div className="absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 p-4">
          <div className="max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.search_jobs_courses_users}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#304B60] focus:border-transparent"
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchQuery && (
              <div className="mt-4 space-y-2">
                {/* Mock search results */}
                <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <p className="font-medium text-[#304B60]">Software Developer</p>
                  <p className="text-sm text-gray-600">Job posting</p>
                </div>
                <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <p className="font-medium text-[#304B60]">React Course</p>
                  <p className="text-sm text-gray-600">Training course</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
