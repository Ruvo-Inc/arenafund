'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Menu, X, ChevronRight } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface EnhancedNavigationProps {
  className?: string;
}

const navigationItems = [
  { href: '/investors', label: 'Investors' },
  { href: '/founders', label: 'Founders' },
  { href: '/process', label: 'Process' },
  { href: '/faq', label: 'FAQ' },
];

export function EnhancedNavigation({ className }: EnhancedNavigationProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  
  // Transform for backdrop blur intensity based on scroll
  const backdropBlur = useTransform(scrollY, [0, 100], [8, 20]);
  const backgroundOpacity = useTransform(scrollY, [0, 100], [0.8, 0.95]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const navVariants = {
    initial: { y: -100, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.8,
        ease: [0.25, 0.46, 0.45, 0.94] as const
      }
    }
  };

  const mobileMenuVariants = {
    closed: {
      opacity: 0,
      x: '100%',
      transition: {
        duration: prefersReducedMotion ? 0 : 0.3,
        ease: [0.25, 0.46, 0.45, 0.94] as const
      }
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.3,
        ease: [0.25, 0.46, 0.45, 0.94] as const
      }
    }
  };

  const menuItemVariants = {
    closed: { opacity: 0, x: 20 },
    open: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: prefersReducedMotion ? 0 : i * 0.1,
        duration: prefersReducedMotion ? 0 : 0.3,
        ease: [0.25, 0.46, 0.45, 0.94] as const
      }
    })
  };

  return (
    <>
      <motion.header
        variants={navVariants}
        initial="initial"
        animate="animate"
        className={cn(
          'fixed top-0 w-full z-50 transition-all duration-300',
          isScrolled 
            ? 'bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-sm' 
            : 'bg-background/80 backdrop-blur-md border-b border-border/30',
          className
        )}
        style={{
          backdropFilter: prefersReducedMotion ? undefined : `blur(${backdropBlur}px)`,
          backgroundColor: prefersReducedMotion ? undefined : `rgba(255, 255, 255, ${backgroundOpacity})`
        }}
      >
        <div className="mx-auto flex max-w-container-xl items-center justify-between px-6 py-5">
          {/* Logo */}
          <motion.div
            whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Link href="/" className="group flex items-center gap-3 transition-all">
              <motion.img 
                src="/logo.png" 
                alt="The Arena Fund" 
                className="w-8 h-8 object-contain transition-transform group-hover:scale-105"
                whileHover={prefersReducedMotion ? {} : { rotate: 5 }}
                transition={{ duration: 0.3 }}
              />
              <span className="font-display text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent tracking-tight">
                The Arena Fund
              </span>
            </Link>
          </motion.div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navigationItems.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <motion.div
                  key={item.href}
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <Link 
                    href={item.href}
                    className={cn(
                      'relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                      'hover:text-foreground hover:bg-secondary/80',
                      'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                      isActive 
                        ? 'text-foreground bg-secondary' 
                        : 'text-muted-foreground'
                    )}
                  >
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-secondary rounded-lg -z-10"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
            
            <div className="w-px h-6 bg-border mx-2" />
            
            <motion.div
              whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
            >
              <Link 
                href="/account" 
                className="ml-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                Account
              </Link>
            </motion.div>
          </nav>

          {/* Mobile Menu Toggle */}
          <motion.button
            className="md:hidden relative p-2 rounded-lg hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={prefersReducedMotion ? {} : { rotate: -90, opacity: 0 }}
                  animate={prefersReducedMotion ? {} : { rotate: 0, opacity: 1 }}
                  exit={prefersReducedMotion ? {} : { rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={prefersReducedMotion ? {} : { rotate: 90, opacity: 0 }}
                  animate={prefersReducedMotion ? {} : { rotate: 0, opacity: 1 }}
                  exit={prefersReducedMotion ? {} : { rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.nav
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed top-0 right-0 z-50 h-full w-80 max-w-[85vw] bg-background/95 backdrop-blur-xl border-l border-border shadow-2xl md:hidden"
          >
            <div className="flex flex-col h-full">
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <img 
                    src="/logo.png" 
                    alt="The Arena Fund" 
                    className="w-8 h-8 object-contain"
                  />
                  <span className="font-display text-lg font-bold">
                    The Arena Fund
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Navigation Items */}
              <div className="flex-1 overflow-y-auto py-6">
                <div className="px-6 space-y-2">
                  {navigationItems.map((item, index) => {
                    const isActive = pathname === item.href;
                    return (
                      <motion.div
                        key={item.href}
                        custom={index}
                        variants={menuItemVariants}
                        initial="closed"
                        animate="open"
                      >
                        <Link
                          href={item.href}
                          className={cn(
                            'flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all',
                            'hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                            isActive 
                              ? 'bg-primary text-primary-foreground shadow-sm' 
                              : 'text-foreground hover:text-foreground'
                          )}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <span>{item.label}</span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Footer Actions */}
              <div className="p-6 border-t border-border">
                <motion.div
                  custom={navigationItems.length}
                  variants={menuItemVariants}
                  initial="closed"
                  animate="open"
                >
                  <Link
                    href="/account"
                    className="flex items-center justify-center w-full bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-3 rounded-lg font-medium transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Account
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}