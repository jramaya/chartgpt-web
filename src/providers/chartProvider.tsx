import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useRef,
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
  resetToIdle: () => void;
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
  const isMountedRef = useRef(true);

  useEffect(() => {
    // El efecto se ejecuta una vez al montar el componente.
    // La función de limpieza se ejecutará solo cuando el componente se desmonte.
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  const isMounted = useCallback(() => isMountedRef.current, []);

  const fetchStats = useCallback(async (data: DataFrame): Promise<StatsResponse> => {
    setCurrentStep(PipelineStep.FETCHING_STATS);
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
    if (isMounted()) setStats(response.data);
    return response.data;
  }, [API_BASE_URL, isMounted]);

  const fetchChartsConfig = useCallback(
    async (stats: StatsResponse): Promise<ChartsConfigResponse> => {
      setCurrentStep(PipelineStep.FETCHING_CHARTS_CONFIG);
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
      if (isMounted()) setChartsConfig(response.data);
      return response.data;
    },
    [API_BASE_URL, isMounted]
  );

  const buildCharts = useCallback(async (request: BuildChartsRequest): Promise<BuildChartsResponse> => {
    setCurrentStep(PipelineStep.BUILDING_CHARTS);
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
    if (isMounted()) setExecutedCharts(response.data);
    return response.data;
  }, [API_BASE_URL, isMounted]);

  const generateSummary = useCallback(async (stats: StatsResponse, executedCharts: BuildChartsResponse): Promise<SummaryResponse> => {
    setCurrentStep(PipelineStep.GENERATING_SUMMARY);
    const request = {
      stats: stats,
      charts_to_summarize: executedCharts,
    };
    const response = await axios.post<SummaryResponse>(
      `${API_BASE_URL}/generate_summary`,
      request,
      {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
    if (isMounted()) {
      setSummary(response.data);
    }
    return response.data;
  }, [API_BASE_URL, isMounted]);

  const runAnalysisPipeline = useCallback(async (initialData: DataFrame) => {
    try {
      const statsResult = await fetchStats(initialData);
      const chartsConfigResult = await fetchChartsConfig(statsResult);
      const executedChartsResult = await buildCharts({
        data_frame: initialData,
        operations: chartsConfigResult.operations,
      });
      const summaryResult = await generateSummary(
        statsResult,
        executedChartsResult
      );

      // Enrich chart_analytics with data from executedChartsResult
      const enrichedChartAnalytics = summaryResult.chart_analytics.map(
        (analytic) => {
          const correspondingChart = executedChartsResult.executed_charts.find(
            (chart) => chart.id === analytic.id
          );
          if (correspondingChart) {
            return {
              ...analytic,
              insight: correspondingChart.insight,
              chart_type: correspondingChart.chart_type,
              chart_configuration: correspondingChart.result,
            };
          }
          return analytic;
        }
      );

      const enrichedSummary: SummaryResponse = {
        ...summaryResult,
        chart_analytics: enrichedChartAnalytics,
      };

      await completeStatus(enrichedSummary);
    } catch (err) {
      const error = err as AxiosError;
      const errorMessage =
        (error.response?.data as any)?.detail ||
        error.message ||
        "An unknown error occurred in the pipeline.";
      if (isMounted()) {
        setError(errorMessage);
        setCurrentStep(PipelineStep.IDLE);
      }
    } finally {
      if (isMounted()) {
        setLoading(false);
      }
    }
  }, [fetchStats, fetchChartsConfig, buildCharts, generateSummary, isMounted]);

  const uploadFile = useCallback(async (file: File): Promise<void> => {
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
      const newData = response.data;
      if (isMounted()) {
        setData(newData);
      }
      // Start the rest of the pipeline
      await runAnalysisPipeline(newData);
    } catch (err) {
      const error = err as AxiosError;
      if (isMounted()) {
        setError(error.message || "Failed to upload file");
        setCurrentStep(PipelineStep.IDLE);
        setLoading(false);
      }
    }
  }, [API_BASE_URL, isMounted, runAnalysisPipeline]);

  const completeStatus = useCallback(async (summaryResult: SummaryResponse) => {
    setCurrentStep(PipelineStep.COMPLETED);
    setLoading(false);
    setError(null);
    localStorage.setItem("dashboardSummary", JSON.stringify(summaryResult));
  }, []);

  const resetToIdle = useCallback(() => {
    setCurrentStep(PipelineStep.IDLE);
    setLoading(false);
    setError(null);
  }, []);

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
    resetToIdle,
  };

  return (
    <RefineContext.Provider value={value}>{children}</RefineContext.Provider>
  );
};