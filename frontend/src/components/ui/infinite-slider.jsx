import React from 'react';
import { cn } from '../../lib/utils';

export function InfiniteSlider({ children, gap = 24, reverse = false, className }) {
    const items = React.Children.toArray(children);
    // Triple items to guarantee enough width for seamless transitions on wide screens
    const tripledItems = [...items, ...items, ...items];

    return (
        <div className={cn("overflow-hidden w-full flex select-none pointer-events-none relative", className)}>
            {/* Left fade gradient */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#fafffa] to-transparent z-10" />
            
            {/* Slide container */}
            <div 
                className={cn("flex shrink-0 min-w-full items-center justify-around", reverse ? "animate-slider-reverse" : "animate-slider")}
                style={{ gap: `${gap}px` }}
            >
                {tripledItems.map((child, index) => (
                    <div key={index} className="flex-shrink-0 flex items-center justify-center">
                        {child}
                    </div>
                ))}
            </div>

            {/* Right fade gradient */}
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#fafffa] to-transparent z-10" />
            
            {/* Inject CSS keyframe animations */}
            <style>{`
                @keyframes slider {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.333%); }
                }
                @keyframes slider-reverse {
                    0% { transform: translateX(-33.333%); }
                    100% { transform: translateX(0); }
                }
                .animate-slider {
                    animation: slider 30s linear infinite;
                }
                .animate-slider-reverse {
                    animation: slider-reverse 30s linear infinite;
                }
            `}</style>
        </div>
    );
}
