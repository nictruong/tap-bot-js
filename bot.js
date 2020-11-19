const Discord = require('discord.js');
const client = new Discord.Client();

function shuffle(a) {
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}

	return a;
}

function chunkArray(arr, n) {
	var chunkLength = Math.max(arr.length / n, 1);
	var chunks = [];
	for (var i = 0; i < n; i++) {
		if (chunkLength * (i + 1) <= arr.length)
			chunks.push(arr.slice(chunkLength * i, chunkLength * (i + 1)));
	}
	return chunks;
}

const getChannel = async (id) => {
	return await client.channels.fetch(id, false, true);
};

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', async (msg) => {
	if (msg.content.startsWith('!team')) {
		const channel = await getChannel(process.env.BASE_CHANNEL_ID);
		const shuffledArray = shuffle(Array.from(channel.members.values()));
		const users = shuffledArray
			.filter((member) => !member.user.bot)
			.map((member) => member.user.username);

		const nbOfTeams = parseInt(msg.content.split(' ')[1]) || 2;
		const teams = chunkArray(users, nbOfTeams);

		const botMessage = teams.reduce((result, team, idx) => {
			return result + '\n' + `Team ${idx + 1}: ${team.join(', ')}`;
		}, '');

		if (botMessage && botMessage !== '') {
			msg.channel.send(botMessage);
		}
	} else if (msg.author.id === '778699790837874689') {
		msg.channel.send('fuck you, BetterBot');
	}
});

client.login(process.env.BOT_TOKEN);
