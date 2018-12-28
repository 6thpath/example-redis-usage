import 'dotenv/config'
import express from 'express'
import { MongoClient } from 'mongodb'
import { RedisClient } from 'redis'

import access from './access'

const app = express()
const redis = RedisClient(6379, 'localhost')

MongoClient.connect(process.env.MONGODB_URL, { useNewUrlParser: true }, (err, db) => {
  if (err) {
    console.log(`Failed to connect to database: ${err}`)
  } else {
    console.log(`Database connected: ${[process.env.MONGODB_URL.split('@')[1]]}`)
  }

  app.post('/book', function (req, res) {
    if (!req.body.title || !req.body.author) res.status(400).send("Please send a title and an author for the book")
    else if (!req.body.text) res.status(400).send("Please send some text for the book")
    else {
        access.saveBook(db, redis, req.body.title, req.body.author, req.body.text, function (err) {
            if (err) res.status(500).send("Server error")
            else res.status(201).send("Saved")
        })
    }
  })

  app.get('/book/:title', function (req, res) {
      if (!req.param('title')) res.status(400).send("Please send a proper title")
      else {
          access.findBookByTitle(db, redis, req.param('title'), function (book) {
              if (!text) res.status(500).send("Server error")
              else res.status(200).send(book)
          })
      }
  })

  app.listen(process.env.PORT, () => {
    console.log(`Server started at http://localhost:${process.env.PORT}/`)
  })
})