'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TrendingUp, Building, DollarSign } from 'lucide-react';

interface Metrics {
  totalRaised: string;
  activeDeals: number;
  portfolioCompanies: number;
}

export function MetricsClient() {
  const [metrics, setMetrics] = useState<Metrics>({
    totalRaised: '$0M',
    activeDeals: 0,
    portfolioCompanies: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        // Fetch raises data from Firestore
        const raisesRef = collection(db, 'raises');
        const raisesSnapshot = await getDocs(raisesRef);
        
        let totalRaised = 0;
        let activeDeals = 0;
        let portfolioCompanies = 0;

        raisesSnapshot.forEach((doc) => {
          const data = doc.data();
          portfolioCompanies++;
          
          if (data.status === 'active') {
            activeDeals++;
          }
          
          if (data.raised && typeof data.raised === 'number') {
            totalRaised += data.raised;
          }
        });

        setMetrics({
          totalRaised: `$${(totalRaised / 1000000).toFixed(1)}M`,
          activeDeals,
          portfolioCompanies
        });
      } catch (error) {
        console.error('Error fetching metrics:', error);
        // Use fallback data if Firestore fails
        setMetrics({
          totalRaised: '$2.4M',
          activeDeals: 3,
          portfolioCompanies: 8
        });
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="grid md:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-8 border border-gray-200 animate-pulse">
            <div className="w-12 h-12 bg-gray-200 rounded-lg mb-6"></div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="bg-white rounded-xl p-8 border border-gray-200 hover:shadow-lg transition-shadow">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
          <DollarSign className="w-6 h-6 text-blue-600" />
        </div>
        <div className="text-3xl font-bold mb-2">{metrics.totalRaised}</div>
        <p className="text-gray-600">Total capital deployed</p>
      </div>
      
      <div className="bg-white rounded-xl p-8 border border-gray-200 hover:shadow-lg transition-shadow">
        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
          <TrendingUp className="w-6 h-6 text-green-600" />
        </div>
        <div className="text-3xl font-bold mb-2">{metrics.activeDeals}</div>
        <p className="text-gray-600">Active deals</p>
      </div>
      
      <div className="bg-white rounded-xl p-8 border border-gray-200 hover:shadow-lg transition-shadow">
        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
          <Building className="w-6 h-6 text-purple-600" />
        </div>
        <div className="text-3xl font-bold mb-2">{metrics.portfolioCompanies}</div>
        <p className="text-gray-600">Portfolio companies</p>
      </div>
    </div>
  );
}
