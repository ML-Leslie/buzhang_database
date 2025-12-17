import React, { useState, useEffect, useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// 统计卡片组件
const StatCard = ({ title, dateRange, income, expense }) => (
  <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col justify-between h-full">
    <div className="flex items-start justify-between mb-2">
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded-lg ${title === '今天' ? 'bg-teal-50 text-teal-600' : title === '本周' ? 'bg-blue-50 text-blue-600' : 'bg-yellow-50 text-yellow-600'}`}>
           <Calendar size={18} />
        </div>
        <div>
          <h3 className="text-gray-700 font-bold text-sm font-serif">{title}</h3>
          <p className="text-gray-400 text-xs mt-0.5">{dateRange}</p>
        </div>
      </div>
    </div>
    <div className="space-y-1 mt-2">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">总收入</span>
        <span className="text-red-500 font-medium">{Number(income).toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">总支出</span>
        <span className="text-teal-500 font-medium">{Number(expense).toFixed(2)}</span>
      </div>
    </div>
  </div>
);

// 分类行组件
const CategoryRow = ({ rank, icon, name, percent, amount }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 px-2 rounded-lg transition-colors">
    <div className="flex items-center gap-4">
      <span className="text-gray-300 font-bold text-sm w-4">{rank}</span>
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-lg">
        {icon}
      </div>
      <div>
        <p className="text-gray-700 text-sm font-medium font-serif">{name}</p>
        <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
          <div className="h-full bg-[#E0A9BB]" style={{ width: `${percent}%` }}></div>
        </div>
      </div>
    </div>
    <span className="text-gray-700 font-medium text-sm">{Number(amount).toFixed(2)}</span>
  </div>
);

// 首页视图组件
const DashboardHome = ({ currentUser, onNavigate, refreshKey }) => {
  const [stats, setStats] = useState({
    today: { income: 0, expense: 0, range: '' },
    week: { income: 0, expense: 0, range: '' },
    year: { income: 0, expense: 0, range: '' }
  });
  const [monthlyStats, setMonthlyStats] = useState({
    income: 0,
    expense: 0,
    balance: 0,
    totalExpense: 0
  });
  const [categoryRanking, setCategoryRanking] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser, refreshKey]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const userId = currentUser.id;
      const res = await fetch(`/api/transactions/dashboard?userId=${userId}`);

      if (res.ok) {
        const data = await res.json();
        
        // 格式化日期范围
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        setStats({
          today: { 
            ...data.stats.today, 
            range: `${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日` 
          },
          week: { 
            ...data.stats.week, 
            range: `${startOfWeek.getMonth()+1}月${startOfWeek.getDate()}日 - ${endOfWeek.getMonth()+1}月${endOfWeek.getDate()}日` 
          },
          year: { 
            ...data.stats.year, 
            range: `${now.getFullYear()}年` 
          }
        });

        setMonthlyStats(data.monthlyStats);

        // 处理分类支出排行数据
        const ranking = data.categoryRanking.map((item, index) => ({
          ...item,
          rank: index + 1,
        }));
        setCategoryRanking(ranking);

        // 处理图表数据
        // 后端只返回了有数据的日期，所以需要填充所有日期
        const chart = data.chartData.map(item => {
            const d = new Date(item.date);
            return {
                day: `${d.getMonth() + 1}.${String(d.getDate()).padStart(2, '0')}`,
                income: item.income,
                expense: item.expense
            };
        });
        // 填充当前月份的缺失日期
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const fullChartData = Array.from({ length: daysInMonth }, (_, i) => {
            const dayStr = `${currentMonth + 1}.${String(i + 1).padStart(2, '0')}`;
            const found = chart.find(c => c.day === dayStr);
            return found || { day: dayStr, income: 0, expense: 0 };
        });

        setChartData(fullChartData);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 "> 
      {/* 左侧栏 */}
      <div className="lg:col-span-1 flex flex-col gap-6 h-full">
        {/* 上部：三个统计卡片 */}
        <div className="grid grid-rows-3 gap-3 shrink-0">
            <StatCard title="今天" dateRange={stats.today.range} income={stats.today.income} expense={stats.today.expense} />
            <StatCard title="本周" dateRange={stats.week.range} income={stats.week.income} expense={stats.week.expense} />
            <StatCard title="本年" dateRange={stats.year.range} income={stats.year.income} expense={stats.year.expense} />
        </div>

        {/* 下部：分类支出排行 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 flex-1 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-700 text-lg font-serif">本月分类支出</h3>
            <div className="text-xs text-gray-400">
                总支出 <span className="text-teal-500 font-bold">{Number(monthlyStats.totalExpense).toFixed(2)}</span>
            </div>
          </div>
          <div className="space-y-1">
            {categoryRanking.length > 0 ? (
              categoryRanking.map((item) => (
                <CategoryRow 
                  key={item.name}
                  rank={item.rank} 
                  icon={item.icon} 
                  name={item.name} 
                  percent={item.percent} 
                  amount={item.amount} 
                />
              ))
            ) : (
              <div className="text-center text-gray-400 py-8 text-sm">暂无支出数据</div>
            )}
          </div>
          <button 
            onClick={() => {
              localStorage.setItem('report_activeTab', 'category');
              onNavigate && onNavigate('reports');
            }}
            className="w-full mt-6 py-2 text-sm text-gray-400 hover:text-[#E0A9BB] transition-colors border border-dashed border-gray-200 rounded-lg hover:border-[#E0A9BB] font-serif"
          >
              查看全部分类
          </button>
        </div>
      </div>

      {/* 右侧栏 */}
      <div className="lg:col-span-2 flex flex-col gap-6 h-[calc(100vh-6rem)]">
        {/* 上部：本月收支统计 */}
        <div className="rounded-2xl p-6 text-white relative overflow-hidden group shrink-0 h-1/4" style={{background:"linear-gradient(90deg, #FFFFFF, #f4d7e0ff, #E0A9BB)"}}>
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-white opacity-10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
          <div className="relative z-10 h-full flex justify-between items-center">
            <div>
              <h2 className="text-black/90  font-serif mb-2 text-[18px] font-bold">本月收支统计</h2>
              <div className="text-black/90 font-serif flex items-baseline gap-1">
                  <span className="text-[13px] opacity-100">总支出</span>
              </div>
              <h1 className="text-4xl text-[#E0A9BB] font-bold mt-1">{Number(monthlyStats.expense).toFixed(2)} <span className="text-lg opacity-60 font-normal">CNY</span></h1>
            </div>
            <div className="text-right space-y-2">
              <div className="flex items-end justify-end gap-2">
                <span className="text-white/90 text-sm font-serif">本月收入:</span>
                <span className="font-semibold text-sm text-gray-100">{Number(monthlyStats.income).toFixed(2)}</span>
              </div>
              <div className="flex items-end justify-end gap-2">
                <span className="text-white/90 text-sm font-serif">本月结余:</span>
                <span className={`font-semibold text-sm ${monthlyStats.balance >= 0 ? 'text-gray-100' : 'text-red-100'}`}>
                  {monthlyStats.balance >= 0 ? '+' : ''}{Number(monthlyStats.balance).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          <div className="absolute right-8 bottom-0 w-32 h-32 opacity-80 pointer-events-none">
          </div>
        </div>


        {/* 下部：每日支出趋势图 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 flex-1 min-h-0">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-700 text-lg font-serif">本月每日支出统计</h3>
            <div className="bg-gray-100 p-1 rounded-lg flex text-xs font-medium">
            </div>
          </div>
          <div className="h-[calc(100%-3rem)] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' , fontFamily: 'serif', fontWeight: '600',fontSize: '14px'}}
                    cursor={{fill: '#f9fafb'}}
                />
                <Line type="monotone" dataKey="expense" name="支出" stroke="#00BBA7" strokeWidth={3} dot={{fill: '#fff', stroke: '#00BBA7', strokeWidth: 2, r: 4}} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="income" name="收入" stroke="#f45a62ff" strokeWidth={3} dot={{fill: '#fff', stroke: '#f45a62ff', strokeWidth: 2, r: 4}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
