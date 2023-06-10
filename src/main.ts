import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import * as config from '../firebaseconfig.js';
import 'firebase/compat/auth';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { FirebaseInitService } from './app/fire.service';

firebase.initializeApp(config.firebaseConfig);
// we initial the base service
const firebaseInitService = new FirebaseInitService();
// we start up the emulators, else it will complain that its already running
if (environment.useEmulators) {
  firebase.auth().useEmulator('http://localhost:9099');
  firebase.firestore().useEmulator('localhost', 8080);
}
// we are telling firestore that it need to use the emulator
firebaseInitService.firestore.useEmulator('localhost', 8080);

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic([{ provide: FirebaseInitService, useValue: firebaseInitService }])
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
