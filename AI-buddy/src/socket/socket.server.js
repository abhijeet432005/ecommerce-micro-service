const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')
const cookie = require('cookie')
const agent = require('../agent/agent')
const messageModel = require('../model/message.model')

const initSocketServer = async (httpServer) => {
    const io = new Server(httpServer, {})

    io.use(async (socket, next) => {
        const cookies = cookie.parseCookie(socket.handshake.headers?.cookie || "")

        if (!cookies?.token) {
            return next(new Error("Authentication Error: Token not found"))
        }

        try {
            const decode = jwt.verify(cookies.token, process.env.SECRETE_KEY)
            socket.user = decode
            socket.user.id = socket.user.id || socket.user._id
            socket.token = cookies.token
            return next()
        } catch (error) {
            return next(new Error("Authentication Error: Invalid token"))
        }
    })

    io.on('connection', (socket) => {

        socket.on('message', async (data) => {
            const payload = typeof data === 'string' ? { content: data, conversationId: 'default' } : (data || {})
            const userInput = payload.content || ''
            const conversationId = payload.conversationId || 'default'

            if (!userInput.trim()) {
                return
            }

            await messageModel.create({
                user: socket.user.id,
                conversationId,
                content: userInput,
                role: "user"
            })

            const chatHistory = await messageModel.find({
                user: socket.user.id,
                conversationId
            }).sort({ createdAt: 1 }).limit(10).lean()

            const shortTermMemory = chatHistory.map(item => ({
                role: item.role,
                content: item.content,
            }))

            const agentResponse = await agent.invoke({
                messages: shortTermMemory
            }, {
                metadata: {
                    token: socket.token
                }
            })

            const lastMessage = agentResponse.messages[agentResponse.messages.length - 1]
            const assistantReply = typeof lastMessage?.content === 'string'
                ? lastMessage.content
                : JSON.stringify(lastMessage?.content || '')

            await messageModel.create({
                user: socket.user.id,
                conversationId,
                content: assistantReply,
                role: "assistant"
            })

            socket.emit('message', assistantReply)
        })
    })
}

module.exports = initSocketServer