const constants = require('./constants');

function showNoCredentialsAlert() {
    alert(constants.NO_CREDENTIALS.join('\r\n'))
}

module.exports = {
    showNoCredentialsAlert,
};
