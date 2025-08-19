'use client';

import { useState, useEffect } from 'react';
import StatusIndicator from './StatusIndicator';
import ProgressBar from './ProgressBar';
import ProgressSteps from './ProgressSteps';
import ProgressCircle from './ProgressCircle';
import LoadingSpinner from './LoadingSpinner';

const StatusProgressShowcase = () => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);

  // Animate progress for demo
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev >= 100 ? 0 : prev + 1));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Sample steps for progress demonstration
  const sampleSteps = [
    {
      id: '1',
      title: 'Application Submitted',
      description: 'Your application has been received and is being reviewed',
      status: 'completed' as const,
    },
    {
      id: '2',
      title: 'Initial Review',
      description: 'Our team is conducting the initial assessment',
      status: currentStep >= 2 ? ('completed' as const) : ('current' as const),
    },
    {
      id: '3',
      title: 'Due Diligence',
      description: 'Detailed analysis and verification process',
      status: currentStep >= 3 ? ('completed' as const) : currentStep === 2 ? ('current' as const) : ('upcoming' as const),
    },
    {
      id: '4',
      title: 'Final Decision',
      description: 'Investment committee review and decision',
      status: currentStep >= 4 ? ('completed' as const) : currentStep === 3 ? ('current' as const) : ('upcoming' as const),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Status Indicators & Progress Elements
        </h1>
        <p className="text-lg text-gray-600">
          Comprehensive visual language for status communication and progress tracking
        </p>
      </div>

      {/* Status Indicators Section */}
      <section className="space-y-8">
        <h2 className="text-2xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Status Indicators
        </h2>

        {/* Dot Variants */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800">Dot Indicators</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {(['success', 'warning', 'error', 'info', 'pending', 'inactive'] as const).map(status => (
              <div key={status} className="flex flex-col items-center space-y-2">
                <StatusIndicator status={status} variant="dot" size="md" />
                <span className="text-sm text-gray-600 capitalize">{status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Badge Variants */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800">Badge Indicators</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {(['success', 'warning', 'error', 'info', 'pending', 'inactive'] as const).map(status => (
              <div key={status} className="flex flex-col items-center space-y-2">
                <StatusIndicator status={status} variant="badge" size="md" />
                <span className="text-sm text-gray-600 capitalize">{status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pill Variants */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800">Pill Indicators</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {(['success', 'warning', 'error', 'info', 'pending', 'inactive'] as const).map(status => (
              <div key={status} className="flex flex-col items-center space-y-2">
                <StatusIndicator status={status} variant="pill" size="md" />
                <span className="text-sm text-gray-600 capitalize">{status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Icon Variants */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800">Icon Indicators</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {(['success', 'warning', 'error', 'info', 'pending', 'inactive'] as const).map(status => (
              <div key={status} className="flex flex-col items-center space-y-2">
                <StatusIndicator status={status} variant="icon" size="md" />
                <span className="text-sm text-gray-600 capitalize">{status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* With Labels */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800">With Labels</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatusIndicator status="success" variant="dot" size="md" showLabel label="Approved" />
            <StatusIndicator status="warning" variant="dot" size="md" showLabel label="Under Review" />
            <StatusIndicator status="error" variant="dot" size="md" showLabel label="Rejected" />
            <StatusIndicator status="info" variant="dot" size="md" showLabel label="Information" />
            <StatusIndicator status="pending" variant="dot" size="md" showLabel label="Processing" pulse />
            <StatusIndicator status="inactive" variant="dot" size="md" showLabel label="Inactive" />
          </div>
        </div>

        {/* Size Variations */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800">Size Variations</h3>
          <div className="flex items-center space-x-8">
            <div className="flex flex-col items-center space-y-2">
              <StatusIndicator status="success" variant="icon" size="sm" />
              <span className="text-xs text-gray-600">Small</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <StatusIndicator status="success" variant="icon" size="md" />
              <span className="text-sm text-gray-600">Medium</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <StatusIndicator status="success" variant="icon" size="lg" />
              <span className="text-base text-gray-600">Large</span>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Bars Section */}
      <section className="space-y-8">
        <h2 className="text-2xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Progress Bars
        </h2>

        {/* Basic Progress Bars */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-800">Basic Progress Bars</h3>
          <div className="space-y-4">
            <ProgressBar value={progress} variant="default" showLabel label="Default Progress" showPercentage />
            <ProgressBar value={75} variant="success" showLabel label="Success Progress" showPercentage />
            <ProgressBar value={45} variant="warning" showLabel label="Warning Progress" showPercentage />
            <ProgressBar value={25} variant="error" showLabel label="Error Progress" showPercentage />
            <ProgressBar value={60} variant="info" showLabel label="Info Progress" showPercentage />
          </div>
        </div>

        {/* Size Variations */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-800">Size Variations</h3>
          <div className="space-y-4">
            <ProgressBar value={70} size="sm" showLabel label="Small Progress Bar" showPercentage />
            <ProgressBar value={70} size="md" showLabel label="Medium Progress Bar" showPercentage />
            <ProgressBar value={70} size="lg" showLabel label="Large Progress Bar" showPercentage />
          </div>
        </div>

        {/* Animated and Striped */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-800">Animated & Striped</h3>
          <div className="space-y-4">
            <ProgressBar value={progress} animated showLabel label="Animated Progress" showPercentage />
            <ProgressBar value={65} striped showLabel label="Striped Progress" showPercentage />
            <ProgressBar value={progress} striped animated showLabel label="Animated Striped" showPercentage />
          </div>
        </div>
      </section>

      {/* Progress Circles Section */}
      <section className="space-y-8">
        <h2 className="text-2xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Progress Circles
        </h2>

        {/* Basic Circles */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-800">Basic Circles</h3>
          <div className="flex flex-wrap items-center gap-8">
            <ProgressCircle value={progress} variant="default" showLabel label="Default" />
            <ProgressCircle value={85} variant="success" showLabel label="Success" />
            <ProgressCircle value={45} variant="warning" showLabel label="Warning" />
            <ProgressCircle value={25} variant="error" showLabel label="Error" />
            <ProgressCircle value={60} variant="info" showLabel label="Info" />
          </div>
        </div>

        {/* Size Variations */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-800">Size Variations</h3>
          <div className="flex items-center gap-8">
            <ProgressCircle value={75} size="sm" showLabel label="Small" />
            <ProgressCircle value={75} size="md" showLabel label="Medium" />
            <ProgressCircle value={75} size="lg" showLabel label="Large" />
            <ProgressCircle value={75} size="xl" showLabel label="Extra Large" />
          </div>
        </div>
      </section>

      {/* Progress Steps Section */}
      <section className="space-y-8">
        <h2 className="text-2xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Progress Steps
        </h2>

        {/* Horizontal Steps */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-800">Horizontal Steps</h3>
          <div className="space-y-8">
            <ProgressSteps steps={sampleSteps} orientation="horizontal" variant="default" />
            <ProgressSteps steps={sampleSteps} orientation="horizontal" variant="detailed" />
            <ProgressSteps steps={sampleSteps} orientation="horizontal" variant="minimal" />
          </div>
        </div>

        {/* Vertical Steps */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-800">Vertical Steps</h3>
          <div className="max-w-md">
            <ProgressSteps steps={sampleSteps} orientation="vertical" variant="detailed" />
          </div>
        </div>

        {/* Interactive Controls */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800">Interactive Demo</h3>
          <div className="flex space-x-4">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              disabled={currentStep === 1}
            >
              Previous Step
            </button>
            <button
              onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
              className="px-4 py-2 bg-navy-600 text-white rounded-md hover:bg-navy-700 transition-colors"
              disabled={currentStep === 4}
            >
              Next Step
            </button>
          </div>
        </div>
      </section>

      {/* Loading Spinners Section */}
      <section className="space-y-8">
        <h2 className="text-2xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Loading Spinners
        </h2>

        {/* Basic Spinners */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-800">Basic Spinners</h3>
          <div className="flex items-center space-x-8">
            <LoadingSpinner variant="default" showLabel label="Loading..." />
            <LoadingSpinner variant="primary" showLabel label="Processing..." />
            <LoadingSpinner variant="secondary" showLabel label="Please wait..." />
          </div>
        </div>

        {/* Size Variations */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-800">Size Variations</h3>
          <div className="flex items-center space-x-8">
            <LoadingSpinner size="xs" showLabel label="Extra Small" />
            <LoadingSpinner size="sm" showLabel label="Small" />
            <LoadingSpinner size="md" showLabel label="Medium" />
            <LoadingSpinner size="lg" showLabel label="Large" />
            <LoadingSpinner size="xl" showLabel label="Extra Large" />
          </div>
        </div>

        {/* Speed Variations */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-800">Speed Variations</h3>
          <div className="flex items-center space-x-8">
            <LoadingSpinner speed="slow" showLabel label="Slow" />
            <LoadingSpinner speed="normal" showLabel label="Normal" />
            <LoadingSpinner speed="fast" showLabel label="Fast" />
          </div>
        </div>
      </section>

      {/* Real-world Examples */}
      <section className="space-y-8">
        <h2 className="text-2xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Real-world Examples
        </h2>

        {/* Application Status Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Application Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Profile Completion</span>
              <StatusIndicator status="success" variant="pill" size="sm" />
            </div>
            <ProgressBar value={85} variant="success" showPercentage />
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Document Verification</span>
              <StatusIndicator status="pending" variant="pill" size="sm" pulse />
            </div>
            <ProgressBar value={60} variant="info" showPercentage />
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Background Check</span>
              <StatusIndicator status="inactive" variant="pill" size="sm" />
            </div>
            <ProgressBar value={0} variant="default" showPercentage />
          </div>
        </div>

        {/* Investment Process Timeline */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Investment Process</h3>
          <ProgressSteps 
            steps={sampleSteps} 
            orientation="vertical" 
            variant="detailed" 
            size="md"
          />
        </div>

        {/* Dashboard Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm text-center">
            <ProgressCircle value={92} variant="success" size="lg" showLabel label="Portfolio Performance" />
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm text-center">
            <ProgressCircle value={78} variant="info" size="lg" showLabel label="Due Diligence" />
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm text-center">
            <ProgressCircle value={45} variant="warning" size="lg" showLabel label="Risk Assessment" />
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm text-center">
            <ProgressCircle value={progress} variant="default" size="lg" showLabel label="Market Analysis" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default StatusProgressShowcase;