// src/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NexoMed API',
      version: '1.0.0',
      description: 'API REST para gestión clínica hospitalaria — Proyecto LIS UAB 2026',
    },
    servers: [
      {
        url: 'http://localhost:3001/api',
        description: 'Servidor de desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['NURSE', 'DOCTOR', 'TCAE'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Patient: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            dob: { type: 'string', format: 'date-time' },
            diagnosis: { type: 'string' },
            allergies: { type: 'array', items: { type: 'string' } },
            admissionDate: { type: 'string', format: 'date-time' },
            bedId: { type: 'string', format: 'uuid', nullable: true },
          },
        },
        Medication: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            patientId: { type: 'string', format: 'uuid' },
            drugName: { type: 'string' },
            dose: { type: 'string' },
            route: { type: 'string' },
            frequencyHrs: { type: 'integer' },
            startTime: { type: 'string', format: 'date-time' },
            active: { type: 'boolean' },
          },
        },
        CareRecord: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            patientId: { type: 'string', format: 'uuid' },
            type: { type: 'string' },
            value: { type: 'string' },
            unit: { type: 'string', nullable: true },
            notes: { type: 'string', nullable: true },
            recordedAt: { type: 'string', format: 'date-time' },
          },
        },
        Bed: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            room: { type: 'integer' },
            letter: { type: 'string' },
            floor: { type: 'integer' },
            patient: { $ref: '#/components/schemas/Patient', nullable: true },
          },
        },
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            type: { type: 'string' },
            message: { type: 'string' },
            relatedPatientId: { type: 'string', format: 'uuid', nullable: true },
            read: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Incident: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            patientId: { type: 'string', format: 'uuid' },
            type: { type: 'string' },
            description: { type: 'string' },
            reportedAt: { type: 'string', format: 'date-time' },
          },
        },
        DiagnosticTest: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            patientId: { type: 'string', format: 'uuid' },
            type: { type: 'string' },
            name: { type: 'string' },
            scheduledAt: { type: 'string', format: 'date-time' },
            result: { type: 'string', nullable: true },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
