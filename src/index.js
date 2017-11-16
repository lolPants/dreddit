// Package Dependencies
const log = require('fancylog')
const schedule = require('node-schedule')
const { WebhookClient } = require('discord.js')

// Local Dependencies
const { fetchPosts } = require('./reddit')
const { addRow, accessFile } = require('./cache')

// Environment Variables
const { HOOK_URLS, SUBREDDIT, ALLOW_NSFW } = process.env

// Setup Webhook Clients
const clients = HOOK_URLS.split('|')
  .map(x => {
    const [id, token] = x.split('/').slice(-2)
    let client = new WebhookClient(id, token)
    return client
  })

const main = async () => {
  try {
    let post = await getPost()
    for (let client of clients) {
      try {
        if (post.type === 'image') {
          client.send('', { files: [post.file_url] })
        } else if (post.type === 'gfy') {
          client.send(post.file_url)
        }
      } catch (err) {
        log.error(`Error posting to webhook:\n${err.message}`)
      }
    }
  } catch (err) {
    log.error('No new Posts')
  }
}

const getPost = async () => {
  // Fetch Reddit Posts
  let posts = await fetchPosts(SUBREDDIT)

  let dupes = await accessFile()
  let IDs = dupes.map(x => x.id)
  while (true) { // eslint-disable-line
    if (posts.length === 0) throw new Error('No new posts')
    let id = Math.floor(Math.random() * posts.length)
    let post = posts[id]

    if (IDs.includes(post.id) || (post.nsfw && !(ALLOW_NSFW !== undefined))) {
      posts.splice(id, 1)
      continue
    } else {
      addRow(post.id)
      return post
    }
  }
}

schedule.scheduleJob('*/10 * * * *', () => { main() })