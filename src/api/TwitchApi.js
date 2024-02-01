const getChatterUsers = async (auth, client) => {
  const id = await getID(auth, client);
  const url =
    "https://api.twitch.tv/helix/chat/chatters?broadcaster_id=" +
    id +
    "&moderator_id=" +
    id;
  const options = {
    method: "GET",
    headers: {
      Authorization: auth,
      "Client-Id": client,
    },
  };
  const data = await fetch(url, options);
  const json = await data.json();

  return json.data.length;
};

const getID = async (auth, client) => {
  const url = "https://api.twitch.tv/helix/search/channels?query=javinix";
  const options = {
    method: "GET",
    headers: {
      Authorization: auth,
      "Client-Id": client,
    },
  };

  const data = await fetch(url, options);
  const user = await data.json();
  let javi = null;
  user.data.forEach((us) => {
    if (us.broadcaster_login == "javinix") javi = us;
  });
  return javi.id;
};

module.exports = { getChatterUsers };
