const functions = require("firebase-functions");
const admin = require("firebase-admin");
const app = require("express")();
const cors = require("cors");
const {onSchedule} = require("firebase-functions/v2/scheduler");
const {every, timestamp} = require("rxjs");
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


exports.onUserRegister = functions.auth
  .user()
  .onCreate((user, context) => {
    admin.firestore().collection("gotchi").add({
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
  const reqId = req.body.reqId;
  const itemType = req.body.itemType;
  const itemName = req.body.itemName;
  const db = admin.firestore();
  const querySnapshot = await db.collection("item")
    .where("user", "==", reqId)
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
  const reqId = req.body.reqId;
  const itemType = req.body.itemType;
  const itemName = req.body.itemName;
  const db = admin.firestore();
  const querySnapshot = await db.collection("item")
    .where("user", "==", reqId)
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
