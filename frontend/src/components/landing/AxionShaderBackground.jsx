import React, { useState, useEffect, Component } from 'react';
import { Shader, Swirl, ChromaFlow, FlutedGlass, FilmGrain } from 'shaders/react';

// Error boundary to protect against any unexpected render crashes
class ShaderErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('AxionShader fallback engaged:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

function checkWebGLSupport() {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    return !!gl;
  } catch (e) {
    return false;
  }
}

/**
 * AxionShaderBackground
 * 
 * Exact shader stack specified by the user using `shaders/react`:
 * - Swirl: colorA: #ffffff, colorB: #f0f0f0, detail: 1.7
 * - ChromaFlow: baseColor: #ffffff, downColor/leftColor/rightColor/upColor: #ff5f03, momentum: 13, radius: 3.5
 * - FlutedGlass: aberration: 0.61, angle: 31, frequency: 8, highlight: 0.12, highlightSoftness: 0,
 *                lightAngle: -90, refraction: 4, shape: "rounded", softness: 1, speed: 0.15
 * - FilmGrain: strength: 0.05
 */
export default function AxionShaderBackground({ className = '' }) {
  const [webGLSupported, setWebGLSupported] = useState(false);
  const [hasInitError, setHasInitError] = useState(false);

  useEffect(() => {
    const supported = checkWebGLSupport();
    setWebGLSupported(supported);

    // Trap any asynchronous WebGL/Three.js context initialization failures
    const handleRejection = (event) => {
      const reason = event?.reason?.toString() || '';
      if (
        reason.includes('WebGL') ||
        reason.includes('getSupportedExtensions') ||
        reason.includes('THREE.WebGLRenderer')
      ) {
        console.warn('Async WebGL context issue detected, switching to smooth visual fallback:', event.reason);
        setHasInitError(true);
        event.preventDefault?.();
      }
    };

    window.addEventListener('unhandledrejection', handleRejection);
    return () => window.removeEventListener('unhandledrejection', handleRejection);
  }, []);

  const fallbackVisual = (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none">
      <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-br from-[#ff5f03]/25 via-[#ff9248]/15 to-transparent blur-[100px] animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute top-[30%] -right-[15%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tl from-[#ff5f03]/20 via-[#ffab6b]/10 to-transparent blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute inset-0 bg-[#EFEFEF]/40 backdrop-blur-[2px]" />
    </div>
  );

  return (
    <div
      className={`absolute inset-0 z-10 pointer-events-none overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      {webGLSupported && !hasInitError ? (
        <ShaderErrorBoundary fallback={fallbackVisual}>
          <Shader className="w-full h-full block">
            <Swirl
              colorA="#ffffff"
              colorB="#f0f0f0"
              detail={1.7}
            />
            <ChromaFlow
              baseColor="#ffffff"
              downColor="#ff5f03"
              leftColor="#ff5f03"
              rightColor="#ff5f03"
              upColor="#ff5f03"
              momentum={13}
              radius={3.5}
            />
            <FlutedGlass
              aberration={0.61}
              angle={31}
              frequency={8}
              highlight={0.12}
              highlightSoftness={0}
              lightAngle={-90}
              refraction={4}
              shape="rounded"
              softness={1}
              speed={0.15}
            />
            <FilmGrain
              strength={0.05}
            />
          </Shader>
        </ShaderErrorBoundary>
      ) : (
        fallbackVisual
      )}
    </div>
  );
}
