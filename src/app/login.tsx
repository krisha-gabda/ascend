import { Link, router } from "expo-router";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, globalStyles } from "../styles/global";

export default function LogInScreen() {
    return(
        <View style={globalStyles.container}>
            <Text style={globalStyles.title}>Create an Account</Text>
            <View style={styles.logInBlock}>
                <Text style={styles.inputLabel}>Enter Email:</Text>
                <TextInput placeholder="johndoe@email.com" autoComplete="email" style={globalStyles.input} />
                <Text style={styles.inputLabel}>Enter Password:</Text>
                <TextInput placeholder="Password..." autoComplete="new-password" style={globalStyles.input} />
                
                <Pressable style={[globalStyles.btn, styles.btnAdditional]} onPress={() => router.push('/homeScreen')}>
                    <Text style={globalStyles.btnText}>Log In</Text>
                </Pressable>

                <Link href='/signup' style={globalStyles.link}>Do not have an account?</Link>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    logInBlock: {
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderWidth: 3,
        borderRadius: 12,
        margin: 12,
        paddingVertical: 24,
        paddingHorizontal: 8,
    },

    inputLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        paddingHorizontal: 12,
        paddingTop: 18,
        textAlign: 'left',
    },

    btnAdditional: {
        marginTop: 36,
    }
})