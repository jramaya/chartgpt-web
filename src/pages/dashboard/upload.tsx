import { InboxOutlined } from "@ant-design/icons";
import {
  Upload,
  message,
  Typography,
  Card,
  type UploadProps,
} from "antd";

const { Dragger } = Upload;
const { Title, Paragraph } = Typography;

const props: UploadProps = {
  name: "file",
  multiple: false,
  // IMPORTANT! Replace this URL with your actual API endpoint for file uploads.
  action: "https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload",
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

    const isAllowed = isAllowedType && isLt2M;
    // If the file is not allowed, prevent upload.
    return isAllowed || Upload.LIST_IGNORE;
  },
  onChange(info) {
    const { status } = info.file;
    if (status === "done") {
      message.success(`${info.file.name} file uploaded successfully.`);
    } else if (status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
  },
};

export const UploadPage = () => {
  return (
    <Card>
      <Title level={3}>Upload File</Title>
      <Paragraph>
        Please select or drag a CSV or Excel file to upload it.
      </Paragraph>
      <Dragger {...props}>
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
    </Card>
  );
};