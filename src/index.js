const { CommandClient, TextChannel } = require("eris");
const { Pool } = require("pg");

require("dotenv").config({path: "../.env"});

const CREATE_CHANNEL_TABLE = `CREATE TABLE IF NOT EXISTS "{id}" (
	id VARCHAR(18) PRIMARY KEY NOT NULL,
	user_id VARCHAR(18) NOT NULL,
	username VARCHAR(37) NOT NULL,
	content VARCHAR(2500) NOT NULL,
	timestamp TEXT NOT NULL
)`

const INSERT_MESSAGE = `INSERT INTO 
	"{id}" (id, user_id, username, content, timestamp)
	VALUES($1, $2, $3, $4, $5)
`;

const db = new Pool({
	connectionString: process.env.DATABASE_CONNECTION_STRING
});

const client = new CommandClient(process.env.TOKEN, {
	decription: "A bot to save chat messages in database :)",
	prefix: ["@mention", "."],
	owner: "Piyush#4332"
});

client.on("ready", async () => {
	console.log("[BOT] Ready");
	await db.connect();
});


db.on("connect", () => {
	console.log("[DATABASE] Connected");
});

client.on("messageCreate", async (message) => {
	if(message.author.bot || !(message.channel instanceof TextChannel) || process.env.GUILD_id !== message.channel.guild.id) return;
	try {
		await db.query(CREATE_CHANNEL_TABLE.replace("{id}", message.channel.id));
		await db.query(INSERT_MESSAGE.replace("{id}", message.channel.id), [message.id, message.author.id, `${message.author.username}#${message.author.discriminator}`, message.content, message.timestamp.toString()]);
	} catch (err) {
		console.log(err);
	}
});

client.connect();