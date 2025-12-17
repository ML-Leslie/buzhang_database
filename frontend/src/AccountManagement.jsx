import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Pencil, Trash2, FileText, Wallet, CreditCard, Banknote, Smartphone, TrendingUp, ChevronDown, ChevronRight, X } from 'lucide-react';

const AccountManagement = ({ currentUser, onNavigate, refreshKey }) => {
  const [activeTab, setActiveTab] = useState('asset');
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({
    '现金账户': true,
    '储蓄账户': true,
    '虚拟账户': true,
    '投资账户': true,
    '负债账户': true,
    '其他账户': true
  });

  // 统计数据
  const [stats, setStats] = useState({
    netAssets: 0,
    totalAssets: 0,
    totalLiabilities: 0
  });

  // 抽屉状态和表单数据
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  const [newAccount, setNewAccount] = useState({
    type: '',
    name: '',
    icon: '',
    currency: 'CNY',
    balance: ''
  });

  const ACCOUNT_TYPES = ['现金账户', '储蓄账户', '虚拟账户', '投资账户', '负债账户', '其他账户'];
  const AVAILABLE_ICONS = [
    '💰', '💳', '🏦', '📱', '💴', 
    '💵', '📈', '📉', '🏧', '👛',
    '💎', '🪙', '🧧', '🧾', '💹'
  ];

  const handleViewTransactions = (account) => {
    // 设置筛选条件到 localStorage
    localStorage.setItem('tx_filterAccount', account.id);
    
    // 清空分类筛选和类型筛选，避免冲突
    localStorage.setItem('tx_filterCategory', '');
    localStorage.setItem('tx_filterType', 'ALL');

    // 跳转到交易列表页面
    if (onNavigate) {
      onNavigate('transactions');
    }
  };

  const handleEditAccount = (account) => {
    setEditingId(account.id);
    setNewAccount({
      type: account.type,
      name: account.name,
      icon: account.icon,
      currency: 'CNY', // 目前只支持CNY
      balance: String(account.balance)
    });
    setIsDrawerOpen(true);
  };

  const handleDeleteAccount = async (account) => {
    if (window.confirm(`确定要删除账户“${account.name}”吗？\n\n注意：这将同时删除该账户下的所有流水记录！此操作不可恢复。`)) {
      try {
        const response = await fetch(`/api/accounts/${account.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await fetchAccounts();
        } else {
          alert('删除失败，请重试');
        }
      } catch (error) {
        console.error('Error deleting account:', error);
        alert('删除出错');
      }
    }
  };

  const handleOpenDrawer = () => {
    setEditingId(null); // 重置编辑状态
    setNewAccount({
      type: '',
      name: '',
      icon: '',
      currency: 'CNY',
      balance: ''
    });
    setIsDrawerOpen(true);
  };

  const handleBalanceChange = (e) => {
    const value = e.target.value;
    // 只允许输入数字和小数点，且只能有两位小数
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setNewAccount({ ...newAccount, balance: value });
    }
  };

  const handleSaveAccount = async () => {
    if (!newAccount.type || !newAccount.name || !newAccount.icon || !newAccount.balance) {
      alert('请填写完整信息');
      return;
    }

    if (isDuplicateName) {
      alert('该账户类型下已存在同名账户，请使用其他名称');
      return;
    }

    try {
      const url = editingId ? `/api/accounts/${editingId}` : '/api/accounts';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          name: newAccount.name,
          type: newAccount.type,
          balance: parseFloat(newAccount.balance),
          icon: newAccount.icon 
        }),
      });

      if (response.ok) {
        await fetchAccounts();
        setIsDrawerOpen(false);
      } else {
        alert('保存失败，请重试');
      }
    } catch (error) {
      console.error('Error saving account:', error);
      alert('保存出错');
    }
  };

  const fetchAccounts = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/accounts?userId=${currentUser.id}`);
      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
        calculateStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch accounts', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    let assets = 0;
    let liabilities = 0;

    data.forEach(acc => {
      const balance = parseFloat(acc.balance || 0);
      if (acc.type === '负债账户') {
        liabilities += Math.abs(balance);
      } else {
        assets += balance;
      }
    });

    setStats({
      totalAssets: assets,
      totalLiabilities: liabilities,
      netAssets: assets - liabilities
    });
  };

  const toggleGroup = (group) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  // 账户类型映射和图标
  const getAccountGroupInfo = (type) => {
    switch (type) {
      case '现金账户': return { group: '现金账户', icon: <Banknote size={20} className="text-green-500" /> };
      case '储蓄账户': return { group: '储蓄账户', icon: <Wallet size={20} className="text-blue-500" /> };
      case '虚拟账户': return { group: '虚拟账户', icon: <Smartphone size={20} className="text-cyan-500" /> };
      case '投资账户': return { group: '投资账户', icon: <TrendingUp size={20} className="text-red-500" /> };
      case '负债账户': return { group: '负债账户', icon: <CreditCard size={20} className="text-purple-500" /> };
      default: return { group: '其他账户', icon: <Wallet size={20} className="text-gray-500" /> };
    }
  };

  // 分组处理
  const groupedAccounts = accounts.reduce((acc, account) => {
    const { group } = getAccountGroupInfo(account.type);
    // 根据当前标签页过滤
    const isLiability = group === '负债账户';
    
    if (activeTab === 'asset' && !isLiability) {
      if (!acc[group]) acc[group] = [];
      acc[group].push(account);
    } else if (activeTab === 'liability' && isLiability) {
      if (!acc[group]) acc[group] = [];
      acc[group].push(account);
    }
    return acc;
  }, {});

  // 格式化金额
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // 检查名称是否重复
  const isDuplicateName = useMemo(() => {
    if (!newAccount.name || !newAccount.type) return false;
    return accounts.some(acc => 
      acc.type === newAccount.type && 
      acc.name === newAccount.name &&
      acc.id !== editingId // 排除自身（编辑模式下）
    );
  }, [newAccount.name, newAccount.type, accounts, editingId]);

  useEffect(() => {
    fetchAccounts();
  }, [currentUser, refreshKey]);

  // 处理从其他页面跳转时打开抽屉
  useEffect(() => {
    const shouldOpenDrawer = localStorage.getItem('open_account_drawer');
    if (shouldOpenDrawer === 'true') {
      handleOpenDrawer();
      localStorage.removeItem('open_account_drawer');
    }
  });

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 min-h-[680px]">
      {/* 头部统计区域 */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-baseline gap-6 mb-2">
            <h2 className="text-xl font-bold text-gray-800 font-serif">账户管理</h2>
            <div className="flex gap-6 text-sm">
              <div className="flex gap-2">
                <span className="text-gray-500">净资产</span>
                <span className="font-bold text-[#5D9CEC]">{formatCurrency(stats.netAssets)}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-500">总资产</span>
                <span className="font-bold text-[#FB2C36]">{formatCurrency(stats.totalAssets)}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-500">总负债</span>
                <span className="font-bold text-[#00BBA7]">{formatCurrency(stats.totalLiabilities)}</span>
              </div>
            </div>
          </div>
        </div>
        <button 
          onClick={handleOpenDrawer}
          className="bg-[#e0a9bb] hover:bg-[#d098aa] text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors text-sm font-medium  font-serif"
        >
          <Plus size={18} />
          新增账户
        </button>
      </div>

      {/* 标签页切换 */}
      <div className="flex gap-8 border-b border-gray-100 mb-6">
        <button
          onClick={() => setActiveTab('asset')}
          className={`pb-3 px-2 text-sm font-medium transition-all relative font-serif font-bold ${
            activeTab === 'asset'
              ? 'text-[#e0a9bb]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          资产账户
          {activeTab === 'asset' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#e0a9bb] rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('liability')}
          className={`pb-3 px-2 text-sm font-medium transition-all relative font-serif font-bold ${
            activeTab === 'liability'
              ? 'text-[#e0a9bb]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          负债账户
          {activeTab === 'liability' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#e0a9bb] rounded-full" />
          )}
        </button>
      </div>

      {/* 表头 */}
      <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 rounded-xl text-xs font-medium text-gray-500 mb-2">
        <div className="col-span-3">账户名称</div>
        <div className="col-span-2 text-right pr-8">{activeTab === 'liability' ? '负债' : '资产'}</div>
        <div className="col-span-2 text-right">币种</div>
        <div className="col-span-4 text-right">操作</div>
      </div>

      {/* 账户列表 */}
      <div className="space-y-4">
        {Object.entries(groupedAccounts).map(([groupName, groupAccounts]) => (
          <div key={groupName} className="space-y-1">
            {/* 分组标题 */}
            <div 
              onClick={() => toggleGroup(groupName)}
              className="flex items-center gap-2 px-2 py-2 cursor-pointer hover:bg-gray-50 rounded-lg text-gray-500 text-sm select-none font-serif"
            >
              {expandedGroups[groupName] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <span>{groupName}</span>
              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full font-sans">
                {formatCurrency(groupAccounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0))}
              </span>
            </div>

            {/* 分组内容 */}
            {expandedGroups[groupName] && (
              <div className="space-y-1">
                {groupAccounts.map((account) => {
                  const { icon: defaultIcon } = getAccountGroupInfo(account.type);
                  return (
                    <div
                      key={account.id}
                      className="grid grid-cols-12 gap-1 px-4 py-1 hover:bg-gray-50 rounded-xl items-center transition-colors group"
                    >
                      {/* 账户名称 */}
                      <div className="col-span-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                          {account.icon ? account.icon : defaultIcon}
                        </div>
                        <span className="font-medium text-gray-700 font-serif">{account.name}</span>
                      </div>

                      {/* 资产余额 */}
                      <div className="col-span-2 text-right pr-8 font-medium text-gray-900">
                        {formatCurrency(account.balance)}
                      </div>

                      {/* 币种 */}
                      <div className="col-span-2 text-right text-gray-500 text-sm">
                        CNY
                      </div>

                      {/* 操作按钮 */}
                      <div className="col-span-5 text-right flex justify-end gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEditAccount(account)}
                          className="text-gray-400 hover:text-[#e0a9bb] flex items-center gap-1 text-xs transition-colors"
                        >
                          <Pencil size={14} />
                          编辑
                        </button>
                        <button 
                          onClick={() => handleDeleteAccount(account)}
                          className="text-gray-400 hover:text-red-400 flex items-center gap-1 text-xs transition-colors"
                        >
                          <Trash2 size={14} />
                          删除
                        </button>
                        <button 
                          onClick={() => handleViewTransactions(account)}
                          className="text-gray-400 hover:text-blue-400 flex items-center gap-1 text-xs transition-colors"
                        >
                          <FileText size={14} />
                          查看流水
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
        
        {Object.keys(groupedAccounts).length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            暂无账户数据
          </div>
        )}
      </div>

      {/* 右侧抽屉 */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end font-serif">
          {/* 遮罩层 */}
          <div 
            className="absolute inset-0 bg-black/20 transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />
          
          {/* 抽屉内容 */}
          <div className="relative w-[400px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* 抽屉头部 */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">{editingId ? '编辑账户' : '新增账户'}</h3>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* 抽屉表单 */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* 账户类型 */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  账户类型 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={newAccount.type}
                    onChange={(e) => setNewAccount({...newAccount, type: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e0a9bb]/20 focus:border-[#e0a9bb] transition-all text-sm appearance-none cursor-pointer"
                  >
                    <option value="" disabled>请选择</option>
                    {ACCOUNT_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* 账户名称 */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  账户名称 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({...newAccount, name: e.target.value.slice(0, 20)})}
                    placeholder="请输入"
                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm ${
                      isDuplicateName 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:ring-[#e0a9bb]/20 focus:border-[#e0a9bb]'
                    }`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    {newAccount.name.length}/20
                  </span>
                </div>
                {isDuplicateName && (
                  <span className="text-xs text-red-500 block animate-in slide-in-from-top-1">
                    该账户类型下已存在同名账户
                  </span>
                )}
              </div>

              {/* 账户图标 */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  图标 <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl border-2 border-[#e0a9bb] flex items-center justify-center text-xl bg-pink-50">
                    {newAccount.icon || '❓'}
                  </div>
                  <span className="text-xs text-gray-400">已选图标</span>
                </div>
                <div className="grid grid-cols-5 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 max-h-[200px] overflow-y-auto">
                  {AVAILABLE_ICONS.map((icon, index) => (
                    <button
                      key={index}
                      onClick={() => setNewAccount({...newAccount, icon})}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${
                        newAccount.icon === icon 
                          ? 'bg-[#e0a9bb] text-white shadow-md scale-110' 
                          : 'bg-white text-gray-600 hover:bg-gray-100 hover:scale-105'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* 币种 */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  币种 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={newAccount.currency}
                    disabled
                    className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 text-sm appearance-none cursor-not-allowed"
                  >
                    <option value="CNY">人民币</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* 余额 */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  {newAccount.type === '负债账户' ? '负债' : '余额'} <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={newAccount.balance}
                  onChange={handleBalanceChange}
                  placeholder="请输入"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e0a9bb]/20 focus:border-[#e0a9bb] transition-all text-sm font-sans"
                />
              </div>
            </div>

            {/* 抽屉底部 */}
            <div className="p-6 border-t border-gray-100 flex gap-4">
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                取消
              </button>
              <button 
                onClick={handleSaveAccount}
                className="flex-1 py-2.5 bg-[#e0a9bb] text-white rounded-xl hover:bg-[#d098aa] transition-colors font-medium shadow-sm shadow-pink-200"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountManagement;
