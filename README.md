🛒 Sistema Web de E-Commerce — Resumen Ejecutivo
🏗️ Stack Tecnológico
Frontend: React 18+ con TypeScript 5+, Vite, React Router v6, Zustand + TanStack Query, Recharts, shadcn/ui + Tailwind CSS, React Hook Form + Zod, Axios, TanStack Table, jsPDF.
Backend: Node.js 20 LTS+ con TypeScript, Express 4.18+, Prisma 5+ (ORM), Zod (validación), JWT + bcrypt, PDFKit + Puppeteer (reportes), Winston (logging), Swagger/OpenAPI 3.0, Jest + Supertest.
Base de Datos: PostgreSQL 16+, nombres en español/snake_case, prefijos por módulo (cat_, ord_, inv_, cli_, seg_), eliminación lógica, auditoría completa.

🧱 Arquitectura
3 capas desacopladas: React SPA → Express API (RESTful /api/v1/) → PostgreSQL. Patrón Repository-Service-Controller. El frontend nunca accede directamente a la base de datos.

📦 Módulos Funcionales
MóduloFunciones claveCatálogoCRUD productos, galería, filtros, búsqueda fuzzy, variantes, paginaciónCarritoAgregar/editar/eliminar items, cupones, merge local↔remoto al login, reserva de stockCheckoutWizard de 5 pasos: login → dirección → envío → pago → confirmaciónÓrdenesHistorial, cambio de estados, devoluciones, factura PDF, trackingInventarioControl de stock, movimientos, alertas de stock bajo, órdenes a proveedoresClientesRegistro, perfil, lista de deseos, reseñas, segmentación RFM

📊 Dashboard y Estadísticas
KPIs: ventas totales, ticket promedio, tasa de conversión, abandono de carrito, productos agotados, clientes nuevos, órdenes pendientes.
Gráficos (Recharts): área (ventas diarias), barras (ventas por categoría), pie (órdenes por estado), barras apiladas (ingresos vs costos), líneas (tendencia abandono), barras horizontales (top 10 productos), embudo de conversión.
Estadísticas avanzadas: tendencia con regresión, heatmap por hora/día, análisis ABC, análisis RFM, cohorte de clientes, correlación descuento↔venta.

📄 Reportes PDF
Operacionales (PDFKit): listado de órdenes, inventario valorizado, movimientos de stock, productos con stock bajo, pagos recibidos, devoluciones, facturas individuales.
Gestión (Puppeteer): rentabilidad por producto, ventas por categoría, comportamiento de carritos, reporte de clientes, rotación de inventario, ingresos vs costos.

👥 Roles y Seguridad
RolAccesoAdministradorTotal: productos, inventario, órdenes, clientes, reportes, configuraciónGerente de VentasDashboard, reportes de ventas, órdenes, cupones, clientes (solo lectura)Gerente de InventarioProductos, stock, proveedores, órdenes de compraVendedor/AtenciónVer órdenes, estados básicos, generar facturasClienteComprar, historial, perfil, lista de deseosInvitadoSolo navegar y agregar al carrito (localStorage)
Seguridad: JWT (access 15 min + refresh 7 días), bcrypt salt 12, RBAC por middleware, rate limiting, Helmet.js, validación Zod en todos los endpoints, auditoría de acciones críticas.

⚙️ Instalación (resumen)

Requisitos: Node.js 20+, PostgreSQL 16+, npm 10+
Clonar repo → configurar .env (DATABASE_URL, JWT secrets, SMTP)
Crear DB + extensión pg_trgm → ejecutar sql/create_database.sql
npx prisma generate + npx prisma db seed
npm run dev → backend en :4000, frontend en :5173
Producción: npm run build o docker-compose up -d

Credenciales semilla: admin@ecommerce.com / Admin123!
