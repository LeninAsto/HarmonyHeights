import { firebaseConfig } from "./firebase-config.js";

let connection;

export async function connectFirebase() {
  if (
    !firebaseConfig.apiKey ||
    !firebaseConfig.projectId ||
    !firebaseConfig.appId
  ) {
    throw new Error(
      "Firebase todavía no está configurado. Consulta la guía de instalación del proyecto.",
    );
  }
  if (connection) return connection;

  const appSdk = await import(
    "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js"
  );
  const authSdk = await import(
    "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js"
  );
  const databaseSdk = await import(
    "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js"
  );
  const app = appSdk.initializeApp(firebaseConfig);
  const auth = authSdk.getAuth(app);
  await authSdk.setPersistence(auth, authSdk.browserSessionPersistence);
  connection = {
    auth: auth,
    database: databaseSdk.getFirestore(app),
    authSdk: authSdk,
    databaseSdk: databaseSdk,
  };
  return connection;
}

export async function saveRegistration(data) {
  const firebase = await connectFirebase();
  if (!firebase.auth.currentUser) {
    await firebase.authSdk.signInAnonymously(firebase.auth);
  }
  data.uid = firebase.auth.currentUser.uid;
  data.createdAt = firebase.databaseSdk.serverTimestamp();
  const registrations = firebase.databaseSdk.collection(
    firebase.database,
    "solicitudes",
  );
  return firebase.databaseSdk.addDoc(registrations, data);
}
