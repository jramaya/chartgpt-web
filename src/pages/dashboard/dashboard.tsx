import { Card, Typography } from "antd";
import { MarkdownField } from "@refinedev/antd";

const { Title } = Typography;

const loremIpsum = `
### Lorem Ipsum

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

*   **Feature 1:** Fast and reliable.
*   **Feature 2:** Easy to use.
*   **Feature 3:** Fully customizable.
`;

export const DashboardPage = () => {
  return (
    <Card>
      <Title level={3}>Dashboard</Title>
      <MarkdownField value={loremIpsum} />
    </Card>
  );
};