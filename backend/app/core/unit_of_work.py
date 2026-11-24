from abc import ABC, abstractmethod
from types import TracebackType


class AbstractUnitOfWork(ABC):
    @abstractmethod
    def __enter__(
        self,
    ) -> "AbstractUnitOfWork":
        
        raise NotImplementedError

    @abstractmethod
    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc_value: BaseException | None,
        traceback: TracebackType | None,
    ) -> bool:
        """
        Confirma o revierte la transacción y libera recursos.
        """
        raise NotImplementedError

    @abstractmethod
    def commit(self) -> None:
        
        raise NotImplementedError

    @abstractmethod
    def rollback(self) -> None:
        
        raise NotImplementedError