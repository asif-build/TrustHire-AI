import React, { useEffect, useRef } from "react"
import { cn } from "../../lib/utils"

export function MatrixRain({
    className,
    variant = "default",
    width,
    height,
    fontSize = 14,
    speed = 45,
    fixedColor,
}) {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // If specific dimensions are provided, use them. Otherwise observe parent.
        const resizeObserver = new ResizeObserver(() => {
            if (!width && !height) {
                canvas.width = canvas.offsetWidth
                canvas.height = canvas.offsetHeight
            }
        })
        resizeObserver.observe(canvas)

        // Initial size setup
        if (width) canvas.width = width
        if (height) canvas.height = height
        if (!width && !height) {
            canvas.width = canvas.offsetWidth
            canvas.height = canvas.offsetHeight
        }

        const w = canvas.width
        const h = canvas.height

        // Columns config
        const columns = Math.floor(w / fontSize)
        const drops = new Array(columns).fill(1)

        // Character set: Katakana + Numbers
        const chars = "ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ1234567890"

        let isDark = document.documentElement.classList.contains("dark") || true

        // Set default background based on theme immediately to avoid delay
        const bg = "#09090b" // match our zinc dark bg

        ctx.fillStyle = bg
        ctx.fillRect(0, 0, w, h)

        const draw = () => {
            // Semi-transparent color for trail effect
            ctx.fillStyle = "rgba(9, 9, 11, 0.06)"
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            ctx.font = `${fontSize}px monospace`

            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)] || ""

                // Color selection
                if (variant === "rainbow" && !fixedColor) {
                    const hue = (Date.now() / 20 + i * 10) % 360
                    ctx.fillStyle = `hsl(${hue}, 100%, 65%)`
                } else if (fixedColor) {
                    ctx.fillStyle = fixedColor
                } else {
                    if (variant === "cyan") {
                        ctx.fillStyle = "#0ff"
                    } else if (variant === "indigo") {
                        ctx.fillStyle = "#818cf8" // Indigo-400
                    } else if (variant === "cyberpunk") {
                        const cyberpunkColors = ["#00f3ff", "#ff007f", "#00ff66", "#ffe600", "#ff3300", "#b900ff"];
                        ctx.fillStyle = cyberpunkColors[Math.floor(Math.random() * cyberpunkColors.length)];
                    } else {
                        // Default to classic matrix green, but optimized for glow
                        ctx.fillStyle = "#10b981" // Emerald-500
                    }
                }

                const x = i * fontSize
                const y = drops[i] * fontSize

                // Neon glow effect
                ctx.shadowBlur = 16;
                ctx.shadowColor = ctx.fillStyle;
                
                ctx.fillText(text, x, y);
                
                // Reset shadow blur for other operations
                ctx.shadowBlur = 0;

                if (y > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0
                }

                drops[i]++
            }
        }

        const interval = setInterval(draw, speed)

        return () => {
            clearInterval(interval)
            resizeObserver.disconnect()
        }
    }, [variant, fontSize, speed, fixedColor, width, height])

    return (
        <canvas
            ref={canvasRef}
            className={cn("w-full h-full bg-[#09090b] block rounded-[inherit]", className)}
            style={{ width, height }}
        />
    )
}
