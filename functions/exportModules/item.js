const admin = require("firebase-admin");
const functions = require('firebase-functions');
const equipItem = async (req, res) => {
  const user = req.body.userId;
  const itemType = req.body.itemType;
  const itemName = req.body.itemName;
  const db = admin.firestore();
  let items;
  const querySnapshot = await db.collection('gotchi')
    .doc(user)
    .get();

  if (querySnapshot.exists) {
    const data = querySnapshot.data();
    if (data && data['items']) {
      items = data['items'];
      items = items.map(item => {
        if (item.itemType === itemType && item.itemName === itemName) {
          return { ...item, inUse: true };
        }
        return item;
      });
    }
  }

  const docRef = querySnapshot.ref;

  return db.runTransaction((transaction) => {
    return transaction.get(docRef).then((doc) => {
      transaction.set(docRef, { items }, { merge: true });
    });
  })
    .then(() => {
      res.status(200).send("item equipped");
      console.log("Transaction successfully committed!");
    })
    .catch((error) => {
      res.status(400).send("error");
      console.log("Transaction failed: ", error);
    });
}
const addStats = async (req, res) => {
  const user = req.body.userId;
  const db = admin.firestore();
  let gotchiStats = {dexterity: 0, stamina: 0, strength: 0 };

  const querySnapshot = await db.collection('gotchi')
    .doc(user)
    .get();

  if (querySnapshot.exists) {
    const data = querySnapshot.data();
    if (data && data['items']) {
      const items = data['items'];

      items.forEach(item => {
        if (item.inUse) {
          gotchiStats.dexterity += item.additionalDEX || 0;

          gotchiStats.stamina += item.additionalSTM || 0;

          gotchiStats.strength += item.additionalSTR || 0;
        }
      });
    }
  }

  const docRef = querySnapshot.ref;

  return db.runTransaction((transaction) => {
    return transaction.get(docRef).then((doc) => {
      transaction.set(docRef, gotchiStats, { merge: true });
    });
  })
    .then(() => {
      res.status(200).send("Stats updated successfully");
      console.log("Transaction successfully committed!");
    })
    .catch((error) => {
      res.status(400).send("Error");
      console.log("Transaction failed: ", error);
    });
}
const unequipItem = async (req, res) => {
  const user = req.body.userId;
  const itemType = req.body.itemType;
  const itemName = req.body.itemName;
  const db = admin.firestore();
  let items;
  const querySnapshot = await db.collection('gotchi')
    .doc(user)
    .get();

  if (querySnapshot.exists) {
    const data = querySnapshot.data();
    if (data && data['items']) {
      items = data['items'];
      items = items.map(item => {
        if (item.itemType === itemType && item.itemName === itemName) {
          return { ...item, inUse: false };
        }
        return item;
      });
    }
  }

  const docRef = querySnapshot.ref;

  return db.runTransaction((transaction) => {
    return transaction.get(docRef).then((doc) => {
      transaction.set(docRef, { items }, { merge: true });
    });
  })
    .then(() => {
      res.status(200).send("item unequipped");
      console.log("Transaction successfully committed!");
    })
    .catch((error) => {
      res.status(400).send("error");
      console.log("Transaction failed: ", error);
    });
}
const removeStats = async (req, res) => {
  const user = req.body.userId;
  const db = admin.firestore();
  let gotchiStats = { cleanliness: 0, dexterity: 0, health: 0, hunger: 0, stamina: 0, strength: 0 };

  const querySnapshot = await db.collection('gotchi')
    .doc(user)
    .get();

  if (querySnapshot.exists) {
    const data = querySnapshot.data();
    if (data && data['items']) {
      const items = data['items'];

      items.forEach(item => {
        if (item.inUse) {
          gotchiStats.dexterity -= item.additionalDEX || 0;

          gotchiStats.stamina -= item.additionalSTM || 0;

          gotchiStats.strength -= item.additionalSTR || 0;
        }
      });
    }
  }

  const docRef = querySnapshot.ref;

  return db.runTransaction((transaction) => {
    return transaction.get(docRef).then((doc) => {
      transaction.set(docRef, gotchiStats, { merge: true });
    });
  })
    .then(() => {
      res.status(200).send("Stats removed successfully");
      console.log("Transaction successfully committed!");
    })
    .catch((error) => {
      res.status(400).send("Error");
      console.log("Transaction failed: ", error);
    });
}

module.exports = {
  equipItem,
  addStats,
  unequipItem,
  removeStats
}
