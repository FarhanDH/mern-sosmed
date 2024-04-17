import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/*
 * REGISTER USER
 * This controller function is responsible for creating a new user in the
 * database. It does the following:
 * 1. Retrieves the required data from the request body
 * 2. Generates a salt and uses it to hash the password
 * 3. Creates a new User model instance with the retrieved data
 * 4. Saves the new User model to the database
 * 5. Responds with the saved User model
 */
export const register = async (req, res) => {
  console.log('registerrr', req.file); // <-- Log the uploaded file (optional)
  try {
    // Retrieve the required data from the request body
    const {
      firstName,
      lastName,
      email,
      password,
      picturePath,
      friends,
      location,
      occupation,
    } = req.body;

    // Generate a salt
    const salt = await bcrypt.genSalt();

    // Hash the password using the salt
    const passwordHash = await bcrypt.hash(password, salt);

    // Create a new User model instance with the retrieved data
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash, // <-- Hashed password
      picturePath,
      friends,
      location,
      occupation,
      viewedProfile: Math.floor(Math.random() * 10000), // <-- Randomly generated number
      impressions: Math.floor(Math.random() * 10000), // <-- Randomly generated number
    });

    // Save the new User model to the database
    const savedUser = await newUser.save();

    // Respond with the saved User model
    res.status(201).json(savedUser);
  } catch (err) {
    console.log(err.message); // <-- Log any errors
    res.status(500).json({ error: err.message }); // <-- Respond with error
  }
};

/*
 * LOGGING IN
 * This function is responsible for logging a user into the
 * application. It does the following:
 * 1. Retrieves the required data from the request body
 * 2. Searches the database for a user with a matching email
 * 3. If a user is found, it compares the password from the request
 *    body with the hashed password stored in the database
 * 4. If the passwords match, it generates a JSON Web Token using the
 *    user ID and a secret key from the environment variables
 * 5. Deletes the user's password from the returned object (for security
 *    purposes)
 * 6. Responds with the JSON Web Token and the user's information
 */
export const login = async (req, res) => {
  try {
    // Retrieve the required data from the request body
    const { email, password } = req.body;

    // Search the database for a user with a matching email
    const user = await User.findOne({ email: email });

    // If no user is found, return an error message
    if (!user) {
      return res.status(400).json({ msg: 'User does not exist. ' });
    }

    // Compare the password from the request body with the hashed
    // password stored in the database
    const isMatch = await bcrypt.compare(password, user.password);

    // If the passwords do not match, return an error message
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials. ' });
    }

    // Generate a JSON Web Token using the user ID and a secret key
    // from the environment variables
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    // Delete the user's password from the returned object (for security
    // purposes)
    delete user.password;

    // Respond with the JSON Web Token and the user's information
    res.status(200).json({ token, user });
  } catch (err) {
    // If there was an error, log it and return a 500 error response
    console.log(err.message);
    res.status(500).json({ error: err.message });
  }
};
