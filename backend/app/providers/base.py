from abc import ABC, abstractmethod
from dataclasses import dataclass


class ProviderConfigError(Exception):
    """Raised when a provider is selected but not configured (missing API key)."""


class ProviderRequestError(Exception):
    """Raised when the upstream provider call fails."""


@dataclass
class ChatMessage:
    role: str  # "system" | "user" | "assistant"
    content: str


class AIProvider(ABC):
    name: str

    @abstractmethod
    async def generate(
        self,
        messages: list[ChatMessage],
        model: str,
        temperature: float | None = None,
    ) -> str: ...
