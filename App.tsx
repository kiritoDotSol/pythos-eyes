import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Upload, Award, Zap, Fingerprint, 
  Image as ImageIcon, TrendingUp, X, ShieldCheck, 
  Activity, Microscope, Loader2,
  Save, Crown, Trophy, Medal, Trash2,
  FileDown, Archive, Sparkles, Coins, Download,
  Target, AlertTriangle, CheckCircle2, Cpu,
  Star, Gem
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AnalysisResult, LeaderboardEntry } from './types';
import { analyzeImage } from './services/geminiService';

// --- Forensic Utilities ---

const extractParticipant = (filename: string): string => {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
  return nameWithoutExt
    .split(/[-_ ]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const fastResize = (file: File, maxWidth = 1024): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

const downloadImage = (url: string, filename: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = `PYTHOS-EYES-ARCHIVE-${filename.replace(/\s+/g, '-').toUpperCase()}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const formatPoints = (pts: number) => pts.toLocaleString();

const generateFullPodiumImage = async (results: AnalysisResult[], totalPool: number) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx || results.length === 0) return;

  const width = 1920;
  const height = 1080;
  canvas.width = width;
  canvas.height = height;

  const drawRoundedRect = (x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#0a0514');
  bgGrad.addColorStop(1, '#1c1131');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  ctx.textAlign = 'center';
  ctx.font = '900 48px Orbitron, sans-serif';
  ctx.fillStyle = '#ffffff'; 
  ctx.fillText('PYTHOS EYES - NEURAL PENTAGON ARCHIVE', width / 2, 80);

  const prizes = {
    1: Math.floor(totalPool * 0.40),
    2: Math.floor(totalPool * 0.25),
    3: Math.floor(totalPool * 0.15),
    4: Math.floor(totalPool * 0.12),
    5: Math.floor(totalPool * 0.08),
  };

  const cardConfigs = [
    { rank: 4, x: 50, stepH: 260, color: '#6366f1', grad: ['rgba(99, 102, 241, 0.12)', 'rgba(49, 46, 129, 0.05)'], reward: `${formatPoints(prizes[4])} PTS`, label: 'SENTINEL' },
    { rank: 2, x: 420, stepH: 420, color: '#94a3b8', grad: ['rgba(148, 163, 184, 0.15)', 'rgba(71, 85, 105, 0.05)'], reward: `${formatPoints(prizes[2])} PTS`, label: 'ELITE' },
    { rank: 1, x: 790, stepH: 540, color: '#fbbf24', grad: ['rgba(251, 191, 36, 0.25)', 'rgba(180, 83, 9, 0.1)'], reward: `${formatPoints(prizes[1])} PTS`, label: 'CHAMPION' },
    { rank: 3, x: 1160, stepH: 340, color: '#b45309', grad: ['rgba(180, 83, 9, 0.18)', 'rgba(120, 53, 15, 0.08)'], reward: `${formatPoints(prizes[3])} PTS`, label: 'CHALLENGER' },
    { rank: 5, x: 1530, stepH: 200, color: '#8b5cf6', grad: ['rgba(139, 92, 246, 0.1)', 'rgba(88, 28, 135, 0.05)'], reward: `${formatPoints(prizes[5])} PTS`, label: 'VANGUARD' }
  ];

  const verticalOffset = 100;

  for (const config of cardConfigs) {
    const result = results[config.rank - 1];
    if (!result) continue;

    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise((resolve) => {
      img.onload = resolve;
      img.src = result.imageUrl;
    });

    const cardW = 340;
    const imgSize = 220;
    const imgX = config.x + (cardW - imgSize) / 2;
    const imgY = 160 + (6 - config.rank) * 20 + verticalOffset;
    const stepTop = imgY + imgSize + 40;

    ctx.strokeStyle = config.color + '66';
    ctx.lineWidth = 4;
    drawRoundedRect(imgX - 4, imgY - 4, imgSize + 8, imgSize + 8, 24);
    ctx.stroke();

    ctx.save();
    drawRoundedRect(imgX, imgY, imgSize, imgSize, 22);
    ctx.clip();
    ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
    ctx.restore();

    const bW = 120;
    const bH = 30;
    const bX = config.x + (cardW - bW) / 2;
    const bY = stepTop - 15;
    ctx.fillStyle = '#000000';
    ctx.strokeStyle = config.color + '99';
    ctx.lineWidth = 2;
    drawRoundedRect(bX, bY, bW, bH, 10);
    ctx.fill();
    ctx.stroke();
    
    ctx.font = '900 12px Inter, sans-serif';
    ctx.fillStyle = config.color;
    ctx.letterSpacing = '1px';
    ctx.fillText(config.label, config.x + cardW / 2, bY + 20);
    ctx.letterSpacing = '0px';

    const stepGrad = ctx.createLinearGradient(0, stepTop, 0, height - 100);
    stepGrad.addColorStop(0, config.grad[0]);
    stepGrad.addColorStop(1, config.grad[1]);
    
    ctx.fillStyle = stepGrad;
    ctx.strokeStyle = config.color + '44';
    ctx.lineWidth = 2;
    
    const r = 40;
    ctx.beginPath();
    ctx.moveTo(config.x + r, stepTop);
    ctx.lineTo(config.x + cardW - r, stepTop);
    ctx.quadraticCurveTo(config.x + cardW, stepTop, config.x + cardW, stepTop + r);
    ctx.lineTo(config.x + cardW, height - 120);
    ctx.lineTo(config.x, height - 120);
    ctx.lineTo(config.x, stepTop + r);
    ctx.quadraticCurveTo(config.x, stepTop, config.x + r, stepTop);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = '900 80px Inter, sans-serif';
    ctx.fillStyle = config.color;
    ctx.fillText(`#${config.rank}`, config.x + cardW / 2, stepTop + 100);
    
    ctx.font = 'bold 32px Inter, sans-serif';
    ctx.fillStyle = '#ffffff'; 
    ctx.fillText(result.name, config.x + cardW / 2, stepTop + 160);

    ctx.font = '900 18px JetBrains Mono, monospace';
    ctx.fillStyle = '#a78bfa'; 
    ctx.fillText(`${result.score.toFixed(2)} GRADE`, config.x + cardW / 2, stepTop + 200);

    ctx.font = '700 16px JetBrains Mono, monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillText(config.reward, config.x + cardW / 2, stepTop + 235);
  }

  ctx.font = '900 32px Orbitron, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fillText('Pythos Eyes AI Slop By Kirito', width / 2, height - 40);

  const link = document.createElement('a');
  link.download = `PYTHOS-EYES-PENTAGON-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
};

const archivePodiumReport = (winners: AnalysisResult[]) => {
  const date = new Date().toLocaleString();
  const content = `
╔══════════════════════════════════════════════════════════╗
║           PYTHOS EYES - ELITE PENTAGON ARCHIVE           ║
╠══════════════════════════════════════════════════════════╣
║ TIMESTAMP: ${date.padEnd(46)} ║
╠══════════════════════════════════════════════════════════╣
${winners.map((w, i) => `║ RANK #${i+1}: ${w.name.padEnd(30)} SCORE: ${w.score.toFixed(2).padEnd(5)}/10 ║`).join('\n')}
╚══════════════════════════════════════════════════════════╝
  `;
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `PYTHOS-EYES-PENTAGON-ARCHIVE-${Date.now()}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// --- UI Components ---

const MedalIcon = ({ rank, size = 6 }: { rank: number; size?: number }) => {
  const sizeClass = `w-${size} h-${size}`;
  if (rank === 1) return <Crown className={`${sizeClass} text-yellow-400 fill-yellow-400/20`} />;
  if (rank === 2) return <Trophy className={`${sizeClass} text-slate-300 fill-slate-300/20`} />;
  if (rank === 3) return <Medal className={`${sizeClass} text-amber-600 fill-amber-600/20`} />;
  if (rank === 4) return <Star className={`${sizeClass} text-indigo-400 fill-indigo-400/20`} />;
  if (rank === 5) return <Gem className={`${sizeClass} text-purple-400 fill-purple-400/20`} />;
  return <div className={`${sizeClass} flex items-center justify-center font-black text-white/20 text-[10px]`}>{rank}</div>;
};

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode }> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={onClose}></div>
      <div className="relative bg-[#150a26] border border-purple-500/40 rounded-[3rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_0_100px_rgba(139,92,246,0.1)] p-10 animate-in fade-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-8 right-8 p-3 rounded-full hover:bg-purple-500/20 text-purple-400 transition-all">
          <X className="w-6 h-6" />
        </button>
        {children}
      </div>
    </div>
  );
};

const Header = () => (
  <motion.header 
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    className="py-16 text-center relative"
  >
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/10 blur-[150px] rounded-full pointer-events-none"></div>
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="inline-flex items-center gap-4 px-6 py-2 bg-purple-900/20 border border-purple-500/30 rounded-full mb-8 backdrop-blur-md"
    >
      <Activity className="w-4 h-4 text-purple-400 animate-pulse" />
      <span className="text-[10px] font-black font-mono tracking-[0.3em] text-purple-200">SYSTEM STATUS: OPTICAL SCANNING ACTIVE</span>
    </motion.div>
    <h1 className="text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-purple-300 to-indigo-500 mb-4 drop-shadow-[0_0_35px_rgba(168,85,247,0.2)]">
      Pythos Eyes
    </h1>
    <div className="flex items-center justify-center gap-6">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: 128 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="h-[1px] bg-gradient-to-r from-transparent to-purple-500/50"
      ></motion.div>
      <p className="text-purple-300/80 font-mono tracking-[0.5em] uppercase text-[11px] font-bold">
        FORENSIC ARTIFICIAL INTELLIGENCE LAB
      </p>
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: 128 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="h-[1px] bg-gradient-to-l from-transparent to-purple-500/50"
      ></motion.div>
    </div>
  </motion.header>
);

const WinnersPodium: React.FC<{ topResults: AnalysisResult[], totalPool: number }> = ({ topResults, totalPool }) => {
  const podiumLayout = useMemo(() => {
    const layout = Array(5).fill(null) as (AnalysisResult | null)[];
    if (topResults[0]) layout[2] = topResults[0]; // 1st center
    if (topResults[1]) layout[1] = topResults[1]; // 2nd left
    if (topResults[2]) layout[3] = topResults[2]; // 3rd right
    if (topResults[3]) layout[0] = topResults[3]; // 4th far left
    if (topResults[4]) layout[4] = topResults[4]; // 5th far right
    return layout;
  }, [topResults]);

  if (topResults.length === 0) return null;

  const prizes = {
    1: Math.floor(totalPool * 0.40),
    2: Math.floor(totalPool * 0.25),
    3: Math.floor(totalPool * 0.15),
    4: Math.floor(totalPool * 0.12),
    5: Math.floor(totalPool * 0.08),
  };

  const config = {
    1: { label: 'CHAMPION', stepHeight: 'h-[340px]', stepColor: 'from-yellow-400/20 to-yellow-600/10', borderColor: 'border-yellow-400/40', textColor: 'text-yellow-400', icon: <Crown className="w-12 h-12 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />, glow: 'shadow-[0_0_50px_rgba(250,204,21,0.15)]', reward: `${formatPoints(prizes[1])} Pts` },
    2: { label: 'ELITE', stepHeight: 'h-[260px]', stepColor: 'from-slate-300/10 to-slate-500/5', borderColor: 'border-slate-300/30', textColor: 'text-slate-300', icon: <Trophy className="w-10 h-10 text-slate-300" />, glow: '', reward: `${formatPoints(prizes[2])} Pts` },
    3: { label: 'CHALLENGER', stepHeight: 'h-[210px]', stepColor: 'from-amber-700/10 to-amber-900/5', borderColor: 'border-amber-700/30', textColor: 'text-amber-600', icon: <Medal className="w-8 h-8 text-amber-700" />, glow: '', reward: `${formatPoints(prizes[3])} Pts` },
    4: { label: 'SENTINEL', stepHeight: 'h-[160px]', stepColor: 'from-indigo-400/10 to-indigo-600/5', borderColor: 'border-indigo-400/30', textColor: 'text-indigo-400', icon: <Star className="w-8 h-8 text-indigo-400" />, glow: '', reward: `${formatPoints(prizes[4])} Pts` },
    5: { label: 'VANGUARD', stepHeight: 'h-[130px]', stepColor: 'from-purple-400/10 to-purple-600/5', borderColor: 'border-purple-400/30', textColor: 'text-purple-400', icon: <Gem className="w-8 h-8 text-purple-400" />, glow: '', reward: `${formatPoints(prizes[5])} Pts` }
  } as Record<number, any>;

  return (
    <div className="mb-40 group/podium relative">
      <div className="flex flex-col items-center mb-16">
        <div className="inline-flex items-center gap-3 px-6 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-6">
          <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-300">SYSTEM ELITE PENTAGON</span>
        </div>
        <h2 className="text-6xl font-black text-white tracking-tighter text-center mb-2 uppercase">Neural Archive Leaders</h2>
      </div>

      <div className="relative p-8 lg:p-12 bg-gradient-to-b from-[#1c1131] to-[#0a0514] border border-white/5 rounded-[4rem] shadow-2xl overflow-hidden">
        
        <div className="absolute top-8 left-8 z-50">
           <div className="flex flex-col gap-2 p-5 bg-purple-600/10 border border-purple-500/20 rounded-3xl backdrop-blur-xl">
              <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
                <Coins className="w-3 h-3" /> NEURAL BOUNTY POOL
              </span>
              <div className="flex gap-4 mt-2">
                {[1, 2, 3, 4, 5].map(rank => (
                   <React.Fragment key={rank}>
                      <div className="text-center">
                        <p className={`text-[12px] font-black font-mono ${rank === 1 ? 'text-yellow-400' : 'text-white/60'}`}>{formatPoints(prizes[rank as keyof typeof prizes])}</p>
                        <p className="text-[7px] font-mono text-white/30 uppercase">{rank === 1 ? '1ST' : rank === 2 ? '2ND' : rank === 3 ? '3RD' : `${rank}TH`}</p>
                      </div>
                      {rank < 5 && <div className="w-[1px] h-6 bg-white/10 mt-1"></div>}
                   </React.Fragment>
                ))}
              </div>
           </div>
        </div>

        <div className="absolute top-8 right-8 z-50 flex gap-4">
           <button 
             onClick={() => generateFullPodiumImage(topResults, totalPool)}
             className="group/btn flex items-center gap-3 px-8 py-4 bg-yellow-400 text-black rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-yellow-300 transition-all active:scale-95 shadow-[0_0_30px_rgba(251,191,36,0.3)]"
           >
             <Save className="w-4 h-4" />
             SAVE PENTAGON CARD
           </button>
           <button 
             onClick={() => archivePodiumReport(topResults)}
             className="flex items-center gap-3 px-6 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
           >
             <Archive className="w-4 h-4" />
             ARCHIVE
           </button>
        </div>

        <div className="flex flex-col lg:flex-row items-end justify-center gap-4 lg:gap-2 relative z-10 pt-32">
          {podiumLayout.map((result, index) => {
            if (!result) return <div key={index} className="hidden lg:block flex-1"></div>;
            const rank = topResults.indexOf(result) + 1;
            const c = config[rank];

            return (
              <div key={result.id} className="flex-1 w-full flex flex-col items-center animate-in slide-in-from-bottom duration-700" style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }}>
                <div className="mb-6 relative group">
                  <div className={`w-28 h-28 lg:w-32 lg:h-32 rounded-[2rem] overflow-hidden border-2 ${c.borderColor} shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3`}>
                    <img src={result.imageUrl} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>
                  <div className="absolute -top-4 -right-4 scale-75 lg:scale-100">{c.icon}</div>
                  <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-black border ${c.borderColor} rounded-xl shadow-2xl`}>
                    <span className={`text-[8px] font-black uppercase tracking-widest ${c.textColor}`}>{c.label}</span>
                  </div>
                </div>

                <div className={`w-full bg-gradient-to-b ${c.stepColor} border-t-2 border-x-2 ${c.borderColor} ${c.stepHeight} ${c.glow} rounded-t-[2.5rem] flex flex-col items-center pt-8 px-4 text-center relative overflow-hidden`}>
                  <span className={`text-4xl font-black mb-3 ${c.textColor}`}>#{rank}</span>
                  <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{result.name}</h3>
                  <p className="text-[9px] font-mono text-purple-400/60 uppercase tracking-widest mb-1">{result.score.toFixed(2)} GRADE</p>
                  <p className="text-[8px] font-mono text-white/30 uppercase tracking-[0.2em] mb-4">{c.reward}</p>
                  
                  <button 
                    onClick={() => downloadImage(result.imageUrl, result.name)}
                    className="mt-auto mb-6 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                    title="Download artifact"
                  >
                    <Download className="w-4 h-4 text-white/40" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const NeuralGauge = ({ score }: { score: number }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [tickAnimationProgress, setTickAnimationProgress] = useState(0);
  
  useEffect(() => {
    const scoreTimeout = setTimeout(() => setAnimatedScore(score), 100);
    const tickTimeout = setTimeout(() => setTickAnimationProgress(1), 400);
    return () => {
      clearTimeout(scoreTimeout);
      clearTimeout(tickTimeout);
    };
  }, [score]);

  const size = 220;
  const strokeWidth = 12;
  const center = size / 2;
  const radius = center - strokeWidth - 20; 
  const circumference = 2 * Math.PI * radius;
  
  const offset = circumference * (1 - (animatedScore / 10));

  const getStatus = () => {
    if (score >= 8.5) return { label: 'TRANSCENDENT', color: 'text-emerald-400', icon: <Crown className="w-4 h-4" /> };
    if (score >= 7.0) return { label: 'SKILLED HUMAN', color: 'text-indigo-400', icon: <ShieldCheck className="w-4 h-4" /> };
    if (score >= 4.0) return { label: 'DECEPTIVE SLOP', color: 'text-amber-400', icon: <AlertTriangle className="w-4 h-4" /> };
    return { label: 'CRITICAL SLOP', color: 'text-rose-500', icon: <Activity className="w-4 h-4" /> };
  };

  const getColor = () => {
    if (score >= 8.5) return '#10b981'; 
    if (score >= 7.0) return '#6366f1'; 
    if (score >= 4.0) return '#f59e0b'; 
    return '#f43f5e'; 
  };

  const status = getStatus();
  const mainColor = getColor();

  return (
    <div className="relative flex flex-col items-center group">
      <div 
        className="absolute inset-0 blur-[60px] opacity-10 transition-all duration-1000 scale-150 rounded-full"
        style={{ backgroundColor: mainColor }}
      />

      <div className="relative w-full max-w-[220px] aspect-square">
        <svg 
          viewBox={`0 0 ${size} ${size}`} 
          className="transform -rotate-90 w-full h-full transition-all duration-700 group-hover:scale-105"
        >
          <defs>
            <radialGradient id={`glow-${score}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={mainColor} stopOpacity="0.4" />
              <stop offset="100%" stopColor={mainColor} stopOpacity="0" />
            </radialGradient>
            
            <linearGradient id={`sweepGrad-${score}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={mainColor} stopOpacity="0" />
              <stop offset="100%" stopColor={mainColor} stopOpacity="0.6" />
            </linearGradient>
          </defs>

          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth={strokeWidth}
          />
          
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={mainColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ 
              transition: 'stroke-dashoffset 1.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
              filter: `drop-shadow(0 0 10px ${mainColor}66)`
            }}
          />

          <g className="animate-spin-slow origin-center" style={{ animationDuration: '4s' }}>
            <line
              x1={center}
              y1={center}
              x2={center + radius + 15}
              y2={center}
              stroke={`url(#sweepGrad-${score})`}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx={center + radius} cy={center} r="3" fill={mainColor} className="animate-pulse" />
          </g>

          {Array.from({ length: 21 }).map((_, i) => {
            const angle = (i * 18); 
            const isFilled = (i / 2) <= animatedScore;
            const delay = i * 0.05;
            
            return (
              <line
                key={i}
                x1={center + (radius + 15) * Math.cos((angle * Math.PI) / 180)}
                y1={center + (radius + 15) * Math.sin((angle * Math.PI) / 180)}
                x2={center + (radius + (i % 2 === 0 ? 30 : 22)) * Math.cos((angle * Math.PI) / 180)}
                y2={center + (radius + (i % 2 === 0 ? 30 : 22)) * Math.sin((angle * Math.PI) / 180)}
                stroke={isFilled ? mainColor : "rgba(255,255,255,0.08)"}
                strokeWidth={i % 2 === 0 ? "3" : "1.5"}
                className="transition-all"
                style={{ 
                  opacity: tickAnimationProgress,
                  transform: `scale(${tickAnimationProgress})`,
                  transformOrigin: 'center',
                  transitionDelay: `${delay}s`,
                  transitionDuration: '0.4s',
                  filter: isFilled ? `drop-shadow(0 0 3px ${mainColor}44)` : 'none'
                }}
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center translate-y-2">
            <span className="text-[10px] font-black text-white/20 tracking-[0.3em] uppercase mb-1">FIDELITY</span>
            <div className="flex items-baseline gap-1">
              <span className="text-6xl font-black text-white tracking-tighter tabular-nums drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                {animatedScore.toFixed(2)}
              </span>
            </div>
            <div className={`mt-4 px-4 py-1.5 rounded-2xl border bg-black/60 backdrop-blur-xl flex items-center gap-2 transition-all duration-700 border-white/10 ${status.color} shadow-2xl`}>
               <div className="animate-pulse">{status.icon}</div>
               <span className="text-[9px] font-black uppercase tracking-widest">{status.label}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full mt-10 flex justify-between text-[9px] font-black font-mono uppercase tracking-[0.2em] px-4 opacity-40">
        <span className={score < 4 ? status.color : ''}>SLOP</span>
        <span className={score >= 4 && score < 7 ? status.color : ''}>DECEPTIVE</span>
        <span className={score >= 7 ? status.color : ''}>HUMAN</span>
      </div>
      
      <div className="absolute inset-x-0 bottom-[-20px] h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent animate-scan" />
    </div>
  );
};

const AnalysisCard: React.FC<{ result: AnalysisResult; onDelete: (id: string) => void; rank?: number }> = ({ result, onDelete, rank }) => {
  const [showDetails, setShowDetails] = useState(false);
  const isWinner = rank !== undefined && rank <= 5;
  const config = {
    1: 'border-yellow-500/50 shadow-[0_0_80px_rgba(245,158,11,0.15)] ring-2 ring-yellow-500/20',
    2: 'border-slate-400/40 shadow-[0_0_80px_rgba(148,163,184,0.1)] ring-2 ring-slate-400/20',
    3: 'border-amber-700/40 shadow-[0_0_80px_rgba(180,83,9,0.1)] ring-2 ring-amber-700/20',
    4: 'border-indigo-500/40 shadow-[0_0_80px_rgba(99,102,241,0.1)] ring-2 ring-indigo-500/20',
    5: 'border-purple-500/40 shadow-[0_0_80px_rgba(168,85,247,0.1)] ring-2 ring-purple-500/20'
  } as Record<number, string>;

  return (
    <>
      <motion.div 
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.5 }}
        className={`group relative bg-[#1c1131] border rounded-[2rem] overflow-visible transition-all duration-700 hover:-translate-y-4 ${isWinner ? config[rank] : 'border-white/5 hover:border-purple-500/30 shadow-2xl'}`}
      >
        <div className="aspect-square overflow-hidden relative rounded-t-[2rem]">
          <img src={result.imageUrl} alt={result.name} className={`w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 ${isWinner ? 'grayscale-0' : 'grayscale-[0.4] group-hover:grayscale-0'}`} />
          <div className="absolute top-6 right-6 flex flex-col gap-3 z-40">
             <button onClick={() => onDelete(result.id)} className="p-3 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl text-white/50 hover:text-rose-400 transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-5 h-5" /></button>
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/10 to-transparent h-1/2 w-full animate-scan pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
        <div className="p-8 pt-6 relative rounded-b-[2rem]">
          <div className="flex justify-between items-start mb-10">
            <div className="flex-1 min-w-0 pr-4">
              <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-purple-300 transition-colors truncate">{result.name}</h3>
              <p className="text-[10px] font-mono text-purple-400/60 uppercase tracking-widest flex items-center gap-2"><Microscope className="w-3 h-3" />ID: {result.id.slice(0, 8)}</p>
            </div>
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-widest whitespace-nowrap ${result.isAiGenerated ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
              {result.isAiGenerated ? 'AI SLOP' : 'HUMAN'}
            </div>
          </div>
          
          <NeuralGauge score={result.score} />
          
          <div className="mt-10 flex gap-4">
            <button onClick={() => setShowDetails(true)} className="flex-1 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.3)]"><Fingerprint className="w-4 h-4" />INTEL REPORT</button>
            <button onClick={() => downloadImage(result.imageUrl, result.name)} className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/50 hover:text-white transition-all"><Download className="w-5 h-5" /></button>
          </div>
        </div>
      </motion.div>
      <Modal isOpen={showDetails} onClose={() => setShowDetails(false)}>
        <div className="flex flex-col gap-10">
          <div className="flex items-center gap-8">
            <div className="w-32 h-32 rounded-[2rem] overflow-hidden border-2 border-purple-500/30 shadow-2xl relative">
              <img src={result.imageUrl} className="w-full h-full object-cover" alt="" />
              <div className="absolute inset-0 border border-white/10 rounded-[2rem]" />
            </div>
            <div className="flex-1">
              <h2 className="text-5xl font-black text-white tracking-tighter mb-2">{result.name}</h2>
              <div className="flex items-center gap-2 text-purple-400 font-mono text-xs uppercase tracking-widest bg-purple-500/10 px-3 py-1 rounded-lg border border-purple-500/20 shadow-xl"><ShieldCheck className="w-3 h-3" />CERTAINTY: {result.confidence}%</div>
            </div>
          </div>
          <div className="p-8 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl">
            <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em] block mb-6">NEURAL LOGIC SUMMARY</span>
            <p className="text-white/90 leading-relaxed text-lg font-medium italic mb-6">"{result.reasoning}"</p>
            <div className="flex flex-wrap gap-2">
              {result.technicalDetails.map((detail, idx) => (
                <span key={idx} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-white/40 uppercase tracking-tighter">
                  {detail}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

const NeuralProgress: React.FC<{ current: number; total: number; currentFileName: string }> = ({ current, total, currentFileName }) => {
  const percentage = (current / total) * 100;
  
  return (
    <div className="w-full max-w-2xl bg-purple-900/10 border border-purple-500/30 rounded-3xl p-8 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500 mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg animate-pulse">
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-300">NEURAL DISSECTION IN PROGRESS</span>
        </div>
        <span className="text-xs font-mono text-purple-400 font-bold">{current} / {total} ARTIFACTS</span>
      </div>
      
      <div className="relative h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
        <div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-400 transition-all duration-700 ease-out shadow-[0_0_20px_rgba(139,92,246,0.5)]"
          style={{ width: `${percentage}%` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
      </div>
      
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <Loader2 className="w-3 h-3 text-purple-500 animate-spin" />
           <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">ANALYZING: <span className="text-white/80">{currentFileName}</span></p>
        </div>
        <span className="text-[10px] font-mono text-purple-500/60 uppercase">{percentage.toFixed(0)}%</span>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState({ current: 0, total: 0, fileName: '' });
  const [totalPool, setTotalPool] = useState<number>(100000);
  const [error, setError] = useState<string | null>(null);

  const rankedResults = useMemo(() => [...results].sort((a, b) => b.score - a.score), [results]);
  const topFive = useMemo(() => rankedResults.slice(0, 5), [rankedResults]);

  const leaderboard = useMemo(() => {
    const participants = Array.from(new Set(results.map(r => r.name))) as string[];
    return participants.map(name => ({
      id: Math.random().toString(36).substr(2, 9),
      username: name,
      points: results.filter(r => r.name === name).reduce((acc, curr) => acc + curr.score * 10, 0),
    })).sort((a, b) => b.points - a.points).slice(0, 10);
  }, [results]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsAnalyzing(true);
    setError(null);
    const filesArray = Array.from(files) as File[];
    setAnalysisProgress({ current: 0, total: filesArray.length, fileName: '' });
    
    let currentSessionScores = results.map(r => r.score);

    try {
      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        setAnalysisProgress(prev => ({ ...prev, current: i + 1, fileName: file.name }));
        
        const resizedBase64: string = await fastResize(file);
        const response = await analyzeImage(resizedBase64, file.type);
        
        let finalScore = response.score;
        
        while (currentSessionScores.includes(finalScore)) {
          const jitter = (Math.random() * 0.02 + 0.01) * (Math.random() > 0.5 ? 1 : -1);
          finalScore = parseFloat((finalScore + jitter).toFixed(2));
          finalScore = Math.max(1.00, Math.min(10.00, finalScore));
        }
        
        currentSessionScores.push(finalScore);

        const newResult: AnalysisResult = {
          id: Math.random().toString(36).substr(2, 9),
          imageUrl: resizedBase64,
          name: extractParticipant(file.name),
          score: finalScore,
          isAiGenerated: response.isAiGenerated,
          confidence: response.confidence,
          reasoning: response.reasoning,
          technicalDetails: response.technicalDetails,
          timestamp: Date.now(),
          status: 'success'
        };
        setResults(prev => [newResult, ...prev]);
      }
    } catch (err: any) {
      console.error("Analysis failed:", err);
      setError(err.message || "Analysis failed. Please check your API key configuration.");
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress({ current: 0, total: 0, fileName: '' });
      // Reset the file input so the same file can be uploaded again if needed
      e.target.value = '';
    }
  };

  const deleteResult = (id: string) => setResults(prev => prev.filter(r => r.id !== id));

  return (
    <div className="min-h-screen bg-[#0a0514] text-white font-sans selection:bg-purple-500/30 overflow-x-hidden pb-40">
      <Header />
      <main className="max-w-7xl mx-auto px-6">
        
        <div className="mb-12 flex justify-center">
          <div className="w-full max-w-md bg-purple-900/10 border border-purple-500/30 rounded-[2.5rem] p-6 backdrop-blur-md shadow-2xl transition-all hover:border-purple-500/50 group">
             <div className="flex items-center gap-4 mb-4">
                <Target className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-300">NEURAL BOUNTY CONFIGURATION</span>
             </div>
             <div className="relative">
                <input 
                  type="number" 
                  value={totalPool}
                  onChange={(e) => setTotalPool(Number(e.target.value))}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-2xl font-black font-mono text-purple-100 placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
                  placeholder="SET TOTAL POOL..."
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                  <span className="text-[10px] font-black text-purple-500 uppercase">PYTH PTS</span>
                </div>
             </div>
             <p className="mt-4 text-[9px] font-mono text-white/30 uppercase tracking-widest text-center">Distributed to Top 5 (40% | 25% | 15% | 12% | 8%)</p>
          </div>
        </div>

        <div className="mb-32 flex flex-col items-center">
          {isAnalyzing && analysisProgress.total > 0 && (
            <NeuralProgress 
              current={analysisProgress.current} 
              total={analysisProgress.total} 
              currentFileName={analysisProgress.fileName} 
            />
          )}

          <div className="w-full max-w-3xl relative">
            <div className="absolute -inset-4 bg-purple-600/20 blur-3xl rounded-[4rem]"></div>
            <label className={`flex flex-col items-center justify-center w-full h-96 border-2 border-dashed rounded-[4rem] cursor-pointer transition-all duration-700 group relative overflow-hidden shadow-2xl ${isAnalyzing ? 'border-purple-500 bg-purple-500/10' : 'border-purple-500/30 bg-white/5 hover:border-purple-500/60 hover:bg-purple-500/10'}`}>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isAnalyzing} multiple />
              <div className="relative z-10 flex flex-col items-center gap-8">
                <div className={`p-8 rounded-[2.5rem] transition-all shadow-2xl ${isAnalyzing ? 'bg-purple-600' : 'bg-purple-500/20 text-purple-400 group-hover:bg-purple-500 group-hover:text-white'}`}>
                  {isAnalyzing ? <Loader2 className="w-12 h-12 animate-spin" /> : <Upload className="w-12 h-12" />}
                </div>
                <div className="text-center px-10">
                  <p className="text-3xl font-black uppercase tracking-widest mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-400">{isAnalyzing ? 'FORENSICS ACTIVE...' : 'SUBMIT ARTIFACTS'}</p>
                  <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.4em]">{isAnalyzing ? 'DO NOT CLOSE LABORATORY' : 'DRAG & DROP OR CLICK TO UPLOAD'}</p>
                </div>
              </div>
            </label>
            
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute -bottom-24 left-0 right-0 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl backdrop-blur-md flex items-start gap-4 shadow-2xl"
                >
                  <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-1" />
                  <div className="flex-1">
                    <h4 className="text-rose-400 font-bold text-sm uppercase tracking-wider mb-1">Analysis Failed</h4>
                    <p className="text-rose-300/80 text-xs font-mono">{error}</p>
                    <p className="text-white/40 text-[10px] font-mono mt-2">If deployed on Vercel, ensure GEMINI_API_KEY is set in your Vercel Environment Variables.</p>
                  </div>
                  <button onClick={() => setError(null)} className="p-1 hover:bg-rose-500/20 rounded-lg text-rose-400 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {results.length > 0 && <WinnersPodium topResults={topFive} totalPool={totalPool} />}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-16">
            <div className="flex items-center justify-between px-4 border-l-4 border-yellow-400 py-2">
              <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-4"><Zap className="w-8 h-8 text-yellow-400 animate-pulse" />RECENT DISSECTIONS</h2>
            </div>
            {results.length === 0 ? (
              <div className="py-40 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[4rem] bg-white/2 shadow-inner"><ImageIcon className="w-12 h-12 text-white/10 mb-8" /><p className="text-white/30 font-mono uppercase tracking-[0.5em] text-xs">AWAITING INPUT</p></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <AnimatePresence mode="popLayout">
                  {results.map((result) => (
                    <AnalysisCard key={result.id} result={result} onDelete={deleteResult} rank={rankedResults.findIndex(r => r.id === result.id) + 1} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-16">
             <div className="p-10 bg-[#1c1131] border border-white/5 rounded-[3.5rem] relative overflow-hidden group shadow-2xl">
               <h2 className="text-2xl font-black uppercase tracking-tighter mb-12 flex items-center gap-4"><Award className="w-7 h-7 text-purple-400" />LAB ELITE</h2>
               <div className="space-y-8">
                 {leaderboard.length === 0 ? <p className="text-white/20 text-xs font-mono py-16 text-center uppercase tracking-[0.4em]">OFFLINE</p> : (
                   leaderboard.map((entry, i) => (
                     <div key={entry.id} className="flex items-center justify-between group/item transition-all hover:translate-x-3">
                       <div className="flex items-center gap-5">
                         <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 group-hover/item:border-purple-500/50 transition-all"><MedalIcon rank={i + 1} /></div>
                         <div className="min-w-0 pr-2"><p className="font-black text-base tracking-tight truncate">{entry.username}</p><p className="text-[10px] font-mono text-purple-400/60 uppercase">SENTRY</p></div>
                       </div>
                       <div className="text-right whitespace-nowrap"><p className="text-xl font-black font-mono leading-none tracking-tighter">{entry.points.toFixed(0)}</p><p className="text-[9px] font-mono text-white/30 uppercase font-bold">PTS</p></div>
                     </div>
                   ))
                 )}
               </div>
             </div>
             <div className="p-10 bg-gradient-to-br from-[#1c1131] to-[#0a0514] border border-purple-500/20 rounded-[3.5rem] shadow-2xl">
               <div className="flex items-center gap-4 mb-10"><TrendingUp className="w-7 h-7 text-indigo-400" /><h2 className="text-2xl font-black uppercase tracking-tighter">LAB METRICS</h2></div>
               <div className="space-y-8">
                 <div className="flex justify-between items-center py-4 border-b border-white/5"><span className="text-[11px] font-mono text-white/40 uppercase tracking-widest">TOTAL DISSECTIONS</span><span className="text-2xl font-black font-mono text-white">{results.length}</span></div>
                 <div className="flex justify-between items-center py-4"><span className="text-[11px] font-mono text-white/40 uppercase tracking-widest">SYSTEM INTEGRITY</span><span className="text-2xl font-black font-mono text-emerald-500">{results.length > 0 ? (results.reduce((acc, curr) => acc + curr.score, 0) / results.length).toFixed(2) : '0.00'}</span></div>
               </div>
             </div>
          </div>
        </div>
      </main>
      <footer className="mt-60 border-t border-white/5 py-32 px-6 text-center">
        <p className="text-[10px] font-black font-mono text-white/20 uppercase tracking-[1em]">Pythos Eyes LABORATORY • NEURAL ARCHIVE 2024</p>
      </footer>
    </div>
  );
};

export default App;