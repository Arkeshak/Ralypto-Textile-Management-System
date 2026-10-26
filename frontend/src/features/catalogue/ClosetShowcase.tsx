import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Layers, Sparkles } from "lucide-react";

/* ----------------------------- DATA (replace with API) ----------------------------- */

type Side = "front" | "back";

export type Garment = {
  id: string;
  name: string;
  top: string; // upper body colour
  bottom: string; // lower body colour
  trim: string;
  tags: [string, string]; // colour names on the hanging tags
  tagColors: [string, string];
  sizes: { size: string; stock: number }[];
  /** Real photos (transparent WebP/PNG, garment on hanger). If missing or broken, the SVG drawing is used. */
  images?: { front: string; back: string };
};

export type FabricRoll = {
  id: string;
  name: string;
  color: string;
  shadeLot: string;
  fabricType: string;
  lengthMeters: number;
  inStock: boolean;
  image?: string;
};

const defaultGarments: Garment[] = [
  {
    id: "g1",
    images: { front: "/closet/g1-front.webp", back: "/closet/g1-back.webp" },
    name: "Slate Linen Shirt",
    top: "#94a3b8",
    bottom: "#64748b",
    trim: "#ffffff",
    tags: ["Slate", "Navy"],
    tagColors: ["#64748b", "#1e3a8a"],
    sizes: [{ size: "S", stock: 12 }, { size: "M", stock: 7 }, { size: "L", stock: 0 }, { size: "XL", stock: 4 }],
  },
  {
    id: "g2",
    images: { front: "/closet/g2-front.webp", back: "/closet/g2-back.webp" },
    name: "Rust Cotton Tee",
    top: "#a8553a",
    bottom: "#7c3a26",
    trim: "#f5e6dc",
    tags: ["Rust", "Cream"],
    tagColors: ["#a8553a", "#f5e6dc"],
    sizes: [{ size: "S", stock: 3 }, { size: "M", stock: 9 }, { size: "L", stock: 11 }, { size: "XL", stock: 0 }],
  },
  {
    id: "g3",
    images: { front: "/closet/g3-front.webp", back: "/closet/g3-back.webp" },
    name: "Mesh Tank Top",
    top: "#2f4fbf",
    bottom: "#111827",
    trim: "#ffffff",
    tags: ["Black", "Blue"],
    tagColors: ["#111827", "#2f5bff"],
    sizes: [{ size: "S", stock: 8 }, { size: "M", stock: 14 }, { size: "L", stock: 5 }, { size: "XL", stock: 2 }],
  },
  {
    id: "g4",
    images: { front: "/closet/g4-front.webp", back: "/closet/g4-back.webp" },
    name: "Charcoal Batik Tee",
    top: "#4b5563",
    bottom: "#1f2937",
    trim: "#e5e7eb",
    tags: ["Charcoal", "Grey"],
    tagColors: ["#374151", "#9ca3af"],
    sizes: [{ size: "S", stock: 6 }, { size: "M", stock: 0 }, { size: "L", stock: 3 }, { size: "XL", stock: 9 }],
  },
  {
    id: "g5",
    images: { front: "/closet/g5-front.webp", back: "/closet/g5-back.webp" },
    name: "Coral Handloom Tank",
    top: "#e5584f",
    bottom: "#b3342d",
    trim: "#fff1ef",
    tags: ["Coral", "Red"],
    tagColors: ["#e5584f", "#b3342d"],
    sizes: [{ size: "S", stock: 10 }, { size: "M", stock: 6 }, { size: "L", stock: 2 }, { size: "XL", stock: 1 }],
  },
];

const defaultRolls: FabricRoll[] = [
  { id: "r1", name: "Imperial Navy Twill", color: "#1e293b", shadeLot: "LOT-882", fabricType: "Egyptian Cotton", lengthMeters: 45.5, inStock: true },
  { id: "r2", name: "Crimson Maroon Raw Silk", color: "#881337", shadeLot: "LOT-901", fabricType: "Mulberry Silk", lengthMeters: 28.0, inStock: true },
  { id: "r3", name: "Natural Ecru Linen", color: "#f5ebe0", shadeLot: "LOT-714", fabricType: "Pure Linen", lengthMeters: 62.0, inStock: true },
  { id: "r4", name: "Emerald Forest Weave", color: "#064e3b", shadeLot: "LOT-552", fabricType: "Poly-Cotton Blend", lengthMeters: 14.5, inStock: true },
  { id: "r5", name: "Mustard Spice Handloom", color: "#d97706", shadeLot: "LOT-429", fabricType: "Organic Handloom Cotton", lengthMeters: 38.0, inStock: true },
];

/* ----------------------------- GARMENT DRAWING (SVG) ----------------------------- */

function Hanger() {
  return (
    <g fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round">
      <path d="M100 6 C100 -2 112 -2 112 7 C112 12 104 13 100 18 L100 24" />
      <path d="M100 24 L58 40 M100 24 L142 40" />
    </g>
  );
}

function GarmentView({ g, side, uid }: { g: Garment; side: Side; uid: string }) {
  const [failed, setFailed] = useState(false);
  if (g.images && !failed) {
    return (
      <img
        src={g.images[side]}
        alt={`${g.name}, ${side}`}
        decoding="async"
        draggable={false}
        onError={() => setFailed(true)}
        className="h-full w-full select-none object-contain drop-shadow-[0_18px_18px_rgba(0,0,0,0.18)]"
      />
    );
  }
  const gradId = `grad-${uid}`;
  const body =
    "M72 38 L84 38 Q100 " + (side === "front" ? "70" : "52") + " 116 38 L128 38 " +
    "Q134 76 158 96 L152 238 Q100 252 48 238 L42 96 Q66 76 72 38 Z";
  const neck = "M84 38 Q100 " + (side === "front" ? "70" : "52") + " 116 38";
  return (
    <svg viewBox="0 0 200 260" className="h-full w-full overflow-visible">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={g.top} />
          <stop offset="55%" stopColor={g.top} />
          <stop offset="100%" stopColor={g.bottom} />
        </linearGradient>
      </defs>
      <Hanger />
      <path d={body} fill={`url(#${gradId})`} stroke="rgba(0,0,0,0.25)" strokeWidth="1" />
      <path d={neck} fill="none" stroke={g.trim} strokeWidth="4" strokeLinecap="round" />
      <path d="M48 238 Q100 252 152 238" fill="none" stroke={g.trim} strokeWidth="3" opacity="0.7" />
      {/* soft fabric folds */}
      <path d="M78 110 Q82 170 76 230" stroke="rgba(255,255,255,0.18)" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M126 110 Q120 170 128 230" stroke="rgba(0,0,0,0.15)" strokeWidth="6" fill="none" strokeLinecap="round" />
      {side === "front" && (
        <text
          x="100"
          y="128"
          textAnchor="middle"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontStyle="italic"
          fontWeight="700"
          fontSize="22"
          fill={g.trim}
          stroke="rgba(0,0,0,0.35)"
          strokeWidth="0.6"
        >
          Ralypto
        </text>
      )}
      {side === "back" && (
        <text x="100" y="96" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="10" letterSpacing="2" fill={g.trim} opacity="0.9">
          {g.id.toUpperCase()}
        </text>
      )}
    </svg>
  );
}

function FabricRollView({ roll }: { roll: FabricRoll }) {
  const [failed, setFailed] = useState(false);
  if (roll.image && !failed) {
    return (
      <img
        src={roll.image}
        alt={roll.name}
        decoding="async"
        draggable={false}
        onError={() => setFailed(true)}
        className="h-full w-full select-none object-contain drop-shadow-[0_18px_18px_rgba(0,0,0,0.18)]"
      />
    );
  }
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center p-4">
      {/* Visual bolt of fabric standing upright */}
      <div
        className="relative h-64 w-28 rounded-2xl shadow-2xl transition-transform hover:scale-105"
        style={{
          background: `linear-gradient(135deg, ${roll.color}ee, ${roll.color})`,
          boxShadow: `0 20px 25px -5px ${roll.color}44`,
        }}
      >
        {/* Cardboard core top */}
        <div className="absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 rounded-full border-2 border-amber-800/40 bg-amber-100 shadow-inner flex items-center justify-center">
          <div className="h-3 w-8 rounded-full bg-amber-900/60" />
        </div>
        {/* Fabric folds sheen */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 via-transparent to-black/30 pointer-events-none" />
        {/* Label strip wrapped around bolt */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 bg-white/95 backdrop-blur-sm py-2 px-1 text-center shadow-md border-y border-slate-200">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-800 truncate">{roll.shadeLot}</p>
          <p className="text-[8px] font-semibold text-slate-500 truncate">{roll.fabricType}</p>
        </div>
      </div>
    </div>
  );
}

function HangTag({ color, label, delay }: { color: string; label: string; delay: number }) {
  return (
    <motion.div
      style={{ transformOrigin: "50% 0%" }}
      animate={{ rotate: [-4, 4, -4] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay }}
      className="flex flex-col items-center"
    >
      <span className="h-5 w-px bg-slate-400" />
      <span
        className="grid h-14 w-7 place-items-center rounded-[4px] shadow-md"
        style={{ background: color }}
        aria-label={label}
      >
        <span
          className="text-[8px] font-bold tracking-widest"
          style={{
            writingMode: "vertical-rl",
            color: color === "#f5e6dc" || color === "#9ca3af" ? "#111827" : "#fff",
          }}
        >
          {label.toUpperCase()}
        </span>
      </span>
    </motion.div>
  );
}

/* ----------------------------- PAGE COMPONENT ----------------------------- */

interface ClosetShowcaseProps {
  customGarments?: Garment[];
  customRolls?: FabricRoll[];
  initialMode?: "garments" | "rolls";
  onSelectProduct?: (item: Garment | FabricRoll) => void;
}

export default function ClosetShowcase({
  customGarments,
  customRolls,
  initialMode = "garments",
  onSelectProduct,
}: ClosetShowcaseProps) {
  const [viewMode, setViewMode] = useState<"garments" | "rolls">(initialMode);
  const [index, setIndex] = useState(2);
  const [side, setSide] = useState<Side>("front");
  const [open, setOpen] = useState(false);

  const activeGarments = customGarments && customGarments.length > 0 ? customGarments : defaultGarments;
  const activeRolls = customRolls && customRolls.length > 0 ? customRolls : defaultRolls;

  const itemCount = viewMode === "garments" ? activeGarments.length : activeRolls.length;

  const go = useCallback(
    (dir: 1 | -1) => {
      setIndex((i) => Math.min(itemCount - 1, Math.max(0, i + dir)));
      setOpen(false);
    },
    [itemCount]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  // Preload adjacent images
  useEffect(() => {
    if (viewMode === "garments") {
      const prev = activeGarments[index - 1];
      const next = activeGarments[index + 1];
      [prev, next].forEach((g) => {
        if (g?.images) {
          const imgF = new Image();
          imgF.src = g.images.front;
          const imgB = new Image();
          imgB.src = g.images.back;
        }
      });
    }
  }, [index, viewMode, activeGarments]);

  const currentGarment = activeGarments[Math.min(index, activeGarments.length - 1)];
  const currentRoll = activeRolls[Math.min(index, activeRolls.length - 1)];

  return (
    <section className="relative flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 px-4 py-8 rounded-3xl border border-slate-200/70 shadow-sm">
      {/* Top Controls: Mode Switcher (Finished Goods Closet vs Fabric Roll Shelf) */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex rounded-xl bg-slate-200/70 p-1 shadow-inner">
          <button
            onClick={() => {
              setViewMode("garments");
              setIndex(Math.min(index, activeGarments.length - 1));
            }}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              viewMode === "garments"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Garment Showcase</span>
          </button>
          <button
            onClick={() => {
              setViewMode("rolls");
              setIndex(Math.min(index, activeRolls.length - 1));
            }}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              viewMode === "rolls"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>Fabric Roll Shelf</span>
          </button>
        </div>
      </div>

      {/* Stage with touch swipe support (drag="x") */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.x > 80 && index > 0) {
            go(-1);
          } else if (info.offset.x < -80 && index < itemCount - 1) {
            go(1);
          }
        }}
        className="relative h-[340px] w-full max-w-5xl sm:h-[400px] cursor-grab active:cursor-grabbing touch-pan-y"
      >
        {viewMode === "garments"
          ? activeGarments.map((g, i) => {
              const offset = i - index;
              const abs = Math.abs(offset);
              if (abs > 3) return null;
              const centered = offset === 0;
              return (
                <motion.button
                  key={g.id}
                  type="button"
                  aria-label={`Show ${g.name}`}
                  onClick={() => {
                    setIndex(i);
                    setOpen(false);
                  }}
                  initial={false}
                  animate={{
                    x: offset * 190 + Math.sign(offset) * (centered ? 0 : 30),
                    scale: centered ? 1 : 0.72,
                    opacity: centered ? 1 : Math.max(0.25, 0.7 - abs * 0.15),
                    filter: `blur(${centered ? 0 : 5 + abs * 2}px)`,
                    zIndex: 10 - abs,
                  }}
                  transition={{ type: "spring", stiffness: 140, damping: 20 }}
                  className="absolute left-1/2 top-0 -ml-[110px] h-full w-[220px] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  style={{ pointerEvents: centered ? "none" : "auto" }}
                >
                  {/* centre garment swings gently on its hanger */}
                  <motion.div
                    style={{ transformOrigin: "50% 0%" }}
                    animate={centered ? { rotate: [-1.2, 1.2, -1.2] } : { rotate: 0 }}
                    transition={centered ? { duration: 5, repeat: Infinity, ease: "easeInOut" } : { duration: 0.4 }}
                    className="h-full w-full"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={centered ? side : "front"}
                        initial={{ rotateY: 90, opacity: 0 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        exit={{ rotateY: -90, opacity: 0 }}
                        transition={{ duration: 0.28, ease: "easeInOut" }}
                        className="h-full w-full"
                        style={{ perspective: 800 }}
                      >
                        <GarmentView g={g} side={centered ? side : "front"} uid={`${g.id}-${centered ? side : "f"}`} />
                      </motion.div>
                    </AnimatePresence>
                  </motion.div>
                </motion.button>
              );
            })
          : activeRolls.map((roll, i) => {
              const offset = i - index;
              const abs = Math.abs(offset);
              if (abs > 3) return null;
              const centered = offset === 0;
              return (
                <motion.button
                  key={roll.id}
                  type="button"
                  aria-label={`Show ${roll.name}`}
                  onClick={() => {
                    setIndex(i);
                    setOpen(false);
                  }}
                  initial={false}
                  animate={{
                    x: offset * 190 + Math.sign(offset) * (centered ? 0 : 30),
                    scale: centered ? 1 : 0.72,
                    opacity: centered ? 1 : Math.max(0.25, 0.7 - abs * 0.15),
                    filter: `blur(${centered ? 0 : 5 + abs * 2}px)`,
                    zIndex: 10 - abs,
                  }}
                  transition={{ type: "spring", stiffness: 140, damping: 20 }}
                  className="absolute left-1/2 top-0 -ml-[110px] h-full w-[220px] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                  style={{ pointerEvents: centered ? "none" : "auto" }}
                >
                  <motion.div
                    animate={centered ? { y: [0, -4, 0] } : { y: 0 }}
                    transition={centered ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.4 }}
                    className="h-full w-full"
                  >
                    <FabricRollView roll={roll} />
                  </motion.div>
                </motion.button>
              );
            })}

        {/* hanging tags on the centre garment (in garment view) */}
        {viewMode === "garments" && currentGarment && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentGarment.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute left-1/2 top-[18%] z-20 ml-[74px] flex gap-1 pointer-events-none"
            >
              <HangTag color={currentGarment.tagColors[0]} label={currentGarment.tags[0]} delay={0} />
              <HangTag color={currentGarment.tagColors[1]} label={currentGarment.tags[1]} delay={0.5} />
            </motion.div>
          </AnimatePresence>
        )}

        {/* Navigation Arrows */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            go(-1);
          }}
          disabled={index === 0}
          aria-label="Previous item"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-30 grid h-12 w-12 place-items-center rounded-full bg-white shadow-lg border border-slate-200 text-slate-700 hover:text-blue-600 disabled:opacity-30 transition-all hover:scale-105"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            go(1);
          }}
          disabled={index === itemCount - 1}
          aria-label="Next item"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-30 grid h-12 w-12 place-items-center rounded-full bg-white shadow-lg border border-slate-200 text-slate-700 hover:text-blue-600 disabled:opacity-30 transition-all hover:scale-105"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </motion.div>

      {/* Name and Specifications */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode === "garments" ? currentGarment?.id : currentRoll?.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
          className="mt-5 text-center space-y-1"
        >
          <h2 className="text-base sm:text-lg font-bold uppercase tracking-[0.16em] text-slate-900">
            {viewMode === "garments" ? currentGarment?.name : currentRoll?.name}
          </h2>
          {viewMode === "rolls" && currentRoll && (
            <p className="text-xs font-semibold text-slate-500">
              Shade: <span className="font-bold text-slate-700">{currentRoll.shadeLot}</span> · Fabric: <span className="font-bold text-slate-700">{currentRoll.fabricType}</span> · Length: <span className="font-bold text-emerald-600">{currentRoll.lengthMeters} m</span>
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Front / Back Toggle for Garments */}
      {viewMode === "garments" && (
        <div
          role="tablist"
          aria-label="Garment side"
          className="relative mt-4 flex h-10 w-48 rounded-full border border-slate-900 bg-white p-1 shadow-sm"
        >
          {(["front", "back"] as Side[]).map((s) => (
            <button
              key={s}
              role="tab"
              aria-selected={side === s}
              onClick={() => setSide(s)}
              className="relative z-10 flex-1 text-xs font-bold uppercase tracking-widest transition-colors"
            >
              {side === s && (
                <motion.span
                  layoutId="side-thumb"
                  className="absolute inset-0 -z-10 rounded-full bg-slate-900"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                />
              )}
              <span className={side === s ? "text-white" : "text-slate-600"}>{s}</span>
            </button>
          ))}
        </div>
      )}

      {/* Availability / Live Stock Toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="mt-4 border-b border-slate-400 pb-0.5 text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-slate-900 transition-colors"
      >
        {open ? "Hide availability" : "See availability"}
      </button>

      {/* Stock Panel */}
      <AnimatePresence initial={false}>
        {open && viewMode === "garments" && currentGarment && (
          <motion.div
            key={currentGarment.id + "-stock"}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <ul className="mt-4 flex flex-wrap justify-center gap-3">
              {currentGarment.sizes.map((s, i) => {
                const out = s.stock === 0;
                const low = s.stock > 0 && s.stock <= 3;
                return (
                  <motion.li
                    key={s.size}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className={`w-24 rounded-xl border px-3 py-2 text-center transition-transform hover:scale-105 ${
                      out
                        ? "border-red-300 bg-red-50 text-red-700"
                        : low
                        ? "border-yellow-300 bg-yellow-50 text-yellow-800"
                        : "border-emerald-300 bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    <p className="text-base font-bold">{s.size}</p>
                    <p className="text-xs font-semibold">{out ? "Out of stock" : `${s.stock} in stock`}</p>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        )}

        {open && viewMode === "rolls" && currentRoll && (
          <motion.div
            key={currentRoll.id + "-stock"}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="mt-4 flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-center">
                <span className="text-xs font-semibold text-slate-500">Available Length</span>
                <p className="text-xl font-bold text-emerald-600">{currentRoll.lengthMeters} m</p>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="text-center">
                <span className="text-xs font-semibold text-slate-500">Dye / Shade</span>
                <p className="text-sm font-bold text-slate-800">{currentRoll.shadeLot}</p>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="text-center">
                <span className="text-xs font-semibold text-slate-500">Status</span>
                <p className="text-sm font-bold text-emerald-600">In Stock</p>
              </div>
            </div>
            {onSelectProduct && (
              <div className="mt-3 text-center">
                <button
                  onClick={() => onSelectProduct(currentRoll)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors"
                >
                  Open Roll Ledger Details in Drawer &rarr;
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
