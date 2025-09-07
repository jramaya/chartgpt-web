// Interfaces for the data structures
export interface CarData {
  Car: string;
  Model: string;
  Volume: number;
  Weight: number;
  CO2: number;
}

export interface DataFrame {
  data: CarData[];
  columns: string[];
  shape: [number, number];
}

export interface ColumnInfo {
  name: string;
  dtype: string;
  non_null: number;
  null_count: number; // Assuming this was a typo for null
  unique: number;
  memory_usage_bytes: number;
}

export interface StatsInfo {
  class: string;
  shape: [number, number];
  index: {
    type: string;
    start: number;
    stop: number;
    step: number;
  };
  columns: ColumnInfo[];
  dtypes_summary: { [key: string]: number };
}

export interface Describe {
  [key: string]: {
    count: number;
    unique?: number | string;
    top?: string;
    freq?: number;
    mean?: number | string;
    std?: number | string;
    min?: number | string;
    "25%"?: number | string;
    "50%"?: number | string;
    "75%"?: number | string;
    max?: number | string;
  };
}

export interface Correlation {
  [key: string]: { [key: string]: number };
}

export interface StatsResponse {
  info: StatsInfo;
  describe: Describe;
  correlation: Correlation;
  dataFrameSample: CarData[];
}

export interface ChartOperation {
  id: string;
  title: string;
  pandas_operation: string;
  chart_type: string;
  insight: string;
  result?: any;
}

export interface ChartsConfigResponse {
  operations: ChartOperation[];
}

export interface BuildChartsRequest {
  data_frame: DataFrame;
  operations: ChartOperation[];
}

export interface ExecutedChart {
  id: string;
  title: string;
  pandas_operation: string;
  chart_type: string;
  insight: string;
  result: any;
}

export interface BuildChartsResponse {
  executed_charts: ExecutedChart[];
}

export interface ChartAnalytics {
  id: string;
  title: string;
  details: string;
  chart_type?: string; // comes from buildChart
  insight?: string; // comes from buildChart
  chart_configuration?: any; // comes from buildChart
}

export interface SummaryResponse {
  stats_summary: string;
  chart_analytics: ChartAnalytics[];
}

// Define pipeline steps
export enum PipelineStep {
  IDLE = "IDLE",
  UPLOADING_FILE = "UPLOADING_FILE",
  FETCHING_STATS = "FETCHING_STATS",
  FETCHING_CHARTS_CONFIG = "FETCHING_CHARTS_CONFIG",
  BUILDING_CHARTS = "BUILDING_CHARTS",
  GENERATING_SUMMARY = "GENERATING_SUMMARY",
  COMPLETED = "COMPLETED",
  ERROR = "ERROR",
}