import { useEffect, useState } from 'react';
import { Variants } from 'framer-motion';

export const useAnimations = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detección de preferencias de movimiento reducido
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Detección de dispositivos móviles para optimización
    const mobileQuery = window.matchMedia('(max-width: 768px)');
    setIsMobile(mobileQuery.matches);

    const handleMobileChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    mobileQuery.addEventListener('change', handleMobileChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      mobileQuery.removeEventListener('change', handleMobileChange);
    };
  }, []);

  // Factor de optimización para móviles
  const shouldReduceMotion = prefersReducedMotion || isMobile;
  const mobileReduction = isMobile ? 0.7 : 1; // Reduce duraciones en 30% en móvil
  const mobileDistance = isMobile ? 30 : 60; // Reduce distancias en móvil

  // Animaciones para fade in desde diferentes direcciones
  const fadeInUp: Variants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : mobileDistance,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.01 : (0.6 * mobileReduction),
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const fadeInDown: Variants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : -mobileDistance,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.01 : (0.6 * mobileReduction),
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const fadeInLeft: Variants = {
    hidden: {
      opacity: 0,
      x: shouldReduceMotion ? 0 : -mobileDistance,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: shouldReduceMotion ? 0.01 : (0.6 * mobileReduction),
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const fadeInRight: Variants = {
    hidden: {
      opacity: 0,
      x: shouldReduceMotion ? 0 : mobileDistance,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: shouldReduceMotion ? 0.01 : (0.6 * mobileReduction),
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const scaleIn: Variants = {
    hidden: {
      opacity: 0,
      scale: shouldReduceMotion ? 1 : (isMobile ? 0.9 : 0.8),
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: shouldReduceMotion ? 0.01 : (0.5 * mobileReduction),
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const floatingAnimation = {
    initial: { y: 0 },
    animate: {
      y: shouldReduceMotion ? 0 : (isMobile ? [-5, 5, -5] : [-10, 10, -10]),
      transition: {
        duration: shouldReduceMotion ? 0 : (isMobile ? 6 : 4),
        ease: 'easeInOut',
        repeat: shouldReduceMotion ? 0 : Infinity,
      },
    },
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : (isMobile ? 0.05 : 0.1),
        delayChildren: shouldReduceMotion ? 0 : (isMobile ? 0.05 : 0.1),
      },
    },
  };

  const hoverScale = {
    scale: shouldReduceMotion ? 1 : (isMobile ? 1.02 : 1.05),
    transition: {
      duration: shouldReduceMotion ? 0 : (isMobile ? 0.15 : 0.2),
    },
  };

  const hoverLift = {
    y: shouldReduceMotion ? 0 : (isMobile ? -4 : -8),
    transition: {
      duration: shouldReduceMotion ? 0 : (isMobile ? 0.15 : 0.2),
    },
  };

  return {
    prefersReducedMotion,
    isMobile,
    shouldReduceMotion,
    fadeInUp,
    fadeInDown,
    fadeInLeft,
    fadeInRight,
    scaleIn,
    floatingAnimation,
    staggerContainer,
    hoverScale,
    hoverLift,
  };
};
