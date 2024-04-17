import express from 'express';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
const router = express.Router();

// add
/**
 * POST /messages/:conversationId
 * Creates a new message in the conversation
 * @param {string} conversationId - ID of the conversation the message belongs to
 * @param {Object} req.body - message object
 * @returns {Object} The saved message
 */
router.post('/:conversationId', async (req, res) => {
  try {
    const newMessage = new Message(req.body);
    const updatedConv = await Conversation.findByIdAndUpdate(
      req.params.conversationId,
      { latestText: req.body.text, checked: false, senderId: req.body.sender },
      { new: true },
    );
    console.log(updatedConv);
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

/**
 * GET /messages/:conversationId
 * Returns all messages in a conversation
 * @param {string} conversationId - ID of the conversation to retrieve messages for
 * @returns {Array<Object>} An array of messages
 */
router.get('/:conversationId', async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

/**
 * PUT /messages/update/:msgId
 * Updates a single message
 * @param {string} msgId - ID of the message to update
 * @param {Object} req.body - Fields to update in the message
 * @returns {Object} The updated message
 */
router.put('/update/:msgId', async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.msgId,
      req.body,
      { new: true },
    );
    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ msg: error.message, err: true });
  }
});

export default router;
