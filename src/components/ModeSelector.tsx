'use client';

import React from 'react';
import { Users, Shield } from 'lucide-react';
import { getMobileStyles } from '@/lib/mobile-utils';

export type InvestorMode = '506b' | '506c';

interface ModeSelectorProps {
  selectedMode: InvestorMode;
  onModeChange: (mode: InvestorMode) => void;
  className?: string;
}

export default function ModeSelector({ selectedMode, onModeChange, className = '' }: ModeSelectorProps) {
  const buttonStyles = getMobileStyles('button');

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-100" role="tablist" aria-label="Investment mode selection">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={() => onModeChange('506b')}
            className={`touch-target px-4 sm:px-6 py-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
              selectedMode === '506b'
                ? 'bg-arena-gold text-arena-navy shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 active:bg-gray-100'
            }`}
            aria-selected={selectedMode === '506b'}
            role="tab"
            tabIndex={selectedMode === '506b' ? 0 : -1}
            aria-controls="mode-content-506b"
            id="tab-506b"
            style={buttonStyles}
          >
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <Users className="w-4 h-4 flex-shrink-0" />
                <span className="font-semibold text-center sm:text-left">
                  <span className="block sm:inline">506(b) Private</span>
                  <span className="block sm:inline sm:ml-1">Offering</span>
                </span>
              </div>
              <div className="text-xs opacity-75">Expression of Interest</div>
            </div>
          </button>
          <button
            onClick={() => onModeChange('506c')}
            className={`touch-target px-4 sm:px-6 py-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
              selectedMode === '506c'
                ? 'bg-arena-gold text-arena-navy shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 active:bg-gray-100'
            }`}
            aria-selected={selectedMode === '506c'}
            role="tab"
            tabIndex={selectedMode === '506c' ? 0 : -1}
            aria-controls="mode-content-506c"
            id="tab-506c"
            style={buttonStyles}
          >
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-4 h-4 flex-shrink-0" />
                <span className="font-semibold text-center sm:text-left">
                  <span className="block sm:inline">506(c) Public</span>
                  <span className="block sm:inline sm:ml-1">Offering</span>
                </span>
              </div>
              <div className="text-xs opacity-75">Verification Required</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}