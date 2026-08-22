const mongoose = require('mongoose')


const messageSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    conversationId: {
        type: String,
        default: "default"
    },
    content: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["user", "assistant", "system"],
        default: "user"
    }
}, { timestamps: true })

const messageModel = mongoose.model("message", messageSchema)

module.exports = messageModel