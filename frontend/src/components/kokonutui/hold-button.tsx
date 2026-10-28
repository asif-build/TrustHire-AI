"use client";

/**
 * @author: @kokonutui
 * @description: Hold Button - Press and hold confirmation component for destructive and critical actions
 * @version: 1.0.0
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HoldButtonProps {
  /** Callback triggered when the hold duration is reached */
  onComplete?: () => void;
  /** Hold duration in milliseconds (default: 2500ms) */
  holdDuration?: number;
  /** Duration alias for shadcn/kokonut compatibility */
  duration?: number;
  /** Visual variant of the button */
  variant?: "default" | "destructive" | "outline" | "secondary";
  /** Button content / label */
  children?: React.ReactNode;
  /** Text shown while actively holding (defaults to children or "Holding...") */
  holdingText?: string;
  /** Text shown once completed */
  completeText?: string;
  /** Custom icon */
  icon?: React.ReactNode;
  /** Extra class names */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Whether to keep the completed state or auto-reset after delay */
  autoResetDelay?: number;
}

export function HoldButton({
  onComplete,
  holdDuration,
  duration,
  variant = "destructive",
  children,
  holdingText,
  completeText = "Completed",
  icon,
  className,
  disabled = false,
  autoResetDelay = 2000,
}: HoldButtonProps) {
  const targetDuration = holdDuration ?? duration ?? 2500;
  
  const [progress, setProgress] = useState(0); // 0 to 100
  const [isHolding, setIsHolding] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    };
  }, []);

  const triggerCompletion = useCallback(() => {
    setIsHolding(false);
    setIsCompleted(true);
    setProgress(100);

    // Haptic feedback if supported
    if (typeof window !== "undefined" && "navigator" in window && navigator.vibrate) {
      try {
        navigator.vibrate([40, 60, 40]);
      } catch {
        // Ignore haptics restriction
      }
    }

    onComplete?.();

    if (autoResetDelay > 0) {
      resetTimeoutRef.current = setTimeout(() => {
        setIsCompleted(false);
        setProgress(0);
      }, autoResetDelay);
    }
  }, [onComplete, autoResetDelay]);

  // Tick function for smooth 60fps filling
  const tick = useCallback(() => {
    if (!startTimeRef.current) return;

    const elapsed = Date.now() - startTimeRef.current;
    const currentProgress = Math.min((elapsed / targetDuration) * 100, 100);
    setProgress(currentProgress);

    if (currentProgress >= 100) {
      triggerCompletion();
    } else {
      animationFrameRef.current = requestAnimationFrame(tick);
    }
  }, [targetDuration, triggerCompletion]);

  const startHolding = (e: React.PointerEvent | React.TouchEvent | React.MouseEvent) => {
    if (disabled || isCompleted) return;
    
    // Prevent context menu on touch devices
    if ("button" in e && e.button !== 0) return;

    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

    startTimeRef.current = Date.now();
    setIsHolding(true);
    animationFrameRef.current = requestAnimationFrame(tick);
  };

  const stopHolding = () => {
    if (!isHolding || isCompleted) return;

    setIsHolding(false);
    startTimeRef.current = null;
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

    // Smoothly drain progress back to zero
    const drainStart = Date.now();
    const initialProgress = progress;
    const drainDuration = 180; // snappy release

    const drain = () => {
      const elapsed = Date.now() - drainStart;
      const t = Math.min(elapsed / drainDuration, 1);
      const easeOut = 1 - Math.pow(1 - t, 3);
      const newProgress = initialProgress * (1 - easeOut);

      setProgress(newProgress);

      if (t < 1) {
        requestAnimationFrame(drain);
      } else {
        setProgress(0);
      }
    };

    requestAnimationFrame(drain);
  };

  // Keyboard accessibility (hold space or enter)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || isCompleted || isHolding) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      startTimeRef.current = Date.now();
      setIsHolding(true);
      animationFrameRef.current = requestAnimationFrame(tick);
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      stopHolding();
    }
  };

  // Styling maps
  const variantStyles = {
    destructive: {
      wrapper: "bg-[#fbfbfd] hover:bg-rose-50/60 text-[#1d1d1f] hover:text-rose-600 border-black/[0.08] hover:border-rose-200/80 shadow-2xs",
      fill: "bg-rose-500",
      completeText: "text-white",
      defaultIcon: <Trash2 className="w-3.5 h-3.5 text-rose-500 shrink-0 stroke-[1.75]" />,
    },
    default: {
      wrapper: "bg-[#1d1d1f] text-white hover:bg-black border-transparent shadow-xs",
      fill: "bg-[#0071e3]",
      completeText: "text-white",
      defaultIcon: <AlertTriangle className="w-3.5 h-3.5 text-white/80 shrink-0 stroke-[1.75]" />,
    },
    secondary: {
      wrapper: "bg-[#f5f5f7] hover:bg-[#ebebee] text-[#1d1d1f] border-black/[0.06]",
      fill: "bg-[#1d1d1f]/20",
      completeText: "text-[#1d1d1f]",
      defaultIcon: <AlertTriangle className="w-3.5 h-3.5 text-[#86868b] shrink-0 stroke-[1.75]" />,
    },
    outline: {
      wrapper: "bg-transparent border border-black/15 text-[#1d1d1f] hover:bg-black/5",
      fill: "bg-black/10",
      completeText: "text-[#1d1d1f]",
      defaultIcon: <AlertTriangle className="w-3.5 h-3.5 text-[#1d1d1f] shrink-0 stroke-[1.75]" />,
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.destructive;

  return (
    <div className="relative inline-flex flex-col items-center select-none touch-none">
      <button
        type="button"
        disabled={disabled}
        onPointerDown={startHolding}
        onPointerUp={stopHolding}
        onPointerLeave={stopHolding}
        onPointerCancel={stopHolding}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onContextMenu={(e) => e.preventDefault()}
        className={cn(
          "relative overflow-hidden cursor-pointer",
          "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full",
          "text-xs font-medium tracking-tight transition-all duration-200",
          "border outline-none focus-visible:ring-2 focus-visible:ring-black/10",
          disabled && "opacity-40 cursor-not-allowed",
          isHolding && "scale-[0.98] text-white",
          currentVariant.wrapper,
          className
        )}
      >
        {/* Animated Progress Fill Background */}
        <div
          className={cn(
            "absolute left-0 top-0 bottom-0 pointer-events-none transition-[width] duration-75",
            currentVariant.fill
          )}
          style={{
            width: `${progress}%`,
            opacity: isCompleted ? 1 : 0.85,
          }}
        />

        {/* Pulse Ripple when holding */}
        {isHolding && (
          <motion.div
            initial={{ opacity: 0.3, scale: 0.98 }}
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.98, 1.01, 0.98] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0 pointer-events-none bg-rose-500/20 rounded-full"
          />
        )}

        {/* Content & State Icons */}
        <span className="relative z-10 flex items-center gap-2">
          <AnimatePresence mode="wait">
            {isCompleted ? (
              <motion.span
                key="check"
                initial={{ scale: 0.6, rotate: -30, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="flex items-center gap-1.5 font-bold"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>{completeText}</span>
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                {icon ? icon : currentVariant.defaultIcon}
                <span>
                  {isHolding ? (holdingText || "Keep holding...") : (children || "Hold to Confirm")}
                </span>
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </button>

      {/* Progress Helper Subtitle */}
      <div className="h-4 mt-1 flex items-center justify-center">
        {isHolding && !isCompleted && (
          <motion.span
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-[10px] text-[#86868b] font-medium tracking-tight"
          >
            Hold for {Math.max(0, ((targetDuration - (progress / 100) * targetDuration) / 1000)).toFixed(1)}s
          </motion.span>
        )}
      </div>
    </div>
  );
}

export default HoldButton;
