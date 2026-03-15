import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const Reports = () => {
  const [expenseReport, setExpenseReport] = useState([]);
  const [investmentReport, setInvestmentReport] = useState([]);
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });

  const fetchReports = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [expenseRes, investmentRes] = await Promise.all([
        axios.get('/api/reports/expenses', { ...config, params: dateRange }),
        axios.get('/api/reports/investments', config)
      ]);

      setExpenseReport(expenseRes.data);
      setInvestmentReport(investmentRes.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const exportReport = (type) => {
    // Implement export functionality
    console.log(`Exporting ${type} report`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Reports & Analytics</h1>

      {/* Date Range Filter */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Report Filters</h2>
        <div className="flex space-x-4 mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.start_date}
              onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.end_date}
              onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <button
          onClick={fetchReports}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Generate Reports
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Expense Report */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Expense Report</h2>
            <button
              onClick={() => exportReport('expense')}
              className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
            >
              Export
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={expenseReport}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Breakdown</h3>
            <ul className="space-y-1">
              {expenseReport.map((item) => (
                <li key={item.category} className="flex justify-between">
                  <span>{item.category}</span>
                  <span className="font-semibold">${item.total.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Investment Performance */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Investment Performance</h2>
            <button
              onClick={() => exportReport('investment')}
              className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
            >
              Export
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={investmentReport}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="roi" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Performance Details</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-1">Investment</th>
                    <th className="text-left py-1">Type</th>
                    <th className="text-left py-1">ROI</th>
                    <th className="text-left py-1">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {investmentReport.map((item) => (
                    <tr key={item.name} className="border-b">
                      <td className="py-1">{item.name}</td>
                      <td className="py-1 capitalize">{item.type}</td>
                      <td className={`py-1 ${item.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.roi.toFixed(2)}%
                      </td>
                      <td className={`py-1 ${item.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${item.profit_loss.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Monthly Spending Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={[]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Sector Allocation</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Technology</span>
              <span>40%</span>
            </div>
            <div className="flex justify-between">
              <span>Healthcare</span>
              <span>25%</span>
            </div>
            <div className="flex justify-between">
              <span>Finance</span>
              <span>20%</span>
            </div>
            <div className="flex justify-between">
              <span>Others</span>
              <span>15%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Savings Rate</h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">15%</div>
            <p className="text-gray-600">of monthly income</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;