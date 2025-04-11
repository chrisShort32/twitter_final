import React, {useState} from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet } from 'react-native';

const PostInput = (user) => {
  const [postText, setPostText] = useState('');

  const handlePost = async () => {
    if(!postText.trim()) return;
    console.log("Posting:", postText);

    try {
      await axios.post('http://54.147.244.63:8000/api/post_yeet', {
        username: user.username,
        post_content: postText,
      });
          
      setPostText('');
      if(onPostSuccess) onPostSuccess();
    } catch (error) {
      console.error('Error posting Yeet:', error);
    }
        
  }

  
  return (
    <View style={styles.card}>
      <Image
        source={user?.picture ? { uri: user?.picture } : require('../../assets/y_logo.png')}
        style={styles.avatar}
      />
      <TextInput
        style={styles.input}
        placeholder="What's happening?"
        placeholderTextColor="#999"
        value={postText}
        onChangeText={setPostText}
        multiline
      />
      <TouchableOpacity onPress={handlePost} style={styles.button}>
        <Text style={styles.buttonText}>Yeet</Text>
      </TouchableOpacity>
    </View>
  );
};
const styles = StyleSheet.create({
    card: {
      flexDirection: 'row',
      width: '100%',
      maxWidth: 750,
      backgroundColor: '#f5f8fa',
      borderRadius: 12,
      padding: 10,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      elevation: 3,
      marginBottom: 20,
      alignSelf: 'center',
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginBottom: 10,
      marginRight: 10,
      backgroundColor: '#e1e8ed',
    },
    input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 100,
        fontSize: 16,
        paddingVertical: 8,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccd6dd',
        marginRight: 10,
    },
    button: {
        backgroundColor: '#1da1f2',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        alignSelf: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    handle: {
        fontSize: 14,
        color: '#657786',
        marginBottom: 10,
      },
  });
export default PostInput;