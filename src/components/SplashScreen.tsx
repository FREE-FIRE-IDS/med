import { useEffect, useState } from "react";
import { Stethoscope, Pill, Sparkles } from "lucide-react";

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const leaveTimer = setTimeout(() => setLeaving(true), 5400);
    const doneTimer = setTimeout(() => onDone(), 6000);
    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#05060f] transition-opacity duration-500 ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
      style={{ perspective: "1400px" }}
    >
      {/* animated grid floor */}
      <div className="splash-grid pointer-events-none absolute inset-0 opacity-40" />
      {/* orbiting glows */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl splash-orb-a" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl splash-orb-b" />

      {/* orbiting pills */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 splash-orbit">
        {[0, 60, 120, 180, 240, 300].map((deg, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 h-8 w-8"
            style={{
              transform: `rotate(${deg}deg) translateX(240px) rotate(-${deg}deg)`,
            }}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-400/40 bg-cyan-400/10 shadow-[0_0_20px_rgba(34,211,238,0.5)]">
              <Pill className="h-4 w-4 text-cyan-300" />
            </div>
          </div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        {/* 3D doctor badge */}
        <div className="splash-badge" style={{ transformStyle: "preserve-3d" }}>
          <div className="relative flex h-32 w-32 items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 shadow-[0_20px_80px_-10px_rgba(139,92,246,0.7)]">
            <Stethoscope className="h-16 w-16 text-white drop-shadow-lg" />
            <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-indigo-600 shadow-lg">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* title */}
        <div className="splash-title flex flex-col items-center gap-2">
          <div
            className="text-4xl font-black tracking-widest sm:text-6xl"
            style={{ fontFamily: '"Orbitron", sans-serif' }}
          >
            <span className="bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(139,92,246,0.6)]">
              DOCTOR HAMZA
            </span>
          </div>
          <div
            className="text-2xl font-bold tracking-[0.4em] text-white/80 sm:text-3xl"
            style={{ fontFamily: '"Orbitron", sans-serif' }}
          >
            <span className="text-cyan-300">×</span> AHAD
          </div>
        </div>

        {/* subtitle */}
        <div className="splash-sub flex flex-col items-center gap-3">
          <div className="h-px w-40 bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
          <p className="text-xs uppercase tracking-[0.5em] text-white/60 sm:text-sm">
            Created by Ahad Official
          </p>
          <div className="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-cyan-300/80">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
            Initializing PHARM AI
          </div>
        </div>

        {/* loading bar */}
        <div className="mt-2 h-1 w-56 overflow-hidden rounded-full bg-white/10">
          <div className="splash-bar h-full w-full bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400" />
        </div>
      </div>

      <style>{`
        .splash-grid {
          background-image:
            linear-gradient(rgba(34,211,238,0.18) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,0.18) 1px, transparent 1px);
          background-size: 60px 60px;
          transform: perspective(600px) rotateX(65deg) translateY(20%);
          transform-origin: center bottom;
          mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
          animation: splashGrid 6s linear infinite;
        }
        @keyframes splashGrid {
          from { background-position: 0 0, 0 0; }
          to { background-position: 0 60px, 60px 0; }
        }
        .splash-orb-a {
          background: radial-gradient(circle, rgba(139,92,246,0.55), transparent 60%);
          animation: splashPulse 3s ease-in-out infinite;
        }
        .splash-orb-b {
          background: radial-gradient(circle, rgba(34,211,238,0.45), transparent 60%);
          animation: splashPulse 3s ease-in-out infinite 1.5s;
        }
        @keyframes splashPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
          50% { transform: translate(-50%, -50%) scale(1.15); opacity: 1; }
        }
        .splash-orbit { animation: splashSpin 8s linear infinite; }
        @keyframes splashSpin {
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .splash-badge {
          animation: splashBadge 5.4s cubic-bezier(.2,.9,.3,1.2) both;
        }
        @keyframes splashBadge {
          0%   { transform: rotateY(-180deg) rotateX(30deg) scale(0.3); opacity: 0; }
          25%  { transform: rotateY(0deg) rotateX(0deg) scale(1.1); opacity: 1; }
          50%  { transform: rotateY(15deg) rotateX(-8deg) scale(1); }
          75%  { transform: rotateY(-15deg) rotateX(8deg) scale(1); }
          100% { transform: rotateY(0deg) rotateX(0deg) scale(1); }
        }
        .splash-title {
          animation: splashRise 1s ease-out 0.6s both;
        }
        .splash-sub {
          animation: splashRise 1s ease-out 1.1s both;
        }
        @keyframes splashRise {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .splash-bar {
          transform-origin: left;
          animation: splashBar 5.4s cubic-bezier(.4,0,.2,1) both;
        }
        @keyframes splashBar {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
}
