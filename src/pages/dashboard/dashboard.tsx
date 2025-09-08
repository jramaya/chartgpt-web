import { Card, Typography, Spin, Button } from "antd";
import { useGo } from "@refinedev/core";
import { MarkdownField } from "@refinedev/antd";
import { useContext, useEffect, useState } from "react";
import { SummaryResponse } from "../../interfaces/chart";
import { RefineContext } from "../../providers/chartProvider";

const { Title } = Typography;

export const DashboardPage = () => {
  const go = useGo();
  const context = useContext(RefineContext);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedSummary = localStorage.getItem("dashboardSummary");
    if (savedSummary) {
      setSummary(JSON.parse(savedSummary));
    } else {
      go({ to: "/dashboard/upload", type: "replace" });
    }
    setLoading(false);
  }, [go]);

  const handleStartNewAnalysis = () => {
    if (context) {
      context.resetToIdle();
    }
    localStorage.removeItem("dashboardSummary");
    go({ to: "/dashboard/upload", type: "replace" });
  };

  if (loading || !summary) {
    return <Spin spinning={true} tip="Loading Dashboard..." />;
  }
  return (
    <Card
      title={<Title level={3}>Dashboard</Title>}
      extra={
        <Button type="primary" onClick={handleStartNewAnalysis}>
          Start New Analysis
        </Button>
      }
    >
      <MarkdownField value={summary.stats_summary} />
    </Card>
  );
};