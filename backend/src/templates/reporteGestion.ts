export const generarHTMLReporteGestion = (data: any) => {
  return `
    <html>
      <head>
        <style>
          body { font-family: sans-serif; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>Reporte de Gestión de Ventas por Categoría</h1>
        <table>
          <thead>
            <tr>
              <th>Categoría</th>
              <th>Total Ventas</th>
            </tr>
          </thead>
          <tbody>
            ${data.map((item: any) => `
              <tr>
                <td>${item.nombre}</td>
                <td>$${item.total}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;
};
