// Mirrors the Pydantic / SQL row shapes returned by the FastAPI backend.

export interface Portfolio {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Holding {
  id: number;
  ticker: string;
  name: string;
  quantity: number;
  average_buy_price: number;
}

export interface Instrument {
  id: number;
  ticker: string;
  name: string;
}

export interface PricePoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ComputedMetric {
  metric_name: string;
  value: number;
  computed_at: string;
  formula_version: string;
}

// GET /analytics/correlation returns { ticker: { ticker: number | null } }
export type CorrelationMatrix = Record<string, Record<string, number | null>>;
