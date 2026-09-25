import { colors } from "@/src/styles/global";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

const API_URL = (process.env as any).EXPO_PUBLIC_API_URL || "http://192.168.1.12:8000";
const frequencies = ["daily", "weekly", "monthly", "specific_days"] as const;
const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

type FrequencyType = (typeof frequencies)[number];

type Habit = {
    id: string;
    name: string;
    description: string;
    frequency_type: FrequencyType;
    frequency_days: string[] | null;
    current_streak: number;
    longest_streak: number;
    is_active: boolean;
    created_at: string;
};

export default function Habits() {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [frequency, setFrequency] = useState<FrequencyType>("daily");
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [recordingIds, setRecordingIds] = useState<Set<string>>(new Set());
    const [recordedTodayIds, setRecordedTodayIds] = useState<Set<string>>(new Set());
    const [error, setError] = useState("");

    const loadHabits = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const token = await AsyncStorage.getItem("access_token");
            if (!token) {
                throw new Error("Please sign in to view your habits.");
            }

            const response = await fetch(`${API_URL}/api/habits/get_habits`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(typeof data.detail === "string" ? data.detail : "Unable to load habits.");
            }

            setHabits(Array.isArray(data) ? data : []);
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "Unable to load habits.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadHabits();
    }, [loadHabits]);

    const createHabit = async () => {
        const habitName = name.trim();
        if (!habitName) {
            setError("Enter a habit name.");
            return;
        }
        if (frequency === "specific_days" && selectedDays.length === 0) {
            setError("Choose at least one day.");
            return;
        }

        setSaving(true);
        setError("");

        try {
            const token = await AsyncStorage.getItem("access_token");
            if (!token) {
                throw new Error("Please sign in to add a habit.");
            }

            const response = await fetch(`${API_URL}/api/habits/create_habit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: habitName,
                    description: description.trim(),
                    frequency_type: frequency,
                    frequency_days: frequency === "specific_days" ? selectedDays : null,
                }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(typeof data.detail === "string" ? data.detail : "Unable to add habit.");
            }

            setHabits((currentHabits) => [data as Habit, ...currentHabits]);
            setName("");
            setDescription("");
            setFrequency("daily");
            setSelectedDays([]);
        } catch (createError) {
            setError(createError instanceof Error ? createError.message : "Unable to add habit.");
        } finally {
            setSaving(false);
        }
    };

    const recordHabit = async (habit: Habit) => {
        if (recordedTodayIds.has(habit.id)) return;

        setError("");
        setRecordingIds((currentIds) => new Set(currentIds).add(habit.id));

        try {
            const token = await AsyncStorage.getItem("access_token");
            if (!token) {
                throw new Error("Please sign in to record a habit.");
            }

            const response = await fetch(
                `${API_URL}/api/habits/add_habit_logs?habit_id=${encodeURIComponent(habit.id)}`,
                { method: "POST", headers: { Authorization: `Bearer ${token}` } },
            );
            const data = await response.json();

            if (!response.ok) {
                throw new Error(typeof data.detail === "string" ? data.detail : "Unable to record habit.");
            }

            setHabits((currentHabits) => currentHabits.map((currentHabit) => {
                if (currentHabit.id !== habit.id) return currentHabit;
                const currentStreak = currentHabit.current_streak + 1;
                return {
                    ...currentHabit,
                    current_streak: currentStreak,
                    longest_streak: Math.max(currentHabit.longest_streak, currentStreak),
                };
            }));
            setRecordedTodayIds((currentIds) => new Set(currentIds).add(habit.id));
        } catch (recordError) {
            setError(recordError instanceof Error ? recordError.message : "Unable to record habit.");
        } finally {
            setRecordingIds((currentIds) => {
                const nextIds = new Set(currentIds);
                nextIds.delete(habit.id);
                return nextIds;
            });
        }
    };

    const toggleDay = (day: string) => {
        setSelectedDays((currentDays) => currentDays.includes(day)
            ? currentDays.filter((selectedDay) => selectedDay !== day)
            : [...currentDays, day]);
    };

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.title}>Habits</Text>
                <Text style={styles.count}>{habits.length}</Text>
            </View>

            <View style={styles.habitList}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>My habits</Text>
                    <Pressable
                        onPress={() => void loadHabits()}
                        disabled={loading}
                        accessibilityRole="button"
                        accessibilityLabel="Refresh habits"
                        hitSlop={8}
                    >
                        <Ionicons name="refresh-outline" size={19} color={colors.textSecondary} />
                    </Pressable>
                </View>
                {loading ? <ActivityIndicator color={colors.primary} style={styles.loading} /> : habits.filter((habit) => habit.is_active).length === 0 ? (
                    <Text style={styles.empty}>No habits yet. Add one below.</Text>
                ) : habits.filter((habit) => habit.is_active).map((habit) => {
                    const recording = recordingIds.has(habit.id);
                    const recorded = recordedTodayIds.has(habit.id);
                    const schedule = habit.frequency_type === "specific_days" && habit.frequency_days?.length
                        ? habit.frequency_days.join(", ")
                        : habit.frequency_type.replace("_", " ");

                    return (
                        <View key={habit.id} style={styles.habitRow}>
                            <View style={styles.habitCopy}>
                                <Text style={styles.habitName}>{habit.name}</Text>
                                {habit.description ? <Text style={styles.description}>{habit.description}</Text> : null}
                                <Text style={styles.meta}>{schedule} · {habit.current_streak} day streak</Text>
                            </View>
                            <Pressable
                                style={[styles.recordButton, recorded && styles.recordedButton]}
                                onPress={() => void recordHabit(habit)}
                                disabled={recording || recorded}
                                accessibilityRole="button"
                                accessibilityLabel={recorded ? `${habit.name} recorded today` : `Record ${habit.name} today`}
                                accessibilityState={{ disabled: recording || recorded }}
                            >
                                {recording ? <ActivityIndicator size="small" color={colors.primary} /> : (
                                    <>
                                        <Ionicons name={recorded ? "checkmark" : "add"} size={16} color={recorded ? colors.textSecondary : colors.primary} />
                                        <Text style={[styles.recordText, recorded && styles.recordedText]}>{recorded ? "Done" : "Record"}</Text>
                                    </>
                                )}
                            </Pressable>
                        </View>
                    );
                })}
            </View>

            <View style={styles.addSection}>
                <Text style={styles.sectionTitle}>Add a habit</Text>
                <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Habit name"
                    accessibilityLabel="Habit name"
                    placeholderTextColor={colors.textSecondary}
                    style={styles.input}
                />
                <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Description (optional)"
                    accessibilityLabel="Habit description"
                    placeholderTextColor={colors.textSecondary}
                    style={styles.input}
                />
                <Text style={styles.fieldLabel}>Frequency</Text>
                <View style={styles.options}>
                    {frequencies.map((option) => {
                        const selected = frequency === option;
                        return (
                            <Pressable
                                key={option}
                                style={[styles.option, selected && styles.optionSelected]}
                                onPress={() => setFrequency(option)}
                                accessibilityRole="radio"
                                accessibilityState={{ selected }}
                            >
                                <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                                    {option.replace("_", " ")}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
                {frequency === "specific_days" ? (
                    <View style={styles.options}>
                        {weekdays.map((day) => {
                            const selected = selectedDays.includes(day);
                            return (
                                <Pressable
                                    key={day}
                                    style={[styles.dayOption, selected && styles.optionSelected]}
                                    onPress={() => toggleDay(day)}
                                    accessibilityRole="checkbox"
                                    accessibilityState={{ checked: selected }}
                                    accessibilityLabel={day}
                                >
                                    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{day.slice(0, 3)}</Text>
                                </Pressable>
                            );
                        })}
                    </View>
                ) : null}
                <Pressable
                    style={[styles.addButton, (saving || !name.trim()) && styles.addButtonDisabled]}
                    onPress={() => void createHabit()}
                    disabled={saving || !name.trim()}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: saving || !name.trim() }}
                >
                    <Ionicons name="add" size={19} color={colors.card} />
                    <Text style={styles.addButtonText}>{saving ? "Adding..." : "Add habit"}</Text>
                </Pressable>
            </View>
            {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: 20, paddingTop: 40, paddingBottom: 32 },
    header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 30 },
    title: { color: colors.text, fontSize: 28, fontWeight: "700" },
    count: { color: colors.textSecondary, fontSize: 15 },
    habitList: { marginBottom: 34 },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingBottom: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
    },
    sectionTitle: { color: colors.textSecondary, fontSize: 13, fontWeight: "600" },
    loading: { marginTop: 22 },
    empty: { color: colors.textSecondary, paddingVertical: 18 },
    habitRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 15,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
    },
    habitCopy: { flex: 1, gap: 3 },
    habitName: { color: colors.text, fontSize: 15, fontWeight: "500" },
    description: { color: colors.textSecondary, fontSize: 13 },
    meta: { color: colors.textSecondary, fontSize: 12, textTransform: "capitalize" },
    recordButton: {
        minWidth: 82,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: 5,
        paddingHorizontal: 9,
        paddingVertical: 7,
    },
    recordedButton: { borderColor: colors.border },
    recordText: { color: colors.primary, fontSize: 13, fontWeight: "600" },
    recordedText: { color: colors.textSecondary },
    addSection: { gap: 10 },
    input: {
        color: colors.text,
        fontSize: 15,
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
    },
    fieldLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: "600", marginTop: 4 },
    options: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
    option: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 7,
    },
    dayOption: {
        minWidth: 42,
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 5,
        paddingHorizontal: 7,
        paddingVertical: 7,
    },
    optionSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
    optionText: { color: colors.textSecondary, fontSize: 12, textTransform: "capitalize" },
    optionTextSelected: { color: colors.card },
    addButton: {
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 5,
        marginTop: 4,
    },
    addButtonDisabled: { opacity: 0.55 },
    addButtonText: { color: colors.card, fontSize: 14, fontWeight: "600" },
    error: { color: "#B42318", marginTop: 12 },
});