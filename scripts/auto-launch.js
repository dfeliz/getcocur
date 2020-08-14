var AutoLaunch = require('auto-launch');

var getcocur = new AutoLaunch({
	name: 'getcocur',
	path: '/Applications/getcocur.exe',
});

getcocur.enable();

//getcocur.disable();


getcocur.isEnabled()
    .then(function(isEnabled){
        if(isEnabled){
            return;
        }
        getcocur.enable();
    })
    .catch(function(err){
        console.log('FATAL ERROR! ', err);
    });