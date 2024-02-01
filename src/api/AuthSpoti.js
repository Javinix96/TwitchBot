require("dotenv").config();
const express = require("express");
var request = require("request");
var crypto = require("crypto");
var cors = require("cors");
var querystring = require("querystring");
var cookieParser = require("cookie-parser");
var client_id = process.env.userID;
var client_secret = process.env.Secret;
var redirect_uri = "http://localhost:8888/callback";
var stateKey = "spotify_auth_state";
var app = express();
const fs = require("fs");
const path = require("path");
app.use(cors()).use(cookieParser());

const generateRandomString = (length) => {
  return crypto.randomBytes(60).toString("hex").slice(0, length);
};

app.get("/login", function (req, res) {
  var state = generateRandomString(16);
  var scope = "user-modify-playback-state";
  res.cookie(stateKey, state);

  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state,
      })
  );
});

app.get("/callback", function (req, res) {
  // your application requests refresh and access tokens
  // after checking the state parameter
  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect(
      "/#" +
        querystring.stringify({
          error: "state_mismatch",
        })
    );
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: "https://accounts.spotify.com/api/token",
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: "authorization_code",
      },
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          new Buffer.from(client_id + ":" + client_secret).toString("base64"),
      },
      json: true,
    };

    request.post(authOptions, async function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token,
          refresh_token = body.refresh_token;

        const fullToken = "Bearer " + access_token;

        var options = {
          url: "https://api.spotify.com/v1/me",
          headers: { Authorization: fullToken },
          json: true,
        };
        const tokenJson = {
          token: fullToken,
        };

        const dir = path.join(__dirname, "../", "/files");
        const fullDir = path.join(dir, "token.txt");
        if (!(await fs.existsSync(dir))) await fs.mkdirSync(dir);
        await fs.writeFileSync(fullDir, JSON.stringify(tokenJson));

        request.get(options, function (error, response, body) {
          // console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect(
          "/#" +
            querystring.stringify({
              access_token: access_token,
              refresh_token: refresh_token,
            })
        );
      } else {
        res.redirect(
          "/#" +
            querystring.stringify({
              error: "invalid_token",
            })
        );
      }
    });
  }
});

app.get("/refresh_token", function (req, res) {
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: "https://accounts.spotify.com/api/token",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        new Buffer.from(client_id + ":" + client_secret).toString("base64"),
    },
    form: {
      grant_type: "refresh_token",
      refresh_token: refresh_token,
    },
    json: true,
  };

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token,
        refresh_token = body.refresh_token;
      res.send({
        access_token: access_token,
        refresh_token: refresh_token,
      });
    }
  });
});

//API TWITCH
app.get("/loginTwitch", (req, res) => {
  var state = generateRandomString(16);
  var scope = "moderator:read:chatters";
  const redirect_uri2 = "http://localhost:8888/Token2";
  res.cookie(stateKey, state);

  const url =
    "https://id.twitch.tv/oauth2/authorize?response_type=code" +
    "&client_id=" +
    process.env.ClientID +
    "&scope=" +
    scope +
    "&redirect_uri=" +
    redirect_uri2 +
    "&state=" +
    state;

  res.redirect(url);
});

app.get("/Token2", async (req, res, err) => {
  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect(
      "/#" +
        querystring.stringify({
          error: "state_mismatch",
        })
    );
  } else {
    console.log();
    const url = "https://id.twitch.tv/oauth2/token";
    const body =
      "client_id=" +
      process.env.ClientID +
      "&client_secret=" +
      process.env.Secret2 +
      "&code=" +
      code +
      "&grant_type=authorization_code&redirect_uri=http://localhost:8888/tst";

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
      body: body,
      json: true,
    };

    const data = await fetch(url, options);
    const tokk = await data.json();

    const dir = path.join(__dirname, "../", "/files");
    const fullDir = path.join(dir, "token2.txt");
    if (!(await fs.existsSync(dir))) await fs.mkdirSync(dir);
    await fs.writeFileSync(fullDir, JSON.stringify(tokk));

    res.redirect("http://localhost:8888/tst?code=" + tokk.access_token);
  }
});

app.get("/tst", (req, res, err) => {
  // console.log(req);
  // console.log(res);
  // console.log(err);
  console.log(req.query);
  res.json(req.query);
});

app.listen(8888, () => {
  console.log("Listen");
});
