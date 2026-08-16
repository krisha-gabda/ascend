import { Link, router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { globalStyles } from "../styles/global";

export default function Index() {
  return (
    <View style={globalStyles.container}>
        <Text style={globalStyles.mainTitle}>ASCEND</Text>
        <Text style={globalStyles.text}>Turn your everyday tasks into progress</Text>
        <Pressable style={globalStyles.btn} onPress={() => router.push('/signup')}>
          <Text style={globalStyles.btnText}>Get Started</Text>
        </Pressable>
        <Link href='/login' style={globalStyles.link}>Already have an account?</Link>
    </View>
  );
}
