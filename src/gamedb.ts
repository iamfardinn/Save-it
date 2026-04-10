// Built-in game database: exe stem (lowercase, no ext) → display name
// This is what enables auto-detection without any manual config
export const GAME_DB: Record<string, string> = {
  // ── FromSoftware ──────────────────────────────────────────────────────────
  eldenring:            "Elden Ring",
  darksouls:            "Dark Souls",
  darksoulsii:          "Dark Souls II",
  darksoulsiii:         "Dark Souls III",
  sekiro:               "Sekiro: Shadows Die Twice",
  armoredcore6:         "Armored Core VI",
  "armoredcore6fires":  "Armored Core VI",

  // ── CD Projekt Red ────────────────────────────────────────────────────────
  witcher3:             "The Witcher 3",
  "the witcher 3":      "The Witcher 3",
  cyberpunk2077:        "Cyberpunk 2077",

  // ── Rockstar ──────────────────────────────────────────────────────────────
  gta5:                 "GTA V",
  gtav:                 "GTA V",
  "gta_sa":             "GTA San Andreas",
  rdr2:                 "Red Dead Redemption 2",
  rdr:                  "Red Dead Redemption",

  // ── Ubisoft ───────────────────────────────────────────────────────────────
  ac_odyssey:           "Assassin's Creed Odyssey",
  acu:                  "Assassin's Creed Unity",
  "ac origins":         "Assassin's Creed Origins",
  acvalhalla:           "Assassin's Creed Valhalla",
  far_cry6:             "Far Cry 6",

  // ── Bethesda ──────────────────────────────────────────────────────────────
  skyrim:               "The Elder Scrolls V: Skyrim",
  skyrimse:             "Skyrim Special Edition",
  fallout4:             "Fallout 4",
  fallout76:            "Fallout 76",
  starfield:            "Starfield",
  oblivion:             "The Elder Scrolls IV: Oblivion",

  // ── Team Cherry ───────────────────────────────────────────────────────────
  hollowknight:         "Hollow Knight",
  silksong:             "Hollow Knight: Silksong",

  // ── Valve ─────────────────────────────────────────────────────────────────
  hl2:                  "Half-Life 2",
  portal2:              "Portal 2",
  dota2:                "Dota 2",
  csgo:                 "CS:GO",
  cs2:                  "Counter-Strike 2",
  tf2:                  "Team Fortress 2",
  left4dead2:           "Left 4 Dead 2",

  // ── Electronic Arts ───────────────────────────────────────────────────────
  fifa23:               "FIFA 23",
  fifa24:               "EA Sports FC 24",
  "eafc24":             "EA Sports FC 24",
  "eafc25":             "EA Sports FC 25",
  bfv:                  "Battlefield V",
  battlefield2042:      "Battlefield 2042",
  masseffect:           "Mass Effect",
  masseffectandromeda:  "Mass Effect: Andromeda",
  dragonage:            "Dragon Age",
  dragonageinquisition: "Dragon Age: Inquisition",

  // ── Activision / Blizzard ─────────────────────────────────────────────────
  codmw:                "Call of Duty: Modern Warfare",
  codmw2:               "Call of Duty: MW2",
  codwarzone:           "Warzone",
  warzone:              "Warzone",
  diablo4:              "Diablo IV",
  diablo3:              "Diablo III",
  overwatch:            "Overwatch",
  overwatch2:           "Overwatch 2",
  worldofwarcraft:      "World of Warcraft",

  // ── Epic / People Can Fly ─────────────────────────────────────────────────
  fortnite:             "Fortnite",
  "fortniteclient-win64-shipping": "Fortnite",

  // ── Square Enix ───────────────────────────────────────────────────────────
  ffxv:                 "Final Fantasy XV",
  ffxvi:                "Final Fantasy XVI",
  "final fantasy xvi":  "Final Fantasy XVI",
  strangerofparadise:   "Stranger of Paradise",
  shadowofthetonbraider:"Shadow of the Tomb Raider",

  // ── Bandai Namco ─────────────────────────────────────────────────────────
  evilwithin:           "The Evil Within",
  talesofarisei:        "Tales of Arise",
  scarletandviolet:     "Pokémon Scarlet & Violet",

  // ── 2K / Take-Two ────────────────────────────────────────────────────────
  borderlands3:         "Borderlands 3",
  bioshockinfinite:     "BioShock Infinite",
  xcom2:                "XCOM 2",
  civilization6:        "Civilization VI",
  nba2k24:              "NBA 2K24",
  nba2k25:              "NBA 2K25",

  // ── Microsoft / Xbox Game Studios ────────────────────────────────────────
  halo:                 "Halo",
  haloinfinite:         "Halo Infinite",
  forza:                "Forza",
  forzahorizon5:        "Forza Horizon 5",
  forzamotorsport:      "Forza Motorsport",
  flightsimulator:      "Microsoft Flight Simulator",

  // ── Sony ─────────────────────────────────────────────────────────────────
  horizon:              "Horizon Zero Dawn",
  horizonforbiddenwest: "Horizon Forbidden West",
  godofwar:             "God of War",
  spiderman:            "Marvel's Spider-Man",
  spiderman2:           "Marvel's Spider-Man 2",
  thelastofus:          "The Last of Us",
  lastofuspart1:        "The Last of Us Part I",
  ghostoftsushima:      "Ghost of Tsushima",
  "ghost of tsushima":  "Ghost of Tsushima",

  // ── Indies & Others ───────────────────────────────────────────────────────
  hades:                "Hades",
  hades2:               "Hades II",
  baldursgate3:         "Baldur's Gate 3",
  "bg3":                "Baldur's Gate 3",
  stardewvalley:        "Stardew Valley",
  minecraft:            "Minecraft",
  minecraftlauncher:    "Minecraft",
  terraria:             "Terraria",
  celeste:              "Celeste",
  cuphead:              "Cuphead",
  deathstranding:       "Death Stranding",
  "monsterhunterworld": "Monster Hunter: World",
  mhrise:               "Monster Hunter Rise",
  palworld:             "Palworld",
  "palworld-win64-shipping": "Palworld",
  blackmythwukong:      "Black Myth: Wukong",
  "b1-win64-shipping":  "Black Myth: Wukong",
  lies:                 "Lies of P",
  liesofp:              "Lies of P",
  remnant2:             "Remnant II",
  "remnant-win64":      "Remnant II",
  deadspace:            "Dead Space",
  resident:             "Resident Evil",
  re4:                  "Resident Evil 4",
  re7:                  "Resident Evil 7",
  re8:                  "Resident Evil Village",
  dmc5:                 "Devil May Cry 5",
};

// Common accent colors per game genre (used when auto-adding)
export const GAME_ACCENT_COLORS: Record<string, string> = {
  "Elden Ring":         "#f5c518",
  "Dark Souls III":     "#ff6b35",
  "Cyberpunk 2077":     "#00f5ff",
  "The Witcher 3":      "#22c55e",
  "GTA V":              "#22c55e",
  "Fortnite":           "#a855f7",
  "Hades":              "#f43f5e",
  "Hades II":           "#f43f5e",
  "Stardew Valley":     "#22c55e",
  "Baldur's Gate 3":    "#9b5de5",
  "Hollow Knight":      "#9b5de5",
};

// Lookup: given a process stem, return the full name or null
export function lookupGame(exeStem: string): string | null {
  const key = exeStem.toLowerCase();
  return GAME_DB[key] ?? null;
}
