'use client'

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';


export default function LandlordStatsTestPage() {
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [landlordId, setLandlordId] = useState('');

  const fetchStats = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/landlord-stats?landlordId=${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Validate response structure
      if (!data || typeof data.total !== 'number') {
        throw new Error("Invalid data structure from API");
      }

      setStats(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Optional: Fetch stats if landlordId is in URL query
const searchParams = useSearchParams();

useEffect(() => {
  const id = searchParams.get('landlordId');
  if (id) {
    setLandlordId(id);
    fetchStats(id);
  }
}, [searchParams]);


  const handleSubmit = (e) => {
    e.preventDefault();
    if (landlordId) {
      fetchStats(landlordId);
    }
  };

  if (loading && !error) return <div className="p-4">Loading statistics...</div>;
  
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Landlord Statistics Dashboard</h1>
      
      <form onSubmit={handleSubmit} className="mb-8 p-4 bg-gray-50 rounded-lg">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Landlord ID</label>
            <input
              type="text"
              value={landlordId}
              onChange={(e) => setLandlordId(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter landlord ID"
              required
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Get Stats'}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 mb-4 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {stats && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Summary Card */}
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Summary</h2>
            <div className="space-y-3">
              <StatItem label="Total Properties" value={stats.total} />
              <StatItem label="Total Portfolio Value" value={`$${(stats.totalValue || 0).toLocaleString()}`} />
              <StatItem label="Occupancy Rate" value={`${(stats.occupancyRate || 0).toFixed(2)}%`} />
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Status Breakdown</h2>
            <div className="space-y-3">
              <StatItem label="Occupied" value={stats.occupied} />
              <StatItem label="Vacant" value={stats.vacant} />
              <StatItem label="Maintenance" value={stats.maintenance} />
            </div>
          </div>

          {/* Financials */}
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Financials</h2>
            <div className="space-y-3">
              <StatItem label="Average Monthly Rent" value={`$${(stats.averageRent || 0).toFixed(2)}`} />
              <StatItem 
                label="Estimated Annual Revenue" 
                value={`$${((stats.averageRent || 0) * (stats.occupied || 0) * 12).toLocaleString()}`} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable stat display component
function StatItem({ label, value }) {
  return (
    <div className="flex justify-between border-b pb-2">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}