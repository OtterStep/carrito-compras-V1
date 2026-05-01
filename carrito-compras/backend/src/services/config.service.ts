import prisma from '../lib/prisma';

export const configService = {
  async obtener(clave: string) {
    return await prisma.systemConfig.findUnique({ where: { clave } });
  },

  async obtenerTodas() {
    return await prisma.systemConfig.findMany();
  },

  async actualizar(clave: string, valor: string) {
    return await prisma.systemConfig.upsert({
      where: { clave },
      update: { valor },
      create: { clave, valor }
    });
  },

  async obtenerTiempoCancelacion() {
    const config = await this.obtener('TIEMPO_CANCELACION_MINUTOS');
    return config ? parseInt(config.valor) : 30; // 30 min por defecto
  }
};
