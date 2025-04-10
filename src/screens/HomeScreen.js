import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as FaceDetector from 'expo-face-detector';
import ViewShot from 'react-native-view-shot';
import { Ionicons } from '@expo/vector-icons';
import { layout, typography, buttons, colors } from '../styles/theme';
import { LinearGradient } from 'expo-linear-gradient';
import * as MediaLibrary from 'expo-media-library';
import { ScrollView } from 'react-native';

const HomeScreen = ({ navigation }) => {
  const [scanning, setScanning] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [detectedAge, setDetectedAge] = useState(null);
  const resultRef = React.useRef();

  const generateResult = (isVirgin) => {
    const status = isVirgin ? 'Certified Virgin' : 'Non-Virgin Detected';
    const confidence = Math.floor(Math.random() * 20) + 80; // Random confidence between 80-99%
    setDetectionResult({ status, confidence });
  };

  const estimateAge = (face) => {
    // Enhanced facial features analysis for more accurate age estimation
    // This algorithm uses multiple facial dimensions, proportions, and features
    // with special handling for younger faces and glasses detection
    
    // Extract face dimensions and features
    const { bounds, leftEyePosition, rightEyePosition, leftCheekPosition, rightCheekPosition, 
            leftEarPosition, rightEarPosition, leftMouthPosition, rightMouthPosition, noseBasePosition,
            leftEyeOpenProbability, rightEyeOpenProbability } = face;
    
    // Calculate facial proportions with weighted factors
    let ageFactors = [];
    let weights = [];
    
    // Check for glasses (indirect detection through eye probability and face features)
    const hasGlasses = detectGlasses(face);
    
    // 1. Eye-related factors (higher weight as it's a strong age indicator)
    if (leftEyePosition && rightEyePosition) {
      // Calculate inter-eye distance
      const eyeDistance = Math.sqrt(
        Math.pow(rightEyePosition.x - leftEyePosition.x, 2) +
        Math.pow(rightEyePosition.y - leftEyePosition.y, 2)
      );
      
      // Eye distance relative to face width (children have larger eyes relative to face)
      const eyeToFaceRatio = eyeDistance / bounds.size.width;
      
      // Enhanced eye-to-face ratio calculation (more sensitive to younger faces)
      // Lower values for younger faces (larger eyes relative to face)
      // Adjusted to better handle younger faces
      let eyeAgeFactor = 25 - (eyeToFaceRatio * 130);
      
      // Apply correction if glasses are detected
      if (hasGlasses) {
        // Glasses can make eyes appear smaller, adjust the factor
        eyeAgeFactor -= 3;
      }
      
      ageFactors.push(eyeAgeFactor);
      weights.push(3.0); // Increased weight for eye measurements for younger faces
    }
    
    // 2. Face shape ratio (roundness factor)
    const faceRatio = bounds.size.height / bounds.size.width;
    // Younger faces tend to be more round (ratio closer to 1)
    // Enhanced calculation with better sensitivity to age differences in children
    let shapeAgeFactor = 12 + (faceRatio - 1) * 20;
    
    // Children have rounder faces, adjust the factor for better accuracy
    if (faceRatio > 0.95 && faceRatio < 1.05) {
      shapeAgeFactor -= 4; // Further reduce age estimate for very round faces
    }
    
    ageFactors.push(shapeAgeFactor);
    weights.push(2.2); // Increased weight for face shape for younger faces
    
    // 3. Face symmetry factor (more symmetrical faces often appear younger)
    if (leftEyePosition && rightEyePosition && noseBasePosition) {
      // Calculate vertical symmetry using eye positions relative to nose
      const leftEyeToNoseY = Math.abs(leftEyePosition.y - noseBasePosition.y);
      const rightEyeToNoseY = Math.abs(rightEyePosition.y - noseBasePosition.y);
      const eyeSymmetry = Math.abs(leftEyeToNoseY - rightEyeToNoseY) / bounds.size.height;
      
      // More symmetrical faces (lower value) tend to be younger
      const symmetryFactor = 15 + (eyeSymmetry * 50);
      ageFactors.push(symmetryFactor);
      weights.push(1.0); // Reduced weight as symmetry can be affected by expression
    }
    
    // 4. Face proportions factor (forehead to face ratio changes with age)
    if (leftEyePosition && rightEyePosition) {
      // Average eye height as reference point
      const eyeHeight = (leftEyePosition.y + rightEyePosition.y) / 2;
      // Forehead proportion (distance from top of face to eyes)
      const foreheadRatio = eyeHeight / bounds.size.height;
      
      // Children have larger foreheads proportionally
      // Enhanced calculation for better accuracy with children
      let foreheadAgeFactor = 12 + ((1 - foreheadRatio) * 35);
      
      // Apply correction if glasses are detected
      if (hasGlasses) {
        // Glasses can affect forehead ratio perception
        foreheadAgeFactor += 1;
      }
      
      ageFactors.push(foreheadAgeFactor);
      weights.push(2.0); // Increased weight for forehead ratio for younger faces
    }
    
    // 5. Face size factor (calibrated for better accuracy with children)
    // Adjusted to be more sensitive to smaller faces (children)
    const faceSizeRatio = bounds.size.width / 250;
    let sizeAgeFactor = (faceSizeRatio * 15) + 8; // Lowered base value for younger estimates
    
    // Very small faces are likely to be children
    if (faceSizeRatio < 0.8) {
      sizeAgeFactor -= 2; // Further reduce for smaller faces
    }
    
    ageFactors.push(sizeAgeFactor);
    weights.push(1.2); // Increased weight as size is important for children
    
    // 6. Nose-to-face ratio (children have smaller noses)
    if (noseBasePosition && leftEyePosition && rightEyePosition) {
      // Calculate nose width relative to eye distance
      const eyeDistance = Math.sqrt(
        Math.pow(rightEyePosition.x - leftEyePosition.x, 2) +
        Math.pow(rightEyePosition.y - leftEyePosition.y, 2)
      );
      
      // Estimate nose width (not directly available from API)
      const estimatedNoseWidth = eyeDistance * 0.6; // Approximation
      const noseToFaceRatio = estimatedNoseWidth / bounds.size.width;
      
      // Children have smaller noses relative to face width
      const noseAgeFactor = 10 + (noseToFaceRatio * 100);
      ageFactors.push(noseAgeFactor);
      weights.push(1.5);
    }
    
    // 7. Cheek fullness factor (children have fuller cheeks)
    if (leftCheekPosition && rightCheekPosition && noseBasePosition) {
      // Calculate cheek fullness using distance from nose to cheeks
      const leftCheekDistance = Math.sqrt(
        Math.pow(leftCheekPosition.x - noseBasePosition.x, 2) +
        Math.pow(leftCheekPosition.y - noseBasePosition.y, 2)
      );
      
      const rightCheekDistance = Math.sqrt(
        Math.pow(rightCheekPosition.x - noseBasePosition.x, 2) +
        Math.pow(rightCheekPosition.y - noseBasePosition.y, 2)
      );
      
      // Average cheek distance relative to face width
      const avgCheekDistance = (leftCheekDistance + rightCheekDistance) / 2;
      const cheekToFaceRatio = avgCheekDistance / bounds.size.width;
      
      // Fuller cheeks (lower ratio) indicate younger age
      const cheekAgeFactor = 8 + (cheekToFaceRatio * 60);
      ageFactors.push(cheekAgeFactor);
      weights.push(1.8);
    }
    
    // Calculate weighted average for final age estimate
    let estimatedAge;
    if (ageFactors.length > 0) {
      let weightedSum = 0;
      let totalWeight = 0;
      
      for (let i = 0; i < ageFactors.length; i++) {
        weightedSum += ageFactors[i] * weights[i];
        totalWeight += weights[i];
      }
      
      const baseAge = weightedSum / totalWeight;
      
      // Add minimal randomness (±1 year) for natural variation
      estimatedAge = Math.round(baseAge + (Math.random() * 2 - 1));
      
      // Apply glasses correction to final estimate if needed
      if (hasGlasses) {
        // Glasses tend to make people look older, apply a correction
        estimatedAge = Math.max(8, estimatedAge - 2);
      }
      
      // Ensure age is within reasonable bounds (8-40)
      // Expanded lower bound to allow for much younger estimates
      estimatedAge = Math.max(8, Math.min(40, estimatedAge));
    } else {
      // Improved fallback with better age distribution for younger faces
      estimatedAge = Math.floor(Math.random() * 20) + 10; // Random between 10-29
    }
    
    setDetectedAge(estimatedAge);
    return estimatedAge;
  };
  
  // Helper function to detect if the person is wearing glasses
  const detectGlasses = (face) => {
    // This is a heuristic approach since the API doesn't directly detect glasses
    const { leftEyeOpenProbability, rightEyeOpenProbability, bounds, leftEyePosition, rightEyePosition } = face;
    
    // Several indicators that might suggest glasses:
    
    // 1. Eye openness probability is often lower with glasses due to frame interference
    let glassesScore = 0;
    
    // Check if eye probability values are available
    if (leftEyeOpenProbability !== undefined && rightEyeOpenProbability !== undefined) {
      const avgEyeOpenness = (leftEyeOpenProbability + rightEyeOpenProbability) / 2;
      // Lower eye openness probability can indicate glasses
      if (avgEyeOpenness < 0.8) {
        glassesScore += 1;
      }
    }
    
    // 2. Check for eye position anomalies that might indicate glasses
    if (leftEyePosition && rightEyePosition) {
      // Calculate inter-eye distance
      const eyeDistance = Math.sqrt(
        Math.pow(rightEyePosition.x - leftEyePosition.x, 2) +
        Math.pow(rightEyePosition.y - leftEyePosition.y, 2)
      );
      
      // Eye distance relative to face width
      const eyeToFaceRatio = eyeDistance / bounds.size.width;
      
      // Glasses can sometimes make the detected eye positions appear further apart
      if (eyeToFaceRatio > 0.35) {
        glassesScore += 1;
      }
    }
    
    // 3. Check for face landmarks that might be affected by glasses
    // This is a simplified approach as we don't have direct access to all facial landmarks
    
    // Return true if enough indicators suggest glasses
    return glassesScore >= 1;
  };
  

  const detectFace = async (imageUri) => {
    setScanning(true);
    try {
      const options = {
        mode: FaceDetector.FaceDetectorMode.accurate,
        detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
        runClassifications: FaceDetector.FaceDetectorClassifications.all,
        minDetectionInterval: 100,
        tracking: false,
      };

      const { faces } = await FaceDetector.detectFacesAsync(imageUri, options);
      setScanning(false);

      if (faces.length > 0) {
        setSelectedImage(imageUri);
        const age = estimateAge(faces[0]); // Estimate age based on the first detected face using our improved algorithm
        
        // More nuanced virgin detection logic based on age
        // Younger people are more likely to be virgins
        let isVirgin;
        if (age < 20) {
          // Higher probability of being virgin for younger ages
          isVirgin = true;
        } else if (age < 25) {
          // Still likely to be virgin but with some variation
          isVirgin = Math.random() > 0.2; // 80% chance of being virgin
        } else if (age < 30) {
          // Less likely but still possible
          isVirgin = Math.random() > 0.6; // 40% chance of being virgin
        } else {
          // Least likely for older ages
          isVirgin = Math.random() > 0.9; // 10% chance of being virgin
        }
        
        generateResult(isVirgin); // Pass the virgin status based on age
      } else {
        Alert.alert('Error', 'No face detected. Please try again with a clearer photo.');
      }
    } catch (error) {
      console.error('Error detecting face:', error);
      setScanning(false);
      Alert.alert('Error', 'Face detection failed. Please try again.');
    }
  };

  const detectAge = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need camera permissions to make this work!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 1,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await detectFace(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo for age detection:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const downloadResult = async () => {
    if (!resultRef.current) return;

    try {
      const uri = await resultRef.current.capture();
      const { status } = await MediaLibrary.requestPermissionsAsync();
      
      if (status === 'granted') {
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert('Success', 'Result saved to gallery!');
      } else {
        Alert.alert('Permission Required', 'Please grant permission to save to gallery.');
      }
    } catch (error) {
      console.error('Error saving result:', error);
      Alert.alert('Error', 'Failed to save result. Please try again.');
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need camera roll permissions to make this work!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await detectFace(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need camera permissions to make this work!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 1,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await detectFace(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={true}
    >
      <Text style={[typography.title, styles.title]}>Virgin Detector</Text>
      
      {!detectionResult ? (
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[buttons.primary, styles.button]} 
            onPress={pickImage}
          >
            <Ionicons name="images-outline" size={24} color={colors.background} />
            <Text style={[typography.button, { color: colors.background }]}>Select Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[buttons.primary, styles.button]} 
            onPress={takePhoto}
          >
            <Ionicons name="camera-outline" size={24} color={colors.background} />
            <Text style={[typography.button, { color: colors.background }]}>Take Photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[buttons.primary, styles.button]} 
            onPress={detectAge}
          >
            <Ionicons name="calendar-outline" size={24} color={colors.background} />
            <Text style={[typography.button, { color: colors.background }]}>Detect Age</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.resultContainer}>
          <ViewShot
            ref={resultRef}
            options={{ format: 'jpg', quality: 0.9 }}
            style={styles.resultCard}
          >
            <LinearGradient
              colors={[colors.primary + '20', colors.secondary + '30']}
              style={styles.cardBackground}
            />
            <View style={styles.cardContent}>
              <Image source={{ uri: selectedImage }} style={styles.resultImage} />
              
              <View style={styles.resultInfo}>
                <View style={styles.statusContainer}>
                  <Text style={styles.statusText}>{detectionResult.status}</Text>
                  <View style={styles.confidenceContainer}>
                    <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
                    <Text style={styles.confidenceText}>
                      {detectionResult.confidence}% Confidence
                    </Text>
                  </View>
                  {detectedAge && (
                    <View style={styles.ageContainer}>
                      <Ionicons name="calendar" size={16} color={colors.primary} />
                      <Text style={styles.ageText}>
                        Estimated Age: {detectedAge} years
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                  <Text style={styles.verifiedText}>Verified by Virgin Detector</Text>
                </View>
              </View>
            </View>
          </ViewShot>

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[buttons.primary, styles.actionButton]} 
              onPress={downloadResult}
            >
              <Ionicons name="download-outline" size={24} color={colors.background} />
              <Text style={[typography.button, { color: colors.background }]}>Save Result</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[buttons.secondary, styles.actionButton]} 
              onPress={() => {
                setDetectionResult(null);
                setSelectedImage(null);
                setDetectedAge(null);
              }}
            >
              <Ionicons name="refresh-outline" size={24} color={colors.primary} />
              <Text style={[typography.button, { color: colors.primary }]}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32, // Add extra padding at the bottom
  },
  title: {
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 15,
  },
  resultContainer: {
    width: '100%',
    alignItems: 'center',
  },
  resultCard: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.background,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardContent: {
    padding: 16,
  },
  resultImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    marginBottom: 16,
  },
  resultInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
  },
  statusContainer: {
    marginBottom: 16,
  },
  statusText: {
    ...typography.title,
    fontSize: 24,
    color: colors.primary,
    marginBottom: 8,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  confidenceText: {
    ...typography.body,
    color: colors.primary,
  },
  ageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ageText: {
    ...typography.body,
    color: colors.primary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border + '40',
  },
  verifiedText: {
    ...typography.body,
    color: colors.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
});

export default HomeScreen;