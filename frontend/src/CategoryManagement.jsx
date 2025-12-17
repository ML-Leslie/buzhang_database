import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Pencil, Trash2, FileText, X } from 'lucide-react';

const CategoryManagement = ({ currentUser, onNavigate, refreshKey }) => {
  const [activeType, setActiveType] = useState('EXPENSE'); // 'EXPENSE' or 'INCOME'
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 抽屉状态和表单数据
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newCategory, setNewCategory] = useState({
    type: 'EXPENSE',
    name: '',
    icon: '',
    budget: '' 
  });

  const AVAILABLE_ICONS = [
    '🍚', '🍷', '🥢', '🍔', '🍰',
    '☕', '🍺', '🛒', '👕', '🚗',
    '🚌', '✈️', '🏠', '📱', '💻',
    '💊', '📚', '🎁', '💰', '🏦',
    '🏥', '🎓', '🎮', '🎵', '🎨'
  ];

  const handleViewTransactions = (category) => {
    // 设置筛选条件到 localStorage
    localStorage.setItem('tx_filterCategory', category.id);
    
    // 映射分类类型到筛选类型
    let typeFilter = 'ALL';
    if (category.type === 'EXPENSE' || category.type === '支出') typeFilter = 'EXPENSE';
    if (category.type === 'INCOME' || category.type === '收入') typeFilter = 'INCOME';
    localStorage.setItem('tx_filterType', typeFilter);
    
    // 清空账户筛选，避免冲突
    localStorage.setItem('tx_filterAccount', '');

    // 跳转到交易列表页面
    if (onNavigate) {
      onNavigate('transactions');
    }
  };

  const handleDeleteCategory = async (category) => {
    if (window.confirm(`确定要删除分类“${category.name}”吗？\n\n注意：这将同时删除该分类下的所有流水记录，并回滚相关的账户余额！此操作不可恢复。`)) {
      try {
        const response = await fetch(`/api/categories/${category.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await fetchCategories();
        } else {
          alert('删除失败，请重试');
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('删除出错');
      }
    }
  };

  const handleAddCategory = () => {
    setEditingId(null);
    setNewCategory({ type: activeType, name: '', icon: '', budget: '' });
    setIsDrawerOpen(true);
  };

  const handleEditCategory = (category) => {
    setEditingId(category.id);
    setNewCategory({
      type: category.type === '支出' ? 'EXPENSE' : (category.type === '收入' ? 'INCOME' : category.type), 
      name: category.name,
      icon: category.icon,
      budget: category.budgetAmount ? String(category.budgetAmount) : '' 
    });
    setIsDrawerOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!newCategory.name || !newCategory.icon) {
      alert('请填写完整信息');
      return;
    }

    if (isDuplicateName) {
      alert('分类名称已存在，请使用其他名称');
      return;
    }

    try {
      const url = editingId ? `/api/categories/${editingId}` : '/api/categories';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          name: newCategory.name,
          type: newCategory.type,
          icon: newCategory.icon
        }),
      });

      if (response.ok) {
        const savedCategory = await response.json();
        
        // 如果是支出类型，且填写了预算，则保存预算
        if (newCategory.type === 'EXPENSE' && newCategory.budget) {
           const now = new Date();
           const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
           
           // 检查是否已有预算 (如果是编辑模式)
           let budgetId = null;
           if (editingId) {
             const existingCategory = categories.find(c => c.id === editingId);
             if (existingCategory && existingCategory.budgetId) {
               budgetId = existingCategory.budgetId;
             }
           }

           const budgetUrl = budgetId ? `/api/budgets/${budgetId}` : '/api/budgets';
           const budgetMethod = budgetId ? 'PUT' : 'POST';
           
           await fetch(budgetUrl, {
             method: budgetMethod,
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
               userId: currentUser.id,
               categoryId: savedCategory.id || (editingId ? editingId : null), // 新增时用返回的ID，编辑时用editingId
               amount: parseFloat(newCategory.budget),
               month: monthStr
             })
           });
        }

        await fetchCategories();
        setIsDrawerOpen(false);
      } else {
        alert('保存失败，请重试');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert('保存出错');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [currentUser, refreshKey]);

  // 自动打开抽屉
  useEffect(() => {
    const shouldOpenDrawer = localStorage.getItem('open_category_drawer');
    if (shouldOpenDrawer === 'true') {
      handleAddCategory();
      localStorage.removeItem('open_category_drawer');
    }
  });

  const fetchCategories = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/categories?userId=${currentUser.id}`);
      if (response.ok) {
        const data = await response.json();
        
        // 获取当前月度预算
        const now = new Date();
        const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const budgetRes = await fetch(`/api/budgets?userId=${currentUser.id}&month=${monthStr}`);
        
        let budgets = [];
        if (budgetRes.ok) {
          budgets = await budgetRes.json();
        }

        // 将预算信息添加到分类数据中
        const categoriesWithBudget = data.map(cat => {
          const budget = budgets.find(b => b.categoryId === cat.id);
          return {
            ...cat,
            budgetAmount: budget ? budget.amount : null,
            budgetId: budget ? budget.id : null
          };
        });

        setCategories(categoriesWithBudget);
      }
    } catch (error) {
      console.error('Failed to fetch categories', error);
    } finally {
      setLoading(false);
    }
  };



  const filteredCategories = categories.filter(c => c.type === activeType);

  // 检查名称是否重复
  const isDuplicateName = useMemo(() => {
    if (!newCategory.name) return false;
    return categories.some(c => 
      c.type === newCategory.type && 
      c.name === newCategory.name &&
      c.id !== editingId
    );
  }, [newCategory.name, newCategory.type, categories, editingId]);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 min-h-[680px]">
      {/* 头部区域 */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold text-gray-800 font-serif">收支分类管理</h2>
        <button 
          onClick={handleAddCategory}
          className="bg-[#e0a9bb] hover:bg-[#d098aa] text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors text-sm font-medium font-serif font-bold"
        >
          <Plus size={18} />
          新增分类
        </button>
      </div>

      {/* 标签页切换 */}
      <div className="flex gap-8 border-b border-gray-100 mb-6">
        <button
          onClick={() => setActiveType('EXPENSE')}
          className={`pb-3 px-2 text-sm font-medium transition-all relative font-serif font-bold ${
            activeType === 'EXPENSE'
              ? 'text-[#e0a9bb]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          支出类型
          {activeType === 'EXPENSE' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#e0a9bb] rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveType('INCOME')}
          className={`pb-3 px-2 text-sm font-medium transition-all relative font-serif font-bold ${
            activeType === 'INCOME'
              ? 'text-[#e0a9bb]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          收入类型
          {activeType === 'INCOME' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#e0a9bb] rounded-full" />
          )}
        </button>
      </div>

      {/* 表头 */}
      <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 rounded-xl text-xs font-medium text-gray-500 mb-2">
        <div className="col-span-3">分类名称</div>
        <div className="col-span-3 text-center">{activeType === 'EXPENSE' ? '支出' : '收入'}</div>
        {activeType === 'EXPENSE' && <div className="col-span-2 text-center">月度预算</div>}
        <div className={`${activeType === 'EXPENSE' ? 'col-span-4' : 'col-span-6'} text-right`}>操作</div>
      </div>

      {/* 列表内容 */}
      <div className="space-y-1">
        {filteredCategories.map((category) => (
          <div
            key={category.id}
            className="grid grid-cols-12 gap-4 px-4 py-2 hover:bg-gray-50 rounded-xl items-center transition-colors group"
          >
            {/* 分类名称 */}
            <div className="col-span-3 flex items-center gap-3 font-serif text-[15px]">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                {category.icon}
              </div>
              <span className="font-medium text-gray-700">{category.name}</span>
            </div>

            {/* 金额 (统计数据) */}
            <div className={`col-span-3 text-center font-medium ${activeType === 'EXPENSE' ? 'text-teal-500' : 'text-red-500'}`}>
              {Number(category.totalAmount || 0).toFixed(2)}
            </div>

            {/* 月度预算 (仅支出显示) */}
            {activeType === 'EXPENSE' && (
              <div className="col-span-2 text-center text-gray-500 font-medium">
                {category.budgetAmount ? Number(category.budgetAmount).toFixed(2) : '-'}
              </div>
            )}

            {/* 操作按钮 */}
            <div className={`${activeType === 'EXPENSE' ? 'col-span-4' : 'col-span-6'} flex justify-end gap-4 opacity-0 group-hover:opacity-100 transition-opacity`}>
              <button 
                onClick={() => handleEditCategory(category)}
                className="text-gray-400 hover:text-[#e0a9bb] flex items-center gap-1 text-xs transition-colors"
              >
                <Pencil size={14} />
                编辑
              </button>
              <button 
                onClick={() => handleDeleteCategory(category)}
                className="text-gray-400 hover:text-red-400 flex items-center gap-1 text-xs transition-colors"
              >
                <Trash2 size={14} />
                删除
              </button>
              <button 
                onClick={() => handleViewTransactions(category)}
                className="text-gray-400 hover:text-blue-400 flex items-center gap-1 text-xs transition-colors"
              >
                <FileText size={14} />
                查看流水
              </button>
            </div>
          </div>
        ))}
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
              <h3 className="text-lg font-bold text-gray-800">{editingId ? '编辑分类' : '新增分类'}</h3>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* 抽屉表单 */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* 分类类型 */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 inline-block">
                  分类类型 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-6">
                  <label className={`flex items-center gap-2 ${editingId ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                    <input 
                      type="radio" 
                      name="type" 
                      checked={newCategory.type === 'EXPENSE'}
                      onChange={() => !editingId && setNewCategory({...newCategory, type: 'EXPENSE'})}
                      disabled={!!editingId}
                      className="w-4 h-4 text-[#e0a9bb] focus:ring-[#e0a9bb]"
                    />
                    <span className="text-sm text-gray-600">支出分类</span>
                  </label>
                  <label className={`flex items-center gap-2 ${editingId ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                    <input 
                      type="radio" 
                      name="type" 
                      checked={newCategory.type === 'INCOME'}
                      onChange={() => !editingId && setNewCategory({...newCategory, type: 'INCOME'})}
                      disabled={!!editingId}
                      className="w-4 h-4 text-[#e0a9bb] focus:ring-[#e0a9bb]"
                    />
                    <span className="text-sm text-gray-600">收入分类</span>
                  </label>
                </div>
              </div>

              {/* 分类名称 */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  分类名称 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value.slice(0, 20)})}
                    placeholder="请输入"
                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm placeholder:font-serif placeholder:text-gray-400 ${
                      isDuplicateName 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:ring-[#e0a9bb]/20 focus:border-[#e0a9bb]'
                    }`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    {newCategory.name.length}/20
                  </span>
                </div>
                {isDuplicateName && (
                  <span className="text-xs text-red-500 block animate-in slide-in-from-top-1">
                    该分类名称已存在
                  </span>
                )}
              </div>

              {/* 本月预算 (仅支出类型显示) */}
              {newCategory.type === 'EXPENSE' && (
                <div className="space-y-3 animate-in slide-in-from-top-2">
                  <label className="text-sm font-medium text-gray-700">
                    本月预算 <span className="text-gray-400 text-xs font-normal"></span>
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={newCategory.budget}
                      onChange={(e) => setNewCategory({...newCategory, budget: e.target.value})}
                      onWheel={(e) => e.target.blur()} 
                      placeholder="请输入预算金额"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e0a9bb]/20 focus:border-[#e0a9bb] transition-all text-sm text-red-500 font-sans placeholder:font-serif placeholder:text-gray-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                      CNY
                    </span>
                  </div>
                </div>
              )}

              {/* 分类图标 */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  分类图标 <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl border-2 border-[#e0a9bb] flex items-center justify-center text-xl bg-pink-50">
                    {newCategory.icon || '❓'}
                  </div>
                  <span className="text-xs text-gray-400">已选图标</span>
                </div>
                <div className="grid grid-cols-5 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 max-h-[300px] overflow-y-auto">
                  {AVAILABLE_ICONS.map((icon, index) => (
                    <button
                      key={index}
                      onClick={() => setNewCategory({...newCategory, icon})}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${
                        newCategory.icon === icon 
                          ? 'bg-[#e0a9bb] text-white shadow-md scale-110' 
                          : 'bg-white text-gray-600 hover:bg-gray-100 hover:scale-105'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
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
                onClick={handleSaveCategory}
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

export default CategoryManagement;
