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
  // ¡IMPORTANTE! Reemplaza esta URL con tu endpoint de API real para la subida de archivos.
  action: "https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload",
  beforeUpload: (file) => {
    const allowedTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    const isAllowed = allowedTypes.includes(file.type);
    if (!isAllowed) {
      message.error(`${file.name} no es un archivo CSV o Excel válido.`);
    }
    // Si el tipo no es permitido, se previene la subida.
    return isAllowed || Upload.LIST_IGNORE;
  },
  onChange(info) {
    const { status } = info.file;
    if (status === "done") {
      message.success(`${info.file.name} se ha subido correctamente.`);
    } else if (status === "error") {
      message.error(`La subida de ${info.file.name} ha fallado.`);
    }
  },
};

export const UploadPage = () => {
  return (
    <Card>
      <Title level={3}>Subir Archivo</Title>
      <Paragraph>
        Por favor, selecciona o arrastra un archivo en formato CSV o Excel para
        subirlo.
      </Paragraph>
      <Dragger {...props}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Haz clic o arrastra un archivo a esta área para subirlo
        </p>
        <p className="ant-upload-hint">
          Soporte para una única subida. Los archivos que no sean CSV o Excel
          serán rechazados.
        </p>
      </Dragger>
    </Card>
  );
};