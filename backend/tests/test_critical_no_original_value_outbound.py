"""The single most important test in this system.

It proves that whatever gets handed to the external AI provider's
``generate()`` call never contains the original sensitive value — only its
sanitized token form. If this test fails, the product's core security
promise is broken.
"""

from app.providers.base import AIProvider, ChatMessage
from app.services.ai_gateway import gateway as gateway_module

ORIGINAL_NAME = "Aydin Huseynov"
ORIGINAL_EMAIL = "aydin@example.com"
ORIGINAL_SALARY = "5,000 AZN"

DOCUMENT_TEXT = (
    f"Please analyze the employment contract of {ORIGINAL_NAME}. "
    f"His salary is {ORIGINAL_SALARY} and his email is {ORIGINAL_EMAIL}."
)


class RecordingProvider(AIProvider):
    name = "recording"

    def __init__(self):
        self.captured_messages: list[ChatMessage] = []

    async def generate(self, messages, model, temperature=None):
        self.captured_messages.extend(messages)
        return "Summary referencing [PERSON_1] and [FINANCE_1]."


def test_original_sensitive_values_never_reach_the_provider(client):
    r = client.post("/api/sessions")
    session_id = r.json()["session_id"]

    client.post("/api/documents/text", json={"session_id": session_id, "text": DOCUMENT_TEXT})
    r = client.post(f"/api/dlp/scan?session_id={session_id}")
    findings = r.json()["findings"]
    approved_ids = [f["id"] for f in findings]
    client.post("/api/dlp/approve", json={"session_id": session_id, "approved_finding_ids": approved_ids})
    client.post(f"/api/documents/sanitize?session_id={session_id}")

    recording_provider = RecordingProvider()
    original_build_provider = gateway_module.build_provider
    gateway_module.build_provider = lambda provider_name, settings: recording_provider
    try:
        r = client.post("/api/ai/chat", json={"session_id": session_id, "message": "Summarize this contract."})
    finally:
        gateway_module.build_provider = original_build_provider

    assert r.status_code == 200

    outbound_payload = "\n".join(m.content for m in recording_provider.captured_messages)

    assert ORIGINAL_NAME not in outbound_payload
    assert ORIGINAL_EMAIL not in outbound_payload
    assert ORIGINAL_SALARY not in outbound_payload

    assert "[PERSON_1]" in outbound_payload
    assert "[FINANCE_1]" in outbound_payload
    assert "[EMAIL_1]" in outbound_payload

    # The final human-readable reply, however, IS rehydrated for the user.
    assert ORIGINAL_NAME in r.json()["reply"]
