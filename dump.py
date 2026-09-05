import sqlite3
import json

try:
    conn = sqlite3.connect('prisma/dev.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM HealthPackage")
    
    # Get column names
    column_names = [description[0] for description in cursor.description]
    
    packages = []
    for row in cursor.fetchall():
        packages.append(dict(zip(column_names, row)))
        
    with open('packages.json', 'w') as f:
        json.dump(packages, f)
        
    print(f"Dumped {len(packages)} packages to packages.json")
    conn.close()
except Exception as e:
    print(f"Error: {e}")
