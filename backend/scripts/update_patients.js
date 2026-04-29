const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const patients = await prisma.patient.findMany({ where: { dni: null } });
  console.log(`Found ${patients.length} patients without DNI`);

  for (const p of patients) {
    const dni = 'DNI' + Math.random().toString().slice(2, 11);
    const nameParts = p.name.split(' ');
    const name = nameParts[0] || 'Desconocido';
    const surnames = nameParts.slice(1).join(' ') || 'Desconocido';

    await prisma.patient.update({
      where: { id: p.id },
      data: { dni, name, surnames }
    });
    console.log(`Updated patient ${p.id}: DNI=${dni}, name=${name}, surnames=${surnames}`);
  }

  console.log('Done!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
