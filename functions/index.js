const functions = require("firebase-functions");
const admin = require("firebase-admin");
const app = require("express")();
const cors = require("cors");


admin.initializeApp({
  projectId: "battlegotchi-63c2e",
  databaseURL: "http://localhost:8080",
});


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

exports.api = functions.runWith({ memory: "1GB" }).https.onRequest(app);

const chat = require("./exportModules/chat")
const gotchi = require("./exportModules/gotchi")
const itemMethods = require("./exportModules/item")
const trade = require("./exportModules/trade")
const battle = require("./exportModules/battle")


exports.onUserRegister = functions.auth
  .user()
  .onCreate( async (user, context) => {
   await admin.firestore().collection("gotchi").doc(user.uid).set({
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


//// GOTCHI METHODS
app.post("/restart", gotchi.restart);
exports.deathTrigger = gotchi.handleDeathTrigger;
app.post("/increaseSleep", gotchi.increaseSleep);
app.post("/increaseHunger", gotchi.increaseHunger);
app.post("/increaseCleanliness", gotchi.increaseClean);
//// GOTCHI STATE MANIPULATION - END



// ITEM STUFF
app.post("/equipItem", itemMethods.equipItem);
app.post("/addStats", itemMethods.addStats);
app.post("/unequipItem", itemMethods.unequipItem);
app.post("/removeStats", itemMethods.removeStats);
///ITEM STUFF END


/// trade stuff
app.post("/tradeMessage", trade.tradeMessage)
app.post("/rejectTrade", trade.rejectTrade);
app.post("/acceptTrade", trade.acceptTrade);
// trade stuff end

// CHAT functions
app.get('/onlineusers', chat.onlineUserList);
app.get('/onlineusers/:id/items', chat.onlineUserItemList);
app.post('/chatMessage', chat.sendMessage);
app.get('/chatMessages', chat.chatMessage);
// CHAT FUNCTIONS END

// battle simulation stuff.
app.post('/simulateBattle', battle.simulateBattle);
// SIM END


