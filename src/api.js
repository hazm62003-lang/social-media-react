export const API = 'https://route-posts.routemisr.com';

export const EP = {
  signin: '/users/signin',
  signup: '/users/signup',
  me: '/users/profile-data',
  photo: '/users/upload-photo',
  saved: '/users/bookmarks',
  sugg: '/users/suggestions?limit=6',
  follow: (id) => `/users/${id}/follow`,
  userPosts: (id) => `/users/${id}/posts`,
  feed: (p) => `/posts/feed?limit=10&page=${p}`,
  all: (p) => `/posts?limit=10&page=${p}`,
  post: '/posts',
  one: (id) => `/posts/${id}`,
  like: (id) => `/posts/${id}/like`,
  mark: (id) => `/posts/${id}/bookmark`,
  share: (id) => `/posts/${id}/share`,
  comments: (id) => `/posts/${id}/comments`,
  notifs: '/notifications',
};

export const getToken = () => localStorage.getItem('tk');
export const setToken = (t) => (t ? localStorage.setItem('tk', t) : localStorage.removeItem('tk'));

function errText(e) {
  if (!e) return '';
  if (Array.isArray(e)) return e.map(errText).filter(Boolean).join('، ');
  if (typeof e === 'object') return e.msg || e.message || Object.values(e).map(errText).filter(Boolean).join('، ');
  return String(e);
}

export async function api(path, { method = 'GET', json, form } = {}) {
  const headers = {};
  const t = getToken();
  if (t) headers.Authorization = `Bearer ${t}`;
  if (json) headers['Content-Type'] = 'application/json';
  let res;
  try {
    res = await fetch(API + path, { method, headers, body: json ? JSON.stringify(json) : form });
  } catch {
    throw new Error('مفيش اتصال بالسيرفر');
  }
  let data = {};
  try { data = await res.json(); } catch { /* no body */ }
  if (!res.ok || data.success === false) {
    if (res.status === 401 && t) window.dispatchEvent(new Event('unauth'));
    throw new Error(errText(data.errors) || data.message || 'حصل خطأ');
  }
  return data;
}

export const uid = (u) => u && (u._id || u.id);
export const url = (x) => (typeof x === 'string' ? x : (x && (x.url || x.secure_url)) || '');
export const arr = (d) => {
  const x = d && d.data;
  if (Array.isArray(x)) return x;
  for (const k in x || {}) if (Array.isArray(x[k])) return x[k];
  return [];
};
export function ago(d) {
  const s = (Date.now() - new Date(d)) / 1000;
  if (!(s >= 0)) return '';
  if (s < 60) return 'الآن';
  if (s < 3600) return `من ${Math.floor(s / 60)} د`;
  if (s < 86400) return `من ${Math.floor(s / 3600)} س`;
  if (s < 604800) return `من ${Math.floor(s / 86400)} يوم`;
  return new Date(d).toLocaleDateString('ar-EG');
}
