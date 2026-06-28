import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "../../lib/utils"

// Color schemas for custom styling
const colorSchemas = {
    gray: {
        level0: "bg-zinc-100 dark:bg-zinc-900",
        level1: "bg-zinc-300 dark:bg-zinc-800",
        level2: "bg-zinc-400 dark:bg-zinc-700",
        level3: "bg-zinc-600 dark:bg-zinc-500",
        level4: "bg-zinc-800 dark:bg-zinc-300",
    },
    green: {
        level0: "bg-[#c8d2c8]/20 dark:bg-zinc-900",
        level1: "bg-[#93b799]/30 dark:bg-emerald-900/50",
        level2: "bg-[#93b799]/60 dark:bg-emerald-700/60",
        level3: "bg-[#516254] dark:bg-emerald-500",
        level4: "bg-[#2bee4b] dark:bg-emerald-400",
    },
    blue: {
        level0: "bg-zinc-100 dark:bg-zinc-900",
        level1: "bg-blue-200 dark:bg-blue-900",
        level2: "bg-blue-300 dark:bg-blue-700",
        level3: "bg-blue-400 dark:bg-blue-500",
        level4: "bg-blue-500 dark:bg-blue-400",
    },
    purple: {
        level0: "bg-zinc-100 dark:bg-zinc-900",
        level1: "bg-purple-200 dark:bg-purple-900",
        level2: "bg-purple-300 dark:bg-purple-700",
        level3: "bg-purple-400 dark:bg-purple-500",
        level4: "bg-purple-500 dark:bg-purple-400",
    },
    orange: {
        level0: "bg-zinc-100 dark:bg-zinc-900",
        level1: "bg-orange-200 dark:bg-orange-900",
        level2: "bg-orange-300 dark:bg-orange-700",
        level3: "bg-orange-400 dark:bg-orange-500",
        level4: "bg-orange-500 dark:bg-orange-400",
    },
}

function getLevelClass(level, schema = "green") {
    const s = colorSchemas[schema] || colorSchemas.green
    if (level === 0 || level === "0" || level === "NONE") return s.level0
    if (level === 1 || level === "1" || level === "FIRST_QUARTILE") return s.level1
    if (level === 2 || level === "2" || level === "SECOND_QUARTILE") return s.level2
    if (level === 3 || level === "3" || level === "THIRD_QUARTILE") return s.level3
    if (level === 4 || level === "4" || level === "FOURTH_QUARTILE") return s.level4
    return s.level0
}

function getShapeClass(shape) {
    switch (shape) {
        case "circle":
            return "rounded-full"
        case "square":
            return "rounded-none"
        case "squircle":
            return "rounded-sm"
        case "rounded":
        default:
            return "rounded-[2px]"
    }
}

export function GithubCalendar({
    username,
    variant = "default",
    shape = "rounded",
    glowIntensity = 5,
    className,
    showTotal = true,
    colorSchema = "green",
}) {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [hoveredDate, setHoveredDate] = useState(null)
    const [hoveredCount, setHoveredCount] = useState(null)
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

    useEffect(() => {
        const fetchData = async () => {
            if (!username) {
                setLoading(false)
                return
            }
            try {
                setLoading(true)
                setError(null)
                // Normalize username (extract if it's a full URL)
                let cleanUsername = username.trim()
                if (cleanUsername.includes("/")) {
                    const parts = cleanUsername.replace(/\/$/, "").split("/")
                    cleanUsername = parts[parts.length - 1]
                }

                const response = await fetch(
                    `https://github-contributions-api.deno.dev/${cleanUsername}.json`
                )
                if (!response.ok) {
                    throw new Error("Failed to fetch GitHub data")
                }
                const jsonData = await response.json()
                setData(jsonData)
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [username])

    if (!username) {
        return null
    }

    if (error) {
        return (
            <div className={cn("p-4 rounded-[10px] border border-red-200 bg-red-50 text-red-500 text-xs font-light", className)}>
                GitHub connection error: {error}. Check profile settings.
            </div>
        )
    }

    if (loading) {
        return (
            <div className={cn("w-full h-32 animate-pulse bg-[#c8d2c8]/20 rounded-xl", className)} />
        )
    }

    const weeks = data?.contributions || []
    
    // Support either totalContributions or direct year sum
    const totalContributions = data?.totalContributions !== undefined
        ? data.totalContributions
        : (data?.total !== undefined
            ? Object.values(data.total).reduce((a, b) => a + b, 0)
            : 0)

    // Normalize username (extract if it's a URL)
    let displayUsername = username.trim()
    if (displayUsername.includes("/")) {
        const parts = displayUsername.replace(/\/$/, "").split("/")
        displayUsername = parts[parts.length - 1]
    }

    return (
        <div className={cn("w-max max-w-full flex flex-col gap-3 font-twk-lausanne", className)}>
            {showTotal && (
                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-semibold text-[#121613]">
                        <svg height="14" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="14" className="fill-current text-[#516254]">
                            <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
                        </svg>
                        <span>@{displayUsername}</span>
                    </div>
                    <span className="text-[#516254] font-light">
                        <strong className="font-semibold text-[#121613]">{totalContributions}</strong> contributions in the last year
                    </span>
                </div>
            )}

            <div
                className="relative flex flex-nowrap gap-[3px] w-max max-w-full overflow-x-auto py-1"
                onMouseLeave={() => {
                    setHoveredDate(null)
                    setHoveredCount(null)
                }}
            >
                {/* Simple Tooltip */}
                <AnimatePresence>
                    {hoveredDate && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 5, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            className="absolute z-50 pointer-events-none px-3 py-1.5 bg-[#121613] text-[#fafffa] text-[10px] rounded-[5px] shadow-lg whitespace-nowrap"
                            style={{
                                left: mousePos.x,
                                top: mousePos.y - 35,
                                transform: "translateX(-50%)"
                            }}
                        >
                            <span className="font-semibold mr-1">{hoveredCount}</span>
                            <span className="text-[#c8d2c8]">contributions on {hoveredDate}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-[3px] w-[11px] sm:w-[13px] shrink-0">
                        {week.map((day, dayIndex) => {
                            const count = day.count !== undefined ? day.count : (day.contributionCount !== undefined ? day.contributionCount : 0)
                            const level = day.level !== undefined ? day.level : (day.contributionLevel !== undefined ? day.contributionLevel : "NONE")
                            
                            const isGlowing = variant === "city-lights" && count > 0;
                            const isMinimal = variant === "minimal";
                            const shapeClass = getShapeClass(shape);

                            return (
                                <motion.div
                                    key={day.date}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{
                                        delay: Math.min(weekIndex * 0.005 + dayIndex * 0.005, 0.4),
                                        type: "spring",
                                        stiffness: 260,
                                        damping: 20
                                    }}
                                    onMouseEnter={(e) => {
                                        setHoveredDate(day.date)
                                        setHoveredCount(count)
                                        const rect = e.currentTarget.getBoundingClientRect()
                                        const parentRect = e.currentTarget.offsetParent.getBoundingClientRect()
                                        setMousePos({
                                            x: rect.left - parentRect.left + rect.width / 2,
                                            y: rect.top - parentRect.top
                                        })
                                    }}
                                    className={cn(
                                        "w-full aspect-square transition-colors duration-200 cursor-pointer",
                                        getLevelClass(level, colorSchema),
                                        isGlowing && "z-10",
                                        shapeClass,
                                        isMinimal && "rounded-full scale-75",
                                    )}
                                    style={
                                        isGlowing ? {
                                            boxShadow: level !== 0 && level !== "NONE"
                                                ? `0 0 ${count > 3 ? `${glowIntensity * 1.5}px` : `${glowIntensity}px`} ${colorSchema === 'green' ? '#2bee4b' :
                                                    colorSchema === 'blue' ? '#3b82f6' :
                                                        colorSchema === 'purple' ? '#a855f7' :
                                                            '#f97316'
                                                }`
                                                : 'none'
                                        } : undefined
                                    }
                                />
                            )
                        })}
                    </div>
                ))}
            </div>
        </div>
    )
}
