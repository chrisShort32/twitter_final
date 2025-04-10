import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const FollowList = ({ title, users }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userHandle}>{item.handle}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No users to display</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    marginVertical: 10,
    backgroundColor: '#e8f5fe',
    borderRadius: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#14171A',
    marginBottom: 8,
  },
  userItem: {
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#d9d9d9',
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#14171A',
  },
  userHandle: {
    fontSize: 13,
    color: '#657786',
  },
  emptyText: {
    fontSize: 14,
    color: '#657786',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default FollowList;