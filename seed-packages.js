const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  console.log("Clearing old packages...");
  await prisma.healthPackage.deleteMany({});
  
  console.log("Seeding 6 health packages based on new Figma screenshots...");

  const packages = [
    {
      title: "Basic Health Checkup",
      subtitle: "Essential health screening with complete blood work!",
      price: "1299",
      originalPrice: "2495",
      discount: "48% OFF",
      theme: "themePink",
      image: "/images/packages/blood_test.png",
      layout: "right",
      isPopular: true,
      slug: "basic-health-checkup-1"
    },
    {
      title: "Suraksha Full Body Health Check Up",
      subtitle: "Comprehensive full body health checkup - save 65%!",
      price: "2500",
      originalPrice: "7200",
      discount: "65% OFF",
      theme: "themeGreen",
      image: "/images/packages/blood_pressure.png",
      layout: "left",
      isPopular: false,
      slug: "suraksha-full-body"
    },
    {
      title: "Basic Health Checkup",
      subtitle: "Complete fever screening tests - get 26% off!",
      price: "2000",
      originalPrice: "2700",
      discount: "26% OFF",
      theme: "themeYellow",
      image: "/images/packages/fever_woman.png",
      layout: "right",
      isPopular: false,
      slug: "basic-health-checkup-2"
    },
    {
      title: "Cardiac Profile Basic",
      subtitle: "Essential heart health tests - save 44% today!",
      price: "2000",
      originalPrice: "3600",
      discount: "44% OFF",
      theme: "themeSkyBlue",
      image: "/images/packages/heart_pain.png",
      layout: "left",
      isPopular: false,
      slug: "cardiac-profile-basic-1"
    },
    {
      title: "Routine Cardiac Risk Assessment",
      subtitle: "Advanced cardiac risk evaluation - 49% discount!",
      price: "3500",
      originalPrice: "6875",
      discount: "49% OFF",
      theme: "themePurple",
      image: "/images/packages/blood_test.png",
      layout: "right",
      isPopular: false,
      slug: "routine-cardiac-risk"
    },
    {
      title: "Cardiac Profile Basic",
      subtitle: "Complete cardiac screening - save 46% today!",
      price: "2500",
      originalPrice: "4600",
      discount: "46% OFF",
      theme: "themeOrange",
      image: "/images/packages/blood_pressure.png",
      layout: "left",
      isPopular: false,
      slug: "cardiac-profile-basic-2"
    }
  ];

  for (const pkg of packages) {
    await prisma.healthPackage.create({
      data: pkg,
    });
    console.log(`Added: ${pkg.title}`);
  }
  console.log("Seeding complete!");
}

seed()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
