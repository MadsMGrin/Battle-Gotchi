const admin = require("firebase-admin");
const tradeMessage = async (req, res) => {
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
}
const rejectTrade = async (req, res) => {
  const {docId} = req.body;
  try {
    await admin.firestore().collection('tradeMessage').doc(docId).delete();

    res.status(200).send("Trade messages deleted successfully.");
  } catch (error) {
    res.status(500).send("An error occurred while deleting trade messages.");
  }
}
const acceptTrade = async (req, res) => {
  const tradeuriId = req.body.tradeId;
  try {
    const db = admin.firestore();
    const tradeMessageRef = db.collection("tradeMessage").doc(tradeuriId);
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
    const sellItemIndex = senderGotchiData.items.findIndex(item => item.ownerId === sellItemId);
    const buyItemIndex = receiverGotchiData.items.findIndex(item => item.ownerId === buyItemId);
    if (sellItemIndex === -1 || buyItemIndex === -1) {
      res.status(400).send("Item not found for trade.");
      return;
    }

    const sellItem = senderGotchiData.items[sellItemIndex];
    const buyItem = receiverGotchiData.items[buyItemIndex];

    // Move items between gotchis
    senderGotchiData.items.splice(sellItemIndex, 1);
    senderGotchiData.items.push(buyItem);

    receiverGotchiData.items.splice(buyItemIndex, 1);
    receiverGotchiData.items.push(sellItem);

    // Update the gotchis' documents
    batch.update(senderGotchiRef, { items: senderGotchiData.items });
    batch.update(receiverGotchiRef, { items: receiverGotchiData.items });

    // Delete the trade message document
    batch.delete(tradeMessageRef);

    // Commit the batch
    await batch.commit();

    res.status(200).send("Trade accepted and trade message deleted successfully.");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while accepting the trade.");
  }
}

module.exports = {
  tradeMessage,
  rejectTrade,
  acceptTrade
}
