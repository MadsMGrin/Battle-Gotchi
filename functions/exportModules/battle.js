const admin = require("firebase-admin");

const simulateBattle = async (req, res) => {
  const senderId = req.body.challengerId;
  const receiverId = req.body.opponentId;
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
      const healthLoss = Math.floor((Math.random() * 10)+5);
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

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
module.exports = {
  simulateBattle
}
