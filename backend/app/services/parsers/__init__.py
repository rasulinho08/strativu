from app.services.document_model import ParsedDocument
from app.services.parsers.csv_parser import parse_csv
from app.services.parsers.docx_parser import parse_docx
from app.services.parsers.text_parser import parse_text
from app.services.parsers.xlsx_parser import parse_xlsx


class UnsupportedFileTypeError(Exception):
    pass


def parse_upload(filename: str, content: bytes) -> ParsedDocument:
    lower = filename.lower()
    if lower.endswith(".docx"):
        return parse_docx(filename, content)
    if lower.endswith(".xlsx"):
        return parse_xlsx(filename, content)
    if lower.endswith(".csv"):
        return parse_csv(filename, content)
    if lower.endswith(".txt"):
        return parse_text(filename, content.decode("utf-8", errors="replace"))
    raise UnsupportedFileTypeError(f"Unsupported file type: {filename}")
