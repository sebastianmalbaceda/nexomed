const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const patients = await prisma.patient.findMany({ 
    where: { dni: { startsWith: 'DNI' } } 
  });
  
  console.log(`Found ${patients.length} patients with DNI prefix`);
  
  for (const pat of patients) {
    const newDni = pat.dni.replace('DNI', '');
    await prisma.patient.update({
      where: { id: pat.id },
      data: { dni: newDni }
    });
    console.log(`Fixed: ${pat.name} -> DNI: ${newDni}`);
  }
  
  console.log('Done!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
