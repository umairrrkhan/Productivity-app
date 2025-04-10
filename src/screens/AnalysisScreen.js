import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Share, ActivityIndicator, Animated } from 'react-native';
import { layout, typography, images, buttons, colors } from '../styles/theme';

const AnalysisScreen = ({ route }) => {
  const { imageUri } = route.params;
  const [status, setStatus] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));

  const virginStatuses = [
    { title: "Ultra Virgin", description: "Pure as freshly fallen snow! ❄️" },
    { title: "Mega Virgin", description: "Not even holding hands! 🤝" },
    { title: "Virgin Lord", description: "Master of abstinence! 👑" },
    { title: "Virgin Warrior", description: "Fighting off temptations! ⚔️" },
    { title: "Virgin Sage", description: "Wisdom over worldly desires! 🧙‍♂️" }
  ];

  useEffect(() => {
    // Simulate analysis with random timing
    const analysisTime = Math.random() * 2000 + 1000; // 1-3 seconds
    
    setTimeout(() => {
      const randomStatus = virginStatuses[Math.floor(Math.random() * virginStatuses.length)];
      setStatus(randomStatus);
      setIsAnalyzing(false);
      
      // Fade in the results
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true
      }).start();
    }, analysisTime);
  }, []);

  const shareResult = async () => {
    try {
      await Share.share({
        message: `My Virgin Status: ${status.title}\n${status.description}\nDetected by Virgin Detector App! 🔍`,
        url: imageUri
      });
    } catch (error) {
      console.error('Error sharing result:', error);
      alert('Failed to share. Please try again.');
    }
  };

  return (
    <View style={layout.container}>
      <Text style={typography.title}>Analysis Results</Text>
      {imageUri && <Image source={{ uri: imageUri }} style={images.medium} />}
      
      {isAnalyzing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[typography.body, styles.loadingText]}>
            Scanning for Virgin Vibes... 🔍
          </Text>
        </View>
      ) : (
        <Animated.View style={[styles.resultContainer, { opacity: fadeAnim }]}>
          <Text style={styles.statusTitle}>{status.title}</Text>
          <Text style={styles.statusDescription}>{status.description}</Text>
          
          <TouchableOpacity 
            style={[buttons.primary, styles.shareButton]} 
            onPress={shareResult}
          >
            <Text style={[typography.button, { color: colors.background }]}>
              Share Result 🚀
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = {
  loadingContainer: {
    alignItems: 'center',
    marginTop: 20
  },
  loadingText: {
    marginTop: 10,
    fontStyle: 'italic'
  },
  resultContainer: {
    alignItems: 'center',
    marginTop: 20,
    padding: 20,
    borderRadius: 15,
    backgroundColor: colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  statusTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10
  },
  statusDescription: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center'
  },
  shareButton: {
    marginTop: 20,
    paddingHorizontal: 30
  }
};

export default AnalysisScreen;