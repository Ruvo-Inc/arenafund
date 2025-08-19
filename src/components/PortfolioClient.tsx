'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface PortfolioCompany {
  id: string;
  name: string;
  description: string;
  sector: string;
  stage: string;
  status: string;
  website?: string;
}

export function PortfolioClient() {
  const [companies, setCompanies] = useState<PortfolioCompany[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPortfolio() {
      try {
        // Fetch portfolio companies from Firestore raises collection
        const raisesRef = collection(db, 'raises');
        const raisesQuery = query(raisesRef, orderBy('createdAt', 'desc'), limit(6));
        const raisesSnapshot = await getDocs(raisesQuery);
        
        const portfolioData: PortfolioCompany[] = [];
        
        raisesSnapshot.forEach((doc) => {
          const data = doc.data();
          portfolioData.push({
            id: doc.id,
            name: data.name || 'Stealth Company',
            description: data.description || 'B2B AI solution for enterprise customers',
            sector: data.sector || 'AI/ML',
            stage: data.stage || 'Pre-seed',
            status: data.status || 'active',
            website: data.website
          });
        });

        setCompanies(portfolioData);
      } catch (error) {
        console.error('Error fetching portfolio:', error);
        // Use fallback data if Firestore fails
        setCompanies([
          {
            id: '1',
            name: 'DataGuard AI',
            description: 'AI-powered data quality platform for financial institutions',
            sector: 'FinTech',
            stage: 'Series A',
            status: 'active'
          },
          {
            id: '2',
            name: 'SupportBot Pro',
            description: 'Agentic customer support automation for B2B SaaS',
            sector: 'SaaS',
            stage: 'Seed',
            status: 'active'
          },
          {
            id: '3',
            name: 'SecureLLM',
            description: 'Enterprise-grade LLM infrastructure with data residency',
            sector: 'Infrastructure',
            stage: 'Pre-seed',
            status: 'active'
          }
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchPortfolio();
  }, []);

  if (loading) {
    return (
      <div className="grid md:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-8 border border-gray-200 animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-3 gap-8">
        {companies.slice(0, 3).map((company) => (
          <div key={company.id} className="bg-white rounded-xl p-8 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">{company.name}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                company.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {company.status}
              </span>
            </div>
            <p className="text-gray-600 mb-4 leading-relaxed">{company.description}</p>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>{company.sector}</span>
              <span>{company.stage}</span>
            </div>
          </div>
        ))}
      </div>
      
      {companies.length > 3 && (
        <div className="grid md:grid-cols-3 gap-8">
          {companies.slice(3, 6).map((company) => (
            <div key={company.id} className="bg-white rounded-xl p-8 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">{company.name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  company.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {company.status}
                </span>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">{company.description}</p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{company.sector}</span>
                <span>{company.stage}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="text-center">
        <Link
          href="/investors"
          className="inline-flex items-center space-x-2 border border-gray-300 hover:border-gray-400 px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          <span>View all portfolio companies</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
