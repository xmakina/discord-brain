/*

 Configuration:
   REDISTOGO_URL or REDISCLOUD_URL or BOXEN_REDIS_URL or REDIS_URL.
   URL format: redis://<host>:<port>[/<brain_prefix>]
   If not provided, '<brain_prefix>' will default to 'discobot'.
   
 */

const Discord = require('discord.js')
const client = new Discord.Client()
const Brain = require('./essentials/brain.js')
var redisBrain = require('./essentials/redis-brain.js')

client.on('ready', () => {
  console.log(`Logged in as ${client.user.username}!`)
})

client.logger = console
// the Brain is a key-value pair
client.brain = new Brain(client)
redisBrain(client)

client.login(process.env.DISCORD_TOKEN)

// basic save message
client.on('message', msg => {
  if (msg.content === 'save') {
      // Save the message author into the brain, with key brainTest
    client.brain.set('brainTest', msg.author) 
    msg.reply('saved!')
  }
})

// basic load message
client.on('message', msg => {
  if (msg.content === 'load') {
    var record = client.brain.get('brainTest')
    if (record === null) {
      msg.reply('No one has saved anything!')
    } else {
      msg.reply('The last person to save was ' + record.toString())
    }
  }
})
