import { firebaseConfig, functionsRegion } from "./firebase-config.js";

let connectionPromise;
export function connectFirebase() {
  if (!connectionPromise) connectionPromise = initialize().catch(error => {
    connectionPromise = undefined;
    throw error;
  });
  return connectionPromise;
}

async function initialize() {
  const base = "https://www.gstatic.com/firebasejs/13.0.0/";
  const [appSdk, authSdk, databaseSdk, functionsSdk] = await Promise.all([
    import(base + "firebase-app.js"), import(base + "firebase-auth.js"),
    import(base + "firebase-firestore.js"), import(base + "firebase-functions.js"),
  ]);
  const app = appSdk.initializeApp(firebaseConfig);
  const auth = authSdk.getAuth(app);
  await authSdk.setPersistence(auth, authSdk.browserSessionPersistence);
  await auth.authStateReady();
  return {auth, database: databaseSdk.getFirestore(app), authSdk, databaseSdk,
    functions: functionsSdk.getFunctions(app, functionsRegion), functionsSdk};
}

export async function signInWithGoogle() {
  const firebase = await connectFirebase();
  const provider = new firebase.authSdk.GoogleAuthProvider();
  provider.setCustomParameters({prompt: "select_account"});
  return firebase.authSdk.signInWithPopup(firebase.auth, provider);
}

export async function saveRegistration(data, turnstileToken) {
  const firebase = await connectFirebase();
  const user = firebase.auth.currentUser;
  if (!user || !user.providerData.some(provider => provider.providerId === "google.com")) {
    throw Object.assign(new Error("Inicia sesión con Google antes de enviar tu solicitud."), {code: "app/auth-required"});
  }
  if (!turnstileToken) throw Object.assign(new Error("Completa la verificación de Cloudflare antes de enviar."), {code: "app/captcha-required"});
  const submit = firebase.functionsSdk.httpsCallable(firebase.functions, "submitRegistration", {timeout: 20000});
  const result = await submit({registration: data, turnstileToken});
  if (typeof result.data?.id !== "string" || !result.data.id) throw new Error("No registration confirmation");
  return result.data;
}
