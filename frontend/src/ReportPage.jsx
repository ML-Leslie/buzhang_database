import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// --- 静态配置 ---
const COLORS = [
  '#4ECDC4', // Teal
  '#5D9CEC', // Blue
  '#AC92EC', // Purple
  '#FF6B6B', // Red
  '#FFCE54', // Yellow
  '#FC6E51', // Orange
  '#A0D468', // Green
  '#E6E9ED', // Gray
];

// 模拟数据：支出
const MOCK_EXPENSES = [
  { name: '午餐', value: 638.82, count: 24, icon: '🥘', color: '#4ECDC4' },
  { name: '晚餐', value: 575.90, count: 18, icon: '🥣', color: '#5D9CEC' },
  { name: '日常用品', value: 109.50, count: 5, icon: '🧻', color: '#AC92EC' },
  { name: '夜宵', value: 103.54, count: 3, icon: '🍢', color: '#FF6B6B' },
  { name: '水电煤气', value: 66.00, count: 1, icon: '⚡', color: '#FFCE54' },
  { name: '早餐', value: 61.00, count: 12, icon: '🥛', color: '#FC6E51' },
  { name: '茶饮', value: 46.80, count: 4, icon: '🥤', color: '#A0D468' },
  { name: '其他', value: 63.40, count: 39, icon: '📦', color: '#E6E9ED' },
];

// 模拟数据：收入
const MOCK_INCOME = [
  { name: '生活费', value: 1700.00, count: 1, icon: '💰', color: '#4ECDC4' },
];

// --- 核心修改：自定义标签渲染函数 (蜘蛛腿效果) ---
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, fill }) => {
  const sin = Math.sin(-midAngle * RADIAN);
  const cos = Math.cos(-midAngle * RADIAN);
  
  // 1. 起始点 (在圆弧边缘)
  const sx = cx + (outerRadius + 0) * cos;
  const sy = cy + (outerRadius + 0) * sin;
  
  // 2. 转折点 (向外延伸)
  const mx = cx + (outerRadius + 20) * cos;
  const my = cy + (outerRadius + 20) * sin;
  
  // 3. 终点 (水平延伸)
  // 根据在圆的左侧还是右侧，决定往哪边画
  const ex = mx + (cos >= 0 ? 1 : -1) * 20;
  const ey = my;
  
  // 文字对齐方式
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      {/* 画折线 */}
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" strokeWidth={1.5} />
      {/* 画文字 */}
      <text x={ex + (cos >= 0 ? 1 : -1) * 8} y={ey} dy={4} textAnchor={textAnchor} fill="#6b7280" fontSize={11} fontWeight={500}>
        {`${name} ${(percent * 100).toFixed(2)}%`}
      </text>
    </g>
  );
};


// --- 辅助组件：进度条列表项 ---
const RankingItem = ({ rank, data, totalValue }) => {
  const percentage = ((data.value / totalValue) * 100).toFixed(2);
  
  return (
    <div className="flex flex-col mb-4 group cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors">
      {/* 上半部分：信息行 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          {/* 排名 */}
          <span className={`text-lg font-bold w-6 text-center ${rank <= 3 ? 'text-gray-400' : 'text-gray-300'}`}>
            {rank}
          </span>
          {/* 图标与名称 */}
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">
              {data.icon}
            </span>
            <span className="font-medium text-gray-700">{data.name}</span>
          </div>
        </div>
        
        {/* 右侧：占比与金额 */}
        <div className="flex items-center gap-2 text-sm">
           <span className="text-gray-400">{percentage}%</span>
           <span className="text-gray-700 font-bold">¥{data.value.toFixed(2)}</span>
        </div>
      </div>

      {/* 下半部分：进度条 */}
      <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden ml-9 max-w-[calc(100%-2.25rem)]">
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: data.color }}
        />
      </div>
    </div>
  );
};

// --- 主组件 ---
export default function ReportPage() {
  const [dateMode, setDateMode] = useState('month'); // 'year' | 'month'
  const [year, setYear] = useState(2025);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // 计算总额
  const totalExpense = useMemo(() => MOCK_EXPENSES.reduce((acc, cur) => acc + cur.value, 0), []);
  const totalIncome = useMemo(() => MOCK_INCOME.reduce((acc, cur) => acc + cur.value, 0), []);
  const expenseCount = useMemo(() => MOCK_EXPENSES.reduce((acc, cur) => acc + cur.count, 0), []);
  const incomeCount = useMemo(() => MOCK_INCOME.reduce((acc, cur) => acc + cur.count, 0), []);

  return (
    <div className="bg-gray-50/50 min-h-screen p-6">
      
      {/* 顶部标题栏 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">分类报表</h1>
        
        {/* 日期选择器 (仿截图中的下拉框) */}
        <div className="relative">
          <button 
            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm text-gray-700 font-medium hover:bg-gray-50 transition-all active:scale-95"
          >
            <ChevronLeft size={16} className="text-gray-400" />
            <span>{year}年</span>
            <ChevronRight size={16} className="text-gray-400" />
          </button>

          {/* 悬浮日期选择面板 */}
          {isDatePickerOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
              {/* 切换 Tab */}
              <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
                <button 
                  onClick={() => setDateMode('year')}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${dateMode === 'year' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  按年
                </button>
                <button 
                  onClick={() => setDateMode('month')}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${dateMode === 'month' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  按月
                </button>
              </div>

              {/* 年份切换 */}
              <div className="flex items-center justify-between mb-4 px-2">
                <button onClick={() => setYear(y => y-1)} className="p-1 hover:bg-gray-100 rounded-full"><ChevronLeft size={16}/></button>
                <span className="font-bold text-gray-700">{year}年</span>
                <button onClick={() => setYear(y => y+1)} className="p-1 hover:bg-gray-100 rounded-full"><ChevronRight size={16}/></button>
              </div>

              {/* 月份网格 */}
              <div className="grid grid-cols-4 gap-2">
                {['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一', '本月'].map((m, i) => (
                  <button 
                    key={m}
                    className={`py-2 text-sm rounded-lg transition-colors ${m === '本月' ? 'bg-[#e0A9BB] text-white font-bold' : 'hover:bg-gray-50 text-gray-600'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 内容区域：双栏布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* --- 左栏：支出统计 --- */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          {/* 卡片头 */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800">支出分类统计</h2>
            <div className="text-right">
              <div className="text-xs text-gray-400 mb-1">总支出 <span className="text-teal-500 font-bold text-base ml-1">{totalExpense.toFixed(2)}</span></div>
              <div className="text-xs text-gray-400">记账笔数 <span className="text-gray-600 ml-1">{expenseCount}</span></div>
            </div>
          </div>

          {/* 环形图表 (修改：缩小半径，增加 label) */}
          <div className="h-72 mb-8 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={MOCK_EXPENSES}
                  cx="50%"
                  cy="50%"
                  innerRadius={50} // 略微减小
                  outerRadius={80} // 减小以给标签留空间 (原来是100)
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                  label={renderCustomizedLabel} // 使用自定义标签
                  labelLine={false} // 禁用默认的线
                >
                  {MOCK_EXPENSES.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `¥${value}`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 排行榜列表 */}
          <div className="space-y-2">
            {MOCK_EXPENSES.map((item, index) => (
              <RankingItem 
                key={item.name} 
                rank={index + 1} 
                data={item} 
                totalValue={totalExpense} 
              />
            ))}
          </div>
        </div>

        {/* --- 右栏：收入统计 --- */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-fit">
          {/* 卡片头 */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800">收入分类统计</h2>
            <div className="text-right">
              <div className="text-xs text-gray-400 mb-1">总收入 <span className="text-red-500 font-bold text-base ml-1">{totalIncome.toFixed(2)}</span></div>
              <div className="text-xs text-gray-400">收入笔数 <span className="text-gray-600 ml-1">{incomeCount}</span></div>
            </div>
          </div>

          {/* 环形图表 (修改：缩小半径，增加 label) */}
          <div className="h-72 mb-8 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={MOCK_INCOME}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  label={renderCustomizedLabel} // 使用自定义标签
                  labelLine={false}
                >
                  {MOCK_INCOME.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `¥${value}`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 排行榜列表 */}
          <div className="space-y-2">
            {MOCK_INCOME.map((item, index) => (
              <RankingItem 
                key={item.name} 
                rank={index + 1} 
                data={item} 
                totalValue={totalIncome} 
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}