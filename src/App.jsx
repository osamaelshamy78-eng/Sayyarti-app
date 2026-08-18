import React, { useState, useEffect } from 'react';
import {
  Gauge,
  ChevronLeft,
  ChevronRight,
  MapPin,
  PlayCircle,
  Wrench,
  Info,
  Megaphone,
  Settings,
  Car,
  Plus,
  MessageCircle,
  HelpCircle,
  Phone,
  Search,
  Filter,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  LogOut,
  Globe,
  Share2
} from 'lucide-react';


// ==========================================
// SAYYARTI / KARAJI APPLICATION (App.jsx)
// Combined Single File Component
// ==========================================


export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState('ar');


  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans dir-rtl">
      {/* Header / TopBar */}
      <header className="bg-slate-800 border-b border-slate-700 p-4 sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gauge className="w-8 h-8 text-amber-500" />
          <h1 className="text-xl font-bold tracking-wide">Sayyarti - سيارتي</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setLanguage(l => l === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg text-sm transition"
          >
            <Globe className="w-4 h-4" />
            <span>{language === 'ar' ? 'English' : 'عربي'}</span>
          </button>
        </div>
      </header>


      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto p-4 pb-24">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute right-3 top-3.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="ابحث عن العطل، كود التشخيص (OBD)، أو لمبات الطبلون..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.value || e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pr-10 pl-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition"
          />
        </div>


        {/* Dashboard Grid / Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-amber-500 transition">
            <Gauge className="w-10 h-10 text-amber-500 mb-2" />
            <span className="font-semibold text-center text-sm">لمبات التحذير</span>
          </div>


          <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-amber-500 transition">
            <Wrench className="w-10 h-10 text-amber-500 mb-2" />
            <span className="font-semibold text-center text-sm">تشخيص الأعطال (OBD)</span>
          </div>


          <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-amber-500 transition">
            <MapPin className="w-10 h-10 text-amber-500 mb-2" />
            <span className="font-semibold text-center text-sm">دليل الكراجات</span>
          </div>


          <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-amber-500 transition">
            <Car className="w-10 h-10 text-amber-500 mb-2" />
            <span className="font-semibold text-center text-sm">سوق السيارات</span>
          </div>
        </div>


        {/* Info Banner */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3 mb-6">
          <Info className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-200/90 leading-relaxed">
            مرحباً بك في تطبيق سيارتي (كراجي). يمكنك تصفح دليل أعطال السيارات، فحص أكواد الكمبيوتر، والوصول لأقرب الورش والكراجات المعتمدة.
          </p>
        </div>
      </main>


      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 p-2 flex justify-around items-center z-50">
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={`flex flex-col items-center p-2 rounded-lg text-xs ${activeTab === 'dashboard' ? 'text-amber-500' : 'text-slate-400'}`}
        >
          <Gauge className="w-5 h-5 mb-1" />
          <span>الرئيسية</span>
        </button>


        <button 
          onClick={() => setActiveTab('garages')} 
          className={`flex flex-col items-center p-2 rounded-lg text-xs ${activeTab === 'garages' ? 'text-amber-500' : 'text-slate-400'}`}
        >
          <MapPin className="w-5 h-5 mb-1" />
          <span>الكراجات</span>
        </button>


        <button 
          onClick={() => setActiveTab('market')} 
          className={`flex flex-col items-center p-2 rounded-lg text-xs ${activeTab === 'market' ? 'text-amber-500' : 'text-slate-400'}`}
        >
          <Car className="w-5 h-5 mb-1" />
          <span>السوق</span>
        </button>


        <button 
          onClick={() => setActiveTab('help')} 
          className={`flex flex-col items-center p-2 rounded-lg text-xs ${activeTab === 'help' ? 'text-amber-500' : 'text-slate-400'}`}
        >
          <HelpCircle className="w-5 h-5 mb-1" />
          <span>المساعدة</span>
        </button>
      </nav>
    </div>
  );
}