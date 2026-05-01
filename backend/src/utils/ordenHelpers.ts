export const calcularImpuestos = (subtotal: number) => {
  return subtotal * 0.15; // 15% IVA
};

export const generarCodigoOrden = async () => {
  return 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};
