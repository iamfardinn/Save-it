import { motion } from "framer-motion";
import { HardDrive, Trash2, FileText } from "lucide-react";
import type { SavePoint } from "../types";

interface Props {
  savePoints: SavePoint[];
  onDelete: (id: string) => void;
}

export default function SavePointsList({ savePoints, onDelete }: Props) {
  if (savePoints.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
        <HardDrive size={32} style={{ marginBottom: 10, opacity: 0.3 }} />
        <p style={{ margin: 0, fontSize: 15 }}>No saves detected yet.</p>
        <p style={{ margin: "6px 0 0 0", fontSize: 13 }}>
          Add a game with a save folder, then save in-game — SaveIt will capture it automatically.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {savePoints.map((sp, i) => (
        <motion.div
          key={sp.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04 }}
          className="glass-panel"
          style={{
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: 16,
            borderLeft: `3px solid ${sp.accentColor}`,
          }}
        >
          {/* Icon */}
          <div style={{ width: 40, height: 40, borderRadius: 8, background: `${sp.accentColor}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <HardDrive size={18} color={sp.accentColor} />
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: sp.accentColor }}>{sp.gameName}</span>
              <span style={{ fontSize: 10, background: `${sp.accentColor}20`, color: sp.accentColor, padding: "2px 8px", borderRadius: 50, fontWeight: 700 }}>
                AUTO-SAVE
              </span>
            </div>

            {/* Save file name — this IS the checkpoint/mission name */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <FileText size={13} color="var(--text-muted)" />
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-main)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {sp.fileName}
              </span>
            </div>

            <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {sp.timestamp} · {sp.filePath}
            </p>
          </div>

          {/* Delete */}
          <motion.button
            whileHover={{ color: "#ef4444", scale: 1.1 }}
            onClick={() => onDelete(sp.id)}
            style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 6, flexShrink: 0 }}
          >
            <Trash2 size={15} />
          </motion.button>
        </motion.div>
      ))}
    </div>
  );
}
