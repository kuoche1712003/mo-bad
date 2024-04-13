var https = require("https");
var express = require("express");
var router = express.Router();

router.post("/", function (req, res, next) {
  res.send("HTTP POST request sent to the webhook URL!");
  if (req.body.events[0].type === "message") {
    const text = req.body.events[0].message.text;
    const reply = replyURL(text);
    if (reply !== null) {
      // You must stringify reply token and message data to send to the API server
      const dataString = JSON.stringify({
        // Define reply token
        replyToken: req.body.events[0].replyToken,
        // Define reply messages
        messages: [
          {
            type: "text",
            text: reply,
          },
        ],
      });

      // Request header. See Messaging API reference for specification
      const headers = {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.API_TOKEN,
      };

      // Options to pass into the request, as defined in the http.request method in the Node.js documentation
      const webhookOptions = {
        hostname: "api.line.me",
        path: "/v2/bot/message/reply",
        method: "POST",
        headers: headers,
        body: dataString,
      };

      // When an HTTP POST request of message type is sent to the /webhook endpoint,
      // we send an HTTP POST request to https://api.line.me/v2/bot/message/reply
      // that is defined in the webhookOptions variable.

      // Define our request
      const request = https.request(webhookOptions, (res) => {
        res.on("data", (d) => {
          process.stdout.write(d);
        });
      });

      // Handle error
      // request.on() is a function that is called back if an error occurs
      // while sending a request to the API server.
      request.on("error", (err) => {
        console.error(err);
      });

      // Finally send the request and the data we defined
      request.write(dataString);
      request.end();
    }
  }
});

function replyURL(text) {
  const regex = /https:\/\/moptt\.tw\/p\/([^.]+).([^ ]+)/;
  const match = text.match(regex);

  if (match) {
    const boardName = match[1];
    const postId = match[2];
    return `https://www.ptt.cc/bbs/${boardName}/${postId}.html`;
  } else {
    return null;
  }
}

module.exports = router;
