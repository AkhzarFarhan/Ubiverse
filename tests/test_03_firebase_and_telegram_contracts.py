import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FIREBASE_JS = (ROOT / 'js/firebase.js').read_text(encoding='utf-8')


def function_block(name: str, next_name: str | None = None) -> str:
    start_marker = f'async function {name}('
    start = FIREBASE_JS.find(start_marker)
    if start == -1:
        return ''
    if next_name:
        end_marker = f'async function {next_name}('
        end = FIREBASE_JS.find(end_marker, start + len(start_marker))
        return FIREBASE_JS[start:end if end != -1 else None]
    return FIREBASE_JS[start:]


class FirebaseTelegramContractTests(unittest.TestCase):
    def test_crud_helpers_have_try_catch_and_rethrow(self):
        sequence = [
            ('firebaseGet', 'firebasePost', 'Firebase read error:'),
            ('firebasePost', 'firebasePut', 'Firebase write error:'),
            ('firebasePut', 'firebasePatch', 'Firebase write error:'),
            ('firebasePatch', 'firebaseDelete', 'Firebase update error:'),
            ('firebaseDelete', 'firebaseSignInWithGoogle', 'Firebase delete error:'),
        ]
        for current, next_fn, toast_text in sequence:
            block = function_block(current, next_fn)
            self.assertTrue(block, f'Could not find function {current}')
            self.assertIn('try {', block, f'{current} should wrap call in try/catch')
            self.assertIn('} catch (e) {', block, f'{current} should catch exceptions')
            self.assertIn('window.showToast', block, f'{current} should show toast on failure')
            self.assertIn(toast_text, block, f'{current} should expose a specific error message')
            self.assertIn('throw e;', block, f'{current} should rethrow for caller fallback handling')

    def test_telegram_guards_and_html_parse_mode(self):
        block = function_block('sendTelegramForLedger', None)
        self.assertTrue(block, 'sendTelegramForLedger function should exist')
        self.assertIn('if (TG_USERNAME && username !== TG_USERNAME) return;', block)
        self.assertIn('if (!TG_BOT_TOKEN || !TG_LEDGER_CHAT_ID) return;', block)
        self.assertIn("parse_mode: 'HTML'", block)
        self.assertNotIn("parse_mode: 'Markdown'", block)
        self.assertIn('if (!res.ok) {', block)
        self.assertIn('const errText = await res.text();', block)

    def test_telegram_reports_failures_to_ui(self):
        block = function_block('sendTelegramForLedger', None)
        self.assertIn("window.showToast('Telegram API error', 'error')", block)
        self.assertIn("window.showToast('Telegram dispatch failed:", block)
        self.assertIn('console.warn(\'Telegram API error:\'', block)
        self.assertIn('console.warn(\'Telegram notification failed:\'', block)


if __name__ == '__main__':
    unittest.main(verbosity=2)
