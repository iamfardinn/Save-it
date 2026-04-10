import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Clock, Trophy, BookOpen, Flag, Plus, Camera,
  CheckCircle, PauseCircle, Archive, Play, Pencil, Trash2,
} from "lucide-react";
import type { Game, Session, Milestone } from "../types";
import { generateId } from "../store";

interface Props {
  game: Game;
  onBack: () => void;
  onUpdate: (updated: Game) => void;
}

const STATUS_OPTIONS: { value: Game["status"]; label: string; color: string }[] = [
  { value: "playing",   label: "Playing",   color: "#00f5ff" },
  { value: "completed", label: "Completed", color: "#22c55e" },
  { value: "on-hold",   label: "On Hold",   color: "#f59e0b" },
  { value: "dropped",   label: "Dropped",   color: "#ef4444" },
  { value: "backlog",   label: "Backlog",   color: "#8a8a9e" },
];

type Tab = "overview" | "sessions" | "milestones";

export default function GameDetail({ game, onBack, onUpdate }: Props) {
  const [tab, setTab] = useState<Tab>("overview");
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);

  // Session form state
  const [sessionDuration, setSessionDuration] = useState("60");
  const [sessionNotes, setSessionNotes] = useState("");
  const [completionAfter, setCompletionAfter] = useState(String(game.completionPercent));

  // Milestone form state
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [milestoneNote, setMilestoneNote] = useState("");

  const updateField = <K extends keyof Game>(key: K, value: Game[K]) => {
    onUpdate({ ...game, [key]: value });
  };

  const addSession = () => {
    if (!sessionNotes.trim()) return;
    const newCompletion = Math.min(100, Math.max(0, parseInt(completionAfter) || game.completionPercent));
    const session: Session = {
      id: generateId(),
      date: new Date().toISOString().split("T")[0],
      duration: parseInt(sessionDuration) || 60,
      notes: sessionNotes.trim(),
      completionBefore: game.completionPercent,
      completionAfter: newCompletion,
    };
    const totalHours = game.playtime + (session.duration / 60);
    onUpdate({
      ...game,
      sessions: [session, ...game.sessions],
      completionPercent: newCompletion,
      playtime: Math.round(totalHours * 10) / 10,
      lastPlayed: "Today",
      status: newCompletion === 100 ? "completed" : game.status,
    });
    setSessionNotes("");
    setSessionDuration("60");
    setCompletionAfter(String(newCompletion));
    setShowSessionForm(false);
  };

  const addMilestone = () => {
    if (!milestoneTitle.trim()) return;
    const milestone: Milestone = {
      id: generateId(),
      title: milestoneTitle.trim(),
      date: new Date().toISOString().split("T")[0],
      note: milestoneNote.trim(),
      completionAt: game.completionPercent,
    };
    onUpdate({ ...game, milestones: [milestone, ...game.milestones] });
    setMilestoneTitle("");
    setMilestoneNote("");
    setShowMilestoneForm(false);
  };

  const deleteSession = (id: string) => {
    onUpdate({ ...game, sessions: game.sessions.filter(s => s.id !== id) });
  };

  const deleteMilestone = (id: string) => {
    onUpdate({ ...game, milestones: game.milestones.filter(m => m.id !== id) });
  };

  const accent = game.accentColor;

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8, padding: "10px 14px", color: "var(--text-main)", fontSize: 14,
    outline: "none", boxSizing: "border-box",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      {/* Hero Header */}
      <div style={{
        background: `linear-gradient(135deg, ${accent}18 0%, transparent 60%)`,
        border: `1px solid ${accent}22`,
        borderRadius: 16, padding: "24px 28px", marginBottom: 24,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, background: `radial-gradient(circle, ${accent}18, transparent 70%)`, pointerEvents: "none" }} />

        <motion.button
          whileHover={{ x: -3 }}
          onClick={onBack}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 13, marginBottom: 16, padding: 0 }}
        >
          <ArrowLeft size={16} /> Back to Library
        </motion.button>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ fontSize: 52, width: 72, height: 72, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 16, background: `${accent}22`, flexShrink: 0 }}>
            {game.coverEmoji}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: "0 0 6px 0", fontSize: 30, fontWeight: 800 }}>{game.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{game.genre} · {game.platform}</span>
              {/* Status picker */}
              <div style={{ display: "flex", gap: 6 }}>
                {STATUS_OPTIONS.map(opt => (
                  <motion.button
                    key={opt.value}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => updateField("status", opt.value)}
                    style={{
                      padding: "3px 10px", borderRadius: 50, border: "1px solid",
                      borderColor: game.status === opt.value ? opt.color : "rgba(255,255,255,0.1)",
                      background: game.status === opt.value ? `${opt.color}20` : "transparent",
                      color: game.status === opt.value ? opt.color : "var(--text-muted)",
                      cursor: "pointer", fontSize: 11, fontWeight: 600,
                    }}
                  >
                    {opt.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div style={{ display: "flex", gap: 24, flexShrink: 0 }}>
            {[
              { icon: Clock, label: "Playtime", value: `${game.playtime}h` },
              { icon: Flag, label: "Sessions", value: game.sessions.length },
              { icon: Trophy, label: "Milestones", value: game.milestones.length },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <Icon size={16} color={accent} style={{ marginBottom: 4 }} />
                <div style={{ fontSize: 20, fontWeight: 800, color: accent }}>{value}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Completion bar */}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Overall Completion</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: accent }}>{game.completionPercent}%</span>
          </div>
          <div style={{ height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 8, overflow: "hidden" }}>
            <motion.div
              animate={{ width: `${game.completionPercent}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{ height: "100%", background: `linear-gradient(90deg, ${accent}, ${accent}88)`, borderRadius: 8 }}
            />
          </div>
          {/* Milestone markers */}
          <div style={{ position: "relative", height: 12, marginTop: 2 }}>
            {game.milestones.map(m => (
              <div key={m.id} title={m.title} style={{ position: "absolute", left: `${m.completionAt}%`, transform: "translateX(-50%)", width: 2, height: 8, background: accent, opacity: 0.7, borderRadius: 2 }} />
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 4 }}>
        {([
          { key: "overview", label: "Overview", icon: BookOpen },
          { key: "sessions", label: "Sessions", icon: Clock },
          { key: "milestones", label: "Milestones", icon: Trophy },
        ] as { key: Tab; label: string; icon: any }[]).map(({ key, label, icon: Icon }) => (
          <motion.button
            key={key}
            whileTap={{ scale: 0.97 }}
            onClick={() => setTab(key)}
            style={{
              flex: 1, padding: "10px", borderRadius: 8, border: "none",
              background: tab === key ? `${accent}20` : "transparent",
              color: tab === key ? accent : "var(--text-muted)",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              fontSize: 13, fontWeight: tab === key ? 700 : 400,
              borderBottom: tab === key ? `2px solid ${accent}` : "2px solid transparent",
            }}
          >
            <Icon size={15} /> {label}
          </motion.button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        <AnimatePresence mode="wait">
          {tab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {/* Recent session */}
                <div className="glass-panel" style={{ padding: 20, gridColumn: game.sessions.length === 0 ? "1 / -1" : undefined }}>
                  <h4 style={{ margin: "0 0 14px 0", fontSize: 13, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Latest Session</h4>
                  {game.sessions[0] ? (
                    <>
                      <p style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: 600 }}>{game.sessions[0].notes}</p>
                      <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--text-muted)" }}>
                        <span>{game.sessions[0].date}</span>
                        <span>·</span>
                        <span>{game.sessions[0].duration} min</span>
                        <span>·</span>
                        <span style={{ color: accent }}>+{game.sessions[0].completionAfter - game.sessions[0].completionBefore}%</span>
                      </div>
                    </>
                  ) : (
                    <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No sessions logged yet.</p>
                  )}
                </div>

                {/* Latest milestone */}
                {game.sessions.length > 0 && (
                  <div className="glass-panel" style={{ padding: 20 }}>
                    <h4 style={{ margin: "0 0 14px 0", fontSize: 13, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Latest Milestone</h4>
                    {game.milestones[0] ? (
                      <>
                        <p style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: 600 }}>🏆 {game.milestones[0].title}</p>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{game.milestones[0].date} · at {game.milestones[0].completionAt}%</div>
                        {game.milestones[0].note && <p style={{ margin: "8px 0 0 0", fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>"{game.milestones[0].note}"</p>}
                      </>
                    ) : (
                      <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No milestones captured yet.</p>
                    )}
                  </div>
                )}

                {/* Completion timeline (mini chart) */}
                <div className="glass-panel" style={{ padding: 20, gridColumn: "1 / -1" }}>
                  <h4 style={{ margin: "0 0 16px 0", fontSize: 13, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Completion Timeline</h4>
                  {game.sessions.length > 0 ? (
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80 }}>
                      {[...game.sessions].reverse().slice(-12).map((s, i) => (
                        <div key={s.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${(s.completionAfter / 100) * 64}px` }}
                            transition={{ delay: i * 0.05 }}
                            style={{ width: "100%", background: `${accent}88`, borderRadius: "4px 4px 0 0", minHeight: 4 }}
                          />
                          <span style={{ fontSize: 9, color: "var(--text-muted)" }}>{s.date.slice(5)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Log sessions to see a progress chart.</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {tab === "sessions" && (
            <motion.div key="sessions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Add session button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowSessionForm(v => !v)}
                style={{
                  width: "100%", padding: "12px", borderRadius: 10, border: `1px dashed ${accent}55`,
                  background: showSessionForm ? `${accent}15` : "transparent",
                  color: accent, cursor: "pointer", fontSize: 14, fontWeight: 600,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16,
                }}
              >
                <Plus size={16} /> Log a Session
              </motion.button>

              <AnimatePresence>
                {showSessionForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="glass-panel"
                    style={{ padding: 20, marginBottom: 16, overflow: "hidden" }}
                  >
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                      <div>
                        <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Duration (min)</label>
                        <input style={{ ...inputStyle, width: "100%" }} type="number" value={sessionDuration} onChange={e => setSessionDuration(e.target.value)} />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Completion After (%)</label>
                        <input style={{ ...inputStyle, width: "100%" }} type="number" min={0} max={100} value={completionAfter} onChange={e => setCompletionAfter(e.target.value)} />
                      </div>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Session Notes</label>
                      <textarea
                        style={{ ...inputStyle, width: "100%", minHeight: 70, resize: "vertical" }}
                        value={sessionNotes}
                        onChange={e => setSessionNotes(e.target.value)}
                        placeholder="What did you accomplish this session?"
                      />
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={addSession}
                      disabled={!sessionNotes.trim()}
                      style={{ padding: "10px 20px", borderRadius: 8, border: `1px solid ${accent}`, background: `${accent}20`, color: accent, cursor: "pointer", fontWeight: 600, fontSize: 13 }}
                    >
                      Save Session
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {game.sessions.length === 0 && (
                  <div className="glass-panel" style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>
                    No sessions logged yet. Click "Log a Session" to get started.
                  </div>
                )}
                {game.sessions.map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-panel"
                    style={{ padding: "18px 20px", display: "flex", gap: 16, alignItems: "flex-start" }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: `${accent}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Clock size={18} color={accent} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: "0 0 6px 0", fontSize: 14, fontWeight: 600 }}>{s.notes}</p>
                      <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--text-muted)" }}>
                        <span>{s.date}</span>
                        <span>·</span>
                        <span>{s.duration} min</span>
                        <span>·</span>
                        <span style={{ color: accent }}>{s.completionBefore}% → {s.completionAfter}%</span>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ color: "#ef4444" }}
                      onClick={() => deleteSession(s.id)}
                      style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 }}
                    >
                      <Trash2 size={15} />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === "milestones" && (
            <motion.div key="milestones" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowMilestoneForm(v => !v)}
                style={{
                  width: "100%", padding: "12px", borderRadius: 10, border: `1px dashed ${accent}55`,
                  background: showMilestoneForm ? `${accent}15` : "transparent",
                  color: accent, cursor: "pointer", fontSize: 14, fontWeight: 600,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16,
                }}
              >
                <Camera size={16} /> Capture Milestone
              </motion.button>

              <AnimatePresence>
                {showMilestoneForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="glass-panel"
                    style={{ padding: 20, marginBottom: 16, overflow: "hidden" }}
                  >
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Milestone Title *</label>
                      <input style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} value={milestoneTitle} onChange={e => setMilestoneTitle(e.target.value)} placeholder="e.g. Defeated Final Boss" />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Your Note</label>
                      <textarea style={{ ...inputStyle, width: "100%", minHeight: 60, resize: "vertical", boxSizing: "border-box" }} value={milestoneNote} onChange={e => setMilestoneNote(e.target.value)} placeholder="How did it feel? Any tips?" />
                    </div>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 10px 0" }}>
                      Captured at <strong style={{ color: accent }}>{game.completionPercent}%</strong> completion
                    </p>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={addMilestone}
                      disabled={!milestoneTitle.trim()}
                      style={{ padding: "10px 20px", borderRadius: 8, border: `1px solid ${accent}`, background: `${accent}20`, color: accent, cursor: "pointer", fontWeight: 600, fontSize: 13 }}
                    >
                      Save Milestone
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {game.milestones.length === 0 && (
                  <div className="glass-panel" style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>
                    No milestones captured yet. Mark your key moments as you play!
                  </div>
                )}
                {game.milestones.map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-panel"
                    style={{ padding: "18px 20px", borderLeft: `3px solid ${accent}`, display: "flex", gap: 16, alignItems: "flex-start" }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: `${accent}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Trophy size={18} color={accent} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: "0 0 4px 0", fontSize: 15, fontWeight: 700 }}>🏆 {m.title}</p>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                        {m.date} · at <span style={{ color: accent }}>{m.completionAt}%</span> completion
                      </div>
                      {m.note && <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>"{m.note}"</p>}
                    </div>
                    <motion.button
                      whileHover={{ color: "#ef4444" }}
                      onClick={() => deleteMilestone(m.id)}
                      style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 }}
                    >
                      <Trash2 size={15} />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
