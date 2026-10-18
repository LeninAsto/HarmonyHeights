// Preferencias de referencia, no reservas. Confirmar con la academia antes de publicar.
export const dayNames = {
  lunes: "Lunes", martes: "Martes", miercoles: "Miércoles",
  jueves: "Jueves", viernes: "Viernes", sabado: "Sábado",
};
const weekdays = ["09:00-10:30", "11:00-12:30", "15:00-16:30", "17:00-18:30"];
export const schedules = Object.fromEntries(Object.keys(dayNames).map(day => [
  day, day === "sabado" ? ["09:00-10:30", "11:00-12:30"] : [...weekdays],
]));
export function formatSchedule(record) {
  const legacy = {manana: "Mañana", tarde: "Tarde", sabado: "Sábado"};
  if (!record.dia) return legacy[record.horario] || record.horario || "—";
  return `${dayNames[record.dia] || record.dia} · ${record.horario.replace("-", " – ")} (Lima)`;
}
