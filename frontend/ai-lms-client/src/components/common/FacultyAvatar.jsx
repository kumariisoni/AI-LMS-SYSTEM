import React from "react";

/**
 * Extracts initials for faculty names by stripping common academic/honorific prefixes
 * and taking the first letters of the first and second primary name tokens.
 *
 * Examples:
 * - Prof. Chetan Chudasma -> CC
 * - Prof. Papu Kumar Rai -> PK
 * - Prof. Partik Chauhan -> PC
 * - Prof. Kamlesh Patle -> KP
 * - Prof. Dr. Shiva Kumar Nadranjan -> SK
 * - Prof. Niraj Bhagchandani -> NB
 * - Prof. Sahir Suma -> SS
 */
export function getFacultyInitials(name) {
  if (!name || typeof name !== "string") return "FA";

  // Clean out common academic/honorific titles
  let clean = name.trim();
  const titlePattern = /^(prof\.|prof|dr\.|dr|professor|doctor|mr\.|mr|mrs\.|mrs|ms\.|ms|er\.|er)\s+/i;
  while (titlePattern.test(clean)) {
    clean = clean.replace(titlePattern, "").trim();
  }

  const tokens = clean.split(/\s+/).filter(Boolean);
  if (tokens.length >= 2) {
    return (tokens[0][0] + tokens[1][0]).toUpperCase();
  } else if (tokens.length === 1) {
    return tokens[0].slice(0, 2).toUpperCase();
  }
  return "FA";
}

/**
 * Curated harmonic gradients tailored for an EdTech faculty identity system.
 */
const GRADIENT_PALETTES = [
  "from-indigo-600 to-indigo-800 text-white shadow-indigo-500/20",
  "from-blue-600 to-indigo-700 text-white shadow-blue-500/20",
  "from-emerald-600 to-teal-800 text-white shadow-emerald-500/20",
  "from-violet-600 to-purple-800 text-white shadow-violet-500/20",
  "from-amber-600 to-orange-700 text-white shadow-amber-500/20",
  "from-sky-600 to-blue-800 text-white shadow-sky-500/20",
  "from-rose-600 to-pink-800 text-white shadow-rose-500/20",
  "from-teal-600 to-cyan-800 text-white shadow-teal-500/20",
];

function getPaletteIndex(str) {
  if (!str) return 0;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % GRADIENT_PALETTES.length;
}

/**
 * FacultyAvatar
 * Visual identity component for faculty directory, cards, and detail pages.
 * Never uses profile photos or stock images.
 */
export default function FacultyAvatar({
  name = "Faculty Member",
  size = "md",
  className = "",
  variant = "gradient", // "gradient" | "soft"
}) {
  const initials = getFacultyInitials(name);
  const palette = GRADIENT_PALETTES[getPaletteIndex(name)];

  const sizeClasses = {
    xs: "w-7 h-7 text-[10px] rounded-md",
    sm: "w-9 h-9 text-xs font-bold rounded-lg",
    md: "w-12 h-12 text-sm font-extrabold rounded-xl",
    lg: "w-14 h-14 text-base font-extrabold rounded-xl",
    xl: "w-20 h-20 text-2xl font-extrabold rounded-2xl",
    "2xl": "w-24 h-24 text-3xl font-extrabold rounded-2xl",
  };

  const styleClass =
    variant === "soft"
      ? "bg-indigo-50 text-indigo-700 border border-indigo-200/80"
      : `bg-linear-to-br ${palette} border border-white/25 shadow-xs`;

  return (
    <div
      role="img"
      aria-label={`${name}'s avatar (${initials})`}
      className={`inline-flex items-center justify-center shrink-0 font-sans tracking-tight select-none transition-transform duration-200 ${
        sizeClasses[size] || sizeClasses.md
      } ${styleClass} ${className}`}
    >
      <span className="leading-none">{initials}</span>
    </div>
  );
}
