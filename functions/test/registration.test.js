"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { validateRegistration, submitRegistration } = require("../registration");

const valid = () => ({
  nombre: "Alumno de prueba", correo: "alumno@example.com", telefono: "+51 999999999",
  edad: 20, programa: "musica", dia: "lunes", horario: "17:00-18:30",
  mensaje: "Quiero aprender piano", consentimiento: "acepto",
});
const request = () => ({
  auth: { uid: "verified-google-uid", token: { firebase: { sign_in_provider: "google.com" } } },
  data: { registration: valid(), turnstileToken: "test-only-token" },
});
function dependencies(result = { success: true, hostname: "leninasto.github.io", action: "contacto" }) {
  const writes = [], verifications = [];
  return {
    secret: "test-only-secret", hostnames: ["leninasto.github.io", "localhost"], writes, verifications,
    fetchImpl: async (url, options) => { verifications.push({url, options}); return { ok: true, json: async () => result }; },
    writeRegistration: async data => { writes.push(data); return "new-record-id"; },
  };
}
async function rejectsWithoutWrite(req, deps, code) {
  await assert.rejects(() => submitRegistration(req, deps), error => error.code === code);
  assert.equal(deps.writes.length, 0);
}

test("accepts Google + verified Turnstile; stores verified UID and normalized fields", async () => {
  const req = request(), deps = dependencies();
  req.data.registration.nombre = "  Alumno de prueba  ";
  assert.deepEqual(await submitRegistration(req, deps), { id: "new-record-id" });
  assert.equal(deps.writes[0].uid, req.auth.uid);
  assert.equal(deps.writes[0].nombre, "Alumno de prueba");
  assert.equal(deps.writes[0].turnstileToken, undefined);
  assert.equal(deps.writes[0].secret, undefined);
  assert.equal(deps.verifications[0].url, "https://challenges.cloudflare.com/turnstile/v0/siteverify");
  assert.equal(deps.verifications[0].options.method, "POST");
  assert.equal(deps.verifications[0].options.body.get("response"), req.data.turnstileToken);
});

test("rejects unsigned requests before contacting Cloudflare", async () => {
  const req = request(), deps = dependencies(); delete req.auth;
  await rejectsWithoutWrite(req, deps, "unauthenticated");
  assert.equal(deps.verifications.length, 0);
});
test("rejects anonymous or password sessions", async () => {
  for (const provider of ["anonymous", "password", undefined]) {
    const req = request(), deps = dependencies(); req.auth.token.firebase.sign_in_provider = provider;
    await rejectsWithoutWrite(req, deps, "permission-denied");
    assert.equal(deps.verifications.length, 0);
  }
});
for (const [name, change] of [
  ["spoofed UID", data => data.uid = "someone-else"],
  ["spoofed server timestamp", data => data.createdAt = "yesterday"],
  ["missing consent", data => data.consentimiento = ""],
  ["invalid email", data => data.correo = "not-an-email"],
  ["email containing whitespace", data => data.correo = "a b@example.com"],
  ["invalid phone", data => data.telefono = "abcdefghi"],
  ["short name", data => data.nombre = "ab"],
  ["long message", data => data.mensaje = "x".repeat(501)],
  ["unknown programme", data => data.programa = "unknown"],
  ["Sunday", data => data.dia = "domingo"],
  ["Saturday afternoon", data => data.dia = "sabado"],
  ["invented time", data => data.horario = "03:00-05:00"],
  ["underage", data => data.edad = 4],
  ["over age limit", data => data.edad = 100],
  ["noninteger age", data => data.edad = 20.5],
  ["string age", data => data.edad = "20"],
  ["absent field", data => delete data.nombre],
]) {
  test(`rejects ${name} before verification or writes`, async () => {
    const req = request(), deps = dependencies(); change(req.data.registration);
    await rejectsWithoutWrite(req, deps, "invalid-argument");
    assert.equal(deps.verifications.length, 0);
  });
}
test("accepts every advertised day/time combination and valid age boundaries", () => {
  for (const dia of ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"])
    for (const horario of dia === "sabado" ? ["09:00-10:30", "11:00-12:30"] : ["09:00-10:30", "11:00-12:30", "15:00-16:30", "17:00-18:30"])
      for (const edad of [5, 99]) assert.doesNotThrow(() => validateRegistration({...valid(), dia, horario, edad}));
});
for (const token of ["", undefined, 42, "x".repeat(2049)]) {
  test(`rejects invalid challenge token (${typeof token}, length ${token?.length || 0})`, async () => {
    const req = request(), deps = dependencies(); req.data.turnstileToken = token;
    await rejectsWithoutWrite(req, deps, "failed-precondition");
    assert.equal(deps.verifications.length, 0);
  });
}
for (const result of [
  {success:false,"error-codes":["timeout-or-duplicate"]},
  {success:true,hostname:"attacker.example",action:"contacto"},
  {success:true,hostname:"leninasto.github.io",action:"other-form"},
  {success:true}, null,
]) {
  test(`rejects failed, replayed or mismatched verification ${JSON.stringify(result)}`, async () => {
    const deps = dependencies(result);
    await rejectsWithoutWrite(request(), deps, "failed-precondition");
  });
}
test("rejects missing server secret without contacting Cloudflare", async () => {
  const deps = dependencies(); deps.secret = "";
  await rejectsWithoutWrite(request(), deps, "unavailable");
  assert.equal(deps.verifications.length, 0);
});
for (const response of ["network-error", "http-error", "invalid-json"]) {
  test(`does not write on ${response}`, async () => {
    const deps = dependencies();
    deps.fetchImpl = async () => {
      if (response === "network-error") throw new Error("Connection failed");
      return {ok: response !== "http-error", json: async () => {throw new SyntaxError("Invalid JSON")}};
    };
    await rejectsWithoutWrite(request(), deps, "unavailable");
  });
}
test("does not report success when database storage fails", async () => {
  const deps = dependencies(); deps.writeRegistration = async () => {throw new Error("Database offline")};
  await assert.rejects(() => submitRegistration(request(), deps), /Database offline/);
});
