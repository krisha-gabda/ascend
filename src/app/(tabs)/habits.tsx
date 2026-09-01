import { globalStyles } from "@/src/styles/global";
import { ScrollView, Text } from "react-native";

export default function Habits() {
    return(
        <ScrollView style={globalStyles.container}>
            <Text style={globalStyles.title}>Habits</Text>
        </ScrollView>
    )
}