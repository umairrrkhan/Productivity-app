import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { layout, typography, colors, buttons } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';

const ShopScreen = ({ navigation }) => {
  const premiumFeatures = [
    {
      id: 'vip_membership',
      title: '🌟 VIP Membership',
      price: '$9.99/month',
      description: 'Get exclusive benefits: Early access to new features including Advanced Virgin Detection Pro, premium support, and special perks!',
      icon: 'diamond-outline'
    },
    {
      id: 'advanced_detection',
      title: '🔍 Advanced Virgin Detection Pro',
      price: 'Coming Soon',
      description: 'Experience next-level virgin detection with AI-powered analysis, enhanced accuracy, and detailed purity reports!',
      icon: 'scan-outline'
    }
  ];

  const renderFeatureItem = (item) => (
    <View key={item.id} style={styles.featureCard}>
      <View style={styles.featureHeader}>
        <Ionicons name={item.icon} size={24} color={colors.primary} />
        <Text style={styles.price}>{item.price}</Text>
      </View>
      <Text style={styles.featureTitle}>{item.title}</Text>
      <Text style={styles.featureDescription}>{item.description}</Text>
      <TouchableOpacity 
        style={[buttons.primary, styles.buyButton, item.id === 'advanced_detection' && styles.comingSoonButton]}
        disabled={item.id === 'advanced_detection'}
        onPress={() => {
          if (item.id === 'vip_membership') {
            // Handle VIP membership purchase
          }
        }}
      >
        <Text style={[typography.button, { color: colors.background }]}>
          {item.id === 'advanced_detection' ? 'Coming Soon' : 'Get Now'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={typography.title}>Premium Shop</Text>
        <Text style={[typography.body, styles.subtitle]}>
          Elevate your virgin status with exclusive premium features!
        </Text>
      </View>

      <View style={styles.featuresContainer}>
        {premiumFeatures.map(renderFeatureItem)}
      </View>

      <View style={styles.guaranteeSection}>
        <Ionicons name="checkmark-circle-outline" size={24} color={colors.primary} />
        <Text style={styles.guaranteeText}>
          100% Satisfaction Guaranteed - 30-day money-back promise!
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    alignItems: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 8,
    color: colors.textSecondary,
  },
  featuresContainer: {
    padding: 16,
  },
  featureCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    ...typography.subtitle,
    color: colors.primary,
    marginBottom: 8,
  },
  price: {
    ...typography.subtitle,
    color: colors.secondary,
    fontWeight: 'bold',
  },
  featureDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  buyButton: {
    marginTop: 8,
  },
  guaranteeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.background,
    marginTop: 8,
    marginBottom: 24,
  },
  guaranteeText: {
    ...typography.body,
    color: colors.primary,
    marginLeft: 8,
    flex: 1,
  },
});

export default ShopScreen;