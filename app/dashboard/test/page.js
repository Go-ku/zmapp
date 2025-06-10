'use client'
import React, { useState, useEffect } from 'react';

export default function TestPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Validate response structure
        if (!data?.metrics?.occupancyRate || !data?.rentStats?.max) {
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

    fetchStats();
  }, []);

  if (loading) return <div className="p-4">Loading statistics...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!stats) return <div className="p-4">No data available</div>;

  // Safely access nested properties with optional chaining
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Property Statistics</h1>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Occupancy</h2>
          <p className="text-3xl">
            {stats.metrics?.occupancyRate?.toFixed(2) ?? 'N/A'}%
          </p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Rent Statistics</h2>
          <p>Max Rent: ${stats.rentStats?.max?.toFixed(2) ?? 'N/A'}</p>
          <p>Avg Rent: ${stats.rentStats?.average?.toFixed(2) ?? 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}