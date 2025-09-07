import React, { useContext, useEffect } from "react";
import { InboxOutlined } from "@ant-design/icons";
import {
  Upload,
  message,
  Typography,
  Card,
  Steps,
  Spin,
  type UploadProps,
} from "antd";
import { RefineContext } from "../../providers/chartProvider";
import { PipelineStep } from "../../interfaces/chart.d";

const { Dragger } = Upload;
const { Title, Paragraph } = Typography;

export const UploadPage = () => {
  const context = useContext(RefineContext);

  if (!context) {
    return <Card>Error: Context not found.</Card>;
  }

  const { uploadFile, currentStep, summary, loading, error } = context;

  useEffect(() => {
    if (summary) {
      localStorage.setItem("dashboardSummary", JSON.stringify(summary));
      message.success("Analysis complete and summary saved!");
    }
  }, [summary]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const props: UploadProps = {
    name: "file",
    multiple: false,
    showUploadList: false,
    beforeUpload: (file) => {
      const allowedTypes = [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      const isAllowedType = allowedTypes.includes(file.type);
      if (!isAllowedType) {
        message.error(`${file.name} is not a valid CSV or Excel file.`);
      }

      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error("File must be smaller than 2MB!");
      }

      if (isAllowedType && isLt2M) {
        uploadFile(file);
      }

      // Prevent antd's default upload behavior
      return Upload.LIST_IGNORE;
    },
  };

  return (
    <Card>
      <Title level={3}>Upload File</Title>
      <Paragraph>
        Please select or drag a CSV or Excel file to upload it.
      </Paragraph>
      <Dragger {...props} disabled={loading}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag file to this area to upload
        </p>
        <p className="ant-upload-hint">
          Support for a single upload. Files other than CSV or Excel will be
          rejected. The recommended file size is no more than 2MB.
        </p>
      </Dragger>

      {currentStep !== PipelineStep.IDLE && (
        <Spin spinning={loading} tip="Analyzing...">
          <Steps
            direction="vertical"
            current={Object.values(PipelineStep).indexOf(currentStep) - 1}
            status={error ? "error" : "process"}
            style={{ marginTop: 24 }}
            items={[
              {
                title: "Uploading File",
              },
              {
                title: "Fetching Statistics",
              },
              {
                title: "Generating Chart Configurations",
              },
              {
                title: "Building Charts",
              },
              {
                title: "Generating Summary",
              },
              { title: "Completed" },
            ]}
          />
        </Spin>
      )}
    </Card>
  );
};