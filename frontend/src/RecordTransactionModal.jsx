import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, CreditCard, Tag, ChevronLeft, ChevronRight, FileText } from 'lucide-react';

// --- Helper Components ---

// 1. Calculator Component
// Calculator Component
const Calculator = ({ value, onChange, onCalculate }) => {
  
  const handleInput = (key) => {
    if (value === 'Error') {
      onChange(['+', '-', '*', '/'].includes(key) ? '0' : key);
      return;
    }

    if (key === 'AC') {
      onChange('0');
    } else if (key === '←' || key === 'Backspace') {
      onChange(value.length > 1 ? value.slice(0, -1) : '0');
    } else if (key === '=' || key === 'Enter') {
      onCalculate(); // 调用父组件的计算逻辑
    } else {
      // 符号处理逻辑
      const isOperator = ['+', '-', '*', '/'].includes(key);
      const lastChar = value.slice(-1);
      const isLastCharOperator = ['+', '-', '*', '/'].includes(lastChar);

      if (isOperator && isLastCharOperator) {
        onChange(value.slice(0, -1) + key);
      } else {
        if (value === '0' && !isOperator && key !== '.') {
          onChange(key);
        } else {
          onChange(value + key);
        }
      }
    }
  };

  // 键盘监听逻辑
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key;
      if (/^[0-9.]$/.test(key) || ['+', '-', '*', '/'].includes(key)) {
        handleInput(key);
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleInput('=');
      } else if (key === 'Backspace') {
        handleInput('←');
      } else if (key === 'Escape') {
        handleInput('AC'); // ESC 键触发 AC
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [value, onChange, onCalculate]);

  const buttons = [
    '7', '8', '9', '÷',
    '4', '5', '6', '×',
    '1', '2', '3', '-',
    '.', '0', '←', '+',
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 bg-gray-50 rounded-xl mb-4 flex items-center justify-end px-6 text-3xl font-medium text-gray-700 tracking-wider overflow-hidden">
        {value}
      </div>
      <div className="grid grid-cols-4 gap-3 h-64">
        {/* 数字和符号区域 */}
        {buttons.map((btn) => (
          <button
            key={btn}
            onClick={() => handleInput(btn === '÷' ? '/' : btn === '×' ? '*' : btn)}
            className={`rounded-xl text-xl font-medium transition-all active:scale-95 flex items-center justify-center
              ${['÷', '×', '-', '+'].includes(btn) ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 
                btn === '←' ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' :
                'bg-white border border-gray-100 text-gray-700 hover:bg-gray-50'}`}
          >
            {btn}
          </button>
        ))}

        {/* 底部功能区：新增 AC 和 = */}
        
        {/* AC 按钮：占 1 格 */}
        <button
          onClick={() => handleInput('AC')}
          className="col-span-2 bg-gray-200 text-gray-600 rounded-xl text-lg font-bold hover:bg-gray-300 active:scale-95 py-3 shadow-sm mt-1"
        >
          AC
        </button>

        {/* = 按钮：占 3 格 */}
        <button
          onClick={() => handleInput('=')}
          className="col-span-2 bg-[#e0A9BB] text-white rounded-xl text-2xl font-bold hover:bg-[#d698ab] active:scale-95 py-3 shadow-sm mt-1"
        >
          =
        </button>
      </div>
    </div>
  );
};

// 2. Selection Grid Component (Categories / Accounts)
const SelectionGrid = ({ items, selectedId, onSelect }) => (
  <div className="grid grid-cols-2 gap-4 content-start h-full overflow-y-auto p-1">
    {items.map((item) => (
      <button
        key={item.id}
        onClick={() => onSelect(item)}
        className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all border ${
          selectedId === item.id
            ? 'bg-pink-50 border-[#e0A9BB] text-[#e0A9BB]'
            : 'bg-white border-gray-100 text-gray-600 hover:border-pink-200 hover:bg-gray-50'
        }`}
      >
        <span className="text-2xl mb-2">{item.icon}</span>
        <span className="text-xs font-medium">{item.name}</span>
      </button>
    ))}
  </div>
);

// 3. Calendar Component
const CustomCalendar = ({ selectedDate, onSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay };
  };

  const { days, firstDay } = getDaysInMonth(currentDate);
  const daysArray = Array.from({ length: days }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const isSameDay = (d1, d2) => {
    return d1.getDate() === d2.getDate() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getFullYear() === d2.getFullYear();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 px-2">
        <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded-full"><ChevronLeft size={20} /></button>
        <span className="font-medium text-gray-700">
          {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
        </span>
        <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded-full"><ChevronRight size={20} /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2">
        {['日', '一', '二', '三', '四', '五', '六'].map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-2 flex-1 content-start">
        {blanks.map(i => <div key={`blank-${i}`} />)}
        {daysArray.map(day => {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const isSelected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, new Date());
          
          return (
            <button
              key={day}
              onClick={() => onSelect(date)}
              className={`h-8 w-8 rounded-full flex items-center justify-center text-sm transition-all mx-auto
                ${isSelected ? 'bg-[#e0A9BB] text-white shadow-md' : 
                  isToday ? 'bg-pink-50 text-[#e0A9BB] font-bold' : 'hover:bg-gray-100 text-gray-700'}`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// --- Main Modal Component ---
export default function RecordTransactionModal({ isOpen, onClose, currentUser }) {
  const [type, setType] = useState('expense'); // 'expense' | 'income'
  const [amount, setAmount] = useState('0');
  const [category, setCategory] = useState(null);
  const [account, setAccount] = useState(null);
  const [date, setDate] = useState(new Date());
  const [activeField, setActiveField] = useState('amount'); // 'amount' | 'category' | 'account' | 'date'
  const [note, setNote] = useState('');

  // Data from backend
  const [categories, setCategories] = useState({ expense: [], income: [] });
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch data when modal opens
  useEffect(() => {
    if (isOpen && currentUser) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const userId = currentUser.id; 
          const [catsRes, accsRes] = await Promise.all([
            fetch(`/api/categories?userId=${userId}`),
            fetch(`/api/accounts?userId=${userId}`)
          ]);
          
          if (catsRes.ok && accsRes.ok) {
            const catsData = await catsRes.json();
            const accsData = await accsRes.json();

            const expense = catsData.filter(c => c.type === '支出' || c.type === 'EXPENSE');
            const income = catsData.filter(c => c.type === '收入' || c.type === 'INCOME');
            
            setCategories({ expense, income });
            setAccounts(accsData);
            
            // Set defaults
            if (expense.length > 0) setCategory(expense[0]);
            if (accsData.length > 0) setAccount(accsData[0]);
          }
        } catch (error) {
          console.error("Failed to fetch data", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();

      // Reset form
      setAmount('0');
      setDate(new Date());
      setActiveField('amount');
      setNote('');
    }
  }, [isOpen, currentUser]);

  // Update category when type changes
  useEffect(() => {
    const currentList = type === 'expense' ? categories.expense : categories.income;
    if (currentList.length > 0) {
      setCategory(currentList[0]);
    } else {
      setCategory(null);
    }
  }, [type, categories]);

  if (!isOpen) return null;

  const formatDate = (d) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // 新增：通用的计算逻辑函数
  const handleCalculate = () => {
    try {
      // 如果当前已经是结果或初始值，不处理
      if (amount === 'Error' || amount === '0') return;

      const safeValue = amount.replace(/×/g, '*').replace(/÷/g, '/');
      // eslint-disable-next-line no-eval
      const result = eval(safeValue);

      if (result < 0 || !isFinite(result) || isNaN(result)) {
        setAmount('Error');
      } else {
        setAmount(String(parseFloat(result.toFixed(2))));
      }
    } catch (e) {
      // 如果算式不完整（比如 "100+"），切换时保持原样或报错，这里选择保持原样让用户继续输，或者报错
      // 根据你的需求，通常这里报错比较直观，或者不改变（静默失败）
      // 这里为了防止格式错误的数据存入，设为 Error
      setAmount('Error');
    }
  };

  const switchField = (field) => {
    if (activeField === 'amount') {
      handleCalculate();
    }
    setActiveField(field);
  };

  const handleSave = async () => {
    if (!category || !account) {
      alert("请选择分类和账户");
      return;
    }

    // Ensure calculation is done
    let finalAmount = amount;
    if (['+', '-', '*', '/'].some(op => amount.includes(op))) {
       try {
         const safeValue = amount.replace(/×/g, '*').replace(/÷/g, '/');
         // eslint-disable-next-line no-eval
         const result = eval(safeValue);
         finalAmount = String(parseFloat(result.toFixed(2)));
       } catch (e) {
         setAmount('Error');
         return;
       }
    }

    if (finalAmount === 'Error' || parseFloat(finalAmount) === 0) {
      alert("请输入有效金额");
      return;
    }

    const userId = currentUser.id;
    
    // 格式化为本地时间字符串 (YYYY-MM-DDTHH:mm:ss)，避免 UTC 时区转换导致日期偏差
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const localTradeTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

    const payload = {
      userId,
      accountId: account.id,
      categoryId: category.id,
      amount: parseFloat(finalAmount),
      type : type === 'expense' ? 'EXPENSE' : 'INCOME',
      tradeTime: localTradeTime, // 修改字段名为 tradeTime，并使用本地时间
      remark: note
    };

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        console.log('Transaction saved');
        onClose();
        // Optional: Trigger refresh
        window.location.reload(); // Simple way to refresh data
      } else {
        console.error("Failed to save transaction");
        alert("保存失败");
      }
    } catch (e) {
      console.error(e);
      alert("保存出错");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
      <div className="bg-white rounded-3xl  w-[800px] h-[500px] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex gap-6 text-lg font-medium font-serif">
            <button 
              onClick={() => setType('expense')}
              className={`relative px-1 py-1 transition-colors ${type === 'expense' ? 'text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
            >
              支出
              {type === 'expense' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#e0A9BB] rounded-full" />}
            </button>
            <button 
              onClick={() => setType('income')}
              className={`relative px-1 py-1 transition-colors ${type === 'income' ? 'text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
            >
              收入
              {type === 'income' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#e0A9BB] rounded-full" />}
            </button>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          
          {/*左边*/}
          <div className="w-8/12 flex flex-col gap-3 border-r border-gray-100 bg-white">
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
            
            {/* Amount Field */}
            <div 
              onClick={() => setActiveField('amount')}
              className={`group cursor-pointer space-y-1.5 ${activeField === 'amount' ? '' : 'opacity-70 hover:opacity-100'}`}
            >
              <label className="text-xs font-medium text-gray-400 ml-1">金额 <span className="text-red-400">*</span></label>
              <div className={`flex whitespace-nowrap items-center px-4 py-2 rounded-xl border-2 transition-all ${
                activeField === 'amount' ? 'border-[#e0A9BB] bg-pink-50/30' : 'border-gray-100 hover:border-gray-200 bg-gray-50'
              }`}>

                <span className={`text-xl font-bold mr-1 ${
                    type === 'expense' ? 'text-green-600' : 'text-red-500' //支出绿色，收入红色
                  } text-gray-700`}>
                  {/* 如果是支出，且金额有效(非0非Error)，显示负号 */}
                  {amount !== '0' && amount !== 'Error' && ( type === 'income' ? '+ ¥' : '- ¥')}
                </span>

                <input 
                  type="text" 
                  readOnly 
                  value={amount} 
                  className={`w-full bg-transparent border-none outline-none text-right text-xl font-bold ${
                    type === 'expense' ? 'text-green-600' : 'text-red-500' //支出绿色，收入红色
                  } cursor-pointer`}
                />
              </div>
            </div>

            {/* Category Field */}
            <div 
              onClick={() => switchField('category')}
              className={`group cursor-pointer space-y-1.5 ${activeField === 'category' ? '' : 'opacity-70 hover:opacity-100'}`}
            >
              <label className="text-xs font-medium text-gray-400 ml-1">分类 <span className="text-red-400">*</span></label>
              <div className={`flex items-center justify-between px-4 py-2 rounded-xl border-2 transition-all ${
                activeField === 'category' ? 'border-[#e0A9BB] bg-pink-50/30' : 'border-gray-100 hover:border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{category?.icon || '❓'}</span>
                  <span className="text-sm font-medium text-gray-700">{category?.name || '请选择分类'}</span>
                </div>
                <Tag size={16} className="text-gray-400" />
              </div>
            </div>

            {/* Account Field */}
            <div 
              onClick={() => switchField('account')}
              className={`group cursor-pointer space-y-1.5 ${activeField === 'account' ? '' : 'opacity-70 hover:opacity-100'}`}
            >
              <label className="text-xs font-medium text-gray-400 ml-1">账户 <span className="text-red-400">*</span></label>
              <div className={`flex items-center justify-between px-4 py-2 rounded-xl border-2 transition-all ${
                activeField === 'account' ? 'border-[#e0A9BB] bg-pink-50/30' : 'border-gray-100 hover:border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{account?.icon || '💳'}</span>
                  <span className="text-sm font-medium text-gray-700">{account?.name || '请选择账户'}</span>
                </div>
                <CreditCard size={16} className="text-gray-400" />
              </div>
            </div>

            {/* Date Field */}
            <div 
              onClick={() => switchField('date')}
              className={`group cursor-pointer space-y-1.5 ${activeField === 'date' ? '' : 'opacity-70 hover:opacity-100'}`}
            >
              <label className="text-xs font-medium text-gray-400 ml-1">记账时间</label>
              <div className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                activeField === 'date' ? 'border-[#e0A9BB] bg-pink-50/30' : 'border-gray-100 hover:border-gray-200 bg-gray-50'
              }`}>
                <span className="text-sm font-medium text-gray-700">{formatDate(date)}</span>
                <CalendarIcon size={16} className="text-gray-400" />
              </div>
            </div>

            {/* Note Field (新增的备注栏目) */}
            <div 
              onClick={() => switchField('note')}
              className={`group cursor-pointer space-y-1 ${activeField === 'note' ? '' : 'opacity-70 hover:opacity-100'}`}
            >
              <label className="text-xs font-medium text-gray-400 ml-1">备注</label>
              <div className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                activeField === 'note' ? 'border-[#e0A9BB] bg-pink-50/30' : 'border-gray-100 hover:border-gray-200 bg-gray-50'
              }`}>
                <span className={`text-sm font-medium truncate pr-2 ${note ? 'text-gray-700' : 'text-gray-400'}`}>
                  {note || '点击填写备注...'}
                </span>
                <FileText size={16} className="text-gray-400 shrink-0" />
              </div>
            </div>

            {/* 这是一个垫片，确保最后一个元素不贴底 */}
              <div className="h-2"></div>
            </div>

            {/* 2. 固定底部区域：放置按钮 */}
            {/* z-10 确保它浮在滚动内容之上，border-t 增加分割感 */}
            <div className="p-5 border-t border-gray-50 bg-white z-10 shrink-0">
              <div className="flex gap-3">
                <button 
                  onClick={handleSave}
                  className="flex-1 bg-[#e0A9BB] text-white py-3 rounded-xl font-medium hover:bg-[#d698ab] active:scale-95 transition-all shadow-sm shadow-pink-100"
                >
                  保存
                </button>
                <button className="flex-1 bg-white border border-[#e0A9BB] text-[#e0A9BB] py-3 rounded-xl font-medium hover:bg-pink-50 active:scale-95 transition-all">
                  保存并再记一笔
                </button>
              </div>
            </div>

          </div>

          {/* Right Side: Interactive Panel */}
          <div className="w-4/12 p-6 bg-white">
            {activeField === 'amount' && (
              <Calculator 
                value={amount} 
                onChange={setAmount} 
                onCalculate={handleCalculate}
              />
            )}
            {activeField === 'category' && (
              <SelectionGrid 
                items={type === 'expense' ? categories.expense : categories.income} 
                selectedId={category?.id} 
                onSelect={(item) => setCategory(item)} 
              />
            )}
            {activeField === 'account' && (
              <SelectionGrid 
                items={accounts} 
                selectedId={account?.id} 
                onSelect={(item) => setAccount(item)} 
              />
            )}
            {activeField === 'date' && (
              <CustomCalendar 
                selectedDate={date} 
                onSelect={(d) => setDate(d)} 
              />
            )}
            {activeField === 'note' && (
              <div className="h-full flex flex-col font-serif">
                <div className="flex-1 flex flex-col gap-2">
                  <textarea
                    autoFocus
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="请输入..."
                    className="flex-1 w-full p-4 bg-gray-50 border-2 border-transparent focus:border-[#e0A9BB] focus:bg-white rounded-xl resize-none outline-none text-gray-700 transition-all text-me leading-relaxed"
                  />
                </div>
                {/* 增加一个完成按钮，方便用户切回金额，或者用户也可以直接点左边切回去 */}
                <button
                  onClick={() => setActiveField('amount')}
                  className="mt-4 w-full bg-[#e0A9BB] text-white py-3 rounded-xl font-medium hover:bg-[#d698ab] transition-all"
                >
                  完成输入
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
