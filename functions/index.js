
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();
const cors = require('cors');

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
    const onlineUsers = snapshot.docs.map(doc => {
      const data = doc.data();
      // need to return the id as we need it to send battle request.
      return { username: data.username, uid: doc.id }
    });
    functions.logger.log(onlineUsers);
    res.json(onlineUsers);
  } catch (error) {
    console.error('Error retrieving online users:', error);
    res.status(500).json({ error: 'Failed to retrieve online users' });
  }
});


// method used for sending battleNotifcation to another user
app.get('/battlenotifications/:receiverId', async (req, res) => {
  try {
    const receiverId = req.params.receiverId;
    // Retrieve battle notifications for the receiverId
    const notificationsSnapshot = await admin
      .firestore()
      .collection('notifications')
      .where('receiverId', '==', receiverId)
      .orderBy('timestamp', 'desc')
      .get();

    const notifications = [];
    for (const doc of notificationsSnapshot.docs) {
      const notification = doc.data();
      // Retrieve sender information
      const senderSnapshot = await admin
        .firestore()
        .collection('users')
        .doc(notification.senderId)
        .get();

      const sender = senderSnapshot.data();
      notifications.push({
        sender: sender,
        message: notification.message,
        timestamp: notification.timestamp,
      });
    }
    res.json(notifications);
  } catch (error) {
    console.error('Error retrieving battle notifications:', error);
    res.status(500).json({ error: 'Failed to retrieve battle notifications' });
  }
});

// method used for sending battleNotifcation to another user
exports.sendBattleNotification = functions.firestore
  .document('battleRequests/{requestId}')
  .onCreate(async (snap, context) => {
    const battleRequest = snap.data();
    // creating
    await admin.firestore().collection('notifications').add({
      receiverId: battleRequest.receiverId,
      senderId: battleRequest.senderId,
      type: 'battleRequest',
      status: 'unread',
      message: 'I wish to thee, thus thou dare accept?',
      timestamp: Firestore.FieldValue.serverTimestamp()
    });

    console.log('Notification sent successfully');
  });
