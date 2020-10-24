const fs = require('fs');
const _ = require('lodash');
const electron = require('electron');
const Constants = require('./constants');
const Mapper = require('./utils/mapper');
const Messages = require('./scripts/messages');
const StatusChanger = require('./scripts/status-changer');

start();
var timer;

function start() {
    const fileExists = fs.existsSync('./scripts/data/credentials.json');
    if (fileExists) {
        try {
            const { username, password } = readCredentialsFromFile();
            authenticate(username, password);
            checkEvents();
        } catch (err) {
            alert('ERR! ' + err.toString());
        }
    } else {
        Messages.showNoCredentialsAlert();
    }

}

function onCheckClick() {
    const checkBtn = document.getElementById("check-btn");
    checkBtn.disabled = true;
    checkEvents();
}

function readCredentialsFromFile() {
    const credentials = fs.readFileSync('./scripts/data/credentials.json');
    return JSON.parse(credentials);
}

function authenticate(username, password) {
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
    StatusChanger.setLoggingInStatus();
    fetch('https://cocurriculares.unphu.edu.do/login', requestInit)
        .then((response) => response.json())
        .then((response) => {
            StatusChanger.setStandByStatus();
            console.log(response);
        })
        .catch((err) => {
            throw err
        });
}

function checkPeriodically(mins) {
    const period = mins * 60 * 1000;
    timer = setInterval(checkEvents, period);
    StatusChanger.setTimerStatus();
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
    const checkBtn = document.getElementById("check-btn");
    StatusChanger.setFetchingStatus();

    return await fetch('https://cocurriculares.unphu.edu.do/eventos/busqueda')
        .then((response) => {
            StatusChanger.setStandByStatus();
            checkBtn.disabled = false;
            return response.json();
        })
        .then((response) => {
            const mappedResponse = Mapper.mapToSlugArray(response);
            return compareWithPrevious(mappedResponse)
        })
        .catch((err) => {
            throw err
        });
}

function compareWithPrevious(fetchedData) {
    const fileExists = fs.existsSync('./scripts/data/events.json')

    if (fileExists) {
        const localData = JSON.parse(fs.readFileSync('./scripts/data/events.json'));

        if (!_.isEqual(localData, fetchedData)) {
            const newEvent = getNewEvent(localData, fetchedData);
            if (window.confirm(`HAY NUEVO EVENTO! ¿Ir a inscribirse?`)) {
                window.location.href = `${Constants.COCUR_HOST}${newEvent}`;
                const currentWindow = electron.remote.getCurrentWindow();
                currentWindow.setSize(1366, 768);
                currentWindow.setPosition(0, 0);
            }
        }
    } else {
        alert('Primer chequeo! :o. Guardando últimos eventos...');
    }
    writeToFile(fetchedData);
}

function getNewEvent(localData, fetchedData) {
    let newEvent;

    for (let event of fetchedData) {
        let found = false;
        for (let oldEvent of localData) {
            if (event === oldEvent) {
                found = true;
                continue
            }
        }
        if (!found) {
            newEvent = event;
        }
    }

    return newEvent;
}

function writeToFile(data) {
    fs.writeFileSync('./scripts/data/events.json', JSON.stringify(data));
}
 
module.exports =  {
    start,
    checkEvents,
    onCheckClick,
    stopChecking,
    checkPeriodically,
};
