import React, { useState, useEffect, useMemo } from 'react';
import { Search, Trash2, Filter, ChevronDown } from 'lucide-react';

// --- 静态资源映射 ---
const CATEGORY_MAP = {
  '餐饮': { icon: '🍔', color: 'bg-orange-100 text-orange-500' },
  '交通': { icon: '🚗', color: 'bg-blue-100 text-blue-500' },
  '购物': { icon: '🛍️', color: 'bg-pink-100 text-pink-500' },
  '娱乐': { icon: '🎮', color: 'bg-purple-100 text-purple-500' },
  '居住': { icon: '🏠', color: 'bg-yellow-100 text-yellow-500' },
  '医疗': { icon: '💊', color: 'bg-red-100 text-red-500' },
  '工资': { icon: '💰', color: 'bg-green-100 text-green-500' },
  '默认': { icon: '📄', color: 'bg-gray-100 text-gray-500' },
};

// --- 辅助函数：格式化日期 ---
const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1, // + 1 是因为 getMonth() 返回0-11
    day: d.getDate(),
    dateObj: d
  };
};

// --- 辅助函数：获取周数 ---
const getWeekNumber = (d) => {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};

export default function TransactionList({ currentUser }) {
  const [allTransactions, setAllTransactions] = useState([]); 
  const [loading, setLoading] = useState(false);
  
  // --- 筛选状态 ---
  // 选项：'year', 'quarter', 'month', 'week', 'day'
  // 初始化时尝试从 localStorage 读取
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('tx_viewMode') || 'month'); 
  const [selectedPeriod, setSelectedPeriod] = useState(() => localStorage.getItem('tx_selectedPeriod') || ''); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 新增：分类和账户筛选状态
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [filterCategory, setFilterCategory] = useState(() => localStorage.getItem('tx_filterCategory') || ''); // 分类ID
  const [filterAccount, setFilterAccount] = useState(() => localStorage.getItem('tx_filterAccount') || '');   // 账户ID
  const [filterType, setFilterType] = useState(() => localStorage.getItem('tx_filterType') || 'ALL');      // 'ALL', 'EXPENSE', 'INCOME'

  // --- 持久化筛选状态 ---
  useEffect(() => { localStorage.setItem('tx_viewMode', viewMode); }, [viewMode]);
  useEffect(() => { localStorage.setItem('tx_selectedPeriod', selectedPeriod); }, [selectedPeriod]);
  useEffect(() => { localStorage.setItem('tx_filterCategory', filterCategory); }, [filterCategory]);
  useEffect(() => { localStorage.setItem('tx_filterAccount', filterAccount); }, [filterAccount]);
  useEffect(() => { localStorage.setItem('tx_filterType', filterType); }, [filterType]);

  // 加载后端数据
  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. 并行获取基础数据
        const [categoriesRes, accountsRes, transactionsRes] = await Promise.all([
          fetch(`/api/categories?userId=${currentUser.id}`),
          fetch(`/api/accounts?userId=${currentUser.id}`),
          fetch(`/api/transactions?userId=${currentUser.id}`)
        ]);

        const categoriesData = await categoriesRes.json();
        const accountsData = await accountsRes.json();
        const transactions = await transactionsRes.json();

        setCategories(categoriesData);
        setAccounts(accountsData);

        // 2. 组装数据 (不再需要前端 Join，后端已处理)
        const mergedData = transactions.map(t => {
          // 处理日期：后端返回 ISO 格式 (e.g. 2023-12-12T10:00:00)，截取前10位
          const dateStr = t.tradeTime ? t.tradeTime.substring(0, 10) : '';

          // 核心修复：根据 type 或 categoryType 确定金额正负
          // 后端返回的 amount 可能是绝对值，需要根据类型转为带符号数值
          const type = t.type || t.categoryType;
          const isExpense = type === 'EXPENSE' || type === '支出';
          const signedAmount = isExpense ? -Math.abs(t.amount) : Math.abs(t.amount);

          return {
            id: t.id,
            categoryId: t.categoryId, // 保存ID用于筛选
            accountId: t.accountId,   // 保存ID用于筛选
            category: t.categoryName || '未知分类',
            categoryIcon: t.categoryIcon, 
            amount: signedAmount,
            account: t.accountName || '未知账户',
            date: dateStr,
            remark: t.remark || ''
          };
        });

        setAllTransactions(mergedData);

        // 4. 设置默认选中最近的月份
        if (mergedData.length > 0 && !selectedPeriod) {
          const latestDate = new Date(mergedData[0].date);
          const year = latestDate.getFullYear();
          const month = latestDate.getMonth() + 1;
          setSelectedPeriod(`${year}-${month}`);
        }

      } catch (error) {
        console.error("Failed to fetch transaction data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  // --- 核心逻辑 0: 全局筛选 (分类、账户、收支类型) ---
  const baseFilteredTransactions = useMemo(() => {
    return allTransactions.filter(item => {
      // 1. 筛选分类
      if (filterCategory && String(item.categoryId) !== String(filterCategory)) return false;
      // 2. 筛选账户
      if (filterAccount && String(item.accountId) !== String(filterAccount)) return false;
      // 3. 筛选收支类型
      if (filterType === 'EXPENSE' && item.amount >= 0) return false;
      if (filterType === 'INCOME' && item.amount < 0) return false;
      
      return true;
    });
  }, [allTransactions, filterCategory, filterAccount, filterType]);

  // --- 核心逻辑 1: 生成左侧导航列表数据 (基于全局筛选后的数据) ---
  const sidebarList = useMemo(() => {
    if (!baseFilteredTransactions.length) return [];

    const groups = {};
    
    baseFilteredTransactions.forEach(item => {
      const { year, month, day, dateObj } = formatDate(item.date);
      let key = '';
      let label = '';
      let subLabel = `${year}年`;

      if (viewMode === 'year') {
        key = `${year}`;
        label = `${year}年`;
        subLabel = '';
      } else if (viewMode === 'quarter') {
        const q = Math.ceil(month / 3);
        key = `${year}-Q${q}`;
        label = `${q}季度`;
        subLabel = `${year}年`;
      } else if (viewMode === 'month') {
        key = `${year}-${month}`;
        label = `${month}月`;
      } else if (viewMode === 'week') {
        const w = getWeekNumber(dateObj);
        key = `${year}-W${w}`;
        label = `第${w}周`;
      } else if (viewMode === 'day') {
        key = item.date;
        label = `${month}月${day}日`;
      }

      if (!groups[key]) {
        groups[key] = {
          id: key,
          label,
          subLabel,
          income: 0,
          expense: 0,
          rawDate: item.date,
          year: year // 增加 year 字段用于分组显示
        };
      }
      
      if (item.amount > 0) groups[key].income += item.amount;
      else groups[key].expense += Math.abs(item.amount);
    });

    return Object.values(groups).sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));

  }, [baseFilteredTransactions, viewMode]);

  // --- 核心逻辑 2: 根据左侧选择，筛选右侧列表数据 ---
  const filteredTransactions = useMemo(() => {
    if (!selectedPeriod) return [];
    
    return baseFilteredTransactions.filter(item => {
      const { year, month, dateObj } = formatDate(item.date);
      
      if (viewMode === 'year') return `${year}` === selectedPeriod;
      if (viewMode === 'quarter') return `${year}-Q${Math.ceil(month / 3)}` === selectedPeriod;
      if (viewMode === 'month') return `${year}-${month}` === selectedPeriod;
      if (viewMode === 'week') return `${year}-W${getWeekNumber(dateObj)}` === selectedPeriod;
      if (viewMode === 'day') return item.date === selectedPeriod;
      
      return false;
    });
  }, [baseFilteredTransactions, selectedPeriod, viewMode]);

  // --- 核心逻辑 3: 右侧列表内容 ---
  const groupedListContent = useMemo(() => {
    const groups = filteredTransactions.reduce((acc, item) => {
      if (!acc[item.date]) acc[item.date] = [];
      acc[item.date].push(item);
      return acc;
    }, {});
    
    return Object.entries(groups).sort((a, b) => new Date(b[0]) - new Date(a[0]));
  }, [filteredTransactions]);

  // --- 新增：删除功能 ---
  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这条记录吗？')) return;

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // 从本地状态中移除，触发重新渲染
        setAllTransactions(prev => prev.filter(t => t.id !== id));
      } else {
        console.error('Failed to delete transaction');
        alert('删除失败');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('删除出错');
    }
  };


  const getCategoryStyle = (item) => {
    const staticStyle = { icon: '📄', color: 'bg-gray-100 text-gray-500' };
    // 如果后端有图标，优先使用后端的图标
    if (item.categoryIcon) {
      return { ...staticStyle, icon: item.categoryIcon };
    }
    return staticStyle;
  };
  const getWeekday = (dateStr) => ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][new Date(dateStr).getDay()];

  // 维度显示名称映射
  const modeNames = {
    'year': '年',
    'quarter': '季',
    'month': '月',
    'week': '周',
    'day': '日'
  };

  return (
    <div className="flex gap-5 h-[680px]">
      
      {/* ================= 左侧导航栏 ================= */}
      <div className="w-64 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden shrink-0">
        
        {/* 顶部：汇总 + 切换维度 */}
        <div className="p-5 border-b border-gray-50 space-y-4">
          {/* 1. 汇总维度 */}
          <div className="flex items-center justify-between">
            <span className="text-gray-500 font-medium text-sm font-serif">汇总维度:</span>
            <div className="relative">
               <button 
                 onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                 className="flex items-center gap-1 text-[#e0A9BB] font-bold text-sm hover:opacity-80 transition-opacity"
               >
                 {modeNames[viewMode]} 
                 <ChevronDown size={14} />
               </button>
               
               {/* 遮罩层：点击外部关闭 */}
               {isDropdownOpen && (
                 <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
               )}

               {/* 下拉菜单 */}
               {isDropdownOpen && (
                 <div className="absolute right-0 top-full mt-2 w-24 bg-white shadow-xl rounded-xl p-1 border border-gray-100 z-50 animate-in fade-in slide-in-from-top-2">
                   {Object.keys(modeNames).map(m => (
                     <button 
                       key={m}
                       onClick={() => { setViewMode(m); setSelectedPeriod(''); setIsDropdownOpen(false); }} 
                       className={`w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-pink-50 ${viewMode === m ? 'text-[#e0A9BB]' : 'text-gray-600'}`}
                     >
                       按{modeNames[m]}
                     </button>
                   ))}
                 </div>
               )}
            </div>
          </div>

          {/* 2. 分类筛选 */}
          <div className="space-y-1">
            <span className="text-gray-500 font-medium text-sm font-serif">分类</span>
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-600 focus:outline-none focus:border-[#e0A9BB] transition-colors appearance-none cursor-pointer"
            >
              <option value="">全部分类</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>

          {/* 3. 账户筛选 */}
          <div className="space-y-1">
            <span className="text-gray-500 font-medium text-sm font-serif">账户</span>
            <select 
              value={filterAccount}
              onChange={(e) => setFilterAccount(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-600 focus:outline-none focus:border-[#e0A9BB] transition-colors appearance-none cursor-pointer"
            >
              <option value="">全部账户</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

        </div>

        {/* 导航列表 */}
        <div className="flex-1 overflow-y-auto py-2">
          {sidebarList.map((item, index) => {
            const isSelected = selectedPeriod === item.id;
            // 判断是否需要显示年份标题：非'year'模式下，如果是第一个元素，或者当前元素的年份与上一个不同
            const showYearHeader = viewMode !== 'year' && (index === 0 || sidebarList[index - 1].year !== item.year);

            return (
              <React.Fragment key={item.id}>
                {showYearHeader && (
                  <div className="px-5 pt-4 pb-1 text-xl font-bold text-gray-400/80 font-serif">
                    {item.year}年
                  </div>
                )}
                <div 
                  onClick={() => setSelectedPeriod(item.id)}
                  className={`relative px-5 py-4 cursor-pointer transition-all group border-l-4 
                    ${isSelected ? 'border-[#e0A9BB] bg-pink-50/40' : 'border-transparent hover:bg-gray-50'}`}
                >
                  <div className="flex justify-between items-baseline mb-1">
                    <span className={`text-lg font-bold ${isSelected ? 'text-gray-800' : 'text-gray-600'}`}>
                      {item.label}
                    </span>
                    <span className={`text-xs ${isSelected ? 'text-gray-500' : 'text-gray-400'}`}>
                      结余 {(item.income - item.expense).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 font-mono">
                    <span className="text-red-400 opacity-80">-{item.expense.toFixed(2)}</span>
                    <span className="text-green-500 opacity-80">+{item.income.toFixed(2)}</span>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ================= 右侧内容列表 ================= */}
      <div className="flex-1 bg-white rounded-3xl border border-gray-100 flex flex-col overflow-hidden">
        
        {/* Header 区：只保留标题和搜索框 */}
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white z-10">
           <h2 className="text-xl font-bold text-gray-800">
             流水列表
           </h2>
           
           <div className="flex bg-gray-100 p-1 rounded-xl">
             <button 
               onClick={() => setFilterType('ALL')}
               className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filterType === 'ALL' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
             >
               全部
             </button>
             <button 
               onClick={() => setFilterType('EXPENSE')}
               className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filterType === 'EXPENSE' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
             >
               支出
             </button>
             <button 
               onClick={() => setFilterType('INCOME')}
               className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filterType === 'INCOME' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
             >
               收入
             </button>
           </div>
        </div>

        {/* 列名：时间改为日期 */}
        <div className="grid grid-cols-12 px-6 py-3 bg-gray-50/50 text-xs font-medium text-gray-400 border-b border-gray-100">
          <div className="col-span-3 pl-2">分类</div>
          <div className="col-span-2">金额</div>
          <div className="col-span-2">账户</div>
          <div className="col-span-1">日期</div> {/* 修改点：时间 -> 日期 */}
          <div className="col-span-3 text-center">备注</div>
          <div className="col-span-1 text-right pr-2">操作</div>
        </div>

        {/* 列表内容 */}
        <div className="flex-1 overflow-y-auto pb-10">
          {!selectedPeriod ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Filter size={48} className="mb-4 opacity-20"/>
              <p>请选择左侧时间段查看详情</p>
            </div>
          ) : groupedListContent.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <p>该时间段暂无流水</p>
            </div>
          ) : (
            groupedListContent.map(([date, items]) => (
              <div key={date} className="mb-2">
                {/* 日期头 */}
                <div className="sticky top-0 z-0 px-6 py-2 bg-white flex items-baseline gap-3 border-b border-gray-50">
                  <span className="text-sm font-bold text-gray-600">{date.split('-')[1]}月{date.split('-')[2]}日</span>
                  <span className="text-xs text-gray-400 font-medium">{getWeekday(date)}</span>
                </div>
                {/* 列表项 */}
                <div className="px-4">
                  {items.map((item) => {
                    const style = getCategoryStyle(item);
                    const isExpense = item.amount < 0;
                    return (
                      <div key={item.id} className="group grid grid-cols-12 items-center py-3 px-2 rounded-xl hover:bg-gray-50 transition-all relative">
                        {/* 1. 分类 */}
                        <div className="col-span-3 flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg shadow-sm ${style.color} bg-opacity-20`}>
                            {style.icon}
                          </div>
                          <span className="font-medium text-gray-700">{item.category}</span>
                        </div>
                        {/* 2. 金额 */}
                        <div className="col-span-2 font-bold font-mono tracking-tight">
                          {isExpense ? <span className="text-gray-800">{item.amount.toFixed(2)}</span> : <span className="text-[#e0A9BB]">+{item.amount.toFixed(2)}</span>}
                        </div>
                        {/* 3. 账户 */}
                        <div className="col-span-2 text-sm text-gray-500 flex items-center gap-1">
                           <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>{item.account}
                        </div>
                        {/* 4. 日期 (原时间) */}
                        <div className="col-span-1 text-xs text-gray-400 font-mono">
                          {item.date} {/* 修改点：显示日期，不显示时间 */}
                        </div>
                        {/* 5. 备注 */}
                        <div className="col-span-3 text-sm text-gray-400 truncate text-center pr-4" title={item.remark}>{item.remark || '-'}</div>
                        {/* 6. 操作 */}
                        <div className="col-span-1 flex justify-end">
                           <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                             {/* 编辑按钮已移除 */}
                             <button 
                               onClick={() => handleDelete(item.id)}
                               className="p-1.5 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                               title="删除"
                             >
                               <Trash2 size={14} />
                             </button>
                           </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}