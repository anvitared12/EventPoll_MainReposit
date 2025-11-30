import { View, TextView, Text, Button, StyleSheet, Alert } from 'react-native';
import { Stack } from 'expo-router';

export default function PollPage() {
    return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Text style={styles.title}>Live Poll User</Text>
      <Text style={styles.status}>Status: {status}</Text>
      <Text style={styles.instruction}>Waiting for organizer to start a poll...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  status: {
    fontSize: 16,
    marginBottom: 10,
    color: 'gray',
  },
  instruction: {
    fontSize: 18,
    textAlign: 'center',
  },
});
