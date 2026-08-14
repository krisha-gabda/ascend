import { ScrollView, Text } from "react-native";
import { globalStyles } from "../styles/global";

export default function HomeScreen() {
    return(
        <ScrollView style={globalStyles.container}>
            <Text style={globalStyles.title}>Welcome Back</Text>
        </ScrollView>
    )
}