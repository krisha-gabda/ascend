import { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { router } from 'expo-router';

// Android emulator typically accesses localhost via 10.0.2.2.
// If using an iOS emulator or physical device, change this to your computer's local IP address or localhost.
const API_URL = (process.env as any).EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in both email and password.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // FastAPI validation errors are sometimes in an array (e.g., body -> password length)
        const errorMessage = Array.isArray(data.detail) ? data.detail[0].msg : data.detail;
        Alert.alert('Sign Up Failed', errorMessage || 'Something went wrong');
        return;
      }

      // Successful registration
      Alert.alert('Success', 'Account created successfully!');
      
      // Navigate to home page
      router.replace('/(tabs)/home' as any);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong while signing up. Make sure the backend is running.');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text>Email:</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ borderWidth: 1, marginBottom: 10, padding: 5 }}
      />

      <Text>Password (min 8 chars):</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Enter your password"
        secureTextEntry
        style={{ borderWidth: 1, marginBottom: 20, padding: 5 }}
      />

      <Button title="Sign Up" onPress={handleSignUp} />
      
      <View style={{ marginTop: 20 }}>
        <Button title="Go to Login" onPress={() => router.replace('/login' as any)} color="gray" />
      </View>
    </View>
  );
}
