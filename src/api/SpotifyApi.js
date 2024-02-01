require("dotenv").config();

let token = "";

const SearchTrack = async (name, auth) => {
  const url = "https://api.spotify.com/v1/search?";
  const type = "track";
  const fullURL = url + "q=" + name + "&type=" + type;

  const data = await fetch(fullURL, {
    method: "GET",
    headers: {
      Authorization: auth,
    },
  });
  const track = await data.json();
  addQueue(track.tracks.items[0].id, auth);
};

const addQueue = async (id, auth) => {
  const url = "https://api.spotify.com/v1/me/player/queue";
  const fullURL = url + "?uri=spotify:track:" + id;

  const data = await fetch(fullURL, {
    method: "POST",
    headers: {
      Authorization: auth,
    },
    json: true,
  });

  Play(auth);
};

const Play = async (auth) => {
  const fullURL = "https://api.spotify.com/v1/me/player/play";
  const options = {
    method: "PUT",
    headers: {
      Authorization: auth,
      ContentType: "aplication/json",
    },
  };

  await fetch(fullURL, options);
};

const skipSong = async (auth) => {
  const fullURL = "https://api.spotify.com/v1/me/player/next";
  const options = {
    method: "POST",
    headers: {
      Authorization: auth,
    },
  };
  await fetch(fullURL, options);
};

module.exports = { SearchTrack, skipSong };
