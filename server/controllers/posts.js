import mongoose from 'mongoose';
import Post from '../models/Post.js';
import User from '../models/User.js';
import dayjs from 'dayjs';

/**
 * Create a post
 * @param {Object} req The request object
 * @param {Object} res The response object
 * @returns {Object} The newly created post document as JSON in a 201 CREATED response
 */
export const createPost = async (req, res) => {
  try {
    // The request includes the file and the userId, description and picturePath.
    console.log(req.file);

    // Extract the relevant information from the request body.
    const { userId, description, picturePath } = req.body;

    // Find the user who is making the post.
    const user = await User.findById(userId);

    // Create a new post document with the relevant information.
    const newPost = new Post({
      // The userId of the user who made this post.
      userId,
      // The firstName of the user who made this post.
      firstName: user.firstName,
      // The lastName of the user who made this post.
      lastName: user.lastName,
      // The location of the user who made this post.
      location: user.location,
      // The description of this post.
      description,
      // The path to the user's picture.
      userPicturePath: user.picturePath,
      // The path to the picture for this post.
      picturePath,
      // An empty likes object.
      likes: {},
      // An empty comments array.
      comments: [],
    });

    // Save the new post document to the database.
    await newPost.save();

    // Find all post documents in the database.
    const post = await Post.find();

    // Return the posts as JSON in a 201 CREATED response.
    res.status(201).json(post);
  } catch (err) {
    // If there was a problem saving the post, return a 409 CONFLICT
    // with an error message.
    res.status(409).json({ message: err.message });
  }
};

/**
 * Get the feed posts
 * @param {Object} req The request object
 * @param {Object} res The response object
 * @returns {Array<Object>} An array of posts
 */
export const getFeedPosts = async (req, res) => {
  const { pageNo } = req.query;
  console.log(pageNo);
  let post;
  try {
    if (pageNo !== undefined) {
      // Use MongoDB's skip and limit options to paginate the results
      post = await Post.find().skip(pageNo).limit(10);
    } else {
      post = await Post.find();
    }

    // Return the posts as JSON in a 200 OK response
    res.status(200).json(post);
  } catch (err) {
    // If there was a problem getting the posts, return a 404 NOT FOUND
    // with an error message
    res.status(404).json({ message: err.message });
  }
};

/**
 * Get all the posts for a specific user
 * @param {Object} req The request object
 * @param {Object} res The response object
 * @returns {Array<Object>} An array of posts
 */
export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const post = await Post.find({ userId });
    // Return the posts as JSON in a 200 OK response
    res.status(200).json(post);
  } catch (err) {
    // If there was a problem getting the posts, return a 404 NOT FOUND
    // with an error message
    res.status(404).json({ message: err.message });
  }
};

/**
 * Toggle the like for a post
 * @param {Object} req The request object
 * @param {Object} res The response object
 * @returns {Object} The updated post
 */
export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const post = await Post.findById(id);
    const isLiked = post.likes.get(userId);

    if (isLiked) {
      // Delete the like from the set if the user has liked it
      post.likes.delete(userId);
    } else {
      // Add the like to the set if the user hasn't liked it
      post.likes.set(userId, true);
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { likes: post.likes },
      { new: true },
    );

    // Return the updated post as JSON in a 200 OK response
    res.status(200).json(updatedPost);
  } catch (err) {
    // If there was a problem updating the post, return a 404 NOT FOUND
    // with an error message
    res.status(404).json({ message: err.message });
  }
};

/**
 * Add a comment to a post
 * @param {Object} req The request object
 * @param {Object} res The response object
 * @returns {Object} The updated post
 */
export const commentPost = async (req, res) => {
  try {
    const date = new Date();
    const { id } = req.params;
    const { userId, commentText } = req.body;
    const post = await Post.findById(id);

    const comment = {
      _id: new mongoose.Types.ObjectId(),
      userId,
      commentText,
      createdAt: date.getTime(),
    };
    post.comments.push(comment);

    const updatePost = await Post.findByIdAndUpdate(
      id,
      { comments: post.comments },
      { new: true },
    );

    // Return the updated post as JSON in a 200 OK response
    res.status(200).json(updatePost);
  } catch (err) {
    // If there was a problem updating the post, return a 404 NOT FOUND
    // with an error message
    res.status(404).json({ message: err.message });
  }
};

/**
 * Delete a comment from a post
 * @param {Object} req The request object
 * @param {Object} res The response object
 * @returns {Object} The updated post
 */
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { loggedInUserId, commentId } = req.body;
    const post = await Post.findById(id);

    // Filter out the comment to delete
    post.comments = post.comments.filter((comment) => {
      return comment._id.toString() !== commentId;
    });

    const updatePost = await Post.findByIdAndUpdate(
      id,
      { comments: post.comments },
      { new: true },
    );

    // Return the updated post as JSON in a 200 OK response
    res.status(200).json(updatePost);
  } catch (error) {
    // If there was a problem updating the post, return a 404 NOT FOUND
    // with an error message
    res.status(404).json({ message: error.message });
  }
};

/**
 * Delete a post
 * @param {Object} req The request object
 * @param {Object} res The response object
 * @returns {Object} A success message in a JSON object
 */
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { loggedInUserId, postUserId } = req.body;
    // Check that the logged in user is the owner of the post
    if (loggedInUserId !== postUserId) {
      return res.status(401).json({ message: 'unauthorized action' });
    }
    const deleted = await Post.findByIdAndDelete(id);
    // Return all the posts after the deletion
    const posts = await Post.find();
    res.status(200).json({ message: 'Post deleted successfully', posts });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
