var Redis, Url

Url = require('url')

Redis = require('redis')

module.exports = function (robot) {
  var client, getData, info, prefix, redisUrl, redisUrlEnv, ref
  redisUrl = process.env.REDISTOGO_URL != null ? (redisUrlEnv = 'REDISTOGO_URL', process.env.REDISTOGO_URL) : process.env.REDISCLOUD_URL != null ? (redisUrlEnv = 'REDISCLOUD_URL', process.env.REDISCLOUD_URL) : process.env.BOXEN_REDIS_URL != null ? (redisUrlEnv = 'BOXEN_REDIS_URL', process.env.BOXEN_REDIS_URL) : process.env.REDIS_URL != null ? (redisUrlEnv = 'REDIS_URL', process.env.REDIS_URL) : 'redis://localhost:6379'
  if (redisUrlEnv != null) {
    robot.logger.info('hubot-redis-brain: Discovered redis from ' + redisUrlEnv + ' environment variable')
  } else {
    robot.logger.info('hubot-redis-brain: Using default redis on localhost:6379')
  }
  info = Url.parse(redisUrl, true)
  client = info.auth ? Redis.createClient(info.port, info.hostname, {
    no_ready_check: true
  }) : Redis.createClient(info.port, info.hostname)
  prefix = ((ref = info.path) != null ? ref.replace('/', '') : void 0) || 'discobot'
  robot.brain.setAutoSave(false)
  getData = function () {
    return client.get(prefix + ':storage', function (err, reply) {
      if (err) {
        throw err
      } else if (reply) {
        robot.logger.info('hubot-redis-brain: Data for ' + prefix + ' brain retrieved from Redis')
        robot.brain.mergeData(JSON.parse(reply.toString()))
      } else {
        robot.logger.info('hubot-redis-brain: Initializing new data for ' + prefix + ' brain')
        robot.brain.mergeData({})
      }
      return robot.brain.setAutoSave(true)
    })
  }
  if (info.auth) {
    client.auth(info.auth.split(':')[1], function (err) {
      if (err) {
        return robot.logger.error('hubot-redis-brain: Failed to authenticate to Redis')
      } else {
        robot.logger.info('hubot-redis-brain: Successfully authenticated to Redis')
        return getData()
      }
    })
  }
  client.on('error', function (err) {
    if (/ECONNREFUSED/.test(err.message)) {
    } else {
      return robot.logger.error(err.stack)
    }
  })
  client.on('connect', function () {
    robot.logger.debug('hubot-redis-brain: Successfully connected to Redis')
    if (!info.auth) {
      return getData()
    }
  })
  robot.brain.on('save', function (data) {
    if (data == null) {
      data = {}
    }
    return client.set(prefix + ':storage', JSON.stringify(data))
  })
  return robot.brain.on('close', function () {
    return client.quit()
  })
}

// ---
// generated by coffee-script 1.9.2
