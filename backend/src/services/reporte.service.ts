import PDFDocument from 'pdfkit';
import { Response } from 'express';
import prisma from '../lib/prisma';
import puppeteer from 'puppeteer';

const EMPRESA = {
  nombre: "TECH-CART SOLUTIONS S.A.",
  ruc: "20123456789",
  direccion: "Av. Innovación 123, Tech City",
  telefono: "+51 987 654 321",
  email: "contacto@techcart.com"
};

const generarPDFConPuppeteer = async (res: Response, html: string, filename: string) => {
  let browser: any = null;
  try {
    console.log(`Iniciando generación de PDF con Puppeteer: ${filename}`);
    browser = await puppeteer.launch({
      headless: true, // Cambiamos a true (clásico) para mayor compatibilidad
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--disable-extensions',
        '--disable-web-security',
        '--font-render-hinting=none'
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      timeout: 20000 // Reducimos el timeout de launch para fallar rápido si no abre
    });
    
    const page = await browser.newPage();
    
    // Establecer un timeout razonable
    await page.setDefaultNavigationTimeout(30000);
    
    // Usar 'load' en lugar de 'networkidle0' para mayor velocidad si no hay recursos externos
    await page.setContent(html, { 
      waitUntil: 'load',
      timeout: 30000 
    });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
      timeout: 30000
    });

    console.log(`PDF generado exitosamente: ${filename}`);

    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.send(pdf);
    }
  } catch (error) {
    console.error('Error Crítico Puppeteer:', error);
    
    // Fallback a PDFKit para evitar ERR_EMPTY_RESPONSE
    if (!res.headersSent) {
      console.log('Iniciando Fallback con PDFKit...');
      try {
        await generarFallbackPDFKit(res, filename, html);
      } catch (fallbackError) {
        console.error('Error en fallback PDFKit:', fallbackError);
        res.status(500).json({ success: false, message: 'Error crítico generando reporte.' });
      }
    }
  } finally {
    if (browser) {
      try {
        await browser.close();
        console.log('Navegador Puppeteer cerrado correctamente.');
      } catch (closeError) {
        console.error('Error al cerrar el navegador:', closeError);
      }
    }
  }
};

const generarFallbackPDFKit = async (res: Response, filename: string, html: string) => {
  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=FALLBACK_${filename}`);
  doc.pipe(res);

  doc.fontSize(20).fillColor('#1e40af').text(EMPRESA.nombre);
  doc.fontSize(14).fillColor('#64748b').text('REPORTE DE GESTIÓN (MODO COMPATIBILIDAD)');
  doc.moveDown();
  
  doc.fontSize(10).fillColor('#000').text('El reporte original basado en Puppeteer no pudo generarse en este entorno. Se presenta esta versión simplificada.');
  doc.moveDown();
  
  // Limpiar un poco el HTML para extraer texto legible
  const textContent = html
    .replace(/<style[^>]*>.*<\/style>/gms, '')
    .replace(/<[^>]+>/g, '\n')
    .replace(/\n\s*\n/g, '\n')
    .trim();

  doc.fontSize(9).text(textContent);
  
  doc.end();
};

const agregarCabeceraYPie = (doc: any, titulo: string, filtros: string = "Ninguno") => {
  // Encabezado
  doc.rect(0, 0, 612, 100).fill('#f8fafc');
  doc.fillColor('#1e40af').fontSize(20).text(EMPRESA.nombre, 50, 30);
  doc.fillColor('#64748b').fontSize(8).text(`RUC: ${EMPRESA.ruc}`, 50, 55);
  doc.text(EMPRESA.direccion, 50, 65);
  doc.text(`Tel: ${EMPRESA.telefono} | ${EMPRESA.email}`, 50, 75);
  
  doc.fillColor('#0f172a').fontSize(16).text(titulo, 300, 40, { align: 'right' });
  doc.fontSize(8).fillColor('#64748b').text(`Filtros: ${filtros}`, 300, 65, { align: 'right' });
  
  doc.moveTo(50, 100).lineTo(562, 100).stroke('#e2e8f0');
  
  // Pie de página (se agregará al final o en cada página)
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc.fillColor('#94a3b8').fontSize(8).text(
      `Generado el: ${new Date().toLocaleString()} | Página ${i + 1} de ${range.count}`,
      50, 750, { align: 'center' }
    );
  }
};

export const reporteService = {
  async generarReporteOperacionalOrdenes(res: Response, fechaInicio: Date, fechaFin: Date) {
    try {
      const ordenes = await prisma.order.findMany({
        where: { createdAt: { gte: fechaInicio, lte: fechaFin } },
        include: { user: true, items: { include: { product: true } } },
      });
      
      const doc = new PDFDocument({ margin: 50, bufferPages: true });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=ordenes.pdf');
      doc.pipe(res);
      
      doc.moveDown(5);
      
      if (ordenes.length === 0) {
        doc.fontSize(12).text('No se encontraron órdenes en este periodo.', { align: 'center' });
      } else {
        let totalGeneral = 0;
        ordenes.forEach((orden: any) => {
          totalGeneral += Number(orden.total);
          doc.fontSize(10).fillColor('#1e40af').text(`ORDEN #${orden.id.substring(0, 8).toUpperCase()}`, { continued: true });
          doc.fillColor('#64748b').text(` - ${orden.createdAt.toLocaleString()}`, { align: 'right' });
          
          doc.fillColor('#0f172a').fontSize(9).text(`Cliente: ${orden.user.nombre} (${orden.user.email})`);
          doc.text(`Estado: `, { continued: true }).fillColor(orden.estado === 'PAGADO' ? '#10b981' : '#f59e0b').text(orden.estado);
          
          doc.moveDown(0.5);
          // Tabla de productos
          const tableTop = doc.y;
          doc.fillColor('#f1f5f9').rect(50, tableTop, 512, 15).fill();
          doc.fillColor('#475569').fontSize(8).text('PRODUCTO', 60, tableTop + 4);
          doc.text('CANT', 350, tableTop + 4);
          doc.text('PRECIO', 420, tableTop + 4);
          doc.text('SUBTOTAL', 500, tableTop + 4);
          
          let itemY = tableTop + 20;
          orden.items.forEach((item: any) => {
            doc.fillColor('#1e293b').text(item.product.nombre, 60, itemY);
            doc.text(item.cantidad.toString(), 350, itemY);
            doc.text(`$${Number(item.precio).toFixed(2)}`, 420, itemY);
            doc.text(`$${(item.cantidad * Number(item.precio)).toFixed(2)}`, 500, itemY);
            itemY += 12;
          });
          
          doc.moveDown(1);
          doc.fillColor('#0f172a').fontSize(10).text(`Total Orden: $${Number(orden.total).toFixed(2)}`, { align: 'right' });
          doc.moveDown();
          doc.moveTo(50, doc.y).lineTo(562, doc.y).stroke('#f1f5f9');
          doc.moveDown();

          if (doc.y > 700) doc.addPage();
        });

        doc.moveDown();
        doc.fontSize(12).fillColor('#1e40af').font('Helvetica-Bold').text(`TOTAL GENERAL DEL PERIODO: $${totalGeneral.toFixed(2)}`, { align: 'right' });
        doc.font('Helvetica');
      }
      
      agregarCabeceraYPie(doc, "Reporte de Órdenes", `${fechaInicio.toLocaleDateString()} - ${fechaFin.toLocaleDateString()}`);
      doc.end();
    } catch (error) {
      console.error('Error generando PDF Operacional:', error);
      res.status(500).json({ success: false, message: 'Error al generar el reporte operacional' });
    }
  },

  async generarReporteInventarioValorizado(res: Response) {
    try {
      const productos = await prisma.product.findMany({
        orderBy: { categoria: 'asc' }
      });

      const doc = new PDFDocument({ margin: 50, bufferPages: true });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=inventario-valorizado.pdf');
      doc.pipe(res);
      doc.moveDown(5);

      const inventarioPorCategoria: Record<string, any[]> = {};
      productos.forEach((p: any) => {
        if (!inventarioPorCategoria[p.categoria]) inventarioPorCategoria[p.categoria] = [];
        inventarioPorCategoria[p.categoria].push(p);
      });

      let totalGlobal = 0;
      Object.entries(inventarioPorCategoria).forEach(([categoria, prods]) => {
        doc.fontSize(12).fillColor('#1e40af').text(categoria.toUpperCase(), { underline: true });
        doc.moveDown(0.5);

        let subtotalCat = 0;
        prods.forEach((p: any) => {
          const valor = p.precio * p.stock;
          subtotalCat += valor;
          doc.fontSize(9).fillColor('#0f172a').text(`${p.nombre}`, { continued: true });
          doc.fillColor('#64748b').text(` | Stock: ${p.stock} | Precio: $${p.precio.toFixed(2)} | `, { continued: true });
          doc.fillColor('#0f172a').text(`Valor: $${valor.toFixed(2)}`, { align: 'right' });
        });

        totalGlobal += subtotalCat;
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('#1e40af').text(`Subtotal ${categoria}: $${subtotalCat.toFixed(2)}`, { align: 'right' });
        doc.moveDown();
        if (doc.y > 700) doc.addPage();
      });

      doc.moveDown();
      doc.fontSize(14).fillColor('#1e40af').font('Helvetica-Bold').text(`VALOR TOTAL DEL INVENTARIO: $${totalGlobal.toFixed(2)}`, { align: 'center' });
      doc.font('Helvetica');

      agregarCabeceraYPie(doc, "Inventario Valorizado");
      doc.end();
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al generar reporte de inventario' });
    }
  },

  async generarReporteStockBajo(res: Response) {
    try {
      const productos = await prisma.product.findMany({
        where: { stock: { lte: 10 } },
        orderBy: { stock: 'asc' }
      });

      const doc = new PDFDocument({ margin: 50, bufferPages: true });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=stock-bajo.pdf');
      doc.pipe(res);
      doc.moveDown(5);

      if (productos.length === 0) {
        doc.fontSize(12).text('No hay productos con stock bajo.', { align: 'center' });
      } else {
        productos.forEach((p: any) => {
          doc.fontSize(10).fillColor(p.stock === 0 ? '#ef4444' : '#f59e0b').text(p.nombre, { continued: true });
          doc.fillColor('#64748b').text(` - Categoría: ${p.categoria} - `, { continued: true });
          doc.fillColor('#0f172a').font('Helvetica-Bold').text(`STOCK ACTUAL: ${p.stock}`, { align: 'right' });
          doc.font('Helvetica');
          doc.moveDown(0.5);
          doc.moveTo(50, doc.y).lineTo(562, doc.y).stroke('#f1f5f9');
          doc.moveDown(0.5);
        });
      }

      agregarCabeceraYPie(doc, "Reporte de Stock Bajo", "Stock <= 10");
      doc.end();
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al generar reporte' });
    }
  },

  async generarFacturaIndividual(res: Response, ordenId: string) {
    try {
      const orden = await prisma.order.findUnique({
        where: { id: ordenId },
        include: { user: true, items: { include: { product: true } } }
      });

      if (!orden) throw new Error('Orden no encontrada');

      const doc = new PDFDocument({ margin: 50, bufferPages: true });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=factura-${ordenId.substring(0,8)}.pdf`);
      doc.pipe(res);
      doc.moveDown(5);

      doc.fontSize(14).fillColor('#1e40af').text(`FACTURA ELECTRÓNICA: F001-${orden.id.substring(0, 6).toUpperCase()}`, { align: 'center' });
      doc.moveDown();

      doc.fontSize(10).fillColor('#0f172a').text(`DATOS DEL CLIENTE:`);
      doc.text(`Nombre: ${orden.user.nombre}`);
      doc.text(`Email: ${orden.user.email}`);
      doc.text(`Fecha: ${orden.createdAt.toLocaleDateString()}`);
      doc.moveDown();

      // Detalle
      let subtotal = 0;
      orden.items.forEach(item => {
        const itemSub = item.cantidad * Number(item.precio);
        subtotal += itemSub;
        doc.text(`${item.product.nombre} x${item.cantidad}`, { continued: true });
        doc.text(`$${itemSub.toFixed(2)}`, { align: 'right' });
      });

      const igv = subtotal * 0.18;
      const total = subtotal + igv;

      doc.moveDown();
      doc.moveTo(350, doc.y).lineTo(562, doc.y).stroke();
      doc.text(`Subtotal: $${subtotal.toFixed(2)}`, { align: 'right' });
      doc.text(`IGV (18%): $${igv.toFixed(2)}`, { align: 'right' });
      doc.fontSize(12).fillColor('#1e40af').font('Helvetica-Bold').text(`TOTAL A PAGAR: $${total.toFixed(2)}`, { align: 'right' });
      doc.font('Helvetica');

      agregarCabeceraYPie(doc, "Factura de Venta");
      doc.end();
    } catch (error) {
      res.status(500).send('Error al generar factura');
    }
  },

  async generarReporteMovimientosInventario(res: Response, fechaInicio: Date, fechaFin: Date) {
    try {
      // Como no hay tabla de movimientos, usaremos las órdenes como "salidas" 
      // y asumiremos que no hay registros de "entradas" o usaremos productos creados recientemente
      const salidas = await prisma.orderItem.findMany({
        where: { order: { createdAt: { gte: fechaInicio, lte: fechaFin }, estado: 'PAGADO' } },
        include: { product: true, order: true }
      });

      const doc = new PDFDocument({ margin: 50, bufferPages: true });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=movimientos.pdf');
      doc.pipe(res);
      doc.moveDown(5);

      doc.fontSize(10).fillColor('#475569').text('FECHA', 60, doc.y, { continued: true });
      doc.text('TIPO', 150, doc.y, { continued: true });
      doc.text('PRODUCTO', 220, doc.y, { continued: true });
      doc.text('CANTIDAD', 450, doc.y, { align: 'right' });
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(562, doc.y).stroke('#e2e8f0');
      doc.moveDown(0.5);

      salidas.forEach(s => {
        doc.fontSize(9).fillColor('#0f172a').text(s.order.createdAt.toLocaleDateString(), 60, doc.y, { continued: true });
        doc.fillColor('#ef4444').text('SALIDA (VENTA)', 150, doc.y, { continued: true });
        doc.fillColor('#0f172a').text(s.product.nombre, 220, doc.y, { continued: true });
        doc.text(`-${s.cantidad}`, 450, doc.y, { align: 'right' });
        doc.moveDown(0.5);
      });

      agregarCabeceraYPie(doc, "Movimientos de Inventario", `${fechaInicio.toLocaleDateString()} - ${fechaFin.toLocaleDateString()}`);
      doc.end();
    } catch (error) {
      res.status(500).send('Error');
    }
  },

  async generarReportePagosRecibidos(res: Response, fechaInicio: Date, fechaFin: Date) {
    try {
      const pagos = await prisma.order.findMany({
        where: { createdAt: { gte: fechaInicio, lte: fechaFin }, estado: 'PAGADO' },
        include: { user: true }
      });

      const doc = new PDFDocument({ margin: 50, bufferPages: true });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=pagos-recibidos.pdf');
      doc.pipe(res);
      doc.moveDown(5);

      let totalPagos = 0;
      pagos.forEach(p => {
        totalPagos += Number(p.total);
        doc.fontSize(10).text(p.createdAt.toLocaleString(), { continued: true });
        doc.text(` | Cliente: ${p.user.nombre} | `, { continued: true });
        doc.fontSize(10).fillColor('#10b981').font('Helvetica-Bold').text(`$${Number(p.total).toFixed(2)}`, { align: 'right' });
        doc.font('Helvetica');
        doc.moveDown(0.5);
      });

      doc.moveDown();
      doc.fontSize(12).fillColor('#10b981').font('Helvetica-Bold').text(`TOTAL RECAUDADO: $${totalPagos.toFixed(2)}`, { align: 'right' });
      doc.font('Helvetica');

      agregarCabeceraYPie(doc, "Pagos Recibidos", `${fechaInicio.toLocaleDateString()} - ${fechaFin.toLocaleDateString()}`);
      doc.end();
    } catch (error) {
      res.status(500).send('Error');
    }
  },

  async generarReporteDevoluciones(res: Response, fechaInicio: Date, fechaFin: Date) {
    try {
      const devoluciones = await prisma.order.findMany({
        where: { createdAt: { gte: fechaInicio, lte: fechaFin }, estado: 'CANCELADO' },
        include: { user: true }
      });

      const doc = new PDFDocument({ margin: 50, bufferPages: true });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=devoluciones.pdf');
      doc.pipe(res);
      doc.moveDown(5);

      if (devoluciones.length === 0) {
        doc.text('No se registraron devoluciones en el periodo.', { align: 'center' });
      } else {
        devoluciones.forEach(d => {
          doc.fontSize(10).text(d.createdAt.toLocaleDateString(), { continued: true });
          doc.text(` | Orden #${d.id.substring(0,8)} | Motivo: Cancelación de cliente | `, { continued: true });
          doc.fillColor('#ef4444').text(`-$${Number(d.total).toFixed(2)}`, { align: 'right' });
          doc.moveDown(0.5);
        });
      }

      agregarCabeceraYPie(doc, "Reporte de Devoluciones", "Estado: CANCELADO");
      doc.end();
    } catch (error) {
      res.status(500).send('Error');
    }
  },

  async generarComprobanteCompra(res: Response, ordenId: string) {
    try {
      const orden = await prisma.order.findUnique({
        where: { id: ordenId },
        include: { items: { include: { product: true } } }
      });

      if (!orden) throw new Error('No existe');

      const doc = new PDFDocument({ size: [300, 600], margin: 20 }); // Tamaño ticket
      res.setHeader('Content-Type', 'application/pdf');
      doc.pipe(res);

      doc.fontSize(12).text(EMPRESA.nombre, { align: 'center' });
      doc.fontSize(8).text(EMPRESA.direccion, { align: 'center' });
      doc.text(`Ticket: ${orden.id.substring(0,8)}`, { align: 'center' });
      doc.moveDown();
      
      doc.text('------------------------------------------');
      orden.items.forEach(item => {
        doc.text(`${item.product.nombre.substring(0, 20)} x${item.cantidad} $${(item.cantidad * item.precio).toFixed(2)}`);
      });
      doc.text('------------------------------------------');
      doc.fontSize(10).font('Helvetica-Bold').text(`TOTAL: $${Number(orden.total).toFixed(2)}`, { align: 'right' });
      doc.font('Helvetica');
      doc.moveDown();
      doc.fontSize(8).text('¡Gracias por su compra!', { align: 'center' });

      doc.end();
    } catch (error) {
      res.status(500).send('Error');
    }
  },

  async generarReporteGestionVentasCategoria(res: Response) {
    try {
      const items = await prisma.orderItem.findMany({
        include: { product: true, order: true },
        where: { order: { estado: 'PAGADO' } }
      });

      const data: Record<string, number> = {};
      items.forEach(item => {
        const cat = item.product.categoria;
        data[cat] = (data[cat] || 0) + (item.cantidad * item.precio);
      });

      const values = Object.values(data);
      const maxVenta = values.length > 0 ? Math.max(...values) : 1;
      const rows = Object.entries(data).map(([cat, total]) => {
        const percentage = (total / maxVenta) * 100;
        return `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; width: 30%;">${cat}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; width: 50%;">
              <div style="background: #e2e8f0; border-radius: 4px; height: 12px; width: 100%;">
                <div style="background: #1e40af; height: 100%; border-radius: 4px; width: ${percentage}%;"></div>
              </div>
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; width: 20%; font-weight: bold;">$${total.toFixed(2)}</td>
          </tr>
        `;
      }).join('');

      const html = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica', sans-serif; color: #1e293b; padding: 40px; }
              .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 4px solid #1e40af; padding-bottom: 20px; margin-bottom: 30px; }
              .company-info h1 { margin: 0; color: #1e40af; font-size: 24px; }
              .report-title { text-align: right; }
              .report-title h2 { margin: 0; color: #64748b; font-size: 18px; text-transform: uppercase; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th { background: #f8fafc; padding: 12px; text-align: left; color: #475569; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
              .summary { margin-top: 40px; padding: 25px; background: #f0f9ff; border-left: 6px solid #3b82f6; border-radius: 0 8px 8px 0; }
              .summary h3 { margin-top: 0; color: #1e40af; }
              .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="company-info">
                <h1>${EMPRESA.nombre}</h1>
                <p style="font-size: 12px; color: #64748b; margin: 5px 0;">RUC: ${EMPRESA.ruc} | ${EMPRESA.direccion}</p>
              </div>
              <div class="report-title">
                <h2>Ventas por Categoría</h2>
                <p style="font-size: 11px; color: #94a3b8;">Reporte de Gestión Estratégica</p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Distribución</th>
                  <th style="text-align: right;">Total Ventas</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>

            <div class="summary">
              <h3>Resumen Ejecutivo</h3>
              <p>El presente análisis muestra la distribución de ingresos a través de las diferentes líneas de productos. 
              Se observa una concentración del volumen de ventas en las categorías superiores, lo que sugiere una oportunidad 
              para optimizar el inventario en los segmentos de menor rotación.</p>
            </div>

            <div class="footer">
              Este documento es confidencial y para uso exclusivo de la gerencia. <br>
              Generado el ${new Date().toLocaleString()}
            </div>
          </body>
        </html>
      `;

      await generarPDFConPuppeteer(res, html, 'gestion-ventas-categoria.pdf');
    } catch (error) {
      console.error('Error en generarReporteGestionVentasCategoria:', error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Error al generar reporte de ventas por categoría' });
      }
    }
  },

  async generarReporteGestionRentabilidad(res: Response) {
    try {
      const productos = await prisma.product.findMany();
      // Simulamos un costo del 60% para calcular rentabilidad ya que no hay campo costo
      const rows = productos.map(p => {
        const precio = Number(p.precio);
        const costo = precio * 0.6;
        const margen = precio - costo;
        const porcentaje = (margen / precio) * 100;
        return `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${p.nombre}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">$${precio.toFixed(2)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">$${costo.toFixed(2)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; color: #10b981;">$${margen.toFixed(2)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${porcentaje.toFixed(1)}%</td>
          </tr>
        `;
      }).join('');

      const html = `
        <html>
          <head>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; }
              .header { border-bottom: 2px solid #1e40af; padding-bottom: 10px; margin-bottom: 20px; }
              h1 { color: #1e40af; font-size: 22px; }
              table { width: 100%; border-collapse: collapse; }
              th { background: #f8fafc; color: #64748b; font-size: 12px; text-transform: uppercase; padding: 10px; text-align: left; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Reporte de Rentabilidad por Producto</h1>
              <p style="font-size: 12px; color: #64748b;">${EMPRESA.nombre} | RUC: ${EMPRESA.ruc}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Precio Venta</th>
                  <th>Costo Est.</th>
                  <th>Margen Bruto</th>
                  <th>% Margen</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </body>
        </html>
      `;
      await generarPDFConPuppeteer(res, html, 'rentabilidad-productos.pdf');
    } catch (error) {
      console.error('Error en generarReporteGestionRentabilidad:', error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Error al generar reporte de rentabilidad' });
      }
    }
  },

  async generarReporteGestionCarritos(res: Response) {
    try {
      const carritos = await prisma.cart.findMany({ include: { items: true } });
      const ordenes = await prisma.order.findMany();
      
      const totalCarritos = carritos.length;
      const totalOrdenes = ordenes.length;
      const tasaConversion = (totalOrdenes / totalCarritos) * 100 || 0;
      const ticketPromedio = ordenes.reduce((acc, curr) => acc + Number(curr.total), 0) / totalOrdenes || 0;

      const html = `
        <html>
          <body style="font-family: sans-serif; padding: 40px;">
            <h1 style="color: #1e40af;">Análisis de Comportamiento de Carritos</h1>
            <div style="display: flex; gap: 20px; margin-top: 20px;">
              <div style="flex: 1; padding: 20px; background: #f0f9ff; border-radius: 10px;">
                <h3 style="margin: 0; color: #0369a1;">Tasa de Conversión</h3>
                <p style="font-size: 24px; font-weight: bold; color: #0369a1;">${tasaConversion.toFixed(1)}%</p>
              </div>
              <div style="flex: 1; padding: 20px; background: #ecfdf5; border-radius: 10px;">
                <h3 style="margin: 0; color: #047857;">Ticket Promedio</h3>
                <p style="font-size: 24px; font-weight: bold; color: #047857;">$${ticketPromedio.toFixed(2)}</p>
              </div>
            </div>
            <div style="margin-top: 30px;">
              <p>Total carritos creados: ${totalCarritos}</p>
              <p>Total compras finalizadas: ${totalOrdenes}</p>
              <p>Carritos abandonados: ${totalCarritos - totalOrdenes}</p>
            </div>
          </body>
        </html>
      `;
      await generarPDFConPuppeteer(res, html, 'comportamiento-carritos.pdf');
    } catch (error) {
      res.status(500).send('Error');
    }
  },

  async generarReporteGestionClientes(res: Response) {
    try {
      const clientes = await prisma.user.findMany({
        where: { rol: 'CLIENTE' },
        include: { ordenes: true }
      });

      const rows = clientes.map(c => {
        let segmento = "NUEVO";
        if (c.ordenes.length > 5) segmento = "VIP";
        else if (c.ordenes.length > 1) segmento = "RECURRENTE";
        else if (c.ordenes.length === 0) segmento = "INACTIVO";

        return `
          <tr>
            <td>${c.nombre}</td>
            <td>${c.email}</td>
            <td>${c.ordenes.length}</td>
            <td style="font-weight: bold;">${segmento}</td>
          </tr>
        `;
      }).join('');

      const html = `
        <html>
          <body style="font-family: sans-serif; padding: 30px;">
            <h1 style="color: #1e40af;">Segmentación de Clientes</h1>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <thead>
                <tr style="background: #f1f5f9;">
                  <th style="padding: 10px; text-align: left;">Cliente</th>
                  <th style="padding: 10px; text-align: left;">Email</th>
                  <th style="padding: 10px; text-align: left;">Órdenes</th>
                  <th style="padding: 10px; text-align: left;">Segmento</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </body>
        </html>
      `;
      await generarPDFConPuppeteer(res, html, 'reporte-clientes.pdf');
    } catch (error) {
      res.status(500).send('Error');
    }
  },

  async generarReporteGestionRotacion(res: Response) {
    try {
      const productos = await prisma.product.findMany({
        include: { orderItems: true }
      });

      const rows = productos.map(p => {
        const vendidos = p.orderItems.reduce((acc, curr) => acc + curr.cantidad, 0);
        const stockInicial = p.stock + vendidos;
        const rotacion = (vendidos / stockInicial) * 100 || 0;

        return `
          <tr>
            <td>${p.nombre}</td>
            <td>${p.categoria}</td>
            <td>${vendidos}</td>
            <td>${p.stock}</td>
            <td>${rotacion.toFixed(1)}%</td>
          </tr>
        `;
      }).join('');

      const html = `
        <html>
          <body style="font-family: sans-serif; padding: 30px;">
            <h1 style="color: #1e40af;">Rotación de Inventario</h1>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f8fafc;">
                  <th>Producto</th><th>Categoría</th><th>Vendidos</th><th>Stock</th><th>Índice Rotación</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </body>
        </html>
      `;
      await generarPDFConPuppeteer(res, html, 'rotacion-inventario.pdf');
    } catch (error) {
      res.status(500).send('Error');
    }
  },

  async generarReporteGestionIngresosCostos(res: Response) {
    try {
      const ordenes = await prisma.order.findMany({
        where: { estado: 'PAGADO' }
      });

      const ingresos = ordenes.reduce((acc, curr) => acc + Number(curr.total), 0);
      const costos = ingresos * 0.65; // Simulado
      const utilidad = ingresos - costos;

      const html = `
        <html>
          <body style="font-family: sans-serif; padding: 40px; text-align: center;">
            <h1 style="color: #1e40af;">Estado de Resultados (Ingresos vs Costos)</h1>
            <div style="margin: 40px auto; width: 300px; text-align: left; background: #f8fafc; padding: 20px; border-radius: 10px;">
              <p>Ingresos Totales: <span style="float: right;">$${ingresos.toFixed(2)}</span></p>
              <p>Costos de Ventas: <span style="float: right;">$${costos.toFixed(2)}</span></p>
              <hr>
              <p style="font-weight: bold; font-size: 18px; color: #10b981;">Utilidad Bruta: <span style="float: right;">$${utilidad.toFixed(2)}</span></p>
            </div>
          </body>
        </html>
      `;
      await generarPDFConPuppeteer(res, html, 'ingresos-vs-costos.pdf');
    } catch (error) {
      res.status(500).send('Error');
    }
  }
};
