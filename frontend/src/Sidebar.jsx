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
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  ArrowLeftFromLine
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, text, id, activeTab, onClick, isSubItem = false }) => (
  <div 
    onClick={() => onClick && onClick(id)}
    className={`flex items-center px-4 py-3 cursor-pointer transition-all rounded-xl mb-1 ${
      activeTab === id 
        ? 'bg-[#e0a9bb] text-white' 
        : 'text-gray-600 hover:bg-gray-200'
    } ${isSubItem ? 'text-sm py-2.5' : ''}`}
  >
    {Icon && <Icon size={isSubItem ? 18 : 20} className="mr-3" />}
    <span className={`font-medium text-sm`}>{text}</span>
  </div>
);

const Sidebar = ({ activeTab, setActiveTab, onOpenRecordModal, currentUser, onLogout }) => {
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);

  return (
    <div className="w-50 bg-white border-r border-gray-200 flex flex-col h-full flex-shrink-0 font-serif">
      {/* 记一笔按钮区域 */}
      <div className="p-6 pb-2 ">
        <button 
          onClick={onOpenRecordModal}
          className="w-full bg-white border border-[#e0A9BB] text-[#e0A9BB] hover:bg-pink-50 transition-all py-3 rounded-xl flex items-center justify-center gap-2 text-me font-medium active:scale-95"
        >
          <Plus size={20} />
          记一笔
        </button>
      </div>
      
      {/* 导航菜单区域 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        <SidebarItem 
          icon={LayoutDashboard} 
          text="首页" 
          id="home" 
          activeTab={activeTab} 
          onClick={setActiveTab} 
        />
        <SidebarItem 
          icon={ScrollText} 
          text="流水" 
          id="transactions" 
          activeTab={activeTab} 
          onClick={setActiveTab} 
        />
        <SidebarItem 
          icon={PieChart} 
          text="报表" 
          id="reports" 
          activeTab={activeTab} 
          onClick={setActiveTab} 
        />
        
        {/* 分类标签折叠菜单 */}
        <div className="mt-1 pt-1">
          <div 
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            className="flex items-center justify-between px-4 py-3 cursor-pointer text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <div className="flex items-center">
              <LayoutGrid size={20} className="mr-3" />
              <span className="text-sm font-serif font-bold">分类标签</span>
            </div>
            {isCategoryOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>

          {isCategoryOpen && (
            <div className="pl-8 mt-1 space-y-1">
              <SidebarItem 
                text="分类管理" 
                id="categories" 
                activeTab={activeTab} 
                onClick={setActiveTab}
                isSubItem
              />
              <SidebarItem 
                text="账户管理" 
                id="accounts" 
                activeTab={activeTab} 
                onClick={setActiveTab}
                isSubItem
              />
               
            </div>
          )}
        </div>
      </div>

      {/* 底部区域 */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center justify-between p-0 rounded-2xl">
          <div className="flex items-center gap-2 ">
            <div className="w-6 h-6 rounded-full bg-[#e0A9BB] flex items-center justify-center text-white text-[12px]">
              {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="font-medium text-sm truncate max-w-[5rem] min-w-0">
              {currentUser?.username || '未登录'}
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="text-xs text-white cursor-pointer px-3 py-1.5 bg-[#e0A9BB] rounded-full transition-colors"
          >
            注销
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
