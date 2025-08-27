'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import InvestorSuccess506b from '@/components/InvestorSuccess506b';
import InvestorSuccess506c from '@/components/InvestorSuccess506c';

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const [pageData, setPageData] = useState({
    mode: '506b' as '506b' | '506c',
    investorName: '',
    investorEmail: '',
    entityName: ''
  });

  useEffect(() => {
    // Get data from URL parameters or sessionStorage
    const mode = searchParams.get('mode') as '506b' | '506c' || '506b';
    
    // Get data from sessionStorage (set by the form submission)
    const investorName = sessionStorage.getItem('investorName') || '';
    const investorEmail = sessionStorage.getItem('investorEmail') || '';
    const entityName = sessionStorage.getItem('entityName') || '';

    setPageData({
      mode,
      investorName,
      investorEmail,
      entityName
    });

    // Clear sensitive data from sessionStorage after use
    sessionStorage.removeItem('investorName');
    sessionStorage.removeItem('investorEmail');
    sessionStorage.removeItem('entityName');
  }, [searchParams]);

  return (
    <>
      {pageData.mode === '506c' ? (
        <InvestorSuccess506c 
          investorName={pageData.investorName}
          investorEmail={pageData.investorEmail}
          entityName={pageData.entityName}
        />
      ) : (
        <InvestorSuccess506b 
          investorName={pageData.investorName}
          investorEmail={pageData.investorEmail}
        />
      )}
    </>
  );
}