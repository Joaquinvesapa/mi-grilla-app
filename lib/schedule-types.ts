/** Raw JSON shape — matches lollapalooza-schedule.json exactly */

export interface RawArtista {
  nombre: string;
  subtitulo?: string;
  inicio: string; // "HH:mm"
  fin: string; // "HH:mm"
}

export interface RawEscenario {
  nombre: string;
  artistas: RawArtista[];
}

export interface RawDia {
  dia: string; // "Viernes" | "Sábado" | "Domingo"
  escenarios: RawEscenario[];
}

export interface RawSchedule {
  evento: string;
  dias: RawDia[];
}

/** Processed types — ready for grid rendering */

export interface GridArtist {
  id: string;
  name: string;
  subtitle?: string;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  startMin: number; // absolute minutes from midnight (adjusted for next-day)
  endMin: number; // absolute minutes from midnight (adjusted for next-day)
  stageName: string;
  stageIndex: number;
}

export interface GridStage {
  name: string;
  index: number;
}

export interface GridBounds {
  /** First minute visible in the grid (floored to 30-min slot) */
  startMin: number;
  /** Last minute visible in the grid (ceiled to 30-min slot) */
  endMin: number;
  /** Total minutes the grid spans */
  totalMinutes: number;
}

export interface GridDay {
  label: string; // "Viernes"
  stages: GridStage[];
  artists: GridArtist[];
  bounds: GridBounds;
}

/** Per-stage live status — used by the "EN VIVO" overlay */

export interface LiveStage {
  stageName: string;
  stageIndex: number;
  nowPlaying: GridArtist | null;
  upNext: GridArtist | null;
}

export type DayLabel = "Viernes" | "Sabado" | "Domingo";
