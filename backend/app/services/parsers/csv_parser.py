import csv
import io

from app.services.document_model import ParsedDocument, Sheet


def parse_csv(filename: str, content: bytes) -> ParsedDocument:
    text = content.decode("utf-8-sig", errors="replace")
    reader = csv.reader(io.StringIO(text))
    rows = list(reader)
    if not rows:
        return ParsedDocument(doc_type="csv", filename=filename, sheets=[Sheet(name="Sheet1", columns=[], rows=[])])

    columns = rows[0]
    data_rows = rows[1:]
    sheet = Sheet(name="Sheet1", columns=columns, rows=data_rows)
    return ParsedDocument(doc_type="csv", filename=filename, sheets=[sheet])
