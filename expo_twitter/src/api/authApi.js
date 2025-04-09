import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://54.147.244.63:8000/api';

/**
 * Login a user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} - User data or error
 */
export const loginUser = async (email, password) => {
  try {
     console.log('Request body:', JSON.stringify({ email, password }));
     await AsyncStorage.removeItem('user');
    // Make HTTP request for login
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
       method: 'POST',
       headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok && data.access) {
        const { access, user } = data;

        const userData = {
            id: user.id,
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            auth_type: 'email',
            token: access, // use token returned from server
        };
        await AsyncStorage.setItem('user', JSON.stringify(userData));

       return { success: true, user: userData };
    }  else {
       return { success: false, error: 'Invalid Credentials' };
    }
  } catch (error) {
    console.error('Login API error:', error);
    return {success: false, error: 'An error occurred during login'};
  }  
};

export const googleSignIn = async (userData) => {
      // Check if user exists
      const checkResponse = await fetch("http://54.147.244.63:8000/check_user/", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ email: userData.email }),
      });

      const checkData = await checkResponse.json();

      if(checkData.exists) {
        console.log("User exists, Proceeding with login...");
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        return {success: true, user: userData};
        
      } else {
        console.log(`No account exists with the email ${userData.email}`);
        return {success: false, user: userData};
      }
};


/**
 * Validate a new username and email
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} - New user data or error
 */
export const validateNewUser = async(userData) => {
  try {
    const { email, username } = userData;
    console.log("user data: ", JSON.stringify(userData));

    // send the data
    const response = await fetch("http://54.147.244.63:8000/validate_new_user/", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, username }),
    });

    const data = await response.json();

    if (data.email_exists) {
      console.log("Account with that email exists: ", email);
      return {success: false, email: email};
    } else if (data.username_exists) {
      console.log("That username is not available: ", username);
      return {success: false, username: username};
    } else {
      console.log("Email and username have been validated: ", email, username);
      return {success: true, email: email, username: username};
    }
  }
  catch(error) {
    console.log("Error during validation: ", error);
    return {success: false, error: "An Error occurred during validation"};
  }
}

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} - New user data or error
 */
export const registerUser = async (userData) => {
  try {
    const { email, password1, password2, username } = userData;
    console.log("user data: ", JSON.stringify(userData));  
    // Send reg data to backend
    const response = await fetch(`${API_BASE_URL}/auth/registration/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password1, password2}),
  
    });
    
    const data = await response.json();

    if (response.ok && data.access) {
        const { access, user } = data;
    
        // Store user session in Async
        const newUserData = {
            id: user.id,
            username: user.username,
	          email: user.email,
	          auth_type: 'email',
            token: access, // Use token returned from server
        };
        await AsyncStorage.setItem('user', JSON.stringify(newUserData));

        return { success: true, user: newUserData };
    }   else {
	return { success: false, error: 'Registration Failed' };
    }
  } catch (error) {
    console.error('Registration API error:', error);
    return { success: false, error: 'An error occurred during registration' };
  }
}; 

/**
 * Reset a user's password
 * @param {string} email - User's email
 * @returns {Promise<Object>} - Success or error message
 */
export const resetPassword = async (email) => {
  try {
    // Send request to reset password
    const respnse = await fetch(`${API_BASE_URL}/auth/password/reset`, {
        method: 'POST',
        headers: {
            'Content_Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });

   const data = await response.json();

   if (response.ok && data.success) {
       return { success: true, message: 'Password reset email sent' };
   } else {
       return { success: false, error: 'No account found with this email' };
   } 
 } catch (error) {
   console.error('Password reset API error', error);
   return {success: false, error: 'An error occurred during password reset' };
 }
};

/**
 * Log out the current user
 * @returns {Promise<Object>} - Success or error message
 */
export const logoutUser = async () => {
  try {
    // Clear user session
    await AsyncStorage.removeItem("user");
    
    return { success: true };
  } catch (error) {
    console.error("Logout API error:", error);
    return { 
      success: false, 
      error: "An error occurred during logout" 
    };
  }
};

/**
 * Get the current logged in user
 * @returns {Promise<Object>} - User data or null
 */
export const getCurrentUser = async () => {
  try {
    const userData = await AsyncStorage.getItem("user");
    if (!userData) return null;
    
    return JSON.parse(userData);
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
};

/**
 * Verify if a user's auth token is valid
 * @param {string} token - Auth token
 * @returns {Promise<boolean>} - Token validity
 */
export const verifyToken = async (token) => {
  try {
    // In a real app, this would validate the token with your backend
    // For demo purposes, we'll just check if there's a user session
    const userData = await AsyncStorage.getItem("user");
    if (!userData) return false;
    
    const user = JSON.parse(userData);
    return user.token === token;
  } catch (error) {
    console.error("Token verification error:", error);
    return false;
  }
}; 
