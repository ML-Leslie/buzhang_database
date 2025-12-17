import React, { useState } from 'react';

export default function RegisterPage({ onRegister, onSwitchToLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [usernameError, setUsernameError] = useState('');

  const checkUsername = async () => {
    if (!username) return;
    try {
      const res = await fetch(`/api/users/check?username=${username}`);
      if (res.ok) {
        const exists = await res.json();
        if (exists) {
          setUsernameError('用户名已存在，请更换');
        } else {
          setUsernameError('');
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (usernameError) return;
    
    if (!username || !password || !confirmPassword) {
      setError('请填写所有字段');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email })
      });

      if (response.ok) {
        const user = await response.json();
        onRegister(user);
      } else {
        // 尝试读取错误信息，如果后端返回的是文本或JSON
        try {
            const errData = await response.json();
            setError(errData.message || '注册失败，用户名可能已存在');
        } catch {
            setError('注册失败，请稍后重试');
        }
      }
    } catch (err) {
      console.error(err);
      setError('网络错误，请检查连接');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* 左侧：渐变背景图 */}
      <div className="hidden lg:block lg:w-7/12 relative overflow-hidden bg-gradient-to-bl from-[#a78bfa] via-[#f472b6] to-[#fde047]">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
        {/* 装饰性光斑 */}
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      </div>

      {/* 右侧：注册表单 */}
      <div className="w-full lg:w-5/12 bg-white flex flex-col justify-center items-center p-8 relative shadow-2xl lg:shadow-none">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-left">
            <h1 className="text-5xl font-bold text-gray-900 mb-3 tracking-tight">欢迎加入!</h1>
            <p className="text-gray-400 text-lg font-light tracking-wide font-serif">开启你的记账之旅</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 mt-8">
            {error && (
              <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}
            
            <div className="space-y-1 font-serif">
              <label className="block text-sm font-medium text-gray-600 ml-1">用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUsernameError('');
                }}
                onBlur={checkUsername}
                className={`w-full px-4 py-3 border ${usernameError ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-[#E0A9BB]'} rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white`}
                placeholder="请输入用户名"
              />
              {usernameError && <p className="text-xs text-red-500 ml-1">{usernameError}</p>}
            </div>

            <div className="space-y-1 font-serif">
              <label className="block text-sm font-medium text-gray-600 ml-1">邮箱 (选填)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E0A9BB] focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                placeholder="请输入邮箱"
              />
            </div>

            <div className="space-y-1 font-serif">
              <label className="block text-sm font-medium text-gray-600 ml-1">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E0A9BB] focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                placeholder="请输入密码"
              />
            </div>

            <div className="space-y-1 font-serif">
              <label className="block text-sm font-medium text-gray-600 ml-1">确认密码</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E0A9BB] focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                placeholder="请再次输入密码"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#F8AFC8] hover:bg-[#F78DB8] text-white font-bold py-3.5 rounded-xl   hover:transition-all duration-200 transform hover: mt-4 font-serif"
            >
              立即注册
            </button>
          </form>

          <div className="mt-8 text-center">
            <span className="text-gray-400 text-sm font-serif">已有账号？ </span>
            <button 
              onClick={onSwitchToLogin}
              className="text-[#f43f5e] hover:text-[#e11d48] font-medium hover:underline focus:outline-none text-sm font-serif"
            >
              直接登录
            </button>
          </div>
        </div>

        <div className="absolute bottom-6 left-8 text-gray-400 text-xs font-serif tracking-wider">
          buzhang 记账™
        </div>
      </div>
    </div>
  );
}
