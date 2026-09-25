import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';

const API_URL = (process.env as any).EXPO_PUBLIC_API_URL || 'http://192.168.1.12:8000';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in both email and password.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Login Failed', data.detail || 'Invalid credentials');
        return;
      }

      await AsyncStorage.setItem('access_token', data.access_token);

      // Successful login
      Alert.alert('Success', 'Logged in successfully!');

      // Navigate to home page
      router.replace('/(tabs)/home' as any);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong while logging in. Make sure the backend is running.');
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

      <Text>Password:</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Enter your password"
        secureTextEntry
        style={{ borderWidth: 1, marginBottom: 20, padding: 5 }}
      />

      <Button title="Login" onPress={handleLogin} />

      <View style={{ marginTop: 20 }}>
        <Button title="Go to Sign Up" onPress={() => router.replace('/signup' as any)} color="gray" />
      </View>
    </View>
  );
}
