import React from 'react';
import { Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

// 统计卡片组件
const StatCard = ({ title, dateRange, income, expense }) => (
  <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col justify-between h-full">
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 "> {/*h-[calc(100vh-6rem)] */}
      {/* 左侧栏 */}
      <div className="lg:col-span-1 flex flex-col gap-6 h-full">
        {/* 上部：三个统计卡片 */}
        <div className="grid grid-rows-3 gap-3 shrink-0">
            <StatCard title="今天" dateRange="2025年12月12日" income="0.00" expense="0.00" />
            <StatCard title="本周" dateRange="12月08日 - 12月14日" income="0.00" expense="0.00" />
            <StatCard title="本年" dateRange="2025年" income="0.00" expense="0.00" />
        </div>

        {/* 下部：分类支出排行 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 flex-1 overflow-y-auto">
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

      {/* 右侧栏 */}
      <div className="lg:col-span-2 flex flex-col gap-6 h-[calc(100vh-6rem)]">
        {/* 上部：本月收支统计 */}
        <div className="bg-gradient-to-r from-[#9caec2] to-[#b8c6d6] rounded-2xl p-6 text-white relative overflow-hidden group shrink-0 h-1/4">
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-white opacity-10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
          <div className="relative z-10 h-full flex justify-between items-center">
            <div>
              <h2 className="text-white/90 font-medium mb-2">本月收支统计</h2>
              <div className="flex items-baseline gap-1">
                  <span className="text-sm opacity-80">总支出</span>
              </div>
              <h1 className="text-4xl font-bold mt-1">2,380.00 <span className="text-lg opacity-60 font-normal">CNY</span></h1>
            </div>
            <div className="text-right space-y-2">
              <div className="flex items-end justify-end gap-2">
                <span className="text-white/80 text-sm">本月收入:</span>
                <span className="font-semibold text-sm">8,500.00</span>
              </div>
              <div className="flex items-end justify-end gap-2">
                <span className="text-white/80 text-sm">本月结余:</span>
                <span className="font-semibold text-sm text-emerald-100">+6,120.00</span>
              </div>
            </div>
          </div>
          <div className="absolute right-8 bottom-0 w-32 h-32 opacity-80 pointer-events-none">
              <svg viewBox="0 0 200 200" className="w-full h-full text-white/20 fill-current">
                <path d="M100 0 L200 200 L0 200 Z" />
              </svg>
          </div>
        </div>


        {/* 下部：每日支出趋势图 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 flex-1 min-h-0">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-700 text-lg">本月每日支出统计</h3>
            <div className="bg-gray-100 p-1 rounded-lg flex text-xs font-medium">
              <button className="px-3 py-1 bg-white rounded shadow-sm text-gray-800">支出</button>
              <button className="px-3 py-1 text-gray-500 hover:text-gray-800">收入</button>
            </div>
          </div>
          <div className="h-[calc(100%-3rem)] w-full">
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
      </div>
    </div>
  );
};

export default DashboardHome;
