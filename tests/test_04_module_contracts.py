import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

MODULE_FILES = {
    'js/daily.js': 'DailyModule',
    'js/gym.js': 'GymModule',
    'js/texter.js': 'TexterModule',
    'js/tasbih.js': 'TasbihModule',
    'js/salah.js': 'SalahModule',
    'js/ledger.js': 'LedgerModule',
    'js/car.js': 'CarModule',
    'js/vibex.js': 'VibexModule',
    'js/quran.js': 'QuranModule',
}


def read_text(relative_path: str) -> str:
    return (ROOT / relative_path).read_text(encoding='utf-8')


class ModuleContractTests(unittest.TestCase):
    def test_each_module_exposes_global_iife(self):
        for file_path, module_name in MODULE_FILES.items():
            content = read_text(file_path)
            signature = f'window.{module_name} = (function ()'
            self.assertIn(signature, content, f'{file_path} should define {module_name} IIFE')

    def test_each_module_has_render_and_exports_it(self):
        for file_path in MODULE_FILES:
            content = read_text(file_path)
            self.assertIn('function render(', content, f'{file_path} should define render()')
            self.assertTrue(
                'return { render' in content or 'return { render:' in content,
                f'{file_path} should export render',
            )

    def test_data_modules_have_firebase_and_local_cache_paths(self):
        modules_with_read_fallback = [
            'js/daily.js',
            'js/gym.js',
            'js/texter.js',
            'js/salah.js',
            'js/ledger.js',
            'js/car.js',
            'js/quran.js',
        ]
        for file_path in modules_with_read_fallback:
            content = read_text(file_path)
            self.assertIn('firebaseGet(FIREBASE_PATH()', content, f'{file_path} should read from Firebase')
            self.assertIn('localStorage.getItem(', content, f'{file_path} should support localStorage fallback')

    def test_write_capable_modules_use_firebase_post_or_put(self):
        write_modules = [
            'js/daily.js',
            'js/gym.js',
            'js/texter.js',
            'js/salah.js',
            'js/ledger.js',
            'js/car.js',
            'js/tasbih.js',
            'js/quran.js',
            'js/vibex.js',
        ]
        for file_path in write_modules:
            content = read_text(file_path)
            has_write = (
                'firebasePost(' in content
                or 'firebasePut(' in content
                or '.ref().update(' in content
            )
            self.assertTrue(has_write, f'{file_path} should include Firebase write path')

    def test_ledger_invokes_telegram_notification(self):
        ledger_js = read_text('js/ledger.js')
        self.assertIn('sendTelegramForLedger(entry, window.AppState.username);', ledger_js)


if __name__ == '__main__':
    unittest.main(verbosity=2)
