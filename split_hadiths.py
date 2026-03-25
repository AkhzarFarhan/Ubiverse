import sqlite3, json, os

db_path = '/mnt/c/GitHub/Ubiverse/assets/hadiths_db.db'
export_dir = '/mnt/c/GitHub/Ubiverse/assets/hadith'

os.makedirs(export_dir, exist_ok=True)

conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

# Get all hadiths
cursor.execute('SELECT category_order, category, id_goto, hadith_no, hadith_text FROM hadiths ORDER BY CAST(category_order AS INTEGER), CAST(id_goto AS INTEGER);')
rows = [dict(row) for row in cursor.fetchall()]

categories = {}
for row in rows:
    cat_id = row['category_order']
    if cat_id not in categories:
        categories[cat_id] = {'id': cat_id, 'name': row['category'], 'hadiths': []}
    categories[cat_id]['hadiths'].append({
        'id': row['id_goto'], 
        'no': row['hadith_no'], 
        'text': row['hadith_text']
    })

# Write index file (just categories)
index_data = [{'id': k, 'name': v['name'], 'count': len(v['hadiths'])} for k, v in categories.items()]
with open(os.path.join(export_dir, 'index.json'), 'w', encoding='utf-8') as f:
    json.dump(index_data, f, ensure_ascii=False, separators=(',', ':'))

# Write individual category files
for cat_id, data in categories.items():
    with open(os.path.join(export_dir, f'cat_{cat_id}.json'), 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, separators=(',', ':'))

print("Done! Categories:", len(categories))
