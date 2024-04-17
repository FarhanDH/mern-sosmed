import User from '../models/User.js';

/* READ */
export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    // console.log(users)
    res.status(200).json(users);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/**
 * Retrieve a single user by their id
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 *
 * @returns {Object} - The user object
 */
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and return the user by their id
    const user = await User.findById(id);
    return res.status(200).json(user);
  } catch (err) {
    // If the user does not exist, send a 404 error
    return res.status(404).json({ message: err.message });
  }
};

/**
 * Retrieve the friends of a user by their id
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 *
 * @returns {Object} - The friends of the user
 */
export const getUserFriends = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id)),
    );

    /**
     * Format the friends list
     */
    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return { _id, firstName, lastName, occupation, location, picturePath };
      },
    );
    res.status(200).json(formattedFriends);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/**
 * Add or remove a friend to a user's friend list
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 *
 * @returns {Object} - The updated friend list of the user
 */
export const addRemoveFriend = async (req, res) => {
  try {
    const { id, friendId } = req.params;
    const user = await User.findById(id);
    const friend = await User.findById(friendId);

    // If the friend is already in the friend list, remove it
    // else, add the friend to the friend list
    if (user.friends.includes(friendId)) {
      user.friends = user.friends.filter((id) => id !== friendId);
      friend.friends = friend.friends.filter((id) => id !== id);
    } else {
      user.friends.push(friendId);
      friend.friends.push(id);
    }

    // Save the updates to the user and friend documents
    await user.save();
    await friend.save();

    // Retrieve the updated friend list of the user
    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id)),
    );

    // Format the friend list to return only the necessary information
    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return { _id, firstName, lastName, occupation, location, picturePath };
      },
    );

    // Return the updated friend list of the user
    res.status(200).json(formattedFriends);
  } catch (err) {
    // If the user or friend does not exist, send a 404 error
    res.status(404).json({ message: err.message });
  }
};
