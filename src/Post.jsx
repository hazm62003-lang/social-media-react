import { useEffect, useState } from 'react';
import { api, EP, uid, url, arr, ago } from './api';
import { useApp } from './ctx';

export function Avatar({ u, size = 42 }) {
  const p = url(u?.photo);
  const s = { width: size, height: size };
  return p ? (
    <img src={p} alt="" style={s} className="shrink-0 rounded-full object-cover" />
  ) : (
    <span style={s} className="grid shrink-0 place-items-center rounded-full bg-brand font-bold text-white">
      {(u?.name || u?.username || '?')[0]}
    </span>
  );
}

function Comments({ id }) {
  const { toast } = useApp();
  const [list, setList] = useState(null);
  const [text, setText] = useState('');
  const load = () => api(EP.comments(id)).then((d) => setList(arr(d))).catch((e) => setList(e.message));
  useEffect(() => { load(); }, [id]);

  async function send(e) {
    e.preventDefault();
    try {
      await api(EP.comments(id), { method: 'POST', json: { content: text } });
      setText('');
      load();
    } catch (x) { toast(x.message); }
  }
  if (list === null) return <p className="py-2 text-center text-mute">...</p>;
  if (typeof list === 'string') return <p className="py-2 text-center text-mute">{list}</p>;
  return (
    <div className="mt-2 border-t border-line pt-3">
      {list.map((c, i) => {
        const u = c.user || c.author || c.createdBy || {};
        return (
          <div key={c._id || i} className="mb-2.5 flex gap-2">
            <Avatar u={u} size={32} />
            <div className="rounded-xl bg-soft px-3 py-1.5">
              <b className="block text-[13px]">{u.name || 'مستخدم'}</b>
              {c.content || c.body || c.text}
            </div>
          </div>
        );
      })}
      <form onSubmit={send} className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} required placeholder="اكتب تعليق..."
          className="flex-1 rounded-full border border-line px-3 py-2" />
        <button className="btn">ارسل</button>
      </form>
    </div>
  );
}

export default function Post({ p, onDelete }) {
  const { me, toast } = useApp();
  const a = p.user || p.author || p.createdBy || {};
  const id = uid(p);
  const img = url(p.image);
  const myId = uid(me);
  const [liked, setLiked] = useState(!!(p.isLiked ?? p.liked ?? (Array.isArray(p.likes) && p.likes.some((l) => (l._id || l) === myId))));
  const [likes, setLikes] = useState(p.likesCount ?? (p.likes || []).length);
  const [saved, setSaved] = useState(!!(p.isBookmarked ?? p.bookmarked ?? (Array.isArray(p.bookmarks) && p.bookmarks.includes(myId))));
  const [open, setOpen] = useState(false);
  const cm = p.commentsCount ?? (p.comments || []).length;

  const run = (fn) => async () => { try { await fn(); } catch (x) { toast(x.message); } };
  const like = run(async () => {
    await api(EP.like(id), { method: 'PUT' });
    setLikes((n) => Math.max(0, n + (liked ? -1 : 1)));
    setLiked(!liked);
  });
  const mark = run(async () => {
    await api(EP.mark(id), { method: 'PUT' });
    setSaved(!saved);
    toast(saved ? 'اتشال من المحفوظات' : 'اتحفظ');
  });
  const share = run(async () => { await api(EP.share(id), { method: 'POST' }); toast('تمت المشاركة'); });
  const del = run(async () => {
    if (!confirm('تحذف المنشور؟')) return;
    await api(EP.one(id), { method: 'DELETE' });
    onDelete?.(id);
    toast('اتحذف');
  });

  const act = (on, color) =>
    `flex-1 rounded-lg py-2 text-sm font-semibold hover:bg-soft ${on ? color : 'text-mute'}`;

  return (
    <article className="card mb-3.5">
      <div className="flex items-center gap-2.5">
        <Avatar u={a} />
        <div className="leading-tight">
          <b className="block">{a.name || a.username || 'مستخدم'}</b>
          <small className="text-mute">{ago(p.createdAt)}</small>
        </div>
        {uid(a) === myId && <button onClick={del} className="ms-auto text-[13px] text-mute hover:text-danger">حذف</button>}
      </div>
      <p className="my-3 whitespace-pre-wrap break-words">{p.body}</p>
      {img && <img src={img} loading="lazy" alt="" className="max-h-[480px] w-full rounded-xl bg-soft object-cover" />}
      <div className="mb-1 mt-2.5 flex gap-4 text-[13px] text-mute"><span>{likes} إعجاب</span><span>{cm} تعليق</span></div>
      <div className="mt-1.5 flex border-t border-line pt-1">
        <button onClick={like} className={act(liked, 'text-brand')}>{liked ? 'أعجبني' : 'إعجاب'}</button>
        <button onClick={() => setOpen(!open)} className={act(open, 'text-brand')}>تعليق</button>
        <button onClick={mark} className={act(saved, 'text-gold')}>{saved ? 'محفوظ' : 'حفظ'}</button>
        <button onClick={share} className={act(false, '')}>مشاركة</button>
      </div>
      {open && <Comments id={id} />}
    </article>
  );
}
