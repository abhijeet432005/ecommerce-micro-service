require('dotenv').config()

const { StateGraph, MessagesAnnotation } = require('@langchain/langgraph')
const { ChatGroq } = require('@langchain/groq')
const { ToolMessage } = require('@langchain/core/messages')
const tools = require('./tools')

const model = new ChatGroq({
    apiKey: process.env.GROQ_API,
    model: "openai/gpt-oss-120b",
    temperature: 0.5
}).bindTools([tools.searchProduct, tools.addProductToCart])

const graph = new StateGraph(MessagesAnnotation)
    .addNode("tools", async (state, config) => {

        const lastMessage = state.messages[state.messages.length - 1]

        const toolsCall = lastMessage.tool_calls

        const toolCallResults = await Promise.all(toolsCall.map(async (call) => {

            const tool = tools[call.name]
            if (!tool) {
                throw new Error(`Tool ${call.name} not found`)
            }
            const toolInput = call.args


            const toolResult = await tool.invoke({
                ...toolInput
            }, {
                metadata: {
                    token: config?.metadata?.token
                }
            })

            return new ToolMessage({
                content: toolResult,
                name: call.name,
                tool_call_id: call.id
            })

        }))
        return { messages: toolCallResults }
    })
    .addNode("chat", async (state, config) => {
        const response = await model.invoke(state.messages)
        return { messages: [response] }

    })
    .addEdge("__start__", "chat")
    .addConditionalEdges("chat", async (state) => {

        const lastMessage = state.messages[state.messages.length - 1]

        if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
            return "tools"
        } else {
            return "__end__"
        }

    })
    .addEdge("tools", "chat")



const agent = graph.compile()


module.exports = agent