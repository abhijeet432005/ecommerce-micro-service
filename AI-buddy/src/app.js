require('dotenv').config()
const express = require('express')
const connectToDB = require('./db/db')

connectToDB()

const app = express()

module.exports = app