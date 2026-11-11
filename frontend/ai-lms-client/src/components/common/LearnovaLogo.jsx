import { Link } from "react-router-dom";

export default function LearnovaLogo({
  to = "/",
  size = "md",
  showSubtitle = false,
  subtitle = "AI Learning Platform",
  className = "",
  clickable = true
}) {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-11 h-11",
    xl: "w-14 h-14"
  };

  const textSizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl"
  };

  const aiBadgeSizes = {
    sm: "text-[10px] px-1 py-0.2",
    md: "text-xs px-1.5 py-0.5",
    lg: "text-xs px-2 py-0.5",
    xl: "text-sm px-2.5 py-1"
  };

  const content = (
    <div className={`inline-flex items-center gap-2.5 select-none group ${className}`}>
      <div className="relative flex items-center justify-center flex-shrink-0">
        <div className="absolute inset-0 bg-cyan-500/20 blur-md rounded-full group-hover:bg-cyan-400/30 transition-all"></div>
        <img
          src="/learnova-icon.png"
          alt="Learnova AI"
          className={`${iconSizes[size] || iconSizes.md} object-contain relative z-10 transition-transform duration-200 group-hover:scale-105 drop-shadow-[0_2px_8px_rgba(6,182,212,0.3)]`}
        />
      </div>

      <div className="flex flex-col">
        <div className={`font-serif font-black tracking-tight text-white flex items-center gap-1.5 leading-none ${textSizes[size] || textSizes.md}`}>
          <span>Learnova</span>
          <span className={`font-sans font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent border border-cyan-500/30 rounded-md bg-cyan-950/60 ${aiBadgeSizes[size] || aiBadgeSizes.md}`}>
            AI
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[10px] font-sans font-semibold text-cyan-400/80 uppercase tracking-widest mt-0.5">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );

  if (clickable) {
    return (
      <Link to={to} className="inline-flex items-center focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
