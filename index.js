const tmi = require("tmi.js");
const fs = require("fs");
const path = require("path");
const { SearchTrack, skipSong } = require("./src/api/SpotifyApi");
const { getChatterUsers } = require("./src/api/TwitchApi");
require("dotenv").config();

let skip = 0;

// Define configuration options
const opts = {
  identity: {
    username: "javinix",
    password: "oauth:hf8shostp9ibzjs5gj2znpz25lyxzy",
  },
  channels: ["javinix"],
};

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on("message", onMessageHandler);
client.on("connected", onConnectedHandler);

// Connect to Twitch:
client.connect();

// Called every time a message comes in
async function onMessageHandler(target, context, msg, self) {
  if (self) {
    console.log(self);
    return;
  } // Ignore messages from the bot

  // Remove whitespace from chat message
  const commandName = msg.trim();

  let pattern = /![p|P]lay\s/;

  if (pattern.test(commandName)) {
    const pattern2 = /\s[a-zA-Z1-9\s]/;
    const obj = pattern2.exec(commandName);
    const length = commandName.length;
    const music = commandName.substring(obj.index + 1, length);
    const dir = path.join(__dirname, "src/files");
    const fullDir = path.join(dir, "token.txt");
    if (fs.existsSync(fullDir)) {
      const tokenF = await fs.readFileSync(fullDir);
      let tokenP = null;
      if (tokenF.byteLength === 0) {
        client.say("javinix", "El bot esta desactivado");
        return;
      } else tokenP = JSON.parse(tokenF).token;

      const exito = SearchTrack(music, tokenP);
      client.say(target, "La cancion " + music + " se esta reproduciendo");
      return;
    }
  }

  const pattern2 = /![s|S]kip/;

  if (pattern2.test(commandName)) {
    skip++;

    const dir = path.join(__dirname, "src/files");
    const fullDir = path.join(dir, "token2.txt");
    if (fs.existsSync(fullDir)) {
      const tokenF = await fs.readFileSync(fullDir);
      let tokenP = null;
      if (tokenF.byteLength === 0) {
        client.say("javinix", "El bot esta desactivado");
        return;
      } else tokenP = JSON.parse(tokenF);

      const auth =
        tokenP.token_type.toString().replace("b", "B") +
        " " +
        tokenP.access_token;
      console.log(await getChatterUsers(auth, process.env.ClientID));
    }

    const dir2 = path.join(__dirname, "src/files");
    const fullDir2 = path.join(dir2, "token.txt");
    if (fs.existsSync(fullDir2)) {
      const tokenF = await fs.readFileSync(fullDir2);
      let tokenP = null;
      if (tokenF.byteLength === 0) {
        client.say("javinix", "El bot esta desactivado");
        return;
      } else tokenP = JSON.parse(tokenF).token;

      if (skip >= 1) {
        skipSong(tokenP);
        skip = 0;
      }
    }
  }
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}
