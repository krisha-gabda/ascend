import { StyleSheet } from "react-native";

export const colors = {
    background: '#FAFAFA',
    card: '#FFFFFF',
    border: '#E5E5E5',
    primary: '#4C56B0',
    text: '#1A1A1A',
    textSecondary: '#6B6B6B'
}

export const globalStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
        paddingHorizontal: 10,
        verticalAlign: 'middle',
    },

    mainTitle: {
        fontSize: 64,
        textAlign: 'center',
        fontWeight: 'bold',
        color: colors.primary,
        paddingBottom: 24,
    },

    text: {
        fontSize: 12,
        color: colors.textSecondary,
        padding: 12,
        textAlign: 'center',
    },

    btn: {
        backgroundColor: colors.primary,
        borderRadius: 8,
        margin: 12,
        paddingVertical: 12,
    },

    btnText: {
        color: colors.border,
        padding: 4,
        fontSize: 12,
        textAlign: 'center',
        fontWeight: 'bold',
    },

    title: {
        fontSize: 24,
        color: colors.text,
        fontWeight: 'bold',
        textAlign: 'center',
    }
})