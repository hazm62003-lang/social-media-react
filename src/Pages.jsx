import { useEffect, useRef, useState } from 'react';
import { api, EP, uid, arr, ago } from './api';
import { useApp } from './ctx';
import Post, { Avatar } from './Post';

function Composer({ onDone }) {
  const { me, toast } = useApp();
  const [body, setBody] = useState('');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const preview = file ? URL.createObjectURL(file) : '';

  async function submit(e) {
    e.preventDefault();
    if (!body.trim() && !file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('body', body);
      if (file) fd.append('image', file);
      await api(EP.post, { method: 'POST', form: fd });
      toast('تم النشر');
      onDone();
    } catch (x) { toast(x.message); }
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="card mb-4 flex gap-3">
      <Avatar u={me} />
      <div className="flex-1">
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={2}
          placeholder={`بتفكر في إيه يا ${(me.name || '').split(' ')[0]}؟`}
          className="min-h-14 w-full resize-none bg-transparent outline-none" />
        {preview && <img src={preview} alt="" className="mt-2 max-h-56 rounded-xl" />}
        <div className="mt-1.5 flex items-center justify-between border-t border-line pt-2.5">
          <label className="cursor-pointer text-sm font-semibold text-brand">
            + صورة
            <input type="file" accept="image/*" hidden onChange={(e) => setFile(e.target.files[0] || null)} />
          </label>
          <button className="btn" disabled={busy}>انشر</button>
        </div>
      </div>
    </form>
  );
}

function PostList({ load, paged = true, emptyText }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [last, setLast] = useState(0);
  const [state, setState] = useState('load');

  useEffect(() => {
    let ok = true;
    setState('load');
    load(page)
      .then((ps) => {
        if (!ok) return;
        setItems((i) => (page === 1 ? ps : [...i, ...ps]));
        setLast(ps.length);
        setState('ok');
      })
      .catch((e) => ok && setState(e.message));
    return () => { ok = false; };
  }, [page]);

  if (state !== 'ok' && state !== 'load') return <p className="py-10 text-center text-mute">{state}</p>;
  return (
    <>
      {items.map((p) => (
        <Post key={uid(p)} p={p} onDelete={(id) => setItems((l) => l.filter((x) => uid(x) !== id))} />
      ))}
      {state === 'load' && <p className="py-6 text-center text-mute">...</p>}
      {state === 'ok' && !items.length && <p className="py-10 text-center text-mute">{emptyText}</p>}
      {state === 'ok' && paged && last >= 10 && (
        <button className="btn-ghost w-full" onClick={() => setPage((n) => n + 1)}>عرض المزيد</button>
      )}
    </>
  );
}

export function Feed({ kind }) {
  const [rev, setRev] = useState(0);
  if (kind === 'saved')
    return <PostList load={() => api(EP.saved).then(arr)} paged={false} emptyText="مفيش منشورات محفوظة. دوس «حفظ» على أي منشور." />;
  return (
    <>
      <Composer onDone={() => setRev((r) => r + 1)} />
      <PostList key={rev + kind} load={(p) => api(EP[kind](p)).then(arr)} emptyText="لسه مفيش منشورات. أول واحد عليك!" />
    </>
  );
}

export function Profile() {
  const { me, toast, reloadMe } = useApp();
  const ref = useRef();
  async function change(e) {
    const fd = new FormData();
    fd.append('photo', e.target.files[0]);
    try { await api(EP.photo, { method: 'PUT', form: fd }); toast('اتغيرت الصورة'); reloadMe(); }
    catch (x) { toast(x.message); }
  }
  return (
    <>
      <div className="card mb-4 flex items-center gap-5">
        <Avatar u={me} size={96} />
        <div className="leading-snug">
          <h2 className="text-xl font-bold">{me.name}</h2>
          <small className="text-mute">@{me.username}</small>
          <br />
          <button className="mt-1 text-sm font-semibold text-brand" onClick={() => ref.current.click()}>تغيير الصورة</button>
          <input ref={ref} type="file" accept="image/*" hidden onChange={change} />
        </div>
      </div>
      <PostList load={() => api(EP.userPosts(uid(me))).then(arr)} paged={false} emptyText="مفيش منشورات لسه." />
    </>
  );
}

export function Notifs() {
  const [list, setList] = useState(null);
  useEffect(() => { api(EP.notifs).then((d) => setList(arr(d))).catch((e) => setList(e.message)); }, []);
  if (list === null) return <p className="py-10 text-center text-mute">...</p>;
  if (typeof list === 'string') return <p className="py-10 text-center text-mute">{list}</p>;
  if (!list.length) return <p className="py-10 text-center text-mute">مفيش إشعارات جديدة.</p>;
  return list.map((n, i) => {
    const u = n.from || n.sender || n.user || {};
    return (
      <div key={n._id || i} className="card mb-2 flex items-center gap-2.5">
        <Avatar u={u} size={32} />
        <div>{n.message || n.text || n.type}<br /><small className="text-mute">{ago(n.createdAt)}</small></div>
      </div>
    );
  });
}

export function Suggestions() {
  const { toast } = useApp();
  const [users, setUsers] = useState([]);
  const [on, setOn] = useState({});
  useEffect(() => { api(EP.sugg).then((d) => setUsers(arr(d))).catch(() => {}); }, []);
  async function follow(id) {
    try { await api(EP.follow(id), { method: 'PUT' }); setOn((o) => ({ ...o, [id]: !o[id] })); }
    catch (x) { toast(x.message); }
  }
  return (
    <div className="card">
      <b>ناس ممكن تعرفهم</b>
      {!users.length && <p className="py-3 text-sm text-mute">لا اقتراحات حالياً</p>}
      {users.map((u) => (
        <div key={uid(u)} className="mt-3 flex items-center gap-2.5">
          <Avatar u={u} size={32} />
          <b className="min-w-0 flex-1 truncate leading-tight">{u.name}</b>
          <button onClick={() => follow(uid(u))}
            className={`rounded-full border px-3 text-[13px] font-semibold ${on[uid(u)] ? 'border-ink bg-ink text-white' : 'border-line text-brand'}`}>
            {on[uid(u)] ? 'بتتابعه' : 'متابعة'}
          </button>
        </div>
      ))}
    </div>
  );
}
