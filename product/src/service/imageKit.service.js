let ImageKit = require("imagekit");
const { v4: uuidv4 } = require('uuid');

let imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLICKEY,
    privateKey: process.env.IMAGEKIT_PRIVATEKEY,
    urlEndpoint: process.env.IMAGEKIT_URL
});


async function uploadImage(buffer) {
    try {
        const response = await imagekit.upload({
            file: buffer, // Buffer of the image file
            fileName: uuidv4(), // Unique name for the image file
            folder: "/products" // Optional: specify a folder in ImageKit
        });
        return {
            url: response.url,
            thumbnail: response.thumbnailUrl || response.url,
            id: response.fileId,
        };
    } catch (error) {
        throw new Error("Image upload failed: " + error.message);
    }
}

module.exports = {
    uploadImage
};