import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ScrollText, 
  PieChart, 
  Tags, 
  Wallet, 
  Users, 
  Store, 
  FolderKanban, 
  Settings, 
  Plus, 
  Calendar, 
  CreditCard, 
  TrendingUp 
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import TransactionList from './TransactionList';

// 模拟图表数据
const chartData = [
  { day: '12.01', income: 4000, expense: 2400 },
  { day: '12.05', income: 3000, expense: 1398 },
  { day: '12.10', income: 2000, expense: 9800 },
  { day: '12.15', income: 2780, expense: 3908 },
  { day: '12.20', income: 1890, expense: 4800 },
  { day: '12.25', income: 2390, expense: 3800 },
  { day: '12.31', income: 3490, expense: 4300 },
];

// 侧边栏按钮 (增加了 id, activeTab, onClick)
const SidebarItem = ({ icon: Icon, text, id, activeTab, onClick }) => (
  <div 
    onClick={() => onClick && onClick(id)}
    className={`flex items-center px-6 py-3 cursor-pointer transition-colors ${
      activeTab === id 
        ? 'text-[#ff9c4b] bg-orange-50 border-r-4 border-[#ff9c4b]' 
        : 'text-gray-500 hover:bg-gray-50'
    }`}
  >
    <Icon size={20} className="mr-3" />
    <span className="font-medium text-sm">{text}</span>
  </div>
);

// 统计卡片组件
const StatCard = ({ title, dateRange, income, expense }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-full">
    <div className="flex items-start justify-between mb-2">
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded-lg ${title === '今天' ? 'bg-teal-50 text-teal-600' : title === '本周' ? 'bg-blue-50 text-blue-600' : 'bg-yellow-50 text-yellow-600'}`}>
           <Calendar size={18} />
        </div>
        <div>
          <h3 className="text-gray-700 font-bold text-sm">{title}</h3>
          <p className="text-gray-400 text-xs mt-0.5">{dateRange}</p>
        </div>
      </div>
    </div>
    <div className="space-y-1 mt-2">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">总收入</span>
        <span className="text-red-500 font-medium">{income}</span>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">总支出</span>
        <span className="text-teal-500 font-medium">{expense}</span>
      </div>
    </div>
  </div>
);

// 分类行组件
const CategoryRow = ({ rank, icon, name, percent, amount }) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 px-2 rounded-lg transition-colors">
    <div className="flex items-center gap-4">
      <span className="text-gray-300 font-bold text-sm w-4">{rank}</span>
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-lg">
        {icon}
      </div>
      <div>
        <p className="text-gray-700 text-sm font-medium">{name}</p>
        <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
          <div className="h-full bg-[#ff9c4b]" style={{ width: `${percent}%` }}></div>
        </div>
      </div>
    </div>
    <span className="text-gray-700 font-medium text-sm">{amount}</span>
  </div>
);

// --- 3. 首页视图组件 ---
const DashboardHome = () => {
  return (
    <>
      {/* 顶部统计卡片区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-48">
        {/* 左侧大卡片 */}
        <div className="lg:col-span-2 bg-gradient-to-r from-[#9caec2] to-[#b8c6d6] rounded-2xl p-6 text-white relative overflow-hidden shadow-lg group">
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-white opacity-10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <h2 className="text-white/90 font-medium mb-1">本月收支统计</h2>
              <div className="flex items-baseline gap-1">
                  <span className="text-sm opacity-80">总支出</span>
              </div>
              <h1 className="text-4xl font-bold mt-1">2,380.00 <span className="text-lg opacity-60 font-normal">CNY</span></h1>
            </div>
            <div className="flex gap-8 mt-4 pt-4 border-t border-white/20">
              <div>
                <p className="text-white/70 text-xs mb-1">本月收入</p>
                <p className="font-semibold text-lg">8,500.00</p>
              </div>
              <div>
                <p className="text-white/70 text-xs mb-1">本月结余</p>
                <p className="font-semibold text-lg text-emerald-100">+6,120.00</p>
              </div>
            </div>
          </div>
          <div className="absolute right-8 bottom-0 w-32 h-32 opacity-80 pointer-events-none">
              <svg viewBox="0 0 200 200" className="w-full h-full text-white/20 fill-current">
                <path d="M100 0 L200 200 L0 200 Z" />
              </svg>
          </div>
        </div>

        {/* 右侧三个小卡片 */}
        <div className="grid grid-rows-3 gap-3 h-full">
            <StatCard title="今天" dateRange="2025年12月12日" income="0.00" expense="0.00" />
            <StatCard title="本周" dateRange="12月08日 - 12月14日" income="0.00" expense="0.00" />
            <StatCard title="本年" dateRange="2025年" income="0.00" expense="0.00" />
        </div>
      </div>

      {/* 下半部分：图表和列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：每日支出趋势图 */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-700 text-lg">本月每日支出统计</h3>
            <div className="bg-gray-100 p-1 rounded-lg flex text-xs font-medium">
              <button className="px-3 py-1 bg-white rounded shadow-sm text-gray-800">支出</button>
              <button className="px-3 py-1 text-gray-500 hover:text-gray-800">收入</button>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                <Line type="monotone" dataKey="expense" stroke="#ff9c4b" strokeWidth={3} dot={{fill: '#fff', stroke: '#ff9c4b', strokeWidth: 2, r: 4}} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="income" stroke="#8fdabb" strokeWidth={3} dot={false} strokeOpacity={0.3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 右侧：分类支出排行 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-700 text-lg">本月分类支出</h3>
            <div className="text-xs text-gray-400">
                总支出 <span className="text-gray-800 font-bold">12,450.00</span>
            </div>
          </div>
          <div className="space-y-1">
            <CategoryRow rank="1" icon="🍔" name="食品酒水" percent={80} amount="8,200.00" />
            <CategoryRow rank="2" icon="🚗" name="行车交通" percent={45} amount="2,400.00" />
            <CategoryRow rank="3" icon="🏠" name="居家物业" percent={20} amount="1,150.00" />
            <CategoryRow rank="4" icon="🎁" name="人情往来" percent={10} amount="500.00" />
            <CategoryRow rank="5" icon="💊" name="医疗药品" percent={5} amount="200.00" />
          </div>
          <button className="w-full mt-6 py-2 text-sm text-gray-400 hover:text-[#ff9c4b] transition-colors border border-dashed border-gray-200 rounded-lg hover:border-[#ff9c4b]">
              查看全部分类
          </button>
        </div>
      </div>

      {/* 底部：分类收入 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-700">本月分类收入</h3>
            <span className="text-sm text-red-400">总收入 8,500.00</span>
          </div>
      </div>
    </>
  );
};

// --- 4. 主程序 (控制页面切换) ---
export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  // 根据 activeTab 决定右边显示什么
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <DashboardHome />;
      case 'transactions':
        return <TransactionList />; 
      case 'reports':
        return <div className="p-10 text-center text-gray-400">报表功能开发中...</div>;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="flex h-screen bg-[#f5f6fa] font-sans text-gray-600">
      
      {/* 侧边栏 */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="p-6">
          <button className="w-full bg-white border-2 border-[#ff9c4b] text-[#ff9c4b] hover:bg-[#ff9c4b] hover:text-white transition-all py-2.5 rounded-lg flex items-center justify-center gap-2 font-bold shadow-sm active:scale-95">
            <Plus size={20} />
            记一笔
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-1 py-2">
          {/* 传递 onClick 和 id */}
          <SidebarItem icon={LayoutDashboard} text="首页" id="home" activeTab={activeTab} onClick={setActiveTab} />
          <SidebarItem icon={ScrollText} text="流水" id="transactions" activeTab={activeTab} onClick={setActiveTab} />
          <SidebarItem icon={PieChart} text="报表" id="reports" activeTab={activeTab} onClick={setActiveTab} />
          
          <div className="px-6 py-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">管理</p>
          </div>
          
          {/* 其他菜单项暂时不做点击切换 */}
          <SidebarItem icon={Tags} text="收支分类" />
          <SidebarItem icon={Wallet} text="账户管理" />
          <SidebarItem icon={Users} text="成员管理" />
          <SidebarItem icon={Store} text="商家管理" />
          <SidebarItem icon={FolderKanban} text="项目管理" />
        </div>

        <div className="p-4 border-t border-gray-100">
          <SidebarItem icon={Settings} text="设置" />
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto space-y-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}