const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.enforceUniqueUsername = functions.firestore
  .document('usernames/{username}')
  .onCreate(async (snap, context) => {
    const username = context.params.username;

    const db = admin.firestore();

    // Check if the username already exists in the collection
    const userSnapshot = await db.collection('users').where('username', '==', username).get();

    if (userSnapshot.empty) {
      // If the username doesn't exist, create a new document
      await db.collection('users').doc(username).set({ username: username });
    } else {
      // If the username already exists, delete the new document
      await snap.ref.delete();
      throw new functions.https.HttpsError('already-exists', 'This username already exists');
    }
  });
