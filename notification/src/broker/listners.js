const sendEmail = require("../email")
const { subscribeToQueue } = require("./broker")



module.exports = function () {
    subscribeToQueue("AUTH_NOTIFICATION.USER_CREATED", async (data) => {
        const emailHTMLTemplate = `
            <h1>Welcome!</h1>
            <p>Hello, ${data.fullName.firstName + " " + (data.fullName.lastName || "")}!</p>
            <p>Thank you for signing up. We're excited to have you on board!</p>
            <p>Best regards,<br>Your Company</p>
        `

        await sendEmail(data.email, "Welcome to Our Service!", "Thank you for signing up!", emailHTMLTemplate)
    })

    // PRODUCT_NOTIFICATION.PRODUCT_CREATED
    subscribeToQueue("PRODUCT_NOTIFICATION.PRODUCT_CREATED", async (data) => {
        const emailHTMLTemplate = `
            <h1>Product Created</h1>
            <p>Hello! ${data.userName}</p>
            <p>Your product with ID ${data.productId} has been successfully created.</p>
            <p>Best regards,<br>Your Company</p>
        `

        await sendEmail(data.email, "Product Created", `Your product with ID ${data.productId} has been successfully created.`, emailHTMLTemplate)
    })

    subscribeToQueue("PAYMENT_NOTIFICATION.PAYMENT_INITIATED", async (data) => {
        const emailHTMLTemplate = `
            <h1>Payment Initiated</h1>
            <p>Hello, ${data.userName}!</p>
            <p>Your payment of ${data.currency} Rs${data.amount} has been initiated. We will notify you once it's completed.</p>
            <p>Best regards,<br>Your Company</p>
        `

        await sendEmail(data.email, "Payment Initiated", `Your payment of ${data.currency} Rs${data.amount} has been initiated.`, emailHTMLTemplate)
    })

    subscribeToQueue("PAYMENT_NOTIFICATION.PAYMENT_COMPLETED", async (data) => {
        const emailHTMLTemplate = `
            <h1>Payment Successful!</h1>
            <p>Hello, ${data.userName}!</p>
            <p>Your payment of ${data.currency} Rs.${data.amount} was successful. Thank you for your purchase!</p>
            <p>Best regards,<br>Your Company</p>
        `

        await sendEmail(data.email, "Payment Confirmation", `Your payment of ${data.currency} Rs${data.amount} was successful.`, emailHTMLTemplate)
    })

    subscribeToQueue("PAYMENT_NOTIFICATION.PAYMENT_FAILED", async (data) => {
        const emailHTMLTemplate = `
            <h1>Payment Failed</h1>
            <p>Hello, ${data.userName}!</p>
            <p>Unfortunately, your payment of the orderID ${data.orderId} failed. Please try again.</p>
            <p>Best regards,<br>Your Company</p>
        `

        await sendEmail(data.email, "Payment Failed", `Your payment of ${data.currency} Rs${data.amount} failed. Please try again.`, emailHTMLTemplate)
    })
}