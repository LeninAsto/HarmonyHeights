"use strict";

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret, defineString } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const logger = require("firebase-functions/logger");
const { submitRegistration, RegistrationError } = require("./registration");

initializeApp();
const turnstileSecret = defineSecret("TURNSTILE_SECRET_KEY");
const allowedHostnames = defineString("TURNSTILE_HOSTNAMES", {
  default: "leninasto.github.io,localhost,127.0.0.1",
  description: "Comma-separated hostnames registered in the Turnstile widget; no URLs or ports.",
});

exports.submitRegistration = onCall({
  region: "us-central1",
  secrets: [turnstileSecret],
  cors: ["https://leninasto.github.io", /^http:\/\/localhost(?::\d+)?$/, /^http:\/\/127\.0\.0\.1(?::\d+)?$/],
  maxInstances: 5,
  timeoutSeconds: 30,
}, async request => {
  try {
    return await submitRegistration(request, {
      secret: turnstileSecret.value(),
      hostnames: allowedHostnames.value().split(",").map(host => host.trim()).filter(Boolean),
      writeRegistration: async data => {
        const doc = await getFirestore().collection("solicitudes").add({
          ...data, createdAt: FieldValue.serverTimestamp(),
        });
        return doc.id;
      },
    });
  } catch (error) {
    if (error instanceof RegistrationError) throw new HttpsError(error.code, error.message);
    // Do not log request payloads, captcha tokens, or secrets.
    logger.error("No se pudo guardar una solicitud verificada.");
    throw new HttpsError("internal", "No se pudo confirmar el envío. Inténtalo más tarde.");
  }
});
