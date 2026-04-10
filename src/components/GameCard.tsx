import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Folder, Play, CheckCircle, PauseCircle, Archive, BookOpen, Trash2 } from "lucide-react";
import type { Game } from "../types";

function formatPlaytime(hours: number): string {
  if (hours < 1 / 60) return "0m";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

const STATUS_CONFIG: Record<Game["status"], { label: string; color: string; Icon: any }> = {
  playing:   { label: "Playing",   color: "#00f5ff", Icon: Play },
  completed: { label: "Completed", color: "#22c55e", Icon: CheckCircle },
  "on-hold": { label: "On Hold",   color: "#f59e0b", Icon: PauseCircle },
  dropped:   { label: "Dropped",   color: "#ef4444", Icon: Archive },
  backlog:   { label: "Backlog",   color: "#8a8a9e", Icon: BookOpen },
};

interface Props {
  game: Game;
  index: number;
  onClick: () => void;
  onDelete: (id: string) => void;
}

export default function GameCard({ game, index, onClick, onDelete }: Props) {
  const { label, color, Icon } = STATUS_CONFIG[game.status];
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // don't open game detail
    if (confirmDelete) {
      onDelete(game.id);
    } else {
      setConfirmDelete(true);
      // Auto-reset confirm state after 2.5s
      setTimeout(() => setConfirmDelete(false), 2500);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: "easeOut" }}
      whileHover={{ scale: 1.03, y: -4 }}
      onClick={onClick}
      className="glass-panel"
      style={{
        padding: "22px",
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        borderColor: game.isActive ? game.accentColor : "rgba(255,255,255,0.06)",
        transition: "border-color 0.3s",
      }}
    >
      {/* Accent glow blob */}
      <div style={{
        position: "absolute", top: "-30%", right: "-20%",
        width: "180px", height: "180px",
        background: `radial-gradient(circle, ${game.accentColor}22 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            fontSize: 28, width: 48, height: 48, display: "flex", alignItems: "center",
            justifyContent: "center", borderRadius: 10,
            background: `${game.accentColor}22`, flexShrink: 0,
          }}>
            {game.coverEmoji}
          </div>
          <div>
            <h3 style={{ margin: "0 0 3px 0", fontSize: 17, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "140px" }}>
              {game.name}
            </h3>
            <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
              {game.genre} · {game.platform}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          {/* Status badge or LIVE pulse */}
          {game.isActive ? (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ background: `${game.accentColor}30`, color: game.accentColor, padding: "4px 8px", borderRadius: 50, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}
            >
              <Play size={9} fill={game.accentColor} /> LIVE
            </motion.div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 5, color, fontSize: 11 }}>
              <Icon size={13} />
              <span>{label}</span>
            </div>
          )}

          {/* Delete button */}
          <AnimatePresence mode="wait">
            <motion.button
              key={confirmDelete ? "confirm" : "idle"}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDelete}
              title={confirmDelete ? "Click again to confirm delete" : "Remove game"}
              style={{
                background: confirmDelete ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${confirmDelete ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.08)"}`,
                color: confirmDelete ? "#ef4444" : "var(--text-muted)",
                borderRadius: 6,
                padding: "4px 7px",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 4,
                transition: "all 0.2s",
              }}
            >
              <Trash2 size={11} />
              {confirmDelete ? "Sure?" : ""}
            </motion.button>
          </AnimatePresence>
        </div>
      </div>

      {/* Completion bar */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Completion</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: game.accentColor }}>{game.completionPercent}%</span>
        </div>
        <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${game.completionPercent}%` }}
            transition={{ duration: 0.8, delay: index * 0.08 + 0.3, ease: "easeOut" }}
            style={{ height: "100%", background: `linear-gradient(90deg, ${game.accentColor}, ${game.accentColor}88)`, borderRadius: 4 }}
          />
        </div>
      </div>

      {/* Footer stats */}
      <div style={{ display: "flex", gap: 16, position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text-muted)", fontSize: 12 }}>
          <Clock size={13} /> {formatPlaytime(game.playtime)}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text-muted)", fontSize: 12 }}>
          <Folder size={13} /> {game.saveSize}
        </div>
        <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-muted)" }}>
          {game.lastPlayed}
        </div>
      </div>
    </motion.div>
  );
}
