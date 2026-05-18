import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';

const SPOTLIGHT_R = 260;
const GRID_CELL = 48;

interface RevealLayerProps {
  cursorX: number;
  cursorY: number;
  bgImage2: string;
}

const RevealLayer: React.FC<RevealLayerProps> = ({ cursorX, cursorY, bgImage2 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskedDivRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const gradient = ctx.createRadialGradient(cursorX, cursorY, 0, cursorX, cursorY, SPOTLIGHT_R);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.4, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.6, 'rgba(255,255,255,0.75)');
    gradient.addColorStop(0.75, 'rgba(255,255,255,0.4)');
    gradient.addColorStop(0.88, 'rgba(255,255,255,0.12)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cursorX, cursorY, SPOTLIGHT_R, 0, Math.PI * 2);
    ctx.fill();

    try {
      const dataUrl = canvas.toDataURL();
      if (maskedDivRef.current) {
        maskedDivRef.current.style.maskImage = `url(${dataUrl})`;
        maskedDivRef.current.style.webkitMaskImage = `url(${dataUrl})`;
      }
    } catch (e) {
      console.error("Canvas mask creation failed:", e);
    }
  });

  return (
    <>
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="hidden"
      />
      <div
        ref={maskedDivRef}
        className="absolute inset-0 bg-center bg-cover bg-no-repeat z-30 pointer-events-none"
        style={{
          backgroundImage: `url(${bgImage2})`,
          maskSize: '100% 100%',
          WebkitMaskSize: '100% 100%',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
        }}
      />
    </>
  );
};

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('Home');
  const navItems = ['Home', 'Design', 'Performance', 'Specs'];

  // Universal Asset Paths
  const image2 = '/assets/image-2.png';
  const image4 = '/assets/image-4.png';
  const image5 = '/assets/image-5.png';
  const image9 = '/assets/image-9.png';
  const image10 = '/assets/image-10.png';
  const image11 = '/assets/image-11.png';
  const image12 = '/assets/image-12.png';

  const sectionRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const smoothRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const gridOffsetRef = useRef({ x: 0, y: 0 });
  const patternRef = useRef<SVGPatternElement | null>(null);

  const [cursorPos, setCursorPos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  // Carousel Active index state (Section 3: Fluidity)
  const [activeCard, setActiveCard] = useState(0);

  // Exterior customizer state variables (Section 4: Configure)
  const [configPaint, setConfigPaint] = useState({
    name: 'Midnight Stealth',
    shortName: 'Stealth',
    hex: '#111827',
    accent: '#38bdf8',
    filter: 'grayscale(0.9) brightness(0.65) contrast(1.25) saturate(0.8)',
    price: 0
  });

  const paints = [
    {
      name: 'Apex Sky Blue',
      shortName: 'Aero',
      hex: '#0369a1',
      accent: '#06b6d4',
      filter: 'hue-rotate(190deg) saturate(1.5) brightness(0.75) contrast(1.1)',
      price: 2000
    },
    {
      name: 'Midnight Stealth',
      shortName: 'Stealth',
      hex: '#111827',
      accent: '#38bdf8',
      filter: 'grayscale(0.9) brightness(0.65) contrast(1.25) saturate(0.8)',
      price: 0
    },
    {
      name: 'Solaris Crimson',
      shortName: 'Crimson',
      hex: '#7f1d1d',
      accent: '#ef4444',
      filter: 'hue-rotate(330deg) saturate(1.8) brightness(0.7) contrast(1.1)',
      price: 2500
    },
    {
      name: 'Aurora Bronze Gold',
      shortName: 'Bronze',
      hex: '#451a03',
      accent: '#f59e0b',
      filter: 'hue-rotate(25deg) saturate(1.3) brightness(0.68) contrast(1.05)',
      price: 3000
    }
  ];

  // Cockpit view config states (Section 5: Interior)
  const [cockpitMode, setCockpitMode] = useState<'pilot' | 'lounge'>('pilot');

  useEffect(() => {
    let animationId: number;
    const tick = () => {
      const rect = sectionRef.current?.getBoundingClientRect();
      if (rect) {
        smoothRef.current.x += (mouseRef.current.x - smoothRef.current.x) * 0.1;
        smoothRef.current.y += (mouseRef.current.y - smoothRef.current.y) * 0.1;

        const cx = (smoothRef.current.x - rect.left) / rect.width - 0.5;
        const cy = (smoothRef.current.y - rect.top) / rect.height - 0.5;

        gridOffsetRef.current.x += (cx * 16 - gridOffsetRef.current.x) * 0.06;
        gridOffsetRef.current.y += (cy * 16 - gridOffsetRef.current.y) * 0.06;

        if (patternRef.current) {
          patternRef.current.setAttribute('x', gridOffsetRef.current.x.toString());
          patternRef.current.setAttribute('y', gridOffsetRef.current.y.toString());
        }

        setCursorPos({ x: smoothRef.current.x, y: smoothRef.current.y });
      }
      animationId = requestAnimationFrame(tick);
    };

    animationId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationId);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
  };

  // Section 3: Fluidity card definitions
  const carouselCards = [
    {
      img: image9,
      tag: "Ultra-Fast Charging",
      desc: "Add up to 200 miles of range in just 15 minutes of charging."
    },
    {
      img: image10,
      tag: "Aerodynamic Efficiency",
      desc: "A drag coefficient of just 0.19 ensures maximum range and stability."
    },
    {
      img: image11,
      tag: "Intelligent Cockpit",
      desc: "A highly responsive interface designed around the driver."
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white antialiased" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Fixed Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 sm:px-8 py-4 sm:py-5 backdrop-blur-md bg-zinc-950/20 border-b border-zinc-900/50">
        <div className="flex items-center">
          <img src="/assets/logoo.png" alt="PureFlow Logo" className="h-6 w-auto object-contain" />
        </div>

        {/* Center Nav */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-800 rounded-full px-2 py-1.5 items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => setActiveItem(item)}
              className={`${
                activeItem === item
                  ? 'bg-white text-zinc-950 text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-wider'
                  : 'text-zinc-400 text-xs font-semibold px-4 py-1.5 rounded-full hover:text-white transition-colors uppercase tracking-wider'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* CTA Section */}
        <div className="hidden md:flex items-center gap-5">
          <a href="#configurator" className="bg-white text-zinc-950 text-xs font-semibold px-5 py-2.5 rounded-none hover:bg-zinc-200 transition-colors uppercase tracking-wider">
            Test Drive
          </a>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white p-1 hover:bg-zinc-900 rounded-full transition-colors"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-zinc-950 pt-20 pb-6 px-5 border-b border-zinc-900 flex flex-col gap-1 md:hidden">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => {
                setActiveItem(item);
                setMenuOpen(false);
              }}
              className="text-zinc-200 text-sm font-semibold py-3 border-b border-zinc-900 text-left hover:text-white transition-colors uppercase tracking-wider"
            >
              {item}
            </button>
          ))}
          <a
            href="#configurator"
            onClick={() => setMenuOpen(false)}
            className="mt-4 bg-white text-zinc-950 text-sm font-semibold px-5 py-3 rounded-none flex items-center justify-center hover:bg-zinc-200 transition-colors uppercase tracking-wider"
          >
            Test Drive
          </a>
        </div>
      )}

      {/* SECTION 1: HERO SPOTLIGHT REVEAL */}
      <section
        ref={sectionRef}
        onMouseMove={handleMouseMove}
        className="relative w-full overflow-hidden"
        style={{ height: '100vh' }}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-10">
          <defs>
            <pattern
              id="grid"
              width={GRID_CELL}
              height={GRID_CELL}
              patternUnits="userSpaceOnUse"
              ref={patternRef}
            >
              <path
                d={`M ${GRID_CELL} 0 L 0 0 0 ${GRID_CELL}`}
                fill="none"
                stroke="#64748b"
                strokeWidth="0.6"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Hero Background Underneath */}
        <div
          className="absolute inset-0 bg-center bg-cover bg-no-repeat z-10"
          style={{ backgroundImage: `url('/assets/hero.png')` }}
        />

        <RevealLayer cursorX={cursorPos.x} cursorY={cursorPos.y} bgImage2="/assets/hover.png" />

        {/* Text Overlay exactly aligned with layout */}
        <div className="absolute bottom-16 left-5 right-5 sm:left-8 sm:right-8 md:left-12 md:right-12 z-50 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-[1.1] mb-5 tracking-tight uppercase">
              Drive Further.<br />Emit Nothing.
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm md:text-base leading-relaxed max-w-xl">
              A high-performance electric vehicle designed to blend elegance with endurance.
            </p>
          </div>
          <div>
            <a
              href="#configurator"
              className="inline-flex bg-white text-zinc-950 text-xs sm:text-sm font-semibold px-8 py-3.5 rounded-none hover:bg-zinc-200 transition-colors uppercase tracking-wider"
            >
              Test Drive
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 2: ABOUT US & PLAY OVERLAY */}
      <section className="relative py-24 sm:py-32 px-5 sm:px-8 border-t border-zinc-900/60 overflow-hidden bg-zinc-950 select-none">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div>
            <span className="text-xs font-mono font-bold tracking-[0.3em] text-sky-400 uppercase block mb-4">ABOUT US</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-light text-zinc-100 tracking-tight leading-relaxed max-w-3xl mx-auto normal-case">
            More machined energy from cell chemistry to chassis. Our solid-state architecture removes heat and dependency at the source, delivering a driving experience closer to a precision instrument than a commuter car.
          </h2>
          <div className="w-full rounded-none border border-zinc-900 overflow-hidden bg-zinc-900/10 relative group">
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <button className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-zinc-950 shadow-2xl transition-all duration-300 hover:scale-110 hover:bg-white pl-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
            </div>
            <img
              src={image2}
              alt="Wind Tunnel Dynamics"
              className="w-full h-auto object-cover max-h-[480px] filter brightness-100 contrast-100 saturate-100 transition-transform duration-750 group-hover:scale-[1.02]"
            />
          </div>
          <div className="flex justify-center pt-4">
            <a
              href="#configurator"
              className="bg-white text-zinc-950 text-xs font-bold px-8 py-3.5 rounded-none hover:bg-zinc-200 transition-colors uppercase tracking-wider"
            >
              Build
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 3: FLUIDITY CAROUSEL CARD SYSTEM */}
      <section className="relative py-24 sm:py-32 px-5 sm:px-8 bg-zinc-900/10 border-t border-zinc-900 overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5">
              <span className="text-xs font-mono font-bold tracking-[0.3em] text-sky-400 uppercase block mb-4">02 / SPECIFICATIONS</span>
              <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight leading-tight">
                Every Detail.<br />Engineered with Intent.
              </h2>
            </div>
            <div className="lg:col-span-7">
              <p className="text-zinc-400 text-sm sm:text-base leading-relaxed font-light lg:pt-10">
                From the frame to the chassis, pure elegance is engineered into every millimeter of the PureFlow body. Active cooling vents breathe under peak load, while solid-state cell packaging integrates directly into the structural floor.
              </p>
            </div>
          </div>

          {/* Cards List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            {carouselCards.map((card, idx) => (
              <div
                key={card.tag}
                onClick={() => setActiveCard(idx)}
                className={`bg-zinc-900/20 border rounded-none p-6 relative overflow-hidden flex flex-col justify-between min-h-[380px] transition-all duration-500 cursor-pointer ${
                  activeCard === idx
                    ? 'border-zinc-800 bg-zinc-900/40'
                    : 'border-zinc-900 hover:border-zinc-850'
                }`}
              >
                <div
                  className="absolute inset-0 bg-center bg-cover bg-no-repeat transition-all duration-700 opacity-100 filter brightness-100 contrast-100 saturate-100 group-hover:scale-105"
                  style={{ backgroundImage: `url(${card.img})` }}
                />

                <div className="relative z-10">
                  <span className={`text-[10px] font-mono font-bold tracking-widest uppercase px-3 py-1 rounded-none border backdrop-blur-md ${
                    activeCard === idx
                      ? 'text-sky-400 bg-zinc-950/80 border-sky-500/30'
                      : 'text-zinc-400 bg-zinc-950/80 border-zinc-900'
                  }`}>
                    {card.tag}
                  </span>
                </div>

                <div className="relative z-20 space-y-2 mt-auto bg-zinc-950/85 p-5 border border-zinc-900/50 backdrop-blur-md">
                  <h4 className="text-lg font-black text-white uppercase tracking-tight">{card.tag}</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed font-light">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Progress & Chevron Controls */}
          <div className="flex items-center justify-between pt-6">
            {/* Slide indicator bar */}
            <div className="flex-1 max-w-[240px] h-0.5 bg-zinc-800 rounded-none overflow-hidden relative">
              <div
                className="absolute top-0 bottom-0 left-0 bg-sky-400 transition-all duration-500 rounded-none"
                style={{ width: `${((activeCard + 1) / carouselCards.length) * 100}%` }}
              />
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveCard((prev) => (prev === 0 ? carouselCards.length - 1 : prev - 1))}
                className="w-10 h-10 rounded-none border border-zinc-900 bg-zinc-900/20 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setActiveCard((prev) => (prev === carouselCards.length - 1 ? 0 : prev + 1))}
                className="w-10 h-10 rounded-none border border-zinc-900 bg-zinc-900/20 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: CONFIGURE YOUR PUREFLOW */}
      <section id="configurator" className="relative py-24 sm:py-32 px-5 sm:px-8 border-t border-zinc-900 overflow-hidden bg-zinc-950">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <div>
              <span className="text-xs font-mono font-bold tracking-[0.3em] text-sky-400 uppercase block mb-4">03 / CONFIGURATOR</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase leading-tight">
              Build Around Your Drive
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed font-light">
              Tailor the vehicle to your exact aesthetic profile. Choose from specialized metallic colors and high-performance alloys.
            </p>
          </div>

          {/* Color Selection swatches as elegant minimalist text tabs */}
          <div className="flex justify-center items-center gap-8 border-b border-zinc-900 pb-4 max-w-md mx-auto">
            {paints.map((paint) => (
              <button
                key={paint.name}
                onClick={() => setConfigPaint(paint)}
                className={`text-xs font-bold tracking-widest uppercase pb-2 transition-all border-b-2 ${
                  configPaint.name === paint.name
                    ? 'text-white border-white'
                    : 'text-zinc-500 border-transparent hover:text-zinc-300'
                }`}
              >
                {paint.shortName}
              </button>
            ))}
          </div>

          {/* Configuration Main Visual Display */}
          <div className="relative w-full max-w-4xl mx-auto py-10 flex items-center justify-center min-h-[300px]">
            {/* Background halo */}
            <div className="absolute w-[450px] h-[150px] bg-sky-950/20 rounded-none blur-[80px] pointer-events-none" />
            <img
              src={image4}
              alt="Live Configurator Sideview"
              className="w-full max-w-2xl object-contain z-10 transition-all duration-700 ease-out select-none pointer-events-none"
              style={{ filter: configPaint.filter }}
            />
          </div>

          {/* Under-Car Grid Specs exactly matching 3-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-zinc-900/60 max-w-5xl mx-auto">
            <div className="space-y-2 text-center md:text-left">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">0-60 MPH IN 2.1S</h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-light">
                Unmatched instant acceleration.
              </p>
            </div>
            <div className="space-y-2 border-t border-zinc-900/60 md:border-t-0 md:border-l md:border-zinc-900/60 pt-4 md:pt-0 md:pl-8 text-center md:text-left">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">500+ MILE RANGE</h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-light">
                Go further on a single solid-state charge.
              </p>
            </div>
            <div className="space-y-2 border-t border-zinc-900/60 md:border-t-0 md:border-l md:border-zinc-900/60 pt-4 md:pt-0 md:pl-8 text-center md:text-left">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">1020 HP PEAK</h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-light">
                Tri-motor high-performance setup.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: INTERIOR SPLIT SCREEN */}
      <section className="relative overflow-hidden border-t border-zinc-900/60 bg-zinc-950">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px] items-stretch">
          {/* Left Column Text details */}
          <div className="lg:col-span-5 p-8 sm:p-16 md:p-24 flex flex-col justify-center space-y-6 max-w-xl">
            <div>
              <span className="text-xs font-mono font-bold tracking-[0.3em] text-sky-400 uppercase block mb-4">04 / INTERIOR</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase leading-tight">
              Command the Road,<br />Feel Every Detail.
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed font-light">
              The carbon yoke steering is a performance statement. Retreating driver steering components lift to present a breathtaking 32-inch 8K theater panel.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={() => setCockpitMode('pilot')}
                className={`text-xs font-bold px-6 py-3 rounded-none border transition-all text-center uppercase tracking-wider ${
                  cockpitMode === 'pilot'
                    ? 'bg-white text-zinc-950 border-white'
                    : 'bg-transparent text-zinc-400 border-zinc-900 hover:text-white'
                }`}
              >
                Track Pilot Yoke
              </button>
              <button
                onClick={() => setCockpitMode('lounge')}
                className={`text-xs font-bold px-6 py-3 rounded-none border transition-all text-center uppercase tracking-wider ${
                  cockpitMode === 'lounge'
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-transparent text-zinc-400 border-zinc-900 hover:text-white'
                }`}
              >
                Theater Lounge Mode
              </button>
            </div>
          </div>

          {/* Right Column Image frame */}
          <div className="lg:col-span-7 relative min-h-[300px]">
            <div
              className={`absolute inset-0 bg-center bg-cover bg-no-repeat transition-all duration-1000 opacity-100 filter ${
                cockpitMode === 'pilot' ? 'saturate-[0.8] contrast-125' : 'saturate-200 contrast-110 hue-rotate-[260deg]'
              }`}
              style={{ backgroundImage: `url(${image5})` }}
            />

            <div className="absolute bottom-6 right-6 z-20 bg-zinc-950/80 border border-zinc-900 p-4 rounded-none max-w-xs backdrop-blur-md">
              {cockpitMode === 'pilot' ? (
                <div className="space-y-1">
                  <span className="block text-[10px] font-bold text-orange-400 uppercase tracking-widest">PILOT HUD</span>
                  <p className="text-[11px] text-zinc-400 font-light">Carbon sleeved steering system deployed in active precision mode.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <span className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest">CINEMA MODE DEPLOYED</span>
                  <p className="text-[11px] text-zinc-400 font-light">Acoustic panel slides down. Ambient lighting sets to Spatial Theatre mode.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: A NEW STANDARD IN MOTION */}
      <section className="relative py-24 sm:py-32 px-5 sm:px-8 border-t border-zinc-900 overflow-hidden bg-zinc-950">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <div>
              <span className="text-xs font-mono font-bold tracking-[0.3em] text-sky-400 uppercase block mb-4">05 / MOTION</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase leading-tight">
              A New Standard in Motion.
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed font-light">
              Designed for individuals, built for teams.
            </p>
          </div>

          {/* Three Columns with Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-zinc-900/10 border border-zinc-900 rounded-none overflow-hidden flex flex-col justify-between hover:border-zinc-800 transition-all min-h-[380px] p-6 relative">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-15 filter saturate-[0.8] contrast-125"
                style={{ backgroundImage: `url(${image10})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

              <div className="z-10 w-full mb-6">
                <div className="w-full h-44 rounded-none overflow-hidden bg-zinc-950 mb-6 relative">
                  <div className="absolute inset-0 bg-cover bg-center opacity-65 filter saturate-[0.7]" style={{ backgroundImage: `url(${image10})` }} />
                </div>
                <h3 className="text-lg font-black text-white leading-snug uppercase mb-2">Ultra-Low Total Cost of Ownership</h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-light">Optimized battery management reduces total cost of ownership.</p>
              </div>
            </div>

            <div className="bg-zinc-900/10 border border-zinc-900 rounded-none overflow-hidden flex flex-col justify-between hover:border-zinc-800 transition-all min-h-[380px] p-6 relative">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-15 filter saturate-[0.8] contrast-125"
                style={{ backgroundImage: `url(${image11})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

              <div className="z-10 w-full mb-6">
                <div className="w-full h-44 rounded-none overflow-hidden bg-zinc-950 mb-6 relative">
                  <div className="absolute inset-0 bg-cover bg-center opacity-65 filter saturate-[0.7]" style={{ backgroundImage: `url(${image11})` }} />
                </div>
                <h3 className="text-lg font-black text-white leading-snug uppercase mb-2">Zero Emission Fleet Solutions</h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-light">Transition your organization to sustainable, high-fidelity transit.</p>
              </div>
            </div>

            <div className="bg-zinc-900/10 border border-zinc-900 rounded-none overflow-hidden flex flex-col justify-between hover:border-zinc-800 transition-all min-h-[380px] p-6 relative">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-15 filter saturate-[0.8] contrast-125"
                style={{ backgroundImage: `url(${image12})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

              <div className="z-10 w-full mb-6">
                <div className="w-full h-44 rounded-none overflow-hidden bg-zinc-950 mb-6 relative">
                  <div className="absolute inset-0 bg-cover bg-center opacity-65 filter saturate-[0.7]" style={{ backgroundImage: `url(${image12})` }} />
                </div>
                <h3 className="text-lg font-black text-white leading-snug uppercase mb-2">Dynamic Routing & Optimization</h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-light">Connected telemetry system coordinates routing for maximal efficiency.</p>
              </div>
            </div>
          </div>

          {/* Book Fleet Demo Button */}
          <div className="flex justify-center pt-4">
            <a
              href="#configurator"
              className="bg-white text-zinc-950 text-xs font-bold px-8 py-3.5 rounded-none hover:bg-zinc-200 transition-all uppercase tracking-wider"
            >
              Build
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 7: FLEET HORIZON SUNRISE GRID */}
      <section className="relative py-24 sm:py-32 px-5 sm:px-8 border-t border-zinc-900 overflow-hidden bg-zinc-950 select-none">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-6">
            <div>
              <span className="text-xs font-mono font-bold tracking-[0.3em] text-sky-400 uppercase block mb-4">06 / JOURNEY</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase leading-tight">
              Start Your Electric Journey
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed font-light max-w-xl mx-auto">
              Join the movement towards a zero-emission future today.
            </p>
            <div className="pt-2">
              <a
                href="#configurator"
                className="bg-white text-zinc-950 text-xs font-bold px-8 py-3.5 rounded-none hover:bg-zinc-200 transition-colors uppercase tracking-wider"
              >
                Test Drive Now
              </a>
            </div>
          </div>

          {/* Breathtaking horizon parked fleet cityscape landscape */}
          <div className="w-full rounded-none overflow-hidden bg-zinc-950 relative max-w-5xl mx-auto">
            <img
              src={image12}
              alt="Parked Fleet Cityscape Horizon"
              className="w-full h-auto object-cover max-h-[500px] filter contrast-100 brightness-100 saturate-100"
            />
          </div>
        </div>
      </section>

      {/* SECTION 8: MINIMALIST CUSTOM WATERMARKED FOOTER */}
      <section className="relative py-24 sm:py-32 px-5 sm:px-8 border-t border-zinc-900 bg-zinc-950 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 space-y-16">
          {/* Main Footer layout */}
          <div className="flex flex-col items-center text-center space-y-8 max-w-2xl mx-auto pt-8">
            <div className="flex items-center justify-center">
              <img src="/assets/logoo.png" alt="PureFlow Logo" className="h-8 w-auto object-contain" />
            </div>
            <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed max-w-md font-light">
              Empowering next generation electric transit, driving sustainability with high performance.
            </p>

            {/* Footer menu links */}
            <div className="flex justify-center items-center gap-6 text-xs font-semibold uppercase tracking-widest pt-2 flex-wrap">
              <a href="#products" className="text-zinc-400 hover:text-white transition-colors">Home</a>
              <a href="#stories" className="text-zinc-400 hover:text-white transition-colors">Team</a>
              <a href="#science" className="text-zinc-400 hover:text-white transition-colors">Science</a>
              <a href="#plans" className="text-zinc-400 hover:text-white transition-colors">Plans</a>
            </div>
          </div>

          {/* Breathtaking giant text background watermark */}
          <div className="absolute left-1/2 bottom-20 -translate-x-1/2 select-none pointer-events-none opacity-[0.03] z-0">
            <span className="text-[120px] sm:text-[180px] md:text-[240px] font-black tracking-[0.15em] text-white uppercase font-sans">
              PUREFLOW
            </span>
          </div>

          {/* Underline Copyright & Socials */}
          <div className="border-t border-zinc-900/60 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-zinc-600 font-semibold relative z-10 max-w-6xl mx-auto">
            <span>© 2026 PureFlow. All rights reserved. Designed to blend track agility with climate responsibility.</span>
            <div className="flex items-center gap-6">
              <a href="#ln" className="hover:text-zinc-400 transition-colors uppercase tracking-wider">LinkedIn</a>
              <a href="#tw" className="hover:text-zinc-400 transition-colors uppercase tracking-wider">Twitter</a>
              <a href="#gh" className="hover:text-zinc-400 transition-colors uppercase tracking-wider">GitHub</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
