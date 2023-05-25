const admin = require("firebase-admin");
const {Timestamp, FieldValue} = require("firebase-admin/firestore");
const {error} = require("firebase-functions/logger");
const functions = require('firebase-functions');
const increaseClean = async (req, res) => {
  const {reqId} = req.body;
  const db = admin.firestore();
  const querySnapshot = await db.collection("gotchi").where("user", "==", reqId).get();
  const docRef = querySnapshot.docs[0].ref;

  return db.runTransaction((transaction) => {
    // This code may get re-run multiple times if there are conflicts.
    return transaction.get(docRef).then((doc) => {
      if (doc.data().showerTimeout >= Timestamp.now().toMillis() || !doc.exists || doc.data().timesShoweredToday >= 2){
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
}

const increaseHunger = async (req, res) => {
  const {reqId} = req.body;
  const db = admin.firestore();
  const querySnapshot = await db.collection("gotchi").where("user", "==", reqId).get();
  const docRef = querySnapshot.docs[0].ref;

  return db.runTransaction((transaction) => {
    // This code may get re-run multiple times if there are conflicts.
    return transaction.get(docRef).then((doc) => {
      if (doc.data().foodTimeout >= Timestamp.now().toMillis() || !doc.exists || doc.data().timesEatenToday >= 3){
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
}

const increaseSleep =  async (req, res) => {
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
}

const restart = async (req, res) => {
  try {
    const userId = req.body.user;
    await admin.firestore().collection("gotchi").doc(userId).set({
      user: userId,
      name: wackyFirstNames[Math.floor(Math.random() * wackyFirstNames.length)] + " " + wackyLastNames[Math.floor(Math.random() * wackyLastNames.length)],
      hunger: 50,
      sleep: 50,
      cleanliness: 50,
      health: 50,
      strength: 0,
      dexterity: 0,
      stamina: 0,
    });
    console.log(200);
    res.status(200).send("Gotchi restarted successfully.");
  } catch (error) {
    console.error("Error restarting Gotchi:", error);
    res.status(500).send("Failed to restart Gotchi.");
  }
}

module.exports = {
  increaseClean,
  increaseHunger,
  increaseSleep,
  restart,
}
