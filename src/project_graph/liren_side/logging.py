import datetime


class Log:
    def __init__(self):
        self.__logs: list[str] = []

    def log(self, *args):
        msg = (
            "["
            + datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            + "] "
            + " ".join(str(a) for a in args)
        )
        self.__logs.append(msg)
        print(msg)

    @property
    def logs(self) -> list[str]:
        return self.__logs.copy()
