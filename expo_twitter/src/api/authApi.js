import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
//const API_BASE_URL = 'http://54.147.244.63:8000/api';
const API_BASE_URL =
  Platform.OS === 'web'
    ? '/api'
    : 'https://group3twitter.hopto.org/api';

export const saveLocationConsent = async () => {
  if (Platform.OS == 'web'){
    document.cookie = "locationConsent=true; path=/; max-age=604800;" // cookie lasts for 7 days
  }
  await AsyncStorage.setItem('locationConsent', 'true');
};

export const getLocationConsent = async () => {
  if (Platform.OS == 'web') {
    const cookies = document.cookie.split('; ');
    const found = cookies.find(c => c.startsWith('locationConsent='));
    if (found) return true;
  }

  const val = await AsyncStorage.getItem('locationConsent');
  return val == 'true';
};

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
     console.log('Final login URL:', `${API_BASE_URL}/auth/login/`);

     const response = await fetch(`${API_BASE_URL}/auth/login/`, {
       method: 'POST',
       headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    console.log('Login response status:', response.status);
    console.log('Login response headers:', response.headers);

    const data = await response.json();

    if (response.ok && data.access) {
        const { access, user } = data;

        console.log('user', user);
        console.log('Profile pic fetch URL:', `${API_BASE_URL}/profile_pic/?user_id=${user.pk}`);

        const pic_data_response = await fetch(`${API_BASE_URL}/profile_pic?user_id=${user.pk}`, {
          method: 'GET',
          headers: {'Content-Type': 'application/json'},
        });
        const pic_data = await pic_data_response.json();
        const userData = {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            email: user.email,
            picture: pic_data.picture,
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
  try {
      const loginResponse = await fetch(`${API_BASE_URL}/auth/google-login/`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(userData),
      });

      const loginData = await loginResponse.json();
      if (!loginResponse.ok) {
        console.error("Google login failed", data);
        return {success: false, error: data.error || 'Login failed'}
      }
      
      
      const fullUserData = {
        ...loginData,
        token: loginData.access,
      };


      await AsyncStorage.setItem('user', JSON.stringify(fullUserData));
      return {success: true, ...fullUserData};
      
  } catch (error) {
      console.error('googleSignIn error', error);
      return {success: false, error: error.message};
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
    const response = await fetch(`${API_BASE_URL}/validate_new_user/`, {
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
    const response = await fetch(`${API_BASE_URL}/auth/password/reset`, {
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

    const response = await fetch(`${API_BASE_URL}/search_users/?query=${encodeURIComponent(searchTerm)}`, {
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
      console.error('[getUserProfile] Not authenticated');
      return { success: false, error: 'User not authenticated' };
    }

    console.log(`[getUserProfile] Fetching profile for: ${username}`);
    const url = `${API_BASE_URL}/user_profile/${encodeURIComponent(username)}/`;
    console.log(`[getUserProfile] URL: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      }
    });

    console.log(`[getUserProfile] Response status: ${response.status}`);
    
    // Get the response data
    const data = await response.json();
    console.log(`[getUserProfile] Response data: ${JSON.stringify(data).substring(0, 200)}...`);

    if (response.ok) {
      console.log(`[getUserProfile] Success for: ${username}, found: posts=${data.posts?.length || 0}, liked=${data.liked_posts?.length || 0}, retweets=${data.retweeted_posts?.length || 0}`);
      return { success: true, profile: data };
    } else {
      console.error(`[getUserProfile] Error for ${username}:`, data.error || response.statusText);
      return { 
        success: false, 
        error: data.error || `Error fetching user profile (${response.status})` 
      };
    }
  } catch (error) {
    console.error(`[getUserProfile] Exception for ${username}:`, error);
    return { 
      success: false, 
      error: `An error occurred while fetching the profile: ${error.message}` 
    };
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

    const response = await fetch(`${API_BASE_URL}/follow_toggle/`, {
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

/**
 * Submit user feedback
 * @param {Object} feedbackData - The feedback data to submit
 * @returns {Promise<Object>} - Response from the API
 */
export const submitFeedback = async (feedbackData) => {
  try {
    console.log("Submitting feedback:", feedbackData);
    
    // Use getCurrentUser instead of getToken since getToken might not be defined
    const currentUser = await getCurrentUser();
    const token = currentUser?.token;
    
    const headers = {
      "Content-Type": "application/json",
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    // Use the correct endpoint path for the Django backend
    const apiUrl = `${API_BASE_URL}/feedback/`;
    console.log(`Submitting feedback to: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(feedbackData),
    });
    
    console.log(`Feedback submission response status: ${response.status}`);
    
    let data;
    try {
      data = await response.json();
      console.log("Response data:", data);
    } catch (parseError) {
      console.error("Error parsing response:", parseError);
      data = {};
    }
    
    if (!response.ok) {
      console.error("Feedback submission failed:", response.status, data);
      return { 
        success: false, 
        error: data.message || data.error || `Failed to submit feedback: ${response.status}`
      };
    }
    
    console.log("Feedback submitted successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Feedback submission error:", error.message || error);
    return { 
      success: false, 
      error: `An error occurred during feedback submission: ${error.message || error}`
    };
  }
};

/**
 * Get feedback statistics for visualization
 * @returns {Promise<Object>} - Feedback statistics or error
 */
export const getFeedbackStats = async () => {
  try {
    // Use the correct endpoint path for the Django backend
    const apiUrl = `${API_BASE_URL}/feedback/stats/`;
    console.log(`📊 Fetching feedback statistics from: ${apiUrl}`);
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log(`Feedback stats response status: ${response.status}`);
      
      let data;
      try {
        data = await response.json();
        console.log('Feedback statistics received, data structure:', 
          JSON.stringify({
            total_responses: data.total_responses,
            likes_count: data.likes?.count,
            dislikes_count: data.dislikes?.count,
            like_reasons_count: data.likes?.reasons ? Object.keys(data.likes.reasons).length : 0,
            dislike_reasons_count: data.dislikes?.reasons ? Object.keys(data.dislikes.reasons).length : 0
          })
        );
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
        data = {};
        return { 
          success: false, 
          error: `Response parsing error: ${parseError.message}`
        };
      }
      
      if (response.ok) {
        if (!data || !data.total_responses) {
          console.warn("⚠️ API returned no data or invalid structure despite OK status");
          return { 
            success: false, 
            error: "Server returned invalid data structure"
          };
        }
        return { success: true, data };
      } else {
        console.error('❌ Error from feedback stats API:', data.error || response.statusText);
        return { 
          success: false, 
          error: data.error || data.message || `Failed to retrieve feedback statistics (${response.status})`
        };
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.error('❌ Feedback stats request timed out');
        return {
          success: false,
          error: 'Request timed out. Server took too long to respond.'
        };
      }
      throw fetchError; // Re-throw for outer catch
    }
  } catch (error) {
    console.error('❌ Feedback statistics retrieval error:', error);
    return { 
      success: false, 
      error: `Network error: ${error.message || 'Unknown error'}`
    };
  }
}; 
