import sys
import traceback
from abc import ABCMeta, abstractmethod
from pathlib import Path
from typing import Callable
from appdirs import user_data_dir
from PyQt5.QtGui import QKeyEvent, QPaintEvent
from PyQt5.QtWidgets import QApplication, QMainWindow
from project_graph.liren_side.components import Component
from types import TracebackType

from project_graph.liren_side.logging import Log


class _NativeWindow(QMainWindow):
    def __init__(
        self, root: Component, init: Callable[[QMainWindow], None] = lambda _: None
    ):
        super().__init__()
        self.root = root
        init(self)

    def paintEvent(self, a0: QPaintEvent | None):
        assert a0 is not None
        self.root.paintEvent(self, a0)

    def keyPressEvent(self, a0: QKeyEvent | None):
        assert a0 is not None
        self.root.keyPressEvent(self, a0)

    def keyReleaseEvent(self, a0: QKeyEvent | None):
        assert a0 is not None
        self.root.keyReleaseEvent(self, a0)


class AppConfig(metaclass=ABCMeta):
    """对App进行配置的类"""

    @abstractmethod
    def main_window(self, application: QApplication) -> QMainWindow:
        """在QApplication被创建之后, 创建自定义的QMainWindow"""
        pass


class App:
    __creat_key = object()

    def __init__(self, create_key: object, config: AppConfig):
        assert create_key == App.__creat_key, "the constructor of App is private"
        self.__app = QApplication(sys.argv)
        self.__window = config.main_window(self.__app)

    def run(self):
        self.__window.show()
        sys.exit(self.__app.exec_())

    @staticmethod
    def get_data_dir(app_name: str):
        data_dir = user_data_dir(app_name, "LiRen")
        if not Path(data_dir).exists():
            Path(data_dir).mkdir(parents=True, exist_ok=True)
        return data_dir

    @staticmethod
    def create(config: AppConfig) -> "App":
        log = Log()

        def my_except_hook(
            exctype: type[BaseException], value: BaseException, tb: TracebackType
        ) -> None:
            if exctype is KeyboardInterrupt:
                sys.exit(0)

            print("error!!!")
            log.log("\n".join(traceback.format_exception(exctype, value, tb)))
            print(log.logs)
            # 用tkinter弹出错误信息，用输入框组件显示错误信息
            import tkinter as tk

            root = tk.Tk()
            root.title("error!")
            tk.Label(root, text="出现异常！").pack()
            t = tk.Text(root, height=50, width=150)
            t.config(fg="white", bg="black", font=("TkDefaultFont", 8))
            for line in log.logs:
                t.insert(tk.END, line + "\n")
            t.pack()
            tk.Button(root, text="确定", command=root.destroy).pack()
            tk.Button(root, text="退出", command=sys.exit).pack()
            root.mainloop()

        sys.excepthook = my_except_hook

        app = App(App.__creat_key, config)
        return app
