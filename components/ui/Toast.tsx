"use client";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
  show: boolean;
  message: string;
}

export function Toast({ show, message }: Props) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.18 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-accent rounded-card px-5 py-3.5 shadow-card"
        >
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-[14px] font-medium text-white">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
