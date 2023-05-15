const functions = require("firebase-functions");
const admin = require("firebase-admin");
const app = require("express")();
const cors = require("cors");

admin.initializeApp({
  projectId: 'battlegotchi-63c2e',
  databaseURL: 'http://localhost:8080',
});

app.use(cors());
exports.api = functions.https.onRequest(app);
// used to delete any duplicate username document that maybe created
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

// Get all online users
app.get('/onlineusers', async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection('users').where('status', '==', 'online').get();
    const onlineUsers = snapshot.docs.map(doc => doc.data());
    functions.logger.log(onlineUsers);
    res.json(onlineUsers);
  } catch (error) {
    console.error('Error retrieving online users:', error);
    res.status(500).json({ error: 'Failed to retrieve online users' });
  }
});

exports.onUserRegister = functions.auth
  .user()
  .onCreate((user, context) => {
    admin.firestore().collection("gotchi").add({
      user: user.uid,
      hunger: 50,
      sleep: 50,
      cleanliness: 50,
      health: 50,
      strength: 0,
      dexterity: 0,
      stamina: 0,
    })
  })



