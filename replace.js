const fs = require('fs');
const filePath = 'src/app/admin/(dashboard)/free-consultations/FreeConsultationsClient.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const target = `<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {viewingRequest.reportUrl.split(',').map((url: string, idx: number) => (
                            <a key={idx} href={url.trim()} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#2563eb', textDecoration: 'none', fontSize: '14px', fontWeight: 600, width: 'fit-content' }}>
                              📄 View Attachment {idx + 1}
                            </a>
                          ))}
                        </div>`;

const targetRegex = /<div style=\{\{ display: 'flex', flexDirection: 'column', gap: '8px' \}\}>[\s\S]*?<\/div>/;

const replacement = `<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
                          {viewingRequest.reportUrl.split(',').map((url: string, idx: number) => (
                            <a key={idx} href={url.trim()} target="_blank" rel="noopener noreferrer" style={{ display: 'block', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', background: '#ffffff', transition: 'transform 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                              <img src={url.trim()} alt={\`Attachment \${idx + 1}\`} style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }} onError={(e) => { e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg'; e.currentTarget.style.objectFit = 'contain'; e.currentTarget.style.padding = '20px'; }} />
                            </a>
                          ))}
                        </div>`;

if (content.match(targetRegex)) {
  content = content.replace(targetRegex, replacement);
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log("Replaced via regex successfully.");
} else if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log("Replaced via exact match successfully.");
} else {
  console.error("Target not found!");
}
