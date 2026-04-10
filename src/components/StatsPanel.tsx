import { motion } from "framer-motion";
import { Clock, Trophy, BarChart2, Gamepad2 } from "lucide-react";
import type { Game } from "../types";

function formatPlaytime(hours: number): string {
  if (hours < 1 / 60) return "0m";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

interface Props { games: Game[] }

export default function StatsPanel({ games }: Props) {
  const totalPlaytime = games.reduce((s, g) => s + g.playtime, 0);
  const totalMilestones = games.reduce((s, g) => s + g.milestones.length, 0);
  const totalSessions = games.reduce((s, g) => s + g.sessions.length, 0);
  const completed = games.filter(g => g.status === "completed").length;
  const avgCompletion = games.length > 0
    ? Math.round(games.reduce((s, g) => s + g.completionPercent, 0) / games.length)
    : 0;

  const stats = [
    { icon: Clock,    label: "Total Playtime",  value: formatPlaytime(totalPlaytime), color: "#00f5ff" },
    { icon: Trophy,   label: "Milestones",       value: totalMilestones,                color: "#f5c518" },
    { icon: Gamepad2, label: "Sessions Logged",  value: totalSessions,                  color: "#9b5de5" },
    { icon: BarChart2,label: "Avg. Completion",  value: `${avgCompletion}%`,            color: "#22c55e" },
  ];

  return (
    <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <h3 style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Stats</h3>
      {stats.map(({ icon: Icon, label, value, color }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}
        >
          <div style={{ width: 30, height: 30, borderRadius: 8, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon size={14} color={color} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color }}>{value}</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{label}</div>
          </div>
        </motion.div>
      ))}

      <div style={{ marginTop: 8 }}>
        <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 6 }}>
          {completed}/{games.length} games completed
        </div>
        <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 4, overflow: "hidden" }}>
          <motion.div
            animate={{ width: `${games.length > 0 ? (completed / games.length) * 100 : 0}%` }}
            transition={{ duration: 0.8 }}
            style={{ height: "100%", background: "linear-gradient(90deg, #00f5ff, #9b5de5)", borderRadius: 4 }}
          />
        </div>
      </div>
    </div>
  );
}
