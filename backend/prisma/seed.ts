import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  const password = await bcrypt.hash('password123', 12);

  // --- USUARIOS (upsert para idempotencia) ---
  console.log('Creating users...');

  const doctor = await prisma.user.upsert({
    where: { email: 'dr.garcia@nexomed.es' },
    update: { name: 'Dr. Antonio García' },
    create: {
      email: 'dr.garcia@nexomed.es',
      password,
      role: Role.DOCTOR,
      name: 'Dr. Antonio García',
    },
  });

  const nurse1 = await prisma.user.upsert({
    where: { email: 'enf.martinez@nexomed.es' },
    update: { name: 'María Martínez' },
    create: {
      email: 'enf.martinez@nexomed.es',
      password,
      role: Role.NURSE,
      name: 'María Martínez',
    },
  });

  const nurse2 = await prisma.user.upsert({
    where: { email: 'enf.lopez@nexomed.es' },
    update: { name: 'Carlos López' },
    create: {
      email: 'enf.lopez@nexomed.es',
      password,
      role: Role.NURSE,
      name: 'Carlos López',
    },
  });

  const tcae = await prisma.user.upsert({
    where: { email: 'tcae.sanchez@nexomed.es' },
    update: { name: 'Laura Sánchez' },
    create: {
      email: 'tcae.sanchez@nexomed.es',
      password,
      role: Role.TCAE,
      name: 'Laura Sánchez',
    },
  });

  console.log('✅ Users ready (4).');

  // --- CAMAS (upsert para idempotencia) ---
  console.log('Creating beds...');

  const bedConfigs = [
    { room: 101, letter: 'A' },
    { room: 101, letter: 'B' },
    { room: 102, letter: 'A' },
    { room: 102, letter: 'B' },
    { room: 103, letter: 'A' },
    { room: 103, letter: 'B' },
  ];

  const beds = [];
  for (const config of bedConfigs) {
    const bed = await prisma.bed.upsert({
      where: {
        room_letter: { room: config.room, letter: config.letter }
      },
      update: {},
      create: { room: config.room, letter: config.letter, floor: 1 },
    });
    beds.push(bed);
  }

  console.log(`✅ Beds ready (${beds.length}).`);

  // --- PACIENTES ---
  console.log('Creating patients...');

  // Primero liberar camas que tienen pacientes que ya no queremos
  await prisma.patient.updateMany({
    where: {
      bedId: { in: beds.map(b => b.id) },
      NOT: {
        name: {
          in: [
            'Juan Pérez Ruiz',
            'Ana Martínez Gil',
            'Pedro Sánchez Torres',
            'Carmen Delgado Vela',
            'Luis Ramírez Ortega',
            'Isabel Fuentes Moreno',
          ]
        }
      }
    },
    data: { bedId: null }
  });

  const patientData = [
    {
      name: 'Juan Pérez Ruiz',
      dob: new Date('1958-03-15'),
      diagnosis: 'Neumonía adquirida en comunidad',
      allergies: ['Penicilina', 'Sulfamidas'],
      bedIndex: 0,
    },
    {
      name: 'Ana Martínez Gil',
      dob: new Date('1972-07-22'),
      diagnosis: 'Fratura de cadera izquierda',
      allergies: [],
      bedIndex: 1,
    },
    {
      name: 'Pedro Sánchez Torres',
      dob: new Date('1965-11-08'),
      diagnosis: 'IAM - Stent coronario',
      allergies: ['Latex'],
      bedIndex: 2,
    },
    {
      name: 'Carmen Delgado Vela',
      dob: new Date('1980-01-30'),
      diagnosis: 'Apendicitis aguda - Postoperatorio',
      allergies: ['Codeína'],
      bedIndex: 3,
    },
    {
      name: 'Luis Ramírez Ortega',
      dob: new Date('1955-09-14'),
      diagnosis: 'EPOC reagudizado',
      allergies: ['Amoxicilina', 'Ibuprofeno'],
      bedIndex: 4,
    },
    {
      name: 'Isabel Fuentes Moreno',
      dob: new Date('1990-04-03'),
      diagnosis: 'Cetoacidosis diabética - Alta',
      allergies: ['Metformin'],
      bedIndex: 5,
    },
  ];

  const patients = [];
  for (const pData of patientData) {
    const existing = await prisma.patient.findFirst({
      where: { name: pData.name }
    });

    if (existing) {
      await prisma.patient.update({
        where: { id: existing.id },
        data: {
          bedId: beds[pData.bedIndex].id,
          diagnosis: pData.diagnosis,
          allergies: pData.allergies,
        }
      });
      patients.push({ ...existing, bedId: beds[pData.bedIndex].id });
    } else {
      const patient = await prisma.patient.create({
        data: {
          name: pData.name,
          dob: pData.dob,
          diagnosis: pData.diagnosis,
          allergies: pData.allergies,
          bedId: beds[pData.bedIndex].id,
        },
      });
      patients.push(patient);
    }
  }

  console.log(`✅ Patients ready (${patients.length}).`);

  // --- MEDICACIONES ---
  console.log('Creating medications...');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingMed1 = await prisma.medication.findFirst({
    where: { drugName: 'Amoxicilina 500mg', patientId: patients[0].id }
  });

  if (!existingMed1) {
    const med1 = await prisma.medication.create({
      data: {
        patientId: patients[0].id,
        drugName: 'Amoxicilina 500mg',
        dose: '500mg',
        route: 'oral',
        frequencyHrs: 8,
        startTime: new Date(today.getTime() + 8 * 60 * 60 * 1000),
        active: true,
        prescribedById: doctor.id,
      },
    });

    await prisma.medSchedule.createMany({
      data: [
        { medicationId: med1.id, scheduledAt: new Date(today.getTime() + 8 * 60 * 60 * 1000) },
        { medicationId: med1.id, scheduledAt: new Date(today.getTime() + 16 * 60 * 60 * 1000) },
      ],
    });
  }

  const existingMed2 = await prisma.medication.findFirst({
    where: { drugName: 'Paracetamol 1g', patientId: patients[0].id }
  });

  if (!existingMed2) {
    const med2 = await prisma.medication.create({
      data: {
        patientId: patients[0].id,
        drugName: 'Paracetamol 1g',
        dose: '1g',
        route: 'IV',
        frequencyHrs: 6,
        startTime: new Date(today.getTime() + 6 * 60 * 60 * 1000),
        active: true,
        prescribedById: doctor.id,
      },
    });

    await prisma.medSchedule.createMany({
      data: [
        { medicationId: med2.id, scheduledAt: new Date(today.getTime() + 6 * 60 * 60 * 1000) },
        { medicationId: med2.id, scheduledAt: new Date(today.getTime() + 12 * 60 * 60 * 1000) },
        { medicationId: med2.id, scheduledAt: new Date(today.getTime() + 18 * 60 * 60 * 1000) },
        { medicationId: med2.id, scheduledAt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
      ],
    });
  }

  const existingMed3 = await prisma.medication.findFirst({
    where: { drugName: 'Enoxaparina 40mg', patientId: patients[2].id }
  });

  if (!existingMed3) {
    await prisma.medication.create({
      data: {
        patientId: patients[2].id,
        drugName: 'Enoxaparina 40mg',
        dose: '40mg',
        route: 'SC',
        frequencyHrs: 24,
        startTime: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        active: true,
        prescribedById: doctor.id,
      },
    });
  }

  console.log('✅ Medications ready.');

  // --- REGISTROS DE CUIDADOS ---
  const existingCare = await prisma.careRecord.count();
  if (existingCare === 0) {
    await prisma.careRecord.create({
      data: {
        patientId: patients[0].id,
        type: 'constante',
        value: '120/80',
        unit: 'mmHg',
        notes: 'PA estable',
        recordedById: nurse1.id,
      },
    });

    await prisma.careRecord.create({
      data: {
        patientId: patients[1].id,
        type: 'constante',
        value: '97',
        unit: 'SpO2%',
        notes: 'Oximetría correcta con gafas nasales a 2L',
        recordedById: nurse2.id,
      },
    });
    console.log('✅ Care records created (2).');
  }

  // --- NOTIFICACIONES ---
  const existingNotifs = await prisma.notification.count();
  if (existingNotifs === 0) {
    await prisma.notification.create({
      data: {
        userId: nurse1.id,
        type: 'MED_NEW',
        message: 'Dr. García ha prescrito Enoxaparina 40mg para el paciente Pedro Sánchez Torres',
        relatedPatientId: patients[2].id,
      },
    });
    console.log('✅ Notifications created (1).');
  }

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📝 Credenciales de prueba:');
  console.log('  Contraseña: password123');
  console.log('');
  console.log('  👨‍⚕️  Doctor:    dr.garcia@nexomed.es');
  console.log('  👩‍⚕️  Enfermera: enf.martinez@nexomed.es');
  console.log('  👨‍⚕️  Enfermero: enf.lopez@nexomed.es');
  console.log('  👩‍⚕️  TCAE:      tcae.sanchez@nexomed.es');
  console.log('');
  console.log(`🏥 ${patients.length} pacientes en ${beds.length} camas`);
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
