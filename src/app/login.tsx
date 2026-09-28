import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { colors, globalStyles } from '../styles/global';

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
    <View style={globalStyles.container}>
      <Text style={globalStyles.mainTitle}>ASCEND</Text>
      <Text style={globalStyles.subtitle}>Welcome back!</Text>

      <Text style={globalStyles.inputLabel}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="none"
        keyboardType="email-address"
        style={globalStyles.input}
      />

      <Text style={globalStyles.inputLabel}>Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Enter your password"
        placeholderTextColor={colors.textSecondary}
        secureTextEntry
        style={globalStyles.input}
      />

      <View style={{ marginTop: 24 }}>
        <Pressable style={globalStyles.btn} onPress={handleLogin}>
          <Text style={globalStyles.btnText}>Login</Text>
        </Pressable>
        <Pressable style={globalStyles.btnSecondary} onPress={() => router.replace('/signup' as any)}>
          <Text style={globalStyles.btnSecondaryText}>Go to Sign Up</Text>
        </Pressable>
      </View>
    </View>
  );
}
