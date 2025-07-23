export function calcularITP(precio: number, porcentaje: number = 6): number {
  if (!precio || precio <= 0) return 0
  return (((precio * porcentaje) / 100) * 100) / 100
}

export function calcularIVA(precio: number, porcentaje: number = 10): number {
  if (!precio || precio <= 0) return 0
  return (((precio * porcentaje) / 100) * 100) / 100
}
