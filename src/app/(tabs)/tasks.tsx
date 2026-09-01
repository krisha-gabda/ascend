import { globalStyles } from "@/src/styles/global";
import { ScrollView, Text } from "react-native";

export default function TasksScreen() {
    return(
        <ScrollView style={globalStyles.container}>
            <Text style={globalStyles.title}>Tasks</Text>
        </ScrollView>
    )
}