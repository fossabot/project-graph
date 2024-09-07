import sys

from PyQt5.QtGui import QIcon
from PyQt5.QtWidgets import QApplication, QMainWindow

from project_graph.liren_side.app import AppConfig, App


class MyConfig(AppConfig):
    def main_window(self, app: QApplication) -> QMainWindow:
        app.setWindowIcon(QIcon("./assets/favicon.ico"))
        # 只在这里导入主窗口，防止最开始导入，一些东西没初始化好
        from project_graph.ui.main_window.main_window import Canvas

        return Canvas()


if __name__ == "__main__":
    App.create(MyConfig()).run()
