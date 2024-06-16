var accessToken = getHashValue('access_token');
var user = null;
function getHashValue(key) {
	matches = location.hash.match(new RegExp(key+'=([^&]*)'));
	return matches ? matches[1] : null;
}
async function makeSureSeryBotIsMod() {
	let mods = (await fetch(`https://api.twitch.tv/helix/moderation/moderators?broadcaster_id=${user.id}&user_id=402337290`, { // 402337290 = Sery_Bot
		headers: {
			'Client-ID': '3mae1yavxj9shdb5ucwpn3w7s54lie',
			'Authorization': `Bearer ${accessToken}`
		}
	}).then(res => res.json()).then(json => json.data.map(d => d.user_id)));
	if (mods.includes('402337290')) { // 402337290 = Sery_Bot
		document.getElementById('modSery').innerText = 'Made sure Sery_Bot is a Mod ✅ (Sery_Bot already is a mod)';
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
async function sendChatMessage(channelId, senderId, message) {
	await fetch('https://api.twitch.tv/helix/chat/messages', {
		method: 'POST',
		headers: {
			'Client-ID': '3mae1yavxj9shdb5ucwpn3w7s54lie',
			'Authorization': `Bearer ${accessToken}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			broadcaster_id: channelId,
			sender_id: senderId,
			message
		})
	}).then(async res => {
		switch (res.status) {
			case 200: // 200 Ok
				return res;
			case 400: // 400 Bad Request - Missing or invalid broadcaster_id, missing or invalid sender_id, missing message, invalid reply_parent_message_id
			case 401: // 401 Unauthorized
			case 403: // 403 Forbidden - The sender is not permitted to send chat messages to the broadcaster's chat room
			case 422: // 422 Unprocessable Entity - The message is too large
			default:
				throw res;
		}
	});
}
async function join() {
	await sendChatMessage('402337290', user.id, '!join').then((res) => { // 402337290 = Sery_Bot
		document.getElementById('seryJoin').innerText = 'Joined after having Sery_Bot authorized ✅';
	}).catch((res) => {
		document.getElementById('seryJoin').innerText = 'Couldn\'t join after having Sery_Bot authorized ❌';
	});
	document.getElementById('seryAuthorized').style.display = 'none';
	document.getElementById('seryBanOn').style.display = 'inline';
	document.getElementById('seryBanOff').style.display = 'inline';
	document.getElementById('seryOfflineLockOn').style.display = 'inline';
	document.getElementById('seryOfflineLockOff').style.display = 'inline';
	document.getElementById('seryOnlineNotifOn').style.display = 'inline';
	document.getElementById('seryOnlineNotifOff').style.display = 'inline';
	document.getElementById('seryAdTimerOn').style.display = 'inline';
	document.getElementById('seryAdTimerOff').style.display = 'inline';
	document.getElementById('seryAdTimerMsgText').style.display = 'inline';
	document.getElementById('seryAdTimerMsgEndText').style.display = 'inline';
	document.getElementById('seryAdTimerMsgClear').style.display = 'inline';
	document.getElementById('seryRaidOutOn').style.display = 'inline';
	document.getElementById('seryRaidOutOff').style.display = 'inline';
	document.getElementById('seryRaidOutMsgText').style.display = 'inline';
	document.getElementById('seryRaidOutMsgClear').style.display = 'inline';
}
async function followban(on) {
	if (on) {
		await sendChatMessage('402337290', user.id, '!followban').then((res) => { // 402337290 = Sery_Bot
			document.getElementById('seryBan').innerText = 'Enabled Sery_Bot\'s ability to ban known bots ✅';
		}).catch((res) => {
			document.getElementById('seryBan').innerText = 'Couldn\'t enable Sery_Bot\'s ability to ban known bots ❌';
		});
	} else {
		await sendChatMessage('402337290', user.id, '!followbanoff').then((res) => { // 402337290 = Sery_Bot
			document.getElementById('seryBan').innerText = 'Disabled Sery_Bot\'s ability to ban known bots ✅';
		}).catch((res) => {
			document.getElementById('seryBan').innerText = 'Couldn\'t disable Sery_Bot\'s ability to ban known bots ❌';
		});
	}
}
async function offlinelock(on) {
	if (on) {
		await sendChatMessage('402337290', user.id, '!offlinelock').then((res) => { // 402337290 = Sery_Bot
			document.getElementById('seryOfflineLock').innerText = 'Enabled Sery_Bot\'s Offline Lockdown ✅';
		}).catch((res) => {
			document.getElementById('seryOfflineLock').innerText = 'Couldn\'t enable Sery_Bot\'s Offline Lockdown ❌';
		});
	} else {
		await sendChatMessage('402337290', user.id, '!offlinelockoff').then((res) => { // 402337290 = Sery_Bot
			document.getElementById('seryOfflineLock').innerText = 'Disabled Sery_Bot\'s Offline Lockdown ✅';
		}).catch((res) => {
			document.getElementById('seryOfflineLock').innerText = 'Couldn\'t disable Sery_Bot\'s Offline Lockdown ❌';
		});
	}
}
async function onlinenotif(on) {
	if (on) {
		await sendChatMessage('402337290', user.id, '!onlinenotif').then((res) => { // 402337290 = Sery_Bot
			document.getElementById('seryOnlineNotif').innerText = 'Enabled Sery_Bot\'s Online Notification ✅';
		}).catch((res) => {
			document.getElementById('seryOnlineNotif').innerText = 'Couldn\'t enable Sery_Bot\'s Online Notification ❌';
		});
	} else {
		await sendChatMessage('402337290', user.id, '!onlinenotifoff').then((res) => { // 402337290 = Sery_Bot
			document.getElementById('seryOnlineNotif').innerText = 'Disabled Sery_Bot\'s Online Notification ✅';
		}).catch((res) => {
			document.getElementById('seryOnlineNotif').innerText = 'Couldn\'t disable Sery_Bot\'s Online Notification ❌';
		});
	}
}
async function adtimer(on) {
	if (on) {
		await sendChatMessage('402337290', user.id, '!adtimer').then((res) => { // 402337290 = Sery_Bot
			document.getElementById('seryAdTimer').innerText = 'Enabled Sery_Bot\'s Ad Timer ✅';
		}).catch((res) => {
			document.getElementById('seryAdTimer').innerText = 'Couldn\'t enable Sery_Bot\'s Ad Timer ❌';
		});
	} else {
		await sendChatMessage('402337290', user.id, '!adtimeroff').then((res) => { // 402337290 = Sery_Bot
			document.getElementById('seryAdTimer').innerText = 'Disabled Sery_Bot\'s Ad Timer ✅';
		}).catch((res) => {
			document.getElementById('seryAdTimer').innerText = 'Couldn\'t disable Sery_Bot\'s Ad Timer ❌';
		});
	}
}
async function adtimermsg(begin) {
	if (begin) {
		await sendChatMessage('402337290', user.id, '!adtimermsg ' + document.getElementById('seryAdTimerMsgText').value).then((res) => { // 402337290 = Sery_Bot
			document.getElementById('seryAdTimer').innerText = 'Set Sery_Bot\'s Ad Timer Begin Message ✅';
		}).catch((res) => {
			document.getElementById('seryAdTimer').innerText = 'Couldn\'t set Sery_Bot\'s Ad Timer Begin Message ❌';
		});
	} else {
		await sendChatMessage('402337290', user.id, '!adtimermsgend ' + document.getElementById('seryAdTimerMsgEndText').value).then((res) => { // 402337290 = Sery_Bot
			document.getElementById('seryAdTimer').innerText = 'Set Sery_Bot\'s Ad Timer End Message ✅';
		}).catch((res) => {
			document.getElementById('seryAdTimer').innerText = 'Couldn\'t set Sery_Bot\'s Ad Timer End Message ❌';
		});
	}
}
async function adtimerclear() {
	await sendChatMessage('402337290', user.id, '!adtimermsg ' + document.getElementById('seryAdTimerMsgText').value).then((res) => { // 402337290 = Sery_Bot
		document.getElementById('seryAdTimer').innerText = "Reset Sery_Bot's Ad Timer Begin Message to it's default value ✅";
	}).catch((res) => {
		document.getElementById('seryAdTimer').innerText = "Couldn't reset Sery_Bot\s Ad Timer Begin Message to it's default value ❌";
	});
}
async function raidout(on) {
	if (on) {
		await sendChatMessage('402337290', user.id, '!raidoutalert').then((res) => { // 402337290 = Sery_Bot
			document.getElementById('seryRaidOut').innerText = 'Enabled Sery_Bot\'s Raid Out Alert ✅';
		}).catch((res) => {
			document.getElementById('seryRaidOut').innerText = 'Couldn\'t enable Sery_Bot\'s Raid Out Alert ❌';
		});
	} else {
		await sendChatMessage('402337290', user.id, '!raidoutalertoff').then((res) => { // 402337290 = Sery_Bot
			document.getElementById('seryRaidOut').innerText = 'Disabled Sery_Bot\'s Raid Out Alert ✅';
		}).catch((res) => {
			document.getElementById('seryRaidOut').innerText = 'Couldn\'t disable Sery_Bot\'s Raid Out Alert ❌';
		});
	}
}
async function raidoutmsg(clear) {
	if (clear) {
		await sendChatMessage('402337290', user.id, '!clearraidoutmsg').then((res) => { // 402337290 = Sery_Bot
			document.getElementById('seryRaidOut').innerText = 'Reset Sery_Bot\'s Raid Out Message to it\'s default value ✅';
		}).catch((res) => {
			document.getElementById('seryRaidOut').innerText = 'Couldn\'t reset Sery_Bot\'s Raid Out Message to it\'s default value ❌';
		});
	} else {
		await sendChatMessage('402337290', user.id, '!raidoutmsg').then((res) => { // 402337290 = Sery_Bot
			document.getElementById('seryRaidOut').innerText = 'Set Sery_Bot\'s Raid Out Message ✅';
		}).catch((res) => {
			document.getElementById('seryRaidOut').innerText = 'Couldn\'t set Sery_Bot\'s Raid Out Message ❌';
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
		makeSureSeryBotIsMod();
	})();
}
