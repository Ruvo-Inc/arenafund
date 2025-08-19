/**
 * Arena Fund Design Tokens - TypeScript/JavaScript Export
 * 
 * This file exports design tokens as JavaScript objects for use in components
 * where CSS custom properties are not accessible (e.g., JavaScript animations,
 * dynamic styling, or third-party libraries).
 */

// Color System
export const colors = {
  // Primary Brand Colors
  navy: {
    deep: '#1e3a8a',
    light: '#3b82f6',
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  gray: {
    warm: '#6b7280',
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  accent: {
    blue: '#3b82f6',
  },
  
  success: {
    DEFAULT: '#10b981',
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  
  warning: {
    DEFAULT: '#f59e0b',
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  // Base Colors
  white: '#ffffff',
  black: '#000000',
  
  // Semantic Color Assignments
  semantic: {
    // Interactive States
    primary: '#1e3a8a',
    primaryHover: '#1e40af',
    primaryActive: '#1e3a8a',
    primaryForeground: '#ffffff',
    
    secondary: '#f3f4f6',
    secondaryHover: '#e5e7eb',
    secondaryActive: '#d1d5db',
    secondaryForeground: '#111827',
    
    // Status Colors
    success: '#10b981',
    successHover: '#059669',
    successActive: '#047857',
    successForeground: '#ffffff',
    successBackground: '#ecfdf5',
    successBorder: '#a7f3d0',
    
    warning: '#f59e0b',
    warningHover: '#d97706',
    warningActive: '#b45309',
    warningForeground: '#ffffff',
    warningBackground: '#fffbeb',
    warningBorder: '#fde68a',
    
    error: '#ef4444',
    errorHover: '#dc2626',
    errorActive: '#b91c1c',
    errorForeground: '#ffffff',
    errorBackground: '#fef2f2',
    errorBorder: '#fecaca',
    
    info: '#3b82f6',
    infoHover: '#2563eb',
    infoActive: '#1d4ed8',
    infoForeground: '#ffffff',
    infoBackground: '#eff6ff',
    infoBorder: '#bfdbfe',
    
    // Content Hierarchy
    textPrimary: '#111827',
    textSecondary: '#374151',
    textTertiary: '#6b7280',
    textDisabled: '#9ca3af',
    textInverse: '#ffffff',
    textLink: '#2563eb',
    textLinkHover: '#1d4ed8',
    textLinkVisited: '#1e40af',
    
    // Surfaces and Containers
    surface: '#ffffff',
    surfaceElevated: '#ffffff',
    surfaceMuted: '#f9fafb',
    surfaceSubtle: '#f3f4f6',
    surfaceDisabled: '#f3f4f6',
    surfaceInverse: '#111827',
    
    // Borders and Dividers
    borderDefault: '#e5e7eb',
    borderMuted: '#f3f4f6',
    borderSubtle: '#f9fafb',
    borderStrong: '#d1d5db',
    borderInverse: '#374151',
    borderFocus: '#3b82f6',
    borderError: '#fca5a5',
    borderWarning: '#fcd34d',
    borderSuccess: '#6ee7b7',
    
    // Form and Input States
    inputBackground: '#ffffff',
    inputBorder: '#d1d5db',
    inputBorderHover: '#9ca3af',
    inputBorderFocus: '#3b82f6',
    inputBorderError: '#ef4444',
    inputText: '#111827',
    inputPlaceholder: '#9ca3af',
    inputDisabledBackground: '#f9fafb',
    inputDisabledBorder: '#e5e7eb',
    inputDisabledText: '#9ca3af',
    
    // Button Variants
    buttonPrimary: '#1e3a8a',
    buttonPrimaryHover: '#1e40af',
    buttonPrimaryActive: '#1e3a8a',
    buttonPrimaryText: '#ffffff',
    buttonPrimaryDisabled: '#d1d5db',
    buttonPrimaryDisabledText: '#6b7280',
    
    buttonSecondary: '#ffffff',
    buttonSecondaryHover: '#f9fafb',
    buttonSecondaryActive: '#f3f4f6',
    buttonSecondaryText: '#111827',
    buttonSecondaryBorder: '#d1d5db',
    buttonSecondaryBorderHover: '#9ca3af',
    
    buttonGhost: 'transparent',
    buttonGhostHover: '#f3f4f6',
    buttonGhostActive: '#e5e7eb',
    buttonGhostText: '#374151',
    buttonGhostTextHover: '#111827',
    
    buttonDestructive: '#ef4444',
    buttonDestructiveHover: '#dc2626',
    buttonDestructiveActive: '#b91c1c',
    buttonDestructiveText: '#ffffff',
    
    // Navigation and Menu
    navBackground: '#ffffff',
    navBorder: '#e5e7eb',
    navText: '#374151',
    navTextHover: '#111827',
    navTextActive: '#2563eb',
    navIndicator: '#3b82f6',
    
    // Cards and Panels
    cardBackground: '#ffffff',
    cardBorder: '#e5e7eb',
    cardShadow: 'rgb(0 0 0 / 0.1)',
    cardHoverShadow: 'rgb(0 0 0 / 0.15)',
    
    // Overlays and Modals
    overlay: 'rgb(0 0 0 / 0.5)',
    modalBackground: '#ffffff',
    modalBorder: '#e5e7eb',
    backdrop: 'rgb(0 0 0 / 0.8)',
    
    // Progress and Loading
    progressBackground: '#e5e7eb',
    progressFill: '#3b82f6',
    progressSuccess: '#10b981',
    progressWarning: '#f59e0b',
    progressError: '#ef4444',
    
    // Badges and Tags
    badgeDefault: '#f3f4f6',
    badgeDefaultText: '#1f2937',
    badgePrimary: '#dbeafe',
    badgePrimaryText: '#1e40af',
    badgeSuccess: '#d1fae5',
    badgeSuccessText: '#065f46',
    badgeWarning: '#fef3c7',
    badgeWarningText: '#92400e',
    badgeError: '#fee2e2',
    badgeErrorText: '#991b1b',
    
    // Code and Syntax
    codeBackground: '#f3f4f6',
    codeText: '#1f2937',
    codeBorder: '#e5e7eb',
    syntaxKeyword: '#2563eb',
    syntaxString: '#059669',
    syntaxNumber: '#d97706',
    syntaxComment: '#6b7280',
    
    // Focus and Selection
    focusRing: '#3b82f6',
    focusRingOffset: '#ffffff',
    selectionBackground: '#dbeafe',
    selectionText: '#1e3a8a',
    
    // Accessibility and High Contrast
    highContrastText: '#000000',
    highContrastBackground: '#ffffff',
    highContrastBorder: '#000000',
    skipLink: '#2563eb',
    skipLinkBackground: '#ffffff',
  },
} as const;

// Typography System
export const typography = {
  fontFamily: {
    primary: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    display: ['Outfit', 'system-ui', '-apple-system', 'sans-serif'],
    mono: ['JetBrains Mono', 'SF Mono', 'Monaco', 'Inconsolata', 'monospace'],
  },
  
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
    '7xl': '4.5rem',    // 72px
    '8xl': '6rem',      // 96px
    '9xl': '8rem',      // 128px
  },
  
  // Responsive typography scale (mobile-first)
  responsiveFontSize: {
    xs: 'var(--text-xs)',
    sm: 'var(--text-sm)',
    base: 'var(--text-base)',
    lg: 'var(--text-lg)',
    xl: 'var(--text-xl)',
    '2xl': 'var(--text-2xl)',
    '3xl': 'var(--text-3xl)',
    '4xl': 'var(--text-4xl)',
    '5xl': 'var(--text-5xl)',
    '6xl': 'var(--text-6xl)',
  },
  
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// Spacing System (4px base unit)
export const spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
  36: '9rem',       // 144px
  40: '10rem',      // 160px
  44: '11rem',      // 176px
  48: '12rem',      // 192px
  52: '13rem',      // 208px
  56: '14rem',      // 224px
  60: '15rem',      // 240px
  64: '16rem',      // 256px
  72: '18rem',      // 288px
  80: '20rem',      // 320px
  96: '24rem',      // 384px
} as const;

// Border Radius System
export const borderRadius = {
  none: '0',
  sm: '0.125rem',     // 2px
  base: '0.25rem',    // 4px
  md: '0.375rem',     // 6px
  lg: '0.5rem',       // 8px
  xl: '0.75rem',      // 12px
  '2xl': '1rem',      // 16px
  '3xl': '1.5rem',    // 24px
  full: '9999px',
} as const;

// Shadow System
export const boxShadow = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: '0 0 #0000',
} as const;

// Animation System
export const animation = {
  duration: {
    75: 75,
    100: 100,
    150: 150,
    200: 200,    // Micro interactions
    300: 300,    // Standard transitions
    500: 500,    // Complex animations
    700: 700,
    1000: 1000,
  },
  
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)',  // Primary easing
    emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  // Preset transitions
  transition: {
    fast: '150ms cubic-bezier(0, 0, 0.2, 1)',
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    complex: '500ms cubic-bezier(0.2, 0, 0, 1)',
  },
} as const;

// Z-Index System
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// Breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Container Max Widths
export const containers = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  content: '1200px', // Arena Fund specific content width
} as const;

// Export all tokens as a single object
export const designTokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  boxShadow,
  animation,
  zIndex,
  breakpoints,
  containers,
} as const;

// Type definitions for better TypeScript support
export type ColorToken = keyof typeof colors;
export type SpacingToken = keyof typeof spacing;
export type FontSizeToken = keyof typeof typography.fontSize;
export type ResponsiveFontSizeToken = keyof typeof typography.responsiveFontSize;
export type FontWeightToken = keyof typeof typography.fontWeight;
export type BorderRadiusToken = keyof typeof borderRadius;
export type BoxShadowToken = keyof typeof boxShadow;
export type ZIndexToken = keyof typeof zIndex;
export type BreakpointToken = keyof typeof breakpoints;
export type ContainerToken = keyof typeof containers;

// Utility functions for accessing tokens
export const getColor = (token: string): string => {
  const parts = token.split('.');
  let value: any = colors;
  
  for (const part of parts) {
    value = value[part];
    if (value === undefined) {
      console.warn(`Color token "${token}" not found`);
      return '#000000';
    }
  }
  
  return typeof value === 'string' ? value : value.DEFAULT || '#000000';
};

// Semantic color utility functions
export const getSemanticColor = (token: keyof typeof colors.semantic): string => {
  return colors.semantic[token] || '#000000';
};

export const getStatusColor = (status: 'success' | 'warning' | 'error' | 'info', variant: 'default' | 'hover' | 'active' | 'foreground' | 'background' | 'border' = 'default'): string => {
  const statusColors = {
    success: {
      default: colors.semantic.success,
      hover: colors.semantic.successHover,
      active: colors.semantic.successActive,
      foreground: colors.semantic.successForeground,
      background: colors.semantic.successBackground,
      border: colors.semantic.successBorder,
    },
    warning: {
      default: colors.semantic.warning,
      hover: colors.semantic.warningHover,
      active: colors.semantic.warningActive,
      foreground: colors.semantic.warningForeground,
      background: colors.semantic.warningBackground,
      border: colors.semantic.warningBorder,
    },
    error: {
      default: colors.semantic.error,
      hover: colors.semantic.errorHover,
      active: colors.semantic.errorActive,
      foreground: colors.semantic.errorForeground,
      background: colors.semantic.errorBackground,
      border: colors.semantic.errorBorder,
    },
    info: {
      default: colors.semantic.info,
      hover: colors.semantic.infoHover,
      active: colors.semantic.infoActive,
      foreground: colors.semantic.infoForeground,
      background: colors.semantic.infoBackground,
      border: colors.semantic.infoBorder,
    },
  };
  
  return statusColors[status]?.[variant] || statusColors[status]?.default || '#000000';
};

export const getButtonColor = (variant: 'primary' | 'secondary' | 'ghost' | 'destructive', state: 'default' | 'hover' | 'active' | 'disabled' = 'default', property: 'background' | 'text' | 'border' = 'background'): string => {
  const buttonColors = {
    primary: {
      default: { background: colors.semantic.buttonPrimary, text: colors.semantic.buttonPrimaryText, border: colors.semantic.buttonPrimary },
      hover: { background: colors.semantic.buttonPrimaryHover, text: colors.semantic.buttonPrimaryText, border: colors.semantic.buttonPrimaryHover },
      active: { background: colors.semantic.buttonPrimaryActive, text: colors.semantic.buttonPrimaryText, border: colors.semantic.buttonPrimaryActive },
      disabled: { background: colors.semantic.buttonPrimaryDisabled, text: colors.semantic.buttonPrimaryDisabledText, border: colors.semantic.buttonPrimaryDisabled },
    },
    secondary: {
      default: { background: colors.semantic.buttonSecondary, text: colors.semantic.buttonSecondaryText, border: colors.semantic.buttonSecondaryBorder },
      hover: { background: colors.semantic.buttonSecondaryHover, text: colors.semantic.buttonSecondaryText, border: colors.semantic.buttonSecondaryBorderHover },
      active: { background: colors.semantic.buttonSecondaryActive, text: colors.semantic.buttonSecondaryText, border: colors.semantic.buttonSecondaryBorderHover },
      disabled: { background: colors.semantic.buttonSecondary, text: colors.semantic.textDisabled, border: colors.semantic.buttonSecondaryBorder },
    },
    ghost: {
      default: { background: colors.semantic.buttonGhost, text: colors.semantic.buttonGhostText, border: 'transparent' },
      hover: { background: colors.semantic.buttonGhostHover, text: colors.semantic.buttonGhostTextHover, border: 'transparent' },
      active: { background: colors.semantic.buttonGhostActive, text: colors.semantic.buttonGhostTextHover, border: 'transparent' },
      disabled: { background: colors.semantic.buttonGhost, text: colors.semantic.textDisabled, border: 'transparent' },
    },
    destructive: {
      default: { background: colors.semantic.buttonDestructive, text: colors.semantic.buttonDestructiveText, border: colors.semantic.buttonDestructive },
      hover: { background: colors.semantic.buttonDestructiveHover, text: colors.semantic.buttonDestructiveText, border: colors.semantic.buttonDestructiveHover },
      active: { background: colors.semantic.buttonDestructiveActive, text: colors.semantic.buttonDestructiveText, border: colors.semantic.buttonDestructiveActive },
      disabled: { background: colors.semantic.buttonPrimaryDisabled, text: colors.semantic.buttonPrimaryDisabledText, border: colors.semantic.buttonPrimaryDisabled },
    },
  };
  
  return buttonColors[variant]?.[state]?.[property] || '#000000';
};

export const getSpacing = (token: keyof typeof spacing): string => {
  return spacing[token] || '0';
};

export const getFontSize = (token: keyof typeof typography.fontSize): string => {
  return typography.fontSize[token] || typography.fontSize.base;
};

export const getResponsiveFontSize = (token: keyof typeof typography.responsiveFontSize): string => {
  return typography.responsiveFontSize[token] || typography.responsiveFontSize.base;
};

// CSS-in-JS helper functions
export const createTransition = (
  properties: string[] = ['all'],
  duration: keyof typeof animation.duration = 200,
  easing: keyof typeof animation.easing = 'standard'
): string => {
  return properties
    .map(prop => `${prop} ${animation.duration[duration]}ms ${animation.easing[easing]}`)
    .join(', ');
};

export const createBoxShadow = (token: keyof typeof boxShadow): string => {
  return boxShadow[token] || boxShadow.none;
};

// Media query helpers
export const mediaQuery = {
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,
  
  // Utility functions
  above: (breakpoint: keyof typeof breakpoints) => `@media (min-width: ${breakpoints[breakpoint]})`,
  below: (breakpoint: keyof typeof breakpoints) => {
    const bp = parseInt(breakpoints[breakpoint]);
    return `@media (max-width: ${bp - 1}px)`;
  },
  between: (min: keyof typeof breakpoints, max: keyof typeof breakpoints) => {
    const minBp = breakpoints[min];
    const maxBp = parseInt(breakpoints[max]) - 1;
    return `@media (min-width: ${minBp}) and (max-width: ${maxBp}px)`;
  },
} as const;