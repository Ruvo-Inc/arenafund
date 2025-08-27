'use client';

import React, { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SuccessContent from '@/components/SuccessContent';

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <Suspense fallback={
        <div className="arena-section">
          <div className="arena-container text-center">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center animate-pulse">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            </div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      }>
        <SuccessContent />
      </Suspense>
      
      <Footer />
    </div>
  );
}