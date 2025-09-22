// p.ej. src/config/google.ts
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: 'TU_WEB_CLIENT_ID.apps.googleusercontent.com', // el mismo que en Google Console
  offlineAccess: true,
});