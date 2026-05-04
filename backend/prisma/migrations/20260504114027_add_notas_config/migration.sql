-- CreateEnum
CREATE TYPE "TipoOperacion" AS ENUM ('COMPRA', 'ALQUILER', 'INVERSION');

-- CreateEnum
CREATE TYPE "Urgencia" AS ENUM ('INMEDIATA', 'TRES_MESES', 'SEIS_MESES', 'SIN_DEFINIR');

-- CreateEnum
CREATE TYPE "EstadoLead" AS ENUM ('NUEVO', 'CALIFICADO', 'VISITA_AGENDADA', 'NEGOCIACION', 'CERRADO', 'PERDIDO');

-- CreateEnum
CREATE TYPE "CanalOrigen" AS ENUM ('WEB', 'WHATSAPP', 'INSTAGRAM');

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "tipoOperacion" "TipoOperacion" NOT NULL,
    "presupuestoMin" DOUBLE PRECISION,
    "presupuestoMax" DOUBLE PRECISION,
    "zonas" TEXT[],
    "ambientes" INTEGER,
    "tieneFinanciamiento" BOOLEAN NOT NULL DEFAULT false,
    "urgencia" "Urgencia" NOT NULL DEFAULT 'SIN_DEFINIR',
    "score" INTEGER NOT NULL DEFAULT 0,
    "estado" "EstadoLead" NOT NULL DEFAULT 'NUEVO',
    "canalOrigen" "CanalOrigen" NOT NULL DEFAULT 'WEB',
    "agenteAsignado" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversacion" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "mensajes" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nota" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "autor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Nota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Config" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "nombreAgencia" TEXT NOT NULL DEFAULT 'Mi Inmobiliaria',
    "nombreBot" TEXT NOT NULL DEFAULT 'Sofía',
    "scoreUmbral" INTEGER NOT NULL DEFAULT 70,
    "horarioInicio" TEXT NOT NULL DEFAULT '08:00',
    "horarioFin" TEXT NOT NULL DEFAULT '20:00',

    CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Conversacion" ADD CONSTRAINT "Conversacion_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nota" ADD CONSTRAINT "Nota_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
