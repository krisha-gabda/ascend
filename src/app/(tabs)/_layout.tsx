import { colors } from "@/src/styles/global";
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from "expo-router";

export default function TabLayout() {
    return(
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.background,
                    borderTopColor: colors.border,
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
            }}
        >
            <Tabs.Screen 
                name='home' 
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen 
                name='tasks' 
                options={{
                    title: 'Tasks',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="checkbox-outline" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen 
                name='habits' 
                options={{
                    title: 'Habits',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="repeat-outline" size={size} color={color} />
                    ),
                }}
            />

        </Tabs>
    )
}