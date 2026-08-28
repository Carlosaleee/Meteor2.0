"use client";

import { motion } from "motion/react";

type SurfScoreProps = {
  score: number;
};

export function SurfScore({ score }: SurfScoreProps) {
  return (
    <div className="flex flex-col border border-line bg-graphite p-4">
      <span className="font-mono text-[10px] tracking-[0.16em] text-muted uppercase">Surf Score</span>
      <motion.span
        className="font-display text-[72px] leading-none text-gold"
        key={score}
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
      >
        {score}
      </motion.span>
    </div>
  );
}
