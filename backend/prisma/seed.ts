import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const password = await bcrypt.hash('password123', 12);

  const doctor = await prisma.user.upsert({
    where: { email: 'dr.garcia@nexomed.es' },
    update: {},
    create: {
      email: 'dr.garcia@nexomed.es',
      password,
      role: Role.DOCTOR,
      name: 'Dr. Antonio García',
    },
  });

  const nurse1 = await prisma.user.upsert({
    where: { email: 'enf.martinez@nexomed.es' },
    update: {},
    create: {
      email: 'enf.martinez@nexomed.es',
      password,
      role: Role.NURSE,
      name: 'María Martínez',
    },
  });

  const nurse2 = await prisma.user.upsert({
    where: { email: 'enf.lopez@nexomed.es' },
    update: {},
    create: {
      email: 'enf.lopez@nexomed.es',
      password,
      role: Role.NURSE,
      name: 'Carlos López',
    },
  });

  const tcae = await prisma.user.upsert({
    where: { email: 'tcae.sanchez@nexomed.es' },
    update: {},
    create: {
      email: 'tcae.sanchez@nexomed.es',
      password,
      role: Role.TCAE,
      name: 'Laura Sánchez',
    },
  });

  const beds = await Promise.all([
    prisma.bed.upsert({
      where: { room_letter: { room: 101, letter: 'A' } },
      update: {},
      create: { room: 101, letter: 'A', floor: 1 },
    }),
    prisma.bed.upsert({
      where: { room_letter: { room: 101, letter: 'B' } },
      update: {},
      create: { room: 101, letter: 'B', floor: 1 },
    }),
    prisma.bed.upsert({
      where: { room_letter: { room: 102, letter: 'A' } },
      update: {},
      create: { room: 102, letter: 'A', floor: 1 },
    }),
    prisma.bed.upsert({
      where: { room_letter: { room: 102, letter: 'B' } },
      update: {},
      create: { room: 102, letter: 'B', floor: 1 },
    }),
    prisma.bed.upsert({
      where: { room_letter: { room: 103, letter: 'A' } },
      update: {},
      create: { room: 103, letter: 'A', floor: 1 },
    }),
    prisma.bed.upsert({
      where: { room_letter: { room: 103, letter: 'B' } },
      update: {},
      create: { room: 103, letter: 'B', floor: 1 },
    }),
  ]);

  const patients = await Promise.all([
    prisma.patient.create({
      data: {
        name: 'Juan Pérez Ruiz',
        dob: new Date('1958-03-15'),
        diagnosis: 'Neumonía adquirida en comunidad',
        allergies: ['Penicilina', 'Sulfamidas'],
        admissionDate: new Date('2026-03-20'),
        bedId: beds[0].id,
      },
    }),
    prisma.patient.create({
      data: {
        name: 'Ana Martínez Gil',
        dob: new Date('1972-07-22'),
        diagnosis: 'Fratura de cadera izquierda',
        allergies: [],
        admissionDate: new Date('2026-03-21'),
        bedId: beds[1].id,
      },
    }),
    prisma.patient.create({
      data: {
        name: 'Pedro Sánchez Torres',
        dob: new Date('1965-11-08'),
        diagnosis: 'IAM - Stent coronario',
        allergies: ['Latex'],
        admissionDate: new Date('2026-03-18'),
        bedId: beds[2].id,
      },
    }),
    prisma.patient.create({
      data: {
        name: 'Carmen Delgado Vela',
        dob: new Date('1980-01-30'),
        diagnosis: 'Apendicitis aguda - Postoperatorio',
        allergies: ['Codeína'],
        admissionDate: new Date('2026-03-22'),
        bedId: beds[3].id,
      },
    }),
    prisma.patient.create({
      data: {
        name: 'Luis Ramírez Ortega',
        dob: new Date('1955-09-14'),
        diagnosis: 'EPOC reagudizado',
        allergies: ['Amoxicilina', 'Ibuprofeno'],
        admissionDate: new Date('2026-03-19'),
        bedId: beds[4].id,
      },
    }),
    prisma.patient.create({
      data: {
        name: 'Isabel Fuentes Moreno',
        dob: new Date('1990-04-03'),
        diagnosis: 'Cetoacidosis diabética - Alta',
        allergies: ['Metformin'],
        admissionDate: new Date('2026-03-24'),
        bedId: beds[5].id,
      },
    }),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

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

  await prisma.notification.create({
    data: {
      userId: nurse1.id,
      type: 'MED_NEW',
      message: 'Dr. García ha prescrito Enoxaparina 40mg para el paciente Pedro Sánchez Torres',
      relatedPatientId: patients[2].id,
    },
  });

  console.log('Seed completed.');
  console.log('Users created:');
  console.log('  - Dr. Antonio García (doctor): dr.garcia@nexomed.es');
  console.log('  - María Martínez (enfermera): enf.martinez@nexomed.es');
  console.log('  - Carlos López (enfermero): enf.lopez@nexomed.es');
  console.log('  - Laura Sánchez (TCAE): tcae.sanchez@nexomed.es');
  console.log('Password for all users: password123');
  console.log('6 patients and 6 beds created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
