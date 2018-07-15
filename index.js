const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const apiaiApp = require('apiai')("dad89d99e8d0404f9a8563674f3e2348");

const PORT=process.env.PORT || 5000;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/",(req,res)=>{
    res.status(200).send("Hello, from a assistant. How can I help you?")
});

app.get('/webhook', (req, res) => {
    if (req.query['hub.mode'] && req.query['hub.verify_token'] === 'bot_cat') {
        res.status(200).send(req.query['hub.challenge']);
    } else {
        res.status(403).end();
    }
});

app.post('/webhook', (req, res) => {
    if (req.body.object === 'page') {
        req.body.entry.forEach((entry) => {
            entry.messaging.forEach((event) => {
                if (event.message && event.message.text) {
                    sendMessage(event);
                }
            });
        });
        res.status(200).end();
    }
});

function sendMessage(event) {
    let sender = event.sender.id,
        text = event.message.text,
        apiai = apiaiApp.textRequest(text, {
            sessionId: 'msn_bot_id' // use any arbitrary id
        });

    apiai.on('response', (response) => {
        let aiText = response.result.fulfillment.speech;

        request({
            url: 'https://graph.facebook.com/v3.0/me/messages',
            qs: { access_token: "EAADgBPAbnfIBAJ6N2BwlCOUVZAta0rC5bgdPyFqUkhXyBB1koboQdYM8j5DRp1ZASKWqk4ZAtZCBgZCqupxtAzpnQ523W3bcPAdygllAKqvTHvxDpdqSPWRLraZAGHwxy0HxprIepTA1fIrZAa88ESTXM8f3ygqNCZAtzeEHb25JQycn1lbmuAKu" },
            method: 'POST',
            json: {
                recipient: { id: sender },
                message: { text: aiText }
            }
        }, (error, response) => {
            if (error) {
                console.log('Error sending message: ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            }
        });
    });

    apiai.on('error', (error) => {
        console.log(error);
    });

    apiai.end();
}

const server = app.listen(PORT, () => {
    console.log('Our MSN Bot App is running on port %d in %s mode', server.address().port, app.settings.env);
});
