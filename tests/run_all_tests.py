import subprocess
import sys
from pathlib import Path


TESTS_DIR = Path(__file__).resolve().parent


def run_script(script_path: Path) -> int:
    print(f'\n=== Running {script_path.name} ===')
    result = subprocess.run([sys.executable, str(script_path)], check=False)
    if result.returncode == 0:
        print(f'PASS: {script_path.name}')
    else:
        print(f'FAIL: {script_path.name} (exit code {result.returncode})')
    return result.returncode


def main() -> int:
    scripts = sorted(TESTS_DIR.glob('test_*.py'))
    if not scripts:
        print('No test scripts found.')
        return 1

    failures = 0
    for script in scripts:
        failures += 1 if run_script(script) != 0 else 0

    print('\n=== Test Summary ===')
    print(f'Total scripts: {len(scripts)}')
    print(f'Failed scripts: {failures}')

    if failures:
        print('Overall result: FAILED')
        return 1

    print('Overall result: PASSED')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
