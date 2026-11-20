import { ArrowDown, ArrowRight, ArrowUpRight, ChartLineUp, Compass, Layers, Lightbulb, LinkedinLogo, PlayCircle, Sparkle, XLogo } from "@phosphor-icons/react";
import { Link } from "react-router-dom";

const dimensions = [
  ["Health & Fitness","Strength, energy and the habits that make everything else possible.","photo-1534438327276-14e5300c3a48"],
  ["Mind & Learning","Ideas, books, skills and the discipline of staying curious.","photo-1456513080510-7bf3a84b82f8"],
  ["Trading & Investing","A decade-plus in Indian markets, studying price, risk, process and performance.","photo-1611974789855-9c2a0a7236a3"],
  ["Business & Building","Turning observations into useful products, systems and businesses.","photo-1486406146926-c627a92ad1ab"],
  ["Relationships","The people, conversations and connections that give life meaning.","photo-1511632765486-a01980e01a18"],
  ["Family","Roots, shared memories and the people who remain close through every chapter.","photo- family"],
  ["Wealth & Finance","Building financial independence with patience, clarity and thoughtful decisions.","photo-146 Citadel"],
  ["Spirituality","Stillness, values and a deeper perspective beyond outcomes.","photo-150**"],
  ["Travel & Experiences","New places, unfamiliar perspectives and experiences worth remembering.","photo-146﻿"],
  ["Impact & Giving","Using what I learn and build to create value beyond myself.","photo-153**"],
  ["Lifestyle & Habits","The routines, environments and small choices that shape ordinary days.","photo-149**"],
  ["Identity & Purpose","The principles, ambitions and questions that keep the journey intentional.","photo-147**"]
];
const imageIds = [
 "photo-1534438327276-14e5300c3a48","photo-1456513080510-7bf3a84b82f8","photo-1611974789855-9c2a0a7236a3","photo-1486406146926-c627a92ad1ab",
 "photo-1511632765486-a01980e01a18","photo-1511895426328-dc8714191300","photo-  ",
 "photo-1500530855697-b586d89ba3ee","photo-1464822759023-fed622ff2c3b","photo-1497366754035-f200968a6e72","photo-1494438639946-1ebd1d20bf85","photo-1470252649378-9c29740c9fa8"
];
const imageUrls = [
 "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=85",
 "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=900&q=85",
 "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=900&q=85",
 "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=85",
 "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=900&q=85",
 "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=900&q=85",
 "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=85",
 "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85",
 "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=85",
 "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=900&q=85",
 "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=900&q=85",
 "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=900&q=85"
];

export default function LandingPage() {
 return <main className="lifebook-public min-h-screen bg-[#080D19] text-white overflow-hidden">
  <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080D19]/85 backdrop-blur-xl">
   <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between gap-4">
    <a href="#top" className="flex items-center gap-3"><span className="font-display italic text-2xl text-blue-300">NZ</span><span className="font-display text-xl sm:text-2xl">Nikhil Zelawat</span></a>
    <nav className="hidden lg:flex items-center gap-7 text-sm text-slate-300">
     <a href="#journey" className="hover:text-white">Journey</a><a href="#work" className="hover:text-white">What I Build</a><a href="#philosophy" className="hover:text-white">Philosophy</a><a href="#dimensions" className="hover:text-white">Life Dimensions</a><a href="#connect" className="hover:text-white">Connect</a>
    </nav>
    <Link to="/login" className="rounded-full border border-white/25 px-5 py-2 text-sm hover:bg-white/10 transition">Private space <ArrowUpRight className="inline ml-1" size={15}/></Link>
   </div>
  </header>

  <section id="top" className="relative isolate min-h-[650px] flex items-center">
   <div className="absolute inset-0 -z-10" style={{background:"radial-gradient(ellipse at 72% 40%,rgba(25,95,200,.38),transparent 38%),radial-gradient(ellipse at 5% 90%,rgba(96,54,190,.24),transparent 34%),linear-gradient(110deg,#080D19,#0B1932 65%,#0A1022)"}}/>
   <div className="max-w-7xl w-full mx-auto px-6 lg:px-12 py-20 grid lg:grid-cols-[1.05fr_.95fr] gap-12 items-center">
    <div className="relative z-10">
     <p className="tracking-[.22em] uppercase text-xs font-bold text-blue-300">Trader · Product Builder · Founder</p>
     <h1 className="mt-7 font-display text-6xl sm:text-7xl xl:text-[6.4rem] leading-[.98] tracking-tight">Living by<br/><em className="not-italic text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-400">Design.</em></h1>
     <p className="mt-7 max-w-xl text-lg sm:text-xl leading-relaxed text-slate-300">I’m Nikhil Zelawat. I work at the intersection of markets, technology and ideas — learning through trading, building tools, and shaping a life with intention.</p>
     <div className="mt-9 flex flex-wrap gap-3"><a href="#journey" className="rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-3.5 font-semibold text-sm transition">Explore my journey <ArrowRight className="inline ml-2" size={17}/></a><a href="#work" className="rounded-xl border border-white/20 hover:bg-white/5 px-6 py-3.5 font-semibold text-sm transition">What I build</a></div>
     <div className="mt-9 flex items-center gap-5 text-slate-400"><a aria-label="LinkedIn" href="https://www.linkedin.com/in/nikhilzelawat/" target="_blank" rel="noreferrer" className="hover:text-white"><LinkedinLogo size={22}/></a><a aria-label="X" href="https://x.com/Nik_092" target="_blank" rel="noreferrer" className="hover:text-white"><XLogo size={21}/></a><span className="h-px w-12 bg-white/20"/><span className="text-xs tracking-widest uppercase">India · Markets · Building</span></div>
    </div>
    <div className="relative min-h-[390px] lg:min-h-[510px]">
     <div className="absolute inset-5 rounded-[2rem] border border-blue-300/20 rotate-3 bg-blue-400/5"/>
     <div className="absolute inset-0 rounded-[2rem] overflow-hidden border border-white/15 bg-gradient-to-br from-blue-500/20 to-violet-500/10">
      <img src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1200&q=90" alt="Portrait placeholder for Nikhil" className="w-full h-full object-cover object-center opacity-70 mix-blend-screen"/>
      <div className="absolute inset-0 bg-gradient-to-t from-[#080D19] via-transparent to-[#0B1932]/20"/>
      <div className="absolute bottom-7 left-7 right-7"><p className="font-display italic text-3xl sm:text-4xl">“Build with curiosity.<br/>Trade with discipline.”</p><p className="mt-3 text-xs tracking-[.2em] uppercase text-blue-200">A work in progress, by design</p></div>
     </div>
    </div>
   </div>
   <a href="#journey" className="absolute bottom-5 left-1/2 -translate-x-1/2 text-slate-400 animate-bounce" aria-label="Scroll down"><ArrowDown size={22}/></a>
  </section>

  <section className="border-y border-white/10 bg-white/[.025]">
   <div className="max-w-7xl mx-auto px-6 lg:px-12 py-9 grid sm:grid-cols-3 gap-7">
    <div className="flex items-center gap-4"><ChartLineUp size={30} className="text-blue-300"/><div><p className="font-display text-3xl">10+ years</p><p className="text-sm text-slate-400">Experience in Indian markets</p></div></div>
    <div className="flex items-center gap-4"><Layers size={30} className="text-violet-300"/><div><p className="font-display text-3xl">Product-led</p><p className="text-sm text-slate-400">Ideas shaped into useful tools</p></div></div>
    <div className="flex items-center gap-4"><Compass size={30} className="text-cyan-300"/><div><p className="font-display text-3xl">12 dimensions</p><p className="text-sm text-slate-400">A framework for a balanced life</p></div></div>
   </div>
  </section>

  <section id="journey" className="max-w-7xl mx-auto px-6 lg:px-12 py-24 sm:py-28">
   <div className="max-w-2xl"><p className="text-xs tracking-[.2em] uppercase text-blue-300 font-bold">The path so far</p><h2 className="mt-4 font-display text-5xl sm:text-6xl">My <span className="text-blue-300">journey.</span></h2><p className="mt-5 text-slate-300 leading-relaxed text-lg">A journey shaped by curiosity, screen time, experimentation and a constant desire to understand how things work.</p></div>
   <div className="mt-14 grid md:grid-cols-4 gap-5">
    {[
     ["01","The learning years","Building a foundation in technology, analytical thinking and problem-solving."],
     ["02","The markets","More than a decade immersed in Indian markets — studying price action, risk, momentum and trading psychology."],
     ["03","The product chapter","Taking problems from the trading desk and turning them into tools that make research and decision-making clearer."],
     ["04","Building forward","Exploring new ideas across fintech, analytics, systems and the broader design of a meaningful life."]
    ].map(([n,t,d])=><article key={n} className="relative border-t border-blue-400/40 pt-6"><span className="font-display text-4xl text-blue-300/70">{n}</span><h3 className="mt-5 text-xl font-semibold">{t}</h3><p className="mt-3 text-sm leading-relaxed text-slate-400">{d}</p></article>)}
   </div>
   <p className="mt-8 text-xs text-slate-500">The timeline is intentionally presented as chapters rather than dated milestones; detailed dates and roles can be added as you confirm them.</p>
  </section>

  <section id="work" className="bg-[#0D172A] border-y border-white/10">
   <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6"><div><p className="text-xs tracking-[.2em] uppercase text-blue-300 font-bold">Ideas into execution</p><h2 className="mt-4 font-display text-5xl sm:text-6xl">What I <span className="text-violet-300">build.</span></h2></div><p className="max-w-lg text-slate-400 leading-relaxed">I’m interested in products that remove complexity, surface useful information and help people make better decisions.</p></div>
    <div className="mt-12 grid lg:grid-cols-2 gap-6">
     <article className="rounded-3xl overflow-hidden border border-white/10 bg-[#101F38] grid sm:grid-cols-[.9fr_1.1fr]">
      <div className="p-8 flex flex-col justify-center"><span className="text-3xl">😀</span><h3 className="mt-5 font-display text-3xl">StocksEmoji</h3><p className="mt-3 text-slate-300 leading-relaxed">Making stock research easier to understand through scores, visual cues and clear fundamental and technical reasoning.</p><a href="https://stocksemoji.com" target="_blank" rel="noreferrer" className="mt-7 text-blue-300 text-sm font-semibold">Explore StocksEmoji <ArrowUpRight className="inline" size={16}/></a></div>
      <img src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=900&q=85" alt="Financial market chart" className="h-full min-h-[240px] w-full object-cover"/>
     </article>
     <article className="rounded-3xl overflow-hidden border border-white/10 bg-[#101F38] grid sm:grid-cols-[.9fr_1.1fr]">
      <div className="p-8 flex flex-col justify-center"><span className="text-3xl">⌘</span><h3 className="mt-5 font-display text-3xl">Trading systems & research</h3><p className="mt-3 text-slate-300 leading-relaxed">Exploring market structure, momentum, risk frameworks, portfolio analytics and tools that support a repeatable process.</p><a href="#connect" className="mt-7 text-blue-300 text-sm font-semibold">Discuss an idea <ArrowUpRight className="inline" size={16}/></a></div>
      <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=85" alt="Analytics dashboard on screen" className="h-full min-h-[240px] w-full object-cover"/>
     </article>
    </div>
   </div>
  </section>

  <section id="philosophy" className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
   <p className="text-xs tracking-[.2em] uppercase text-blue-300 font-bold">Principles over shortcuts</p><h2 className="mt-4 font-display text-5xl sm:text-6xl">How I think<span className="text-blue-300">.</span></h2>
   <div className="mt-12 grid md:grid-cols-3 gap-6">
    {[["Trading","Discipline before prediction. Risk before reward. A process that can survive uncertainty.","↗"],["Building","Start with a real problem. Simplify the experience. Improve through feedback and iteration.","✳"],["Life design","Stay curious, take responsibility and make room for health, relationships and purpose.","◌"]].map(([h,p,s])=><article key={h} className="rounded-2xl border border-white/10 bg-white/[.035] p-8"><span className="text-3xl text-blue-300">{s}</span><h3 className="mt-6 font-display text-3xl">{h}</h3><p className="mt-3 text-slate-400 leading-relaxed">{p}</p></article>)}
   </div>
  </section>

  <section id="dimensions" className="bg-[#0D172A] border-y border-white/10">
   <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
    <div className="max-w-2xl"><p className="text-xs tracking-[.2em] uppercase text-blue-300 font-bold">Beyond work and markets</p><h2 className="mt-4 font-display text-5xl sm:text-6xl">The 12 life <span className="text-violet-300">dimensions.</span></h2><p className="mt-5 text-lg text-slate-300 leading-relaxed">A life is more than a job title or a portfolio. These twelve dimensions are the framework I use to think about growth, experiences and the person I want to become.</p></div>
    <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
     {dimensions.map(([name,desc],i)=><article key={name} className="group relative min-h-[285px] overflow-hidden rounded-2xl border border-white/10 bg-[#14233B]">
      <img src={imageUrls[i]} alt={name} loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-65 transition duration-700 group-hover:scale-110 group-hover:opacity-80"/>
      <div className="absolute inset-0 bg-gradient-to-t from-[#050B16] via-[#07101D]/35 to-transparent"/>
      <div className="absolute inset-x-0 bottom-0 p-6"><span className="text-xs tracking-[.2em] uppercase text-blue-200">Dimension {String(i+1).padStart(2,"0")}</span><h3 className="mt-2 font-display text-2xl">{name}</h3><p className="mt-2 text-sm leading-relaxed text-slate-300">{desc}</p></div>
     </article>)}
    </div>
   </div>
  </section>

  <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24 grid lg:grid-cols-[.8fr_1.2fr] gap-12 items-center">
   <div><p className="text-xs tracking-[.2em] uppercase text-blue-300 font-bold">A work in progress</p><h2 className="mt-4 font-display text-5xl sm:text-6xl">Always learning.<br/><span className="text-violet-300">Always building.</span></h2></div>
   <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-violet-500/10 p-8 sm:p-10"><Lightbulb size={30} className="text-blue-300"/><p className="mt-5 font-display text-2xl sm:text-3xl leading-relaxed">“The goal isn’t to have every answer. It’s to keep asking better questions — in markets, in business and in life.”</p><p className="mt-6 text-sm text-slate-400">A personal note on the journey</p></div>
  </section>

  <footer id="connect" className="border-t border-white/10 bg-[#060A13]">
   <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
    <div className="grid md:grid-cols-[1fr_auto] gap-10 items-end"><div><p className="text-xs tracking-[.2em] uppercase text-blue-300 font-bold">Open to thoughtful conversations</p><h2 className="mt-4 font-display text-5xl sm:text-6xl">Let’s connect<span className="text-blue-300">.</span></h2><p className="mt-5 max-w-xl text-slate-400 leading-relaxed">If you’re interested in markets, fintech, product building or exchanging ideas about the journey, I’d be glad to connect.</p></div>
     <div className="flex flex-wrap gap-3"><a href="https://www.linkedin.com/in/nikhilzelawat/" target="_blank" rel="noreferrer" className="rounded-xl border border-white/20 px-5 py-3 hover:bg-white/10 text-sm">LinkedIn <ArrowUpRight className="inline" size={15}/></a><a href="https://x.com/Nik_092" target="_blank" rel="noreferrer" className="rounded-xl border border-white/20 px-5 py-3 hover:bg-white/10 text-sm">Follow on X <ArrowUpRight className="inline" size={15}/></a><Link to="/login" className="rounded-xl bg-blue-600 px-5 py-3 hover:bg-blue-500 text-sm font-semibold">Private Lifebook <ArrowRight className="inline" size={15}/></Link></div>
    </div>
    <div className="mt-14 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-3 text-xs text-slate-500"><span>© {new Date().getFullYear()} Nikhil Zelawat</span><span>Designed around curiosity, discipline and a life by design.</span></div>
   </div>
  </footer>
 </main>;
}
