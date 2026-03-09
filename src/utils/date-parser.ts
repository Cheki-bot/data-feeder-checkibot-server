export const parseCustomDateToISO = (dateStr: string): string | null => {
  try {
    // 1. Limpiamos el ruido
    const parts = dateStr.split(',');
    if (parts.length < 2) return null;

    const cleanStr = parts[1].replace(/[\u2013\u2014-]/g, ' ').trim(); // "03/06/2026 17:57"

    // 2. Separamos las piezas
    const [datePart, timePart] = cleanStr.split(/\s+/);

    // CAMBIO CLAVE AQUÍ:
    // Si el string es "03/06/2026", asignamos 03 a month y 06 a day
    const [month, day, year] = datePart.split('/').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);

    // 3. Creamos el objeto Date
    // month - 1 porque Marzo (3) debe ser 2 en JS
    const localDate = new Date(year, month - 1, day, hours, minutes);

    if (isNaN(localDate.getTime())) return null;

    // 4. Retornamos el ISO (UTC-0)
    // Esto devolverá "2026-03-06T21:57:00.000Z"
    return localDate.toISOString();
  } catch (e) {
    console.error(e);
    return null;
  }
};
