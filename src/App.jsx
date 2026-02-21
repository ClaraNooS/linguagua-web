import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, deleteDoc, doc, serverTimestamp, onSnapshot, query } from 'firebase/firestore';

/**
 * --- 安全的 Firebase 配置读取 ---
 * 已更新为你提供的真实配置信息
 */
const getFirebaseConfig = () => {
  // 默认使用你提供的配置
  let config = {
    apiKey: "AIzaSyAjdiPE9OowZuf_gfVhZTFIjFeESFg8Pe8",
    authDomain: "linguagua-b5e23.firebaseapp.com",
    projectId: "linguagua-b5e23",
    storageBucket: "linguagua-b5e23.firebasestorage.app",
    messagingSenderId: "943989183133",
    appId: "1:943989183133:web:745fae40d35d84223afa74",
    measurementId: "G-V4TTFZHZ9G"
  };

  // 如果环境中有注入的配置，则优先使用环境配置
  if (typeof __firebase_config !== 'undefined' && __firebase_config) {
    try {
      const envConfig = JSON.parse(__firebase_config);
      config = { ...config, ...envConfig };
    } catch (e) {
      console.error("Failed to parse __firebase_config", e);
    }
  }
  return config;
};

let firebaseApp = null;
let auth = null;
let db = null;

const firebaseConfig = getFirebaseConfig();

try {
  // 检查是否已填入有效 API Key
  if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "在此处填入你的真实API_KEY") {
    firebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp);
  }
} catch (error) {
  console.error("Firebase Initialization Error:", error);
}

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
const IconPlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
);
const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
);
const IconImage = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
);
const IconLogout = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
);

// --- 多语言翻译字典 ---
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
    catAll: "All", catChinese: "Learn Chinese", catThai: "Learn Thai",
    adminTitle: "Manage Content", backToBlog: "Back to Blog", addPost: "Add New Post", exitAdmin: "Exit Admin"
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
    catAll: "全部", catChinese: "学中文", catThai: "学泰语",
    adminTitle: "内容管理后台", backToBlog: "返回博客", addPost: "发布新文章", exitAdmin: "退出管理"
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
    catAll: "全部", catChinese: "學中文", catThai: "學泰語",
    adminTitle: "內容管理後台", backToBlog: "返回部落格", addPost: "發佈新文章", exitAdmin: "退出管理"
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
    catAll: "ทั้งหมด", catChinese: "เรียนภาษาจีน", catThai: "เรียนภาษาไทย",
    adminTitle: "จัดการเนื้อหา", backToBlog: "กลับไปที่บล็อก", addPost: "เพิ่มบทความใหม่", exitAdmin: "ออกจากระบบ"
  }
};

const languages = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: '简体中文' },
  { code: 'zt', name: '繁體中文' },
  { code: 'th', name: 'ไทย' }
];

// --- 渲染组件 ---
const FeatureCard = ({ title, sub, icon, color, onClick, tNav }) => (
  <div onClick={onClick} className={`group cursor-pointer relative overflow-hidden rounded-[2rem] p-8 text-white shadow-2xl transition-all hover:-translate-y-2 ${color}`}>
    <div className="relative z-10 flex flex-col items-center">
      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-md">
        <span className="text-5xl">{icon}</span>
      </div>
      <h3 className="text-2xl font-bold mb-2 text-center">{title}</h3>
      <p className="opacity-80 text-sm mb-6 text-center">{sub}</p>
      <div className="px-6 py-2 bg-white text-slate-800 rounded-full font-bold flex items-center gap-2 group-hover:gap-4 transition-all">
        {tNav} <IconChevronRight />
      </div>
    </div>
  </div>
);

const BlogCard = ({ post, lang, tReadMore, tCategory, isAdmin, onDelete }) => (
  <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full relative">
    {isAdmin && (
      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(post.id); }}
        className="absolute top-4 right-4 z-20 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
        title="Delete Post"
      >
        <IconTrash />
      </button>
    )}
    <div className="h-56 bg-slate-100 overflow-hidden relative flex items-center justify-center">
      {post.imageUrl ? (
        <img 
          src={post.imageUrl} 
          alt="Blog cover" 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      ) : (
        <span className="text-7xl group-hover:scale-110 transition-transform duration-500">
          {post.category === 'catThai' ? '🐘' : '🐼'}
        </span>
      )}
    </div>
    <div className="p-8 flex flex-col flex-1">
      <div className="flex items-center gap-3 mb-4">
        <span className="px-3 py-1 bg-[#00FFAB]/10 text-[#008F60] text-xs font-bold rounded-full uppercase tracking-wider">{tCategory}</span>
        <span className="text-slate-300 text-xs">
          {post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
        </span>
      </div>
      <h3 className="text-xl font-bold mb-4 text-slate-900 leading-snug group-hover:text-[#00FFAB] transition-colors line-clamp-2">
        {post.title[lang] || post.title.en}
      </h3>
      <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed">
        {post.excerpt[lang] || post.excerpt.en}
      </p>
      <div className="mt-auto pt-4 flex items-center gap-2 text-[#00FFAB] font-bold text-sm cursor-pointer">
        {tReadMore} <IconChevronRight />
      </div>
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);
  const [blogPosts, setBlogPosts] = useState([]);
  
  const [newPost, setNewPost] = useState({
    category: 'catThai',
    imageUrl: '',
    title: { en: '', zh: '', zt: '', th: '' },
    excerpt: { en: '', zh: '', zt: '', th: '' }
  });

  const t = translations[lang] || translations.en;

  // 1. 初始化 Firebase 认证
  useEffect(() => {
    if (!auth) return;

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

  // 2. 实时同步博客数据
  useEffect(() => {
    if (!user || !db) return;
    const blogQuery = collection(db, 'artifacts', appId, 'public', 'data', 'blogPosts');
    const unsubscribe = onSnapshot(blogQuery, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBlogPosts(posts.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    }, (err) => {
      console.error("Fetch Blogs Failed:", err);
    });
    return () => unsubscribe();
  }, [user]);

  // 处理 Logo 点击彩蛋触发管理员模式
  const handleLogoClick = () => {
    const newCount = logoClicks + 1;
    if (newCount >= 5) {
      setLogoClicks(0);
      if (!isAdmin) {
        const pass = prompt("请输入管理员密码:");
        if (pass === "admin123") {
          setIsAdmin(true);
          alert("管理员模式已激活！");
        }
      } else {
        setIsAdmin(false);
        alert("管理员模式已关闭。");
      }
    } else {
      setLogoClicks(newCount);
      // 3秒内未继续点击则重置
      setTimeout(() => setLogoClicks(0), 3000);
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !user || !db) return;
    setLoading(true);
    setErrorMsg('');
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'waitlist'), {
        email, lang, createdAt: serverTimestamp(), source: 'production_web'
      });
      setSent(true);
      setEmail('');
    } catch (err) {
      setErrorMsg(err.message || "提交失败，请重试。");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPost = async (e) => {
    e.preventDefault();
    if (!isAdmin || !db) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'blogPosts'), {
        ...newPost,
        createdAt: serverTimestamp()
      });
      setNewPost({
        category: 'catThai',
        imageUrl: '',
        title: { en: '', zh: '', zt: '', th: '' },
        excerpt: { en: '', zh: '', zt: '', th: '' }
      });
      alert("博文发布成功！");
      setPage('blog');
    } catch (err) {
      alert("发布失败: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!db || !window.confirm("确定要删除这篇博文吗？")) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'blogPosts', postId));
    } catch (err) {
      alert("删除失败: " + err.message);
    }
  };

  const filteredPosts = activeCategory === 'catAll' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === activeCategory);

  const shouldShowLangInput = (langCode) => {
    if (newPost.category === 'catThai') return langCode !== 'th';
    if (newPost.category === 'catChinese') return langCode !== 'zh' && langCode !== 'zt';
    return true;
  };

  // 配置缺失提示界面
  if (!firebaseApp) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-10 text-center">
        <span className="text-6xl mb-6">🐸</span>
        <h1 className="text-2xl font-bold mb-4">LinguaGua 正在启动中...</h1>
        <p className="text-slate-400 max-w-md">正在连接数据库。如果长时间显示此页面，请检查 Firebase 配置是否正确。</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-[#00FFAB]/30">
      {/* 导航栏 */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 h-16">
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer select-none active:scale-95 transition-transform" onClick={handleLogoClick}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-colors ${isAdmin ? 'bg-slate-900' : 'bg-[#00FFAB]'}`}>
              <span className="text-xl">🐸</span>
            </div>
            <span className="text-xl font-black">LinguaGua</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-semibold text-sm">
            <button onClick={() => setPage('home')} className={page === 'home' ? 'text-[#00FFAB]' : 'hover:text-[#00FFAB]'}>{t.navHome}</button>
            {t.navThai && <button onClick={() => setPage('thai')} className={page === 'thai' ? 'text-[#00FFAB]' : 'hover:text-[#00FFAB]'}>{t.navThai}</button>}
            {t.navChinese && <button onClick={() => setPage('chinese')} className={page === 'chinese' ? 'text-[#00FFAB]' : 'hover:text-[#00FFAB]'}>{t.navChinese}</button>}
            <button onClick={() => setPage('blog')} className={page === 'blog' || page === 'admin' ? 'text-[#00FFAB]' : 'hover:text-[#00FFAB]'}>{t.navBlog}</button>
            
            {isAdmin && (
              <button onClick={() => setIsAdmin(false)} className="text-red-500 font-bold px-3 py-1 bg-red-50 rounded-full border border-red-100 hover:bg-red-100 transition-all flex items-center gap-2">
                <IconLogout /> {t.exitAdmin}
              </button>
            )}

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

      <main className="pt-32 pb-20">
        {page === 'home' ? (
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight">{t.heroTitle}</h1>
              <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">{t.heroSub}</p>
            </div>
            <div className={`grid ${t.learnThai && t.learnChinese ? 'md:grid-cols-2' : 'grid-cols-1'} gap-8 max-w-4xl mx-auto`}>
              {t.learnThai && <div className={t.learnChinese ? "" : "max-w-md mx-auto w-full"}><FeatureCard title={t.learnThai} sub={t.subThai} icon="🐘" color="bg-gradient-to-br from-[#00FFAB] to-[#00D1FF]" onClick={() => setPage('thai')} tNav={t.navThai}/></div>}
              {t.learnChinese && <div className={t.learnThai ? "" : "max-w-md mx-auto w-full"}><FeatureCard title={t.learnChinese} sub={t.subChinese} icon="🐼" color="bg-gradient-to-br from-slate-800 to-slate-600" onClick={() => setPage('chinese')} tNav={t.navChinese}/></div>}
            </div>
          </div>
        ) : page === 'blog' ? (
          <div className="max-w-6xl mx-auto px-6 animate-in fade-in duration-500">
            <h1 className="text-4xl font-black text-center mb-8">{t.blogTitle}</h1>
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {['catAll', 'catChinese', 'catThai'].map((catKey) => (
                <button key={catKey} onClick={() => setActiveCategory(catKey)} className={`px-6 py-2 rounded-full text-sm font-bold transition-all border ${activeCategory === catKey ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-500 border-slate-200 hover:border-[#00FFAB] hover:text-[#00FFAB]'}`}>
                  {t[catKey]}
                </button>
              ))}
              {isAdmin && (
                <button onClick={() => setPage('admin')} className="px-6 py-2 rounded-full text-sm font-bold bg-slate-900 text-[#00FFAB] flex items-center gap-2 shadow-lg hover:scale-105 transition-transform">
                  <IconPlus /> {t.addPost}
                </button>
              )}
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map(post => (
                <BlogCard key={post.id} post={post} lang={lang} tReadMore={t.readMore} tCategory={t[post.category]} isAdmin={isAdmin} onDelete={handleDeletePost} />
              ))}
              {filteredPosts.length === 0 && (
                <div className="col-span-full py-20 text-center text-slate-400 font-bold">目前还没有相关博文。</div>
              )}
            </div>
          </div>
        ) : page === 'admin' ? (
          <div className="max-w-3xl mx-auto px-6 animate-in slide-in-from-right-10 duration-500">
            <div className="flex items-center justify-between mb-12">
              <h1 className="text-3xl font-black text-slate-900">{t.adminTitle}</h1>
              <button onClick={() => setPage('blog')} className="text-slate-500 text-sm font-bold flex items-center gap-2 hover:text-slate-900 transition-colors">
                <IconChevronRight /> {t.backToBlog}
              </button>
            </div>
            <form onSubmit={handleAddPost} className="space-y-8 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400">分类</label>
                  <select value={newPost.category} onChange={e => setNewPost({...newPost, category: e.target.value})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#00FFAB] focus:border-transparent transition-all outline-none">
                    <option value="catThai">学泰语</option>
                    <option value="catChinese">学中文</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><IconImage /> 封面图片 (URL)</label>
                  <input type="url" value={newPost.imageUrl} onChange={e => setNewPost({...newPost, imageUrl: e.target.value})} placeholder="https://images.unsplash.com/..." className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#00FFAB] outline-none transition-all" />
                </div>
              </div>
              
              {newPost.imageUrl && (
                <div className="animate-in fade-in slide-in-from-top-4">
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">封面预览</label>
                  <div className="w-full h-48 rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-inner flex items-center justify-center">
                    <img src={newPost.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400">博文标题</label>
                {languages.filter(l => shouldShowLangInput(l.code)).map(l => (
                  <div key={l.code} className="flex items-center gap-4 animate-in fade-in zoom-in duration-300">
                    <span className="w-8 text-[10px] font-bold text-slate-400">{l.code.toUpperCase()}</span>
                    <input type="text" required value={newPost.title[l.code]} onChange={e => setNewPost({...newPost, title: {...newPost.title, [l.code]: e.target.value}})} placeholder={`Title in ${l.name}`} className="flex-1 p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#00FFAB] outline-none" />
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400">博文摘要 (Summary)</label>
                {languages.filter(l => shouldShowLangInput(l.code)).map(l => (
                  <div key={l.code} className="flex items-center gap-4 animate-in fade-in zoom-in duration-300">
                    <span className="w-8 text-[10px] font-bold text-slate-400">{l.code.toUpperCase()}</span>
                    <textarea required value={newPost.excerpt[l.code]} onChange={e => setNewPost({...newPost, excerpt: {...newPost.excerpt, [l.code]: e.target.value}})} placeholder={`Summary in ${l.name}`} rows="2" className="flex-1 p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#00FFAB] outline-none" />
                  </div>
                ))}
              </div>
              <button type="submit" disabled={loading} className="w-full py-5 bg-[#00FFAB] text-slate-900 font-black rounded-2xl shadow-xl shadow-[#00FFAB]/20 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50">
                {loading ? '发布中...' : '发布到线上数据库'}
              </button>
            </form>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto px-6 text-center py-20 animate-in zoom-in duration-300">
             <h2 className="text-5xl font-black mb-8 text-slate-900">{page === 'thai' ? t.navThai : t.navChinese}</h2>
             <p className="text-xl text-slate-500 mb-12">即将上线应用商店，敬请期待！</p>
             <button onClick={() => setPage('home')} className="px-10 py-4 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-all shadow-lg">返回首页</button>
          </div>
        )}
      </main>

      <section className="bg-slate-900 py-32 text-white overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-[#00FFAB]/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">{t.waitlist}</h2>
          <p className="text-slate-400 mb-12 text-lg">{t.waitlistSub}</p>
          {sent ? (
            <div className="bg-[#00FFAB]/20 border border-[#00FFAB]/40 p-10 rounded-[2.5rem] inline-flex flex-col items-center gap-4 animate-in zoom-in duration-500">
              <div className="w-16 h-16 bg-[#00FFAB] rounded-full flex items-center justify-center text-slate-900 shadow-xl shadow-[#00FFAB]/20"><IconCheck /></div>
              <span className="text-[#00FFAB] text-xl font-bold">成功！你已在名单中。</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto bg-white/5 p-2 rounded-[2rem] border border-white/10 backdrop-blur-sm shadow-2xl">
              <input type="email" required placeholder={t.emailPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} className="flex-1 px-8 py-5 bg-transparent border-none focus:outline-none focus:ring-0 text-white placeholder:text-slate-500 text-lg" />
              <button type="submit" disabled={loading} className="px-10 py-5 bg-[#00FFAB] text-slate-900 font-black rounded-[1.6rem] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#00FFAB]/20 disabled:opacity-50 text-lg">
                {loading ? '...' : t.subscribe}
              </button>
            </form>
          )}
          {errorMsg && <p className="text-red-400 mt-6 text-xs font-mono bg-red-400/10 p-3 rounded-lg border border-red-400/20 inline-block">{errorMsg}</p>}
        </div>
      </section>

      <footer className="py-16 text-center text-slate-400 text-sm border-t border-slate-50 bg-slate-50/50">
        <div className="flex items-center justify-center gap-2 mb-4 opacity-50 grayscale">
          <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center font-black">L</div>
          <span className="font-black tracking-tighter">LinguaGua</span>
        </div>
        {t.footer}
      </footer>
    </div>
  );
}