import httpx

from app.providers.base import AIProvider, ChatMessage, ProviderConfigError, ProviderRequestError

_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"


class GeminiProvider(AIProvider):
    name = "gemini"

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
                "Gemini is not configured on this server. Set GEMINI_API_KEY to enable it."
            )

        system_parts = [m.content for m in messages if m.role == "system"]
        # Gemini uses "user"/"model" roles instead of "user"/"assistant".
        contents = [
            {"role": "model" if m.role == "assistant" else "user", "parts": [{"text": m.content}]}
            for m in messages
            if m.role in ("user", "assistant")
        ]

        payload: dict = {"contents": contents}
        if system_parts:
            payload["system_instruction"] = {"parts": [{"text": "\n\n".join(system_parts)}]}
        if temperature is not None:
            payload["generationConfig"] = {"temperature": temperature}

        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                response = await client.post(
                    _API_URL.format(model=model),
                    params={"key": self._api_key},
                    json=payload,
                )
                response.raise_for_status()
            except httpx.HTTPStatusError as exc:
                raise ProviderRequestError(f"Gemini request failed: {exc.response.status_code}") from exc
            except httpx.HTTPError as exc:
                raise ProviderRequestError("Gemini request failed: network error") from exc

        data = response.json()
        try:
            parts = data["candidates"][0]["content"]["parts"]
            return "".join(p.get("text", "") for p in parts)
        except (KeyError, IndexError) as exc:
            raise ProviderRequestError("Gemini returned an unexpected response shape") from exc
