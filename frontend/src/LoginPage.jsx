import React, { useState } from 'react';

export default function LoginPage({ onLogin, onSwitchToRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (username && password) {
      try {
        const response = await fetch('/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        if (response.ok) {
          const user = await response.json();
          onLogin(user);
        } else {
          setError('用户名或密码错误');
        }
      } catch (err) {
        console.error(err);
        setError('登录失败，请检查网络');
      }
    } else {
      setError('请输入用户名和密码');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* 左侧：渐变背景图 */}
      <div className="hidden lg:block lg:w-7/12 relative overflow-hidden bg-gradient-to-tr from-[#fde047] via-[#d8b4fe] to-[#f472b6]">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
        {/* 装饰性光斑 */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
      </div>

      {/* 右侧：登录表单 */}
      <div className="w-full lg:w-5/12 bg-white flex flex-col justify-center items-center p-8 relative shadow-2xl lg:shadow-none">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-left">
            <h1 className="text-5xl font-bold text-gray-900 mb-3 tracking-tight">你好!</h1>
            <p className="text-gray-400 text-lg font-light tracking-wide font-serif">记录每一笔美好生活</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-10">
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
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E0A9BB] focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                placeholder="请输入用户名"
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

            <button
              type="submit"
              className="w-full bg-[#F8AFC8] hover:bg-[#F78DB8] text-white font-bold py-3.5 rounded-xl   hover:transition-all duration-200 transform hover: mt-4 font-serif"
            >
              登录
            </button>
          </form>

          <div className="mt-8 text-center">
            <span className="text-gray-400 text-sm font-serif">还没有账号？ </span>
            <button 
              onClick={onSwitchToRegister}
              className="text-[#f43f5e] hover:text-[#e11d48] font-medium hover:underline focus:outline-none text-sm font-serif"
            >
              立即注册
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
