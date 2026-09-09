import PyPDF2
import re
import json

pdf_path = r"C:\Users\91767\Downloads\Benva Telangana BluePrint (1).pdf"

with open(pdf_path, 'rb') as file:
    reader = PyPDF2.PdfReader(file)
    all_text = ""
    for page in reader.pages:
        all_text += page.extract_text() + "\n"

# The text might be somewhat scrambled depending on how PyPDF2 extracts it.
# Let's save it to a raw text file so we can inspect it or parse it directly.
with open("raw_pdf_text.txt", "w", encoding="utf-8") as out:
    out.write(all_text)

lines = all_text.split('\n')
records = []
pattern = re.compile(r"^(\d+)\s*(.+?)\s+(\d{6})\s+(PO|BO|HO)\s+(.+?Circle)\s+(.+?Region)\s*(.+?Division)\s*(Urban|Rural)$", re.IGNORECASE)

seen = set()
for line in lines:
    line = line.strip()
    match = pattern.match(line)
    if match:
        s_no = int(match.group(1))
        if s_no in seen:
            continue
        seen.add(s_no)
        records.append({
            "sNo": s_no,
            "officeName": match.group(2).strip(),
            "pincode": match.group(3).strip(),
            "type": match.group(4).strip().upper(),
            "circle": match.group(5).strip(),
            "region": match.group(6).strip(),
            "division": match.group(7).strip(),
            "area": match.group(8).strip(),
            "state": "Telangana"
        })

print(f"Matched {len(records)} records directly with regex.")

with open("records.json", "w", encoding="utf-8") as out:
    json.dump(records, out, indent=2)
