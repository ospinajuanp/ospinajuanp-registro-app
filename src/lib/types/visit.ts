export interface VisitLog {
  id: string;
  uniqueId: string;
  timestamp: string;
  device: string;
  name?: string;
}

export interface LogVisitInput {
  id: string;
  name?: string;
  userAgent: string;
}

export interface CacheSettings {
  forceUpdate: boolean;
}
