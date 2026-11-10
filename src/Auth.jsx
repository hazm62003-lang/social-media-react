import { useState } from 'react';
import { api, EP } from './api';

export default function Auth({ onLogin }) {
  const [signin, setSignin] = useState(true);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      const body = Object.fromEntries(new FormData(e.target));
      const d = await api(signin ? EP.signin : EP.signup, { method: 'POST', json: body });
      const t = d.data?.token || d.token;
      if (!t) throw new Error('السيرفر مرجعش توكن');
      onLogin(t);
    } catch (x) {
      setErr(x.message);
    }
    setBusy(false);
  }

  const tabCls = (on) =>
    `-mb-px border-b-[3px] py-2 font-semibold ${on ? 'border-brand text-ink' : 'border-transparent text-mute'}`;
  const Label = ({ t, children }) => (
    <label className="flex flex-col gap-1 text-[13px] text-mute">{t}{children}</label>
  );

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <section className="flex min-h-[200px] flex-col justify-end bg-ink p-8 text-white md:p-14">
        <h1 className="text-5xl font-bold leading-tight md:text-7xl">لمّة</h1>
        <p className="mt-3 max-w-[30ch] text-lg text-slate-300">اكتب، شارك صورة، وتابع ناس تهمك. كل حاجة في مكان واحد.</p>
      </section>
      <section className="grid place-items-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-5 flex gap-5 border-b border-line">
            <button className={tabCls(signin)} onClick={() => setSignin(true)}>تسجيل الدخول</button>
            <button className={tabCls(!signin)} onClick={() => setSignin(false)}>حساب جديد</button>
          </div>
          <form key={signin} onSubmit={submit} className="flex flex-col gap-3">
            {signin ? (
              <>
                <Label t="الإيميل أو اسم المستخدم"><input name="email" required className="field" autoComplete="username" /></Label>
                <Label t="كلمة المرور"><input name="password" type="password" required className="field" autoComplete="current-password" /></Label>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2.5">
                  <Label t="الاسم"><input name="name" required className="field" /></Label>
                  <Label t="اسم المستخدم"><input name="username" required className="field" /></Label>
                </div>
                <Label t="الإيميل"><input name="email" type="email" required className="field" /></Label>
                <div className="grid grid-cols-2 gap-2.5">
                  <Label t="تاريخ الميلاد"><input name="dateOfBirth" type="date" required className="field" /></Label>
                  <Label t="النوع">
                    <select name="gender" className="field"><option value="male">ذكر</option><option value="female">أنثى</option></select>
                  </Label>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <Label t="كلمة المرور"><input name="password" type="password" required className="field" /></Label>
                  <Label t="تأكيدها"><input name="rePassword" type="password" required className="field" /></Label>
                </div>
                <small className="text-mute">حرف كبير وصغير ورقم ورمز، مثال: Aa@123456</small>
              </>
            )}
            <p className="min-h-[18px] text-[13px] text-danger">{err}</p>
            <button className="btn" disabled={busy}>{signin ? 'دخول' : 'إنشاء الحساب'}</button>
          </form>
        </div>
      </section>
    </div>
  );
}
