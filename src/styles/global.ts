import { StyleSheet } from "react-native";

export const colors = {
    background: '#12092D',
    card: '#1F1147',
    border: '#3F2273',
    primary: '#FF9D00',
    text: '#FFFFFF',
    textSecondary: '#BFA6D8'
}

export const globalStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 24,
        justifyContent: 'center',
    },
    mainTitle: {
        fontSize: 56,
        textAlign: 'center',
        fontWeight: '900',
        color: colors.primary,
        letterSpacing: 3,
        paddingBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 48,
    },
    btn: {
        backgroundColor: colors.primary,
        borderRadius: 12,
        paddingVertical: 16,
        marginVertical: 8,
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    btnText: {
        color: colors.background,
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    btnSecondary: {
        backgroundColor: 'transparent',
        borderRadius: 12,
        paddingVertical: 16,
        marginVertical: 8,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: colors.border,
    },
    btnSecondaryText: {
        color: colors.textSecondary,
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    input: {
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderWidth: 1.5,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: colors.text,
        marginBottom: 20,
    },
    inputLabel: {
        color: colors.text,
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
    },
    link: {
        fontSize: 14,
        color: colors.primary,
        padding: 12,
        textAlign: 'center',
        fontWeight: '600',
    }
})