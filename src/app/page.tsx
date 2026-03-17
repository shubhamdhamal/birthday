'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Mail, CakeSlice, ArrowLeft, ChevronDown, ArrowRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import { OrbitControls } from '@react-three/drei';
import { motion, useScroll, useTransform } from 'framer-motion';

// Dynamic import for 3D component to ensure it only loads on client side
const BirthdayCake3D = dynamic(() => import('@/components/BirthdayCake3D'), { ssr: false });
import { Canvas } from '@react-three/fiber';

type MemoryCard = {
  bgColor: string;
  title: string;
  description: string;
  src: string;
};

function StackingMemoryCard({
  card,
  index,
  total,
  containerRef,
}: {
  card: MemoryCard;
  index: number;
  total: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    container: containerRef,
    offset: ['start start', 'end start'],
  });

  const scaleMultiplier = 0.03;
  const targetScale = 1 - (total - index - 1) * scaleMultiplier;
  const scale = useTransform(scrollYProgress, [0, 1], [1, targetScale]);

  return (
    <div
      ref={sectionRef}
      className="sticky h-[620px] grid place-content-center"
      style={{ top: `${16 + index * 14}px` }}
    >
      <motion.article
        style={{ scale }}
        className={`${card.bgColor} flex flex-col sm:flex-row gap-4 sm:gap-6 w-[min(90vw,22rem)] sm:w-11/12 md:w-11/12 sm:h-[70%] md:h-[80%] lg:h-[84%] md:aspect-video px-4 py-4 md:px-8 md:py-10 rounded-3xl mx-auto relative shadow-[0_24px_70px_rgba(0,0,0,0.35)] border border-white/20`}
      >
        <div className="order-2 sm:order-1 flex-1 flex flex-col justify-center">
          <h3 className="font-bold text-xl md:text-2xl mb-4 text-white">{card.title}</h3>
          <p className="text-sm md:text-base text-white/90 leading-relaxed">{card.description}</p>
        </div>

        <div className="order-1 sm:order-2 w-full sm:w-1/2 rounded-xl aspect-[3/4] sm:aspect-video relative overflow-hidden border border-white/20 bg-black/10">
          <img
            alt={card.title}
            className="w-full h-full object-cover"
            src={card.src}
          />
        </div>
      </motion.article>
    </div>
  );
}

export default function Home() {
  const [currentView, setCurrentView] = useState<'landing' | 'birthday' | 'lyrics' | 'letter'>('landing');
  const [flowerProgress, setFlowerProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const memoryContainerRef = useRef<HTMLDivElement>(null);
  const memoryCards = [
    {
      bgColor: 'bg-[#f97316]',
      title: 'The Guiding Light',
      description: 'Even in difficult days, your smile has always been my lighthouse and my calm.',
      src: '/image1.jpeg',
    },
    {
      bgColor: 'bg-[#0015ff]',
      title: 'Life Beneath the Waves',
      description: 'In every hidden layer of life, you bring depth, color, and meaning to everything.',
      src: '/image2.jpeg',
    },
    {
      bgColor: 'bg-[#ff5941]',
      title: 'Alone on the Open Sea',
      description: 'When the world goes silent, memories of you still feel like home and warm light.',
      src: '/image3.jpeg',
    },
    {
      bgColor: 'bg-[#1f464d]',
      title: 'The Art of Sailing',
      description: 'With you, every journey feels like a soft adventure guided by trust and joy.',
      src: '/image1.jpeg',
    },
  ];

  // Switch view function
  const switchView = (view: 'landing' | 'birthday' | 'lyrics' | 'letter') => {
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.6;

    const tryPlay = () => {
      audio.play().catch(() => {
        // Browser autoplay policies may block playback until first user interaction.
      });
    };

    tryPlay();
    window.addEventListener('pointerdown', tryPlay, { once: true });
    window.addEventListener('keydown', tryPlay, { once: true });

    return () => {
      window.removeEventListener('pointerdown', tryPlay);
      window.removeEventListener('keydown', tryPlay);
    };
  }, []);

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.muted = false;
      setIsMuted(false);
      audio.play().catch(() => {});
      return;
    }

    const nextMuted = !isMuted;
    audio.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  // Particles for Landing View
  const [particles, setParticles] = useState<{size: number, left: string, top: string, opacity: number, duration: string}[]>([]);
  useEffect(() => {
    if (currentView === 'landing') {
      const newParticles = Array.from({ length: 30 }).map(() => ({
        size: Math.random() * 4 + 2,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        opacity: Math.random(),
        duration: `${Math.random() * 5 + 3}s`
      }));
      setParticles(newParticles);
    }
  }, [currentView]);

  // Flower animation for Letter View
  useEffect(() => {
    if (currentView === 'letter') {
      let progress = 0;
      setFlowerProgress(0);
      const interval = setInterval(() => {
        progress += 2;
        setFlowerProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 20);
      return () => clearInterval(interval);
    }
  }, [currentView]);

  // Scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100');
          entry.target.classList.remove('opacity-0');
        }
      });
    }, { threshold: 0.2 });

    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
    
    return () => {
      document.querySelectorAll('.scroll-reveal').forEach(el => observer.unobserve(el));
    };
  }, [currentView]);

  return (
    <div className="bg-slate-900 text-white overflow-x-hidden font-sans min-h-screen">
      <audio ref={audioRef} src="/MainAgarKahoon.mp3" autoPlay loop preload="auto" />
      
      {/* Global Audio Control */}
      <div className="fixed top-6 right-6 z-50">
        <button
          className="glassmorphism p-3 rounded-full hover:scale-110 transition-transform active:scale-95"
          id="audioToggle"
          onClick={toggleAudio}
          aria-label={isMuted ? 'Unmute music' : 'Mute music'}
        >
          {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </button>
      </div>

      {/* Landing View */}
      <section className={`${currentView === 'landing' ? 'flex' : 'hidden-view'} min-h-screen w-full flex-col items-center justify-center bg-[#1a2e2e] relative overflow-hidden`} id="landingView">
        <div className="absolute inset-0 z-0">
          {particles.map((p, i) => (
            <div 
              key={i} 
              className="particle"
              style={{
                width: `${p.size}px`, height: `${p.size}px`, 
                left: p.left, top: p.top, opacity: p.opacity, 
                animation: `float ${p.duration} infinite linear`
              }} 
            />
          ))}
        </div>
        
        <div className="z-10 flex flex-col md:flex-row gap-8 px-4 w-full max-w-4xl justify-center items-center">
          <div className="glassmorphism w-64 h-80 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/20 transition-all group" onClick={() => switchView('birthday')}>
            <div className="p-4 bg-pink-500/20 rounded-full mb-4 group-hover:scale-110 transition-transform">
              <CakeSlice className="w-12 h-12 text-pink-300" />
            </div>
            <h2 className="text-2xl font-bold tracking-widest">BIRTHDAY</h2>
          </div>

          <div className="glassmorphism w-64 h-80 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/20 transition-all group" onClick={() => switchView('letter')}>
            <div className="p-4 bg-teal-500/20 rounded-full mb-4 group-hover:scale-110 transition-transform">
              <Mail className="w-12 h-12 text-teal-300" />
            </div>
            <h2 className="text-2xl font-bold tracking-widest">NOTE</h2>
          </div>
        </div>
      </section>

      {/* Birthday View */}
      <section className={`${currentView === 'birthday' ? 'flex' : 'hidden-view'} min-h-screen w-full bg-slate-900 flex-col items-center pt-24 pb-20 relative overflow-y-auto`} id="birthdayView">
        <button className="absolute top-6 left-6 flex items-center gap-2 text-white/70 hover:text-white" onClick={() => switchView('landing')}>
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-500">
            Happy Birthday Dr. Sanchi🎀
          </h1>
        </div>

        {/* Interactive 3D Cake */}
        <div className="relative w-full max-w-md h-96 mt-8 md:mt-10 mb-24 flex items-center justify-center cursor-pointer">
          <div className="absolute inset-0 bg-pink-500/10 blur-3xl rounded-full"></div>
          <div className="w-full h-full relative z-10">
            <Canvas camera={{ position: [0, 1.6, 3.6], fov: 42 }}>
              <ambientLight intensity={0.9} />
              <hemisphereLight intensity={0.55} color="#fff7ed" groundColor="#1e293b" />
              <directionalLight position={[4, 7, 5]} intensity={1.15} color="#fff1f2" />
              <pointLight position={[-4, 3, 3]} intensity={0.72} color="#ffe4e6" />
              <BirthdayCake3D />
              <OrbitControls
                enablePan={false}
                enableZoom={false}
                autoRotate
                autoRotateSpeed={0.2}
                target={[0, 0, 0]}
                minPolarAngle={Math.PI / 3}
                maxPolarAngle={(2 * Math.PI) / 3}
              />
            </Canvas>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 mb-20 animate-bounce">
          <span className="text-xs uppercase tracking-widest text-white/50">Scroll Down</span>
          <ChevronDown className="w-6 h-6 text-white/50" />
        </div>

        <div className="w-full max-w-4xl px-4 flex flex-col gap-32 pb-40">
          <div className="scroll-reveal opacity-0 transition-opacity duration-1000 flex flex-col md:flex-row items-center gap-8">
            <img alt="Memory 1" className="w-10/12 sm:w-3/4 md:w-2/5 rounded-3xl shadow-2xl md:grayscale md:hover:grayscale-0 transition-all" src="/image1.jpeg" />
            <p className="text-xl text-white/80 italic">"Thinking back to when this all started..."</p>
          </div>
          
          <div className="scroll-reveal opacity-0 transition-opacity duration-1000 flex flex-col md:flex-row-reverse items-center gap-8">
            <img alt="Memory 2" className="w-10/12 sm:w-3/4 md:w-2/5 rounded-3xl shadow-2xl md:grayscale md:hover:grayscale-0 transition-all" src="/image2.jpeg" />
            <p className="text-xl text-white/80 italic">"...and every laugh we've shared since."</p>
          </div>

          <div className="scroll-reveal opacity-0 transition-opacity duration-1000 rounded-3xl overflow-hidden bg-slate-900 border border-white/10">
            <div
              className="h-[620px] overflow-auto text-white"
              ref={memoryContainerRef}
            >
              <div className="relative h-[620px] w-full z-10 text-4xl md:text-7xl font-bold uppercase flex justify-center items-center text-[#ff5941] whitespace-pre">
                Scroll down ↓
              </div>

              {memoryCards.map((memory, index) => (
                <StackingMemoryCard
                  key={`${memory.title}-${index}`}
                  card={memory}
                  index={index}
                  total={memoryCards.length}
                  containerRef={memoryContainerRef}
                />
              ))}

              
            </div>
          </div>
          
          <button className="mx-auto glassmorphism px-8 py-4 rounded-full hover:bg-white/20 flex items-center gap-3 transition-all cursor-pointer" onClick={() => switchView('lyrics')}>
            Next Chapter <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Lyrics View */}
      <section className={`${currentView === 'lyrics' ? 'flex' : 'hidden-view'} h-screen w-full bg-black relative items-center justify-center overflow-hidden`} id="lyricsView">
        <div className="absolute inset-0 opacity-30">
          <img alt="Anime Background" className="w-full h-full object-cover" src="/image1.jpeg" />
        </div>
        
        <button className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/70 hover:text-white" onClick={() => switchView('birthday')}>
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        
        <div className="relative z-10 w-full max-w-2xl px-8 h-full max-h-[70vh] overflow-y-auto lyrics-container text-center" id="lyricsScroll"
             onScroll={(e) => {
               const container = e.currentTarget;
               const containerCenter = container.scrollTop + (container.clientHeight / 2);
               const lines = document.querySelectorAll('.lyric-line') as NodeListOf<HTMLElement>;
               
               lines.forEach(line => {
                 const lineCenter = line.offsetTop + (line.clientHeight / 2);
                 const distance = Math.abs(containerCenter - lineCenter);
                 if (distance < 150) {
                   line.classList.add('opacity-100', 'scale-110');
                   line.classList.remove('opacity-30');
                 } else {
                   line.classList.remove('opacity-100', 'scale-110');
                   line.classList.add('opacity-30');
                 }
               });
             }}
        >
          <div className="space-y-16 py-[50vh]">
            <p className="lyric-line text-2xl md:text-4xl font-light opacity-30 transition-all duration-700">हर नजर को एक नजर कि तलाश है </p>
            <p className="lyric-line text-2xl md:text-4xl font-light opacity-30 transition-all duration-700">इस चेहरे मे कुछ तो खास है</p>
            <p className="lyric-line text-2xl md:text-4xl font-light opacity-30 transition-all duration-700">आपसे दोस्ती हम यु नही कर बैठे</p>
            <p className="lyric-line text-2xl md:text-4xl font-light opacity-30 transition-all duration-700">क्य़ा करे हमरी पसन्द हि कुछ खास है !</p>
            <p className="lyric-line text-2xl md:text-4xl font-light opacity-30 transition-all duration-700">Happy Birthday to my brightest star</p>
            <p className="lyric-line text-2xl md:text-4xl font-light opacity-30 transition-all duration-700">I love exactly who you are</p>
            
            <div className="pt-20">
              <button className="px-8 py-3 bg-white/10 border border-white/20 rounded-full hover:bg-white/20 transition-all cursor-pointer" onClick={() => switchView('letter')}>
                Read My Letter
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Letter View */}
      <section className={`${currentView === 'letter' ? 'flex' : 'hidden-view'} min-h-screen w-full bg-[#e0f7ff] relative flex flex-col items-center overflow-hidden text-sky-900`} id="letterView">
        <div className="absolute top-10 right-10 w-32 h-32 bg-yellow-300 rounded-full shadow-[0_0_100px_rgba(253,224,71,0.8)]"></div>
        
        <button className="absolute top-6 left-6 z-20 flex items-center gap-2 text-sky-800 hover:text-sky-900" onClick={() => switchView('landing')}>
          <ArrowLeft className="w-5 h-5" /> Home
        </button>
        
        <div className="mt-20 z-10 text-center px-4 w-full">
          <h3 className="text-sky-800 text-xl md:text-2xl font-medium mb-12">So many flowers but my favorite one is you here ✨</h3>
          
          <div className="w-full flex justify-center mb-12">
            <svg className="drop-shadow-lg" height="250" id="flowerSvg" viewBox="0 0 200 250" width="200">
              <path 
                d={`M100 250 Q${100 + Math.sin(flowerProgress/10) * 10} ${250 - flowerProgress} 100 ${250 - flowerProgress * 2}`} 
                fill="none" 
                stroke="#4ade80" 
                strokeWidth="6" 
              />
              <g 
                style={{ 
                  transformOrigin: '100px 50px', 
                  transform: `scale(${flowerProgress >= 100 ? 1 : 0})`,
                  transition: 'transform 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
              >
                <circle cx="100" cy="50" fill="#fde047" r="15"></circle>
                <circle cx="100" cy="25" fill="#f472b6" r="20"></circle>
                <circle cx="125" cy="50" fill="#f472b6" r="20"></circle>
                <circle cx="100" cy="75" fill="#f472b6" r="20"></circle>
                <circle cx="75" cy="50" fill="#f472b6" r="20"></circle>
              </g>
            </svg>
          </div>
          
          <div className={`mx-auto bg-white/80 backdrop-blur-md w-full max-w-lg rounded-t-3xl p-8 shadow-2xl transition-transform duration-1000 ${flowerProgress >= 100 ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="w-12 h-1.5 bg-sky-200 rounded-full mx-auto mb-6"></div>
            <div className="scroll-letter max-h-[40vh] overflow-y-auto text-sky-900 leading-relaxed text-left space-y-4 pr-2">
              <p className="font-bold text-xl">Dearest My gurl,</p>
              <p>Writing this wasn't easy because words often fail to capture the depth of how much you mean to me. As you celebrate another trip around the sun, I wanted to take a moment to tell you just how special you are.</p>
              <p>Like a flower blooming in the most unexpected places, you bring color and fragrance into my world every single day. Your kindness, your laugh, and your incredible spirit make everything brighter.</p>
              <p>I hope today is filled with as much happiness as you give to everyone around you. You deserve the stars, the moon, and all the beautiful things life has to offer.</p>
              <p>Thank you for being you. Happy Birthday!</p>
              <p className="font-bold pt-4">With love,<br/>Your CP</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
