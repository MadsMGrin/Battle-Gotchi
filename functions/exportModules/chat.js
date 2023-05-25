const admin = require("firebase-admin");



const sendMessage = async (req, res) => {
  try {
    const userId = req.body.userId;
    const message = req.body.message;
    const timestamp = new Date(); // Get the current timestamp

    const db = admin.firestore();

    // Get the user's name based on the user ID
    const userDoc = await db.collection('users').doc(userId).get();
    const username = userDoc.data().username;

    // Save the chat message with the user's name and timestamp to Firestore
    await db.collection('chat').add({
      userId: userId,
      username: username,
      message: message,
      timestamp: timestamp
    });

    res.status(200).send('Chat message sent successfully');
  } catch (error) {
    console.error('Error sending chat message:', error);
    res.status(500).send('Failed to send chat message');
  }
}
const chatMessage = async (req, res) => {
  try {
    const db = admin.firestore();
    const chatRef = db.collection('chat').orderBy('timestamp', 'desc').limit(100);

    const initialSnapshot = await chatRef.get();
    const chatMessages = initialSnapshot.docs
      .map((doc) => ({
        message: doc.data().message,
        username: doc.data().username, // Include the 'username' field
      }))
      .reverse();

    res.status(200).json(chatMessages);

    chatRef.onSnapshot((snapshot) => {
      const updatedChatMessages = snapshot.docs
        .map((doc) => ({
          // the message and username
          message: doc.data().message,
          username: doc.data().username,
        }))
        .reverse();

      res.status(200).json(updatedChatMessages);
    });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ error: 'Failed to fetch chat messages' });
  }
}

const onlineUserItemList = async (req, res) => {
  try {
    const userId = req.params.id;

    const gotchiDoc = await admin.firestore().collection('gotchi').doc(userId).get();
    if (!gotchiDoc.exists) {
      return res.status(404).json({ error: 'Gotchi not found' });
    }

    const gotchiData = gotchiDoc.data();
    const items = gotchiData?.items || [];

    // Filter the items based on the 'inUse' value being false
    const filteredItems = items.filter((item) => item.inUse === false);

    res.json({ userId, items: filteredItems });
  } catch (error) {
    console.error("Error retrieving items for online user:", error);
    res.status(500).json({ error: "Failed to retrieve items for online user" });
  }
}
const onlineUserList = async (req, res) => {
    try {
      const snapshot = await admin.firestore().collection('users').where('status', '==', 'online').get();
      const onlineUsers = snapshot.docs.map(doc => {
        const data = doc.data();
        // need to return the id as we need it to send battle request.
        return {username: data.username, uid: doc.id}
      });
      res.json(onlineUsers).send;
    } catch (error) {
      console.error("Error retrieving online users:", error);
      res.status(500).json({error: "Failed to retrieve online users"});
    }
  }

module.exports = {
  sendMessage,
  chatMessage,
  onlineUserItemList,
  onlineUserList,
}
