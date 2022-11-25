const express = require('express')
const webPush = require('web-push')
var cors = require('cors')
const { json } = require('express')
const app = express()
const port = process.env.PORT || 3000;
let subscriptions = []

app.use(express.static('dist'))

app.use(express.json())

app.use(cors())

const vapidKeys = {
    publicKey:
        'BC-Xk1P0MhZ6ls5SU8-6JI7I49iR0WmqoNt5_P7Dh1gNYLEJL5NmIg5LWUm92RghRCSJ9_wu_O4yRG34sLIpNFc',
    privateKey: 'jzcnoTCEP_sXaotbywVHcNV0XKeD5l3VWrqACEFZy-U'
};
webPush.setVapidDetails(
    'mailto:hans.naert@vives.be',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

app.post('/register', (req, res) => {
    console.log(JSON.stringify(req.body));
    if (!req.body || !req.body.endpoint) {
        // Invalid subscription.
        res.status(400);
        res.send('Invalid subscription');
        return false;
    }
    subscriptions.push(req.body)
    res.send("subscription registered")
    console.log('Subscription registered ' + req.body.endpoint);

})

app.post('/push', (req, res) => {
    subscriptions.forEach(subscription => {
        const notificationText = req.body.action;
        webPush.sendNotification(subscription, notificationText).then(() => {
            console.log('Notification sent: ' + notificationText);
        }).catch(function (error) {
            console.log('Error sending Notification' + error);
        });
    });
    res.send(`{"pushed": true}`)
});


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})