var accessToken = getHashValue('access_token');
var username = null;
var client;
function getHashValue(key) {
	matches = location.hash.match(new RegExp(key+'=([^&]*)'));
	return matches ? matches[1] : null;
}
async function connectAndStartSetup() {
	client = new tmi.Client({
		options: { debug: false },
		identity: {
			username,
			password: accessToken
		},
		channels: ['wissididom', 'wissididombot']
	});
	await client.connect().then(([server, port]) => {
		var statusBox = document.getElementById('statusBox');
		statusBox.innerHTML = 'Connected to ' + server + ':' + port;
		statusBox.classList = 'green';
		console.log('Connected to ' + server + ':' + port);
	}).catch(err => {
		var statusBox = document.getElementById('statusBox');
		statusBox.innerHTML = 'Error connecting to Twitch Chat: ' + err;
		statusBox.classList = 'red';
		console.error('Error connecting to Twitch Chat: ' + err);
	});
	if ((await client.mods(username)).includes('sery_bot')) {
		document.getElementById('modSery').innerHTML = 'Made sure Sery_Bot a Mod ✅';
		document.getElementById('seryAuthorized').style.display = 'inline';
	} else {
		client.mod(username, 'sery_bot').then(() => {
			document.getElementById('modSery').innerHTML = 'Made sure Sery_Bot a Mod ✅';
			document.getElementById('seryAuthorized').style.display = 'inline';
		}).catch(err => {
			document.getElementById('modSery').innerHTML = 'Couldn\'t make sure Sery_Bot a Mod ❌: ' + err;
			document.getElementById('authorizeSeryBtn').style.display = 'none';
		});
	}
}
async function seryAuthorizationConfirmed() {
	await join(client);
}
async function join(client) {
	await client.say('wissididombot', '!join').then(() => {
		document.getElementById('seryJoin').innerHTML = 'Joined after having Sery_Bot authorized ✅';
	}).catch(err => {
		document.getElementById('seryJoin').innerHTML = 'Couldn\'t join after having Sery_Bot authorized ❌';
	});
	document.getElementById('seryAuthorized').style.display = 'none';
	document.getElementById('seryBanOn').style.display = 'inline';
	document.getElementById('seryBanOff').style.display = 'inline';
	document.getElementById('seryOfflineLockOn').style.display = 'inline';
	document.getElementById('seryOfflineLockOff').style.display = 'inline';
	document.getElementById('seryOnlineNotifOn').style.display = 'inline';
	document.getElementById('seryOnlineNotifOff').style.display = 'inline';
}
async function seryBanConfirmed() {
	await followban(client, true);
}
async function seryBanUnconfirmed() {
	await followban(client, false);
}
async function followban(client, on) {
	if (on) {
		await client.say('wissididombot', '!followban').then(() => {
			document.getElementById('seryBan').innerHTML = 'Enabled Sery_Bot\'s ability to ban known bots ✅';
		}).catch(err => {
			document.getElementById('seryBan').innerHTML = 'Couldn\'t enable Sery_Bot\'s ability to ban known bots ❌';
		});
	} else {
		await client.say('wissididombot', '!followbanoff').then(() => {
			document.getElementById('seryBan').innerHTML = 'Disabled Sery_Bot\'s ability to ban known bots ✅';
		}).catch(err => {
			document.getElementById('seryBan').innerHTML = 'Couldn\'t disable Sery_Bot\'s ability to ban known bots ❌';
		});
	}
}
async function seryOfflineLockConfirmed() {
	await offlinelock(client, true);
}
async function seryOfflineLockUnconfirmed() {
	await offlinelock(client, false);
}
async function offlinelock(client, on) {
	if (on) {
		await client.say('wissididombot', '!offlinelock').then(() => {
			document.getElementById('seryOfflineLock').innerHTML = 'Enabled Sery_Bot\'s Offline Lockdown ✅';
		}).catch(err => {
			document.getElementById('seryOfflineLock').innerHTML = 'Couldn\'t enable Sery_Bot\'s Offline Lockdown ❌';
		});
	} else {
		await client.say('wissididombot', '!offlinelockoff').then(() => {
			document.getElementById('seryOfflineLock').innerHTML = 'Disabled Sery_Bot\'s Offline Lockdown ✅';
		}).catch(err => {
			document.getElementById('seryOfflineLock').innerHTML = 'Couldn\'t disable Sery_Bot\'s Offline Lockdown ❌';
		});
	}
}
async function seryOnlineNotifConfirmed() {
	await onlinenotif(client, true);
}
async function seryOnlineNotifUnconfirmed() {
	await onlinenotif(client, false);
}
async function onlinenotif(client, on) {
	if (on) {
		await client.say('wissididombot', '!onlinenotif').then(() => {
			document.getElementById('seryOnlineNotif').innerHTML = 'Enabled Sery_Bot\'s Online Notification ✅';
		}).catch(err => {
			document.getElementById('seryOnlineNotif').innerHTML = 'Couldn\'t enable Sery_Bot\'s Online Notification ❌';
		});
	} else {
		await client.say('wissididombot', '!onlinenotifoff').then(() => {
			document.getElementById('seryOnlineNotif').innerHTML = 'Disabled Sery_Bot\'s Online Notification ✅';
		}).catch(err => {
			document.getElementById('seryOnlineNotif').innerHTML = 'Couldn\'t disable Sery_Bot\'s Online Notification ❌';
		});
	}
}
if (window.accessToken) {
	document.getElementById('authorizeSetupBtn').style.display = 'none';
	document.getElementById('authorizeSeryBtn').style.display = 'inline';
	(async () => {
		window.username = (await fetch('https://api.twitch.tv/helix/users', {
			headers: {
				'Client-ID': '3mae1yavxj9shdb5ucwpn3w7s54lie',
				'Authorization': `Bearer ${accessToken}`
			}
		}).then(res => res.json()).then(json => json.data[0].login));
		connectAndStartSetup();
	})();
}