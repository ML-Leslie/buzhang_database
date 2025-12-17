import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

// 圆环颜色
const COLORS = [
  '#E0A9BB',
  '#B58CA3',
  '#CFA5B4',
  '#F1C6D4',
  '#F3E0D8',
  '#B7C1CC',
  '#BFC9C2',
  '#9E6F85',
];

// 蜘蛛腿效果
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, fill }) => {
  const sin = Math.sin(-midAngle * RADIAN);
  const cos = Math.cos(-midAngle * RADIAN);
  
  const sx = cx + (outerRadius + 0) * cos;
  const sy = cy + (outerRadius + 0) * sin;
  
  const mx = cx + (outerRadius + 20) * cos;
  const my = cy + (outerRadius + 20) * sin;
  
  const ex = mx + (cos >= 0 ? 1 : -1) * 20;
  const ey = my;
  
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


// 辅助组件：进度条列表项
const RankingItem = ({ rank, data, totalValue }) => {
  const percentage = totalValue > 0 ? ((data.value / totalValue) * 100).toFixed(2) : 0;
  
  return (
    <div className="flex flex-col mb-2 group hover:bg-gray-50 p-1 rounded-xl transition-colors">
      {/* 上半部分：信息行 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          {/* 排名 */}
          <span className={`text-lg font-bold w-6 text-center ${rank <= 3 ? 'text-gray-400' : 'text-gray-300'}`}>
            {rank}
          </span>
          {/* 图标与名称 */}
          <div className="flex items-center gap-2 font-serif">
            <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">
                {/*图标为空则显示为默认的 */}
              {data.icon || '📊'}
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

// 主组件
export default function ReportPage({ currentUser }) {
  const [dateMode, setDateMode] = useState('month'); // 'year' | 'month'
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (isDatePickerOpen) {
      setViewYear(selectedYear);
    }
  }, [isDatePickerOpen, selectedYear]);

  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('report_activeTab') || 'category');
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    localStorage.setItem('report_activeTab', activeTab);
  }, [activeTab]);

  // 获取账户数据
  useEffect(() => {
    if (activeTab === 'account' && currentUser) {
      fetch(`/api/accounts?userId=${currentUser.id}`)
        .then(res => res.json())
        .then(data => setAccounts(data))
        .catch(err => console.error(err));
    }
  }, [activeTab, currentUser]);
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // 获取数据
  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        let start, end;
        if (dateMode === 'year') {
          start = new Date(selectedYear, 0, 1).toISOString();
          end = new Date(selectedYear, 11, 31, 23, 59, 59).toISOString();
        } else {
          start = new Date(selectedYear, selectedMonth - 1, 1).toISOString();
          // 获取当月最后一天
          const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
          end = new Date(selectedYear, selectedMonth - 1, lastDay, 23, 59, 59).toISOString();
        }

        const response = await fetch(`/api/transactions?userId=${currentUser.id}&start=${start}&end=${end}`);
        if (response.ok) {
          const data = await response.json();
          setTransactions(data);
        }
      } catch (error) {
        console.error("Failed to fetch report data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, dateMode, selectedYear, selectedMonth]);

  // 账户报表数据处理
  const accountTrendData = useMemo(() => {
    if (activeTab !== 'account') return [];
    
    const dataMap = {};
    if (dateMode === 'year') {
      for (let i = 0; i < 12; i++) {
        dataMap[i] = { name: `${i + 1}月`, income: 0, expense: 0, net: 0 };
      }
    } else {
      const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        dataMap[i] = { name: `${i}日`, income: 0, expense: 0, net: 0 };
      }
    }

    transactions.forEach(t => {
      const date = new Date(t.tradeTime);
      const key = dateMode === 'year' ? date.getMonth() : date.getDate();
      
      const type = t.type || t.categoryType;
      const isExpense = type === 'EXPENSE' || type === '支出';
      const amount = Math.abs(t.amount);

      if (dataMap[key]) {
        if (isExpense) {
          dataMap[key].expense += amount;
          dataMap[key].net -= amount;
        } else {
          dataMap[key].income += amount;
          dataMap[key].net += amount;
        }
      }
    });

    return Object.values(dataMap);
  }, [transactions, dateMode, selectedYear, selectedMonth, activeTab]);

  const { liabilityAccounts, assetGroups, totalLiabilities, totalAssets } = useMemo(() => {
    const liabilities = [];
    const assets = [];
    let tLiabilities = 0;
    let tAssets = 0;

    accounts.forEach(acc => {
      const balance = parseFloat(acc.balance || 0);
      if (acc.type === '负债账户') {
        liabilities.push({ ...acc, value: Math.abs(balance) });
        tLiabilities += Math.abs(balance);
      } else {
        assets.push({ ...acc, value: balance });
        tAssets += balance;
      }
    });
    
    const groups = {};
    assets.forEach(acc => {
      if (!groups[acc.type]) {
        groups[acc.type] = { name: acc.type, value: 0, color: COLORS[Object.keys(groups).length % COLORS.length] };
      }
      groups[acc.type].value += acc.value;
    });
    
    return {
      liabilityAccounts: liabilities.sort((a, b) => b.value - a.value),
      assetGroups: Object.values(groups),
      totalLiabilities: tLiabilities,
      totalAssets: tAssets
    };
  }, [accounts]);

  // 处理数据：聚合分类
  const { expenseData, incomeData, totalExpense, totalIncome, expenseCount, incomeCount } = useMemo(() => {
    const expenseMap = {};
    const incomeMap = {};
    let tExpense = 0;
    let tIncome = 0;
    let eCount = 0;
    let iCount = 0;

    transactions.forEach(t => {
      const type = t.type || t.categoryType;
      const isExpense = type === 'EXPENSE' || type === '支出';
      const amount = Math.abs(t.amount);

      if (isExpense) {
        tExpense += amount;
        eCount++;
        if (!expenseMap[t.categoryName]) {
          expenseMap[t.categoryName] = { 
            name: t.categoryName || '未分类', 
            value: 0, 
            count: 0, 
            icon: t.categoryIcon || '📄',
            color: COLORS[Object.keys(expenseMap).length % COLORS.length]
          };
        }
        expenseMap[t.categoryName].value += amount;
        expenseMap[t.categoryName].count += 1;
      } else {
        tIncome += amount;
        iCount++;
        if (!incomeMap[t.categoryName]) {
          incomeMap[t.categoryName] = { 
            name: t.categoryName || '未分类', 
            value: 0, 
            count: 0, 
            icon: t.categoryIcon || '📄',
            color: COLORS[Object.keys(incomeMap).length % COLORS.length]
          };
        }
        incomeMap[t.categoryName].value += amount;
        incomeMap[t.categoryName].count += 1;
      }
    });

    return {
      expenseData: Object.values(expenseMap).sort((a, b) => b.value - a.value),
      incomeData: Object.values(incomeMap).sort((a, b) => b.value - a.value),
      totalExpense: tExpense,
      totalIncome: tIncome,
      expenseCount: eCount,
      incomeCount: iCount
    };
  }, [transactions]);

  const handleMonthSelect = (m) => {
    setSelectedMonth(m);
    setIsDatePickerOpen(false);
  };

  return (
    <div className="bg-gray-50/50 min-h-screen p-1">
      
      {/* 顶部标题栏 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {/* 报表类型切换 */}
          <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm font-serif">
            <button
              onClick={() => setActiveTab('category')}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'category' 
                  ? 'bg-[#e0A9BB] text-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              分类报表
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'account' 
                  ? 'bg-[#e0A9BB] text-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              账户报表
            </button>
          </div>
        </div>
        
        {/* 日期选择器 */}
        <div className="relative">
          <button 
            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-all active:scale-95 font-bold "
          >
            <ChevronLeft size={16} className="text-gray-400" />
            <span>
              {dateMode === 'year' ? `${selectedYear} 年` : `${selectedYear} 年 ${selectedMonth} 月`}
            </span>
            <ChevronRight size={16} className="text-gray-400" />
          </button>

          {/* 悬浮日期选择面板 */}
          {/* 遮罩层：点击外部关闭 */}
            {isDatePickerOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setIsDatePickerOpen(false)}></div>
            )}

          {isDatePickerOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
              {/* 切换 Tab */}
              <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
                <button 
                  onClick={() => setDateMode('year')}
                  className={`font-serif flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${dateMode === 'year' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  按年
                </button>
                <button 
                  onClick={() => setDateMode('month')}
                  className={`font-serif flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${dateMode === 'month' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  按月
                </button>
              </div>

              {/* 按年模式：年份网格 */}
              {dateMode === 'year' && (
                <>
                  <div className="flex items-center justify-between mb-4 px-2">
                    <button onClick={() => setViewYear(y => y - 10)} className="p-1 hover:bg-gray-100 rounded-full"><ChevronLeft size={16}/></button>
                    <span className="font-bold text-gray-700">{Math.floor(viewYear / 10) * 10}-{Math.floor(viewYear / 10) * 10 + 9}年</span>
                    <button onClick={() => setViewYear(y => y + 10)} className="p-1 hover:bg-gray-100 rounded-full"><ChevronRight size={16}/></button>
                  </div>
                  <div className="grid grid-cols-4 gap-4 mb-2">
                    {Array.from({ length: 12 }).map((_, i) => {
                      const startYear = Math.floor(viewYear / 10) * 10;
                      const y = startYear - 1 + i;
                      const isCurrentDecade = y >= startYear && y <= startYear + 9;
                      const isSelected = selectedYear === y;
                      const isCurrentYear = new Date().getFullYear() === y;
                      
                      return (
                        <button 
                          key={y}
                          onClick={() => { setSelectedYear(y); setIsDatePickerOpen(false); }}
                          className={`py-2 text-sm rounded-lg transition-colors 
                            ${isSelected ? 'bg-[#e0A9BB] text-white font-bold' : 
                              (isCurrentDecade ? 'hover:bg-gray-50 text-gray-700' : 'text-gray-300 hover:bg-gray-50')
                            }
                            ${!isSelected && isCurrentYear ? 'font-bold text-gray-900' : ''}
                          `}
                        >
                          {isCurrentYear ? '本年' : y}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* 按月模式：年份切换 + 月份网格 */}
              {dateMode === 'month' && (
                <>
                  <div className="flex items-center justify-between mb-4 px-2">
                    <button onClick={() => setSelectedYear(y => y-1)} className="p-1 hover:bg-gray-100 rounded-full"><ChevronLeft size={16}/></button>
                    <span className="font-bold text-gray-700">{selectedYear}年</span>
                    <button onClick={() => setSelectedYear(y => y+1)} className="p-1 hover:bg-gray-100 rounded-full"><ChevronRight size={16}/></button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                      <button 
                        key={m}
                        onClick={() => handleMonthSelect(m)}
                        className={`py-2 text-sm rounded-lg transition-colors ${selectedMonth === m ? 'bg-[#e0A9BB] text-white font-bold' : 'hover:bg-gray-50 text-gray-600'}`}
                      >
                        {m}月
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 内容区域 */}
      {activeTab === 'category' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左栏：支出统计*/}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            {/* 卡片头 */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800 font-serif">支出分类统计</h2>
              <div className="text-right">
                <div className="text-xs text-gray-400 mb-1">总支出 <span className="text-teal-500 font-bold text-base ml-1">{totalExpense.toFixed(2)}</span></div>
                <div className="text-xs text-gray-400">记账笔数 <span className="text-gray-600 ml-1">{expenseCount}</span></div>
              </div>
            </div>

            {/* 环形图表 */}
            <div className="h-72 mb-8 relative">
              {expenseData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                      label={renderCustomizedLabel}
                      labelLine={false}
                    >
                      {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-300 text-sm">暂无支出数据</div>
              )}
            </div>

            {/* 排行榜列表 */}
            <div className="space-y-2">
              {expenseData.map((item, index) => (
                <RankingItem 
                  key={item.name} 
                  rank={index + 1} 
                  data={item} 
                  totalValue={totalExpense} 
                />
              ))}
            </div>
          </div>

          {/*右栏：收入统计 */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-fit">
            {/* 卡片头 */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800 font-serif">收入分类统计</h2>
              <div className="text-right">
                <div className="text-xs text-gray-400 mb-1">总收入 <span className="text-red-500 font-bold text-base ml-1">{totalIncome.toFixed(2)}</span></div>
                <div className="text-xs text-gray-400">收入笔数 <span className="text-gray-600 ml-1">{incomeCount}</span></div>
              </div>
            </div>

            {/* 环形图表 */}
            <div className="h-72 mb-8 relative">
              {incomeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={incomeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                      label={renderCustomizedLabel}
                      labelLine={false}
                    >
                      {incomeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => `¥${value.toFixed(2)}`}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-300 text-sm">暂无收入数据</div>
              )}
            </div>

            {/* 排行榜列表 */}
            <div className="space-y-2">
              {incomeData.map((item, index) => (
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
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左上：净资产变动趋势 */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 lg:col-span-1 h-[400px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800 font-serif">净资产变动趋势</h2>
              <div className="text-xs text-gray-400">
                {dateMode === 'year' ? '按月统计' : '按日统计'}
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={accountTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' , fontFamily: 'serif', fontWeight: '600',fontSize: '14px'}}
                    cursor={{fill: '#f9fafb'}}
                  />
                  <Legend wrapperStyle={{fontFamily: 'serif', fontWeight: '500', fontSize: '14px'}} />
                  <Bar dataKey="income" name="收入" fill="#FB2C36" radius={[4, 4, 0, 0]} stackId="a" />
                  <Bar dataKey="expense" name="支出" fill="#00BBA7" radius={[4, 4, 0, 0]} stackId="a" />
                  <Bar dataKey="net" name="净变动" fill="#5D9CEC" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 右侧：资产账户明细*/}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 lg:col-span-1 lg:row-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800 font-serif">资产账户分布</h2>
              <div className="text-right">
                <div className="text-xs text-gray-400 mb-1">总资产 <span className="text-red-500 font-bold text-base ml-1">{totalAssets.toFixed(2)}</span></div>
              </div>
            </div>
            <div className="h-72 mb-8 relative">
              {assetGroups.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assetGroups}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                      label={renderCustomizedLabel}
                      labelLine={false}
                    >
                      {assetGroups.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-300 text-sm">暂无资产数据</div>
              )}
            </div>
            <div className="space-y-2">
              {assetGroups.map((item, index) => (
                <RankingItem 
                  key={item.name} 
                  rank={index + 1} 
                  data={item} 
                  totalValue={totalAssets} 
                />
              ))}
            </div>
          </div>

          {/* 左下：负债账户*/}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 lg:col-span-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800 font-serif">负债账户概览</h2>
              <div className="text-right">
                <div className="text-xs text-gray-400 mb-1">总负债 <span className="text-teal-500 font-bold text-base ml-1">{totalLiabilities.toFixed(2)}</span></div>
              </div>
            </div>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {liabilityAccounts.length > 0 ? (
                liabilityAccounts.map((acc) => (
                  <div key={acc.id} className="flex items-center justify-between p-1  rounded-xl mb-2">
                    <div className="flex items-center gap-3 font-serif">
                      <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">
                        {acc.icon}
                      </span>
                      <div>
                        <div className="font-medium text-gray-700">{acc.name}</div>
                        <div className="text-xs text-gray-400">负债</div>
                      </div>
                    </div>
                    <div className="font-bold text-gray-700">¥{acc.value.toFixed(2)}</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-300 text-sm">暂无负债账户</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}