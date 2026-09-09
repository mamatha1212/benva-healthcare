import fs from 'fs';
import pdf from 'pdf-parse';

async function testPdf() {
  const dataBuffer = fs.readFileSync('C:\\Users\\91767\\Downloads\\Benva Telangana BluePrint (1).pdf');
  const data = await pdf(dataBuffer);
  
  console.log("Total Pages:", data.numpages);
  console.log("Sample Text (first 1000 chars):");
  console.log(data.text.substring(0, 1000));
}

testPdf().catch(console.error);
