import express from 'express';
import Conversation from '../models/Conversation.js';
const router = express.Router();

/**
 * POST /conversations
 * Creates a new conversation between the sender and receiver.
 * @returns the existing conversation. If a conversation already exists
 */
router.post('/', async (req, res) => {
  // Check if conversation already exists
  const existingConvs = await Conversation.findOne({
    members: { $all: [req.body.senderId, req.body.receiverId] },
  });
  if (existingConvs) {
    // Return existing conversation
    return res.status(200).json({
      existingConversation: true, // To let the client know that an existing conversation was found
      _id: existingConvs._id, // Return the conversation's _id
    });
  }
  // If no existing conversation is found, create a new one
  const newConversation = new Conversation({
    members: [req.body.senderId, req.body.receiverId], // Members of the conversation
  });
  try {
    // Save the new conversation to the DB
    const savedConvo = await newConversation.save();
    res.status(200).json({
      ...savedConvo, // Return the new conversation
      existingConversation: false, // To let the client know there was no existing conversation
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /conversations
 * Returns all conversations.
 * @returns {Array<Object>} An array of conversations.
 */
router.get('/', async (req, res) => {
  try {
    const conversations = await Conversation.find();
    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /conversations/:userId
 * Returns all conversations the user is a part of.
 * @param {string} userId The user's id.
 * @returns {Array<Object>} An array of conversations the user is in.
 */
router.get('/:userId', async (req, res) => {
  try {
    const conversation = await Conversation.find({
      members: { $in: [req.params.userId] },
    });

    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Delete a conversation
 * @route DELETE /conversations/{userId}/{friendId}
 * @param {string} userId.path.required The user's id
 * @param {string} friendId.path.required The friend's id
 * @returns {Object} 200 - The deleted conversation
 * @returns {Error} 500 - The error that occurred while deleting the conversation
 */
router.delete('/:userId/:friendId', async (req, res) => {
  const { userId, friendId } = req.params;
  try {
    const dlted = await Conversation.deleteOne({
      members: { $all: [userId, friendId] },
    });
    res.send(dlted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Update a conversation's `checked` field to `true`
 * @route PUT /conversations/{convoId}/delete-convo
 * @param {string} convoId.path.required The conversation's id
 * @returns {Object} 200 - The updated conversation
 * @returns {Error} 500 - The error that occurred while updating the conversation
 */
router.put('/:convoId/delete-convo', async (req, res) => {
  const convoId = req.params.convoId;
  try {
    console.log('>>>>>', convoId);
    const dlted = await Conversation.findByIdAndDelete(convoId);
    res
      .status(200)
      .json({
        deleted: true,
        msg: 'conversation deleted successfully',
        err: false,
      });
  } catch (error) {
    res.status(500).json({ deleted: false, msg: error.message, err: true });
  }
});

/**
 * Update a conversation's `checked` field to `true`
 * @route PUT /conversations/{convoId}/update-check/
 * @param {string} convoId.path.required The conversation's id
 * @returns {Object} 200 - The updated conversation
 * @returns {Error} 500 - The error that occurred while updating the conversation
 */
router.put('/:convoId/update-check/', async (req, res) => {
  try {
    const resp = await Conversation.findByIdAndUpdate(
      req.params.convoId,
      { checked: true },
      { new: true },
    );
    res.status(200).json(resp);
  } catch (error) {
    res.status(500).json({ msg: error.message, err: true });
  }
});

export default router;
