const nodemailer = require('nodemailer');

async function main() {
  try {
    console.log("Creating test account...");
    const testAccount = await nodemailer.createTestAccount();
    console.log("Success:", testAccount);
  } catch (e) {
    console.error("Error creating test account:", e.message);
  }
}
main();
