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
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
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

export const googleSignIn = async (email) => {
  try {
    // Check if user exists
    const checkResponse = await fetch("http://54.147.244.63:8000/check_user/", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ email }),
    });

    const checkData = await checkResponse.json();
    console.log("checkResponse: ", JSON.stringify(checkData));

    if(checkData.exists) {
      console.log("User exists, Proceeding with login...");
      await AsyncStorage.setItem('user', JSON.stringify(checkData));
      return checkData;
  
    } else {
      console.log(`No account exists with the email ${email}`);
      return { exists: false };
    }
  } catch (error) {
    console.error("googleSignIn error:", error);
    throw error;
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
    const { first_name, last_name, email, password1, password2, username } = userData;
    console.log("user data: ", JSON.stringify(userData));  
    // Send reg data to backend
    const response = await fetch(`${API_BASE_URL}/auth/registration/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ first_name, last_name, username, email, password1, password2}),
  
    });
    
    const data = await response.json();

    if (response.ok && data.access) {
        const { access, user } = data;
    
        
        // Store user session in Async
        const newUserData = {
            id: userData.id,
            first_name: userData.first_name,
            last_name: userData.last_name,
            username: user.username,
	          email: user.email,
	          auth_type: 'email',
            token: access, // Use token returned from server
        };
        await AsyncStorage.setItem('user', JSON.stringify(newUserData));
        console.log("this is newuserdata: ", newUserData);
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

/**
 * Search for users by username
 * @param {string} searchTerm - Search query
 * @returns {Promise<Object>} - List of matching users
 */
export const searchUsers = async (searchTerm) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const response = await fetch(`http://54.147.244.63:8000/search_users/?query=${encodeURIComponent(searchTerm)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, users: data };
    } else {
      return { success: false, error: data.error || 'Error searching for users' };
    }
  } catch (error) {
    console.error('Search API error:', error);
    return { success: false, error: 'An error occurred during search' };
  }
};

/**
 * Get user profile by username
 * @param {string} username - Username to fetch
 * @returns {Promise<Object>} - User profile data
 */
export const getUserProfile = async (username) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const response = await fetch(`http://54.147.244.63:8000/user_profile/${username}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, profile: data };
    } else {
      return { success: false, error: data.error || 'Error fetching user profile' };
    }
  } catch (error) {
    console.error('Profile API error:', error);
    return { success: false, error: 'An error occurred while fetching the profile' };
  }
};

/**
 * Toggle follow status for a user
 * @param {string} username - Username to follow/unfollow
 * @returns {Promise<Object>} - Success or error message
 */
export const toggleFollow = async (username) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const response = await fetch(`http://54.147.244.63:8000/follow_toggle/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      },
      body: JSON.stringify({ username }),
    });

    const data = await response.json();

    if (response.ok) {
      return { 
        success: true, 
        status: data.status,
        followed: data.status === 'followed'
      };
    } else {
      return { success: false, error: data.error || 'Error toggling follow status' };
    }
  } catch (error) {
    console.error('Follow toggle API error:', error);
    return { success: false, error: 'An error occurred while toggling follow status' };
  }
}; 
