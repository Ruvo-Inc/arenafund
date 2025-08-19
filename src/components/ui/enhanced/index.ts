/**
 * Enhanced Visual Component Library
 * 
 * This module exports enhanced UI components with redesign styles,
 * animations, and improved visual effects for the homepage integration.
 */

// Enhanced Button Component
export { default as EnhancedButton } from '../EnhancedButton';

// Gradient Card Components
export { 
  GradientCard,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  default as Card
} from '../GradientCard';

// Animated Icon Components
export { 
  AnimatedIcon,
  IconButton,
  PresetIcon,
  default as Icon
} from '../AnimatedIcon';

// Re-export components for clean imports
export * from '../EnhancedButton';
export * from '../GradientCard';
export * from '../AnimatedIcon';