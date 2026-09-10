import httpx

from app.providers.base import AIProvider, ChatMessage, ProviderConfigError, ProviderRequestError

_API_URL = "https://api.openai.com/v1/chat/completions"


class OpenAIProvider(AIProvider):
    name = "openai"

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
                "OpenAI is not configured on this server. Set OPENAI_API_KEY to enable it."
            )

        payload: dict = {
            "model": model,
            "messages": [{"role": m.role, "content": m.content} for m in messages],
        }
        if temperature is not None:
            payload["temperature"] = temperature

        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                response = await client.post(
                    _API_URL,
                    headers={"Authorization": f"Bearer {self._api_key}"},
                    json=payload,
                )
                response.raise_for_status()
            except httpx.HTTPStatusError as exc:
                raise ProviderRequestError(f"OpenAI request failed: {exc.response.status_code}") from exc
            except httpx.HTTPError as exc:
                raise ProviderRequestError("OpenAI request failed: network error") from exc

        data = response.json()
        try:
            return data["choices"][0]["message"]["content"]
        except (KeyError, IndexError) as exc:
            raise ProviderRequestError("OpenAI returned an unexpected response shape") from exc
