'use client'

import { useState, useRef, type FormEvent } from 'react'
import { ArrowRight, Loader2, ShieldCheck } from 'lucide-react'
import { brand } from '../brand'
import { DEMO_OTP, useMishkah } from '../store'
import { demoPersonas } from '../data'
import { Logo } from '../ui'

/** شاشة الدخول: معرّف ثم رمز تحقق تجريبي */
export function LoginScreen() {
  const { authStep, identifier, startLogin, verifyOtp, currentUserId, switchUser, employees } = useMishkah()
  const [value, setValue] = useState('')
  const [remember, setRemember] = useState(true)
  const [code, setCode] = useState(['', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const boxes = useRef<(HTMLInputElement | null)[]>([])

  function submitIdentity(e: FormEvent) {
    e.preventDefault()
    const v = value.trim()
    if (v.length < 5) {
      setError('أدخل رقم جوالك أو بريدك الإلكتروني')
      return
    }
    setError('')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      startLogin(v, remember)
    }, 700)
  }

  function onDigit(index: number, digit: string) {
    const clean = digit.replace(/\D/g, '').slice(-1)
    const next = [...code]
    next[index] = clean
    setCode(next)
    setError('')
    if (clean && index < 3) boxes.current[index + 1]?.focus()
  }

  function submitOtp(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      if (!verifyOtp(code.join(''))) {
        setError('رمز التحقق غير صحيح. الرمز التجريبي هو ١٢٣٤')
        setCode(['', '', '', ''])
        boxes.current[0]?.focus()
      }
    }, 650)
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* الجانب التعريفي */}
      <div
        className="lg:w-1/2 px-6 py-10 lg:py-16 lg:px-14 flex flex-col justify-center mk-pattern"
        style={{ background: 'var(--mk-primary)', color: '#fff' }}
      >
        <Logo size={54} light />
        <h1 className="mt-8 text-2xl lg:text-4xl font-bold leading-snug">{brand.appName}</h1>
        <p className="mt-3 text-base lg:text-lg" style={{ color: 'rgba(255,255,255,0.78)' }}>
          {brand.tagline}
        </p>
        <ul className="mt-8 space-y-3 text-sm" style={{ color: 'rgba(255,255,255,0.86)' }}>
          {[
            'أخبار المركز ولقاءاته في مكان واحد',
            'خدماتك وطلباتك إلكترونيًا دون ورق',
            'قرارات المركز ووثائقه بين يديك',
            'إدارتك وفرقك وزملاؤك على بُعد نقرة',
          ].map((line) => (
            <li key={line} className="flex items-center gap-2.5">
              <span className="mk-dot" style={{ background: 'var(--mk-gold)' }} />
              {line}
            </li>
          ))}
        </ul>
      </div>

      {/* نموذج الدخول */}
      <div className="lg:w-1/2 flex items-center justify-center px-5 py-10 lg:py-16" style={{ background: 'var(--mk-bg)' }}>
        <div className="w-full max-w-sm">
          {authStep === 'identity' ? (
            <form onSubmit={submitIdentity} className="mk-card p-6">
              <h2 className="text-xl font-bold">{brand.welcomeLine}</h2>
              <p className="text-sm mk-muted mt-1.5 leading-7">
                أدخل رقم جوالك أو بريدك في المركز وسيصلك رمز تحقق.
              </p>

              <div className="mt-6">
                <label className="mk-label" htmlFor="mk-identifier">
                  رقم الجوال أو البريد الإلكتروني
                </label>
                <input
                  id="mk-identifier"
                  className="mk-input"
                  placeholder="05xxxxxxxx أو name@mishkah.sa"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  autoComplete="username"
                />
                {error && <p className="mk-error">{error}</p>}
              </div>

              <label className="mk-check mt-4">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                <span>تذكّر هذا الجهاز لمدة ٣٠ يومًا</span>
              </label>

              <button type="submit" className="mk-btn mk-btn-primary mk-btn-lg mt-5" disabled={loading}>
                {loading ? <span className="mk-spinner" /> : <ArrowRight size={18} />}
                {loading ? 'جارٍ الإرسال…' : 'إرسال رمز التحقق'}
              </button>

              <p className="text-xs mk-muted mt-4 text-center leading-6">
                هذه نسخة تجريبية — لا يلزم إدخال بيانات حقيقية.
              </p>

              <div className="mt-5 pt-5 border-t" style={{ borderColor: 'var(--mk-line)' }}>
                <p className="text-xs font-bold mb-2">جرّب الدخول بحساب تجريبي</p>
                <div className="mk-scroll-x">
                  {demoPersonas.map((p) => {
                    const emp = employees.find((e) => e.id === p.id)
                    return (
                      <button
                        key={p.id}
                        type="button"
                        className={`mk-chip ${currentUserId === p.id ? 'mk-chip-active' : ''}`}
                        onClick={() => {
                          switchUser(p.id)
                          setValue(emp?.email ?? '')
                        }}
                      >
                        {p.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={submitOtp} className="mk-card p-6">
              <span
                className="mk-avatar mb-4"
                style={{ width: 46, height: 46, background: 'var(--mk-primary-soft)', color: 'var(--mk-primary)' }}
              >
                <ShieldCheck size={22} />
              </span>
              <h2 className="text-xl font-bold">أدخل رمز التحقق</h2>
              <p className="text-sm mk-muted mt-1.5 leading-7">
                أرسلنا رمزًا مكوّنًا من ٤ أرقام إلى <span className="font-semibold">{identifier}</span>
              </p>

              <div className="flex gap-2.5 mt-6" dir="ltr">
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      boxes.current[i] = el
                    }}
                    className="mk-input text-center text-xl font-bold"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => onDigit(i, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !code[i] && i > 0) boxes.current[i - 1]?.focus()
                    }}
                    aria-label={`الرقم ${i + 1}`}
                  />
                ))}
              </div>
              {error && <p className="mk-error">{error}</p>}

              <div
                className="mt-4 rounded-xl px-3.5 py-2.5 text-xs font-semibold flex items-center gap-2"
                style={{ background: 'var(--mk-gold-soft)', color: 'var(--mk-warning)' }}
              >
                <Loader2 size={14} />
                الرمز التجريبي للتجربة: {DEMO_OTP}
              </div>

              <button
                type="submit"
                className="mk-btn mk-btn-primary mk-btn-lg mt-5"
                disabled={loading || code.some((c) => !c)}
              >
                {loading ? <span className="mk-spinner" /> : null}
                {loading ? 'جارٍ التحقق…' : 'تأكيد الدخول'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
