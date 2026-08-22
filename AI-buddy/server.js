const app = require('./src/app')
const http = require('http')
const initSocketServer = require('./src/socket/socket.server')


const httpServer = http.createServer(app)

initSocketServer(httpServer)

httpServer.listen(3005, () => {
    console.log("Server is running on 3005")
})