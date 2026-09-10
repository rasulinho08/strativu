"""Export sanitized or rehydrated documents without ever shifting rows,
columns, worksheet names, or paragraph/table order.
"""

import csv
import io

from docx import Document as DocxDocument
from openpyxl import Workbook

from app.services.document_model import ParsedDocument
from app.services.rehydration.rehydrator import rehydrate
from app.services.session_store import Session


class ExportError(Exception):
    pass


def _resolve_blocks(session: Session, source: str) -> list[str]:
    if session.sanitized_text is None:
        raise ExportError("Document has not been sanitized yet")
    document: ParsedDocument = session.document
    texts = [session.sanitized_text.blocks[b.index] for b in document.blocks]
    if source == "sanitized":
        return texts
    return [rehydrate(session, t)[0] for t in texts]


def _resolve_sheets(session: Session, source: str) -> dict[str, list[list[str]]]:
    if session.sanitized_table is None:
        raise ExportError("Document has not been sanitized yet")
    sheets = session.sanitized_table.sheets
    if source == "sanitized":
        return sheets
    return {
        name: [[rehydrate(session, cell)[0] for cell in row] for row in rows]
        for name, rows in sheets.items()
    }


def export_txt(session: Session, source: str) -> bytes:
    texts = _resolve_blocks(session, source)
    return "\n".join(texts).encode("utf-8")


def export_docx(session: Session, source: str) -> bytes:
    texts = _resolve_blocks(session, source)
    document: ParsedDocument = session.document
    out = DocxDocument()

    for block, text in zip(document.blocks, texts):
        if block.kind == "table_cell":
            continue  # tables are rebuilt separately below, in their own grid
        if block.kind == "heading" and block.heading_level:
            out.add_heading(text, level=min(block.heading_level, 9))
        else:
            out.add_paragraph(text)

    tables_by_index: dict[int, dict[int, dict[int, str]]] = {}
    for block, text in zip(document.blocks, texts):
        if block.kind != "table_cell":
            continue
        tables_by_index.setdefault(block.table_index, {}).setdefault(block.row_index, {})[block.col_index] = text

    for _, rows in sorted(tables_by_index.items()):
        row_count = len(rows)
        col_count = max((len(cols) for cols in rows.values()), default=0)
        if row_count == 0 or col_count == 0:
            continue
        table = out.add_table(rows=row_count, cols=col_count)
        for row_idx in sorted(rows.keys()):
            for col_idx, value in rows[row_idx].items():
                table.cell(row_idx, col_idx).text = value

    buffer = io.BytesIO()
    out.save(buffer)
    return buffer.getvalue()


def export_xlsx(session: Session, source: str) -> bytes:
    sheets = _resolve_sheets(session, source)
    document: ParsedDocument = session.document
    workbook = Workbook()
    workbook.remove(workbook.active)

    for sheet in document.sheets:
        ws = workbook.create_sheet(title=sheet.name)
        if sheet.columns:
            ws.append(sheet.columns)
        for row in sheets.get(sheet.name, []):
            ws.append(row)

    buffer = io.BytesIO()
    workbook.save(buffer)
    return buffer.getvalue()


def export_csv(session: Session, source: str) -> bytes:
    sheets = _resolve_sheets(session, source)
    document: ParsedDocument = session.document
    if not document.sheets:
        return b""
    sheet = document.sheets[0]

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    if sheet.columns:
        writer.writerow(sheet.columns)
    for row in sheets.get(sheet.name, []):
        writer.writerow(row)
    return buffer.getvalue().encode("utf-8")
