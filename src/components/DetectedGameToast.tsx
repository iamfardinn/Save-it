import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Gamepad2 } from "lucide-react";

interface Props {
  gameName: string;
  exeName: string;
  onAdd: () => void;
  onDismiss: () => void;
}

export default function DetectedGameToast({ gameName, exeName, onAdd, onDismiss }: Props) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 80 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 80 }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        style={{
          position: "fixed",
          bottom: 28,
          right: 28,
          zIndex: 9999,
          width: 320,
          background: "rgba(10, 10, 15, 0.95)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(0, 245, 255, 0.3)",
          borderRadius: 14,
          padding: "18px 20px",
          boxShadow: "0 0 40px rgba(0, 245, 255, 0.12)",
        }}
      >
        {/* Close */}
        <button
          onClick={onDismiss}
          style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 }}
        >
          <X size={15} />
        </button>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          {/* Icon */}
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(0,245,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Gamepad2 size={20} color="var(--border-neon-cyan)" />
          </div>

          <div style={{ flex: 1 }}>
            {/* Label */}
            <p style={{ margin: "0 0 2px 0", fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.8 }}>
              Game Detected
            </p>
            {/* Game name */}
            <p style={{ margin: "0 0 6px 0", fontSize: 16, fontWeight: 800, color: "var(--border-neon-cyan)" }}>
              {gameName}
            </p>
            <p style={{ margin: "0 0 14px 0", fontSize: 12, color: "var(--text-muted)" }}>
              <code style={{ fontSize: 11, background: "rgba(255,255,255,0.07)", padding: "1px 6px", borderRadius: 4 }}>{exeName}.exe</code>
              {" "}is running — add it to track progress?
            </p>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8 }}>
              <motion.button
                whileHover={{ scale: 1.04, background: "rgba(0,245,255,0.2)" }}
                whileTap={{ scale: 0.96 }}
                onClick={onAdd}
                style={{ flex: 1, padding: "9px", borderRadius: 8, border: "1px solid rgba(0,245,255,0.4)", background: "rgba(0,245,255,0.1)", color: "var(--border-neon-cyan)", cursor: "pointer", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              >
                <Plus size={14} /> Track It
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={onDismiss}
                style={{ padding: "9px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "var(--text-muted)", cursor: "pointer", fontSize: 13 }}
              >
                Ignore
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
