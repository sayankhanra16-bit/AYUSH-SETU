import { useEffect, useState } from 'react';
import { Search, Bell, Menu, Languages } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Navbar({ onMenuClick, searchValue, onSearchChange, searchPlaceholder }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'EN');
  const initials = user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  useEffect(() => { api.get('/notifications/mine').then((res) => setNotifications(res.data)).catch(() => {}); }, []);
  const openInbox = async () => {
    setOpenNotifications((value) => !value);
    if (notifications.some((item) => !item.read)) {
      await api.patch('/notifications/read').catch(() => {});
      setNotifications((items) => items.map((item) => ({ ...item, read: true })));
    }
  };
  const changeLanguage = (value) => { setLanguage(value); localStorage.setItem('language', value); document.documentElement.lang = value === 'HI' ? 'hi' : value === 'BN' ? 'bn' : 'en'; };

  return (
    <div className="flex items-center gap-3 bg-white border-b px-4 py-3 sticky top-0 z-10">
      <button onClick={onMenuClick} className="lg:hidden text-gray-500">
        <Menu size={22} />
      </button>

      {onSearchChange ? (
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder || 'Search...'}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
      ) : (
        <div className="flex-1" />
      )}

      <div className="hidden sm:flex items-center gap-1 text-gray-500"><Languages size={16} /><select aria-label="Language preference" value={language} onChange={(e) => changeLanguage(e.target.value)} className="bg-transparent text-xs border-0 focus:ring-0"><option value="EN">English</option><option value="HI">हिन्दी</option><option value="BN">বাংলা</option></select></div>
      <div className="relative">
      <button onClick={openInbox} className="relative text-gray-500 hover:text-navy" aria-label="Open notifications">
        <Bell size={20} />
        {notifications.some((item) => !item.read) && <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full" />}
      </button>
      {openNotifications && <div className="absolute right-0 top-9 w-80 max-h-96 overflow-auto rounded-xl border bg-white shadow-xl p-3 z-30"><p className="font-semibold text-navy px-1 pb-2">Notifications</p>{notifications.length ? notifications.map((item) => <div key={item._id} className="border-t py-2.5 text-sm text-gray-600"><p>{item.message}</p><span className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleString()}</span></div>) : <p className="text-sm text-gray-500 px-1 py-3">No notifications yet.</p>}</div>}
      </div>

      <div className="w-8 h-8 rounded-full bg-brand text-white text-xs font-semibold flex items-center justify-center">
        {initials}
      </div>
    </div>
  );
}
