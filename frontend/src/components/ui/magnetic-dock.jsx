import React, { useRef, useState, useCallback } from "react"
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion"
import { cn } from "../../lib/utils"

function DockItem({
    item,
    mouseX,
    iconSize,
    maxScale,
    magneticDistance,
    showLabels,
    isVertical,
}) {
    const ref = useRef(null)
    const [isHovered, setIsHovered] = useState(false)

    // Calculate distance from mouse to center of item
    const distance = useTransform(mouseX, (val) => {
        if (!ref.current) return magneticDistance + 1
        const rect = ref.current.getBoundingClientRect()
        const center = isVertical
            ? rect.top + rect.height / 2
            : rect.left + rect.width / 2
        return val - center
    })

    // Scale based on distance - closer = larger
    const scale = useTransform(distance, [-magneticDistance, 0, magneticDistance], [1, maxScale, 1])

    // Apply spring physics for smooth animation
    const springConfig = { damping: 20, stiffness: 300, mass: 0.5 }
    const smoothScale = useSpring(scale, springConfig)

    // Calculate the size based on scale
    const size = useTransform(smoothScale, (s) => s * iconSize)

    // Floating effect
    const y = useTransform(smoothScale, (s) => (s - 1) * -10)
    const smoothY = useSpring(y, springConfig)

    return (
        <motion.button
            ref={ref}
            onClick={item.onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
                "relative flex items-center justify-center",
                "rounded-2xl transition-colors duration-200",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2bee4b]",
                item.isActive && "bg-white/5"
            )}
            style={{
                width: size,
                height: size,
                y: isVertical ? 0 : smoothY,
                x: isVertical ? smoothY : 0,
            }}
            whileTap={{ scale: 0.9 }}
        >
            {/* Icon Container */}
            <motion.div
                className={cn(
                    "relative w-full h-full rounded-2xl overflow-hidden",
                    "bg-gradient-to-b from-[#232924] to-[#121613]",
                    "backdrop-blur-sm",
                    "border border-[#fafffa]/10",
                    "shadow-lg shadow-black/40",
                    "flex items-center justify-center",
                    "transition-all duration-200"
                )}
                style={{
                    boxShadow: isHovered
                        ? "0 8px 32px rgba(43, 238, 75, 0.15), inset 0 1px 0 rgba(250,255,250,0.1)"
                        : "0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(250,255,250,0.05)",
                }}
            >
                {/* Icon */}
                <div className="w-[50%] h-[50%] flex items-center justify-center text-[#c8d2c8] hover:text-[#2bee4b] transition-colors duration-200">
                    {item.icon}
                </div>
 
                {/* Shine effect */}
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background:
                            "linear-gradient(135deg, rgba(250,255,250,0.1) 0%, transparent 50%, transparent 100%)",
                        opacity: isHovered ? 0.9 : 0.5,
                    }}
                />
            </motion.div>
 
            {/* Badge */}
            <AnimatePresence>
                {item.badge !== undefined && item.badge > 0 && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className={cn(
                            "absolute -top-1 -right-1",
                            "min-w-[18px] h-4.5 px-1.5",
                            "rounded-full",
                            "bg-red-500",
                            "text-white text-[10px] font-bold",
                            "flex items-center justify-center",
                            "border border-[#121613]",
                            "shadow-lg"
                        )}
                    >
                        {item.badge > 99 ? "99+" : item.badge}
                    </motion.div>
                )}
            </AnimatePresence>
 
            {/* Active Indicator */}
            <AnimatePresence>
                {item.isActive && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className={cn(
                            "absolute -bottom-2",
                            "w-1.5 h-1.5 rounded-full",
                            "bg-[#2bee4b] shadow-md shadow-[#2bee4b]/55"
                        )}
                    />
                )}
            </AnimatePresence>
 
            {/* Tooltip */}
            <AnimatePresence>
                {showLabels && isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.9 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className={cn(
                            "absolute -top-10 left-1/2 -translate-x-1/2",
                            "px-2.5 py-1 rounded-lg",
                            "bg-[#121613]/95",
                            "backdrop-blur-sm",
                            "text-[#fafffa] text-xs font-semibold whitespace-nowrap",
                            "border border-[#c8d2c8]/20",
                            "shadow-xl shadow-black/45",
                            "pointer-events-none z-50"
                        )}
                    >
                        {item.label}
                        {/* Tooltip arrow */}
                        <div
                            className={cn(
                                "absolute left-1/2 -translate-x-1/2 -bottom-1",
                                "w-1.5 h-1.5 rotate-45",
                                "bg-[#121613]/95",
                                "border-r border-b border-[#c8d2c8]/20"
                            )}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
 
            {/* Hover glow */}
            <motion.div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                animate={{
                    boxShadow: isHovered
                        ? "0 0 20px rgba(43,238,75,0.25)"
                        : "0 0 0px rgba(43,238,75,0)",
                }}
                transition={{ duration: 0.3 }}
            />
        </motion.button>
    )
}

function MagneticDock({
    items,
    iconSize = 48,
    maxScale = 1.35,
    magneticDistance = 120,
    showLabels = true,
    position = "bottom",
    variant = "glass",
    className,
}) {
    const mousePosition = useMotionValue(Infinity)
    const isVertical = position === "left" || position === "right"

    const handleMouseMove = useCallback(
        (e) => {
            if (isVertical) {
                mousePosition.set(e.clientY)
            } else {
                mousePosition.set(e.clientX)
            }
        },
        [mousePosition, isVertical]
    )

    const handleMouseLeave = () => {
        mousePosition.set(Infinity)
    }

    const variantStyles = {
        glass: cn(
            "bg-white/5 dark:bg-zinc-900/40",
            "backdrop-blur-xl",
            "border border-white/10"
        ),
        solid: cn(
            "bg-zinc-900",
            "border border-zinc-800"
        ),
        transparent: "bg-transparent border-0",
    }

    const positionStyles = {
        bottom: "flex-row",
        top: "flex-row",
        left: "flex-col",
        right: "flex-col",
    }

    return (
        <motion.div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={cn(
                "inline-flex items-end gap-2.5 p-3 rounded-2xl",
                variantStyles[variant],
                positionStyles[position],
                "shadow-2xl shadow-black/50",
                className
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
            {items.map((item) => (
                <DockItem
                    key={item.id}
                    item={item}
                    mouseX={mousePosition}
                    iconSize={iconSize}
                    maxScale={maxScale}
                    magneticDistance={magneticDistance}
                    showLabels={showLabels}
                    isVertical={isVertical}
                />
            ))}
        </motion.div>
    )
}

export { MagneticDock }
