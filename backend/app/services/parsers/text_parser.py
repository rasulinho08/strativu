from app.services.document_model import Block, ParsedDocument


def parse_text(filename: str | None, text: str) -> ParsedDocument:
    paragraphs = text.split("\n")
    blocks = [
        Block(index=i, kind="paragraph", text=p)
        for i, p in enumerate(paragraphs)
    ]
    return ParsedDocument(doc_type="text", filename=filename, blocks=blocks)
