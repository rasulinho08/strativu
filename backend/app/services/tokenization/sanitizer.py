"""Applies approved findings to the parsed document, producing the sanitized
version that is the only thing ever allowed to reach an external AI provider.
"""

from collections import defaultdict

from app.models.schemas import Finding
from app.services.session_store import SanitizedTable, SanitizedText, Session
from app.services.tokenization.tokenizer import get_or_create_token


def _replace_span(text: str, start: int, end: int, replacement: str) -> str:
    return text[:start] + replacement + text[end:]


def sanitize_session(session: Session) -> str:
    """Mask every approved finding and store the result on the session.

    Returns a flattened human-readable preview string for the UI.
    """
    approved: list[Finding] = [
        f for fid, f in session.findings.items() if fid in session.approved_ids
    ]

    if session.document is None:
        raise ValueError("No document to sanitize")

    if session.document.is_tabular:
        return _sanitize_table(session, approved)
    return _sanitize_text(session, approved)


def _sanitize_text(session: Session, approved: list[Finding]) -> str:
    by_block: dict[int, list[Finding]] = defaultdict(list)
    for f in approved:
        if f.location.block_index is not None:
            by_block[f.location.block_index].append(f)

    result = SanitizedText()
    for block in session.document.blocks:
        text = block.text
        block_findings = sorted(by_block.get(block.index, []), key=lambda f: f.location.start, reverse=True)
        for f in block_findings:
            token = get_or_create_token(session, f.category, f.value)
            text = _replace_span(text, f.location.start, f.location.end, token)
        result.blocks[block.index] = text

    session.sanitized_text = result
    preview_lines = [result.blocks[b.index] for b in session.document.blocks]
    return "\n".join(preview_lines)


def _sanitize_table(session: Session, approved: list[Finding]) -> str:
    by_cell: dict[tuple[str, int, int], list[Finding]] = defaultdict(list)
    for f in approved:
        loc = f.location
        if loc.sheet is not None and loc.row is not None and loc.col is not None:
            by_cell[(loc.sheet, loc.row, loc.col)].append(f)

    result = SanitizedTable()
    preview_parts = []
    for sheet in session.document.sheets:
        sanitized_rows: list[list[str]] = []
        for row_idx, row in enumerate(sheet.rows):
            sanitized_row = list(row)
            for col_idx, cell in enumerate(row):
                cell_findings = sorted(
                    by_cell.get((sheet.name, row_idx, col_idx), []),
                    key=lambda f: f.location.start,
                    reverse=True,
                )
                text = cell
                for f in cell_findings:
                    token = get_or_create_token(session, f.category, f.value)
                    text = _replace_span(text, f.location.start, f.location.end, token)
                sanitized_row[col_idx] = text
            sanitized_rows.append(sanitized_row)
        result.sheets[sheet.name] = sanitized_rows
        preview_parts.append(
            f"# {sheet.name}\n" + "\n".join(", ".join(row) for row in [sheet.columns, *sanitized_rows])
        )

    session.sanitized_table = result
    return "\n\n".join(preview_parts)
