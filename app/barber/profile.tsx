import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Image,
} from 'react-native';
import { Save, Camera, Instagram, Award, Tag } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { BARBER_SPECIALTY_TAGS, BarberSpecialtyTag } from '@/types';

export default function BarberProfileScreen() {
  const { user } = useAuth();
  const { getBarberByUserId, updateBarberProfile } = useData();

  const barber = useMemo(() => {
    if (!user) return null;
    return getBarberByUserId(user.id);
  }, [user, getBarberByUserId]);

  const [bio, setBio] = useState(barber?.bio ?? '');
  const [instagram, setInstagram] = useState(barber?.instagram ?? '');
  const [yearsExp, setYearsExp] = useState(barber?.yearsExperience?.toString() ?? '0');
  const [selectedTags, setSelectedTags] = useState<BarberSpecialtyTag[]>(barber?.specialtyTags ?? []);
  const [saving, setSaving] = useState(false);

  const toggleTag = useCallback((tag: BarberSpecialtyTag) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag);
      }
      if (prev.length >= 6) {
        Alert.alert('Limit reached', 'You can select up to 6 specialty tags');
        return prev;
      }
      return [...prev, tag];
    });
  }, []);

  const handleSave = async () => {
    if (!barber) return;
    setSaving(true);
    try {
      await updateBarberProfile(barber.id, {
        bio: bio.trim(),
        instagram: instagram.trim(),
        yearsExperience: parseInt(yearsExp, 10) || 0,
        specialtyTags: selectedTags,
      });
      Alert.alert('Saved', 'Your profile has been updated');
    } catch {
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (!barber) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Barber profile not found</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarSection}>
        <Image source={{ uri: barber.avatar }} style={styles.avatar} />
        <Text style={styles.barberName}>{barber.name}</Text>
        <Text style={styles.barberEmail}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Tag size={16} color={Colors.accent} />
          <Text style={styles.sectionTitle}>Specialties</Text>
          <Text style={styles.tagCount}>{selectedTags.length}/6</Text>
        </View>
        <Text style={styles.sectionDesc}>
          Select tags that describe what you do best
        </Text>
        <View style={styles.tagsGrid}>
          {BARBER_SPECIALTY_TAGS.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <TouchableOpacity
                key={tag}
                style={[styles.tagChip, isSelected && styles.tagChipSelected]}
                onPress={() => toggleTag(tag)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About Me</Text>
        <TextInput
          style={styles.bioInput}
          value={bio}
          onChangeText={setBio}
          placeholder="Tell clients about yourself, your style, and experience..."
          placeholderTextColor={Colors.textMuted}
          multiline
          textAlignVertical="top"
          maxLength={250}
        />
        <Text style={styles.charCount}>{bio.length}/250</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.fieldRow}>
          <View style={styles.fieldIconWrap}>
            <Instagram size={18} color={Colors.accent} />
          </View>
          <View style={styles.fieldContent}>
            <Text style={styles.fieldLabel}>Instagram</Text>
            <TextInput
              style={styles.fieldInput}
              value={instagram}
              onChangeText={setInstagram}
              placeholder="@yourhandle"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.fieldRow}>
          <View style={styles.fieldIconWrap}>
            <Award size={18} color={Colors.accent} />
          </View>
          <View style={styles.fieldContent}>
            <Text style={styles.fieldLabel}>Years of Experience</Text>
            <TextInput
              style={styles.fieldInput}
              value={yearsExp}
              onChangeText={setYearsExp}
              placeholder="0"
              placeholderTextColor={Colors.textMuted}
              keyboardType="number-pad"
            />
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={saving}
        activeOpacity={0.8}
      >
        <Save size={18} color={Colors.black} />
        <Text style={styles.saveBtnText}>
          {saving ? 'Saving...' : 'Save Profile'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 16, color: Colors.textSecondary },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: Colors.surface,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  barberName: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  barberEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  section: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    flex: 1,
  },
  sectionDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 14,
    marginTop: 4,
  },
  tagCount: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagChipSelected: {
    backgroundColor: 'rgba(200,149,108,0.15)',
    borderColor: Colors.accent,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  tagTextSelected: {
    color: Colors.accent,
  },
  bioInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    color: Colors.text,
    fontSize: 15,
    minHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
    lineHeight: 22,
    marginTop: 8,
  },
  charCount: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'right' as const,
    marginTop: 6,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  fieldIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(200,149,108,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldContent: { flex: 1 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  fieldInput: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    height: 44,
    paddingHorizontal: 14,
    color: Colors.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    height: 54,
    borderRadius: 14,
    gap: 8,
    marginTop: 8,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: 16, fontWeight: '700' as const, color: Colors.black },
});
