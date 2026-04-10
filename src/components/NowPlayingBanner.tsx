import { motion, AnimatePresence } from "framer-motion";
import { Play, Disc3 } from "lucide-react";
import type { Game } from "../types";

interface Props {
  game: Game | null;
}

export default function NowPlayingBanner({ game }: Props) {
  return (
    <AnimatePresence>
      {game && (
        <motion.div
          key={game.id}
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{
            position: "fixed",
            top: 34,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9000,
            background: "rgba(10, 10, 15, 0.92)",
            backdropFilter: "blur(20px)",
            border: `1px solid ${game.accentColor}66`,
            borderRadius: 50,
            padding: "8px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: `0 0 30px ${game.accentColor}33`,
            pointerEvents: "none",
          }}
        >
          {/* Pulsing dot */}
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
            transition={{ repeat: Infinity, duration: 1.4 }}
            style={{ width: 8, height: 8, borderRadius: "50%", background: game.accentColor, boxShadow: `0 0 8px ${game.accentColor}` }}
          />

          <span style={{ fontSize: 16 }}>{game.coverEmoji}</span>

          <div>
            <span style={{ fontSize: 13, color: "var(--text-muted)", marginRight: 6 }}>Playing</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: game.accentColor }}>{game.name}</span>
          </div>

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          >
            <Disc3 size={16} color={game.accentColor} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
