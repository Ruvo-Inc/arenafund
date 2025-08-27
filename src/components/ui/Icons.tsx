/**
 * Arena Fund Custom Icon Library
 * 
 * Custom SVG icons for B2B AI concepts including neural networks, validation,
 * enterprise workflows, and other business-specific iconography.
 * 
 * All icons are designed to be:
 * - Scalable and crisp at any size
 * - Consistent with Arena Fund's visual identity
 * - Accessible with proper ARIA labels
 * - Customizable with color and size props
 */

import React from 'react';
import { colors } from '../../styles/design-tokens';

// Base icon props interface
export interface IconProps {
  size?: number | string;
  color?: string;
  className?: string;
  'aria-label'?: string;
  'aria-hidden'?: boolean;
  role?: string;
}

// Default icon props
const defaultIconProps: Partial<IconProps> = {
  size: 24,
  color: colors.gray[600],
  'aria-hidden': true,
  role: 'img',
};

// Base Icon wrapper component
const IconBase: React.FC<IconProps & { children: React.ReactNode; viewBox?: string }> = ({
  size = 24,
  color = colors.gray[600],
  className = '',
  children,
  viewBox = '0 0 24 24',
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden = !ariaLabel,
  role = 'img',
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox={viewBox}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
    aria-label={ariaLabel}
    aria-hidden={ariaHidden}
    role={role}
    {...props}
  >
    {children}
  </svg>
);

// Neural Network Icons
export const NeuralNetworkIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
          <g stroke={props.color || colors.gray[600]} strokeWidth="1.5" fill="none">
        {/* Input layer */}
        <circle cx="4" cy="6" r="2" fill={props.color || colors.gray[600]} />
        <circle cx="4" cy="12" r="2" fill={props.color || colors.gray[600]} />
        <circle cx="4" cy="18" r="2" fill={props.color || colors.gray[600]} />
        
        {/* Hidden layer */}
        <circle cx="12" cy="4" r="2" fill={props.color || colors.gray[600]} />
        <circle cx="12" cy="8" r="2" fill={props.color || colors.gray[600]} />
        <circle cx="12" cy="12" r="2" fill={props.color || colors.gray[600]} />
        <circle cx="12" cy="16" r="2" fill={props.color || colors.gray[600]} />
        <circle cx="12" cy="20" r="2" fill={props.color || colors.gray[600]} />
        
        {/* Output layer */}
        <circle cx="20" cy="8" r="2" fill={props.color || colors.gray[600]} />
        <circle cx="20" cy="16" r="2" fill={props.color || colors.gray[600]} />
      
      {/* Connections */}
      <path d="M6 6L10 4M6 6L10 8M6 6L10 12M6 12L10 8M6 12L10 12M6 12L10 16M6 18L10 16M6 18L10 20" strokeOpacity="0.4" />
      <path d="M14 4L18 8M14 8L18 8M14 12L18 8M14 16L18 16M14 20L18 16" strokeOpacity="0.4" />
    </g>
  </IconBase>
);

export const AIProcessingIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <g stroke={props.color || colors.gray[600]} strokeWidth="1.5" fill="none">
      {/* Central processing unit */}
      <rect x="8" y="8" width="8" height="8" rx="2" fill={props.color || colors.gray[600]} fillOpacity="0.1" />
      
      {/* Data flow lines */}
      <path d="M2 12h6M16 12h6M12 2v6M12 16v6" />
      
      {/* Processing indicators */}
      <circle cx="10" cy="10" r="1" fill={props.color || colors.gray[600]} />
      <circle cx="14" cy="10" r="1" fill={props.color || colors.gray[600]} />
      <circle cx="10" cy="14" r="1" fill={props.color || colors.gray[600]} />
      <circle cx="14" cy="14" r="1" fill={props.color || colors.gray[600]} />
      
      {/* External connection points */}
      <circle cx="2" cy="12" r="1.5" />
      <circle cx="22" cy="12" r="1.5" />
      <circle cx="12" cy="2" r="1.5" />
      <circle cx="12" cy="22" r="1.5" />
    </g>
  </IconBase>
);

export const MachineLearningIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <g stroke={props.color || colors.gray[600]} strokeWidth="1.5" fill="none">
      {/* Learning curve */}
      <path d="M3 18c2-8 4-12 8-12s6 4 8 12" strokeWidth="2" />
      
      {/* Data points */}
      <circle cx="5" cy="16" r="1.5" fill={props.color || colors.gray[600]} />
      <circle cx="8" cy="12" r="1.5" fill={props.color || colors.gray[600]} />
      <circle cx="12" cy="8" r="1.5" fill={props.color || colors.gray[600]} />
      <circle cx="16" cy="10" r="1.5" fill={props.color || colors.gray[600]} />
      <circle cx="19" cy="14" r="1.5" fill={props.color || colors.gray[600]} />
      
      {/* Prediction line */}
      <path d="M19 14l3-2" strokeDasharray="2 2" strokeOpacity="0.6" />
      
      {/* Axes */}
      <path d="M3 21h18M3 21V3" strokeOpacity="0.3" />
    </g>
  </IconBase>
);

// Validation Icons
export const ValidationCheckIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <g stroke={props.color || colors.success[500]} strokeWidth="2" fill="none">
      {/* Shield shape */}
      <path d="M12 2l8 3v7c0 5-8 10-8 10s-8-5-8-10V5l8-3z" fill={colors.success[100]} />
      
      {/* Checkmark */}
      <path d="M8 12l2 2 4-4" stroke={props.color || colors.success[500]} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </IconBase>
);

export const DataValidationIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <g stroke={props.color || colors.gray[600]} strokeWidth="1.5" fill="none">
      {/* Data table */}
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18M3 14h18M9 6v12M15 6v12" strokeOpacity="0.5" />
      
      {/* Validation indicators */}
      <circle cx="6" cy="8" r="1" fill={colors.success[500]} />
      <circle cx="12" cy="8" r="1" fill={colors.success[500]} />
      <circle cx="18" cy="8" r="1" fill={colors.warning[500]} />
      
      <circle cx="6" cy="12" r="1" fill={colors.success[500]} />
      <circle cx="12" cy="12" r="1" fill={colors.error[500]} />
      <circle cx="18" cy="12" r="1" fill={colors.success[500]} />
      
      {/* Magnifying glass */}
      <circle cx="16" cy="4" r="2" />
      <path d="M18 6l2 2" strokeLinecap="round" />
    </g>
  </IconBase>
);

export const QualityAssuranceIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <g stroke={props.color || colors.gray[600]} strokeWidth="1.5" fill="none">
      {/* Quality badge */}
      <circle cx="12" cy="12" r="8" fill={colors.success[100]} />
      <circle cx="12" cy="12" r="6" stroke={colors.success[500]} strokeWidth="2" />
      
      {/* Star in center */}
      <path d="M12 7l1.5 3h3l-2.5 2 1 3-3-2-3 2 1-3-2.5-2h3L12 7z" fill={colors.success[500]} />
      
      {/* Quality indicators */}
      <circle cx="6" cy="6" r="1" fill={colors.success[500]} />
      <circle cx="18" cy="6" r="1" fill={colors.success[500]} />
      <circle cx="6" cy="18" r="1" fill={colors.success[500]} />
      <circle cx="18" cy="18" r="1" fill={colors.success[500]} />
    </g>
  </IconBase>
);

// Enterprise Workflow Icons
export const WorkflowIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <g stroke={props.color || colors.gray[600]} strokeWidth="1.5" fill="none">
      {/* Workflow steps */}
      <rect x="2" y="8" width="4" height="4" rx="1" fill={props.color || colors.gray[600]} fillOpacity="0.1" />
      <rect x="10" y="6" width="4" height="4" rx="1" fill={props.color || colors.gray[600]} fillOpacity="0.1" />
      <rect x="18" y="8" width="4" height="4" rx="1" fill={props.color || colors.gray[600]} fillOpacity="0.1" />
      <rect x="10" y="14" width="4" height="4" rx="1" fill={props.color || colors.gray[600]} fillOpacity="0.1" />
      
      {/* Flow arrows */}
      <path d="M6 10h4M14 8v6M14 10h4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 9l1 1-1 1M16 9l1 1-1 1M13 12l1 1-1 1" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </IconBase>
);

export const ProcessAutomationIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <g stroke={props.color || colors.gray[600]} strokeWidth="1.5" fill="none">
      {/* Gear mechanism */}
      <circle cx="12" cy="12" r="3" fill={props.color || colors.gray[600]} fillOpacity="0.1" />
      <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" strokeOpacity="0.6" />
      
      {/* Automation indicators */}
      <circle cx="12" cy="12" r="2" fill={props.color || colors.gray[600]} />
      <path d="M8 8l8 8M16 8l-8 8" strokeOpacity="0.3" />
      
      {/* Process flow */}
      <path d="M2 6h4l2 2h4l2-2h4l2 2h4" strokeOpacity="0.4" strokeDasharray="2 2" />
    </g>
  </IconBase>
);

export const EnterpriseIntegrationIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <g stroke={props.color || colors.gray[600]} strokeWidth="1.5" fill="none">
      {/* Central hub */}
      <circle cx="12" cy="12" r="4" fill={props.color || colors.gray[600]} fillOpacity="0.1" />
      
      {/* Connected systems */}
      <rect x="2" y="2" width="4" height="4" rx="1" />
      <rect x="18" y="2" width="4" height="4" rx="1" />
      <rect x="2" y="18" width="4" height="4" rx="1" />
      <rect x="18" y="18" width="4" height="4" rx="1" />
      
      {/* Integration lines */}
      <path d="M6 4l4 4M18 6l-4 4M6 20l4-4M18 18l-4-4" strokeOpacity="0.6" />
      <path d="M8 12h8M12 8v8" strokeOpacity="0.6" />
      
      {/* Data flow indicators */}
      <circle cx="9" cy="9" r="1" fill={colors.blue[500]} />
      <circle cx="15" cy="9" r="1" fill={colors.blue[500]} />
      <circle cx="9" cy="15" r="1" fill={colors.blue[500]} />
      <circle cx="15" cy="15" r="1" fill={colors.blue[500]} />
    </g>
  </IconBase>
);

// Business Intelligence Icons
export const AnalyticsIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <g stroke={props.color || colors.gray[600]} strokeWidth="1.5" fill="none">
      {/* Chart bars */}
      <rect x="3" y="16" width="3" height="5" fill={props.color || colors.gray[600]} fillOpacity="0.2" />
      <rect x="7" y="12" width="3" height="9" fill={props.color || colors.gray[600]} fillOpacity="0.4" />
      <rect x="11" y="8" width="3" height="13" fill={props.color || colors.gray[600]} fillOpacity="0.6" />
      <rect x="15" y="14" width="3" height="7" fill={props.color || colors.gray[600]} fillOpacity="0.3" />
      <rect x="19" y="10" width="3" height="11" fill={props.color || colors.gray[600]} fillOpacity="0.5" />
      
      {/* Trend line */}
      <path d="M4.5 17l4-4 4-4 4 2 4-2" stroke={colors.success[500]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Axes */}
      <path d="M2 22h20M2 22V2" strokeOpacity="0.3" />
    </g>
  </IconBase>
);

export const InsightsIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <g stroke={props.color || colors.gray[600]} strokeWidth="1.5" fill="none">
      {/* Light bulb */}
      <path d="M9 21h6M12 3a6 6 0 0 1 6 6c0 2-1 3.5-3 4.5V17a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-3.5C7 12.5 6 11 6 9a6 6 0 0 1 6-6z" fill={props.color || colors.gray[600]} fillOpacity="0.1" />
      
      {/* Insight rays */}
      <path d="M12 1v2M21 9h-2M5 9H3M18.36 5.64l-1.42 1.42M6.64 5.64l1.42 1.42" strokeLinecap="round" />
      
      {/* Data points */}
      <circle cx="8" cy="10" r="1" fill={colors.blue[500]} />
      <circle cx="12" cy="8" r="1" fill={colors.success[500]} />
      <circle cx="16" cy="11" r="1" fill={colors.warning[500]} />
    </g>
  </IconBase>
);

export const MetricsIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <g stroke={props.color || colors.gray[600]} strokeWidth="1.5" fill="none">
      {/* Dashboard */}
      <rect x="3" y="3" width="18" height="18" rx="2" fill={props.color || colors.gray[600]} fillOpacity="0.05" />
      
      {/* Metric cards */}
      <rect x="5" y="5" width="6" height="4" rx="1" fill={colors.success[100]} />
      <rect x="13" y="5" width="6" height="4" rx="1" fill={colors.blue[100]} />
      <rect x="5" y="11" width="6" height="4" rx="1" fill={colors.warning[100]} />
      <rect x="13" y="11" width="6" height="4" rx="1" fill={colors.error[100]} />
      
      {/* Mini charts */}
      <path d="M6 8l2-1 2 1" stroke={colors.success[500]} strokeWidth="1" strokeLinecap="round" />
      <path d="M14 8l2 1 2-1" stroke={colors.blue[500]} strokeWidth="1" strokeLinecap="round" />
      <path d="M6 14l2-1 2 1" stroke={colors.warning[500]} strokeWidth="1" strokeLinecap="round" />
      <path d="M14 14l2 1 2-1" stroke={colors.error[500]} strokeWidth="1" strokeLinecap="round" />
      
      {/* Bottom summary */}
      <rect x="5" y="17" width="14" height="2" rx="1" fill={props.color || colors.gray[600]} fillOpacity="0.1" />
    </g>
  </IconBase>
);

// Investment and Finance Icons
export const InvestmentIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <g stroke={props.color || colors.gray[600]} strokeWidth="1.5" fill="none">
      {/* Growth chart */}
      <path d="M3 17l6-6 4 4 8-8" stroke={colors.success[500]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Arrow indicator */}
      <path d="M17 5h4v4" stroke={colors.success[500]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Investment markers */}
      <circle cx="3" cy="17" r="2" fill={colors.success[500]} />
      <circle cx="9" cy="11" r="2" fill={colors.success[500]} />
      <circle cx="13" cy="15" r="2" fill={colors.success[500]} />
      <circle cx="21" cy="7" r="2" fill={colors.success[500]} />
      
      {/* Dollar signs */}
      <text x="3" y="17" textAnchor="middle" dominantBaseline="central" fontSize="8" fill="white" fontWeight="bold">$</text>
      <text x="9" y="11" textAnchor="middle" dominantBaseline="central" fontSize="8" fill="white" fontWeight="bold">$</text>
      <text x="13" y="15" textAnchor="middle" dominantBaseline="central" fontSize="8" fill="white" fontWeight="bold">$</text>
      <text x="21" y="7" textAnchor="middle" dominantBaseline="central" fontSize="8" fill="white" fontWeight="bold">$</text>
    </g>
  </IconBase>
);

export const PortfolioIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <g stroke={props.color || colors.gray[600]} strokeWidth="1.5" fill="none">
      {/* Briefcase */}
      <rect x="4" y="8" width="16" height="12" rx="2" fill={props.color || colors.gray[600]} fillOpacity="0.1" />
      <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M4 14h16" strokeOpacity="0.5" />
      
      {/* Portfolio segments */}
      <rect x="6" y="10" width="2" height="2" fill={colors.success[500]} />
      <rect x="9" y="10" width="2" height="2" fill={colors.blue[500]} />
      <rect x="12" y="10" width="2" height="2" fill={colors.warning[500]} />
      <rect x="15" y="10" width="2" height="2" fill={colors.error[500]} />
      
      <rect x="6" y="16" width="2" height="2" fill={colors.success[500]} />
      <rect x="9" y="16" width="2" height="2" fill={colors.blue[500]} />
      <rect x="12" y="16" width="2" height="2" fill={colors.warning[500]} />
      <rect x="15" y="16" width="2" height="2" fill={colors.error[500]} />
    </g>
  </IconBase>
);

export const ROIIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <g stroke={props.color || colors.gray[600]} strokeWidth="1.5" fill="none">
      {/* Circular progress */}
      <circle cx="12" cy="12" r="8" strokeOpacity="0.2" />
      <circle 
        cx="12" 
        cy="12" 
        r="8" 
        stroke={colors.success[500]} 
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="31.4 31.4"
        strokeDashoffset="7.85"
        transform="rotate(-90 12 12)"
      />
      
      {/* Percentage in center */}
      <text x="12" y="12" textAnchor="middle" dominantBaseline="central" fontSize="10" fill={props.color || colors.gray[600]} fontWeight="bold">ROI</text>
      
      {/* Arrow indicator */}
      <path d="M16 8l2-2 2 2" stroke={colors.success[500]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 6v6" stroke={colors.success[500]} strokeWidth="2" strokeLinecap="round" />
    </g>
  </IconBase>
);

// Security and Compliance Icons
export const SecurityIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <g stroke={props.color || colors.gray[600]} strokeWidth="1.5" fill="none">
      {/* Shield */}
      <path d="M12 2l8 3v7c0 5-8 10-8 10s-8-5-8-10V5l8-3z" fill={props.color || colors.gray[600]} fillOpacity="0.1" />
      
      {/* Lock */}
      <rect x="9" y="11" width="6" height="5" rx="1" fill={props.color || colors.gray[600]} fillOpacity="0.2" />
      <path d="M10 11V9a2 2 0 1 1 4 0v2" />
      
      {/* Security indicators */}
      <circle cx="8" cy="8" r="1" fill={colors.success[500]} />
      <circle cx="16" cy="8" r="1" fill={colors.success[500]} />
      <circle cx="12" cy="6" r="1" fill={colors.success[500]} />
    </g>
  </IconBase>
);

export const ComplianceIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <g stroke={props.color || colors.gray[600]} strokeWidth="1.5" fill="none">
      {/* Document */}
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill={props.color || colors.gray[600]} fillOpacity="0.05" />
      <path d="M14 2v6h6" />
      
      {/* Compliance checkmarks */}
      <path d="M7 12l2 2 4-4" stroke={colors.success[500]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 16l2 2 4-4" stroke={colors.success[500]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Seal */}
      <circle cx="17" cy="17" r="3" fill={colors.success[100]} stroke={colors.success[500]} strokeWidth="2" />
      <path d="M16 17l1 1 2-2" stroke={colors.success[500]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </IconBase>
);

export const AuditIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <g stroke={props.color || colors.gray[600]} strokeWidth="1.5" fill="none">
      {/* Magnifying glass over document */}
      <rect x="3" y="4" width="12" height="16" rx="2" fill={props.color || colors.gray[600]} fillOpacity="0.05" />
      <path d="M7 8h6M7 12h6M7 16h4" strokeOpacity="0.5" />
      
      {/* Magnifying glass */}
      <circle cx="17" cy="11" r="4" />
      <path d="M20 14l2 2" strokeLinecap="round" />
      
      {/* Audit findings */}
      <circle cx="5" cy="10" r="1" fill={colors.warning[500]} />
      <circle cx="5" cy="14" r="1" fill={colors.success[500]} />
      <circle cx="5" cy="18" r="1" fill={colors.error[500]} />
    </g>
  </IconBase>
);

// Communication and Collaboration Icons
export const CollaborationIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <g stroke={props.color || colors.gray[600]} strokeWidth="1.5" fill="none">
      {/* People */}
      <circle cx="8" cy="7" r="3" fill={props.color || colors.gray[600]} fillOpacity="0.1" />
      <circle cx="16" cy="7" r="3" fill={props.color || colors.gray[600]} fillOpacity="0.1" />
      <path d="M2 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      <path d="M14 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      
      {/* Connection lines */}
      <path d="M11 7h2" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 17h8" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5" />
      
      {/* Collaboration indicators */}
      <circle cx="12" cy="12" r="2" fill={colors.blue[500]} />
    </g>
  </IconBase>
);

export const CommunicationIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <g stroke={props.color || colors.gray[600]} strokeWidth="1.5" fill="none">
      {/* Speech bubbles */}
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill={props.color || colors.gray[600]} fillOpacity="0.05" />
      <path d="M13 8H7M13 12H7" strokeOpacity="0.6" />
      
      {/* Response bubble */}
      <path d="M17 8a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2l-2 2v-4a2 2 0 0 1 2-2h2z" fill={colors.blue[100]} stroke={colors.blue[500]} />
      
      {/* Communication indicators */}
      <circle cx="9" cy="6" r="1" fill={colors.success[500]} />
      <circle cx="15" cy="6" r="1" fill={colors.blue[500]} />
    </g>
  </IconBase>
);

export const FeedbackIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <g stroke={props.color || colors.gray[600]} strokeWidth="1.5" fill="none">
      {/* Feedback loop */}
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" strokeWidth="2" />
      <path d="M3 3v5h5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Rating stars */}
      <path d="M12 8l1 2h2l-1.5 1.5L14 14l-2-1-2 1 .5-2.5L9 10h2l1-2z" fill={colors.warning[500]} />
      
      {/* Feedback indicators */}
      <circle cx="18" cy="6" r="1" fill={colors.success[500]} />
      <circle cx="18" cy="18" r="1" fill={colors.blue[500]} />
    </g>
  </IconBase>
);

// Status and Progress Icons
export const ProgressIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <g stroke={props.color || colors.gray[600]} strokeWidth="1.5" fill="none">
      {/* Progress bar background */}
      <rect x="3" y="10" width="18" height="4" rx="2" fill={props.color || colors.gray[600]} fillOpacity="0.1" />
      
      {/* Progress fill */}
      <rect x="3" y="10" width="12" height="4" rx="2" fill={colors.success[500]} />
      
      {/* Progress indicators */}
      <circle cx="6" cy="12" r="1" fill="white" />
      <circle cx="9" cy="12" r="1" fill="white" />
      <circle cx="12" cy="12" r="1" fill="white" />
      <circle cx="15" cy="12" r="1" fill={colors.gray[400]} />
      <circle cx="18" cy="12" r="1" fill={colors.gray[400]} />
      
      {/* Percentage */}
      <text x="12" y="8" textAnchor="middle" fontSize="10" fill={props.color || colors.gray[600]} fontWeight="bold">67%</text>
    </g>
  </IconBase>
);

export const StatusIcon: React.FC<IconProps & { status?: 'success' | 'warning' | 'error' | 'info' | 'pending' }> = ({ status = 'info', ...props }) => {
  const statusColors = {
    success: colors.success[500],
    warning: colors.warning[500],
    error: colors.error[500],
    info: colors.blue[500],
    pending: colors.gray[400],
  };

  const statusColor = statusColors[status];

  return (
    <IconBase {...props}>
      <g stroke={statusColor} strokeWidth="2" fill="none">
        <circle cx="12" cy="12" r="8" fill={statusColor} fillOpacity="0.1" />
        {status === 'success' && <path d="M8 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />}
        {status === 'warning' && (
          <>
            <path d="M12 8v4" strokeLinecap="round" />
            <circle cx="12" cy="16" r="1" fill={statusColor} />
          </>
        )}
        {status === 'error' && <path d="M8 8l8 8M16 8l-8 8" strokeLinecap="round" />}
        {status === 'info' && (
          <>
            <circle cx="12" cy="8" r="1" fill={statusColor} />
            <path d="M12 12v4" strokeLinecap="round" />
          </>
        )}
        {status === 'pending' && (
          <>
            <circle cx="12" cy="12" r="2" fill={statusColor} />
            <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
      </g>
    </IconBase>
  );
};

// Export all icons as a collection
export const ArenaFundIcons = {
  // Neural Network & AI
  NeuralNetworkIcon,
  AIProcessingIcon,
  MachineLearningIcon,
  
  // Validation
  ValidationCheckIcon,
  DataValidationIcon,
  QualityAssuranceIcon,
  
  // Enterprise Workflow
  WorkflowIcon,
  ProcessAutomationIcon,
  EnterpriseIntegrationIcon,
  
  // Business Intelligence
  AnalyticsIcon,
  InsightsIcon,
  MetricsIcon,
  
  // Investment & Finance
  InvestmentIcon,
  PortfolioIcon,
  ROIIcon,
  
  // Security & Compliance
  SecurityIcon,
  ComplianceIcon,
  AuditIcon,
  
  // Communication & Collaboration
  CollaborationIcon,
  CommunicationIcon,
  FeedbackIcon,
  
  // Status & Progress
  ProgressIcon,
  StatusIcon,
};

export default ArenaFundIcons;