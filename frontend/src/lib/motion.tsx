/**
 * Ralypto motion kit (framer-motion).
 * One place for all animation. Import from here. Do not write ad-hoc animations in screens.
 *
 * Rules for counter / POS / storekeeper screens:
 *  - Keep each animation under 250 ms.
 *  - No infinite loops (only the Offline dot may pulse).
 *  - Motion must never block a tap.
 */
import { useEffect } from "react";
import type { ReactNode } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  MotionConfig,
  motion,
  type Transition,
  type Variants,
} from "framer-motion";

/* ----------------------------- PRESETS ----------------------------- */

export const spring: Transition = { type: "spring", stiffness: 380, damping: 32 };
export const softSpring: Transition = { type: "spring", stiffness: 140, damping: 20 };
export const quick: Transition = { duration: 0.18, ease: "easeOut" };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

/** Wrap the whole app once. Respects the user's "reduce motion" setting. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/* ----------------------------- PAGE TRANSITION ----------------------------- */
/** Wrap route content. Pass the current pathname as routeKey. */
export function PageTransition({ routeKey, children }: { routeKey: string; children: ReactNode }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={routeKey}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={quick}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/* ----------------------------- BUTTON ----------------------------- */
/** Big touch button with press feedback. Min height 48px (our design rule). */
export function PressButton({
  children,
  className = "",
  ...rest
}: React.ComponentProps<typeof motion.button>) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -1 }}
      transition={quick}
      className={`min-h-12 rounded-xl px-5 text-base font-semibold ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

/* ----------------------------- MODAL ----------------------------- */
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={spring}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 className="mb-3 text-lg font-bold text-slate-900">{title}</h2>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ----------------------------- DRAWER (side panel) ----------------------------- */
/** Use for: customer statement, roll details, cheque details. */
export function Drawer({
  open,
  onClose,
  side = "right",
  children,
}: {
  open: boolean;
  onClose: () => void;
  side?: "left" | "right";
  children: ReactNode;
}) {
  const from = side === "right" ? "100%" : "-100%";
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-slate-900/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className={`fixed top-0 z-50 h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl ${
              side === "right" ? "right-0" : "left-0"
            }`}
            initial={{ x: from }}
            animate={{ x: 0 }}
            exit={{ x: from }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: side === "left" ? 0.4 : 0, right: side === "right" ? 0.4 : 0 }}
            onDragEnd={(_, info) => {
              if (Math.abs(info.offset.x) > 120) onClose();
            }}
          >
            {children}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ----------------------------- TOASTS ----------------------------- */
export type ToastItem = { id: string; text: string; tone?: "ok" | "warn" | "error" | "info" };

const toneClass: Record<NonNullable<ToastItem["tone"]>, string> = {
  ok: "bg-emerald-600",
  warn: "bg-yellow-500 text-slate-900",
  error: "bg-red-600",
  info: "bg-blue-600",
};

function Toast({ t, onDismiss }: { t: ToastItem; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const id = setTimeout(() => onDismiss(t.id), 3500);
    return () => clearTimeout(id);
  }, [t.id, onDismiss]);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60 }}
      transition={spring}
      className={`pointer-events-auto rounded-xl px-4 py-3 text-base font-medium text-white shadow-lg ${
        toneClass[t.tone ?? "info"]
      }`}
    >
      {t.text}
    </motion.div>
  );
}

export function ToastHost({ items, onDismiss }: { items: ToastItem[]; onDismiss: (id: string) => void }) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-80 flex-col gap-2">
      <AnimatePresence>
        {items.map((t) => (
          <Toast key={t.id} t={t} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ----------------------------- ONLINE / OFFLINE BADGE ----------------------------- */
export function OnlineBadge({ online }: { online: boolean }) {
  return (
    <motion.span
      layout
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${
        online ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-800"
      }`}
    >
      <motion.i
        className={`h-2.5 w-2.5 rounded-full ${online ? "bg-emerald-500" : "bg-yellow-500"}`}
        animate={online ? { scale: 1 } : { scale: [1, 1.5, 1] }}
        transition={online ? quick : { duration: 1.4, repeat: Infinity }}
      />
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={online ? "on" : "off"}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.12 }}
        >
          {online ? "Online" : "Offline (saving)"}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
}

/* ----------------------------- SKELETON ----------------------------- */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={`rounded-xl bg-slate-200 ${className}`}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

/* ----------------------------- LIST ITEMS (invoice lines, cart, stock) ----------------------------- */
/** Use <AnimatedList> around rows. Rows slide in on add and collapse on remove. */
export function AnimatedList({ children }: { children: ReactNode }) {
  return <AnimatePresence initial={false}>{children}</AnimatePresence>;
}

export function AnimatedRow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0, x: -24 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`overflow-hidden ${className}`}
    >
      {children}
    </motion.li>
  );
}

/* ----------------------------- PRODUCTION STAGE BOARD ----------------------------- */
/** Tap "Advance" and the card glides to the next column with spring physics. */
export type Batch = {
  id: string;
  style: string;
  qty: number;
  due: string;
  late?: boolean;
  stage: number;
  batchCode?: string;
  category?: string;
  priority?: 'NORMAL' | 'EXPEDITE' | 'URGENT';
  lineOperator?: string;
  fabricRoll?: string;
  yardageAllocated?: number;
  sizeBreakdown?: { S: number; M: number; L: number; XL: number };
  notes?: string;
  startedAt?: string;
};

export function StageBoard({
  stages,
  batches,
  onMove,
  onMoveBackward,
  onInspect,
}: {
  stages: string[];
  batches: Batch[];
  onMove: (id: string, nextStage: number) => void;
  onMoveBackward?: (id: string, prevStage: number) => void;
  onInspect?: (batch: Batch) => void;
}) {
  return (
    <LayoutGroup>
      <div className="grid auto-cols-[290px] sm:auto-cols-[310px] grid-flow-col gap-4 overflow-x-auto pb-4 pt-1">
        {stages.map((name, si) => {
          const stageBatches = batches.filter((b) => b.stage === si);
          const stagePcs = stageBatches.reduce((acc, b) => acc + b.qty, 0);
          const isFinal = si === stages.length - 1;

          return (
            <section
              key={name}
              className="rounded-2xl bg-slate-100/90 border border-slate-200/80 p-3.5 flex flex-col min-w-[280px]"
            >
              <header className="mb-3.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isFinal
                          ? 'bg-emerald-500'
                          : si === 0
                          ? 'bg-blue-600'
                          : si === 1
                          ? 'bg-amber-500'
                          : si === 2
                          ? 'bg-indigo-500'
                          : 'bg-rose-500'
                      }`}
                    />
                    <h3 className="text-sm font-bold text-slate-800">{name}</h3>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 pl-4.5 block">
                    {stagePcs.toLocaleString()} pcs
                  </span>
                </div>
                <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-slate-700 shadow-2xs border border-slate-200">
                  {stageBatches.length} {stageBatches.length === 1 ? 'batch' : 'batches'}
                </span>
              </header>

              <div className="flex min-h-32 flex-col gap-3 flex-1">
                {stageBatches.length === 0 ? (
                  <div className="flex-1 min-h-[140px] rounded-xl border border-dashed border-slate-200 flex items-center justify-center p-6 text-center text-xs text-slate-400">
                    No batches in {name}
                  </div>
                ) : (
                  stageBatches.map((b) => {
                    const progressPct = Math.round(((si + 1) / stages.length) * 100);
                    const isUrgent = b.priority === 'URGENT' || b.priority === 'EXPEDITE';

                    return (
                      <motion.article
                        key={b.id}
                        layout
                        layoutId={`batch-${b.id}`}
                        transition={spring}
                        className={`rounded-2xl bg-white p-4 shadow-sm border transition-shadow hover:shadow-md ${
                          b.late
                            ? 'border-red-300 ring-2 ring-red-400/30'
                            : isUrgent
                            ? 'border-amber-300 ring-2 ring-amber-400/20'
                            : 'border-slate-100'
                        }`}
                      >
                        {/* Header: Batch Code & Status Chips */}
                        <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                          <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                            {b.batchCode || `BAT-${b.id}`}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {b.late && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                                Overdue
                              </span>
                            )}
                            {isUrgent && !b.late && (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                                {b.priority}
                              </span>
                            )}
                            {isFinal && (
                              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                Ready
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Garment Style */}
                        <p className="text-base font-bold text-slate-900 leading-snug">
                          {b.style}
                        </p>

                        {b.category && (
                          <span className="text-[11px] font-medium text-slate-500 block mt-0.5">
                            {b.category}
                          </span>
                        )}

                        {/* Details */}
                        <div className="mt-2.5 flex items-center justify-between text-xs text-slate-600 border-t border-slate-100 pt-2">
                          <span className="font-bold text-slate-900">
                            {b.qty.toLocaleString()} pcs
                          </span>
                          <span className="font-medium text-slate-500">
                            Target: <strong className="text-slate-800">{b.due}</strong>
                          </span>
                        </div>

                        {b.lineOperator && (
                          <p className="mt-1 text-[11px] text-slate-500 truncate">
                            Floor: <span className="font-semibold text-slate-700">{b.lineOperator}</span>
                          </p>
                        )}

                        {/* Progress Bar */}
                        <div className="mt-2.5 space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-slate-400">
                            <span>Stage {si + 1} of {stages.length}</span>
                            <span className={isFinal ? 'text-emerald-600 font-bold' : ''}>
                              {progressPct}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${
                                isFinal
                                  ? 'bg-emerald-500'
                                  : b.late
                                  ? 'bg-red-500'
                                  : 'bg-blue-600'
                              }`}
                              initial={{ width: 0 }}
                              animate={{ width: `${progressPct}%` }}
                              transition={{ duration: 0.35, ease: 'easeOut' }}
                            />
                          </div>
                        </div>

                        {/* Action Buttons: min-h-12 / min-h-11 for touch accessibility */}
                        <div className="mt-3.5 flex items-center gap-2">
                          {si > 0 && onMoveBackward && (
                            <button
                              type="button"
                              onClick={() => onMoveBackward(b.id, si - 1)}
                              className="px-3 min-h-11 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                              title={`Send back to ${stages[si - 1]} for rework`}
                            >
                              &larr;
                            </button>
                          )}

                          {onInspect && (
                            <button
                              type="button"
                              onClick={() => onInspect(b)}
                              className="flex-1 min-h-11 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                            >
                              Job Ticket
                            </button>
                          )}

                          {!isFinal && (
                            <PressButton
                              onClick={() => onMove(b.id, si + 1)}
                              className={`flex-1 min-h-11 text-xs font-bold text-white shadow-xs ${
                                b.late ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                              }`}
                            >
                              Advance &rarr;
                            </PressButton>
                          )}
                        </div>
                      </motion.article>
                    );
                  })
                )}
              </div>
            </section>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
