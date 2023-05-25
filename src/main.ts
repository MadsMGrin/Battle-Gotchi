import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import * as config from '../../firebaseconfig.js';
import 'firebase/compat/auth';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { FirebaseInitService } from './app/fire.service';

firebase.initializeApp(config.firebaseConfig); // Initialize Firebase app

const firebaseInitService = new FirebaseInitService();

if (environment.useEmulators) {
  firebase.auth().useEmulator('http://localhost:9099');
  firebase.firestore().useEmulator('localhost', 8080);
}

firebaseInitService.firestore.useEmulator('localhost', 8080); // Initialize Firestore emulator

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic([{ provide: FirebaseInitService, useValue: firebaseInitService }])
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
