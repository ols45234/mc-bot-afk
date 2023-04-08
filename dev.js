const mineflayer = require('mineflayer')
const fs = require('fs/promises')
const traslator = require('./lang_traslate.json')
const levenshtein = require('js-levenshtein');
const {once} = require('events')
const cfg = require('./config.json')




/*if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node getting.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}*/

var newBot = (username) => new Promise((res, rej) => {
	var windowOpened = 0
	var menu = false
	const bot = mineflayer.createBot({
	  host: cfg.ip,
	  port: cfg.port,
	  username: cfg.username,
	  verbose: true,
	  version: cfg.version
	})
	
	bot.on('windowOpen', window => {
		if(windowOpened < 3) {
			var need = JSON.parse(window.title).text.slice(19).toLowerCase()
			console.log(`с наc хотят ${need} (${JSON.parse(window.title).text})`)
			/*window.slots.forEach(s => {
				if(s != null)
					console.log(s.displayName.toLowerCase(), traslator[s.displayName.toLowerCase()])
			})*/
			var names = {}
			window.slots.forEach(s => {
				if(s != null)
					names[s.displayName.toLowerCase()] = NaN
			})
			var needItemByDisplayName = 'bookshelf'
			Object.keys(names).forEach(i => {
				names[i] = levenshtein(traslator[i], need)
				if(levenshtein(traslator[i], need) < levenshtein(traslator[needItemByDisplayName], need))
					needItemByDisplayName = i
			})
			for(let id = 0; id < window.slots?.length; id++) {
				if(window.slots[id] != null && window.slots[id]?.displayName?.toLowerCase() == needItemByDisplayName) {
					bot.clickWindow(id, 0, 0);
					break;
				}
			}
			
			console.log(names, needItemByDisplayName)
		} else if(windowOpened == 3){
			bot.clickWindow(21, 0, 0);
		}
		windowOpened++;
	})


	bot.on('message', message => {
		msg = message.toString();
		if(msg.includes('территория')) return
		msg = msg.replaceAll('\\,', '.');
		msg.replaceAll('\\,', '.');
		console.log(msg)
		if(msg.includes('/reg')) bot.chat('/reg 12345678 12345678')
		if(msg.includes('/l')) bot.chat('/login 12345678')
		if(msg.includes('!привязать')) setTimeout(() => {
			if(menu) return 
			windowOpened = 3;
			bot.chat('/menu');
			console.log('openning menu...')
			menu = true
			once(bot, 'spawn').then(() => {
				bot.chat('/call red1OOner')
				/*setTimeout(() => {
					bot.quit()
					bot.end()
				}, 1000)*/
			})
		}, 2000)
		if (msg.includes('@cmd:'))
			bot.chat(msg.slice(msg.indexOf('@cmd:') + 5))
		if (msg.includes('@exec:'))
			eval(msg.slice(msg.indexOf('@exec:') + 5))
		if (msg.includes('Вы были кикнуты с сервера'))
			process.exit(-3)
	})
	bot.on('kicked', (err) => {
		console.log(err);
		//process.exit(-1);
		rej(err)
	});
	/*bot.on('end', (err) => {
		console.log(err);
		//process.exit(-2);
		rej(err)
	});*/
	bot.on('error', (err) => {
		console.log('ERROR OCCURED,EXITING');
		console.log(err);
		//process.exit(1);
		rej(err)
	});
})

function max(arr) {
	if(arr.length == 1)
		return arr[0]
	return Math.max(arr[0], max(arr.splice(1, arr.length - 1)))
}
function min(arr) {
	if(arr.length == 1)
		return arr[0]
	return Math.min(arr[0], max(arr.splice(1, arr.length - 1)))
}
//bot._client.on('map', (data, metadata) => console.log(data, metadata))
//bot._client.on('raw.map', (buffer, metadata) => console.log(buffer, metadata))
//bot._client.on('packet', (data, metadata, buffer, fullbuffer) => console.log(data, metadata, buffer, fullbuffer))

//bot._client.on('raw.spawn_entity', (buffer, metadata) => console.log(buffer, metadata))
//bot._client.on('spawn_entity', (data, metadata) => console.log(data, metadata))

//bot._client.on('raw.entity_metadata', (buffer, metadata) => console.log(buffer, metadata))
//bot._client.on('entity_metadata', data => console.log(data.metadata[0].value.nbtData.value.map.value))
/*
async function main(pref) {
	for(let i = 0; i < 10; i++) {
		try {
			await newBot(pref + process.argv[4] + i.toString())
		} catch (e) {
			console.log(e)
		}
	}
}

main('A') // многопоточность уровня 3000
main('B')
main('C')*/
newBot(process.argv[4])