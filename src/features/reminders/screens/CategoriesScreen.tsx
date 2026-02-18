import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors, useCategoryStore, useReminderStore } from '../../../core/store';
import type { Category } from '../../../shared/types';

export interface CategoriesScreenProps {
  onClose: () => void;
}

export function CategoriesScreen({ onClose }: CategoriesScreenProps) {
  const colors = useThemeColors();
  const { categories, addCategory, updateCategory, removeCategory } = useCategoryStore();
  const { reminders, updateReminder } = useReminderStore();
  const [newName, setNewName] = useState('');
  const [editing, setEditing] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
        closeBtn: { paddingVertical: 8, paddingHorizontal: 12 },
        closeBtnText: { fontSize: 16, color: colors.primary, fontWeight: '500' },
        scroll: { padding: 16, paddingBottom: 32 },
        label: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 },
        input: {
          borderWidth: 1,
          borderColor: colors.inputBorder,
          borderRadius: 10,
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontSize: 16,
          color: colors.inputText,
          backgroundColor: colors.inputBg,
        },
        addRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
        addInput: { flex: 1 },
        addBtn: {
          paddingHorizontal: 16,
          justifyContent: 'center',
          borderRadius: 10,
          backgroundColor: colors.primary,
        },
        addBtnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
        listLabel: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: 12 },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 14,
          paddingHorizontal: 4,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        rowName: { fontSize: 16, color: colors.text, flex: 1 },
        rowActions: { flexDirection: 'row', gap: 12 },
        rowBtn: { paddingVertical: 6, paddingHorizontal: 10 },
        rowBtnText: { fontSize: 14, color: colors.primary, fontWeight: '500' },
        deleteBtnText: { fontSize: 14, color: colors.danger, fontWeight: '500' },
        modalOverlay: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.4)',
        },
        modalContent: {
          backgroundColor: colors.background,
          borderRadius: 12,
          width: '85%',
          maxWidth: 340,
          padding: 20,
        },
        modalTitle: { fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 16 },
        modalInput: { marginBottom: 16 },
        modalRow: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
        modalBtn: { paddingVertical: 10, paddingHorizontal: 16 },
        modalBtnText: { fontSize: 15, color: colors.textSecondary },
        modalBtnPrimary: { color: colors.primary, fontWeight: '600' },
      }),
    [colors]
  );

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    try {
      await addCategory(name);
      setNewName('');
    } catch {
      Alert.alert('Error', 'Could not add category.');
    }
  };

  const handleStartEdit = (cat: Category) => {
    setEditing(cat);
    setEditName(cat.name);
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    const name = editName.trim();
    if (!name) return;
    await updateCategory(editing.id, name);
    setEditing(null);
    setEditName('');
  };

  const handleDelete = (cat: Category) => {
    const count = reminders.filter((r) => r.categoryId === cat.id).length;
    Alert.alert(
      'Delete category',
      count > 0
        ? `"${cat.name}" has ${count} reminder${count === 1 ? '' : 's'}. They will become uncategorized. Delete anyway?`
        : `Delete "${cat.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            for (const r of reminders) {
              if (r.categoryId === cat.id) {
                await updateReminder(r.id, { categoryId: null });
              }
            }
            await removeCategory(cat.id);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Categories</Text>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>New category</Text>
        <View style={styles.addRow}>
          <TextInput
            style={[styles.input, styles.addInput]}
            value={newName}
            onChangeText={setNewName}
            placeholder="e.g. Work, Health"
            placeholderTextColor={colors.placeholder}
            onSubmitEditing={handleAdd}
          />
          <TouchableOpacity
            style={styles.addBtn}
            onPress={handleAdd}
            disabled={!newName.trim()}
          >
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.listLabel}>Your categories</Text>
        {categories.map((cat) => (
          <View key={cat.id} style={styles.row}>
            <Text style={styles.rowName}>{cat.name}</Text>
            <View style={styles.rowActions}>
              <TouchableOpacity style={styles.rowBtn} onPress={() => handleStartEdit(cat)}>
                <Text style={styles.rowBtnText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.rowBtn} onPress={() => handleDelete(cat)}>
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={editing !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditing(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setEditing(null)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Edit category</Text>
            <TextInput
              style={[styles.input, styles.modalInput]}
              value={editName}
              onChangeText={setEditName}
              placeholder="Category name"
              placeholderTextColor={colors.placeholder}
              autoFocus
            />
            <View style={styles.modalRow}>
              <TouchableOpacity style={styles.modalBtn} onPress={() => setEditing(null)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtn}
                onPress={handleSaveEdit}
                disabled={!editName.trim()}
              >
                <Text style={[styles.modalBtnText, styles.modalBtnPrimary]}>Save</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
