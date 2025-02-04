// screens/user/UserScreen.js
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const UserScreen = ({ navigation }) => {
  const handleUserAction = () => {
    // Example user action
    alert('User action executed!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Dashboard</Text>
      <Text style={styles.subtitle}>Welcome, User!</Text>
      <Button title="Execute User Action" onPress={handleUserAction} />
      {/* Add more user-specific features here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
  },
});

export default UserScreen;
