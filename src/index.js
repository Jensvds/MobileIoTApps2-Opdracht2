import _ from 'lodash';
import './style.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Workbox } from 'workbox-window';
//import { sendNotification } from 'web-push';

let togglelockbtn = document.getElementById('locktoggle');
togglelockbtn.addEventListener('click', locktoggle);

let synckbtn = document.getElementById('synctoggle');
synckbtn.addEventListener('click', GetStatus);

//let address = "http://localhost";
let port = "";
let address = "https://nuki-jensvds.azurewebsites.net";
let applicationServerPublicKey = "BC-Xk1P0MhZ6ls5SU8-6JI7I49iR0WmqoNt5_P7Dh1gNYLEJL5NmIg5LWUm92RghRCSJ9_wu_O4yRG34sLIpNFc";
let isSubscribed = false;

GetStatus();

if ('serviceWorker' in navigator) {
  const wb = new Workbox('/sw.js');

  wb.register();
}

//add onclick for request notifications
let notificationsBtn = document.getElementById('notificationsBtn');
notificationsBtn.addEventListener('click', requestNotifications);

function requestNotifications() {
  if(!("Notification" in window))
    console.log("Notifications worden niet ondersteund.");
  else
  {
    // Bekijk of er vroeger reeds toestemming werd gegeven.
    if(Notification.permission == "granted")
    {
        notificationsBtn.style.display = 'none';
        console.log("Toestemming werd reeds eerder gegeven.");
    }
    else
    {
        if(Notification.permission !== "denied")
        {
            // Eerder werd niet geweigerd, vraag nu toestemming.
            Notification.requestPermission().then(permisson => {
                if(permisson == "granted")
                {
                    notificationsBtn.style.display = 'none';
                    console.log("Toestemming werd zonet gegeven.");
                    subscribeUser();
                }
            });
        }
        else
        {
            console.log("Toestemming werd geweigerd.");
        }
    }
  }
}

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function subscribeUser() {
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  navigator.serviceWorker.getRegistration().then((registration) => registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey
  }))
    .then(function (subscription) {
      console.log('User is subscribed. subscription:' + JSON.stringify(subscription));
      fetch(address + port + "/register", {
        method: 'POST', // or 'PUT'
        headers: {
          'Content-Type': 'application/json'
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(subscription) // data can be `string` or {object}!
      }).then(res => res.text())
        .then(response => console.log('Success:', response))
        .catch(error => console.error('Error registering:', error));
      isSubscribed = true;
    })
    .catch(function (err) {
      console.log('Failed to subscribe the user: ', err);
    });
}

function locktoggle(){
  if(Notification.permission == "granted")
  {
    console.log("locktoggle");
    if (togglelockbtn.innerHTML == "lock"){
      togglelockbtn.innerHTML == "sync"
      NukiUnlock();
    }
    else{
      togglelockbtn.innerHTML == "sync"
      NukiLock();
    }
  }
  else{
    alert("Geef eerst toestemming voor notificaties!");
  }
}

navigator.serviceWorker.addEventListener('message', (event) => {
  console.log(event.data);
  if (event.data == "locked"){
    togglelockbtn.innerHTML = "lock";
  }
  else if (event.data == "unlocked"){
    togglelockbtn.innerHTML = "lock_open";
  }

  sendregularNot(event.data);
});

//window.setInterval(() => { navigator.serviceWorker.ready.then(worker => worker.active.postMessage("Hi from page")) }, 5000);


async function NukiLock(){
  await fetch('https://api.nuki.io/smartlock/645574324/action/lock', {
    method: 'POST',
    headers: {
        accept: 'application/json',
        authorization: 'Bearer bdeb6ae900e63ad6e8c13afa19fa2ce4b053838c7d1efd91cddc209b95b6acec74740b2c3602946e',
    }
}).then(data => {
  console.log(data);

  if (data.status == 204){
    sendPushNot("locked");
  }
  })
}

async function NukiUnlock(){
  await fetch('https://api.nuki.io/smartlock/645574324/action/unlock', {
    method: 'POST',
    headers: {
        accept: 'application/json',
        authorization: 'Bearer bdeb6ae900e63ad6e8c13afa19fa2ce4b053838c7d1efd91cddc209b95b6acec74740b2c3602946e', 
    }
}).then(data => {
  console.log(data);

    if (data.status == 204){
      sendPushNot("unlocked");
    }
  })
}

async function GetStatus(){
  togglelockbtn.innerHTML = "sync";

  await fetch('https://api.nuki.io/smartlock', {
    method: 'GET',
    headers: {
        accept: 'application/json',
        authorization: 'Bearer bdeb6ae900e63ad6e8c13afa19fa2ce4b053838c7d1efd91cddc209b95b6acec74740b2c3602946e', 
    }
  }).then(data => data.json())
  .then(json => {

  if (json[0].state.state == 1) {
    togglelockbtn.innerHTML = "lock";
    }
  if (json[0].state.state == 3) {
    togglelockbtn.innerHTML = "lock_open";
    }
  if (json[0].state.state == 4 || json[0].state.state == 2) {
    GetStatus();
    }
  })
}

function sendPushNot(actionVar){
  console.log(JSON.stringify({'action': actionVar}));
  fetch(address + port + "/push", {
    method: 'POST', // or 'PUT'
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({'action': actionVar}) // data can be `string` or {object}!
  }).then(res => res.json())
    .then(response => console.log('Success:', JSON.stringify(response)))
  //.catch(error => console.error('Error:', error));
}

function sendregularNot(data){

  var title = "Lock: " + data;
  var text = "Error";

  if (data == "locked")
    text = "Het slot werd net gesloten.";
  else if (data == "unlocked")
    text = "Het slot werd net geopend."; 
  else if (data == "test")
    text = "Test notificatie ontvangen.";

  if(Notification.permission == "granted")
    {
        navigator.serviceWorker.getRegistration().then(registration => {
            registration.showNotification(title, {
                body: text,
                icon: "noticon.png",
                vibrate: [200, 100, 200]
            });
        });
    }

  console.log("Notification Send");
}