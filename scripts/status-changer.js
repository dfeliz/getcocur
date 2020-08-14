function setStatus(string) {
    const status = document.getElementById("status");
    status.innerText = string;
};

function setFetchingStatus() {
    setStatus('Obteniendo eventos...');
};

function setStandByStatus() {
    setStatus('En pausa')
};

function setTimerStatus() {
    setStatus(`Actualizando automáticamente...`);
};

function setLoggingInStatus() {
    setStatus('Iniciando sesión...');
};

module.exports = {
    setTimerStatus,
    setStandByStatus,
    setFetchingStatus,
    setLoggingInStatus,
};
