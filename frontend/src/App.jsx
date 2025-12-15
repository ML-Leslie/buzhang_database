import React, { useState, useEffect } from 'react';
import TransactionList from './TransactionList';
import DashboardHome from './DashboardHome';
import Sidebar from './Sidebar';
import RecordTransactionModal from './RecordTransactionModal';
import ReportPage from './ReportPage'; 
import CategoryManagement from './CategoryManagement';
import AccountManagement from './AccountManagement';
import LoginPage from './LoginPage'; 
import RegisterPage from './RegisterPage';

// --- 4. 主程序 (控制页面切换) ---
export default function App() {
  // 0. 新增：登录状态管理
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  // 新增：当前用户信息
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // 新增：认证页面状态 ('login' | 'register')
  const [authMode, setAuthMode] = useState('login');

  const handleLogin = (user) => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify(user));
    setIsLoggedIn(true);
    setCurrentUser(user);
  };

  const handleRegister = (user) => {
    // 注册成功后直接登录
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify(user));
    setIsLoggedIn(true);
    setCurrentUser(user);
  };

  // 1. 修改：从 localStorage 读取初始状态，如果没有则默认为 'home'
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('activeTab') || 'home';
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. 修改：当 activeTab 变化时，保存到 localStorage
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  // 2. 修改：定义每个页面的宽度配置
  // 你可以在这里自由调整每个页面的宽度 (max-w-*)
  const getPageMaxWidth = () => {
    switch (activeTab) {
      case 'home':
        return 'max-w-6xl'; // 仪表盘保持原宽度
      case 'transactions':
        return 'max-w-7xl'; // 交易列表可以更宽一点，方便查看更多列
      case 'reports':
        return 'max-w-7xl';
      case 'categories':
        return 'max-w-7xl';
      case 'accounts':
        return 'max-w-7xl';
      default:
        return 'max-w-7xl';
    }
  };

  // 根据 activeTab 决定右边显示什么
  const renderContent = () => {
    // 传递 currentUser 给子组件
    const props = { 
      currentUser,
      onNavigate: setActiveTab // 传递导航函数
    };
    
    switch (activeTab) {
      case 'home':
        return <DashboardHome {...props} />;
      case 'transactions':
        return <TransactionList {...props} />; 
      case 'reports':
        return <ReportPage {...props} />;
      case 'accounts':
        return <AccountManagement {...props} />;
      case 'categories':
        return <CategoryManagement {...props} />;
      default:
        return <DashboardHome {...props} />;
    }
  };

  // 如果未登录，显示登录或注册页面
  if (!isLoggedIn) {
    if (authMode === 'register') {
      return (
        <RegisterPage 
          onRegister={handleRegister} 
          onSwitchToLogin={() => setAuthMode('login')} 
        />
      );
    }
    return (
      <LoginPage 
        onLogin={handleLogin} 
        onSwitchToRegister={() => setAuthMode('register')} 
      />
    );
  }

  return (
    <div className="flex h-screen bg-[#f5f6fa]  text-gray-600">
      
      {/* 侧边栏 */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenRecordModal={() => setIsModalOpen(true)}
        currentUser={currentUser}
        onLogout={() => {
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('currentUser');
          setIsLoggedIn(false);
          setCurrentUser(null);
        }}
      />

      {/* 主内容区域 */}
      <div className="flex-1 overflow-y-auto">
        {/* 2. 修改：应用动态宽度类名 */}
        <div className={`p-8 mx-auto space-y-6 ${getPageMaxWidth()}`}>
          {renderContent()}
        </div>
      </div>

      {/* 记一笔弹窗 */}
      <RecordTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        currentUser={currentUser}
      />
    </div>
  );
}