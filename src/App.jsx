import React, { useState, useEffect } from 'react';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, deleteDoc, updateDoc, doc, serverTimestamp, onSnapshot } from 'firebase/firestore';

// --- Firebase 配置 ---
const firebaseConfig = {
  apiKey: "AIzaSyAjdiPE9OowZuf_gfVhZTFIjFeESFg8Pe8",
  authDomain: "linguagua-b5e23.firebaseapp.com",
  projectId: "linguagua-b5e23",
  storageBucket: "linguagua-b5e23.firebasestorage.app",
  messagingSenderId: "943989183133",
  appId: "1:943989183133:web:745fae40d35d84223afa74",
  measurementId: "G-V4TTFZHZ9G"
};

// 初始化逻辑
let firebaseApp, auth, db;
try {
  firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(firebaseApp);
  db = getFirestore(firebaseApp);
} catch (error) {
  console.error("Firebase Init Error:", error);
}

const appId = "linguagua-app-v1";

// --- 纯内联 SVG 图标 ---
const IconGlobe = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
);
const IconChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
);
const IconChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
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
const IconEdit = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
);
const IconImage = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
);
const IconLogout = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
);
const IconMenu = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
);
const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);

// --- 多语言翻译 ---
const translations = {
  en: {
    navHome: "Home", navThai: "Learn Thai", navChinese: "Learn Chinese", navBlog: "Blog",
    heroTitle: "Bridge Your World with LinguaGua",
    heroSub: "Southeast Asia's language bridge. Connect with Thai, Chinese, and more.",
    learnThai: "I want to learn Thai", learnChinese: "I want to learn Chinese",
    subThai: "For Chinese/English speakers", subChinese: "For Thai/Indo/Viet speakers",
    waitlist: "Join the Waitlist", waitlistSub: "Get notified when App launches!",
    emailPlaceholder: "Email address",
    subscribe: "Notify Me", footer: "© 2026 LinguaGua Language. All rights reserved.",
    blogTitle: "Insights", readMore: "Read More", 
    catAll: "All", catChinese: "Learn Chinese", catThai: "Learn Thai",
    adminTitle: "Manage Content", backToBlog: "Back to Blog", addPost: "Add New Post", 
    exitAdmin: "Exit Admin", editPost: "Edit Post", updatePost: "Update Post", cancel: "Cancel",
    backToList: "Back to List", menu: "Menu"
  },
  zh: {
    navHome: "首页", navThai: "学泰语", navBlog: "博客",
    heroTitle: "LinguaGua：连接语言的桥梁",
    heroSub: "东南亚语言互学第一站。轻松掌握泰、中、英、印、越语。",
    learnThai: "我想学泰语", 
    subThai: "面向中文用户",
    waitlist: "加入等候名单", waitlistSub: "App上线时通知我！",
    emailPlaceholder: "电子邮件地址",
    subscribe: "通知我", footer: "© 2026 LinguaGua Language. 版权所有。",
    blogTitle: "语言洞察", readMore: "阅读更多",
    catAll: "全部", catChinese: "学中文", catThai: "学泰语",
    adminTitle: "内容管理后台", backToBlog: "返回博客", addPost: "发布新文章", 
    exitAdmin: "退出管理", editPost: "修改博文", updatePost: "更新线上内容", cancel: "取消",
    backToList: "返回列表", menu: "菜单"
  },
  zt: {
    navHome: "首頁", navThai: "學泰語", navBlog: "部落格",
    heroTitle: "LinguaGua：連接語言的橋樑",
    heroSub: "東南亞語言互學第一站。輕鬆掌握泰、中、英、印、越語。",
    learnThai: "我想學泰語", 
    subThai: "面向中文用戶",
    waitlist: "加入等候名單", waitlistSub: "App上線時通知我！",
    emailPlaceholder: "電子郵件地址",
    subscribe: "通知我", footer: "© 2026 LinguaGua Language. 版權所有。",
    blogTitle: "語言洞察", readMore: "閱讀更多",
    catAll: "全部", catChinese: "學中文", catThai: "學泰語",
    adminTitle: "內容管理後台", backToBlog: "返回部落格", addPost: "發佈新文章", 
    exitAdmin: "退出管理", editPost: "修改博文", updatePost: "更新線上內容", cancel: "取消",
    backToList: "返回列表", menu: "菜單"
  },
  th: {
    navHome: "หน้าแรก", navChinese: "เรียนภาษาจีน", navBlog: "บล็อก",
    heroTitle: "LinguaGua: สะพานเชื่อมภาษาของคุณ",
    heroSub: "อันดับ 1 สำหรับการเรียนรู้ภาษาในเอเชียตะวันออกเฉียงใต้",
    learnChinese: "ฉันต้องการเรียนภาษาจีน",
    subChinese: "สำหรับผู้พูดภาษาไทย",
    waitlist: "เข้าร่วม Waitlist", waitlistSub: "รับการแจ้งเตือนเมื่อแอปเปิดตัว!",
    emailPlaceholder: "ที่อยู่อีเมล",
    subscribe: "แจ้งเตือนฉัน", footer: "© 2026 LinguaGua Language. สงวนลิขสิทธิ์",
    blogTitle: "ความรู้จาก LinguaGua", readMore: "อ่านเพิ่มเติม",
    catAll: "ทั้งหมด", catChinese: "เรียนภาษาจีน", catThai: "เรียนภาษาไทย",
    adminTitle: "จัดการเนื้อหา", backToBlog: "กลับไปที่บล็อก", addPost: "เพิ่มบทความใหม่", 
    exitAdmin: "ออกจากระบบ", editPost: "แก้ไขบทความ", updatePost: "อัปเดตเนื้อหา", cancel: "ยกเลิก",
    backToList: "กลับไปที่รายการ", menu: "เมนู"
  }
};

const languages = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: '简体中文' },
  { code: 'zt', name: '繁體中文' },
  { code: 'th', name: 'ไทย' }
];

// --- 子组件 ---
const BlogCard = ({ post, lang, tReadMore, tCategory, isAdmin, onDelete, onEdit, onReadMore }) => (
  <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full relative">
    {isAdmin && (
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <button 
          onClick={(e) => { e.stopPropagation(); onEdit(post); }} 
          className="p-2 bg-white text-slate-600 rounded-full hover:bg-[#00FFAB] hover:text-slate-900 shadow-lg transition-all"
        >
          <IconEdit />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(post.id); }} 
          className="p-2 bg-white text-red-500 rounded-full hover:bg-red-500 hover:text-white shadow-lg transition-all"
        >
          <IconTrash />
        </button>
      </div>
    )}
    <div className="h-56 bg-slate-100 overflow-hidden flex items-center justify-center relative cursor-pointer" onClick={() => onReadMore(post)}>
      {post.imageUrl ? (
        <img 
          src={post.imageUrl} 
          alt="" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1000&auto=format&fit=crop"; }}
        />
      ) : (
        <span className="text-6xl">{post.category === 'catThai' ? '🐘' : '🐼'}</span>
      )}
    </div>
    <div className="p-8 flex flex-col flex-1">
      <div className="flex items-center gap-3 mb-4">
        <span className="px-3 py-1 bg-[#00FFAB]/10 text-[#008F60] text-xs font-bold rounded-full">{tCategory}</span>
        <span className="text-slate-300 text-xs">{post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}</span>
      </div>
      <h3 className="text-xl font-bold mb-4 text-slate-900 line-clamp-2 cursor-pointer hover:text-[#00FFAB] transition-colors" onClick={() => onReadMore(post)}>
        {post.title[lang] || post.title.en}
      </h3>
      <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed">{post.excerpt[lang] || post.excerpt.en}</p>
      <button 
        onClick={() => onReadMore(post)}
        className="mt-auto flex items-center gap-2 text-[#00FFAB] font-bold text-sm group/btn hover:gap-3 transition-all w-fit"
      >
        {tReadMore} <IconChevronRight />
      </button>
    </div>
  </div>
);

const FeatureCard = ({ title, sub, icon, color, onClick, tNav }) => (
  <div onClick={onClick} className={`group cursor-pointer relative overflow-hidden rounded-[2rem] p-8 text-white shadow-2xl transition-all hover:-translate-y-1 ${color}`}>
    <div className="relative z-10 flex flex-col items-center text-center">
      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-md"><span className="text-5xl">{icon}</span></div>
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="opacity-80 text-sm mb-6">{sub}</p>
      <div className="px-6 py-2 bg-white text-slate-800 rounded-full font-bold flex items-center gap-2">{tNav} <IconChevronRight /></div>
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [editingId, setEditingId] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  const [newPost, setNewPost] = useState({
    category: 'catThai',
    imageUrl: '',
    title: { en: '', zh: '', zt: '', th: '' },
    excerpt: { en: '', zh: '', zt: '', th: '' }
  });

  const t = translations[lang] || translations.en;

  // 修改网页 Title 的 Effect
  useEffect(() => {
    document.title = "LinguaGua - Bridge Your World";
  }, []);

  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      let isAuthenticated = false;
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        try {
          await signInWithCustomToken(auth, __initial_auth_token);
          isAuthenticated = true;
        } catch (err) {
          console.warn("Custom token failed, falling back to anonymous.");
        }
      }
      if (!isAuthenticated) {
        try {
          await signInAnonymously(auth);
        } catch (err) {
          console.error("Auth Failed permanently:", err.message);
          setErrorMsg("连接服务器失败，请稍后刷新。");
        }
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !db) return;
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'blogPosts');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBlogPosts(posts.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    }, (err) => console.error("Snapshot Error:", err));
    return () => unsubscribe();
  }, [user]);

  const handleLogoClick = () => {
    const newCount = logoClicks + 1;
    if (newCount >= 5) {
      setLogoClicks(0);
      if (!isAdmin) {
        const pass = prompt("管理员密码:");
        if (pass === "admin123") setIsAdmin(true);
      }
    } else {
      setLogoClicks(newCount);
      setTimeout(() => setLogoClicks(0), 3000);
    }
  };

  const navigateTo = (p) => {
    setPage(p);
    setMobileMenuOpen(false);
    setEditingId(null);
    window.scrollTo(0, 0);
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !user || !db) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'waitlist'), {
        email, lang, createdAt: serverTimestamp(), source: 'production_web'
      });
      setSent(true);
      setEmail('');
    } catch (err) { setErrorMsg("Submission failed."); } finally { setLoading(false); }
  };

  const startEditing = (post) => {
    setEditingId(post.id);
    setNewPost({
      category: post.category,
      imageUrl: post.imageUrl || '',
      title: { ...post.title },
      excerpt: { ...post.excerpt }
    });
    setPage('admin');
    setMobileMenuOpen(false);
  };

  const handleReadMore = (post) => {
    setSelectedPost(post);
    setPage('post_detail');
    window.scrollTo(0, 0);
  };

  const handleSavePost = async (e) => {
    e.preventDefault();
    if (!isAdmin || !db) return;
    setLoading(true);
    try {
      if (editingId) {
        const postRef = doc(db, 'artifacts', appId, 'public', 'data', 'blogPosts', editingId);
        await updateDoc(postRef, {
          ...newPost,
          updatedAt: serverTimestamp()
        });
        alert("博文更新成功！");
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'blogPosts'), {
          ...newPost,
          createdAt: serverTimestamp()
        });
        alert("博文发布成功！");
      }
      setEditingId(null);
      setNewPost({ category: 'catThai', imageUrl: '', title: { en: '', zh: '', zt: '', th: '' }, excerpt: { en: '', zh: '', zt: '', th: '' } });
      setPage('blog');
    } catch (err) { 
      alert("操作失败: " + err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  const shouldShowLangInput = (code) => {
    if (newPost.category === 'catThai') return code !== 'th';
    if (newPost.category === 'catChinese') return code !== 'zh' && code !== 'zt';
    return true;
  };

  if (!firebaseApp) return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center font-bold">Linguagua 初始化中...</div>;

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-[#00FFAB]/30 overflow-x-hidden">
      {/* 导航栏 */}
      <nav className="fixed top-0 w-full z-[100] bg-white/95 backdrop-blur-md border-b border-slate-100 h-16 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer select-none" onClick={handleLogoClick}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-colors ${isAdmin ? 'bg-slate-900' : 'bg-[#00FFAB]'}`}><span className="text-xl">🐸</span></div>
          <span className="text-xl font-black text-slate-900">LinguaGua</span>
        </div>

        {/* 桌面端导航 */}
        <div className="hidden md:flex items-center gap-6 text-sm font-semibold">
          <button onClick={() => navigateTo('home')} className={page === 'home' ? 'text-[#00FFAB]' : ''}>{t.navHome}</button>
          {t.navThai && <button onClick={() => navigateTo('thai')} className={page === 'thai' ? 'text-[#00FFAB]' : ''}>{t.navThai}</button>}
          {t.navChinese && <button onClick={() => navigateTo('chinese')} className={page === 'chinese' ? 'text-[#00FFAB]' : ''}>{t.navChinese}</button>}
          <button onClick={() => navigateTo('blog')} className={page === 'blog' || page === 'admin' || page === 'post_detail' ? 'text-[#00FFAB]' : ''}>{t.navBlog}</button>
          {isAdmin && (
            <button onClick={() => { setIsAdmin(false); setEditingId(null); }} className="text-red-500 flex items-center gap-2 bg-red-50 px-3 py-1 rounded-full transition-all hover:bg-red-100">
              <IconLogout /> {t.exitAdmin}
            </button>
          )}
          
          <div className="relative group">
            <button className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 uppercase text-[10px] tracking-widest font-bold">
              <IconGlobe /> {lang}
            </button>
            <div className="absolute right-0 top-full mt-2 w-32 bg-white shadow-2xl rounded-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all border border-slate-100">
              {languages.map(l => <button key={l.code} onClick={() => setLang(l.code)} className="w-full text-left px-4 py-2 hover:bg-[#00FFAB]/10 text-xs transition-colors">{l.name}</button>)}
            </div>
          </div>
        </div>

        {/* 移动端菜单按钮 */}
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
          {mobileMenuOpen ? <IconX /> : <IconMenu />}
        </button>
      </nav>

      {/* 移动端全屏菜单 */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[90] bg-white pt-24 px-6 md:hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col gap-6 text-2xl font-black">
            <button onClick={() => navigateTo('home')} className={`text-left ${page === 'home' ? 'text-[#00FFAB]' : ''}`}>{t.navHome}</button>
            {t.navThai && <button onClick={() => navigateTo('thai')} className={`text-left ${page === 'thai' ? 'text-[#00FFAB]' : ''}`}>{t.navThai}</button>}
            {t.navChinese && <button onClick={() => navigateTo('chinese')} className={`text-left ${page === 'chinese' ? 'text-[#00FFAB]' : ''}`}>{t.navChinese}</button>}
            <button onClick={() => navigateTo('blog')} className={`text-left ${page === 'blog' ? 'text-[#00FFAB]' : ''}`}>{t.navBlog}</button>
            
            <div className="h-px bg-slate-100 my-4"></div>
            
            <p className="text-xs uppercase text-slate-400 tracking-widest font-bold mb-2">{t.menu} - Language</p>
            <div className="grid grid-cols-2 gap-4">
              {languages.map(l => (
                <button 
                  key={l.code} 
                  onClick={() => { setLang(l.code); setMobileMenuOpen(false); }} 
                  className={`px-4 py-3 rounded-2xl border text-sm font-bold text-center transition-all ${lang === l.code ? 'bg-[#00FFAB] border-[#00FFAB] text-slate-900' : 'border-slate-100'}`}
                >
                  {l.name}
                </button>
              ))}
            </div>

            {isAdmin && (
               <button onClick={() => { setIsAdmin(false); setMobileMenuOpen(false); }} className="mt-8 text-red-500 text-lg flex items-center gap-2">
                 <IconLogout /> {t.exitAdmin}
               </button>
            )}
          </div>
        </div>
      )}

      <main className="pt-32 pb-20 overflow-x-hidden">
        {page === 'home' ? (
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h1 className="text-4xl md:text-7xl font-black mb-6 tracking-tight leading-tight">{t.heroTitle}</h1>
              <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto">{t.heroSub}</p>
            </div>
            <div className={`grid ${t.learnThai && t.learnChinese ? 'md:grid-cols-2' : 'grid-cols-1'} gap-8 max-w-4xl mx-auto`}>
              {t.learnThai && <FeatureCard title={t.learnThai} sub={t.subThai} icon="🐘" color="bg-gradient-to-br from-[#00FFAB] to-[#00D1FF]" onClick={() => setPage('thai')} tNav={t.navThai}/>}
              {t.learnChinese && <FeatureCard title={t.learnChinese} sub={t.subChinese} icon="🐼" color="bg-gradient-to-br from-slate-800 to-slate-600" onClick={() => setPage('chinese')} tNav={t.navChinese}/>}
            </div>
          </div>
        ) : page === 'blog' ? (
          <div className="max-w-6xl mx-auto px-6 animate-in fade-in">
            <h1 className="text-3xl md:text-4xl font-black text-center mb-8">{t.blogTitle}</h1>
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {['catAll', 'catChinese', 'catThai'].map(key => <button key={key} onClick={() => setActiveCategory(key)} className={`px-5 py-2 rounded-full text-sm font-bold transition-all border ${activeCategory === key ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 hover:border-[#00FFAB]'}`}>{t[key]}</button>)}
              {isAdmin && (
                <button onClick={() => { setEditingId(null); setPage('admin'); }} className="px-5 py-2 rounded-full text-sm font-bold bg-[#00FFAB] text-slate-900 flex items-center gap-2 shadow-lg hover:scale-105 transition-transform">
                  <IconPlus /> {t.addPost}
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.filter(p => activeCategory === 'catAll' || p.category === activeCategory).map(post => (
                <BlogCard key={post.id} post={post} lang={lang} tReadMore={t.readMore} tCategory={t[post.category]} isAdmin={isAdmin} onDelete={(id) => { if(window.confirm("确定删除吗？")) deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'blogPosts', id)); }} onEdit={startEditing} onReadMore={handleReadMore} />
              ))}
              {blogPosts.length === 0 && <div className="col-span-full py-20 text-center text-slate-400 font-bold">目前还没有博文。</div>}
            </div>
          </div>
        ) : page === 'post_detail' && selectedPost ? (
          <div className="max-w-3xl mx-auto px-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
            <div className="rounded-[2.5rem] overflow-hidden bg-slate-100 mb-10 shadow-2xl aspect-video relative">
              {selectedPost.imageUrl ? (
                <img src={selectedPost.imageUrl} className="w-full h-full object-cover" alt="" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl md:text-8xl">{selectedPost.category === 'catThai' ? '🐘' : '🐼'}</div>
              )}
            </div>

            <div className="flex items-center gap-4 mb-6">
              <span className="px-4 py-1 bg-[#00FFAB]/10 text-[#008F60] text-sm font-bold rounded-full uppercase tracking-wider">{t[selectedPost.category]}</span>
              <span className="text-slate-400 text-sm">{selectedPost.createdAt ? new Date(selectedPost.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black mb-8 leading-tight text-slate-900">{selectedPost.title[lang] || selectedPost.title.en}</h1>

            <div className="text-slate-600 leading-relaxed space-y-6 text-lg">
               {(selectedPost.excerpt[lang] || selectedPost.excerpt.en).split('\n').map((para, i) => (
                 <p key={i}>{para}</p>
               ))}
            </div>

            <div className="mt-20 pt-10 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6">
               <button onClick={() => setPage('blog')} className="text-slate-400 font-bold hover:text-slate-900 transition-colors flex items-center gap-2">
                  <IconChevronLeft /> {t.backToList}
               </button>
               {isAdmin && (
                  <button onClick={() => startEditing(selectedPost)} className="p-4 w-full sm:w-auto bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors">
                    <IconEdit /> {t.editPost}
                  </button>
               )}
            </div>
          </div>
        ) : page === 'admin' ? (
          <div className="max-w-3xl mx-auto px-6 animate-in slide-in-from-right-10">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900">{editingId ? t.editPost : t.adminTitle}</h1>
              <button onClick={() => navigateTo('blog')} className="text-slate-400 font-bold hover:text-slate-900 flex items-center gap-2">
                <IconChevronRight /> {t.backToBlog}
              </button>
            </div>
            <form onSubmit={handleSavePost} className="space-y-8 bg-slate-50 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">分类</label>
                  <select value={newPost.category} onChange={e => setNewPost({...newPost, category: e.target.value})} className="w-full p-4 rounded-2xl bg-white border focus:ring-2 focus:ring-[#00FFAB] outline-none">
                    <option value="catThai">学泰语</option>
                    <option value="catChinese">学中文</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><IconImage /> 封面图片 (URL)</label>
                  <input type="url" value={newPost.imageUrl} onChange={e => setNewPost({...newPost, imageUrl: e.target.value})} placeholder="https://..." className="w-full p-4 rounded-2xl bg-white border focus:ring-2 focus:ring-[#00FFAB] outline-none" />
                </div>
              </div>
              
              {newPost.imageUrl && (
                <div className="h-48 md:h-56 rounded-2xl overflow-hidden bg-white border-2 border-dashed border-slate-200 flex items-center justify-center relative">
                  <img src={newPost.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                  <button type="button" onClick={() => setNewPost({...newPost, imageUrl: ''})} className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform"><IconTrash /></button>
                </div>
              )}
              <div className="space-y-6">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">博文标题</label>
                {languages.filter(l => shouldShowLangInput(l.code)).map(l => (
                  <div key={l.code} className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">{l.name}</span>
                    <input required type="text" value={newPost.title[l.code]} onChange={e => setNewPost({...newPost, title: {...newPost.title, [l.code]: e.target.value}})} placeholder={`Title in ${l.name}`} className="w-full p-4 rounded-2xl bg-white border focus:ring-2 focus:ring-[#00FFAB] outline-none" />
                  </div>
                ))}
              </div>
              <div className="space-y-6">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">博文摘要 (Summary)</label>
                {languages.filter(l => shouldShowLangInput(l.code)).map(l => (
                  <div key={l.code} className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">{l.name}</span>
                    <textarea required value={newPost.excerpt[l.code]} onChange={e => setNewPost({...newPost, excerpt: {...newPost.excerpt, [l.code]: e.target.value}})} placeholder={`Summary in ${l.name}`} className="w-full p-4 rounded-2xl bg-white border focus:ring-2 focus:ring-[#00FFAB] outline-none" rows="3" />
                  </div>
                ))}
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <button type="submit" disabled={loading} className="flex-1 py-5 bg-[#00FFAB] text-slate-900 font-black rounded-2xl shadow-xl shadow-[#00FFAB]/20 hover:scale-[1.01] active:scale-95 transition-all">{loading ? '...' : (editingId ? t.updatePost : t.addPost)}</button>
                {editingId && <button type="button" onClick={() => navigateTo('blog')} className="px-8 py-5 bg-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-300 transition-all">{t.cancel}</button>}
              </div>
            </form>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto px-6 text-center py-20 animate-in zoom-in">
             <h2 className="text-4xl md:text-5xl font-black mb-8 text-slate-900">{page === 'thai' ? t.navThai : t.navChinese}</h2>
             <p className="text-lg md:text-xl text-slate-500 mb-12">即将上线应用商店，敬请期待！</p>
             <button onClick={() => navigateTo('home')} className="px-10 py-4 bg-slate-900 text-white rounded-full font-bold shadow-lg text-slate-900">返回首页</button>
          </div>
        )}
      </main>

      <section className="bg-slate-900 py-24 md:py-32 text-white relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-[#00FFAB]/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">{t.waitlist}</h2>
          <p className="text-slate-400 mb-12 text-lg">{t.waitlistSub}</p>
          {sent ? (
            <div className="bg-[#00FFAB]/20 border border-[#00FFAB]/40 p-10 rounded-[2.5rem] inline-flex flex-col items-center animate-in zoom-in duration-500">
              <div className="w-16 h-16 bg-[#00FFAB] rounded-full flex items-center justify-center text-slate-900 shadow-xl"><IconCheck /></div>
              <span className="text-[#00FFAB] text-xl font-bold mt-4 text-center">成功！你已在名单中。</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col md:flex-row gap-4 max-w-xl mx-auto bg-white/5 p-2 rounded-[2rem] border border-white/10 backdrop-blur-sm shadow-2xl">
              <input type="email" required placeholder={t.emailPlaceholder} value={email} onChange={e => setEmail(e.target.value)} disabled={loading} className="flex-1 px-8 py-5 bg-transparent border-none focus:outline-none text-white text-lg placeholder:text-slate-500" />
              <button type="submit" disabled={loading} className="px-10 py-5 bg-[#00FFAB] text-slate-900 font-black rounded-[1.6rem] hover:scale-105 active:scale-95 transition-all text-lg shadow-lg">
                {loading ? '...' : t.subscribe}
              </button>
            </form>
          )}
          {errorMsg && <p className="text-red-400 mt-6 font-mono text-xs bg-red-400/10 p-2 rounded-lg">{errorMsg}</p>}
        </div>
      </section>

      <footer className="py-16 text-center text-slate-400 text-sm border-t border-slate-50 bg-slate-50/50">
        <div className="flex items-center justify-center gap-2 mb-4 opacity-50 grayscale">
          <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center font-black text-xs">L</div>
          <span className="font-black tracking-tighter uppercase">LinguaGua</span>
        </div>
        {t.footer}
      </footer>
    </div>
  );
}