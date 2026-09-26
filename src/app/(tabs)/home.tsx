import { colors } from "@/src/styles/global";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const API_URL = (process.env as any).EXPO_PUBLIC_API_URL || "http://192.168.1.12:8000";

type Task = {
    id: string;
    name: string;
    status: string;
};

type Habit = {
    id: string;
    name: string;
    current_streak: number;
    is_active: boolean;
};

export default function HomeScreen() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [habits, setHabits] = useState<Habit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [addMenuOpen, setAddMenuOpen] = useState(false);

    const loadOverview = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const token = await AsyncStorage.getItem("access_token");
            if (!token) {
                throw new Error("Please sign in to view your overview.");
            }

            const headers = { Authorization: `Bearer ${token}` };
            const [tasksResponse, habitsResponse] = await Promise.all([
                fetch(`${API_URL}/api/tasks/get_tasks`, { headers }),
                fetch(`${API_URL}/api/habits/get_habits`, { headers }),
            ]);
            const [tasksData, habitsData] = await Promise.all([
                tasksResponse.json(),
                habitsResponse.json(),
            ]);

            if (!tasksResponse.ok) {
                throw new Error(typeof tasksData.detail === "string" ? tasksData.detail : "Unable to load tasks.");
            }
            if (!habitsResponse.ok) {
                throw new Error(typeof habitsData.detail === "string" ? habitsData.detail : "Unable to load habits.");
            }

            setTasks(Array.isArray(tasksData) ? tasksData : []);
            setHabits(Array.isArray(habitsData) ? habitsData : []);
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "Unable to load your overview.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadOverview();
    }, [loadOverview]);

    const activeHabits = habits.filter((habit) => habit.is_active);
    const openTasks = tasks.filter((task) => task.status.toLowerCase() !== "completed");

    return (
        <View style={styles.screen}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.eyebrow}>YOUR OVERVIEW</Text>
                        <Text style={styles.title}>Welcome back</Text>
                    </View>
                    <Pressable
                        onPress={() => void loadOverview()}
                        disabled={loading}
                        accessibilityRole="button"
                        accessibilityLabel="Refresh overview"
                        hitSlop={8}
                    >
                        <Ionicons name="refresh-outline" size={20} color={colors.textSecondary} />
                    </Pressable>
                </View>

                {loading ? <ActivityIndicator color={colors.primary} style={styles.loading} /> : (
                    <>
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Tasks</Text>
                                <Pressable onPress={() => router.push("/(tabs)/tasks" as any)}>
                                    <Text style={styles.seeAll}>See all</Text>
                                </Pressable>
                            </View>
                            {openTasks.length === 0 ? (
                                <Text style={styles.empty}>No open tasks.</Text>
                            ) : openTasks.slice(0, 4).map((task) => (
                                <View key={task.id} style={styles.row}>
                                    <View style={styles.taskMark} />
                                    <Text style={styles.rowName} numberOfLines={1}>{task.name}</Text>
                                </View>
                            ))}
                            {openTasks.length > 4 ? (
                                <Text style={styles.moreText}>{openTasks.length - 4} more</Text>
                            ) : null}
                        </View>

                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Habits</Text>
                                <Pressable onPress={() => router.push("/(tabs)/habits" as any)}>
                                    <Text style={styles.seeAll}>See all</Text>
                                </Pressable>
                            </View>
                            {activeHabits.length === 0 ? (
                                <Text style={styles.empty}>No active habits.</Text>
                            ) : activeHabits.slice(0, 4).map((habit) => (
                                <View key={habit.id} style={styles.row}>
                                    <Ionicons name="repeat-outline" size={17} color={colors.primary} />
                                    <Text style={styles.rowName} numberOfLines={1}>{habit.name}</Text>
                                    <Text style={styles.streak}>{habit.current_streak} day streak</Text>
                                </View>
                            ))}
                            {activeHabits.length > 4 ? (
                                <Text style={styles.moreText}>{activeHabits.length - 4} more</Text>
                            ) : null}
                        </View>
                    </>
                )}

                {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
            </ScrollView>

            {addMenuOpen ? (
                <>
                    <Pressable
                        style={styles.dismissLayer}
                        onPress={() => setAddMenuOpen(false)}
                        accessibilityLabel="Close add menu"
                    />
                    <View style={styles.addMenu}>
                        <Pressable
                            style={styles.menuOption}
                            onPress={() => {
                                setAddMenuOpen(false);
                                router.push("/(tabs)/tasks" as any);
                            }}
                            accessibilityRole="button"
                        >
                            <Ionicons name="checkbox-outline" size={18} color={colors.primary} />
                            <Text style={styles.menuText}>Add new task</Text>
                        </Pressable>
                        <View style={styles.menuDivider} />
                        <Pressable
                            style={styles.menuOption}
                            onPress={() => {
                                setAddMenuOpen(false);
                                router.push("/(tabs)/habits" as any);
                            }}
                            accessibilityRole="button"
                        >
                            <Ionicons name="repeat-outline" size={18} color={colors.primary} />
                            <Text style={styles.menuText}>Add new habit</Text>
                        </Pressable>
                    </View>
                </>
            ) : null}
            <Pressable
                style={styles.fab}
                onPress={() => setAddMenuOpen((isOpen) => !isOpen)}
                accessibilityRole="button"
                accessibilityLabel={addMenuOpen ? "Close add menu" : "Add a task or habit"}
                accessibilityState={{ expanded: addMenuOpen }}
            >
                <Ionicons name={addMenuOpen ? "close" : "add"} size={27} color={colors.card} />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: 20, paddingTop: 40, paddingBottom: 40 },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 28 },
    eyebrow: { color: colors.textSecondary, fontSize: 11, fontWeight: "600", marginBottom: 5 },
    title: { color: colors.text, fontSize: 26, fontWeight: "700" },
    loading: { marginTop: 32 },
    section: { marginBottom: 28 },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingBottom: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
    },
    sectionTitle: { color: colors.text, fontSize: 17, fontWeight: "600" },
    seeAll: { color: colors.primary, fontSize: 13 },
    empty: { color: colors.textSecondary, paddingVertical: 16 },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 11,
        minHeight: 48,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
    },
    taskMark: { width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: colors.textSecondary },
    rowName: { color: colors.text, fontSize: 14, flex: 1 },
    streak: { color: colors.textSecondary, fontSize: 12 },
    moreText: { color: colors.textSecondary, fontSize: 12, paddingTop: 9 },
    error: { color: "#B42318", marginTop: 12 },
    dismissLayer: { ...StyleSheet.absoluteFillObject, zIndex: 1 },
    addMenu: {
        position: "absolute",
        right: 20,
        bottom: 76,
        zIndex: 2,
        minWidth: 190,
        paddingHorizontal: 12,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 6,
        elevation: 4,
    },
    menuOption: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 46 },
    menuText: { color: colors.text, fontSize: 14 },
    menuDivider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
    fab: {
        position: "absolute",
        right: 20,
        bottom: 12,
        zIndex: 3,
        width: 54,
        height: 54,
        borderRadius: 27,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.primary,
        elevation: 5,
    },
});