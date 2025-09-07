import {
  BaseRecord,
  DataProvider,
  GetListParams,
  GetListResponse,
  GitHubBanner,
  Refine,
} from "@refinedev/core";
import {
  useNotificationProvider,
  ThemedLayout,
  ErrorComponent,
  RefineThemes,
} from "@refinedev/antd";
import dataProvider from "@refinedev/simple-rest";
import routerProvider, {
  NavigateToResource,
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router";
import { BrowserRouter, Routes, Route, Outlet } from "react-router";
import { ConfigProvider, App as AntdApp } from "antd";
import "@ant-design/v5-patch-for-react-19";
import "@refinedev/antd/dist/reset.css";

import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { DashboardPage, UploadPage } from "./pages/dashboard";

const API_URL = "https://api.fake-rest.refine.dev";

const App: React.FC = () => {
  return (
    <DevtoolsProvider>
      <BrowserRouter>
        <GitHubBanner />
        <ConfigProvider theme={RefineThemes.Blue}>
          <AntdApp>
            <Refine
              routerProvider={routerProvider}
              dataProvider={dataProvider(API_URL)}
              resources={[
                {
                  name: "dashboard",
                  list: "/dashboard",
                },
              ]}
              notificationProvider={useNotificationProvider}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
              }}
            >
              <Routes>
                <Route
                  element={
                    <ThemedLayout>
                      <Outlet />
                    </ThemedLayout>
                  }
                >
                  <Route index element={<NavigateToResource/>} />
                  <Route path="/dashboard">
                    <Route index element={<DashboardPage />} />
                    <Route path="upload" element={<UploadPage />} />
                  </Route>

                  <Route path="*" element={<ErrorComponent />} />
                </Route>
              </Routes>
              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
            </Refine>
          </AntdApp>
        </ConfigProvider>
        <DevtoolsPanel />
      </BrowserRouter>
    </DevtoolsProvider>
  );
};

export default App;
