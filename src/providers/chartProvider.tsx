import React, {
  createContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import axios, { AxiosError } from "axios";
import {
  DataFrame,
  StatsResponse,
  ChartsConfigResponse,
  BuildChartsResponse,
  SummaryResponse,
  PipelineStep,
  BuildChartsRequest,
} from "../interfaces/chart.d";

// Context interface
interface RefineContextType {
  data: DataFrame | null;
  stats: StatsResponse | null;
  chartsConfig: ChartsConfigResponse | null;
  executedCharts: BuildChartsResponse | null;
  summary: SummaryResponse | null;
  loading: boolean;
  error: string | null;
  currentStep: PipelineStep; // Add currentStep
  uploadFile: (file: File) => Promise<void>;
  fetchStats: (data: DataFrame) => Promise<void>;
  fetchChartsConfig: (stats: StatsResponse) => Promise<void>;
  buildCharts: (data: BuildChartsRequest) => Promise<void>;
  generateSummary: (charts: BuildChartsResponse) => Promise<void>;
}

// Create Context
export const RefineContext = createContext<RefineContextType | undefined>(
  undefined
);

// Provider Component
interface RefineProviderProps {
  children: ReactNode;
  apiUrl: string;
}

export const RefineProvider: React.FC<RefineProviderProps> = ({
  children,
  apiUrl,
}) => {
  const [data, setData] = useState<DataFrame | null>(null);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [chartsConfig, setChartsConfig] =
    useState<ChartsConfigResponse | null>(null);
  const [executedCharts, setExecutedCharts] =
    useState<BuildChartsResponse | null>(null);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<PipelineStep>(
    PipelineStep.IDLE
  );

  const API_BASE_URL = apiUrl;

  const uploadFile = useCallback(async (file: File) => {
    setCurrentStep(PipelineStep.UPLOADING_FILE);
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await axios.post<DataFrame>(
        `${API_BASE_URL}/read_file`,
        formData,
        {
          headers: {
            accept: "application/json",
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setData(response.data);
      await fetchStats(response.data);
    } catch (err) {
      const error = err as AxiosError;
      setError(error.message || "Failed to upload file");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async (data: DataFrame) => {
    setCurrentStep(PipelineStep.FETCHING_STATS);
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post<StatsResponse>(
        `${API_BASE_URL}/stats`,
        data,
        {
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      setStats(response.data);
      await fetchChartsConfig(response.data);
    } catch (err) {
      const error = err as AxiosError;
      setError(error.message || "Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchChartsConfig = useCallback(
    async (stats: StatsResponse) => {
      setCurrentStep(PipelineStep.FETCHING_CHARTS_CONFIG);
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post<ChartsConfigResponse>(
          `${API_BASE_URL}/generate_charts_configurations?charts_backend=echarts`,
          stats,
          {
            headers: {
              accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );
        setChartsConfig(response.data);
        if (data) {
          await buildCharts({
            data_frame: data,
            operations: response.data.operations,
          });
        }
      } catch (err) {
        const error = err as AxiosError;
        setError(error.message || "Failed to fetch charts configuration");
      } finally {
        setLoading(false);
      }
    },
    [data]
  );

  const buildCharts = useCallback(async (request: BuildChartsRequest) => {
    setCurrentStep(PipelineStep.BUILDING_CHARTS);
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post<BuildChartsResponse>(
        `${API_BASE_URL}/build_charts`,
        request,
        {
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      setExecutedCharts(response.data);
      await generateSummary(response.data);
    } catch (err) {
      const error = err as AxiosError;
      setError(error.message || "Failed to build charts");
    } finally {
      setLoading(false);
    }
  }, []);

  const generateSummary = useCallback(async (charts: BuildChartsResponse) => {
    setCurrentStep(PipelineStep.GENERATING_SUMMARY);
    setLoading(true);
    setError(null);
    try {
      const request = {
        stats: stats,
        charts: charts,
      };
      const response = await axios.post<SummaryResponse>(
        `${API_BASE_URL}/summary`,
        request,
        {
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      setSummary(response.data);
      setCurrentStep(PipelineStep.COMPLETED);
    } catch (err) {
      const error = err as AxiosError;
      setError(error.message || "Failed to generate summary");
    } finally {
      setLoading(false);
    }
  }, [stats]);

  const value: RefineContextType = {
    data,
    stats,
    chartsConfig,
    executedCharts,
    summary,
    loading,
    error,
    currentStep,
    uploadFile,
    fetchStats,
    fetchChartsConfig,
    buildCharts,
    generateSummary,
  };

  return (
    <RefineContext.Provider value={value}>{children}</RefineContext.Provider>
  );
};