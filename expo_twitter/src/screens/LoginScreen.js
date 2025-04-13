import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch
} from 'react-native';
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { useAuth } from '../context/AuthContext';
import { validateNewUser } from '../api/authApi';

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = ({ navigation }) => {
  const { login, validate, register, signInWithGoogle, resetPassword, isLoading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password1, setPassword] = useState('');
  const [password2, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);

  // Google auth config
  const config = {
    androidClientId: "147860164272-03ohggm1cdmhbdbsmf2sgpcjct437q3k.apps.googleusercontent.com",
    iosClientId: "147860164272-glutj0lulf23chdf7icsd237q2c679m0.apps.googleusercontent.com",
    webClientId: "147860164272-03ohggm1cdmhbdbsmf2sgpcjct437q3k.apps.googleusercontent.com",
  };
  
  const [request, response, promptAsync] = Google.useAuthRequest(config);

  useEffect(() => {
    if (response?.type === "success") {
      handleGoogleAuth(response.authentication.accessToken);
    }
  }, [response]);

  const handleGoogleAuth = async (accessToken) => {
    try {
      // Get user info from Google
      const userInfoResponse = await fetch(
        "https://www.googleapis.com/userinfo/v2/me",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      
      if (!userInfoResponse.ok) {
        throw new Error('Failed to get user info from Google');
      }
      
      const userInfo = await userInfoResponse.json();
      console.log("userInfo: ", JSON.stringify(userInfo));
      // Create or sign in the user
      const userData = {
        id: userInfo.id,
        first_name: userInfo.given_name,
        last_name: userInfo.family_name,
        email: userInfo.email,
        auth_type: "google",
        googleId: userInfo.id,
        picture: userInfo.picture
      };
      
      const result = await signInWithGoogle(userData);
      console.log("signInWithGoogle result: ", JSON.stringify(result));
      if (result.success) {
        console.log("User logged in or created successfully");
      } else {
          throw new Error("Google login/register failed");
      }
      
    } catch (error) {
      console.error("Google sign in error:", error);
    }
  };

  const handleLogin = async () => {
    if (!email || !password1) {
      alert("Please enter both email and password");
      return;
    }
    
    const result = await login(email, password1);
    
    if (result.success) {
      // Navigation will be handled by AuthContext
      setEmail('');
      setPassword('');
    }
    else {
      alert("Incorrect email or password!");
    }
  };

  // Function to determine if password is strong enough
  function validatePassword(username, email, password) {
    
   // Array of regex rules
   const regexes = [
    {regex: /[A-Z]/, message: "Password must contain at least one uppercase letter"},
    {regex: /[a-z]/, message: "Password must contain at least one lowercase letter"},
    {regex: /[0-9]/, message: "Password must contain at least one number"},
    {regex: /[^A-Za_z0-9]/, message: "Password must contain at least one special character"},
    {regex: /.{8,}/, message: "Password must be at least 8 characters long"},
    {regex: /^((?!password).)*$/i, message: "Password cannot contain the word 'password'"},
    {regex: /^(?!.*email|.*username)/i, message: "Password cannot contain the email or username"}
   ];

    // loop to check all regexes - if any fail, password is weak - return fail message
    for (let { regex, message} of regexes) {
      if (!regex.test(password)) {
        return message;
      }
    }

    return null;  // Password is valid
    
  }

  const validateUsernameEmail = async (username, email) => {
    const userData = {
      email,
      username
    };
    const result = await validate(userData)
    if (result.success) {
      return null;
    } else {
      return result.error;
    }
  }

  
  const handleSignUp = async () => {
    if (!username || !email || !password1 || !password2) {
      alert("Please fill in all fields");
      return;
    }
    
    if (password1 !== password2) {
      alert("Passwords do not match");
      return;
    }
    
    const validationMessage = validatePassword(username, email, password1)
    console.log("Validation Message: ", validationMessage);
    if (validationMessage != null) {
      alert(validationMessage);
      return;
    }

    const validateInfoMessage = await validateUsernameEmail(username, email);
    if (validateInfoMessage != null) {
      console.log(JSON.stringify(validateInfoMessage));
      alert(JSON.stringify(validateInfoMessage));
      return;
    }
    const userData = {
      email,
      password1,
      password2,
      username
    };
    
    const result = await register(userData);
    
    if (result.success) {
      // Navigation will be handled by AuthContext
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setIsSignUp(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      alert("Please enter your email address");
      return;
    }
    
    const result = await resetPassword(resetEmail);
    
    if (result.success) {
      setResetEmail('');
      setShowResetForm(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const showForgotPassword = () => {
    setShowResetForm(true);
    setResetEmail('');
  };

  const hideForgotPassword = () => {
    setShowResetForm(false);
  };

  if (showResetForm) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Image source={require("../../assets/y_logo.png")} style={styles.image} />
          
          <Text style={styles.titleText}>Reset Your Password</Text>
          
          <View style={styles.inputView}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your email"
              placeholderTextColor="#657786"
              value={resetEmail}
              onChangeText={setResetEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Reset Password</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={hideForgotPassword}
            disabled={isLoading}
          >
            <Text style={styles.secondaryButtonText}>Back to Login</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image source={require("../../assets/y_logo.png")} style={styles.image} />
        
        <Text style={styles.titleText}>
          {isSignUp ? "Create your account" : "Log in to Y"}
        </Text>
        
        {isSignUp && (
        <View style={styles.inputView}>
          <TextInput
            style={styles.textInput}
            placeholder="username"
            placeholderTextColor="#657786"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>
        )}
        <View style={styles.inputView}>
          <TextInput
            style={styles.textInput}
            placeholder="Email"
            placeholderTextColor="#657786"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.inputView}>
          <TextInput
            style={styles.textInput}
            placeholder="Password"
            placeholderTextColor="#657786"
            value={password1}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />

          {!isSignUp && Platform.OS != 'ios' &&
          <View style={styles.toggleContainer}>
            <Switch
              value={showPassword}
              onValueChange={setShowPassword}
            />
            <Text style={styles.toggleText}>
              {showPassword ? 'Hide Password' : 'Show Password'}
            </Text>
            
         
        </View>
        }
        
        </View>
        
        {isSignUp && (
          <View style={styles.inputView}>
            <TextInput
              style={styles.textInput}
              placeholder="Confirm Password"
              placeholderTextColor="#657786"
              value={password2}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
            />
            {Platform.OS != 'ios' && (
            <View style={styles.toggleContainer}>
               <Switch
                value={showPassword}
                onValueChange={setShowPassword}
              />
              <Text style={styles.toggleText}>
                {showPassword ? 'Hide Password' : 'Show Password'}
              </Text>
             
              
            </View>
            )}
          </View>
        )}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={isSignUp ? handleSignUp : handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>
              {isSignUp ? "Sign up" : "Log in"}
            </Text>
          )}
        </TouchableOpacity>
        
        {!isSignUp && (
          <TouchableOpacity onPress={showForgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>
        )}
         
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={toggleAuthMode}
          disabled={isLoading}
        >
          <Text style={styles.secondaryButtonText}>
            {isSignUp
              ? "Already have an account? Log in"
              : "Don't have an account? Sign up"}
          </Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.divider} />
        </View>
        
        <TouchableOpacity
          style={styles.googleButton}
          onPress={() => promptAsync()}
          disabled={isLoading}
        >
          <Image
            source={require("../../assets/google_icon.png")}
            style={styles.googleIcon}
          />
          <Text style={styles.googleButtonText}>
            {isLoading ? "Please wait..." : "Continue with Google"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  image: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    marginBottom: 30,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#14171A',
  },
  inputView: {
    width: '100%',
    backgroundColor: '#F5F8FA',
    borderRadius: 25,
    height: 50,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    
    textAlign: 'center',
  },
  textInput: {
    height: 50,
    flex: 1,
    padding: 10,
    paddingLeft: 20,
    textAlignVertical: 'center',
    color: '#14171A',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginTop: 20,
    paddingLeft: 10,
  },
  toggleText: {
    marginLeft: 10,
    color: '#657786',
    fontSize: 14,
  },
  forgotPasswordText: {
    color: '#1DA1F2',
    fontSize: 14,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#1DA1F2',
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    width: '100%',
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  secondaryButtonText: {
    color: '#1DA1F2',
    fontSize: 14,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E1E8ED',
  },
  orText: {
    color: '#657786',
    paddingHorizontal: 10,
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 25,
    width: '100%',
    height: 50,
    paddingHorizontal: 10,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  googleButtonText: {
    color: '#657786',
    fontSize: 16,
  },
});

export default LoginScreen; 