import React, { useState } from 'react';

export default function RegisterPage({ onRegister, onSwitchToLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-pink-200">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-pink-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">注册账号</h1>
          <p className="text-gray-500 mt-2 text-sm">加入 buzhang，开启记账之旅</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg text-center">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
              placeholder="请输入用户名"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">邮箱 (选填)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
              placeholder="请输入邮箱"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
              placeholder="请输入密码"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">确认密码</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
              placeholder="请再次输入密码"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
          >
            立即注册
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          已有账号？ 
          <button 
            onClick={onSwitchToLogin}
            className="text-pink-500 hover:text-pink-600 font-medium hover:underline focus:outline-none"
          >
            直接登录
          </button>
        </div>
      </div>
    </div>
  );
}
