import argparse
import json
import re
from collections import defaultdict
from copy import deepcopy
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple

try:
    from zoneinfo import ZoneInfo
except Exception:  # pragma: no cover
    ZoneInfo = None


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_INPUT = ROOT / 'assets' / 'texter-for-me-export.json'
DEFAULT_OUTPUT = ROOT / 'assets' / 'ubiverse-firebase-import.json'
DEFAULT_REPORT = ROOT / 'assets' / 'ubiverse-migration-report.json'

if ZoneInfo:
    try:
        KOLKATA = ZoneInfo('Asia/Kolkata')
    except Exception:
        KOLKATA = None
else:
    KOLKATA = None

SUPPORTED_TRANSFORMS = {
    'daily',
    'gym',
    'texter',
    'texter_v2',
    'salah',
    'tasbih',
    'LedgerV2',
    'Ledger',
    'car',
}


class MigrationContext:
    def __init__(self) -> None:
        self.synthetic_counter = 0
        self.key_counter = defaultdict(int)
        self.report = {
            'started_at': datetime.now(timezone.utc).isoformat(),
            'module_stats': defaultdict(lambda: defaultdict(int)),
            'smart_fill': defaultdict(int),
            'skipped': defaultdict(int),
            'passthrough_keys': [],
            'notes': [],
        }

    def inc_module(self, module: str, metric: str, by: int = 1) -> None:
        self.report['module_stats'][module][metric] += by

    def inc_fill(self, field_name: str, by: int = 1) -> None:
        self.report['smart_fill'][field_name] += by

    def inc_skip(self, reason: str, by: int = 1) -> None:
        self.report['skipped'][reason] += by

    def next_synthetic_dt(self) -> datetime:
        self.synthetic_counter += 1
        base = datetime(2020, 1, 1, 0, 0, 0)
        return base + timedelta(seconds=self.synthetic_counter)

    def next_key(self, prefix: str = 'm') -> str:
        self.key_counter[prefix] += 1
        return f'{prefix}_{self.key_counter[prefix]:07d}'


def ensure_dict(x: Any) -> Dict[str, Any]:
    return x if isinstance(x, dict) else {}


def normalize_username(value: Any) -> str:
    if value is None:
        return ''
    user = str(value).strip().lower()
    if user.startswith('@'):
        user = user[1:]
    if '@' in user:
        user = user.split('@', 1)[0]
    user = re.sub(r'[^a-z0-9._-]', '', user)
    return user


def smart_text(value: Any, fallback: str, ctx: MigrationContext, field_key: str) -> str:
    text = '' if value is None else str(value).strip()
    if text:
        return text
    ctx.inc_fill(field_key)
    return fallback


def to_float(value: Any, default: float, ctx: MigrationContext, field_key: str) -> float:
    if value is None or value == '':
        ctx.inc_fill(field_key)
        return float(default)
    try:
        return float(value)
    except Exception:
        ctx.inc_fill(field_key)
        return float(default)


def to_int(value: Any, default: int, ctx: MigrationContext, field_key: str) -> int:
    if value is None or value == '':
        ctx.inc_fill(field_key)
        return int(default)
    try:
        return int(float(value))
    except Exception:
        ctx.inc_fill(field_key)
        return int(default)


def try_parse_datetime(value: Any) -> Optional[datetime]:
    if value is None:
        return None
    s = str(value).strip()
    if not s:
        return None

    s = s.replace('AM', ' AM').replace('PM', ' PM') if re.search(r'\d(AM|PM)$', s) else s
    s = re.sub(r'\s+', ' ', s).strip()

    formats = [
        '%d-%m-%Y %I:%M:%S %p',
        '%d-%m-%Y %I:%M %p',
        '%d-%m-%Y %H:%M:%S',
        '%d-%m-%Y %H:%M',
        '%Y-%m-%d %H:%M:%S',
        '%Y-%m-%d',
        '%d-%m-%Y',
    ]
    for fmt in formats:
        try:
            return datetime.strptime(s, fmt)
        except Exception:
            pass

    m = re.search(r'(\d{1,2}-\d{1,2}-\d{4})\s+(\d{1,2}:\d{2}(?::\d{2})?)\s*([AP]M)?', s, re.IGNORECASE)
    if m:
        date_part = m.group(1)
        time_part = m.group(2)
        ampm = m.group(3)
        candidate = f'{date_part} {time_part} {ampm}'.strip()
        for fmt in ('%d-%m-%Y %I:%M:%S %p', '%d-%m-%Y %I:%M %p', '%d-%m-%Y %H:%M:%S', '%d-%m-%Y %H:%M'):
            try:
                return datetime.strptime(candidate, fmt)
            except Exception:
                pass

    return None


def format_kolkata(dt: datetime) -> str:
    if KOLKATA:
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=KOLKATA)
        else:
            dt = dt.astimezone(KOLKATA)
    return dt.strftime('%d-%m-%Y %I:%M:%S %p')


def smart_timestamp(*candidates: Any, ctx: MigrationContext, field_key: str) -> str:
    for candidate in candidates:
        dt = try_parse_datetime(candidate)
        if dt is not None:
            return format_kolkata(dt)

    ctx.inc_fill(field_key)
    return format_kolkata(ctx.next_synthetic_dt())


def date_from_timestamp(ts: str, ctx: MigrationContext, field_key: str) -> str:
    dt = try_parse_datetime(ts)
    if dt is None:
        ctx.inc_fill(field_key)
        dt = ctx.next_synthetic_dt()
    return dt.strftime('%Y-%m-%d')


def iter_user_records(section: Any) -> Iterable[Tuple[str, str, Dict[str, Any]]]:
    if not isinstance(section, dict):
        return
    for user_key, records in section.items():
        username = normalize_username(user_key)
        if not username:
            continue

        if isinstance(records, dict):
            for rec_key, rec in records.items():
                if isinstance(rec, dict):
                    yield username, str(rec_key), rec
        elif isinstance(records, list):
            for i, rec in enumerate(records):
                if isinstance(rec, dict):
                    yield username, str(i), rec


def put_user_record(target: Dict[str, Any], module_path: str, username: str, rec_key: str, value: Dict[str, Any], ctx: MigrationContext) -> None:
    if module_path not in target or not isinstance(target[module_path], dict):
        target[module_path] = {}
    if username not in target[module_path] or not isinstance(target[module_path][username], dict):
        target[module_path][username] = {}

    key = rec_key.strip() if rec_key else ''
    if not key or key in target[module_path][username]:
        key = ctx.next_key('r')
    target[module_path][username][key] = value


def migrate_daily(source: Dict[str, Any], out: Dict[str, Any], ctx: MigrationContext) -> None:
    for username, rec_key, rec in iter_user_records(source.get('daily')):
        entry = {
            'message': smart_text(rec.get('message'), 'No message', ctx, 'daily.message'),
            'rating': max(1, min(10, to_int(rec.get('rating'), 5, ctx, 'daily.rating'))),
            'timestamp': smart_timestamp(rec.get('timestamp'), rec.get('date'), ctx=ctx, field_key='daily.timestamp'),
        }
        put_user_record(out, 'daily', username, rec_key, entry, ctx)
        ctx.inc_module('daily', 'migrated')


def migrate_gym(source: Dict[str, Any], out: Dict[str, Any], ctx: MigrationContext) -> None:
    for username, rec_key, rec in iter_user_records(source.get('gym')):
        entry = {
            'message': smart_text(rec.get('message'), 'No workout note', ctx, 'gym.message'),
            'timestamp': smart_timestamp(rec.get('timestamp'), rec.get('date'), ctx=ctx, field_key='gym.timestamp'),
        }
        put_user_record(out, 'gym', username, rec_key, entry, ctx)
        ctx.inc_module('gym', 'migrated')


def gather_texter_records(source: Dict[str, Any], ctx: MigrationContext) -> Dict[str, List[Dict[str, Any]]]:
    per_user = defaultdict(list)

    for username, rec_key, rec in iter_user_records(source.get('texter_v2')):
        per_user[username].append({'_key': rec_key, **rec})

    texter_section = ensure_dict(source.get('texter'))
    for maybe_user, records in texter_section.items():
        normalized = normalize_username(maybe_user)
        if normalized and isinstance(records, dict):
            for rec_key, rec in records.items():
                if isinstance(rec, dict):
                    per_user[normalized].append({'_key': str(rec_key), **rec})
            continue

        if isinstance(records, dict):
            record_user = normalize_username(records.get('username') or records.get('email') or maybe_user)
            if not record_user:
                record_user = 'unknown'
                ctx.inc_fill('texter.username')
            per_user[record_user].append({'_key': str(maybe_user), **records})

    root_zero = source.get('0')
    if isinstance(root_zero, dict):
        record_user = normalize_username(root_zero.get('username') or root_zero.get('email')) or 'unknown'
        if record_user == 'unknown':
            ctx.inc_fill('texter.root0.username')
        per_user[record_user].append({'_key': '0', **root_zero})

    return per_user


def migrate_texter(source: Dict[str, Any], out: Dict[str, Any], ctx: MigrationContext) -> None:
    per_user = gather_texter_records(source, ctx)

    for username, records in per_user.items():
        dedup = set()
        for rec in records:
            note = smart_text(rec.get('note') or rec.get('message') or rec.get('text'), 'No note', ctx, 'texter.note')
            ts = smart_timestamp(rec.get('timestamp'), rec.get('date'), ctx=ctx, field_key='texter.timestamp')
            sig = (note.strip().lower(), ts)
            if sig in dedup:
                ctx.inc_skip('texter.duplicate')
                continue
            dedup.add(sig)

            entry = {'note': note, 'timestamp': ts}
            if rec.get('sharedBy'):
                entry['sharedBy'] = str(rec.get('sharedBy')).strip()
            put_user_record(out, 'texter_v2', username, str(rec.get('_key', '')), entry, ctx)
            ctx.inc_module('texter_v2', 'migrated')


def infer_ledger_balances(prev: Dict[str, float], credit: float, debit: float, mode: str) -> Tuple[float, float, float]:
    cash = prev.get('cash', 0.0)
    bank = prev.get('bank', 0.0)
    total = prev.get('total', cash + bank)
    amount = credit if credit > 0 else debit

    if mode == 'CashToBank':
        cash -= amount
        bank += amount
    elif mode == 'BankToCash':
        cash += amount
        bank -= amount
    elif mode == 'Cash':
        if credit > 0:
            cash += credit
            total += credit
        else:
            cash -= debit
            total -= debit
    else:
        if credit > 0:
            bank += credit
            total += credit
        else:
            bank -= debit
            total -= debit

    return round(cash, 2), round(bank, 2), round(total, 2)


def migrate_ledger(source: Dict[str, Any], out: Dict[str, Any], ctx: MigrationContext) -> None:
    pool = defaultdict(list)

    for username, rec_key, rec in iter_user_records(source.get('LedgerV2')):
        pool[username].append((rec_key, rec, 'LedgerV2'))

    for username, rec_key, rec in iter_user_records(source.get('Ledger')):
        pool[username].append((rec_key, rec, 'Ledger'))

    for username, records in pool.items():
        enriched = []
        for i, (rec_key, rec, _) in enumerate(records):
            ts = smart_timestamp(rec.get('timestamp'), rec.get('date'), ctx=ctx, field_key='ledger.timestamp')
            dt = try_parse_datetime(ts) or ctx.next_synthetic_dt()
            enriched.append((dt, i, rec_key, rec))

        enriched.sort(key=lambda x: (x[0], x[1]))

        prev = {'cash': 0.0, 'bank': 0.0, 'total': 0.0}
        tx_id = 0
        for _, _, rec_key, rec in enriched:
            tx_id += 1
            credit = max(0.0, to_float(rec.get('credit'), 0.0, ctx, 'ledger.credit'))
            debit = max(0.0, to_float(rec.get('debit'), 0.0, ctx, 'ledger.debit'))
            mode = smart_text(rec.get('mode'), 'Cash', ctx, 'ledger.mode')
            details = smart_text(rec.get('details') or rec.get('message'), 'No details', ctx, 'ledger.details')

            raw_cash = rec.get('cash', rec.get('cash_balance'))
            raw_bank = rec.get('bank', rec.get('bank_balance'))
            raw_total = rec.get('total', rec.get('total_balance'))

            have_cash = raw_cash not in (None, '')
            have_bank = raw_bank not in (None, '')
            have_total = raw_total not in (None, '')

            if have_cash and have_bank:
                cash = to_float(raw_cash, prev['cash'], ctx, 'ledger.cash')
                bank = to_float(raw_bank, prev['bank'], ctx, 'ledger.bank')
                if have_total:
                    total = to_float(raw_total, cash + bank, ctx, 'ledger.total')
                else:
                    total = round(cash + bank, 2)
                    ctx.inc_fill('ledger.total_from_cash_bank')
            elif have_total and have_cash:
                cash = to_float(raw_cash, prev['cash'], ctx, 'ledger.cash')
                total = to_float(raw_total, cash + prev['bank'], ctx, 'ledger.total')
                bank = round(total - cash, 2)
                ctx.inc_fill('ledger.bank_from_total_cash')
            elif have_total and have_bank:
                bank = to_float(raw_bank, prev['bank'], ctx, 'ledger.bank')
                total = to_float(raw_total, prev['cash'] + bank, ctx, 'ledger.total')
                cash = round(total - bank, 2)
                ctx.inc_fill('ledger.cash_from_total_bank')
            else:
                cash, bank, total = infer_ledger_balances(prev, credit, debit, mode)
                ctx.inc_fill('ledger.balances_inferred')

            timestamp = smart_timestamp(rec.get('timestamp'), rec.get('date'), ctx=ctx, field_key='ledger.timestamp')

            entry = {
                'transaction_id': tx_id,
                'credit': round(credit, 2),
                'debit': round(debit, 2),
                'mode': mode,
                'details': details,
                'cash': round(cash, 2),
                'bank': round(bank, 2),
                'total': round(total, 2),
                'timestamp': timestamp,
            }
            put_user_record(out, 'LedgerV2', username, rec_key, entry, ctx)
            prev = {'cash': entry['cash'], 'bank': entry['bank'], 'total': entry['total']}
            ctx.inc_module('LedgerV2', 'migrated')


def infer_car_entry_type(record: Dict[str, Any]) -> str:
    if record.get('serviceCost', 0) > 0 or str(record.get('serviceDetails', '')).strip():
        return 'service'
    if record.get('fuelVolume', 0) > 0:
        return 'fuel'
    return 'note'


def migrate_car(source: Dict[str, Any], out: Dict[str, Any], ctx: MigrationContext) -> None:
    grouped = defaultdict(list)
    for username, rec_key, rec in iter_user_records(source.get('car')):
        grouped[username].append((rec_key, rec))

    for username, records in grouped.items():
        prev_odometer = None
        entry_id = 0
        for rec_key, rec in records:
            entry_id += 1
            odometer = to_float(rec.get('odometer'), 0.0, ctx, 'car.odometer')
            fuel_volume = max(0.0, to_float(rec.get('fuelVolume'), 0.0, ctx, 'car.fuelVolume'))
            service_cost = max(0.0, to_float(rec.get('serviceCost'), 0.0, ctx, 'car.serviceCost'))
            total_cost = max(0.0, to_float(rec.get('totalCost'), 0.0, ctx, 'car.totalCost'))
            price_per_unit = to_float(rec.get('pricePerUnit', rec.get('fuelPricePerUnit')), 0.0, ctx, 'car.pricePerUnit')

            if price_per_unit <= 0 and fuel_volume > 0 and total_cost > 0:
                price_per_unit = round(total_cost / fuel_volume, 2)
                ctx.inc_fill('car.pricePerUnit_from_total_fuel')

            if total_cost <= 0 and fuel_volume > 0 and price_per_unit > 0:
                total_cost = round(fuel_volume * price_per_unit, 2)
                ctx.inc_fill('car.totalCost_from_rate_fuel')

            distance = to_float(rec.get('distanceTraveled'), 0.0, ctx, 'car.distanceTraveled')
            if distance <= 0 and prev_odometer is not None and odometer >= prev_odometer:
                distance = round(odometer - prev_odometer, 2)
                ctx.inc_fill('car.distance_from_odometer')

            mileage = to_float(rec.get('mileage'), 0.0, ctx, 'car.mileage')
            if mileage <= 0 and distance > 0 and fuel_volume > 0:
                mileage = round(distance / fuel_volume, 2)
                ctx.inc_fill('car.mileage_from_distance_fuel')

            ts = smart_timestamp(rec.get('timestamp'), rec.get('date'), ctx=ctx, field_key='car.timestamp')
            date_val = str(rec.get('date') or '').strip() or date_from_timestamp(ts, ctx, 'car.date')

            entry = {
                'entry_id': to_int(rec.get('entry_id'), entry_id, ctx, 'car.entry_id'),
                'date': date_val,
                'odometer': round(odometer, 2),
                'distanceTraveled': round(max(0.0, distance), 2),
                'fuelVolume': round(fuel_volume, 3),
                'totalCost': round(total_cost, 2),
                'pricePerUnit': round(max(0.0, price_per_unit), 2),
                'fullTank': bool(rec.get('fullTank', False)),
                'station': smart_text(rec.get('station'), 'N/A', ctx, 'car.station'),
                'serviceCost': round(service_cost, 2),
                'serviceDetails': smart_text(rec.get('serviceDetails'), '', ctx, 'car.serviceDetails'),
                'drivingMode': smart_text(rec.get('drivingMode'), 'Normal', ctx, 'car.drivingMode'),
                'notes': smart_text(rec.get('notes'), '', ctx, 'car.notes'),
                'mileage': round(max(0.0, mileage), 2),
                'entryType': smart_text(rec.get('entryType'), '', ctx, 'car.entryType') or '',
                'timestamp': ts,
            }
            if not entry['entryType']:
                entry['entryType'] = infer_car_entry_type(entry)
                ctx.inc_fill('car.entryType_inferred')

            put_user_record(out, 'car', username, rec_key, entry, ctx)
            prev_odometer = odometer
            ctx.inc_module('car', 'migrated')


def parse_salah_message(message: Any, note_fallback: str, ctx: MigrationContext) -> Tuple[List[int], str]:
    if isinstance(message, list):
        prayers_raw = list(message[:5])
        while len(prayers_raw) < 5:
            prayers_raw.append(0)
            ctx.inc_fill('salah.prayers.pad')
        prayers = [max(0, min(1, to_int(v, 0, ctx, 'salah.prayers.value'))) for v in prayers_raw[:5]]
        note = ''
        if len(message) > 5 and message[5] is not None:
            note = str(message[5]).strip()
        if not note:
            note = note_fallback
        if not note:
            note = 'No note'
            ctx.inc_fill('salah.note')
        return prayers, note

    if isinstance(message, str):
        prayers = [0, 0, 0, 0, 0]
        note = message.strip() or note_fallback or 'No note'
        if note == 'No note':
            ctx.inc_fill('salah.note')
        ctx.inc_fill('salah.prayers.from_string')
        return prayers, note

    prayers = [0, 0, 0, 0, 0]
    note = note_fallback or 'No note'
    if note == 'No note':
        ctx.inc_fill('salah.note')
    ctx.inc_fill('salah.prayers.default')
    return prayers, note


def migrate_salah(source: Dict[str, Any], out: Dict[str, Any], ctx: MigrationContext) -> None:
    section = ensure_dict(source.get('salah'))
    for user_key, data in section.items():
        username = normalize_username(user_key)
        if not username:
            continue

        if isinstance(data, dict) and 'message' in data and all(not isinstance(v, dict) for v in data.values()):
            data = {'root': data}

        if isinstance(data, dict):
            items = data.items()
        elif isinstance(data, list):
            items = [(str(i), x) for i, x in enumerate(data)]
        else:
            items = []

        for rec_key, rec in items:
            if not isinstance(rec, dict):
                continue
            prayers, note = parse_salah_message(rec.get('message'), str(rec.get('note') or '').strip(), ctx)
            timestamp = smart_timestamp(rec.get('timestamp'), rec.get('date'), note, rec.get('message'), ctx=ctx, field_key='salah.timestamp')
            date_val = str(rec.get('date') or '').strip()
            if not re.fullmatch(r'\d{4}-\d{2}-\d{2}', date_val):
                date_val = date_from_timestamp(timestamp, ctx, 'salah.date')

            entry = {
                'prayers': prayers,
                'note': note,
                'timestamp': timestamp,
                'date': date_val,
            }
            put_user_record(out, 'salah', username, str(rec_key), entry, ctx)
            ctx.inc_module('salah', 'migrated')


def migrate_tasbih(source: Dict[str, Any], out: Dict[str, Any], ctx: MigrationContext) -> None:
    section = ensure_dict(source.get('tasbih'))
    out.setdefault('tasbih', {})

    for user_key, state in section.items():
        username = normalize_username(user_key)
        if not username or not isinstance(state, dict):
            continue

        default_flag = to_int(state.get('default'), 0, ctx, 'tasbih.default')
        subhan = max(0, to_int(state.get('SUBHANALLAH'), 0, ctx, 'tasbih.SUBHANALLAH'))
        alhamd = max(0, to_int(state.get('ALHAMDULLIAH'), 0, ctx, 'tasbih.ALHAMDULLIAH'))
        akbar = max(0, to_int(state.get('ALLAHUAKBAR'), 0, ctx, 'tasbih.ALLAHUAKBAR'))
        count = max(0, to_int(state.get('count'), subhan + alhamd + akbar, ctx, 'tasbih.count'))
        target = max(1, to_int(state.get('count_end'), 100, ctx, 'tasbih.count_end'))

        if default_flag == 1:
            mode = 'standard'
            target = 100
            count = subhan + alhamd + akbar
            if count <= 0:
                count = max(0, to_int(state.get('count'), 0, ctx, 'tasbih.count.standard_fallback'))
        else:
            mode = 'custom'

        out['tasbih'].setdefault(username, {})
        out['tasbih'][username]['last'] = {
            'count': count,
            'target': target,
            'mode': mode,
            'timestamp': smart_timestamp(state.get('timestamp'), state.get('date'), ctx=ctx, field_key='tasbih.timestamp'),
        }
        ctx.inc_module('tasbih', 'migrated')


def finalize_report(ctx: MigrationContext, output_path: Path, report_path: Path, args: argparse.Namespace) -> Dict[str, Any]:
    report = {
        'started_at': ctx.report['started_at'],
        'finished_at': datetime.now(timezone.utc).isoformat(),
        'input_file': str(args.input),
        'output_file': str(output_path),
        'report_file': str(report_path),
        'module_stats': {k: dict(v) for k, v in ctx.report['module_stats'].items()},
        'smart_fill': dict(ctx.report['smart_fill']),
        'skipped': dict(ctx.report['skipped']),
        'passthrough_keys': sorted(ctx.report['passthrough_keys']),
        'notes': list(ctx.report['notes']),
    }
    return report


def migrate(source: Dict[str, Any], ctx: MigrationContext) -> Dict[str, Any]:
    out: Dict[str, Any] = {}

    # Transform modules to Ubiverse-ready shapes.
    migrate_daily(source, out, ctx)
    migrate_gym(source, out, ctx)
    migrate_texter(source, out, ctx)
    migrate_ledger(source, out, ctx)
    migrate_car(source, out, ctx)
    migrate_salah(source, out, ctx)
    migrate_tasbih(source, out, ctx)

    # Preserve all non-transformed keys as passthrough to keep full DB coverage.
    for key, value in source.items():
        if key in SUPPORTED_TRANSFORMS:
            continue
        out[key] = deepcopy(value)
        ctx.report['passthrough_keys'].append(key)

    # Keep private-chat as-is (requested), no conversion to vibex.
    if 'private-chat' in source:
        ctx.inc_skip('private-chat.vibex_conversion_skipped')
    if 'private-chat-key' in source:
        ctx.inc_skip('private-chat-key.vibex_conversion_skipped')

    return out


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description='Migrate legacy Firebase export to Ubiverse-compatible JSON.')
    parser.add_argument('--input', type=Path, default=DEFAULT_INPUT, help='Input export JSON file')
    parser.add_argument('--output', type=Path, default=DEFAULT_OUTPUT, help='Output migrated JSON file')
    parser.add_argument('--report', type=Path, default=DEFAULT_REPORT, help='Output migration report JSON file')
    parser.add_argument('--dry-run', action='store_true', help='Run migration without writing output files')
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    input_path = args.input
    output_path = args.output
    report_path = args.report

    if not input_path.exists():
        raise FileNotFoundError(f'Input file not found: {input_path}')

    ctx = MigrationContext()

    with input_path.open('r', encoding='utf-8') as f:
        source = json.load(f)

    if not isinstance(source, dict):
        raise ValueError('Input JSON root must be an object/dict for Firebase import compatibility.')

    migrated = migrate(source, ctx)
    report = finalize_report(ctx, output_path, report_path, args)

    if args.dry_run:
        print('Dry run complete.')
        print(json.dumps({
            'top_level_keys_in': len(source.keys()),
            'top_level_keys_out': len(migrated.keys()),
            'module_stats': report['module_stats'],
            'smart_fill': report['smart_fill'],
            'skipped': report['skipped'],
        }, indent=2))
        return 0

    output_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.parent.mkdir(parents=True, exist_ok=True)

    with output_path.open('w', encoding='utf-8') as f:
        json.dump(migrated, f, ensure_ascii=False, indent=2)

    with report_path.open('w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    print(f'Migration complete. Output: {output_path}')
    print(f'Migration report: {report_path}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
