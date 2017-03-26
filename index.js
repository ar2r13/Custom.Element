// @flow
'use strict'

import express from 'express'
import http2 from 'spdy'
import fs from 'fs'

const server = express()
const port : number = 1488
const options = {
	key: fs.readFileSync('keys/server.key'),
	cert: fs.readFileSync('keys/server.crt')
}

server.use(express.static('dist'))

http2.createServer(options, server).listen(port, _ => {
	console.log('He\'s ALIVE!')
})
