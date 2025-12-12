import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Pencil, Trash2, Copy } from 'lucide-react';

export default function TransactionList() {
  // 1. 定义数据状态 (相当于后端的 List<Transaction>)
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. 自动加载数据 (useEffect 相当于 window.onload)
  useEffect(() => {
    // 模拟从后端 API 获取数据
    // 真实开发时，这里换成: fetch('http://localhost:8080/api/accounts')...
    console.log("正在加载流水数据...");
    
    setTimeout(() => {
      const mockData = [
        { id: 1, category: '餐饮', amount: -15.00, account: '招商银行', date: '2025-12-12', remark: '午餐黄焖鸡' },
        { id: 2, category: '交通', amount: -32.50, account: '微信零钱', date: '2025-12-12', remark: '打车去公司' },
        { id: 3, category: '工资', amount: 8500.00, account: '工商银行', date: '2025-12-10', remark: '12月工资' },
        { id: 4, category: '购物', amount: -299.00, account: '支付宝', date: '2025-12-08', remark: '优衣库' },
      ];
      setTransactions(mockData);
      setLoading(false);
    }, 800); // 模拟 0.8秒 的网络延迟
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[500px]">
      {/* 顶部工具栏 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          流水列表 
          <span className="ml-4 text-sm font-normal text-gray-500">
            结余 <span className="text-black font-bold">35.04</span>
          </span>
        </h2>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 text-gray-600">
            <Download size={16}/> 数据导入
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16}/>
            <input 
              type="text" 
              placeholder="搜索..." 
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#ff9c4b]"
            />
          </div>
        </div>
      </div>

      {/* 表格内容 */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">数据加载中...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 text-sm">
                <th className="pb-3 pl-4">分类</th>
                <th className="pb-3">金额</th>
                <th className="pb-3">账户</th>
                <th className="pb-3">时间</th>
                <th className="pb-3">备注</th>
                <th className="pb-3 text-right pr-4">操作</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((item) => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors group">
                  <td className="py-4 pl-4 font-medium text-gray-700">{item.category}</td>
                  <td className={`py-4 font-bold ${item.amount > 0 ? 'text-red-500' : 'text-teal-500'}`}>
                    {item.amount > 0 ? `+${item.amount}` : item.amount}
                  </td>
                  <td className="py-4 text-gray-500 text-sm">{item.account}</td>
                  <td className="py-4 text-gray-400 text-sm">{item.date}</td>
                  <td className="py-4 text-gray-400 text-sm">{item.remark}</td>
                  <td className="py-4 text-right pr-4">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 hover:bg-blue-50 text-blue-500 rounded"><Pencil size={16}/></button>
                      <button className="p-1.5 hover:bg-red-50 text-red-500 rounded"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}