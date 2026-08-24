const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.lead.create({
      data: {
        enquiryType: "MEMBERSHIP",
        fullName: "Test",
        mobile: "123",
        whatsapp: "123",
        state: "AP",
        district: "WG",
        area: "A",
        pincode: "1",
        membershipType: "Individual",
        status: "New Lead"
      }
    });
    console.log("Success");
  } catch (err) {
    console.error("Prisma Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}
main();
