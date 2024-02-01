require("dotenv").config();

const client_id = process.env.userID;
const client_secret = process.env.Secret;

async function getToken() {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(client_id + ":" + client_secret).toString("base64"),
    },
  });

  return await response.json();
}

async function getTrackInfo(access_token) {
  const response = await fetch("https://api.spotify.com/v1/me", {
    method: "GET",
    headers: { Authorization: "Bearer " + access_token },
  });

  return await response.json();
}

getToken().then((response) => {
  getTrackInfo(response.access_token).then((profile) => {
    console.log(profile);
  });
});
