import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({});
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [upcomingIPOs, setUpcomingIPOs] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [dashboardRes, expensesRes, iposRes, savingsRes] = await Promise.all([
        axios.get('/api/reports/dashboard', config),
        axios.get('/api/expenses', config),
        axios.get('/api/ipos/upcoming'),
        axios.get('/api/savings', config)
      ]);

      setDashboardData(dashboardRes.data);
      setRecentTransactions(expensesRes.data.slice(0, 5));
      setUpcomingIPOs(iposRes.data.slice(0, 3));
      setSavingsGoals(savingsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const expenseData = [
    { name: 'Investments', value: dashboardData.total_investments || 0 },
    { name: 'Savings', value: dashboardData.total_savings || 0 },
    { name: 'Expenses', value: dashboardData.monthly_expenses || 0 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Net Worth Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Net Worth</h3>
          <p className="text-2xl font-bold text-green-600">${dashboardData.net_worth?.toFixed(2) || '0.00'}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Total Investments</h3>
          <p className="text-2xl font-bold text-blue-600">${dashboardData.total_investments?.toFixed(2) || '0.00'}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Monthly Expenses</h3>
          <p className="text-2xl font-bold text-red-600">${dashboardData.monthly_expenses?.toFixed(2) || '0.00'}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Total Savings</h3>
          <p className="text-2xl font-bold text-purple-600">${dashboardData.total_savings?.toFixed(2) || '0.00'}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Asset Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expenseData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Savings Goals Progress</h3>
          {savingsGoals.map((goal) => (
            <div key={goal.id} className="mb-4">
              <div className="flex justify-between text-sm">
                <span>{goal.title}</span>
                <span>{((goal.saved_amount / goal.target_amount) * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${(goal.saved_amount / goal.target_amount) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions and Upcoming IPOs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Transactions</h3>
          <ul>
            {recentTransactions.map((transaction) => (
              <li key={transaction.id} className="flex justify-between py-2 border-b">
                <span>{transaction.category}</span>
                <span className="text-red-600">-${transaction.amount}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Upcoming IPOs</h3>
          <ul>
            {upcomingIPOs.map((ipo) => (
              <li key={ipo.id} className="py-2 border-b">
                <div className="font-semibold">{ipo.name}</div>
                <div className="text-sm text-gray-600">Issue Date: {ipo.issue_date}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;