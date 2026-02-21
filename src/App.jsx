import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';

// --- 环境配置读取 ---
const firebaseConfig = {
  apiKey: "AIzaSyAjdiPE9OowZuf_gfVhZTFIjFeESFg8Pe8",
  authDomain: "linguagua-b5e23.firebaseapp.com",
  projectId: "linguagua-b5e23",
  storageBucket: "linguagua-b5e23.firebasestorage.app",
  messagingSenderId: "943989183133",
  appId: "1:943989183133:web:745fae40d35d84223afa74",
  measurementId: "G-V4TTFZHZ9G"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'linguagua-app-v1';

// --- 纯内联 SVG 图标组件 ---
const IconGlobe = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
);
const IconChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
);
const IconPlay = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
);
const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);
const IconFileText = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
);

// --- 多语言配置 ---
const translations = {
  en: {
    navHome: "Home", navThai: "Learn Thai", navChinese: "Learn Chinese", navTools: "Tools", navBlog: "Blog",
    heroTitle: "Bridge Your World with LinguaGua",
    heroSub: "The #1 Language bridge for Southeast Asia. Connect with Thai, Chinese, English, Indonesian, and Vietnamese.",
    learnThai: "I want to learn Thai", learnChinese: "I want to learn Chinese",
    subThai: "For Chinese/English speakers", subChinese: "For Thai/Indo/Viet speakers",
    waitlist: "Join the Waitlist", waitlistSub: "Get notified when App launches and claim 1 month Premium!",
    emailPlaceholder: "Email address",
    subscribe: "Notify Me", footer: "© 2026 LinguaGua Language. All rights reserved.",
    blogTitle: "LinguaGua Insights", blogSub: "Tips and stories about mastering Southeast Asian languages.",
    readMore: "Read More",
    catAll: "All", catChinese: "Chinese Learning", catThai: "Thai Learning"
  },
  zh: {
    navHome: "首页", navThai: "学泰语", navChinese: "学中文", navTools: "工具", navBlog: "博客",
    heroTitle: "LinguaGua：连接语言的桥梁",
    heroSub: "东南亚语言互学第一站。轻松掌握泰、中、英、印、越语。",
    learnThai: "我想学泰语", learnChinese: "我想学中文",
    subThai: "面向中/英文用户", subChinese: "面向泰/印尼/越语用户",
    waitlist: "加入等候名单", waitlistSub: "App上线时通知我，并获取一个月会员！",
    emailPlaceholder: "电子邮件地址",
    subscribe: "通知我", footer: "© 2026 LinguaGua Language. 版权所有。",
    blogTitle: "语言洞察", blogSub: "关于掌握东南亚语言的技巧与故事。",
    readMore: "阅读更多",
    catAll: "全部", catChinese: "中文学习", catThai: "泰语学习"
  },
  th: {
    navHome: "หน้าแรก", navThai: "เรียนภาษาไทย", navChinese: "เรียนภาษาจีน", navTools: "เครื่องมือ", navBlog: "บล็อก",
    heroTitle: "LinguaGua: สะพานเชื่อมภาษาของคุณ",
    heroSub: "อันดับ 1 สำหรับการเรียนรู้ภาษาในเอเชียตะวันออกเฉียงใต้ เชื่อมต่อ ไทย จีน อังกฤษ อินโดนีเซีย และเวียดนาม",
    learnThai: "ฉันต้องการเรียนภาษาไทย", learnChinese: "ฉันต้องการเรียนภาษาจีน",
    subThai: "สำหรับผู้พูดภาษาจีน/อังกฤษ", subChinese: "สำหรับผู้พูดภาษาไทย/อินโด/เวียดนาม",
    waitlist: "เข้าร่วม Waitlist", waitlistSub: "รับการแจ้งเตือนเมื่อแอปเปิดตัว และรับรางวัล Premium 1 เดือน!",
    emailPlaceholder: "ที่อยู่อีเมล",
    subscribe: "แจ้งเตือนฉัน", footer: "© 2026 LinguaGua Language. สงวนลิขสิทธิ์",
    blogTitle: "ความรู้จาก LinguaGua", blogSub: "เคล็ดลับและเรื่องราวเกี่ยวกับการเรียนรู้ภาษาในเอเชียตะวันออกเฉียงใต้",
    readMore: "อ่านเพิ่มเติม",
    catAll: "ทั้งหมด", catChinese: "เรียนภาษาจีน", catThai: "เรียนภาษาไทย"
  }
};

const languages = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: '简体中文' },
  { code: 'th', name: 'ไทย' }
];

const blogPosts = [
  {
    id: 1,
    category: "catChinese",
    title: { en: "How to learn Chinese via Indonesian", zh: "如何通过印尼语学中文", th: "วิธีเรียนภาษาจีนผ่านภาษาอินโดนีเซีย" },
    excerpt: { en: "Discover the hidden similarities...", zh: "探索语法和词汇中的隐藏相似之处...", th: "ค้นพบความคล้ายคลึงที่ซ่อนอยู่..." },
    date: "2026-02-15",
    image: "🐼"
  },
  {
    id: 2,
    category: "catThai",
    title: { en: "Thai Tones: Why they aren't scary", zh: "泰语声调：为什么并不可怕", th: "วรรณยุกต์ไทย: ทำไมถึงไม่น่ากลัว" },
    excerpt: { en: "Mastering the 5 tones easily...", zh: "为初学者解释如何掌握 5 个声调...", th: "การฝึกวรรณยุกต์ 5 เสียง..." },
    date: "2026-01-20",
    image: "🐘"
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

// --- 主应用组件 ---
export default function App() {
  const [lang, setLang] = useState('en');
  const [page, setPage] = useState('home');
  const [activeCategory, setActiveCategory] = useState('catAll');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [waitlistData, setWaitlistData] = useState([]);

  const t = translations[lang] || translations.en;
  const isThaiUI = lang === 'th';
  const isChineseUI = lang === 'zh';
  const isEnglishUI = lang === 'en';

  useEffect(() => {
    const initAuth = async () => {
      try {
        // 优先使用环境提供的 Token 进行登录
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) { 
        console.error("Auth failed", err); 
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    // 使用严格路径结构
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'waitlist');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setWaitlistData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error("Snapshot error:", err));
    return () => unsubscribe();
  }, [user]);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !user) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'waitlist'), {
        email, 
        lang, 
        createdAt: serverTimestamp(), 
        source: 'web_preview'
      });
      setSent(true);
      setEmail('');
    } catch (err) { 
      console.error("Save failed", err); 
    }
    finally { setLoading(false); }
  };

  const filteredPosts = activeCategory === 'catAll' ? blogPosts : blogPosts.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans">
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 h-16">
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setPage('home')}>
            <div className="w-10 h-10 bg-[#00FFAB] rounded-xl flex items-center justify-center shadow-lg"><span className="text-xl">🐸</span></div>
            <span className="text-xl font-black">LinguaGua</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-semibold text-sm">
            <button onClick={() => setPage('home')} className={page === 'home' ? 'text-[#00FFAB]' : ''}>{t.navHome}</button>
            <button onClick={() => setPage('blog')} className={page === 'blog' ? 'text-[#00FFAB]' : ''}>{t.navBlog}</button>
            <div className="relative group">
              <button className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border">
                <IconGlobe /><span className="uppercase">{lang}</span>
              </button>
              <div className="absolute right-0 top-full mt-2 w-32 bg-white shadow-xl rounded-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                {languages.map(l => (
                  <button key={l.code} onClick={() => setLang(l.code)} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs">{l.name}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20">
        {page === 'home' ? (
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16 animate-up">
              <h1 className="text-4xl md:text-6xl font-black mb-6">{t.heroTitle}</h1>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">{t.heroSub}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <FeatureCard title={t.learnThai} sub={t.subThai} icon="🐘" color="bg-gradient-to-br from-[#00FFAB] to-[#00D1FF]" onClick={() => setPage('thai')} tNav={t.navThai}/>
              <FeatureCard title={t.learnChinese} sub={t.subChinese} icon="🐼" color="bg-gradient-to-br from-slate-800 to-slate-600" onClick={() => setPage('chinese')} tNav={t.navChinese}/>
            </div>
          </div>
        ) : page === 'blog' ? (
          <div className="max-w-6xl mx-auto px-6 animate-up">
            <h1 className="text-4xl font-black text-center mb-12">{t.blogTitle}</h1>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map(post => <BlogCard key={post.id} post={post} lang={lang} tReadMore={t.readMore} tCategory={t[post.category]}/>)}
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto px-6 text-center animate-up">
             <h2 className="text-5xl font-black mb-8">{page === 'thai' ? t.navThai : t.navChinese}</h2>
             <p className="text-xl text-slate-500 mb-12">即将上线！</p>
             <button onClick={() => setPage('home')} className="text-[#00FFAB] font-bold">返回首页</button>
          </div>
        )}
      </main>

      <section className="bg-slate-900 py-24 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black mb-4">{t.waitlist}</h2>
          <p className="text-slate-400 mb-10">{t.waitlistSub}</p>
          {sent ? (
            <div className="bg-[#00FFAB]/20 border border-[#00FFAB] p-6 rounded-2xl inline-flex items-center gap-3">
              <IconCheck /><span className="text-[#00FFAB] font-bold">成功！您已在等候名单中。</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input type="email" required placeholder={t.emailPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} className="flex-1 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00FFAB]"/>
              <button type="submit" disabled={loading} className="px-8 py-4 bg-[#00FFAB] text-slate-900 font-black rounded-2xl hover:scale-105 transition-all">{loading ? '...' : t.subscribe}</button>
            </form>
          )}
        </div>
      </section>
      <footer className="py-12 text-center text-slate-400 text-sm border-t border-slate-100">{t.footer}</footer>
    </div>
  );
}