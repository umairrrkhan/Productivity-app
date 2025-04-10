import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../contexts/AuthContext';
import { colors, typography, buttons } from '../styles/theme';

const SettingsScreen = ({ navigation }) => {
  const { user, logout, updateProfile } = useAuth();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState(new Date(user?.dateOfBirth || Date.now()));

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const handleDateChange = async (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      try {
        const today = new Date();
        const age = today.getFullYear() - selectedDate.getFullYear();
        if (age < 13) {
          Alert.alert('Error', 'You must be at least 13 years old');
          return;
        }
        setDateOfBirth(selectedDate);
        await updateProfile({ dateOfBirth: selectedDate.toISOString() });
        Alert.alert('Success', 'Date of birth updated successfully');
      } catch (error) {
        Alert.alert('Error', 'Failed to update date of birth. Please try again.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[typography.title, styles.title]}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Date of Birth</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <Text style={styles.value}>
            {dateOfBirth.toLocaleDateString()}
          </Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={dateOfBirth}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      <TouchableOpacity 
        style={[buttons.primary, styles.logoutButton]}
        onPress={handleLogout}
      >
        <Text style={[typography.button, { color: colors.background }]}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  title: {
    marginBottom: 30,
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  value: {
    ...typography.subtitle,
    color: colors.text,
  },
  logoutButton: {
    marginTop: 'auto',
    backgroundColor: colors.error,
  },
});

export default SettingsScreen;