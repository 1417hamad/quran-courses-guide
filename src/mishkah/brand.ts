/**
 * هوية «بيئة مشكاة الرقمية»
 * ---------------------------------------------------------------------------
 * هذا الملف هو المرجع الوحيد لتعديل الهوية البصرية والنصوص العامة للمنصة.
 * لتغيير الشعار: ضع ملفك في `public/mishkah/logo.svg` (يُستخدم تلقائيًا).
 * لتغيير الألوان: عدّل القيم هنا وستنعكس على كامل المنصة عبر متغيرات CSS.
 */

export const brand = {
  /** اسم المنصة كما يظهر في الواجهة */
  appName: 'بيئة مشكاة الرقمية',
  /** اسم الجهة المالكة */
  orgName: 'مركز مشكاة العلمي',
  shortName: 'مشكاة',
  tagline: 'بيئة عمل رقمية تجمع فريق المركز في مكان واحد',
  welcomeLine: 'أهلًا بك في بيئة مشكاة',

  /**
   * مسار الشعار الرسمي للمركز.
   * ضع ملف الشعار في `public/mishkah/logo.svg` ثم اجعل القيمة: '/mishkah/logo.svg'
   * وسيظهر تلقائيًا في كل شاشات المنصة.
   * ما دامت القيمة فارغة تُعرض الكلمة الكتابية «مشكاة» دون اختراع شعار بديل.
   */
  logoSrc: '',

  /** ألوان الهوية — تُحقن كمتغيرات CSS في جذر المنصة */
  colors: {
    primary: '#0E4F4A',
    primaryDark: '#0A3A36',
    primarySoft: '#E7F0EE',
    primaryTint: '#F2F7F6',
    gold: '#B98B3E',
    goldSoft: '#F7EEDD',
    ink: '#16211F',
    muted: '#6C7C78',
    line: '#E3E9E6',
    surface: '#FFFFFF',
    bg: '#F5F7F5',
    info: '#2A6F97',
    success: '#2E7D58',
    warning: '#B4782A',
    danger: '#B23A34',
  },

  /** خطوط الهوية — يمكن استبدالها بخط المركز الرسمي */
  fonts: {
    base: "'IBM Plex Sans Arabic', 'Noto Kufi Arabic', 'Segoe UI', sans-serif",
    display: "'IBM Plex Sans Arabic', 'Noto Kufi Arabic', 'Segoe UI', sans-serif",
  },

  /** حدة الانحناء العامة */
  radius: { sm: '10px', md: '14px', lg: '20px', xl: '26px' },
} as const

/** يحوّل ألوان الهوية إلى متغيرات CSS جاهزة للحقن في العنصر الجذر */
export function brandCssVars(): Record<string, string> {
  return {
    '--mk-primary': brand.colors.primary,
    '--mk-primary-dark': brand.colors.primaryDark,
    '--mk-primary-soft': brand.colors.primarySoft,
    '--mk-primary-tint': brand.colors.primaryTint,
    '--mk-gold': brand.colors.gold,
    '--mk-gold-soft': brand.colors.goldSoft,
    '--mk-ink': brand.colors.ink,
    '--mk-muted': brand.colors.muted,
    '--mk-line': brand.colors.line,
    '--mk-surface': brand.colors.surface,
    '--mk-bg': brand.colors.bg,
    '--mk-info': brand.colors.info,
    '--mk-success': brand.colors.success,
    '--mk-warning': brand.colors.warning,
    '--mk-danger': brand.colors.danger,
    '--mk-font': brand.fonts.base,
    '--mk-font-display': brand.fonts.display,
    '--mk-radius-sm': brand.radius.sm,
    '--mk-radius-md': brand.radius.md,
    '--mk-radius-lg': brand.radius.lg,
    '--mk-radius-xl': brand.radius.xl,
  }
}
