import { Card, Typography, Spin } from "antd";
import { useGo } from "@refinedev/core";
import { MarkdownField } from "@refinedev/antd";
import { useEffect, useState } from "react";
import { SummaryResponse } from "../../interfaces/chart";

const { Title } = Typography;

export const DashboardPage = () => {
  const go = useGo();
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

  if (loading || !summary) {
    return <Spin spinning={true} tip="Loading Dashboard..." />;
  }
  return (
    <Card>
      <Title level={3}>Dashboard</Title>
      <MarkdownField value={summary.stats_summary} />
    </Card>
  );
};