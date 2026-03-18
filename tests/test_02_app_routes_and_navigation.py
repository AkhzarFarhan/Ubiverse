import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def read_text(relative_path: str) -> str:
    return (ROOT / relative_path).read_text(encoding='utf-8')


class AppRouteNavigationTests(unittest.TestCase):
    def test_modules_array_and_routes_are_consistent(self):
        app_js = read_text('js/app.js')

        module_keys = re.findall(r"\{\s*key:\s*'([a-z]+)'", app_js)
        route_keys = re.findall(r'^\s*([a-z]+):\s*\(\)\s*=>', app_js, flags=re.MULTILINE)

        self.assertGreaterEqual(len(module_keys), 7, 'Expected multiple modules in MODULES array')
        self.assertIn('home', route_keys, 'Home route must exist')
        self.assertEqual(
            sorted(set(module_keys)),
            sorted([k for k in set(route_keys) if k != 'home']),
            'ROUTES keys (excluding home) must match MODULES keys',
        )

    def test_routes_use_expected_global_module_names(self):
        app_js = read_text('js/app.js')
        expected = {
            'daily': 'DailyModule',
            'gym': 'GymModule',
            'texter': 'TexterModule',
            'tasbih': 'TasbihModule',
            'salah': 'SalahModule',
            'ledger': 'LedgerModule',
            'car': 'CarModule',
            'vibex': 'VibexModule',
            'quran': 'QuranModule',
        }
        for route, module_name in expected.items():
            pattern = rf"{route}:\s*\(\)\s*=>\s*window\.{module_name}\.render\(\)"
            self.assertRegex(app_js, pattern, f'Route {route} should call window.{module_name}.render()')

    def test_sidebar_navigation_covers_all_non_home_routes(self):
        app_js = read_text('js/app.js')
        index_html = read_text('index.html')

        route_keys = set(re.findall(r'^\s*([a-z]+):\s*\(\)\s*=>', app_js, flags=re.MULTILINE))
        nav_keys = set(re.findall(r'data-page="([a-z]+)"', index_html))

        expected_nav = route_keys - {'home'}
        self.assertTrue(
            expected_nav.issubset(nav_keys),
            'Sidebar nav should include every route except home',
        )
        self.assertIn('home', nav_keys, 'Sidebar should include home link')

    def test_required_shell_callbacks_exist(self):
        app_js = read_text('js/app.js')
        required_snippets = [
            "document.getElementById('google-signin-btn').addEventListener('click'",
            "document.getElementById('signout-btn').addEventListener('click'",
            'onAuthStateChanged(function (user) {',
            "window.addEventListener('hashchange'",
            'function navigate() {',
            "window.location.hash = 'home';",
        ]
        missing = [snippet for snippet in required_snippets if snippet not in app_js]
        self.assertEqual(missing, [], f'Missing expected auth/router flow snippets: {missing}')


if __name__ == '__main__':
    unittest.main(verbosity=2)
