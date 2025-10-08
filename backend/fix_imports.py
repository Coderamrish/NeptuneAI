import os
files_to_fix = {
    'rag_pipeline.py': [
        ('from backend.query_engine import', 'from backend.query_engine import')
    ],
    'ingest_data.py': [
        ('from query_engine import', 'from query_engine import') 
    ]
}
for filename, replacements in files_to_fix.items():
    filepath = os.path.join(os.path.dirname(__file__), filename)
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            content = f.read()      
        for old, new in replacements:
            content = content.replace(old, new) 
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed {filename}")
print("Done!")