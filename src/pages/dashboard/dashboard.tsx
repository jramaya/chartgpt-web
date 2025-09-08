import { Card, Typography, Spin, Button, Row, Col } from "antd";
import { useGo } from "@refinedev/core";
import { MarkdownField } from "@refinedev/antd";
import { useContext, useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { SummaryResponse, ChartAnalytics } from "../../interfaces/chart";
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
    <>
      <Card
        title={<Title level={3}>Dashboard</Title>}
        extra={
          <Button type="primary" onClick={handleStartNewAnalysis}>
            Start New Analysis
          </Button>
        }
        style={{ marginBottom: "20px" }}
      >
        <Title level={4}>Statistics Summary</Title>
        <MarkdownField value={summary.stats_summary} />
      </Card>

      <Title level={4}>Chart Analysis</Title>
      <Row gutter={[16, 16]}>
        {summary.chart_analytics.map((analytic: ChartAnalytics) => (
          <Col span={24} key={analytic.id}>
            <Card>
              {analytic.chart_configuration && (
                <ReactECharts option={analytic.chart_configuration} />
              )}
              <MarkdownField value={analytic.details} />
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
};