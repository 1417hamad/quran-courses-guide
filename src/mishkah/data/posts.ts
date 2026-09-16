import type { Post } from '../types'
import { hoursAgo, daysAgo, day } from './dates'

/** منشورات الحائط التفاعلي — محتوى عربي واقعي يناسب مركزًا علميًا */
export const posts: Post[] = [
  {
    id: 'post-01',
    authorId: 'emp-03',
    createdAt: hoursAgo(3),
    kind: 'announcement',
    body:
      'يسرّنا دعوتكم إلى لقاء الموظفين الفصلي يوم الأربعاء القادم في قاعة مشكاة الكبرى، الساعة العاشرة صباحًا. سنستعرض حصاد الفصل الماضي وخطة الفصل القادم، ونفتح مساحة للنقاش والمقترحات.',
    audience: { kind: 'center', label: 'لجميع موظفي المركز' },
    reactions: { '👍': 14, '🤍': 6 },
    comments: [
      { id: 'c-01', authorId: 'emp-08', at: hoursAgo(2), body: 'بإذن الله سأحضر، هل سيتوفر بث للزملاء خارج الرياض؟' },
      { id: 'c-02', authorId: 'emp-03', at: hoursAgo(1), body: 'نعم، سيُرسل رابط البث قبل اللقاء بيوم.' },
    ],
    saved: false,
    pinned: true,
  },
  {
    id: 'post-02',
    authorId: 'emp-06',
    createdAt: hoursAgo(7),
    kind: 'congrats',
    body:
      'تهنئة من القلب للزميل عبدالرحمن الحميدي على إتمام مراجعة منهج التلاوة للمستوى الثاني قبل الموعد المحدد بأسبوع كامل. جهد يستحق الشكر والتقدير.',
    audience: { kind: 'center', label: 'لجميع موظفي المركز' },
    mentions: ['emp-01'],
    reactions: { '👏': 21, '🤍': 9, '👍': 5 },
    comments: [
      { id: 'c-03', authorId: 'emp-02', at: hoursAgo(6), body: 'ما شاء الله، عمل متقن. بارك الله فيك.' },
    ],
    saved: true,
  },
  {
    id: 'post-03',
    authorId: 'emp-02',
    createdAt: hoursAgo(20),
    kind: 'poll',
    body: 'نودّ اختيار الموعد الأنسب لورشة «أدوات القياس في الحلقات» لأكبر عدد من الزملاء.',
    audience: { kind: 'center', label: 'لجميع موظفي المركز' },
    poll: {
      question: 'ما الموعد الأنسب لك لحضور الورشة؟',
      options: [
        { id: 'opt-1', label: 'الأحد صباحًا', votes: 9 },
        { id: 'opt-2', label: 'الثلاثاء بعد العصر', votes: 14 },
        { id: 'opt-3', label: 'الخميس صباحًا', votes: 6 },
      ],
      closesAt: day(3),
    },
    reactions: { '👍': 4 },
    comments: [],
    saved: false,
  },
  {
    id: 'post-04',
    authorId: 'emp-05',
    createdAt: daysAgo(1.4),
    kind: 'decision',
    body:
      'صدر قرار تنظيم العمل عن بُعد لموظفي الدوام الجزئي، ويبدأ سريانه مع بداية الفصل القادم. نرجو الاطلاع عليه وتأكيد ذلك من صفحة القرار.',
    audience: { kind: 'center', label: 'لجميع موظفي المركز' },
    decisionId: 'doc-dec-014',
    reactions: { '👍': 11 },
    comments: [
      { id: 'c-04', authorId: 'emp-11', at: daysAgo(1.1), body: 'هل ينطبق على المتعاونين أيضًا؟' },
      { id: 'c-05', authorId: 'emp-05', at: daysAgo(1), body: 'ينطبق على الموظفين، وللمتعاونين تنظيم مستقل سيصدر لاحقًا.' },
    ],
    saved: false,
  },
  {
    id: 'post-05',
    authorId: 'emp-09',
    createdAt: daysAgo(2),
    kind: 'photos',
    body:
      'لقطات من الملتقى العلمي الذي أقيم الأسبوع الماضي بمشاركة ٧٢ معلمًا ومعلمة. شكرًا لكل من أسهم في إنجاحه.',
    audience: { kind: 'center', label: 'لجميع موظفي المركز' },
    images: [
      { caption: 'افتتاح الملتقى', tone: '#0E4F4A' },
      { caption: 'الجلسة الثانية', tone: '#B98B3E' },
      { caption: 'ورشة المجموعات', tone: '#2A6F97' },
    ],
    reactions: { '🤍': 17, '👏': 12 },
    comments: [{ id: 'c-06', authorId: 'emp-07', at: daysAgo(1.8), body: 'تنظيم موفق، وفق الله الجميع.' }],
    saved: false,
  },
  {
    id: 'post-06',
    authorId: 'emp-06',
    createdAt: daysAgo(2.5),
    kind: 'news',
    body:
      'أطلقت إدارة المناهج النسخة التجريبية من برنامج «الإتقان» لتأهيل معلمي الحلقات، وسيبدأ التطبيق في ثلاث حلقات مختارة خلال الشهر القادم لقياس الأثر قبل التعميم.',
    audience: { kind: 'unit', ref: 'unit-curricula', label: 'إدارة المناهج' },
    reactions: { '👍': 8, '👏': 3 },
    comments: [],
    saved: false,
  },
  {
    id: 'post-07',
    authorId: 'emp-04',
    createdAt: daysAgo(3),
    kind: 'knowledge',
    body:
      'مشاركة مهنية: عند إعداد أي نموذج إلكتروني، اجعل الحقول الإلزامية أقل ما يمكن، واطلب البقية عند الحاجة فقط. جرّبنا ذلك في نموذج الدعم الفني فانخفض زمن التعبئة إلى النصف تقريبًا.',
    audience: { kind: 'center', label: 'لجميع موظفي المركز' },
    reactions: { '👍': 13, '🤍': 2 },
    comments: [{ id: 'c-07', authorId: 'emp-01', at: daysAgo(2.7), body: 'ملحوظة مهمة، تنطبق على نماذجنا الورقية أيضًا.' }],
    saved: true,
  },
  {
    id: 'post-08',
    authorId: 'emp-02',
    createdAt: daysAgo(4),
    kind: 'news',
    body:
      'اكتمل تأهيل الدفعة الثالثة من مسار «الكفاءات الواعدة» بواقع ١٢ متدربًا، وسيلتحقون بالحلقات مساعدين خلال الفصل القادم بإشراف زملائهم في مسار الكفاءات الراسخة.',
    audience: { kind: 'unit', ref: 'unit-competencies', label: 'إدارة الكفاءات' },
    reactions: { '👏': 15, '👍': 6 },
    comments: [],
    saved: false,
  },
  {
    id: 'post-09',
    authorId: 'emp-07',
    createdAt: daysAgo(5),
    kind: 'congrats',
    body: 'نرحّب بالزميلين بدر العنزي ودانة الزهراني المنضمّين حديثًا لأسرة المركز. نسأل الله لهما التوفيق.',
    audience: { kind: 'center', label: 'لجميع موظفي المركز' },
    mentions: ['emp-13', 'emp-14'],
    reactions: { '🤍': 19, '👏': 7 },
    comments: [{ id: 'c-08', authorId: 'emp-13', at: daysAgo(4.8), body: 'شكرًا لكم، سعيد بالانضمام إليكم.' }],
    saved: false,
  },
  {
    id: 'post-10',
    authorId: 'emp-04',
    createdAt: daysAgo(6),
    kind: 'announcement',
    body:
      'سيتم تحديث منصة إدارة المحتوى مساء الخميس من ٩ إلى ١١ مساءً، وقد تتوقف الخدمة خلال هذه الفترة. نرجو إنهاء أعمالكم قبل ذلك.',
    audience: { kind: 'team', ref: 'team-digital', label: 'فريق التحول الرقمي' },
    reactions: { '👍': 5 },
    comments: [],
    saved: false,
  },
  {
    id: 'post-11',
    authorId: 'emp-01',
    createdAt: daysAgo(7),
    kind: 'news',
    body:
      'اجتمعت لجنة جودة المحتوى أمس واعتمدت معيارين جديدين لمراجعة المادة العلمية: وضوح المخرجات، وتناسب الأنشطة مع الزمن. سيُرفع المعياران للاعتماد النهائي قريبًا.',
    audience: { kind: 'team', ref: 'team-quality', label: 'لجنة جودة المحتوى' },
    attachment: { name: 'محضر-اللجنة-٠٩.pdf', size: '١٩٠ ك.ب' },
    reactions: { '👍': 6 },
    comments: [],
    saved: false,
  },
]

/** الرموز التعبيرية المتاحة للتفاعل */
export const reactionEmojis = ['👍', '🤍', '👏', '💡'] as const
