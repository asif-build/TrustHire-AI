import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Clock, X } from 'lucide-react';

// Reusable FadeIn Wrapper using Framer Motion
const FadeIn = ({ children, delay = 0, duration = 0.7, x = 0, y = 0, className }) => (
    <motion.div
        initial={{ opacity: 0, x, y }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true, margin: "50px", amount: 0 }}
        transition={{ delay, duration, ease: [0.25, 0.1, 0.25, 1] }}
        className={className}
    >
        {children}
    </motion.div>
);

// Reusable Magnet Hover Component
const Magnet = ({ children, padding = 120, strength = 3.5, activeTransition = "transform 0.2s ease-out", inactiveTransition = "transform 0.5s ease-in-out" }) => {
    const ref = useRef(null);
    const [transform, setTransform] = useState("translate3d(0px, 0px, 0px)");
    const [transition, setTransition] = useState(inactiveTransition);

    const handleMouseLeave = () => {
        setTransition(inactiveTransition);
        setTransform("translate3d(0px, 0px, 0px)");
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!ref.current) return;
            const rect = ref.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const distanceX = e.clientX - centerX;
            const distanceY = e.clientY - centerY;
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

            if (distance < padding) {
                setTransition(activeTransition);
                const moveX = distanceX / strength;
                const moveY = distanceY / strength;
                setTransform(`translate3d(${moveX}px, ${moveY}px, 0px)`);
            } else {
                setTransition(inactiveTransition);
                setTransform("translate3d(0px, 0px, 0px)");
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, [padding, strength, activeTransition, inactiveTransition]);

    return (
        <div 
            ref={ref} 
            style={{ transform, transition, willChange: 'transform' }}
            className="inline-block"
            onMouseLeave={handleMouseLeave}
        >
            {children}
        </div>
    );
};

// Sub-component for individual characters to avoid Rule of Hooks violation
const Character = ({ char, progress, range }) => {
    const opacity = useTransform(progress, range, [0.15, 1]);
    return (
        <span className="relative inline-block">
            <span className="opacity-15 text-[#516254]">{char}</span>
            <motion.span 
                style={{ opacity }} 
                className="absolute left-0 top-0 text-[#121613] font-normal"
            >
                {char}
            </motion.span>
        </span>
    );
};

// Reusable Character-by-Character Scroll Reveal
const AnimatedText = ({ text }) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start 0.85", "end 0.35"]
    });

    const words = text.split(" ");
    
    return (
        <p ref={ref} className="text-left leading-[1.4] text-[#516254] font-light text-[clamp(1.1rem,2vw,1.4rem)]">
            {words.map((word, wordIndex) => {
                const characters = Array.from(word);
                return (
                    <React.Fragment key={wordIndex}>
                        <span className="inline-block whitespace-nowrap">
                            {characters.map((char, charIndex) => {
                                const globalCharIndex = wordIndex * 5 + charIndex;
                                const start = Math.min(0.9, globalCharIndex * 0.005);
                                const end = Math.min(1.0, start + 0.06);
                                return (
                                    <Character 
                                        key={charIndex}
                                        char={char}
                                        progress={scrollYProgress}
                                        range={[start, end]}
                                    />
                                );
                            })}
                        </span>
                        {" "}
                    </React.Fragment>
                );
            })}
        </p>
    );
};

const SMALL_IMAGE = 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260516_090123_74be96d4-9c1b-40cf-932a-96f4f4babed3.png&w=1280&q=85';
const LARGE_IMAGE = 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260516_090133_c157d30b-a99a-4477-bec1-a446149ec3f2.png&w=1280&q=85';

const NARRATIV_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260516_122702_390f5305-8719-41d5-ae80-d23ab3796c28.mp4';
const LUMINAR_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260516_123323_f909c2b8-ff6c-4edf-882b-8ebcdbe389b5.mp4';

export default function LandingPage() {
    const { user, role, logout } = useAuth();
    const [indiaTime, setIndiaTime] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Live India Time ticker
    useEffect(() => {
        const updateTime = () => {
            const formatter = new Intl.DateTimeFormat('en-GB', {
                timeZone: 'Asia/Kolkata',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            });
            setIndiaTime(formatter.format(new Date()));
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    // Scroll progress mappings for 3D Perspective Scroll animations
    const { scrollY } = useScroll();

    // 3D Parallax mappings for decorative icons in About Section
    const yMoon = useTransform(scrollY, [100, 2200], [0, -180]);
    const rotateMoon = useTransform(scrollY, [100, 2200], [0, 80]);
    const scaleMoon = useTransform(scrollY, [100, 2200], [1, 1.15]);

    const yLego = useTransform(scrollY, [100, 2200], [0, -250]);
    const rotateLego = useTransform(scrollY, [100, 2200], [0, -90]);
    const scaleLego = useTransform(scrollY, [100, 2200], [1, 0.9]);

    const yCube1 = useTransform(scrollY, [100, 2200], [0, -140]);
    const rotateCube1 = useTransform(scrollY, [100, 2200], [0, 110]);

    const yCube2 = useTransform(scrollY, [100, 2200], [0, -290]);
    const rotateCube2 = useTransform(scrollY, [100, 2200], [0, -70]);

    return (
        <div className="bg-[#fafffa] min-h-screen text-[#121613] selection:bg-[#2bee4b] selection:text-[#121613] font-twk-lausanne relative overflow-x-hidden">
            
            {/* Inject fade-in keyframes helper */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>

            {/* Nav Header — smooth opening load animation */}
            <FadeIn delay={0} y={-15} duration={0.8}>
                <header className="w-full max-w-[1440px] mx-auto px-6 sm:px-12 py-6 flex items-center justify-between border-b border-[#c8d2c8]/30 bg-[#fafffa]/80 backdrop-blur-sm sticky top-0 z-30">
                    {/* Wordmark logo wrapped in a magnet */}
                    <Magnet padding={80} strength={4}>
                        <Link to="/" className="text-lg font-bold tracking-tight select-none">
                            <span className="text-[#121613]">Trust</span>
                            <span className="text-[#2bee4b] ml-[2px]">Hire</span>
                        </Link>
                    </Magnet>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#about" className="text-sm font-light text-[#121613]/80 hover:text-[#121613] transition-colors">About</a>
                        <a href="#process" className="text-sm font-light text-[#121613]/80 hover:text-[#121613] transition-colors">Process</a>
                        <a href="#work" className="text-sm font-light text-[#121613]/80 hover:text-[#121613] transition-colors">Client Work</a>
                        
                        {user ? (
                            <>
                                <Link 
                                    to={role === 'recruiter' ? '/recruiter' : '/candidate'} 
                                    className="text-sm font-semibold hover:underline decoration-[#2bee4b] decoration-2 underline-offset-4"
                                >
                                    Dashboard
                                </Link>
                                <button 
                                    onClick={logout} 
                                    className="text-sm text-[#516254] hover:text-[#121613] transition-colors cursor-pointer"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm font-light hover:underline decoration-[#2bee4b] decoration-2 underline-offset-4">Login</Link>
                                <Link to="/signup" className="text-sm font-light hover:underline decoration-[#2bee4b] decoration-2 underline-offset-4">Sign Up</Link>
                            </>
                        )}
                    </div>

                    {/* Right menu indicator */}
                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex items-center gap-2 text-xs text-[#516254] select-none">
                            <Clock size={12} className="text-[#93b799]" />
                            <span>{indiaTime || '12:00'} IST</span>
                        </div>

                        {/* Menu button */}
                        <button 
                            onClick={() => setMobileMenuOpen(true)}
                            className="flex items-center gap-2 hover:opacity-75 focus:outline-none cursor-pointer"
                        >
                            <span className="text-sm font-light text-[#121613]">Menu</span>
                            <span className="text-[#2bee4b] font-bold text-sm tracking-tighter select-none">||</span>
                        </button>
                    </div>
                </header>
            </FadeIn>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex flex-col justify-between bg-[#fafffa] p-8"
                    >
                        <div className="flex justify-between items-center w-full">
                            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold tracking-tight">
                                <span className="text-[#121613]">Trust</span>
                                <span className="text-[#2bee4b] ml-[2px]">Hire</span>
                            </Link>
                            <button 
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-[#121613] hover:opacity-75 focus:outline-none"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <nav className="flex flex-col gap-6 text-3xl font-light font-editorial-new tracking-tight my-auto">
                            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#2bee4b] transition-colors">About our vision</a>
                            <a href="#process" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#2bee4b] transition-colors">The validation methodology</a>
                            <a href="#work" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#2bee4b] transition-colors">Client partnerships</a>
                            {user ? (
                                <>
                                    <Link to={role === 'recruiter' ? '/recruiter' : '/candidate'} onClick={() => setMobileMenuOpen(false)} className="hover:text-[#2bee4b] transition-colors">Go to Console</Link>
                                    <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-left text-[#516254] hover:text-[#121613]">Logout</button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#2bee4b] transition-colors">Account Access</Link>
                                    <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#2bee4b] transition-colors">Registration</Link>
                                </>
                            )}
                        </nav>

                        <div className="flex justify-between items-center text-xs text-[#516254] border-t border-[#c8d2c8]/30 pt-6">
                            <span>EST. 2026 &copy; TRUSTHIRE</span>
                            <span>{indiaTime || '12:00'} IN</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hero Section */}
            <section className="w-full max-w-[1440px] mx-auto px-6 sm:px-12 pt-16 sm:pt-24 pb-20 sm:pb-32">
                <div className="relative">
                    {/* Editorial Accent Line */}
                    <FadeIn delay={0.1} y={15} duration={0.8}>
                        <div className="w-[50px] h-[2px] bg-[#2bee4b] mb-12" />
                    </FadeIn>

                    {/* Huge Display Serif Headline — smooth opening load animation */}
                    <FadeIn delay={0.2} y={30} duration={0.9}>
                        <h1 className="font-editorial-new text-[clamp(2.5rem,7vw,120px)] font-light leading-[0.90] tracking-[-0.03em] text-[#121613] max-w-[1100px] select-none">
                            Explainable hiring for elite engineering teams
                        </h1>
                    </FadeIn>
                </div>

                {/* Asymmetric layout content */}
                <div className="mt-16 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-16 items-start">
                    {/* Left: Headline overlap details + Image */}
                    <div className="flex flex-col gap-10">
                        {/* Huge serif display part 2 */}
                        <FadeIn delay={0.35} y={20} duration={0.9}>
                            <div className="font-pp-mondwest text-[clamp(2rem,6vw,84px)] leading-[0.90] tracking-[-0.04em] text-[#121613] max-w-[700px] select-none">
                                Calculated grit. Zero bias.
                            </div>
                        </FadeIn>

                        {/* Large B&W Image overlapping asymmetric style */}
                        <FadeIn delay={0.5} y={25} duration={0.9}>
                            <div className="relative mt-4">
                                <img 
                                    src={LARGE_IMAGE} 
                                    alt="Platform dashboard engineering mockup" 
                                    className="w-full aspect-[16/10] rounded-[14px] object-cover filter grayscale contrast-[1.15] brightness-[0.98]"
                                />
                                {/* Times Caption */}
                                <div className="mt-3 font-times italic text-sm text-[#516254] max-w-sm">
                                    fig 1.1 — Calibration of non-traditional candidates showing core trajectory vectors.
                                </div>
                            </div>
                        </FadeIn>
                    </div>

                    {/* Right: Pitch paragraph + primary action button */}
                    <div className="lg:sticky lg:top-24 flex flex-col gap-10 lg:pl-10">
                        {/* Small decorative B&W portrait image */}
                        <FadeIn delay={0.4} y={20} duration={0.9} className="w-full max-w-[280px] self-start md:self-end lg:self-start">
                            <div>
                                <img 
                                    src={SMALL_IMAGE} 
                                    alt="Technical screening trajectory chart" 
                                    className="w-full aspect-[4/3] rounded-[14px] object-cover filter grayscale contrast-[1.2] brightness-[0.95]"
                                />
                                <div className="mt-2 font-times italic text-xs text-[#516254]">
                                    fig 1.2 — Multi-factor grit index parsing.
                                </div>
                            </div>
                        </FadeIn>

                        <FadeIn delay={0.55} y={15} duration={0.8}>
                            <p className="text-[#121613]/90 text-[16px] leading-[1.4] tracking-[0.01em] max-w-md font-light">
                                TrustHire replaces keywords with verified trajectories. By mapping independent college portfolios, competitive exams (UPSC/GATE), and live skill checks, we identify high-grit talent that traditional applicant tracking systems filter out.
                            </p>
                        </FadeIn>

                        {/* Voltage Button wrapped in Magnet */}
                        <FadeIn delay={0.65} y={15} duration={0.8}>
                            <div className="mt-4">
                                <Magnet padding={100} strength={4}>
                                    {user ? (
                                        <Link 
                                            to={role === 'recruiter' ? '/recruiter' : '/candidate'}
                                            className="inline-flex items-center justify-center bg-[#2bee4b] text-[#121613] font-twk-lausanne font-bold tracking-[0.01em] uppercase text-sm px-10 py-5 rounded-[10px] shadow-[rgba(16,94,29,0.45)_1px_8px_20px_0px,rgba(18,146,39,0.25)_1px_8px_20px_0px] hover:opacity-95 transition-all select-none gap-3"
                                        >
                                            <span>Access Platform Console</span>
                                            <span>→</span>
                                        </Link>
                                    ) : (
                                        <Link 
                                            to="/signup"
                                            className="inline-flex items-center justify-center bg-[#2bee4b] text-[#121613] font-twk-lausanne font-bold tracking-[0.01em] uppercase text-sm px-10 py-5 rounded-[10px] shadow-[rgba(16,94,29,0.45)_1px_8px_20px_0px,rgba(18,146,39,0.25)_1px_8px_20px_0px] hover:opacity-95 transition-all select-none gap-3"
                                        >
                                            <span>Inquire for Demo Access</span>
                                            <span>→</span>
                                        </Link>
                                    )}
                                </Magnet>
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </section>

            {/* Premium Trusted By Logo Grid Section */}
            <section className="w-full max-w-[1440px] mx-auto px-6 sm:px-12 py-16 border-t border-b border-[#c8d2c8]/30 relative select-none mb-12">
                <div className="text-[10px] text-[#516254] uppercase tracking-widest text-center mb-12 font-semibold">
                    Validated by engineering divisions across global enterprises
                </div>
                
                <motion.div 
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={{
                        hidden: { opacity: 0 },
                        show: {
                            opacity: 1,
                            transition: { staggerChildren: 0.03 }
                        }
                    }}
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-8 gap-y-10 items-center justify-items-center text-[#516254]/50"
                >
                    {[
                        {
                            name: "Google",
                            svg: (
                                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                            )
                        },
                        {
                            name: "Microsoft",
                            svg: (
                                <svg viewBox="0 0 23 23" className="h-5 w-5" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="0" y="0" width="11" height="11"/>
                                    <rect x="12" y="0" width="11" height="11"/>
                                    <rect x="0" y="12" width="11" height="11"/>
                                    <rect x="12" y="12" width="11" height="11"/>
                                </svg>
                            )
                        },
                        {
                            name: "Amazon",
                            svg: (
                                <svg viewBox="0 0 76 22" className="h-[22px] w-[76px]" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M13.407 15.65c-.15 1.155-1.127 2.008-2.376 2.008-1.485 0-2.408-1.023-2.408-2.54 0-1.585.99-2.54 2.408-2.54 1.27 0 2.22.823 2.376 1.916v1.156zm-2.247-5.07c-2.475 0-4.492 1.83-4.492 4.417 0 2.483 1.947 4.298 4.492 4.298 1.988 0 3.51-1.222 3.908-2.88v1.94h3.914V9.65h-3.914v1.2c-.443-.883-1.635-1.27-3.908-1.27zm19.824 1.488V9.65h-3.915v1.2c-.442-.883-1.634-1.27-3.908-1.27-2.475 0-4.492 1.83-4.492 4.417 0 2.483 1.947 4.298 4.492 4.298 1.987 0 3.51-1.222 3.908-2.88v2.88h3.915V12.068zm-2.247 3.582c-.15 1.155-1.127 2.008-2.376 2.008-1.485 0-2.408-1.023-2.408-2.54 0-1.585.99-2.54 2.408-2.54 1.27 0 2.22.823 2.376 1.916V15.65zm16.59-6H41.413V15.4c0 1.223.593 1.83 1.642 1.83a3.528 3.528 0 001.275-.24v-3.08h1.27c1.357 0 2.212-.823 2.377-1.917v-2.343zm-1.84 3.738c-.149 1.155-1.127 2.008-2.376 2.008-1.485 0-2.408-1.023-2.408-2.54 0-1.585.99-2.54 2.408-2.54 1.27 0 2.22.823 2.376 1.916v1.156zM56.41 9.65c-2.475 0-4.492 1.83-4.492 4.417 0 2.483 1.947 4.298 4.492 4.298 2.475 0 4.493-1.815 4.493-4.298 0-2.587-2.018-4.417-4.493-4.417zm0 6.783c-1.485 0-2.408-1.023-2.408-2.54 0-1.585.99-2.54 2.408-2.54s2.408 1.023 2.408 2.54c0 1.517-.99 2.54-2.408 2.54zm14.116-6.783c-2.28 0-3.465 1.237-3.908 2.475V9.65h-3.914v8.9h3.914v-5.2c0-1.946.99-2.73 2.408-2.73.15 0 .3.007.45.022V9.65h1.05z"/>
                                    <path d="M72.032 18.06c-19.467 11.238-51.273 14.86-70.528 6.845-.595-.247-1.11-.12-1.393.428-.27.525-.13 1.077.462 1.32 19.98 8.1 52.88 4.223 72.84-7.29a1.002 1.002 0 00-.285-1.445 1.008 1.008 0 00-1.096.143z"/>
                                    <path d="M73.493 15.65c-.886.15-2.115 1.077-2.398 2.443-.135.683.136 1.275.683 1.492l4.225 1.71c.548.217 1.155.083 1.424-.442.75-1.222 1.02-2.903.352-4.043-.548-.908-1.916-1.573-4.286-1.66z"/>
                                </svg>
                            )
                        },
                        {
                            name: "Apple",
                            svg: (
                                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.56 2.95-1.39z"/>
                                </svg>
                            )
                        },
                        {
                            name: "Meta",
                            svg: (
                                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M16.273 6c-1.954 0-3.535 1.077-4.273 2.682-.738-1.605-2.319-2.682-4.273-2.682C4.566 6 2 8.441 2 11.455c0 3.014 2.566 5.455 5.727 5.455 1.954 0 3.535-1.077 4.273-2.682.738 1.605 2.319 2.682 4.273 2.682C19.434 16.91 22 14.469 22 11.455c0-3.014-2.566-5.455-5.727-5.455zm0 9.09c-2.11 0-3.818-1.625-3.818-3.635s1.708-3.636 3.818-3.636S20.09 9.444 20.09 11.455 18.383 15.09 16.273 15.09zm-8.546 0c-2.11 0-3.818-1.625-3.818-3.635s1.708-3.636 3.818-3.636 3.818 1.625 3.818 3.636-1.708 3.635-3.818 3.635z"/>
                                </svg>
                            )
                        },
                        {
                            name: "NVIDIA",
                            svg: (
                                <svg viewBox="0 0 100 100" className="h-6 w-6" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M50 20h30v30H50z"/>
                                    <path d="M50 20c-16.5 0-30 13.5-30 30s13.5 30 30 30h30V70H50c-11 0-20-9-20-20s9-20 20-20c5.5 0 10.5 2.2 14.1 5.9L75 55c1.2-1.5 2-3.4 2-5.5 0-5.5-4.5-10-10-10H50c-5.5 0-10 4.5-10 10s4.5 10 10 10c2.8 0 5.3-1.1 7.1-2.9L64 71c-3.6 2.5-8 4-14 4-13.8 0-25-11.2-25-25s11.2-25 25-25c7.3 0 13.9 3.1 18.5 8.1l7.1-7.1C68.6 24.3 60 20 50 20z" fillRule="evenodd"/>
                                </svg>
                            )
                        },
                        {
                            name: "IBM",
                            svg: (
                                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0 2h7.2v1.8H0V2zm8.4 0h7.2v1.8H8.4V2zm8.4 0H24v1.8h-7.2V2zm-16.8 3.6h7.2v1.8H0V5.6zm8.4 0h7.2v1.8H8.4V5.6zm8.4 0H24v1.8h-7.2V5.6zM0 9.2h7.2v1.8H0V9.2zm8.4 0h7.2v1.8H8.4V9.2zm8.4 0H24v1.8h-7.2V9.2zm-16.8 3.6h7.2v1.8H0v-1.8zm8.4 0h7.2v1.8H8.4v-1.8zm8.4 0H24v1.8h-7.2v-1.8zM0 16.4h7.2v1.8H0v-1.8zm8.4 0h7.2v1.8H8.4v-1.8zm8.4 0H24v1.8h-7.2v-1.8zm-16.8 3.6h7.2v1.8H0v-1.8zm8.4 0h7.2v1.8H8.4v-1.8zm8.4 0H24v1.8h-7.2v-1.8z" />
                                </svg>
                            )
                        },
                        {
                            name: "Oracle",
                            svg: (
                                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12.002 6.136c-3.235 0-5.753 2.188-5.753 4.864 0 2.676 2.518 4.864 5.753 4.864s5.753-2.188 5.753-4.864c0-2.676-2.518-4.864-5.753-4.864zm0 6.955c-1.574 0-2.852-1.07-2.852-2.091 0-1.021 1.278-2.091 2.852-2.091s2.852 1.07 2.852 2.091c0 1.021-1.278 2.091-2.852 2.091zm9.18-6.955h2.818v9.728h-2.818V6.136z" />
                                </svg>
                            )
                        },
                        {
                            name: "Intel",
                            svg: (
                                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0 4.2h3v1.8H0V4.2zm0 3.6h3V20H0V7.8zm4.8 0h3v1.8h.1c.5-1.2 1.6-2.1 3.2-2.1 2.8 0 3.3 1.8 3.3 4.1V20h-3v-7.8c0-1.2-.2-2.1-1.6-2.1-1.4 0-1.7.9-1.7 2.1V20h-3V7.8zm14.1.3h-2.1V5.7h-3V7.8h-1.5v2.4h1.5V17c0 2 1.1 3 3 3h2.1v-2.7h-1.2c-.8 0-1.2-.3-1.2-1.1V10.2h2.4V8.1zm2.3 6.1c0 3.3 2 5.9 5.5 5.9 2 0 3.6-.9 4.3-2.1h.1v1.8h3V4.2h-3V10c-.7-1.2-2.3-2.1-4.3-2.1-3.5 0-5.6 2.6-5.6 5.9zm3 0c0-2.1 1.2-3.6 2.9-3.6 1.7 0 2.9 1.5 2.9 3.6s-1.2 3.6-2.9 3.6c-1.7 0-2.9-1.5-2.9-3.6z"/>
                                </svg>
                            )
                        },
                        {
                            name: "Cisco",
                            svg: (
                                <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 10h1v4H1v-4zm3-3h1v7H4V7zm3-3h1v10H7V4zm3 3h1v7h-1V7zm3-3h1v10h-1V4zm3 3h1v7h-1V7zm3-3h1v10h-1V4zm3 6h1v4h-1v-4z" />
                                </svg>
                            )
                        },
                        {
                            name: "Deloitte",
                            svg: (
                                <svg viewBox="0 0 115 30" className="h-5 w-[77px]" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M19.2 6.9c-2.5 0-4.3 1-5.1 2.8V.2H9.3v21.3h4.6V12.2c0-3.1 1.6-4.6 4-4.6 2.3 0 3.7 1.4 3.7 3.9v9.8h4.8v-11c.1-4.9-2.9-7.4-7.2-7.4zm16.9 14.9c4.2 0 7.3-3.1 7.3-7.3s-3.1-7.3-7.3-7.3-7.3 3.1-7.3 7.3 3 7.3 7.3 7.3zm0-11c2.1 0 3.1 1.6 3.1 3.7s-1 3.7-3.1 3.7c-2 0-3.1-1.6-3.1-3.7s1.1-3.7 3.1-3.7zm11.2-10.6H42.5v21.3h4.8V.2zm12.3 7.1c0-.9-.7-1.5-1.5-1.5-.9 0-1.5.6-1.5 1.5s.6 1.5 1.5 1.5c.8-.1 1.5-.7 1.5-1.5zm-3.9 3.5h4.8v10.7h-4.8V10.8zm14.3 7.1c0 1 .6 1.5 1.5 1.5.8 0 1.5-.5 1.5-1.5v-7.1h-4.5V10.8h4.5V5.5l4.8-1.5v6.8h3.2v3.2h-3.2v6.6c0 2.2.9 3.5 3.3 3.5.7 0 1.4-.1 1.8-.3V28c-.8.3-2 .5-3.2.5-3.8 0-6.7-1.8-6.7-5.9v-4.7h-3V17.9zm19.9-.1c0 1 .6 1.5 1.5 1.5.8 0 1.5-.5 1.5-1.5v-7.1h-4.5V10.8h4.5V5.5l4.8-1.5v6.8h3.2v3.2h-3.2v6.6c0 2.2.9 3.5 3.3 3.5.7 0 1.4-.1 1.8-.3V28c-.8.3-2 .5-3.2.5-3.8 0-6.7-1.8-6.7-5.9v-4.7h-3V17.9zm13 2.9c.1-1.8.9-3.2 2.6-3.2s2.5 1.4 2.5 3.2h-5.1zm5.2 2c0-3.4-1.9-5.3-4.8-5.3-3.1 0-5.2 2-5.2 5.1s2 5.1 5.2 5.1c2 0 3.7-.6 4.7-1.4l-.7-2.6c-.8.5-2.2.9-3.5.9-1.9 0-3.1-1.1-3.2-2.7l9.7-.1c-.1-.3-.1-.7-.1-1zm6.9-3.3c0 2.4 2 4.4 4.4 4.4s4.4-2 4.4-4.4-2-4.4-4.4-4.4-4.4 2-4.4 4.4z"/>
                                    <circle cx="110" cy="18.5" r="4.2"/>
                                </svg>
                            )
                        },
                        {
                            name: "Accenture",
                            svg: (
                                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 4l12 8-12 8v-4l6-4-6-4V4z"/>
                                </svg>
                            )
                        },
                        {
                            name: "TCS",
                            svg: (
                                <svg viewBox="0 0 120 30" className="h-5 w-[80px]" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <text x="0" y="22" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="22" letterSpacing="2">TATA</text>
                                    <text x="75" y="22" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="300" fontSize="14" letterSpacing="0.5">TCS</text>
                                </svg>
                            )
                        },
                        {
                            name: "Infosys",
                            svg: (
                                <svg viewBox="0 0 120 30" className="h-[22px] w-[88px]" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <text x="0" y="22" fontFamily="sans-serif" fontWeight="bold" fontSize="24" letterSpacing="0">Infosys</text>
                                </svg>
                            )
                        },
                        {
                            name: "Wipro",
                            svg: (
                                <svg viewBox="0 0 100 30" className="h-5 w-[67px]" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <text x="0" y="22" fontFamily="sans-serif" fontWeight="bold" fontSize="24" letterSpacing="-0.5">wipro</text>
                                </svg>
                            )
                        },
                        {
                            name: "HCLTech",
                            svg: (
                                <svg viewBox="0 0 120 30" className="h-5 w-[80px]" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <text x="0" y="22" fontFamily="sans-serif" fontWeight="900" fontSize="22" letterSpacing="0.5">HCLTech</text>
                                </svg>
                            )
                        },
                        {
                            name: "Zoho",
                            svg: (
                                <svg viewBox="0 0 120 30" className="h-5 w-[80px]" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="0" y="5" width="16" height="16" rx="2" />
                                    <text x="25" y="22" fontFamily="sans-serif" fontWeight="bold" fontSize="20" letterSpacing="1">ZOHO</text>
                                </svg>
                            )
                        },
                        {
                            name: "Flipkart",
                            svg: (
                                <svg viewBox="0 0 120 30" className="h-5 w-[80px]" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2C9.2 2 7 4.2 7 7h10c0-2.8-2.2-5-5-5zm5 5H7v2h10V7zm1 4H6v12h12V11z"/>
                                    <text x="28" y="22" fontFamily="sans-serif" fontWeight="bold" fontSize="20">Flipkart</text>
                                </svg>
                            )
                        },
                        {
                            name: "Razorpay",
                            svg: (
                                <svg viewBox="0 0 120 30" className="h-5 w-[80px]" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <polygon points="5,25 20,5 25,5 10,25"/>
                                    <text x="32" y="22" fontFamily="sans-serif" fontWeight="bold" fontSize="20" letterSpacing="-0.5">Razorpay</text>
                                </svg>
                            )
                        },
                        {
                            name: "Swiggy",
                            svg: (
                                <svg viewBox="0 0 120 30" className="h-5 w-[80px]" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <text x="0" y="22" fontFamily="sans-serif" fontWeight="bold" fontSize="22">SWIGGY</text>
                                </svg>
                            )
                        },
                        {
                            name: "Zomato",
                            svg: (
                                <svg viewBox="0 0 100 30" className="h-5 w-[67px]" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <text x="0" y="22" fontFamily="sans-serif" fontWeight="bold" fontSize="22" letterSpacing="-0.5">zomato</text>
                                </svg>
                            )
                        }
                    ].map((logo) => (
                        <motion.div 
                            key={logo.name}
                            variants={{
                                hidden: { opacity: 0, y: 15 },
                                show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 14 } }
                            }}
                            className="w-full flex items-center justify-center h-12 transition-all duration-300 select-none cursor-pointer text-[#516254]/50 hover:text-[#121613]"
                            aria-label={`${logo.name} logo`}
                            title={logo.name}
                        >
                            {logo.svg}
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* About Vision Section with 3D Parallax Scroll elements */}
            <section id="about" className="w-full max-w-[1440px] mx-auto px-6 sm:px-12 py-20 sm:py-32 border-t border-[#c8d2c8]/30 relative overflow-hidden">
                
                {/* 3D Decorative Floating Elements with 3D Parallax Scroll */}
                <motion.div 
                    style={{ y: yMoon, rotate: rotateMoon, scale: scaleMoon, rotateX: 10, rotateY: 15 }} 
                    className="absolute top-[8%] left-[2%] z-0 pointer-events-none opacity-20 hidden md:block"
                >
                    <img 
                        src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/moon_icon.11395d36.png" 
                        className="w-[140px] h-auto object-contain" 
                        alt="3D moon block" 
                    />
                </motion.div>

                <motion.div 
                    style={{ y: yLego, rotate: rotateLego, scale: scaleLego, rotateX: -15, rotateY: 10 }} 
                    className="absolute bottom-[10%] left-[8%] z-0 pointer-events-none opacity-15 hidden md:block"
                >
                    <img 
                        src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/p59_1.4659672e.png" 
                        className="w-[120px] h-auto object-contain" 
                        alt="3D sphere grid" 
                    />
                </motion.div>

                <motion.div 
                    style={{ y: yCube1, rotate: rotateCube1, rotateX: 15, rotateY: -10 }} 
                    className="absolute top-[5%] right-[2%] z-0 pointer-events-none opacity-20 hidden md:block"
                >
                    <img 
                        src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/lego_icon-1.703bb594.png" 
                        className="w-[140px] h-auto object-contain" 
                        alt="3D lego element" 
                    />
                </motion.div>

                <motion.div 
                    style={{ y: yCube2, rotate: rotateCube2, rotateX: -10, rotateY: -15 }} 
                    className="absolute bottom-[5%] right-[6%] z-0 pointer-events-none opacity-15 hidden md:block"
                >
                    <img 
                        src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/Group_134-1.2e04f3ce.png" 
                        className="w-[150px] h-auto object-contain" 
                        alt="3D geometric nodes block" 
                    />
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-[0.4fr_1.6fr] gap-8 lg:gap-16 items-start relative z-10">
                    {/* Index marker */}
                    <FadeIn className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#121613] text-[#fafffa] font-mono text-xs flex items-center justify-center">01</div>
                        <span className="text-xs uppercase tracking-widest font-semibold text-[#516254]">The Vision</span>
                    </FadeIn>

                    <div className="flex flex-col gap-12">
                        {/* Subheading */}
                        <FadeIn>
                            <h2 className="font-editorial-new text-[clamp(2rem,5vw,72px)] font-light leading-[0.95] tracking-[-0.02em] text-[#121613] max-w-[800px]">
                                India's workspace demands a grit-calibrated evaluation funnel.
                            </h2>
                        </FadeIn>

                        {/* Animated character reveal paragraph */}
                        <div className="max-w-[800px]">
                            <AnimatedText text="Traditional search models rely heavily on pedigree filters, excluding tier-2/3 grit profiles that possess deep practical competence. TrustHire builds bias-free shortlists by locking user identifiers and analyzing raw technical trajectory maps. Our platform processes candidate submissions via explainable match vectors. Recruiters receive rich semantic reasons for shortlists, allowing them to verify structural talent depth over shallow formatting markers." />
                        </div>
                    </div>
                </div>
            </section>

            {/* Methodology Process Section */}
            <section id="process" className="w-full max-w-[1440px] mx-auto px-6 sm:px-12 py-20 sm:py-32 border-t border-[#c8d2c8]/30">
                <div className="grid grid-cols-1 lg:grid-cols-[0.4fr_1.6fr] gap-8 lg:gap-16 items-start">
                    {/* Index marker */}
                    <FadeIn className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#121613] text-[#fafffa] font-mono text-xs flex items-center justify-center">02</div>
                        <span className="text-xs uppercase tracking-widest font-semibold text-[#516254]">The Process</span>
                    </FadeIn>

                    <div className="flex flex-col gap-12 w-full">
                        <FadeIn>
                            <h2 className="font-editorial-new text-[clamp(2rem,5vw,72px)] font-light leading-[0.95] tracking-[-0.02em] text-[#121613] max-w-[800px]">
                                Systematic credential validation.
                            </h2>
                        </FadeIn>

                        {/* Process cards in Linen Style */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mt-4">
                            {[
                                { num: "01", name: "JD Extraction", desc: "Creation of structured role profiles mapping core skills, latent capacity, and engineering requirements." },
                                { num: "02", name: "Resume Parse", desc: "Algorithmic parsing of experience profiles to isolate work timelines and project contributions." },
                                { num: "03", name: "Trajectory Pathing", desc: "Career-growth modeling designed to calculate engineering grit, self-study vectors, and growth rate." },
                                { num: "04", name: "Tier Calibration", desc: "Special India adjustments accounting for competitive prep (GATE/UPSC) and Tier-2/3 college portfolios." },
                                { num: "05", name: "Bias Shield", desc: "Candidate identity locking to shield technical hiring managers from unconscious demographic bias." }
                            ].map((step, idx) => (
                                <FadeIn key={idx} delay={idx * 0.08}>
                                    <div className="bg-[#fafffa] rounded-[14px] p-6 border border-[#c8d2c8]/40 hover:border-[#121613] transition-all flex flex-col gap-6 h-full">
                                        <span className="font-pp-mondwest text-4xl text-[#93b799] font-light">{step.num}</span>
                                        <div className="flex flex-col gap-2">
                                            <h3 className="text-sm font-semibold tracking-tight text-[#121613] uppercase">{step.name}</h3>
                                            <p className="text-xs text-[#516254] leading-relaxed font-light">{step.desc}</p>
                                        </div>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Client Partnerships Section */}
            <section id="work" className="w-full max-w-[1440px] mx-auto px-6 sm:px-12 py-20 sm:py-32 border-t border-[#c8d2c8]/30">
                <div className="grid grid-cols-1 lg:grid-cols-[0.4fr_1.6fr] gap-8 lg:gap-16 items-start">
                    {/* Index marker */}
                    <FadeIn className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#121613] text-[#fafffa] font-mono text-xs flex items-center justify-center">03</div>
                        <span className="text-xs uppercase tracking-widest font-semibold text-[#516254]">Partnerships</span>
                    </FadeIn>

                    <div className="flex flex-col gap-12 w-full">
                        <FadeIn>
                            <h2 className="font-editorial-new text-[clamp(2rem,5vw,72px)] font-light leading-[0.95] tracking-[-0.02em] text-[#121613] max-w-[800px]">
                                Vetted outcomes.
                            </h2>
                        </FadeIn>

                        {/* Asymmetric Case Studies Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                            
                            {/* Narrativ */}
                            <FadeIn delay={0.1}>
                                <div className="flex flex-col gap-4">
                                    <div className="relative aspect-[4/3] rounded-[14px] overflow-hidden bg-[#121613]">
                                        <video 
                                            src={NARRATIV_VIDEO} 
                                            autoPlay 
                                            muted 
                                            loop 
                                            playsInline 
                                            className="w-full h-full object-cover filter grayscale contrast-[1.2]"
                                        />
                                        {/* Small Green Tick */}
                                        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#2bee4b]" />
                                    </div>
                                    <div className="flex justify-between items-start mt-2">
                                        <div>
                                            <h3 className="text-base font-semibold text-[#121613]">JD Semantics — Narrativ</h3>
                                            <p className="text-xs text-[#516254] font-light mt-1">Vetted semantic match engine highlighting non-obvious candidates.</p>
                                        </div>
                                        <span className="text-xs font-mono text-[#93b799] uppercase">HRTECH 2025</span>
                                    </div>
                                </div>
                            </FadeIn>

                            {/* Option 2: Luminar */}
                            <FadeIn delay={0.25} className="md:mt-12">
                                <div className="flex flex-col gap-4">
                                    <div className="relative aspect-[4/3] rounded-[14px] overflow-hidden bg-[#121613]">
                                        <video 
                                            src={LUMINAR_VIDEO} 
                                            autoPlay 
                                            muted 
                                            loop 
                                            playsInline 
                                            className="w-full h-full object-cover filter grayscale contrast-[1.2]"
                                        />
                                        {/* Small Green Tick */}
                                        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#2bee4b]" />
                                    </div>
                                    <div className="flex justify-between items-start mt-2">
                                        <div>
                                            <h3 className="text-base font-semibold text-[#121613]">Grit Calibration — Luminar</h3>
                                            <p className="text-xs text-[#516254] font-light mt-1">Calibrated filters for regional engineering talent acquisition.</p>
                                        </div>
                                        <span className="text-xs font-mono text-[#93b799] uppercase">CASE STUDY</span>
                                    </div>
                                </div>
                            </FadeIn>

                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#121613] text-[#fafffa] py-16 px-6 sm:px-12 mt-20">
                <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8 border-b border-[#fafffa]/10 pb-12">
                    <div className="flex flex-col gap-3">
                        <span className="text-lg font-bold tracking-tight">
                            <span className="text-[#fafffa]">Trust</span>
                            <span className="text-[#2bee4b] ml-[2px]">Hire</span>
                        </span>
                        <p className="text-xs text-[#516254]/80 max-w-xs font-light">
                            Vetted trajectories for India's scaling software engineering divisions.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-x-12 gap-y-6 text-xs text-[#516254]">
                        <a href="#about" className="hover:text-[#fafffa] transition-colors">Philosophy</a>
                        <a href="#process" className="hover:text-[#fafffa] transition-colors">Validation</a>
                        <a href="#work" className="hover:text-[#fafffa] transition-colors">Outcome</a>
                        <Link to="/login" className="hover:text-[#fafffa] transition-colors">Developer Portal</Link>
                    </div>
                </div>

                <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row justify-between items-center pt-8 text-[11px] text-[#516254] tracking-wider uppercase font-mono gap-4">
                    <span>EST. 2026 &copy; TRUSTHIRE INC.</span>
                    <span>ALL IMAGERY DESATURATED FOR BRAND INTEGRITY</span>
                </div>
            </footer>

        </div>
    );
}
