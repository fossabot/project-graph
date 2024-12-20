import { routes } from "@generouted/react-router";
import { invoke } from "@tauri-apps/api/core";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { TextRiseEffect } from "./core/effect/concrete/TextRiseEffect";
import { RecentFileManager } from "./core/RecentFileManager";
import { EdgeRenderer } from "./core/render/canvas2d/entityRenderer/edge/EdgeRenderer";
import { Renderer } from "./core/render/canvas2d/renderer";
import { Settings } from "./core/Settings";
import { Stage } from "./core/stage/Stage";
import "./index.pcss";
// import { platform } from "@tauri-apps/plugin-os";
import i18next from "i18next";
import { createRoot } from "react-dom/client";
import { initReactI18next } from "react-i18next";
import { RecoilRoot } from "recoil";
import { ProgressNumber } from "./core/dataStruct/ProgressNumber";
import { Camera } from "./core/stage/Camera";
import { StageHistoryManager } from "./core/stage/stageManager/StageHistoryManager";
import { EdgeCollisionBoxGetter } from "./core/stageObject/association/EdgeCollisionBoxGetter";
import { StageStyleManager } from "./core/stageStyle/StageStyleManager";
import { StartFilesManager } from "./core/StartFilesManager";
import { DialogProvider } from "./utils/dialog";
import { PopupDialogProvider } from "./utils/popupDialog";

// 计时开始
const t1 = performance.now();

const router = createMemoryRouter(routes);
const Routes = () => <RouterProvider router={router} />;
// 0.2ms

const el = document.getElementById("root")!;

// 2024/10/5 发现这里Linux 系统下，await不能直接写在最外层，会导致整个页面无法渲染，原因：webkit目前不支持顶层await

(async () => {
  // 这段代码用时
  await Settings.init();
  await RecentFileManager.init();
  await StartFilesManager.init();
  // 15~20ms 左右
  EdgeCollisionBoxGetter.init();
  EdgeRenderer.init();
  Renderer.init();
  Camera.init();
  Stage.init();
  StageHistoryManager.init();
  StageStyleManager.init();

  // 启动时加载用户自定义的工程文件
  StartFilesManager.getCurrentStartFile().then((path) => {
    if (path === "") {
      // 还没有设置自动打开路径
      const t2 = performance.now();
      Stage.effects.push(
        new TextRiseEffect(
          "加载耗时：" + (t2 - t1).toFixed(2) + "ms",
          new ProgressNumber(0, 100),
        ),
      );
      return;
    } else {
      invoke<string>("check_json_exist", {
        path,
      })
        .then((isExists) => {
          console.log(isExists);
          if (isExists) {
            // 打开自定义的工程文件
            RecentFileManager.openFileByPath(path);
            setTimeout(() => {
              // 更改顶部路径名称
              RecentFileManager.openFileByPathWhenAppStart(path);
            }, 1000);
            console.log("自动打开了工程文件：" + path);
            const t2 = performance.now();
            // 打开工程文件后，显示欢迎信息
            Stage.effects.push(
              new TextRiseEffect(
                "加载耗时：" + (t2 - t1).toFixed(2) + "ms",
                new ProgressNumber(0, 100),
              ),
            );
          } else {
            // 自动打开路径不存在
            Stage.effects.push(
              new TextRiseEffect(`打开工程失败，${path}不存在！`),
            );
          }
        })
        .catch((e) => {
          console.error(e);
        });
    }
  });

  i18next.use(initReactI18next).init({
    lng: "zh-CN",
    debug: import.meta.env.DEV,
    defaultNS: "",
    resources: {
      en: await import("./locales/en.yml").then((m) => m.default),
      "zh-CN": await import("./locales/zh-CN.yml").then((m) => m.default),
      "zh-TW": await import("./locales/zh-TW.yml").then((m) => m.default),
    },
  });

  createRoot(el).render(
    <RecoilRoot>
      <DialogProvider>
        <PopupDialogProvider>
          <Routes />
        </PopupDialogProvider>
      </DialogProvider>
    </RecoilRoot>,
  );
  // 渲染，2ms左右
})();
