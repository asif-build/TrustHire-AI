import React from 'react';
import AxionShaderBackground from './AxionShaderBackground';

/**
 * OrganicBackground3D
 * 
 * Directly mounts the exact animated shader stack from `shaders/react`
 * specified by the user:
 * - Swirl: colorA: #ffffff, colorB: #f0f0f0, detail: 1.7
 * - ChromaFlow: baseColor: #ffffff, downColor/leftColor/rightColor/upColor: #ff5f03, momentum: 13, radius: 3.5
 * - FlutedGlass: aberration: 0.61, angle: 31, frequency: 8, highlight: 0.12, highlightSoftness: 0,
 *                lightAngle: -90, refraction: 4, shape: "rounded", softness: 1, speed: 0.15
 * - FilmGrain: strength: 0.05
 */
export default function OrganicBackground3D({ className = '' }) {
  return (
    <div className={`absolute inset-0 z-0 pointer-events-none overflow-hidden select-none ${className}`}>
      <AxionShaderBackground className="w-full h-full" />
    </div>
  );
}
