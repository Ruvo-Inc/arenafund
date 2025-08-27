'use client';

import { useEffect } from 'react';
import { initPerformanceOptimizations } from '@/lib/performance-utils';
import { recordWebVitals } from '@/lib/performance-monitoring';

/**
 * Web Vitals monitoring component that should be included in the root layout
 */
export function WebVitalsMonitor() {
  useEffect(() => {
    // Initialize performance monitoring and optimizations
    initPerformanceOptimizations();

    // Set up Web Vitals reporting
    if (typeof window !== 'undefined') {
      import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
        onCLS(recordWebVitals);
        onINP(recordWebVitals);
        onFCP(recordWebVitals);
        onLCP(recordWebVitals);
        onTTFB(recordWebVitals);
      });
    }
  }, []);

  // This component doesn't render anything visible
  return null;
}

/**
 * Development-only performance dashboard component
 */
export function PerformanceDashboard() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    // Create a simple performance dashboard in development
    const dashboard = document.createElement('div');
    dashboard.id = 'performance-dashboard';
    dashboard.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px;
      border-radius: 5px;
      font-family: monospace;
      font-size: 12px;
      z-index: 10000;
      max-width: 300px;
      display: none;
    `;

    // Toggle dashboard with Ctrl+Shift+P
    const toggleDashboard = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        dashboard.style.display = dashboard.style.display === 'none' ? 'block' : 'none';
        if (dashboard.style.display === 'block') {
          updateDashboard();
        }
      }
    };

    const updateDashboard = async () => {
      try {
        const response = await fetch('/api/analytics/performance');
        const data = await response.json();
        
        dashboard.innerHTML = `
          <h4>Performance Dashboard</h4>
          <p><strong>Total Reports:</strong> ${data.summary.totalReports}</p>
          <div>
            <strong>Average Metrics:</strong>
            ${Object.entries(data.summary.averageMetrics || {}).map(([name, value]) => 
              `<div>${name}: ${typeof value === 'number' ? value.toFixed(2) : value}ms</div>`
            ).join('')}
          </div>
          <div style="margin-top: 10px; font-size: 10px; opacity: 0.7;">
            Press Ctrl+Shift+P to toggle
          </div>
        `;
      } catch (error) {
        dashboard.innerHTML = `
          <h4>Performance Dashboard</h4>
          <p>Error loading data: ${error}</p>
          <div style="margin-top: 10px; font-size: 10px; opacity: 0.7;">
            Press Ctrl+Shift+P to toggle
          </div>
        `;
      }
    };

    document.addEventListener('keydown', toggleDashboard);
    document.body.appendChild(dashboard);

    return () => {
      document.removeEventListener('keydown', toggleDashboard);
      if (dashboard.parentNode) {
        dashboard.parentNode.removeChild(dashboard);
      }
    };
  }, []);

  return null;
}