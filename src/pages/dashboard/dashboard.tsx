import { Card, Typography, Spin, Button, Row, Col, Tabs, Empty } from "antd";
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
  const [dashboardCharts, setDashboardCharts] = useState<ChartAnalytics[]>([]);

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
    setDashboardCharts([]);
    localStorage.removeItem("dashboardSummary");
    go({ to: "/dashboard/upload", type: "replace" });
  };

  const handleAddToDashboard = (chart: ChartAnalytics) => {
    if (!dashboardCharts.some((c) => c.id === chart.id)) {
      setDashboardCharts((prev) => [...prev, chart]);
    }
  };

  const handleRemoveFromDashboard = (chartId: string) => {
    setDashboardCharts((prev) => prev.filter((c) => c.id !== chartId));
  };

  const isChartInDashboard = (chartId: string) => {
    return dashboardCharts.some((c) => c.id === chartId);
  };

  if (loading || !summary) {
    return <Spin spinning={true} tip="Loading Dashboard..." />;
  }

  const overviewContent = (
    <>
      <Card title={<Title level={3}>Dashboard</Title>} style={{ marginBottom: "20px" }}>
        <MarkdownField value={summary.stats_summary} />
      </Card>

      <Title level={4}>Chart Analysis</Title>
      <Row gutter={[16, 16]}>
        {summary.chart_analytics.map(
          (analytic: ChartAnalytics, index: number) => {
            const chartOptions = {
              ...analytic.chart_configuration,
              title: {},
            };

            const chartContent = (
              <Col xs={24} lg={12}>
                {analytic.chart_configuration && (
                  <ReactECharts option={chartOptions} />
                )}
              </Col>
            );

            const detailsContent = (
              <Col xs={24} lg={12}>
                <MarkdownField value={analytic.details} />
              </Col>
            );

            return (
              <Col span={24} key={analytic.id}>
                <Card
                  title={<Title level={5}>{analytic.title}</Title>}
                  extra={
                    <Button
                      onClick={() => handleAddToDashboard(analytic)}
                      disabled={isChartInDashboard(analytic.id)}
                    >
                      {isChartInDashboard(analytic.id) ? "Added to Dashboard" : "Add to Dashboard"}
                    </Button>
                  }
                >
                  <Row gutter={[32, 32]} align="middle">{index % 2 === 0 ? [chartContent, detailsContent] : [detailsContent, chartContent]}</Row>
                </Card>
              </Col>
            );
          },
        )}
      </Row>
    </>
  );

  const dashboardGrid = (
    <>
      {dashboardCharts.length > 0 ? (
        <Row gutter={[16, 16]}>
          {dashboardCharts.map((chart) => {
            const chartOptions = {
              ...chart.chart_configuration,
              title: {},
            };
            return (
              <Col key={chart.id} xs={24} lg={12}>
                <Card
                  title={chart.title}
                  extra={<Button danger onClick={() => handleRemoveFromDashboard(chart.id)}>Remove</Button>}
                >
                  {chart.chart_configuration && (
                    <ReactECharts option={chartOptions} style={{ height: '300px' }} />
                  )}
                </Card>
              </Col>
            );
          })}
        </Row>
      ) : (
        <Empty description="No charts added to the dashboard yet. Add charts from the 'Overview' tab." />
      )}
    </>
  );

  return (
    <Tabs
      defaultActiveKey="overview"
      tabBarExtraContent={
        <Button type="primary" onClick={handleStartNewAnalysis}>
          Start New Analysis
        </Button>
      }
    >
      <Tabs.TabPane tab="Overview" key="overview">
        {overviewContent}
      </Tabs.TabPane>
      <Tabs.TabPane tab="Dashboard" key="dashboard">
        {dashboardGrid}
      </Tabs.TabPane>
    </Tabs>
  );
};