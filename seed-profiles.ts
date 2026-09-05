import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const profilesToSeed = [
  {
    name: 'COMPLETE BLOOD COUNT CBC(22)',
    parameters: [
      'Haemoglobin (HB)', 'Total Leucocyte Count (TLC)', 'Neutrophils', 'Lymphocytes',
      'Monocytes', 'Eosinophils', 'Basophils', 'Absolute Neutrophil Count',
      'Absolute Lymphocyte Count', 'Absolute Eosinophil Count', 'Absolute Monocyte Count',
      'Absolute Basophil Count', 'RBC Count', 'Platelet Count', 'PCV / HCT (Packed Cell Volume)',
      'MCV', 'MCH', 'MCHC', 'RDW-CV', 'RDW-SD', 'MPV', 'PCT'
    ]
  },
  {
    name: 'DIABETES PROFILE (3)',
    parameters: ['HbA1c', 'Fasting Blood Sugar', 'Average Blood Glucose']
  },
  {
    name: 'LIPID / CHOLESTEROL PROFILE (7)',
    parameters: [
      'Total Cholesterol', 'Triglycerides', 'Direct HDL', 'LDL', 'VLDL',
      'Total Cholesterol / HDL Ratio', 'LDL / HDL Ratio'
    ]
  },
  {
    name: 'LIVER FUNCTION PROFILE WITH GGT (11)',
    parameters: [
      'Total Bilirubin', 'Direct Bilirubin', 'Indirect Bilirubin', 'SGOT / AST',
      'SGPT / ALT', 'Alkaline Phosphatase', 'GGT', 'Total Protein', 'Albumin',
      'Globulin', 'A/G Ratio'
    ]
  },
  {
    name: 'URINE ROUTINE & MICROSCOPY (18)',
    parameters: [
      'Colour', 'Transparency (Appearance)', 'Reaction (pH)', 'Specific Gravity',
      'Urine Glucose (Sugar)', 'Urine Protein (Albumin)', 'Urine Ketones (Acetone)',
      'Blood', 'Leukocytes', 'Nitrite', 'Urobilinogen', 'Pus Cells (WBCs)',
      'Epithelial Cells', 'Red Blood Cells', 'Crystals', 'Casts', 'Amorphous Deposits', 'Bacteria'
    ]
  },
  {
    name: 'KIDNEY PROFILE (3)',
    parameters: ['Blood Urea', 'Creatinine', 'Uric Acid']
  },
  {
    name: 'VITAMIN PROFILE (2)',
    parameters: ['Vitamin D (25-Hydroxy)', 'Vitamin B12']
  }
];

async function main() {
  console.log('Seeding missing profiles...');
  for (const profileData of profilesToSeed) {
    const existingProfile = await prisma.testProfile.findFirst({
      where: { name: profileData.name }
    });

    if (!existingProfile) {
      console.log(`Creating profile: ${profileData.name}`);
      const newProfile = await prisma.testProfile.create({
        data: { name: profileData.name }
      });

      for (const param of profileData.parameters) {
        await prisma.testParameter.create({
          data: {
            name: param,
            profileId: newProfile.id
          }
        });
      }
      console.log(`Added ${profileData.parameters.length} parameters for ${profileData.name}`);
    } else {
      console.log(`Profile ${profileData.name} already exists. Skipping.`);
    }
  }
  console.log('Seeding complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
