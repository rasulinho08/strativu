from app.services.rehydration.integrity import validate


def test_exact_token_is_marked_rehydratable():
    result = validate({"[PERSON_1]"}, "The report mentions [PERSON_1] directly.")
    assert "[PERSON_1]" in result.rehydratable_tokens
    assert result.warnings == []


def test_punctuation_only_difference_is_safely_auto_corrected():
    # "[PERSON 1]" differs from "[PERSON_1]" only by a space/underscore swap:
    # same category, same index. This is the one class of "controlled
    # normalization" the system is allowed to apply automatically.
    result = validate({"[PERSON_1]"}, "The report mentions [PERSON 1] directly.")
    assert result.normalized_replacements["[PERSON 1]"] == "[PERSON_1]"
    assert any("auto-corrected" in w.lower() for w in result.warnings)


def test_content_altered_token_is_blocked_not_guessed():
    # Different letters entirely (not just punctuation) must never be
    # fuzzy-matched to an expected token — this is the security boundary.
    result = validate({"[PERSON_1]"}, "The report mentions PERSONX 1 directly.")
    assert "[PERSON_1]" not in result.rehydratable_tokens
    assert not result.normalized_replacements
    assert any("⚠" in w and "review is required" in w.lower() for w in result.warnings)


def test_unknown_token_triggers_warning():
    result = validate({"[PERSON_1]"}, "The report mentions [PERSON_2] who was never sent.")
    assert "[PERSON_2]" not in result.rehydratable_tokens
    assert any("PERSON_2" in w for w in result.warnings)


def test_bracket_free_but_otherwise_exact_token_is_auto_corrected():
    # Missing brackets only (same category, same index) is still a pure
    # formatting difference and gets the same safe, controlled correction.
    result = validate({"[FINANCE_1]"}, "Salary is FINANCE_1 per month.")
    assert result.normalized_replacements["FINANCE_1"] == "[FINANCE_1]"
    assert any("auto-corrected" in w.lower() for w in result.warnings)


def test_no_tokens_in_response_yields_no_warnings():
    result = validate({"[PERSON_1]"}, "This response has no placeholders at all.")
    assert result.warnings == []
    assert result.rehydratable_tokens == set()


def test_normalization_never_crosses_category_boundary():
    # Even though the shape "[FOO_1]" matches the near-token regex, it must
    # not be treated as a match for an unrelated expected token.
    result = validate({"[PERSON_1]"}, "[FINANCE_1] appears here.")
    assert "[PERSON_1]" not in result.rehydratable_tokens
    assert any("warning" in w.lower() for w in result.warnings)
