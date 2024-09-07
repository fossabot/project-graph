import os
import subprocess
from pathlib import Path
from dotenv import load_dotenv
from PyQt5.QtGui import QIcon
from PyQt5.QtWidgets import QApplication, QMainWindow
from project_graph import INFO
from project_graph.liren_side.app import App, AppConfig
from project_graph.logging import log

# 导入资源文件
try:
    import project_graph.assets.assets  # type: ignore  # noqa: F401
except ImportError:
    from PyQt5 import pyrcc_main

    if not pyrcc_main.processResourceFile(
        [(Path(__file__).parent / "assets" / "image.rcc").as_posix()],
        (Path(__file__).parent / "assets" / "assets.py").as_posix(),
        False,
    ):
        log("Failed to compile assets.rcc")
        exit(1)

    import project_graph.assets.assets  # type: ignore  # noqa: F401


class MyConfig(AppConfig):
    def main_window(self, app: QApplication) -> QMainWindow:
        app.setWindowIcon(QIcon("./assets/favicon.ico"))
        # 只在这里导入主窗口，防止最开始导入，一些东西没初始化好
        from project_graph.ui.main_window.main_window import Canvas

        return Canvas()


def main():
    load_dotenv()
    os.environ["ARK_API_KEY"] = os.getenv("ARK_API_KEY", "")
    os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY", "")
    os.environ["OPENAI_API_BASE"] = os.getenv("OPENAI_API_BASE", "")
    if INFO.env == "dev":
        INFO.commit = (
            subprocess.check_output(["git", "rev-parse", "HEAD"]).decode().strip()
        )
        INFO.date = (
            subprocess.check_output(["git", "log", "-1", "--format=%cd"])
            .decode()
            .strip()
        )
        INFO.branch = (
            subprocess.check_output(["git", "rev-parse", "--abbrev-ref", "HEAD"])
            .decode()
            .strip()
        )
    App.create(MyConfig()).run()


if __name__ == "__main__":
    main()
