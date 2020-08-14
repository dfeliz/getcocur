const fs = require('fs');
const _ = require('lodash');
const Errors = require('./errors');
const Constants = require('./constants');
const electron = require('electron');

start();
var timer;

function start() {
    const fileExists = fs.existsSync('credentials.json');
    if (fileExists) {
        try {
            const { username, password }  = readCredentialsFromFile();
            postData(username, password);
            checkEvents();
        } catch (err) {
            alert('ERR! ', alert);
        }
    } else {
        Errors.showNoCredentialsAlert();
    }

}

function readCredentialsFromFile() {
    const credentials = fs.readFileSync('credentials.json');
    return JSON.parse(credentials);
}

function postData(username, password) {
    const requestInit = {
        method: 'POST',
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            'username': username,
            'password': password,
            'remember': 'on'
        }),
    }

    fetch('https://cocurriculares.unphu.edu.do/login', requestInit)
        .then((response) => response.json())
        .then((response) => {
            console.log(response);
        })
}

function checkPeriodically(mins) {
    const period = mins * 60 * 1000;
    timer = setInterval(checkEvents, period);
    alert(`Se buscarán eventos nuevos cada ${mins} minutos.`);

    const periodicCheckBtn = document.getElementById('periodic-check-btn');
    const stopCheckBtn = document.getElementById('stop-check-btn');

    periodicCheckBtn.style.display = 'none';
    stopCheckBtn.style.display = 'inline-block';
}

function stopChecking() {
    clearInterval(timer);
    alert('Se ha removido el chequeo automático.');

    const periodicCheckBtn = document.getElementById('periodic-check-btn');
    const stopCheckBtn = document.getElementById('stop-check-btn');
    periodicCheckBtn.style.display = 'inline-block';
    stopCheckBtn.style.display = 'none';
}

async function checkEvents() {
    return await fetch('https://cocurriculares.unphu.edu.do/ultimos-eventos')
        .then((response) => response.json())
        .then((response) => compareWithPrevious(response))
}

function compareWithPrevious(data) {
    const fileExists = fs.existsSync('events.json')

    if (fileExists) {
        const previousData = JSON.parse(fs.readFileSync('events.json'));

        if (!_.isEqual(previousData, data)) {
            if (window.confirm(`HAY NUEVO EVENTO! ¿Ir a inscribirse?`)) {
                window.location.href = `${Constants.COCUR_HOST}${data[0].slug}`;
            }
            const currentWindow = electron.remote.getCurrentWindow();
            currentWindow.setSize(1366, 768);
            currentWindow.setPosition(0, 0);
        }
    } else {
        alert('Primer chequeo! :o. Guardando últimos eventos...');
    }
    writeToFile(data);
}

function writeToFile(data) {
    fs.writeFileSync('events.json', JSON.stringify(data));
}
 
module.exports =  {
    start,
    checkEvents,
    stopChecking,
    checkPeriodically,
};
