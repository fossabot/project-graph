import { createRoot } from "react-dom/client";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { routes } from "@generouted/react-router";
import "./index.pcss";
import { RecoilRoot } from "recoil";
import { DialogProvider } from "./utils/dialog";
import { Settings } from "./core/Settings";
import { RecentFileManager } from "./core/RecentFileManager";
// import { platform } from "@tauri-apps/plugin-os";

console.log("Hello, world!");

const router = createMemoryRouter(routes);
const Routes = () => <RouterProvider router={router} />;

// 2024/10/5 发现这里Linux 系统下，await不能直接写在最外层，会导致整个页面无法渲染，原因未知

(async () => {
  await Settings.init();
  await RecentFileManager.init();
  createRoot(document.getElementById("root")!).render(
    <RecoilRoot>
      <DialogProvider>
        <Routes />
      </DialogProvider>
    </RecoilRoot>,
  );
})();
