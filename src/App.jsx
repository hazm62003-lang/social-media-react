import { useCallback, useEffect, useState } from 'react';
import { api, EP, arr, getToken, setToken } from './api';
import { AppCtx } from './ctx';
import Auth from './Auth';
import { Feed, Profile, Notifs, Suggestions } from './Pages';

const NAV = [['feed', 'الرئيسية'], ['all', 'كل المنشورات'], ['saved', 'المحفوظات'], ['notif', 'الإشعارات'], ['me', 'حسابي']];

export default function App() {
  const [token, setTok] = useState(getToken());
  const [me, setMe] = useState(null);
  const [view, setView] = useState('feed');
  const [msg, setMsg] = useState('');
  const [unread, setUnread] = useState(0);

  const toast = useCallback((m) => { setMsg(m); setTimeout(() => setMsg(''), 2600); }, []);
  const logout = useCallback(() => { setToken(null); setTok(null); setMe(null); }, []);
  const reloadMe = useCallback(
    () => api(EP.me).then((d) => setMe(d.data?.user || d.data || {})).catch(logout),
    [logout]
  );

  useEffect(() => {
    if (token) reloadMe();
    window.addEventListener('unauth', logout);
    return () => window.removeEventListener('unauth', logout);
  }, [token, reloadMe, logout]);

  useEffect(() => {
    if (me) api(EP.notifs).then((d) => setUnread(arr(d).filter((n) => !(n.isRead ?? n.read)).length)).catch(() => {});
  }, [me]);

  if (!token) return <Auth onLogin={(t) => { setToken(t); setTok(t); }} />;
  if (!me) return <div className="grid min-h-screen place-items-center text-mute">...</div>;

  const page = { feed: <Feed kind="feed" />, all: <Feed kind="all" />, saved: <Feed kind="saved" />, notif: <Notifs />, me: <Profile /> }[view];
  const item = (on) => `flex flex-col items-center gap-0 rounded-lg px-3 py-2 text-xs font-medium md:flex-row md:text-base ${on ? 'bg-ink text-white' : 'hover:bg-slate-200'}`;

  return (
    <AppCtx.Provider value={{ me, toast, reloadMe }}>
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-line bg-white px-5">
        <span className="text-2xl font-bold text-brand">لمّة</span>
        <span className="text-mute">{me.name}</span>
      </header>
      <div className="mx-auto my-5 grid max-w-6xl items-start gap-5 px-4 pb-20 md:grid-cols-[190px_1fr] md:pb-0 lg:grid-cols-[190px_1fr_270px]">
        <nav className="fixed inset-x-0 bottom-0 z-10 flex justify-around border-t border-line bg-white p-1 md:sticky md:top-20 md:flex-col md:justify-start md:border-0 md:bg-transparent md:p-0">
          {NAV.map(([k, t]) => (
            <button key={k} className={item(view === k)} onClick={() => setView(k)}>
              {t}
              {k === 'notif' && unread > 0 && <span className="ms-1 rounded-full bg-danger px-1.5 text-[11px] text-white md:ms-auto">{unread}</span>}
            </button>
          ))}
          <button className={item(false)} onClick={logout}>خروج</button>
        </nav>
        <main className="min-w-0">{page}</main>
        <aside className="hidden lg:block"><Suggestions /></aside>
      </div>
      {msg && <div className="fixed bottom-24 left-1/2 z-20 -translate-x-1/2 rounded-lg bg-ink px-5 py-2.5 text-white md:bottom-5">{msg}</div>}
    </AppCtx.Provider>
  );
}
