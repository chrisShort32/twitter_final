import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import * as authApi from '../api/authApi';

// Create the context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component that wraps the app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if the user is logged in on app start
  useEffect(() => {
    const checkUser = async () => {
      try {
        setIsLoading(true);
        const currentUser = await authApi.getCurrentUser();
        
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);

  // Login function
  const login = async (email, password) => {
    setIsLoading(true);
    
    try {
      const result = await authApi.loginUser(email, password);
      
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        Alert.alert('Login Failed', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', 'An unexpected error occurred. Please try again.');
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  // validate function
  const validate = async (userData) => {
    try {
      const result = await authApi.validateNewUser(userData);
      if (result.success) {
        return { success: true };
      } else if (result.email) {
        return { success: false, error: "An account with that email exists"};
      } else if (result.username) {
        return { success: false, error: "That username is unavailable"};
      } else {
        console.log("Something went wrong in validate");
        return {success: false, error: "Something went wrong in validate"};
      }
    } catch (error) {
      console.error('Validation Error:', error);
      return {success: false, error: 'Validation Error'};
    }
  };
  // Register function
  const register = async (userData) => {
    setIsLoading(true);
    
    try {
      const result = await authApi.registerUser(userData);
      
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Registration Failed', 'An unexpected error occurred. Please try again.');
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  // Password reset function
  const resetPassword = async (email) => {
    setIsLoading(true);
    
    try {
      const result = await authApi.resetPassword(email);
      
      if (result.success) {
        Alert.alert('Password Reset', result.message);
        return { success: true, message: result.message };
      } else {
        Alert.alert('Password Reset Failed', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Password reset error:', error);
      Alert.alert('Password Reset Failed', 'An unexpected error occurred. Please try again.');
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    
    try {
      await authApi.logoutUser();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Logout Failed', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Google sign in
  const signInWithGoogle = async (userData) => {
    try {
      const result = await authApi.googleSignIn(userData);
      if (result.success) {
        setUser(result);
        setIsAuthenticated(true);
        setIsLoading(false);
        return {success: true, ...result}; 
      } else {
          return {success: false, error: result.error || 'Login failed'};
      }
    } catch (error) {
      console.error("Sign-in with Google failed:", error);
      return {success: false, error: error.message};
    }
  };

  // Prepare the value object with all the context data and functions
  const value = {
    user,
    isLoading,
    isAuthenticated,
    setUser,
    login,
    register,
    resetPassword,
    logout,
    signInWithGoogle,
    validate
  };

  // Return the provider with the value
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 