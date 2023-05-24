const functions = require("firebase-functions");
const admin = require("firebase-admin");
const app = require("express")();
const cors = require("cors");
const {onSchedule} = require("firebase-functions/v2/scheduler");
const {every, timestamp, asapScheduler} = require("rxjs");
const {PromisePool} = require("promise-pool-executor");
const {Timestamp, FieldValue} = require("firebase-admin/firestore")
const {error} = require("firebase-functions/logger");
admin.initializeApp({
  projectId: "battlegotchi-63c2e",
  databaseURL: "http://localhost:8080",
});

const runtimeOpts = {
  timeoutSeconds: 120,
};

const wackyFirstNames = [
  "Wobbleflop",
  "Quirklesnort",
  "Bumblewink",
  "Zippitydoo",
  "Gobbledygook",
  "Whifflebottom",
  "Flapdoodle",
  "Skizzlefritz",
  "Quibblequack",
  "Bipsywhirly",
  "Snickerdoodle",
  "Noodlefizz",
  "Wigglesnatch",
  "Blibberblot",
  "Giggledorf",
  "Puddleflop",
  "Skibberjib",
  "Doodlewhack",
  "Snickerbop",
  "Quibbleflap",
  "Wiggletoes",
  "Bippitybop",
  "Wobblejinks",
  "Puddlesnort",
  "Skibberdoo",
  "Noodleblip",
  "Snickerflap",
  "Quibblewobble",
  "Blibberjinx",
  "Wobblewhack",
  "Bippityboo",
  "Skizzleflop",
  "Puddlesnicker",
  "Gobbledoodle",
  "Quirklefizz",
  "Snickerdink",
  "Zippitywink",
  "Bipsywhack",
  "Wigglefritz",
  "Doodlebop",
  "Skibberquack",
  "Noodlejib",
  "Blibberflap",
  "Quibblegook",
  "Snickerwhack",
  "Wobblegibble",
  "Gobbledysnort",
  "Skizzleblip",
  "Bippitysnicker",
  "Puddlefizz"
]

const wackyLastNames = [
  "Blunderfluff",
  "Muddlepants",
  "Wobblebottom",
  "Noodlewhisk",
  "Gigglesnort",
  "Quibblefizzle",
  "Flibberflap",
  "Zigzaggle",
  "Wobblegobble",
  "Whifflepuff",
  "Snickerdoodle",
  "Dingleberry",
  "Flippityflop",
  "Bumblefritz",
  "Squigglewump",
  "Puddlefuddle",
  "Snickersnatch",
  "Zippitydoodle",
  "Jibberjumble",
  "Wigglewig",
  "Bippitybop",
  "Splishsplash",
  "Whiskerwhack",
  "Quibblequack",
  "Fluffernutter",
  "Noodlehead",
  "Snortleflap",
  "Kookaburra",
  "Gobblefunk",
  "Fiddlesticks",
  "Whackadoodle",
  "Wobblewhack",
  "Squibblesnort",
  "Zigzagglebottom",
  "Bippityboo",
  "Jellybean",
  "Whimsywhack",
  "Flapdoodle",
  "Snicklefritz",
  "Flibberjibber",
  "Blubberwhip",
  "Wobblewink",
  "Snickerdink",
  "Quirklequack",
  "Gobbledygook",
  "Jabberwocky",
  "Squigglebottom",
  "Zippitydoo",
  "Noodlewhip",
  "Bumblefuddle",
  "Whiffleblip",
  "Kerfuffle",
  "Fluffernutter",
]



app.use(cors());
exports.api = functions.runWith(runtimeOpts).https.onRequest(app);
// used to delete any duplicate username document that maybe created
exports.enforceUniqueUsername = functions.firestore
  .document("usernames/{username}")
  .onCreate(async (snap, context) => {
    const username = context.params.username;

    const db = admin.firestore();

    // Check if the username already exists in the collection
    // eslint-disable-next-line
    const userSnapshot = await db.collection("users").where("username", "==", username).get();

    if (userSnapshot.empty) {
      // If the username doesn't exist, create a new document
      await db.collection("users").doc(username).set({username: username});
    } else {
      // If the username already exists, delete the new document
      await snap.ref.delete();
      // eslint-disable-next-line max-len
      throw new functions.https.HttpsError("already-exists", "This username already exists");
    }
  });

// Get all online users
app.get('/onlineusers', async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection('users').where('status', '==', 'online').get();
    const onlineUsers = snapshot.docs.map(doc => {
      const data = doc.data();
      // need to return the id as we need it to send battle request.
      return {username: data.username, uid: doc.id}
    });
    functions.logger.log(onlineUsers);
    res.json(onlineUsers);
  } catch (error) {
    console.error("Error retrieving online users:", error);
    res.status(500).json({error: "Failed to retrieve online users"});
  }
});
// used for fetching all items for an online users.
app.get('/onlineusers/:id/items', async (req, res) => {
  try {
    const userId = req.params.id;

    const gotchiDoc = await admin.firestore().collection('gotchi').doc(userId).get();
    if (!gotchiDoc.exists) {
      return res.status(404).json({ error: 'Gotchi not found' });
    }
    const gotchiData = gotchiDoc.data();
    const items = gotchiData?.items || {};

    res.json({ userId, items });
  } catch (error) {
    console.error("Error retrieving items for online user:", error);
    res.status(500).json({ error: "Failed to retrieve items for online user" });
  }
});



exports.onUserRegister = functions.auth
  .user()
  .onCreate((user, context) => {
    admin.firestore().collection("gotchi").doc(user.uid).set({
      user: user.uid,
      name: wackyFirstNames[Math.floor(Math.random() * wackyFirstNames.length)] + " " + wackyLastNames[Math.floor(Math.random() * wackyLastNames.length)],
      hunger: 50,
      sleep: 50,
      cleanliness: 50,
      health: 50,
      strength: 0,
      dexterity: 0,
      stamina: 0,
    });
  });





//// GOTCHI STATE MANIPULATION - START

app.post("/increaseSleep", async (req, res) => {
  const {reqId} = req.body;
  const db = admin.firestore();
  const querySnapshot = await db.collection("gotchi").where("user", "==", reqId).get();
  const docRef = querySnapshot.docs[0].ref;

  return db.runTransaction((transaction) => {
    // This code may get re-run multiple times if there are conflicts.
    return transaction.get(docRef).then((doc) => {
      if (doc.data().sleepTimeout >= Timestamp.now().toMillis() || !doc.exists || doc.data().timesSleptToday >= 2){
        throw new error("Failure")
      }
      const newSleep = doc.data().sleep >= 50 ? 100 : doc.data().sleep + 50;
      const newHealth = doc.data().health >= 75 ? 100 : doc.data().health + 25;
      transaction.set(docRef,{
          sleepTimeout: Timestamp.now().toMillis() + 7200000,
          timesSleptToday: FieldValue.increment(1),
          sleep: newSleep,
          health: newHealth,
        },
        {merge: true}
      )
    });
  }).then(() => {
    res.status(201).json({message: "all good"})
  }).catch((error) => {
    res.status(500).json({error: "failed to resolved maintainance"});
  });
});
app.post("/increaseHunger", async (req, res) => {
  const {reqId} = req.body;
  const db = admin.firestore();
  const querySnapshot = await db.collection("gotchi").where("user", "==", reqId).get();
  const docRef = querySnapshot.docs[0].ref;

  return db.runTransaction((transaction) => {
    // This code may get re-run multiple times if there are conflicts.
    return transaction.get(docRef).then((doc) => {
      if (doc.data().foodTimeout >= Timestamp.now().toMillis() || !doc.exists || doc.data().timesEatenToday >= 4){
        throw new error("Failure")
      }
      const newHunger = doc.data().hunger >= 75 ? 100 : doc.data().hunger + 25;
      const newHealth = doc.data().health >= 85 ? 100 : doc.data().health + 15;
      transaction.set(docRef,{
          foodTimeout: Timestamp.now().toMillis() + 2000,
          timesEatenToday: FieldValue.increment(1),
          hunger: newHunger,
          health: newHealth,
        },
        {merge: true}
      )
    });
  }).then(() => {
    res.status(201).json({message: "all good"})
  }).catch((error) => {
    res.status(500).json({error: "failed to resolved maintainance"});
  });
});

//This is a transaction test, we should mostly be doing transaction to avoid race conditions
app.post("/increaseCleanliness", async (req, res) => {
  const {reqId} = req.body;
  const db = admin.firestore();
  const querySnapshot = await db.collection("gotchi").where("user", "==", reqId).get();
  const docRef = querySnapshot.docs[0].ref;

  return db.runTransaction((transaction) => {
    // This code may get re-run multiple times if there are conflicts.
    return transaction.get(docRef).then((doc) => {
      if (doc.data().showerTimeout >= Timestamp.now().toMillis() || !doc.exists || doc.data().timesShoweredToday >= 3){
        throw new error("Failure")
      }
      const newClean = doc.data().cleanliness >= 25 ? 100 : doc.data().cleanliness + 75;
      const newHealth = doc.data().health >= 95 ? 100 : doc.data().health + 5;
      transaction.set(docRef,{
          showerTimeout: Timestamp.now().toMillis() + 2000,
          timesShoweredToday: FieldValue.increment(1),
          cleanliness: newClean,
          health: newHealth,
          timeLastShowered: Timestamp.now().toMillis(),
      },
      {merge: true}
      )
    });
  }).then(() => {
    res.status(201).json({message: "all good"})
  }).catch((error) => {
    res.status(500).json({error: "failed to resolved maintainance"});
  });
});

//This method is supposed to be a cron job however emulators make this impossible so keeping it on user creation for now for testing purposes
exports.statemodification = functions.auth.user().onCreate(async (user, context) => {
  const gotchis = await getAllGotchis();
  const promisePool = new PromisePool(
    () =>
      adjustGotchiValues(gotchis), 10,
  );
  logger.log("gotchi cleanup finished");
  await promisePool.start();

  async function adjustGotchiValues(gotchis) {
    const batch = admin.firestore().batch();

    gotchis.forEach((gotchi) => {
      const docRef = admin.firestore().collection('gotchi').doc(gotchi.id);
      const fieldValue = admin.firestore.FieldValue;

      batch.set(docRef, {
          // Example: Incrementing the 'health' and 'stamina' fields by 10
          health: fieldValue.increment(50),
          timesEatenToday: 0,
          timesSleptToday: 0,
          timesShoweredToday: 0,
          // Add more field increments here if needed
        },
        {merge: true},
      );
    });

    // Commit the batched updates
    await batch.commit();
  }
});
//// GOTCHI STATE MANIPULATION - END



// ITEM STUFF
app.post("/equipItem",async (req, res,) => {
  const itemType = req.body.itemType;
  const itemName = req.body.itemName;
  const db = admin.firestore();
  const querySnapshot = await db.collection("item")
    .where("itemType", "==",itemType)
    .where("itemName","==",itemName)
    .get();
  const docRef = querySnapshot.docs[0].ref;

  return db.runTransaction((transaction) => {
    // This code may get re-run multiple times if there are conflicts.
    return transaction.get(docRef).then((doc) => {
      transaction.set(docRef,{
          inUse: true,
        },
        {merge: true}
      )
    });
  }).then(() => {
    res.status(200).send("item unequipped");
    console.log("Transaction successfully committed!");
  }).catch((error) => {
    res.status(400).send("error");
    console.log("Transaction failed: ", error);
  });
});

app.post("/unequipItem",async (req, res,) => {
  const itemType = req.body.itemType;
  const itemName = req.body.itemName;
  const db = admin.firestore();
  const querySnapshot = await db.collection("item")
    .where("itemType", "==",itemType)
    .where("itemName","==",itemName)
    .get();
  const docRef = querySnapshot.docs[0].ref;

  return db.runTransaction((transaction) => {
    // This code may get re-run multiple times if there are conflicts.
    return transaction.get(docRef).then((doc) => {
      transaction.set(docRef,{
          inUse: false,
        },
        {merge: true}
      )
    });
  }).then(() => {
    res.status(200).send("item unequipped");
    console.log("Transaction successfully committed!");
  }).catch((error) => {
    res.status(400).send("error");
    console.log("Transaction failed: ", error);
  });
});


///ITEM STUFF END


/// trade stuff
app.post("/tradeMessage", async (req, res) => {

  const { senderiD, sellItemId, buyItemId, recieversID} = req.body;
  try {
    await admin.firestore().collection("tradeMessage").add({
      senderiD: senderiD,
      sellItemId: sellItemId,
      buyItemId: buyItemId,
      recieversID: recieversID
    });

    res.status(201).send("message sent")
  }
  catch (error){
    res.status(400).send("error something happened")
  }
})


app.post("/rejectTrade", async (req, res) => {
  const {docId} = req.body;
  try {
    await admin.firestore().collection('tradeMessage').doc(docId).delete();

    res.status(200).send("Trade messages deleted successfully.");
  } catch (error) {
    res.status(500).send("An error occurred while deleting trade messages.");
  }
});


app.post("/acceptTrade", async (req, res) => {
  const { tradeId } = req.body;

  try {
    const db = admin.firestore();
    const tradeMessageRef = db.collection("tradeMessage").doc(tradeId);
    const tradeMessageDoc = await tradeMessageRef.get();

    if (!tradeMessageDoc.exists) {
      res.status(404).send("Trade message not found.");
      return;
    }

    const tradeMessageData = tradeMessageDoc.data();
    const senderId = tradeMessageData.senderiD;
    const sellItemId = tradeMessageData.sellItemId;
    const buyItemId = tradeMessageData.buyItemId;
    const receiverId = tradeMessageData.recieversID;

    // Start a batch operation for atomic updates
    const batch = db.batch();

    // Get the gotchis
    const senderGotchiRef = db.collection("gotchi").doc(senderId);
    const receiverGotchiRef = db.collection("gotchi").doc(receiverId);

    // Get gotchis' data
    const senderGotchiData = (await senderGotchiRef.get()).data();
    const receiverGotchiData = (await receiverGotchiRef.get()).data();

    // Find the items to be traded
    const sellItem = senderGotchiData.items.find(item => item.itemName === sellItemId);
    const buyItem = receiverGotchiData.items.find(item => item.itemName === buyItemId);

    // Update the items arrays
    senderGotchiData.items = senderGotchiData.items.filter(item => item.itemName !== sellItemId);
    senderGotchiData.items.push(buyItem);

    receiverGotchiData.items = receiverGotchiData.items.filter(item => item.itemName !== buyItemId);
    receiverGotchiData.items.push(sellItem);

    // Update the gotchis' documents
    batch.update(senderGotchiRef, { items: senderGotchiData.items });
    batch.update(receiverGotchiRef, { items: receiverGotchiData.items });

    // Update the trade status
    batch.update(tradeMessageRef, { status: "Accepted" });

    // Commit the batch
    await batch.commit();

    res.status(200).send("Trade accepted successfully.");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while accepting the trade.");
  }
});




// trade stuff end

// chat functions
app.post('/chatMessage', async (req, res) => {
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
});


// Fetch chat messages from Firestore using real-time listeners
app.get('/chatMessages', async (req, res) => {
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
});

// CHAT FUNCTIONS END

// battle simulation stuff.
app.post('/simulateBattle', async (req, res) => {
  const senderId = req.body.senderId;
  const receiverId = req.body.receiverId;
  try {
    const db = admin.firestore();

    const result = await db.runTransaction(async (t) => {
      const senderQuerySnapshot = await db.collection("gotchi").where("user", "==", senderId).get();
      const senderRef = senderQuerySnapshot.docs[0].ref;

      const receiverQuerySnapshot = await db.collection("gotchi").where("user", "==", receiverId).get();
      const receiverRef = receiverQuerySnapshot.docs[0].ref;

      const senderSnap = await t.get(senderRef);
      const receiverSnap = await t.get(receiverRef);

      const senderGotchi = senderSnap.data();
      const receiverGotchi = receiverSnap.data();
      // calculate score for each gotchi based on attributes and their weights
      const attributeWeights = {
        hunger: 0.2,
        sleep: 0.2,
        cleanliness: 0.2,
        health: 0.2,
        strength: 0.1,
        dexterity: 0.1,
        stamina: 0.1,
      };

      let senderScore = 0;
      let receiverScore = 0;
      for (let attribute in attributeWeights) {
        senderScore += senderGotchi[attribute] * attributeWeights[attribute];
        receiverScore += receiverGotchi[attribute] * attributeWeights[attribute];
      }

      // decide the winner and loser
      let winner, loser;
      if (senderScore > receiverScore) {
        winner = senderGotchi;
        loser = receiverGotchi;
      } else {
        winner = receiverGotchi;
        loser = senderGotchi;
      }
      // update the loser's health - reduce it by a random percentage
      const healthLoss = Math.floor(Math.random() * 10);
      loser.health = Math.max(0, loser.health - healthLoss);

      // update the loser's document in Firestore

      const losersnap = await db.collection("gotchi").where("user", "==", loser.user).get();
      const loseref = losersnap.docs[0].ref;
      t.update(loseref, loser);
      // generate a random reward for the winner
      const rewards = ["item1", "item2", "item3", "item4", "item5"]; // needs to be replaced with actual rewards
      const randomReward = rewards[Math.floor(Math.random() * rewards.length)];

      // add the reward to the winner's document in Firestore
      winner.rewards = winner.rewards || [];
      winner.rewards.push(randomReward);
      const winnersnap = await db.collection("gotchi").where("user", "==", winner.user).get();
      const winnerref = winnersnap.docs[0].ref;
      t.update(winnerref, winner);
      return { winner: winner.user, loser: loser.user, reward: randomReward };
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// SIM END
