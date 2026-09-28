import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { globalStyles } from "../styles/global";

export default function Index() {
  return (
    <View style={globalStyles.container}>
        <Text style={globalStyles.mainTitle}>ASCEND</Text>
        <Text style={globalStyles.subtitle}>Turn your everyday tasks into progress</Text>
        
        <View style={{ marginTop: 20 }}>
            <Pressable style={globalStyles.btn} onPress={() => router.push('/login' as any)}>
            <Text style={globalStyles.btnText}>Login</Text>
            </Pressable>
            <Pressable style={globalStyles.btnSecondary} onPress={() => router.push('/signup' as any)}>
            <Text style={globalStyles.btnSecondaryText}>Sign Up</Text>
            </Pressable>
        </View>
    </View>
  );
}
