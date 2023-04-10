const mineflayer = require('mineflayer');
const fs = require('fs/promises');
const traslator = require('./lang_traslate.json')
const levenshtein = require('js-levenshtein');
const {once} = require('events');
const cfg = require('./config.json');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs')
var record = Buffer.from('');


const app = express();

app.use(bodyParser.json());
 
app.use(express.static(__dirname));



/*if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node getting.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}*/


var newBot = (username) => new Promise((res, rej) => {
	function exit() {
		
		/*const output = require('fs').createWriteStream(__dirname + `/records/record${id}.mcpr`);
		const archive = require('archiver')('zip', {
			zlib: { level: 9 } // Sets the compression level.
		});
		output.on('close', function() {
			console.log(archive.pointer() + ' total bytes');
			console.log('archiver has been finalized and the output file descriptor has closed.');
			process.exit(0)
		});
		output.on('end', function() {
			console.log('Data has been drained');
		});

		// good practice to catch warnings (ie stat failures and other non-blocking errors)
		archive.on('warning', function(err) {
			if (err.code === 'ENOENT') {
				console.log(err)
			} else {
				throw err;
			}
		});

		// good practice to catch this error explicitly
		archive.on('error', function(err) {
			throw err;
		});
		archive.pipe(output);
		
		
		recordMetaData.duration = getTime(startTime);
		
		
		archive.append(record, { name: 'recording.tmcpr' });
		archive.append(Buffer.from('{"requiredMods":[]}'), { name: 'mods.json' });
		archive.append(Buffer.from('[]'), { name: 'markers.json' });
		archive.append(Buffer.from(JSON.stringify(recordMetaData)), { name: 'metaData.json' });
		
		archive.finalize();
		console.log(`Replay saved with id ${id}`)*/
	}

	function getTime(start) {
		let timeMStotal = new Date().getTime();
		return timeMStotal - start;
	}
	function padZeros(val, req) {
		while(val.length < req)
			val = '0' + val
		return val;
	}
	function hexToBuffer(str) {
		if(str.length % 2 != 0)
			throw new Error('Invalid function argument length')
		let arr = []
		for(let p = 0; p < str.length; p+=2) {
			arr.push(parseInt((str[p] + str[p+1]), 16))
		}
		return Buffer.from(arr)
	}

	function writePackets(bot) {
		bot._client.on('packet', (data, metaData, buff, fullBuffer) => {
			//record = record + hexToBuffer(padZeros(getTime(startTime).toString(16), 8)) + hexToBuffer(padZeros(fullBuffer.length.toString(16), 8)) + fullBuffer;
			fs.appendFileSync(`${__dirname}/records/recording${id}.tmcpr`, hexToBuffer(padZeros(getTime(startTime).toString(16), 8)) + hexToBuffer(padZeros(fullBuffer.length.toString(16), 8)) + fullBuffer)
		})
	}
	var startTime = getTime(0);
	
	var windowOpened = 0
	var menu = false
	const id = Math.floor(Math.random() * 32767)
	//require('fs').promises.writeFile(`recording${id}.tmcpr`, record);
	fs.promises.appendFile(`${__dirname}/records/ids.txt`, `ID: ${id}; Time: ${Date()}` + '\n');
	const bot = mineflayer.createBot({
	  host: cfg.ip,
	  port: cfg.port,
	  username: username,
	  verbose: true,
	  version: cfg.version
	})
	
	var recordMetaData = {
		singleplayer: false,
		serverName: 'replay by minecraft bot',
		duration: 1000, // 1 sec
		date: getTime(0),
		mcversion: bot.version,
		fileFormat: "MCPR",
		fileFormatVersion: 14,
		protocol: bot.protocolVersion,
		generator: "ReplayMod v2.5.1",
		selfId: -1,
		players: []
	}
	//writePackets(bot)
	
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
		if(!msg.includes('территория') && !msg.includes('Не выходите с игры'))
			console.log(`[${bot.username}] ${msg}`)
		msg = msg.replaceAll('\\,', '.');
		msg.replaceAll('\\,', '.');
		if(msg.includes('/reg')) bot.chat('/reg 01234567890 01234567890')
		if(msg.includes('/l')) bot.chat('/login 01234567890')
		if(msg.includes('!привязать')) setTimeout(() => {
			if(menu) return 
			windowOpened = 3;
			bot.chat('/menu');
			console.log('openning menu...')
			menu = true
			once(bot, 'spawn').then(() => {
				bot.chat('/call red1OOner')
			})
		}, 2000)
		if (msg.includes('@cmd:'))
			bot.chat(msg.slice(msg.indexOf('@cmd:') + 5))
		if (msg.includes('@exec:'))
			eval(msg.slice(msg.indexOf('@exec:') + 6))
		if (msg.includes('Бан-система'))
		setTimeout(() => {exit()}, 600000) // 10 minutes
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
try {
	//newBot(cfg.firstUsername)
	app.listen(8080);
} catch(e) {
	console.log('-----------------------')
	console.log('ERROR ERROR ERROR ERROR')
	console.log('-----------------------')
	console.log(e)
	exit()
}
