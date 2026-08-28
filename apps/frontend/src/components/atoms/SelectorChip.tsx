"use client";

import { motion } from "motion/react";

type SelectorChipProps = {
  label: string;
  selected: boolean;
  onSelect: () => void;
};

export function SelectorChip({ label, selected, onSelect }: SelectorChipProps) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      className={`font-mono text-[11px] tracking-[0.12em] uppercase border px-3 py-2 ${
        selected
          ? "border-orange bg-graphite text-orange"
          : "border-line bg-bg text-muted hover:border-gold hover:text-gold"
      }`}
      animate={{ scale: selected ? 1 : 0.98 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      whileTap={{ scale: 0.94 }}
    >
      {label}
    </motion.button>
  );
}
