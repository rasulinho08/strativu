from app.services.dlp.detectors import default_detectors
from app.services.dlp.engine import scan_document
from app.services.parsers.text_parser import parse_text


def _categories(text: str) -> set[str]:
    document = parse_text(None, text)
    findings = scan_document(document)
    return {f.category for f in findings}


def test_detects_email():
    assert "EMAIL" in _categories("Contact me at aydin@example.com for details.")


def test_detects_phone():
    assert "PHONE" in _categories("Call the office at +994 55 123 45 67 for support.")


def test_detects_person_heuristic():
    assert "PERSON" in _categories("The contract was signed by Aydin Huseynov last week.")


def test_detects_finance_amount():
    assert "FINANCE" in _categories("His monthly salary is 5,000 AZN starting in June.")


def test_detects_credit_card_with_luhn_check():
    # 4111111111111111 is a well-known Luhn-valid test Visa number.
    assert "CREDIT_CARD" in _categories("Card on file: 4111 1111 1111 1111.")


def test_rejects_invalid_credit_card_number():
    assert "CREDIT_CARD" not in _categories("Reference number: 1234 5678 9012 3456.")


def test_detects_id_number():
    assert "ID_NUMBER" in _categories("Passport number 1234567890 was provided.")


def test_no_false_positive_on_plain_sentence():
    categories = _categories("The quarterly report is ready for review.")
    assert categories == set()


def test_detectors_registry_is_non_empty():
    assert len(default_detectors()) > 0
