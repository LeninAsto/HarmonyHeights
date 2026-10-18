import { connectFirebase } from "./firebase.js";

const loginForm = document.querySelector("#loginForm");
const loginPanel = document.querySelector("#loginPanel");
const recordsPanel = document.querySelector("#recordsPanel");
const status = document.querySelector("#adminStatus");
const search = document.querySelector("#recordSearch");
const program = document.querySelector("#recordProgram");
const exportButton = document.querySelector("#exportButton");
const refreshButton = document.querySelector("#refreshButton");
const programNames = {
  musica: "Música",
  danza: "Danza",
  escena: "Laboratorio escénico",
  orientacion: "Orientación",
};
const scheduleNames = { manana: "Mañana", tarde: "Tarde", sabado: "Sábado" };
let firebase;
let records = [];
let visibleRecords = [];
let currentUid = null;

startAdmin();

async function startAdmin() {
  const button = loginForm.querySelector("button");
  button.disabled = true;
  try {
    firebase = await connectFirebase();
    firebase.authSdk.onAuthStateChanged(firebase.auth, checkAccess);
  } catch (error) {
    showStatus(error.message || "No se pudo conectar con Firebase.", "error");
  } finally {
    button.disabled = false;
  }
}

async function checkAccess(user) {
  clearRecords();
  document.querySelector("#adminAccount").textContent = "";
  currentUid = null;
  loginPanel.hidden = false;
  recordsPanel.hidden = true;
  if (!user || user.isAnonymous) return;
  currentUid = user.uid;
  const checkedUid = user.uid;
  try {
    const adminRef = firebase.databaseSdk.doc(
      firebase.database,
      "admins",
      user.uid,
    );
    const admin = await firebase.databaseSdk.getDoc(adminRef);
    if (currentUid !== checkedUid) return;
    if (!admin.exists()) {
      showStatus(
        "Tu cuenta no tiene acceso al panel. El propietario debe autorizar tu UID en Firebase.",
        "error",
      );
      await firebase.authSdk.signOut(firebase.auth);
      return;
    }
    status.className = "form-status";
    loginPanel.hidden = true;
    recordsPanel.hidden = false;
    document.querySelector("#adminAccount").textContent = user.email;
    await loadRecords();
  } catch (error) {
    if (currentUid === checkedUid)
      showStatus(
        "No se pudo verificar el acceso. Revisa la conexión y las reglas de Firestore.",
        "error",
      );
  }
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = loginForm.querySelector("button");
  button.disabled = true;
  button.textContent = "Ingresando…";
  try {
    if (!firebase) {
      await startAdmin();
      if (!firebase) return;
    }
    await firebase.authSdk.signInWithEmailAndPassword(
      firebase.auth,
      document.querySelector("#adminEmail").value.trim(),
      document.querySelector("#adminPassword").value,
    );
    loginForm.reset();
  } catch (error) {
    showStatus(
      "No se pudo iniciar sesión. Revisa tus credenciales, la conexión y que el acceso por correo esté habilitado.",
      "error",
    );
  } finally {
    button.disabled = false;
    button.textContent = "Ingresar";
  }
});

document.querySelector("#logoutButton").addEventListener("click", async () => {
  try {
    await firebase.authSdk.signOut(firebase.auth);
    showStatus("Sesión cerrada.", "success");
  } catch (error) {
    showStatus("No se pudo cerrar sesión. Inténtalo otra vez.", "error");
  }
});

refreshButton.addEventListener("click", loadRecords);
search.addEventListener("input", renderRecords);
program.addEventListener("change", renderRecords);

async function loadRecords() {
  const requestedUid = currentUid;
  if (!requestedUid) return;
  refreshButton.disabled = true;
  exportButton.disabled = true;
  clearRecords();
  document.querySelector("#recordCount").textContent = "Cargando registros…";
  try {
    const sdk = firebase.databaseSdk;
    const request = sdk.query(
      sdk.collection(firebase.database, "solicitudes"),
      sdk.orderBy("createdAt", "desc"),
      sdk.limit(500),
    );
    const result = await sdk.getDocs(request);
    if (currentUid !== requestedUid) return;
    records = [];
    for (const entry of result.docs) {
      const record = entry.data();
      record.id = entry.id;
      records.push(record);
    }
    status.className = "form-status";
    renderRecords();
  } catch (error) {
    if (currentUid !== requestedUid) return;
    document.querySelector("#recordCount").textContent =
      "No se pudieron cargar los registros.";
    showStatus(
      "No se pudieron consultar las solicitudes. Revisa tu conexión y los permisos de Firestore.",
      "error",
    );
  } finally {
    refreshButton.disabled = false;
  }
}

function renderRecords() {
  const body = document.querySelector("#recordsBody");
  body.replaceChildren();
  visibleRecords = [];
  const query = search.value.trim().toLocaleLowerCase("es");
  for (const record of records) {
    const matchesText = (record.nombre + " " + record.correo)
      .toLocaleLowerCase("es")
      .includes(query);
    const matchesProgram =
      program.value === "todos" || record.programa === program.value;
    if (!matchesText || !matchesProgram) continue;
    visibleRecords.push(record);
    const row = document.createElement("tr");
    const values = [
      formatDate(record),
      record.nombre,
      record.correo,
      record.telefono,
      record.edad,
      programNames[record.programa],
      scheduleNames[record.horario],
      record.mensaje,
    ];
    for (const value of values) {
      const cell = document.createElement("td");
      cell.textContent = value || "—";
      row.append(cell);
    }
    body.append(row);
  }
  document.querySelector("#recordCount").textContent =
    visibleRecords.length +
    " solicitudes visibles de " +
    records.length +
    " cargadas.";
  exportButton.disabled = visibleRecords.length === 0;
  if (visibleRecords.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 8;
    cell.textContent = "No hay solicitudes para mostrar con estos filtros.";
    row.append(cell);
    body.append(row);
  }
}

function clearRecords() {
  records = [];
  visibleRecords = [];
  document.querySelector("#recordsBody").replaceChildren();
  exportButton.disabled = true;
}

function formatDate(record) {
  if (!record.createdAt) return "Pendiente";
  return record.createdAt
    .toDate()
    .toLocaleString("es-PE", { timeZone: "America/Lima" });
}

function csvCell(value) {
  let text = String(value ?? "");
  if (/^[\s\u0000-\u001f]*[=+@-]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}

exportButton.addEventListener("click", () => {
  if (visibleRecords.length === 0) return;
  const rows = [
    [
      "Código",
      "Fecha (Lima)",
      "Nombre",
      "Correo",
      "Teléfono",
      "Edad",
      "Programa",
      "Horario",
      "Objetivo",
      "Consentimiento",
    ],
  ];
  for (const record of visibleRecords) {
    rows.push([
      record.id,
      formatDate(record),
      record.nombre,
      record.correo,
      record.telefono,
      record.edad,
      programNames[record.programa],
      scheduleNames[record.horario],
      record.mensaje,
      record.consentimiento,
    ]);
  }
  let csv = "\uFEFF";
  for (const row of rows) csv += row.map(csvCell).join(",") + "\r\n";
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8;" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download =
    "harmony-solicitudes-" + new Date().toISOString().slice(0, 10) + ".csv";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
});

function showStatus(message, type) {
  status.textContent = message;
  status.className = "form-status show " + type;
  status.focus();
}
