import { ScoredTalent } from '../../scoring/interfaces/scoring.interfaces';

export interface RadarSyncMeta {
  created: number;
  updated: number;
  skipped: number;
  errors: number;
  fromCache: boolean;
  radarConfigChanged: boolean;
}

export interface RadarSyncResponse {
  radarId: string;
  radarVersion: number;
  sync: RadarSyncMeta;
  talents: ScoredTalent[];
}
