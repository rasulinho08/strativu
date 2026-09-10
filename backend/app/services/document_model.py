"""Internal document representation shared by parsers, DLP, tokenization and export.

Text/DOCX documents are modeled as an ordered list of ``Block``s (paragraph,
heading, or a single table cell). DLP findings for these types reference a
block index plus a local character offset, so sanitizing one block can never
disturb another block's text or the document's block order.

CSV/XLSX documents are modeled as a list of ``Sheet``s holding rows of plain
string cells. Findings reference (sheet, row, col) plus a local offset inside
that cell's string, so sanitizing a cell never shifts any row or column.
"""

from dataclasses import dataclass, field
from typing import Literal

BlockKind = Literal["paragraph", "heading", "table_cell"]


@dataclass
class Block:
    index: int
    kind: BlockKind
    text: str
    heading_level: int | None = None
    table_index: int | None = None
    row_index: int | None = None
    col_index: int | None = None


@dataclass
class Sheet:
    name: str
    columns: list[str]
    rows: list[list[str]]


@dataclass
class ParsedDocument:
    doc_type: Literal["text", "docx", "csv", "xlsx"]
    filename: str | None = None
    blocks: list[Block] = field(default_factory=list)
    sheets: list[Sheet] = field(default_factory=list)

    @property
    def is_tabular(self) -> bool:
        return self.doc_type in ("csv", "xlsx")

    def char_count(self) -> int:
        if self.is_tabular:
            return sum(len(cell) for sheet in self.sheets for row in sheet.rows for cell in row)
        return sum(len(b.text) for b in self.blocks)
