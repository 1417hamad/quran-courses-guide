/**
 * مخزن خارجي صغير لخيار «تذكّر هذا الجهاز».
 * يُقرأ عبر useSyncExternalStore حتى يتطابق ما يعرضه الخادم مع أول عرض في المتصفح،
 * ثم يُحدَّث بعد التحميل دون الحاجة إلى setState داخل useEffect.
 */

const USER_KEY = 'mishkah.rememberedUser'
const DEVICE_KEY = 'mishkah.rememberDevice'

let listeners: (() => void)[] = []
let cache: string | null = null
let loaded = false

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorage(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, value)
  } catch {
    /* التخزين غير متاح — لا يؤثر على عمل النموذج */
  }
}

export const rememberedUser = {
  subscribe(listener: () => void) {
    listeners.push(listener)
    return () => {
      listeners = listeners.filter((l) => l !== listener)
    }
  },
  /** القيمة في المتصفح (تُقرأ مرة واحدة ثم تُحفظ في الذاكرة) */
  getSnapshot(): string | null {
    if (!loaded) {
      cache = readStorage(USER_KEY)
      loaded = true
    }
    return cache
  },
  /** لا توجد جلسة محفوظة أثناء العرض على الخادم */
  getServerSnapshot(): string | null {
    return null
  },
  set(value: string | null) {
    writeStorage(USER_KEY, value)
    cache = value
    loaded = true
    listeners.forEach((l) => l())
  },
}

/** هل اختار المستخدم تذكّر الجهاز في شاشة الدخول؟ */
export const rememberDevice = {
  get(): boolean {
    return readStorage(DEVICE_KEY) === '1'
  },
  set(on: boolean) {
    writeStorage(DEVICE_KEY, on ? '1' : null)
  },
}

/** true بعد أن يعمل المتصفح — تُستخدم لإظهار شاشة تمهيدية قبل معرفة الجلسة */
const hydrationStore = {
  subscribe() {
    return () => {}
  },
  getSnapshot() {
    return true
  },
  getServerSnapshot() {
    return false
  },
}

export { hydrationStore }
