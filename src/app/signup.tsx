import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { colors, globalStyles } from '../styles/global';

// Android emulator typically accesses localhost via 10.0.2.2.
// If using an iOS emulator or physical device, change this to your computer's local IP address or localhost.
const API_URL = (process.env as any).EXPO_PUBLIC_API_URL || 'http://192.168.1.12:8000';

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

      await AsyncStorage.setItem('access_token', data.access_token);

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
    <View style={globalStyles.container}>
      <Text style={globalStyles.mainTitle}>ASCEND</Text>
      <Text style={globalStyles.subtitle}>Create your account</Text>

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

      <Text style={globalStyles.inputLabel}>Password (min 8 chars)</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Enter your password"
        placeholderTextColor={colors.textSecondary}
        secureTextEntry
        style={globalStyles.input}
      />

      <View style={{ marginTop: 24 }}>
        <Pressable style={globalStyles.btn} onPress={handleSignUp}>
          <Text style={globalStyles.btnText}>Sign Up</Text>
        </Pressable>
        <Pressable style={globalStyles.btnSecondary} onPress={() => router.replace('/login' as any)}>
          <Text style={globalStyles.btnSecondaryText}>Go to Login</Text>
        </Pressable>
      </View>
    </View>
  );
}
