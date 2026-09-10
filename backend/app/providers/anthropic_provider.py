import httpx

from app.providers.base import AIProvider, ChatMessage, ProviderConfigError, ProviderRequestError

_API_URL = "https://api.anthropic.com/v1/messages"
_ANTHROPIC_VERSION = "2023-06-01"


class AnthropicProvider(AIProvider):
    name = "anthropic"

    def __init__(self, api_key: str | None):
        self._api_key = api_key

    async def generate(
        self,
        messages: list[ChatMessage],
        model: str,
        temperature: float | None = None,
    ) -> str:
        if not self._api_key:
            raise ProviderConfigError(
                "Anthropic is not configured on this server. Set ANTHROPIC_API_KEY to enable it."
            )

        system_parts = [m.content for m in messages if m.role == "system"]
        conversation = [
            {"role": m.role, "content": m.content} for m in messages if m.role in ("user", "assistant")
        ]

        payload: dict = {
            "model": model,
            "max_tokens": 4096,
            "messages": conversation,
        }
        if system_parts:
            payload["system"] = "\n\n".join(system_parts)
        if temperature is not None:
            payload["temperature"] = temperature

        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                response = await client.post(
                    _API_URL,
                    headers={
                        "x-api-key": self._api_key,
                        "anthropic-version": _ANTHROPIC_VERSION,
                    },
                    json=payload,
                )
                response.raise_for_status()
            except httpx.HTTPStatusError as exc:
                raise ProviderRequestError(f"Anthropic request failed: {exc.response.status_code}") from exc
            except httpx.HTTPError as exc:
                raise ProviderRequestError("Anthropic request failed: network error") from exc

        data = response.json()
        try:
            return "".join(block["text"] for block in data["content"] if block.get("type") == "text")
        except (KeyError, TypeError) as exc:
            raise ProviderRequestError("Anthropic returned an unexpected response shape") from exc
