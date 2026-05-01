try:
    from googletrans import Translator
    _Translator = Translator
except Exception:
    _Translator = None

_translator_instance = None

def translate_text(text: str, lang: str) -> str:
    global _translator_instance

    if _Translator is None:
        return "Translator module not available. Install: pip install googletrans==4.0.0rc1"

    if _translator_instance is None:
        try:
            _translator_instance = _Translator()
        except Exception as e:
            return f"Translator init failed: {e}"

    try:
        result = _translator_instance.translate(text, dest=lang)
        return result.text
    except Exception as e:
        return f"Translation failed: {e}"
