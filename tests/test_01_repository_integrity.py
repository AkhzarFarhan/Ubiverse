import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def read_text(relative_path: str) -> str:
    return (ROOT / relative_path).read_text(encoding='utf-8')


class RepositoryIntegrityTests(unittest.TestCase):
    def test_required_project_files_exist(self):
        required_files = [
            'index.html',
            'css/style.css',
            'js/app.js',
            'js/firebase.js',
            'js/utils.js',
            'js/daily.js',
            'js/gym.js',
            'js/texter.js',
            'js/tasbih.js',
            'js/salah.js',
            'js/ledger.js',
            'js/car.js',
            'js/vibex.js',
            'js/quran.js',
            'js/env.js.example',
            'Makefile',
            'database.rules.json',
        ]
        missing = [path for path in required_files if not (ROOT / path).exists()]
        self.assertEqual(missing, [], f'Missing required files: {missing}')

    def test_no_conflict_markers_in_source_files(self):
        patterns = ('*.js', '*.html', '*.css', '*.md', 'Makefile')
        files = []
        for pattern in patterns:
            files.extend(ROOT.rglob(pattern))

        offending = []
        for file_path in files:
            text = file_path.read_text(encoding='utf-8')
            has_conflict_markers = bool(
                re.search(r'^<<<<<<<\s', text, flags=re.MULTILINE)
                or re.search(r'^=======$', text, flags=re.MULTILINE)
                or re.search(r'^>>>>>>>\s', text, flags=re.MULTILINE)
            )
            if has_conflict_markers:
                offending.append(str(file_path.relative_to(ROOT)).replace('\\', '/'))

        self.assertEqual(offending, [], f'Conflict markers detected in: {offending}')

    def test_index_has_critical_dom_containers(self):
        index_html = read_text('index.html')
        required_ids = [
            'login-screen',
            'login-alert',
            'google-signin-btn',
            'layout',
            'header-user',
            'signout-btn',
            'sidebar',
            'sidebar-overlay',
            'app',
        ]
        missing = [id_name for id_name in required_ids if f'id="{id_name}"' not in index_html]
        self.assertEqual(missing, [], f'Missing critical DOM ids in index.html: {missing}')

    def test_script_load_order_is_stable(self):
        index_html = read_text('index.html')
        script_srcs = re.findall(r'<script\s+src="([^"]+)"', index_html)
        expected_sequence = [
            'js/env.js',
            'js/firebase.js',
            'js/utils.js',
            'js/daily.js',
            'js/gym.js',
            'js/texter.js',
            'js/tasbih.js',
            'js/salah.js',
            'js/ledger.js',
            'js/car.js',
            'js/vibex.js',
            'js/quran.js',
            'js/app.js',
        ]

        missing = [src for src in expected_sequence if src not in script_srcs]
        self.assertEqual(missing, [], f'Missing script tags in index.html: {missing}')

        positions = [script_srcs.index(src) for src in expected_sequence]
        self.assertEqual(
            positions,
            sorted(positions),
            f'Unexpected script order for app boot chain: {expected_sequence}',
        )


if __name__ == '__main__':
    unittest.main(verbosity=2)
