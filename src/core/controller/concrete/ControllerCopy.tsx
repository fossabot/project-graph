import { invoke } from "@tauri-apps/api/core";
import { join } from "@tauri-apps/api/path";
import { readImage } from "@tauri-apps/plugin-clipboard-manager";
import { writeFile } from "@tauri-apps/plugin-fs";
import { v4 } from "uuid";
import { PathString } from "../../../utils/pathString";
import { Rectangle } from "../../dataStruct/shape/Rectangle";
import { Vector } from "../../dataStruct/Vector";
import { Renderer } from "../../render/canvas2d/renderer";
import { Stage } from "../../stage/Stage";
import { StageDumper } from "../../stage/StageDumper";
import { StageSerializedAdder } from "../../stage/stageManager/concreteMethods/StageSerializedAdder";
import { StageManager } from "../../stage/stageManager/StageManager";
import { ImageNode } from "../../stageObject/entity/ImageNode";
import { Entity } from "../../stageObject/StageObject";
import { Controller } from "../Controller";
import { ControllerClass } from "../ControllerClass";

/**
 * 关于复制相关的功能
 */
export const ControllerCopy = new ControllerClass();

const validKeys = ["ctrl", "shift", "c", "v", "x", "y"];

let mouseLocation = new Vector(0, 0);

ControllerCopy.mousemove = (event: MouseEvent) => {
  const worldLocation = Renderer.transformView2World(
    new Vector(event.clientX, event.clientY),
  );
  mouseLocation = worldLocation.clone();

  // 移动时候
  if (Stage.copyBoardDataRectangle) {
    // 计算鼠标位置的偏移量

    const offset = new Vector(
      worldLocation.x - Stage.copyBoardDataRectangle.center.x,
      worldLocation.y - Stage.copyBoardDataRectangle.center.y,
    );
    Stage.copyBoardMouseVector = offset;
  }
};
ControllerCopy.keydown = (event: KeyboardEvent) => {
  const key = event.key.toLowerCase();
  // 首先判断是否是合法的按键
  if (!validKeys.includes(key)) return;

  if (key === "c" && Controller.pressingKeySet.has("control")) {
    // 复制
    const entities: Entity[] = [];
    for (const entity of StageManager.getEntities()) {
      if (entity.isSelected) {
        entities.push(entity);
      }
    }

    const serialized = StageDumper.dumpSelected(entities);
    // 复制到剪贴板
    Stage.copyBoardData = serialized;
    if (entities.length === 0) {
      // 如果没有选中东西
      Stage.copyBoardDataRectangle = null;
    } else {
      // 复制的那一刹那，还要记录一下整个外接矩形
      const rectangles = [];
      for (const node of Stage.copyBoardData.nodes) {
        if (node.type === "core:connect_point") {
          rectangles.push(
            new Rectangle(new Vector(...node.location), new Vector(1, 1)),
          );
        } else {
          rectangles.push(
            new Rectangle(
              new Vector(...node.location),
              new Vector(...node.size),
            ),
          );
        }
      }

      const clipboardRect = Rectangle.getBoundingRectangle(rectangles);
      Stage.copyBoardDataRectangle = clipboardRect;
    }
  } else if (key === "v" && Controller.pressingKeySet.has("control")) {
    // 粘贴
    if (Stage.copyBoardData.nodes.length === 0) {
      readClipboardItems(mouseLocation);
    } else {
      if (Controller.pressingKeySet.has("shift")) {
        // 原位置粘贴
        StageSerializedAdder.addSerializedData(Stage.copyBoardData);
      } else {
        // 鼠标位置粘贴
        StageSerializedAdder.addSerializedData(
          Stage.copyBoardData,
          Stage.copyBoardMouseVector,
        );
      }
    }
  }
};
// async function isClipboardContainsImage(): Promise<boolean> {
//   try {
//     const items = await navigator.clipboard.read();
//     for (const item of items) {
//       if (
//         item.types.includes("image/png") ||
//         item.types.includes("image/jpeg")
//       ) {
//         return true;
//       }
//     }
//     return false;
//   } catch (err) {
//     console.error("Failed to read clipboard contents: ", err);
//     return false;
//   }
// }

// async function isClipboardContainsText(): Promise<boolean> {
//   try {
//     const items = await navigator.clipboard.read();
//     for (const item of items) {
//       if (item.types.includes("text/plain")) {
//         return true;
//       }
//     }
//     return false;
//   } catch (err) {
//     console.error("Failed to read clipboard contents: ", err);
//     return false;
//   }
// }

async function readClipboardItems(mouseLocation: Vector) {
  const image = await readImage();
  const size = await image.size();
  const uuid = v4();
  const path = await join(PathString.dirPath(Stage.Path.getFilePath()), uuid);
  console.log(path);
  await invoke("expand_scope", {
    folderPath: PathString.dirPath(Stage.Path.getFilePath()),
  });
  await writeFile(path, await image.rgba());
  const imageNode = new ImageNode({
    uuid,
    location: [mouseLocation.x, mouseLocation.y],
    size: [size.width, size.height],
    path: uuid,
  });
  StageManager.addImageNode(imageNode);
}

function blobToText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string); // 读取完成时返回结果
    reader.onerror = () => reject(reader.error); // 读取出错时返回错误
    reader.readAsText(blob); // 读取 Blob 对象作为文本
  });
}

// 将 Blob 转换为 Base64 字符串
async function convertBlobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result.split(",")[1]); // 去掉"data:image/png;base64,"前缀
      } else {
        reject(new Error("Invalid result type"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
