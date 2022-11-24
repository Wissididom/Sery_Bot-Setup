var accessToken = getHashValue('access_token');
var user = null;
var client;
function getHashValue(key) {
	matches = location.hash.match(new RegExp(key+'=([^&]*)'));
	return matches ? matches[1] : null;
}
async function connectAndStartSetup() {
	client = new tmi.Client({
		options: { debug: false },
		identity: {
			username: user.login,
			password: accessToken
		},
		channels: [user.login, 'sery_bot']
	});
	await client.connect().then(([server, port]) => {
		var statusBox = document.getElementById('statusBox');
		statusBox.innerText = `Connected to ${server}:${port}`;
		statusBox.classList = 'green';
		console.log(`Connected to ${server}:${port}`);
	}).catch(err => {
		var statusBox = document.getElementById('statusBox');
		statusBox.innerText = `Error connecting to Twitch Chat: ${err}`;
		statusBox.classList = 'red';
		console.error(`Error connecting to Twitch Chat: ${err}`);
	});
	makeSureSeryBotIsMod();
}
async function makeSureSeryBotIsMod() {
	let mods = (await fetch(`https://api.twitch.tv/helix/moderation/moderators?broadcaster_id=${user.id}&user_id=402337290`, { // 402337290 = Sery_Bot
		headers: {
			'Client-ID': '3mae1yavxj9shdb5ucwpn3w7s54lie',
			'Authorization': `Bearer ${accessToken}`
		}
	}).then(res => res.json()).then(json => json.data.map(d => d.user_id)));
	if (mods.includes('402337290')) { // 402337290 = Sery_Bot
		document.getElementById('modSery').innerText = 'Made sure Sery_Bot a Mod ✅ (Sery_Bot already is a mod)';
		document.getElementById('seryAuthorized').style.display = 'inline';
	} else {
		await fetch(`https://api.twitch.tv/helix/moderation/moderators?broadcaster_id=${user.id}&user_id=402337290`, { // 402337290 = Sery_Bot
			method: 'POST',
			headers: {
				'Client-ID': '3mae1yavxj9shdb5ucwpn3w7s54lie',
				'Authorization': `Bearer ${accessToken}`
			}
		}).then(async res => {
			switch (res.status) {
				case 204: // 204 No Content
					document.getElementById('modSery').innerText = 'Made sure Sery_Bot is a Mod ✅ (Modded Sery_Bot)';
					document.getElementById('seryAuthorized').style.display = 'inline';
					break;
				case 400: // 400 Bad Request - Must be banned because everything else cannot happen (broadcaster_id not found, user_id not found, already a mod)
					document.getElementById('modSery').innerText = 'Couldn\'t make sure Sery_Bot a Mod ❌: Twitch returned 400 Bad Request, probably Sery_Bot was banned.';
					document.getElementById('authorizeSeryBtn').style.display = 'none';
					break;
				case 401: // 401 Unauthorized
					document.getElementById('modSery').innerText = 'Couldn\'t make sure Sery_Bot a Mod ❌: Twitch returned 401 Unauthorized, probably the access token misses the channel:manage:moderators scope or is not valid anymore. Try reauthorizing!';
					document.getElementById('authorizeSeryBtn').style.display = 'none';
					break;
				case 422: // 422 Unprocessable Entity - User is a VIP
					let vipRes = await fetch(`https://api.twitch.tv/helix/moderation/moderators?broadcaster_id=${user.id}&user_id=402337290`, { // 402337290 = Sery_Bot
						method: 'DELETE',
						headers: {
							'Client-ID': '3mae1yavxj9shdb5ucwpn3w7s54lie',
							'Authorization': `Bearer ${accessToken}`
						}
					});
					if (vipRes.status == 204) {
						document.getElementById('modSery').innerText = 'Removed Sery_Bot\' VIP Status for it to be able to become a Mod...';
						document.getElementById('authorizeSeryBtn').style.display = 'none';
					} else {
						document.getElementById('modSery').innerText = 'Couldn\'t make sure Sery_Bot a Mod ❌: Removing VIP Status for it to become a Mod failed! Try removing VIP manually and then use the script again!';
						document.getElementById('authorizeSeryBtn').style.display = 'none';
					}
					break;
				case 429: // 429 Too Many Requests
					document.getElementById('modSery').innerText = 'Couldn\'t make sure Sery_Bot a Mod ❌: Twitch returned 429 Too Many Requests, You\'ve probably added 10 moderators withhin 10 seconds. How is this even possible';
					document.getElementById('authorizeSeryBtn').style.display = 'none';
					break;
			}
		}).catch(err => {
			document.getElementById('modSery').innerText = `Couldn't make sure Sery_Bot a Mod ❌: ${err}`;
			document.getElementById('authorizeSeryBtn').style.display = 'none';
		});
	}
}
async function seryAuthorizationConfirmed() {
	await join(client);
}
async function join(client) {
	await client.say('sery_bot', '!join').then(() => {
		document.getElementById('seryJoin').innerText = 'Joined after having Sery_Bot authorized ✅';
	}).catch(err => {
		document.getElementById('seryJoin').innerText = 'Couldn\'t join after having Sery_Bot authorized ❌';
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
		await client.say('sery_bot', '!followban').then(() => {
			document.getElementById('seryBan').innerText = 'Enabled Sery_Bot\'s ability to ban known bots ✅';
		}).catch(err => {
			document.getElementById('seryBan').innerText = 'Couldn\'t enable Sery_Bot\'s ability to ban known bots ❌';
		});
	} else {
		await client.say('sery_bot', '!followbanoff').then(() => {
			document.getElementById('seryBan').innerText = 'Disabled Sery_Bot\'s ability to ban known bots ✅';
		}).catch(err => {
			document.getElementById('seryBan').innerText = 'Couldn\'t disable Sery_Bot\'s ability to ban known bots ❌';
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
		await client.say('sery_bot', '!offlinelock').then(() => {
			document.getElementById('seryOfflineLock').innerText = 'Enabled Sery_Bot\'s Offline Lockdown ✅';
		}).catch(err => {
			document.getElementById('seryOfflineLock').innerText = 'Couldn\'t enable Sery_Bot\'s Offline Lockdown ❌';
		});
	} else {
		await client.say('sery_bot', '!offlinelockoff').then(() => {
			document.getElementById('seryOfflineLock').innerText = 'Disabled Sery_Bot\'s Offline Lockdown ✅';
		}).catch(err => {
			document.getElementById('seryOfflineLock').innerText = 'Couldn\'t disable Sery_Bot\'s Offline Lockdown ❌';
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
		await client.say('sery_bot', '!onlinenotif').then(() => {
			document.getElementById('seryOnlineNotif').innerText = 'Enabled Sery_Bot\'s Online Notification ✅';
		}).catch(err => {
			document.getElementById('seryOnlineNotif').innerText = 'Couldn\'t enable Sery_Bot\'s Online Notification ❌';
		});
	} else {
		await client.say('sery_bot', '!onlinenotifoff').then(() => {
			document.getElementById('seryOnlineNotif').innerText = 'Disabled Sery_Bot\'s Online Notification ✅';
		}).catch(err => {
			document.getElementById('seryOnlineNotif').innerText = 'Couldn\'t disable Sery_Bot\'s Online Notification ❌';
		});
	}
}
if (window.accessToken) {
	document.getElementById('authorizeSetupBtn').style.display = 'none';
	document.getElementById('authorizeSeryBtn').style.display = 'inline';
	(async () => {
		window.user = (await fetch('https://api.twitch.tv/helix/users', {
			headers: {
				'Client-ID': '3mae1yavxj9shdb5ucwpn3w7s54lie',
				'Authorization': `Bearer ${accessToken}`
			}
		}).then(res => res.json()).then(json => json.data[0]));
		connectAndStartSetup();
	})();
}
