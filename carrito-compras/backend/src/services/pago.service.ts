import { AppError } from '../utils/AppError';
import prisma from '../lib/prisma';

export const pagoService = {
  async procesarPago(data: { 
    ordenId: string, 
    tarjeta: string, 
    cvv: string, 
    expiracion: string,
    nombre: string 
  }) {
    const { ordenId, tarjeta, cvv, expiracion, nombre } = data;

    // Simulación de validación de tarjeta
    if (!tarjeta || tarjeta.length < 16) {
      throw new AppError('Número de tarjeta inválido', 400);
    }

    if (!cvv || cvv.length < 3) {
      throw new AppError('CVV inválido', 400);
    }

    // Buscar la orden
    const orden = await prisma.order.findUnique({
      where: { id: ordenId }
    });

    if (!orden) {
      throw new AppError('Orden no encontrada', 404);
    }

    if (orden.estado === 'PAGADO') {
      throw new AppError('La orden ya ha sido pagada', 400);
    }

    // Simulación de retraso de red de pasarela de pago
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulación de éxito/error (por ejemplo, rechazar si el nombre es "RECHAZADO")
    if (nombre.toUpperCase() === 'RECHAZADO') {
      throw new AppError('El pago ha sido rechazado por el banco emisor', 402);
    }

    // Generar un ID de transacción ficticio
    const transactionId = `txn_${Math.random().toString(36).substring(2, 15)}`;

    // Actualizar la orden
    const ordenActualizada = await prisma.order.update({
      where: { id: ordenId },
      data: {
        estado: 'PAGADO',
        transactionId: transactionId
      }
    });

    return {
      success: true,
      message: 'Pago procesado exitosamente',
      transactionId,
      orden: ordenActualizada
    };
  }
};
