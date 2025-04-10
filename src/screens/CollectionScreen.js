import React, { useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Share, ScrollView, Animated, StyleSheet, Alert, Modal, TextInput } from 'react-native';
import { layout, typography, colors, buttons, images } from '../styles/theme';
import { SvgXml } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import ViewShot from 'react-native-view-shot';
import { LinearGradient } from 'expo-linear-gradient';
import * as MediaLibrary from 'expo-media-library';

const CollectionScreen = () => {
  const { user } = useAuth();
  const [downloadingCard, setDownloadingCard] = useState(null);

  const dragonBadgeSvg = require('../../assets/pixel-art/dragon-badge.svg').default;
  const featureBadgeSvg = require('../../assets/pixel-art/feature-badge.svg').default;
  const premiumBadgeSvg = require('../../assets/pixel-art/premium-badge.svg').default;
  const cardRefs = useRef({});
  const [cards, setCards] = useState([
    // Initialize with default cards array
    
    {
      id: '1',
      imageUri: 'https://placekitten.com/300/300',
      date: '2024-03-15',
      status: 'Ultra Virgin',
      type: 'virgin',
      streakDays: 8035,
      animation: 'sparkle',
      badge: 'dragon'
    },
    {
      id: '2',
      imageUri: 'https://placekitten.com/301/301',
      date: '2024-03-14',
      status: 'Mega Virgin',
      type: 'virgin',
      streakDays: 30,
      animation: 'glow',
      badge: 'feature'
    },
    {
      id: '3',
      imageUri: 'https://placekitten.com/302/302',
      date: '2024-03-15',
      status: 'NoFap Master',
      type: 'nofap',
      streakDays: 90,
      animation: 'pulse',
      badge: 'premium'
    },
  ]);

  const downloadCard = async (card) => {
    if (!cardRefs.current[card.id]) {
      Alert.alert('Error', 'Card reference not found. Please try again.');
      return;
    }

    try {
      setDownloadingCard(card);
      const cardRef = cardRefs.current[card.id];
      const uri = await cardRef.capture({
        format: 'jpg',
        quality: 0.9,
        result: 'tmpfile'
      });
      
      const { status } = await MediaLibrary.requestPermissionsAsync();
      
      if (status === 'granted') {
        try {
          await MediaLibrary.saveToLibraryAsync(uri);
          
          Alert.alert(
            '✨ Saved to Gallery!',
            card.type === 'virgin' 
              ? 'Your virgin card has been preserved for eternity!'
              : 'Your NoFap achievement has been saved!',
            [{ text: 'Nice!', style: 'default' }],
            { cancelable: false }
          );
        } catch (saveError) {
          console.error('Error saving to gallery:', saveError);
          Alert.alert('Error', 'Failed to save to gallery. Please try again.');
        }
      } else {
        Alert.alert('Permission Required', 'Please grant permission to save to gallery.');
      }
    } catch (error) {
      console.error('Error capturing card:', error);
      Alert.alert('Error', 'Failed to capture card. Please try again.');
    } finally {
      setDownloadingCard(null);
    }
  };

  const renderCard = ({ item }) => {
    const animationStyle = {
      sparkle: { transform: [{ scale: new Animated.Value(1) }] },
      glow: { shadowColor: colors.primary, shadowOpacity: new Animated.Value(0.5) },
      pulse: { opacity: new Animated.Value(1) }
    }[item.animation];

    return (
      <Animated.View style={[styles.cardWrapper, animationStyle]}>
        <ViewShot
          ref={ref => {
            if (ref) {
              cardRefs.current[item.id] = ref;
            }
          }}
          options={{
            format: 'jpg',
            quality: 0.9
          }}
          style={styles.card}
        >
          <LinearGradient
            colors={[colors.primary + '20', colors.secondary + '30']}
            style={styles.cardBackground}
          />

          <Image source={{ uri: item.imageUri }} style={styles.cardImage} />
          <TouchableOpacity 
            style={styles.downloadButton} 
            onPress={() => downloadCard(item)}
          >
            <Ionicons name="download-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={styles.statusContainer}>
                <Text style={[styles.statusText, styles.pixelText]}>{item.status}</Text>
                <View style={styles.badgeContainer}>
                  {item.badge === 'dragon' && <SvgXml xml={dragonBadgeSvg} width={32} height={32} />}
                  {item.badge === 'feature' && <SvgXml xml={featureBadgeSvg} width={32} height={32} />}
                  {item.badge === 'premium' && <SvgXml xml={premiumBadgeSvg} width={32} height={32} />}
                </View>
                <View style={[styles.verifiedBadge, styles.pixelBorder]}>
                  <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
                  <Text style={[styles.verifiedText, styles.pixelText]}>Verified 100% Pure</Text>
                </View>
              </View>
              <Text style={styles.streakText}>
                {item.streakDays} Days
              </Text>
            </View>
          </View>
        </ViewShot>
      </Animated.View>
    );
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.mainTitle}>My Collection</Text>

      <View style={styles.cardsContainer}>
        <FlatList
          data={cards}
          renderItem={renderCard}
          keyExtractor={item => item?.id || String(Math.random())}
          numColumns={1}
          key={1}
          scrollEnabled={false}
          contentContainerStyle={styles.gridContainer}
          ListEmptyComponent={() => (
            <Text style={[typography.body, { textAlign: 'center', marginTop: 20 }]}>
              No cards available
            </Text>
          )}
        />
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  customTextOverlay: {
    position: 'absolute',
    right: 0,
    width: '55%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  customText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    fontFamily: 'monospace',
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 20,
    width: '80%',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  modalTitle: {
    ...typography.title,
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  textInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    color: colors.text,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.error + '20',
    borderWidth: 1,
    borderColor: colors.error,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    ...typography.button,
    color: colors.text,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 16,
  },
  mainTitle: {
    ...typography.title,
    textAlign: 'center',
    marginVertical: 20,
    color: colors.primary,
    textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
    letterSpacing: 2,
  },
  cardWrapper: {
    width: '100%',
    height: 220,
    marginVertical: 16,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 12,
    backgroundColor: colors.background,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    borderWidth: 3,
    borderColor: colors.primary + '90',
    borderStyle: 'solid',
    transform: [{ perspective: 1000 }],
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.background,
    height: '100%',
  },
  cardBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1a1a2e',
    opacity: 0.9,
  },
  pixelPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    backgroundImage: `
      linear-gradient(45deg, #fff 25%, transparent 25%),
      linear-gradient(-45deg, #fff 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #fff 75%),
      linear-gradient(-45deg, transparent 75%, #fff 75%)
    `,
    backgroundSize: '20px 20px',
    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
  },
  pixelText: {
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
    color: colors.primary,
  },
  pixelBorder: {
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.primary + '90',
    borderRadius: 12,
    backgroundColor: colors.background + '10',
    backdropFilter: 'blur(4px)',
  },
  badgeContainer: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 48,
    height: 48,
    transform: [{ rotate: '15deg' }],
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardImage: {
    position: 'absolute',
    width: '45%',
    height: '110%',
    resizeMode: 'cover',
    transform: [{ scale: 1.1 }],
    opacity: 0.9,
  },
  cardContent: {
    position: 'absolute',
    right: 0,
    width: '60%',
    height: '100%',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderLeftWidth: 3,
    borderLeftColor: colors.primary + '60',
    backdropFilter: 'blur(8px)',
  },
  cardHeader: {
    marginBottom: 12,
  },
  statusContainer: {
    marginBottom: 8,
  },
  statusText: {
    ...typography.subtitle,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 6,
    textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  verifiedText: {
    ...typography.caption,
    marginLeft: 6,
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
    textShadow: '1px 1px 1px rgba(0,0,0,0.1)',
  },
  streakText: {
    ...typography.title,
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.secondary,
    textAlign: 'right',
    textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
    letterSpacing: 1,
  },
  downloadButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    padding: 10,
    backgroundColor: colors.primary + '10',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  gridContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});

export default CollectionScreen;