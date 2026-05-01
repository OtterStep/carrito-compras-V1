import PDFDocument from 'pdfkit';
import { Response } from 'express';

export async function generarReporteOrdenes(ordenes: any[], res: Response) {
  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=ordenes.pdf');
  doc.pipe(res);

  doc.fontSize(18).text('Reporte de Órdenes', { align: 'center' });
  doc.moveDown();
  ordenes.forEach((orden, idx) => {
    doc.fontSize(12).text(`Orden #${orden.codigo} - ${orden.fecha_orden.toDateString()}`);
    doc.text(`Cliente: ${orden.cliente.nombre} ${orden.cliente.apellido}`);
    doc.text(`Total: $${orden.total}`);
    doc.moveDown();
  });
  doc.end();
}

export async function generarFacturaPDF(orden: any, res: Response) {
  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=factura-${orden.id}.pdf`);
  doc.pipe(res);

  // Cabecera
  doc.fontSize(20).text('FACTURA DE COMPRA', { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).text(`Fecha: ${new Date(orden.createdAt).toLocaleString()}`);
  doc.text(`Orden ID: ${orden.id}`);
  doc.text(`Estado: ${orden.estado}`);
  doc.moveDown();

  // Cliente
  doc.fontSize(14).text('Datos del Cliente', { underline: true });
  doc.fontSize(10).text(`Nombre: ${orden.user.nombre}`);
  doc.text(`Email: ${orden.user.email}`);
  doc.moveDown();

  // Productos
  doc.fontSize(14).text('Detalle de Productos', { underline: true });
  doc.moveDown();

  let y = doc.y;
  doc.text('Producto', 50, y);
  doc.text('Cant.', 300, y);
  doc.text('Precio', 350, y);
  doc.text('Subtotal', 450, y);
  doc.moveDown();

  orden.items.forEach((item: any) => {
    y = doc.y;
    doc.text(item.product.nombre, 50, y);
    doc.text(item.cantidad.toString(), 300, y);
    doc.text(`$${item.precio.toFixed(2)}`, 350, y);
    doc.text(`$${(item.cantidad * item.precio).toFixed(2)}`, 450, y);
    doc.moveDown();
  });

  doc.moveDown();
  doc.fontSize(16).text(`TOTAL: $${orden.total.toFixed(2)}`, { align: 'right' });

  doc.end();
}
