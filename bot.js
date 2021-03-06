const Discord = require('discord.js');
const { default: fetch } = require('node-fetch');
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
	} else if (msg.content.startsWith('!stats')) {
		// 76561198042509321
		const steamId = msg.content.split(' ')[1];

		if (isNaN(steamId)) {
			msg.channel.send('Invalid Steam ID :(');
		} else {
			try {
				const resp = await fetch(
					`https://aoe2.net/api/player/matches?game=aoe2de&steam_id=${steamId}&count=20`,
					{
						headers: {
							'Content-type': 'application/json',
						},
					}
				);

				const playerHistory = await resp.json();

				const history = playerHistory
					.filter((match) => match.ranked)
					.map((match) => match.players)
					.flat()
					.filter((player) => player.steam_id === steamId);

				const playerName = history[0].name;

				const botMessage = history.reduce((result, match) => {
					return (
						result +
						'\n' +
						`${match.won ? 'won ' : 'lost  '}:   ${match.rating}`
					);
				}, '');

				const embed = new Discord.MessageEmbed()
					.setTitle(playerName)
					.setColor('#fc03f4')
					.setDescription(botMessage);

				msg.channel.send(embed);
			} catch (e) {
				console.error(e);
				msg.channel.send('Bad request :(');
			}
		}
	}
});

client.login(process.env.BOT_TOKEN);
