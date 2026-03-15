import React, { useState, useEffect } from 'react';
import axios from '../../utils/api';

const Stocks = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [newStock, setNewStock] = useState({ ticker: '', sector: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [stockPrices, setStockPrices] = useState({});

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      const response = await axios.get('/api/stocks/watchlist');
      setWatchlist(response.data);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    }
  };

  const addToWatchlist = async () => {
    try {
      await axios.post('/api/stocks/watchlist', newStock);
      setNewStock({ ticker: '', sector: '' });
      fetchWatchlist();
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    }
  };

  const removeFromWatchlist = async (ticker) => {
    try {
      await axios.delete(`/api/stocks/watchlist/${ticker}`);
      fetchWatchlist();
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  const fetchStockPrice = async (ticker) => {
    try {
      const response = await axios.get(`/api/stocks/price/${ticker}`);
      setStockPrices(prev => ({ ...prev, [ticker]: response.data.price }));
    } catch (error) {
      console.error('Error fetching stock price:', error);
    }
  };

  const filteredWatchlist = watchlist.filter(stock =>
    stock.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.sector.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sectors = [...new Set(watchlist.map(stock => stock.sector))];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Stock Market Watchlist</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add to Watchlist */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Add to Watchlist</h2>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Stock Ticker"
              value={newStock.ticker}
              onChange={(e) => setNewStock({ ...newStock, ticker: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            />
            <input
              type="text"
              placeholder="Sector"
              value={newStock.sector}
              onChange={(e) => setNewStock({ ...newStock, sector: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={addToWatchlist}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add to Watchlist
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Search & Filter</h2>
          <input
            type="text"
            placeholder="Search by ticker or sector"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          />
          <h3 className="text-lg font-medium mb-2">Sectors</h3>
          <div className="space-y-1">
            {sectors.map(sector => (
              <button
                key={sector}
                onClick={() => setSearchTerm(sector)}
                className="block w-full text-left px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
              >
                {sector}
              </button>
            ))}
          </div>
        </div>

        {/* Market Overview */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Market Overview</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>NSE</span>
              <span className="text-green-600">+0.5%</span>
            </div>
            <div className="flex justify-between">
              <span>BSE</span>
              <span className="text-green-600">+0.3%</span>
            </div>
            <div className="flex justify-between">
              <span>S&P 500</span>
              <span className="text-red-600">-0.2%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Watchlist Table */}
      <div className="bg-white p-6 rounded-lg shadow-md mt-8">
        <h2 className="text-xl font-semibold mb-4">Your Watchlist</h2>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Ticker</th>
                <th className="px-4 py-2 text-left">Sector</th>
                <th className="px-4 py-2 text-left">Quantity</th>
                <th className="px-4 py-2 text-left">Buy Price</th>
                <th className="px-4 py-2 text-left">Last Price</th>
                <th className="px-4 py-2 text-left">P&L</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWatchlist.map((stock) => {
                const pnl = stock.last_price && stock.buy_price ?
                  ((stock.last_price - stock.buy_price) / stock.buy_price) * 100 : 0;

                return (
                  <tr key={stock.ticker} className="border-t">
                    <td className="px-4 py-2 font-semibold">{stock.ticker}</td>
                    <td className="px-4 py-2">{stock.sector}</td>
                    <td className="px-4 py-2">{stock.quantity || '-'}</td>
                    <td className="px-4 py-2">${stock.buy_price || '-'}</td>
                    <td className="px-4 py-2">
                      {stockPrices[stock.ticker] || stock.last_price || '-'}
                      <button
                        onClick={() => fetchStockPrice(stock.ticker)}
                        className="ml-2 text-blue-500 text-sm"
                      >
                        Refresh
                      </button>
                    </td>
                    <td className={`px-4 py-2 ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {pnl ? `${pnl.toFixed(2)}%` : '-'}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => removeFromWatchlist(stock.ticker)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Stocks;