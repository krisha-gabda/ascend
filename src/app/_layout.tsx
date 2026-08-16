import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false, title: 'Home' }}/>
      <Stack.Screen name="login" options={{ headerShown: false, title: 'Log In' }} />
      <Stack.Screen name="signup" options={{ headerShown: false, title: 'Sign Up'}} />
      <Stack.Screen name="homeScreen" options={{ headerShown: true, title: 'Home' }} />
    </Stack>
  )
}
