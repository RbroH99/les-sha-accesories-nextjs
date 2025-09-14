"use client";

import { motion } from "framer-motion";
import { useAnimations } from "@/hooks/useAnimations";

export const ScrollIndicator = () => {
  const animations = useAnimations();

  if (animations.shouldReduceMotion) {
    return null;
  }

  return (
    <motion.div 
      className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20 hidden sm:block"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2, duration: 0.8 }}
    >
      <motion.div 
        className="flex flex-col items-center space-y-2 cursor-pointer group"
        onClick={() => {
          window.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth'
          });
        }}
      >
        {/* Texto */}
        <motion.span
          className="text-sm text-gray-500 group-hover:text-rose-500 transition-colors duration-300 font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Deslizar
        </motion.span>
        
        {/* Indicador de scroll */}
        <motion.div 
          className="w-6 h-10 border-2 border-gray-400 group-hover:border-rose-500 rounded-full flex justify-center relative overflow-hidden backdrop-blur-sm bg-white/80"
          animate={{ 
            borderColor: animations.isMobile 
              ? ['#9ca3af', '#f43f5e', '#9ca3af'] 
              : ['#9ca3af', '#f43f5e', '#f59e0b', '#9ca3af'] 
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <motion.div 
            className="w-1.5 h-3 bg-gray-400 group-hover:bg-rose-500 rounded-full mt-2"
            animate={{ 
              y: [0, 16, 0],
              backgroundColor: animations.isMobile 
                ? ['#9ca3af', '#f43f5e', '#9ca3af']
                : ['#9ca3af', '#f43f5e', '#f59e0b', '#9ca3af']
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          {/* Efecto de brilllo */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent rounded-full"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
        
        {/* Flecha animada */}
        <motion.div
          className="text-gray-400 group-hover:text-rose-500 transition-colors duration-300"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 13l3 3 3-3M7 6l3 3 3-3" />
          </svg>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
