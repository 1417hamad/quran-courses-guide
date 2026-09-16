/**
 * هوية «بيئة مشكاة الرقمية»
 * ---------------------------------------------------------------------------
 * هذا الملف هو المرجع الوحيد لتعديل الهوية البصرية والنصوص العامة للمنصة.
 * الألوان مستخرجة من شعار مركز مشكاة التعليمي الرسمي:
 *   الأخضر الداكن #122B29 · الرملي الذهبي #B39E7E
 * لتغيير الشعار: استبدل الملفات في `public/mishkah/` بالمسارات أدناه.
 */

export const brand = {
  /** اسم المنصة كما يظهر في الواجهة */
  appName: 'بيئة مشكاة الرقمية',
  /** اسم الجهة المالكة */
  orgName: 'مركز مشكاة التعليمي',
  orgNameEn: 'Mishkat Educational Center',
  shortName: 'مشكاة',
  tagline: 'بيئة عمل رقمية تجمع فريق المركز في مكان واحد',
  welcomeLine: 'أهلًا بك في بيئة مشكاة',

  /** الشعار الكامل (العلامة + اسم المركز) — للشاشات الواسعة مثل شاشة الدخول */
  logoSrc: '/mishkah/logo.png',
  /** العلامة وحدها — للأماكن الضيقة مثل الشريط العلوي */
  markSrc: '/mishkah/logo-mark.png',

  /** ألوان الهوية — تُحقن كمتغيرات CSS في جذر المنصة */
  colors: {
    /** الأخضر الداكن المأخوذ من الشعار */
    primary: '#122B29',
    /** درجة أفتح للتفاعل (hover) لأن الأساسي داكن جدًا */
    primaryDark: '#1E4340',
    primarySoft: '#E6EDEB',
    primaryTint: '#F3F7F5',
    /** الرملي الذهبي من الشعار — للتعبئة والزخرفة لا للنصوص */
    gold: '#B39E7E',
    /** درجة داكنة من الرملي تصلح للنصوص والأيقونات (تباين ٥٫٥:١ على الأبيض) */
    goldDeep: '#7A6742',
    goldSoft: '#F4F1EA',
    ink: '#14201E',
    muted: '#66756F',
    line: '#E2E8E5',
    surface: '#FFFFFF',
    bg: '#F5F7F5',
    info: '#2C5F7C',
    success: '#2E7D58',
    warning: '#8F5E18',
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
    '--mk-gold-deep': brand.colors.goldDeep,
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
