const asyncHandler = require("express-async-handler");
const User = require("../Models/userModel");
const Chat = require("../Models/chatModel");
const Message = require("../Models/messageModel.js");
const sendMessage = asyncHandler(async (req, res) => {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
        console.log("Invalid data passed into request");
        return res.sendStatus(400);
    }
    var message = {
        sender: req.user._id,
        content: content,
        chat: chatId,
    };
    try {
        var createdMessage = await Message.create(message);
        createdMessage = await createdMessage.populate("sender", "name pic");
        createdMessage = await createdMessage.populate("chat");
        createdMessage = await User.populate(createdMessage, {
            path: "chat.users",
            select: "name pic email",
        });
        await Chat.findByIdAndUpdate(req.body.chatId, {
            latestMessage: createdMessage,
        });
        return res.status(200).json({createdMessage})
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
const allMessages = asyncHandler(async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate("sender", "name pic email")
            .populate("chat");
        res.json(messages);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});
module.exports = { sendMessage,allMessages };
