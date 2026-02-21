import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';

// --- 优先级配置读取 ---
const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : {
      apiKey: "YOUR_API_KEY", 
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID"
    };

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : "linguagua-app-v1";

// --- 纯内联 SVG 图标 ---
const IconGlobe = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
);
const IconChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
);
const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);

// --- 多语言翻译 ---
const translations = {
  en: {
    navHome: "Home", navThai: "Learn Thai", navChinese: "Learn Chinese", navBlog: "Blog",
    heroTitle: "Bridge Your World with LinguaGua",
    heroSub: "The #1 Language bridge for Southeast Asia. Connect with Thai, Chinese, English, Indonesian, and Vietnamese.",
    learnThai: "I want to learn Thai", learnChinese: "I want to learn Chinese",
    subThai: "For Chinese/English speakers", subChinese: "For Thai/Indo/Viet speakers",
    waitlist: "Join the Waitlist", waitlistSub: "Get notified when App launches and claim 1 month Premium!",
    emailPlaceholder: "Email address",
    subscribe: "Notify Me", footer: "© 2026 LinguaGua Language. All rights reserved.",
    blogTitle: "Insights", readMore: "Read More", 
    catAll: "All", catChinese: "Learn Chinese", catThai: "Learn Thai"
  },
  zh: {
    navHome: "首页", navThai: "学泰语", navBlog: "博客",
    heroTitle: "LinguaGua：连接语言的桥梁",
    heroSub: "东南亚语言互学第一站。轻松掌握泰、中、英、印、越语。",
    learnThai: "我想学泰语", 
    subThai: "面向中文用户",
    waitlist: "加入等候名单", waitlistSub: "App上线时通知我，并获取一个月会员！",
    emailPlaceholder: "电子邮件地址",
    subscribe: "通知我", footer: "© 2026 LinguaGua Language. 版权所有。",
    blogTitle: "语言洞察", readMore: "阅读更多",
    catAll: "全部", catChinese: "学中文", catThai: "学泰语"
  },
  zt: {
    navHome: "首頁", navThai: "學泰語", navBlog: "部落格",
    heroTitle: "LinguaGua：連接語言的橋樑",
    heroSub: "東南亞語言互學第一站。輕鬆掌握泰、中、英、印、越語。",
    learnThai: "我想學泰語", 
    subThai: "面向中文用戶",
    waitlist: "加入等候名單", waitlistSub: "App上線時通知我，並獲取一個月會員！",
    emailPlaceholder: "電子郵件地址",
    subscribe: "通知我", footer: "© 2026 LinguaGua Language. 版權所有。",
    blogTitle: "語言洞察", readMore: "閱讀更多",
    catAll: "全部", catChinese: "學中文", catThai: "學泰語"
  },
  th: {
    navHome: "หน้าแรก", navChinese: "เรียนภาษาจีน", navBlog: "บล็อก",
    heroTitle: "LinguaGua: สะพานเชื่อมภาษาของคุณ",
    heroSub: "อันดับ 1 สำหรับการเรียนรู้ภาษาในเอเชียตะวันออกเฉียงใต้ เชื่อมต่อ ไทย จีน อังกฤษ อินโดนีเซีย และเวียดนาม",
    learnChinese: "ฉันต้องการเรียนภาษาจีน",
    subChinese: "สำหรับผู้พูดภาษาไทย/อินโด/เวียดนาม",
    waitlist: "เข้าร่วม Waitlist", waitlistSub: "รับการแจ้งเตือนเมื่อแอปเปิดตัว และรับรางวัล Premium 1 เดือน!",
    emailPlaceholder: "ที่อยู่อีเมล",
    subscribe: "แจ้งเตือนฉัน", footer: "© 2026 LinguaGua Language. สงวนลิขสิทธิ์",
    blogTitle: "ความรู้จาก LinguaGua", readMore: "อ่านเพิ่มเติม",
    catAll: "ทั้งหมด", catChinese: "เรียนภาษาจีน", catThai: "เรียนภาษาไทย"
  }
};

const languages = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: '简体中文' },
  { code: 'zt', name: '繁體中文' },
  { code: 'th', name: 'ไทย' }
];

const blogPosts = [
  {
    id: 1,
    category: "catChinese",
    title: { en: "How to learn Chinese via Indonesian", zh: "如何通过印尼语学中文", zt: "如何透過印尼語學中文", th: "วิธีเรียนภาษาจีนผ่านภาษาอินโดนีเซีย" },
    excerpt: { en: "Discover the hidden similarities...", zh: "探索语法和词汇中的隐藏相似之处...", zt: "探索語法和詞彙中的隱藏相似之處...", th: "ค้นพบความคล้ายคลึงที่ซ่อนอยู่..." },
    date: "2026-02-15",
    image: "🐼"
  },
  {
    id: 2,
    category: "catThai",
    title: { en: "Thai Tones: Why they aren't scary", zh: "泰语声调：为什么并不可怕", zt: "泰語聲調：為什麼並不可怕", th: "วรรณยุกต์ไทย: ทำไมถึงไม่น่ากลัว" },
    excerpt: { en: "Mastering the 5 tones easily...", zh: "为初学者解释如何掌握 5 个声调...", zt: "為初學者解釋如何掌握 5 個聲調...", th: "การฝึกวรรณยุกต์ 5 เสียง..." },
    date: "2026-01-20",
    image: "🐘"
  },
  {
    id: 3,
    category: "catThai",
    title: { en: "Best Thai street food phrases", zh: "泰语街头美食必背短语", zt: "泰語街頭美食必背短語", th: "วลีเด็ดสำหรับสั่งอาหารสตรีทฟู้ด" },
    excerpt: { en: "Ordering food like a local...", zh: "像当地人一样点餐的技巧...", zt: "像當地人一樣點餐的技巧...", th: "สั่งอาหารอย่างมือโปร..." },
    date: "2026-03-01",
    image: "🍜"
  }
];

// --- 子组件 ---
const FeatureCard = ({ title, sub, icon, color, onClick, tNav }) => (
  <div onClick={onClick} className={`group cursor-pointer relative overflow-hidden rounded-[2rem] p-8 text-white shadow-2xl transition-all hover:-translate-y-2 ${color}`}>
    <div className="relative z-10 flex flex-col items-center">
      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-md"><span className="text-5xl">{icon}</span></div>
      <h3 className="text-2xl font-bold mb-2 text-center">{title}</h3>
      <p className="opacity-80 text-sm mb-6 text-center">{sub}</p>
      <div className="px-6 py-2 bg-white text-slate-800 rounded-full font-bold flex items-center gap-2 group-hover:gap-4 transition-all">{tNav} <IconChevronRight /></div>
    </div>
  </div>
);

const BlogCard = ({ post, lang, tReadMore, tCategory }) => (
  <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full">
    <div className="h-48 bg-slate-50 flex items-center justify-center text-7xl group-hover:scale-110 transition-transform duration-500">{post.image}</div>
    <div className="p-8 flex flex-col flex-1">
      <div className="flex items-center gap-3 mb-4">
        <span className="px-3 py-1 bg-[#00FFAB]/10 text-[#008F60] text-xs font-bold rounded-full uppercase tracking-wider">{tCategory}</span>
        <span className="text-slate-300 text-xs">{post.date}</span>
      </div>
      <h3 className="text-xl font-bold mb-4 text-slate-900 leading-snug group-hover:text-[#00FFAB] transition-colors">{post.title[lang] || post.title.en}</h3>
      <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed">{post.excerpt[lang] || post.excerpt.en}</p>
      <div className="mt-auto pt-4 flex items-center gap-2 text-[#00FFAB] font-bold text-sm">{tReadMore} <IconChevronRight /></div>
    </div>
  </div>
);

export default function App() {
  const [lang, setLang] = useState('en');
  const [page, setPage] = useState('home');
  const [activeCategory, setActiveCategory] = useState('catAll');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(''); 
  const [user, setUser] = useState(null);

  const t = translations[lang] || translations.en;

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth Failed:", err.message);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !user) return;
    setLoading(true);
    setErrorMsg('');
    try {
      if (firebaseConfig.apiKey && firebaseConfig.apiKey.includes("YOUR_API")) {
        throw new Error("Local Config Missing: Please replace placeholders with real keys.");
      }
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'waitlist'), {
        email, lang, createdAt: serverTimestamp(), source: 'production_web'
      });
      setSent(true);
      setEmail('');
    } catch (err) {
      setErrorMsg(err.message || "Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = activeCategory === 'catAll' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === activeCategory);

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-[#00FFAB]/30">
      {/* 导航栏 */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 h-16">
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setPage('home')}>
            <div className="w-10 h-10 bg-[#00FFAB] rounded-xl flex items-center justify-center shadow-lg"><span className="text-xl">🐸</span></div>
            <span className="text-xl font-black">LinguaGua</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-semibold text-sm">
            <button onClick={() => setPage('home')} className={page === 'home' ? 'text-[#00FFAB]' : 'hover:text-[#00FFAB]'}>{t.navHome}</button>
            {/* 条件显示的学习入口按钮 */}
            {t.navThai && (
              <button onClick={() => setPage('thai')} className={page === 'thai' ? 'text-[#00FFAB]' : 'hover:text-[#00FFAB]'}>{t.navThai}</button>
            )}
            {t.navChinese && (
              <button onClick={() => setPage('chinese')} className={page === 'chinese' ? 'text-[#00FFAB]' : 'hover:text-[#00FFAB]'}>{t.navChinese}</button>
            )}
            
            {/* 将博客按钮移动到下拉框左边 */}
            <button onClick={() => setPage('blog')} className={page === 'blog' ? 'text-[#00FFAB]' : 'hover:text-[#00FFAB]'}>{t.navBlog}</button>

            {/* 语言下拉框 */}
            <div className="relative group">
              <button className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-100 transition-colors">
                <IconGlobe /><span className="uppercase text-xs">{lang}</span>
              </button>
              <div className="absolute right-0 top-full mt-2 w-32 bg-white shadow-2xl rounded-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all border border-slate-100">
                {languages.map(l => (
                  <button key={l.code} onClick={() => setLang(l.code)} className="w-full text-left px-4 py-2 hover:bg-[#00FFAB]/10 text-xs transition-colors">{l.name}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 主体内容 */}
      <main className="pt-32 pb-20">
        {page === 'home' ? (
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight">{t.heroTitle}</h1>
              <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">{t.heroSub}</p>
            </div>
            <div className={`grid ${t.learnThai && t.learnChinese ? 'md:grid-cols-2' : 'grid-cols-1'} gap-8 max-w-4xl mx-auto`}>
              {t.learnThai && (
                <div className={t.learnChinese ? "" : "max-w-md mx-auto w-full"}>
                  <FeatureCard title={t.learnThai} sub={t.subThai} icon="🐘" color="bg-gradient-to-br from-[#00FFAB] to-[#00D1FF]" onClick={() => setPage('thai')} tNav={t.navThai}/>
                </div>
              )}
              {t.learnChinese && (
                <div className={t.learnThai ? "" : "max-w-md mx-auto w-full"}>
                  <FeatureCard title={t.learnChinese} sub={t.subChinese} icon="🐼" color="bg-gradient-to-br from-slate-800 to-slate-600" onClick={() => setPage('chinese')} tNav={t.navChinese}/>
                </div>
              )}
            </div>
          </div>
        ) : page === 'blog' ? (
          <div className="max-w-6xl mx-auto px-6 animate-in fade-in duration-500">
            <h1 className="text-4xl font-black text-center mb-8">{t.blogTitle}</h1>
            
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {['catAll', 'catChinese', 'catThai'].map((catKey) => (
                <button
                  key={catKey}
                  onClick={() => setActiveCategory(catKey)}
                  className={`px-6 py-2 rounded-full text-sm font-bold transition-all border ${
                    activeCategory === catKey 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
                      : 'bg-white text-slate-500 border-slate-200 hover:border-[#00FFAB] hover:text-[#00FFAB]'
                  }`}
                >
                  {t[catKey]}
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map(post => (
                <BlogCard 
                  key={post.id} 
                  post={post} 
                  lang={lang} 
                  tReadMore={t.readMore} 
                  tCategory={t[post.category]}
                />
              ))}
              {filteredPosts.length === 0 && (
                <div className="col-span-full py-20 text-center text-slate-400">
                  No posts found in this category.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto px-6 text-center py-20 animate-in zoom-in duration-300">
             <h2 className="text-5xl font-black mb-8">{page === 'thai' ? t.navThai : t.navChinese}</h2>
             <p className="text-xl text-slate-500 mb-12">Coming Soon on App Stores!</p>
             <button onClick={() => setPage('home')} className="px-8 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-all">Back Home</button>
          </div>
        )}
      </main>

      {/* 等候名单区域 */}
      <section className="bg-slate-900 py-32 text-white overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-[#00FFAB]/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-black mb-6">{t.waitlist}</h2>
          <p className="text-slate-400 mb-12 text-lg">{t.waitlistSub}</p>
          
          {sent ? (
            <div className="bg-[#00FFAB]/20 border border-[#00FFAB]/40 p-10 rounded-[2.5rem] inline-flex flex-col items-center gap-4 animate-in zoom-in duration-500">
              <div className="w-16 h-16 bg-[#00FFAB] rounded-full flex items-center justify-center text-slate-900 shadow-xl shadow-[#00FFAB]/20"><IconCheck /></div>
              <span className="text-[#00FFAB] text-xl font-bold">Success! You are on the list.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto bg-white/5 p-2 rounded-[2rem] border border-white/10 backdrop-blur-sm">
              <input 
                type="email" 
                required 
                placeholder={t.emailPlaceholder} 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                disabled={loading} 
                className="flex-1 px-6 py-4 bg-transparent border-none focus:outline-none focus:ring-0 text-white placeholder:text-slate-500"
              />
              <button 
                type="submit" 
                disabled={loading} 
                className="px-10 py-4 bg-[#00FFAB] text-slate-900 font-black rounded-[1.5rem] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#00FFAB]/20 disabled:opacity-50"
              >
                {loading ? '...' : t.subscribe}
              </button>
            </form>
          )}
          {errorMsg && <p className="text-red-400 mt-4 text-sm">{errorMsg}</p>}
        </div>
      </section>

      <footer className="py-16 text-center text-slate-400 text-sm border-t border-slate-50">
        <div className="flex items-center justify-center gap-2 mb-4 opacity-50 grayscale">
          <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
          <span className="font-bold">LinguaGua</span>
        </div>
        {t.footer}
      </footer>
    </div>
  );
}