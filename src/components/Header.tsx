'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="arena-nav">
      <div className="arena-container px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <Image
              src="/logo.png"
              alt="Arena Fund"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <span className="arena-subtitle text-arena-navy">Arena Fund</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/about" className="arena-nav-link">About</Link>
            <Link href="/team" className="arena-nav-link">Team</Link>
            <Link href="/thesis" className="arena-nav-link">Thesis</Link>
            <Link href="/insights" className="arena-nav-link">Insights</Link>
            <Link href="/apply" className="arena-nav-link">Apply</Link>
            <Link href="/invest" className="arena-btn-nav">
              Invest With Us
            </Link>
          </div>

          <button 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-6 py-4 space-y-4">
            <Link href="/about" className="block arena-nav-link">About</Link>
            <Link href="/team" className="block arena-nav-link">Team</Link>
            <Link href="/thesis" className="block arena-nav-link">Thesis</Link>
            <Link href="/insights" className="block arena-nav-link">Insights</Link>
            <Link href="/apply" className="block arena-nav-link">Apply</Link>
            <Link href="/invest" className="w-full arena-btn-nav">Invest With Us</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
