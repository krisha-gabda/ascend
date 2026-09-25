import { colors } from "@/src/styles/global";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

const API_URL = (process.env as any).EXPO_PUBLIC_API_URL || "http://192.168.1.12:8000";

type Task = {
    id: string;
    name: string;
    description: string | null;
    status: string;
    created_at: string;
};

export default function TasksScreen() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [completingTaskIds, setCompletingTaskIds] = useState<Set<string>>(new Set());
    const [error, setError] = useState("");

    const loadTasks = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const token = await AsyncStorage.getItem("access_token");
            if (!token) {
                throw new Error("Please sign in to view your tasks.");
            }

            const response = await fetch(`${API_URL}/api/tasks/get_tasks`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(typeof data.detail === "string" ? data.detail : "Unable to load tasks.");
            }

            setTasks(Array.isArray(data) ? data : []);
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "Unable to load tasks.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadTasks();
    }, [loadTasks]);

    const createTask = async () => {
        const taskName = name.trim();
        if (!taskName) {
            setError("Enter a task name.");
            return;
        }

        setSaving(true);
        setError("");

        try {
            const token = await AsyncStorage.getItem("access_token");
            if (!token) {
                throw new Error("Please sign in to create a task.");
            }

            const response = await fetch(`${API_URL}/api/tasks/add_task`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name: taskName, description: description.trim() || null }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(typeof data.detail === "string" ? data.detail : "Unable to create task.");
            }

            setTasks((currentTasks) => [data as Task, ...currentTasks]);
            setName("");
            setDescription("");
        } catch (createError) {
            setError(createError instanceof Error ? createError.message : "Unable to create task.");
        } finally {
            setSaving(false);
        }
    };

    const completeTask = async (taskId: string) => {
        setError("");
        setCompletingTaskIds((currentIds) => new Set(currentIds).add(taskId));

        try {
            const token = await AsyncStorage.getItem("access_token");
            if (!token) {
                throw new Error("Please sign in to complete a task.");
            }

            const response = await fetch(
                `${API_URL}/api/tasks/complete_task?task_id=${encodeURIComponent(taskId)}`,
                { method: "POST", headers: { Authorization: `Bearer ${token}` } },
            );
            const data = await response.json();

            if (!response.ok) {
                throw new Error(typeof data.detail === "string" ? data.detail : "Unable to complete task.");
            }

            setTasks((currentTasks) => currentTasks.map((task) =>
                task.id === taskId ? { ...task, status: data.status } : task,
            ));
        } catch (completeError) {
            setError(completeError instanceof Error ? completeError.message : "Unable to complete task.");
        } finally {
            setCompletingTaskIds((currentIds) => {
                const nextIds = new Set(currentIds);
                nextIds.delete(taskId);
                return nextIds;
            });
        }
    };

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.title}>Tasks</Text>
                <Text style={styles.count}>{tasks.length}</Text>
            </View>

            <View style={styles.taskList}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>My list</Text>
                    <Pressable
                        onPress={() => void loadTasks()}
                        disabled={loading}
                        accessibilityRole="button"
                        accessibilityLabel="Refresh tasks"
                        hitSlop={8}
                    >
                        <Ionicons name="refresh-outline" size={19} color={colors.textSecondary} />
                    </Pressable>
                </View>
                {loading ? <ActivityIndicator color={colors.primary} style={styles.loading} /> : tasks.length === 0 ? (
                    <Text style={styles.empty}>No tasks yet. Add one below.</Text>
                ) : tasks.map((task) => {
                    const completed = task.status.toLowerCase() === "completed";
                    const completing = completingTaskIds.has(task.id);

                    return (
                        <View key={task.id} style={styles.taskRow}>
                            <Pressable
                                onPress={() => void completeTask(task.id)}
                                disabled={completed || completing}
                                accessibilityRole="checkbox"
                                accessibilityLabel={`Mark ${task.name} as completed`}
                                accessibilityState={{ checked: completed, disabled: completed || completing }}
                                hitSlop={8}
                            >
                                <View style={[styles.checkbox, completed && styles.checkboxCompleted]}>
                                    {completing ? <ActivityIndicator size="small" color={colors.primary} /> :
                                        completed ? <Ionicons name="checkmark" size={14} color={colors.card} /> : null}
                                </View>
                            </Pressable>
                            <View style={styles.taskCopy}>
                                <Text style={[styles.taskName, completed && styles.taskNameCompleted]}>{task.name}</Text>
                                {task.description ? <Text style={styles.description}>{task.description}</Text> : null}
                            </View>
                        </View>
                    );
                })}
            </View>

            <View style={styles.addSection}>
                <Text style={styles.sectionTitle}>Add a task</Text>
                <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Task name"
                    accessibilityLabel="Task name"
                    placeholderTextColor={colors.textSecondary}
                    style={styles.input}
                />
                <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Description (optional)"
                    accessibilityLabel="Task description"
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    style={[styles.input, styles.descriptionInput]}
                />
                <Pressable
                    style={[styles.addButton, (saving || !name.trim()) && styles.addButtonDisabled]}
                    onPress={() => void createTask()}
                    disabled={saving || !name.trim()}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: saving || !name.trim() }}
                >
                    <Ionicons name="add" size={19} color={colors.card} />
                    <Text style={styles.addButtonText}>{saving ? "Adding..." : "Add task"}</Text>
                </Pressable>
            </View>
            {error ? <Text accessibilityRole="alert">{error}</Text> : null}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 32,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 30,
    },
    title: {
        color: colors.text,
        fontSize: 28,
        fontWeight: "700",
    },
    count: {
        color: colors.textSecondary,
        fontSize: 15,
    },
    taskList: {
        marginBottom: 34,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingBottom: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
    },
    sectionTitle: {
        color: colors.textSecondary,
        fontSize: 13,
        fontWeight: "600",
    },
    loading: {
        marginTop: 22,
    },
    empty: {
        color: colors.textSecondary,
        paddingVertical: 18,
    },
    taskRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        paddingVertical: 15,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
    },
    checkbox: {
        width: 19,
        height: 19,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: colors.textSecondary,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 1,
    },
    checkboxCompleted: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    taskCopy: {
        flex: 1,
        gap: 3,
    },
    taskName: {
        color: colors.text,
        fontSize: 15,
    },
    taskNameCompleted: {
        color: colors.textSecondary,
        textDecorationLine: "line-through",
    },
    description: {
        color: colors.textSecondary,
        fontSize: 13,
    },
    addSection: {
        gap: 10,
    },
    input: {
        color: colors.text,
        fontSize: 15,
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
    },
    descriptionInput: {
        minHeight: 42,
        textAlignVertical: "top",
    },
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
    addButtonDisabled: {
        opacity: 0.55,
    },
    addButtonText: {
        color: colors.card,
        fontSize: 14,
        fontWeight: "600",
    },
});