import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, RefreshControl, StyleSheet, TextInput, Modal, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as FaceDetector from 'expo-face-detector';
import { layout, typography, buttons, colors } from '../styles/theme';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../contexts/AuthContext';

const StreakScreen = ({ navigation }) => {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [activeTab, setActiveTab] = useState('virgin'); // 'virgin' or 'nofap'
    const [currentStreak, setCurrentStreak] = useState({ virgin: 0, nofap: 0 });
    const [lastCheckIn, setLastCheckIn] = useState({ virgin: null, nofap: null });
    const [scanning, setScanning] = useState(false);
    const [scanAnimation, setScanAnimation] = useState(new Animated.Value(0));
    const [scanMessage, setScanMessage] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [dailyFact, setDailyFact] = useState('');
    const [progressAnimation, setProgressAnimation] = useState(new Animated.Value(0));
    const [showCelebration, setShowCelebration] = useState(false);
    const [isDOBSet, setIsDOBSet] = useState(false);
    const [milestones, setMilestones] = useState({
        virgin: [
            { days: 7, reward: 'Bronze Virgin Badge', achieved: false },
            { days: 30, reward: 'Silver Virgin Badge', achieved: false },
            { days: 100, reward: 'Golden Virgin Badge', achieved: false },
        ],
        nofap: [
            { days: 7, reward: 'Bronze NoFap Badge', achieved: false },
            { days: 30, reward: 'Silver NoFap Badge', achieved: false },
            { days: 90, reward: 'Gold NoFap Badge', achieved: false },
            { days: 365, reward: 'Diamond NoFap Badge', achieved: false },
        ],
    });

    const { user } = useAuth(); // Get user context for date of birth
    const [showResetModal, setShowResetModal] = useState(false); // For NoFap reset

    const virginFacts = [
        "Did you know? Isaac Newton died a virgin, proving that great minds focus on science, not romance! 🧪",
        "Fun fact: Nikola Tesla remained a virgin his whole life while inventing AC electricity. Now that's what we call a power move! ⚡",
        "Virgin tip: Every time you resist temptation, your coding skills improve by 0.1%! 💻",
        "Remember: Being a virgin is like being a unicorn - rare, magical, and totally awesome! 🦄",
        "Virgin wisdom: While others waste time dating, you're mastering the art of clean code! 📚"
    ];

    const noFapFacts = [
        "NoFap Fact 1:  Increased energy levels are commonly reported by NoFap participants.  You might find yourself more productive! 🚀",
        "NoFap Fact 2:  Many report improved focus and concentration after starting NoFap.  Sharpen that mind! 🧠",
        "NoFap Fact 3:  Some studies suggest a temporary increase in testosterone levels during NoFap. 💪",
        "NoFap Fact 4:  NoFap can lead to increased self-control and discipline.  Master yourself! 🧘",
        "NoFap Fact 5:  Participants often report feeling more confident and socially adept.  Shine on! ✨"
    ];


    useEffect(() => {
        const fact = activeTab === 'virgin' ? virginFacts[Math.floor(Math.random() * virginFacts.length)] : noFapFacts[Math.floor(Math.random() * noFapFacts.length)];
        setDailyFact(fact);
        animateProgress();
    }, [activeTab]); // Only re-run when activeTab changes

    useEffect(() => {
        if (activeTab === 'virgin' && user?.dateOfBirth && !isDOBSet) {
            const virginStreak = calculateInitialStreak(user.dateOfBirth);
            setCurrentStreak(prev => ({ ...prev, virgin: virginStreak }));
            setIsDOBSet(true);
        }
    }, [activeTab, user?.dateOfBirth, isDOBSet]); // Only run when these dependencies change

    const calculateInitialStreak = (dob) => {
        const birthDate = new Date(dob);
        const today = new Date();
        today.setHours(0,0,0,0); //reset today hours to compare dates
        const diffInMilliseconds = today.getTime() - birthDate.getTime();
        const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
        return diffInDays > 0 ? diffInDays : 0; // Ensure non-negative
    };

    const animateProgress = () => {
        const maxDays = activeTab === 'virgin' ? (isDOBSet ? currentStreak.virgin + 365 : 100) : 365;
        Animated.spring(progressAnimation, {
            toValue: currentStreak[activeTab] / maxDays,
            useNativeDriver: false,
            friction: 8,
            tension: 40,
        }).start();
    };

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setDailyFact(activeTab === 'virgin' ? virginFacts[Math.floor(Math.random() * virginFacts.length)] : noFapFacts[Math.floor(Math.random() * noFapFacts.length)]);
        setTimeout(() => setRefreshing(false), 1000);
    }, [activeTab]);

    const takeStreakPhoto = async () => {
        // ... (Same as before) ...
        try {
            const { status } = await Camera.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              alert('Sorry, we need camera permissions for daily check-in!');
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
            console.error('Error taking streak photo:', error);
            alert('Failed to take photo. Please try again.');
          }
    };

    const detectFace = async (imageUri) => {
        // ... (Same as before, but use activeTab for messages) ...
        setScanning(true);
        setScanMessage(activeTab === "virgin" ? 'Scanning for virgin vibes... 🔍' : "Scanning for nofap determination... 💪");
    
        Animated.loop(
          Animated.sequence([
            Animated.timing(scanAnimation, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(scanAnimation, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ).start();
    
        try {
          const options = {
            mode: FaceDetector.FaceDetectorMode.fast,
            detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
            runClassifications: FaceDetector.FaceDetectorClassifications.none,
            minDetectionInterval: 100,
            tracking: false,
          };
    
          const { faces } = await FaceDetector.detectFacesAsync(imageUri, options);
    
          scanAnimation.stopAnimation();
          setScanning(false);
    
          if (faces.length > 0) {
    
            setScanMessage(activeTab === 'virgin' ? 'Virgin detected! Updating streak... ✨' : 'NoFap confirmed!  Streak updated! 🎉');
            setTimeout(() => {
              updateStreak();
              setScanMessage('');
            }, 1500);
          } else {
    
            setScanMessage(activeTab === "virgin" ? 'No virgin detected! Try taking a clearer selfie. 🤔' : 'Face not clearly visible.  Please retake for NoFap check. 🤔');
            setTimeout(() => setScanMessage(''), 2000);
          }
        } catch (error) {
          console.error('Error detecting face:', error);
          setScanning(false);
          setScanMessage('Face detection failed! Please try again. 😅');
          setTimeout(() => setScanMessage(''), 2000);
        }
    };


    const updateStreak = async () => {
        const today = new Date().toDateString();
        if (lastCheckIn[activeTab] !== today) {
            try {
                await updateStreak(activeTab);
                const newStreak = { ...currentStreak, [activeTab]: currentStreak[activeTab] + 1 };
                setCurrentStreak(newStreak);
                setLastCheckIn({ ...lastCheckIn, [activeTab]: today });

                const updatedMilestones = milestones[activeTab].map((milestone) => {
                    const justAchieved = !milestone.achieved && newStreak[activeTab] >= milestone.days;
                    if (justAchieved) setShowCelebration(true);
                    return {
                        ...milestone,
                        achieved: newStreak[activeTab] >= milestone.days,
                    };
                });
                setMilestones({ ...milestones, [activeTab]: updatedMilestones });

                if (showCelebration) {
                    setTimeout(() => setShowCelebration(false), 3000);
                }
            } catch (error) {
                console.error('Error updating streak:', error);
                Alert.alert('Error', 'Failed to update streak. Please try again.');
            }
        }
    };

    const handleResetNoFap = () => {
        Alert.alert(
            "Reset NoFap Streak",
            `You survived ${currentStreak.nofap} days.  Are you sure you want to reset?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reset",
                    onPress: () => {
                        setCurrentStreak(prevStreak => ({ ...prevStreak, nofap: 0 }));
                        setLastCheckIn(prevCheckIn => ({ ...prevCheckIn, nofap: null })); // Reset last check-in
                        setShowResetModal(false);
                    },
                    style: "destructive"
                }
            ]
        );
    };


    const getProgressText = () => {
      if (activeTab === 'virgin') {
          return isDOBSet
              ? `${((currentStreak.virgin / (currentStreak.virgin + 365)) * 100).toFixed(0)}% to Ultimate Virgin Status in next 365 days`
              : "Set your Date of Birth to begin";
      } else {
          const percentage = Math.min(100, (currentStreak.nofap / 365) * 100);
          return `${percentage.toFixed(0)}% to Legendary NoFap Status`;
      }
    };


    return (
        <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />
            }
        >
            <View style={styles.container}>
                <View style={styles.tabContainer}>
                    <TouchableOpacity style={[styles.tab, activeTab === 'virgin' && styles.activeTab]} onPress={() => setActiveTab('virgin')}>
                        <Text style={[styles.tabText, activeTab === 'virgin' && styles.activeTabText]}>Virgin</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.tab, activeTab === 'nofap' && styles.activeTab]} onPress={() => setActiveTab('nofap')}>
                        <Text style={[styles.tabText, activeTab === 'nofap' && styles.activeTabText]}>NoFap</Text>
                    </TouchableOpacity>
                </View>

                <Text style={[typography.title, styles.title]}>Daily Streak</Text>

                <View style={styles.streakContainer}>
                  <Text style={[typography.subtitle, styles.streakNumber]}>{currentStreak[activeTab]}</Text>
                  <Text style={[typography.body, styles.streakText]}>
                      Days of {activeTab === 'virgin' ? 'Pure Virginity' : 'NoFap'}
                  </Text>

                    {/* Conditional DOB Input */}
                    {activeTab === 'virgin' && !isDOBSet && (
                      <View style={styles.dobContainer}>
                        <TouchableOpacity style={styles.dobButton} onPress={() => setShowDatePicker(true)}>
                            <Text style={styles.dobButtonText}>Set Date of Birth</Text>
                        </TouchableOpacity>
                        {showDatePicker && (
                              <DateTimePicker
                                  value={dateOfBirth || new Date()} // Important: Provide a default date
                                  mode="date"
                                  display="spinner"
                                  onChange={onDOBChange}
                                  maximumDate={new Date()} // Prevent future dates
                              />
                          )}
                        </View>
                    )}


                    <View style={styles.progressBar}>
                        <Animated.View
                            style={[
                                styles.progressFill,
                                { width: progressAnimation.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
                            ]}
                        />
                    </View>
                    <Text style={styles.progressText}>{getProgressText()}</Text>
                </View>

                <View style={styles.factContainer}>
                    <Text style={styles.factText}>{dailyFact}</Text>
                </View>

                <TouchableOpacity
                    style={[buttons.primary, styles.checkInButton, scanning && styles.buttonDisabled]}
                    onPress={takeStreakPhoto}
                    disabled={scanning || (activeTab === "virgin" && !isDOBSet)} // Disable if DOB not set for virgin
                >
                    <Text style={[typography.button, { color: colors.background }]}>
                        {scanning ? 'Scanning...' : `Daily ${activeTab === 'virgin' ? 'Virgin' : 'NoFap'} Check`}
                    </Text>
                </TouchableOpacity>

                {scanMessage ? (
                    <Animated.Text style={[styles.scanMessage, { opacity: scanning ? scanAnimation : 1 }]}>{scanMessage}</Animated.Text>
                ) : null}

                {/* Reset NoFap Button */}
                {activeTab === 'nofap' && (
                  <TouchableOpacity style={styles.resetButton} onPress={() => setShowResetModal(true)}>
                      <Text style={styles.resetButtonText}>Reset NoFap Streak</Text>
                  </TouchableOpacity>
                )}

                <View style={styles.milestonesContainer}>
                    <Text style={[typography.subtitle, styles.milestonesTitle]}>
                        {activeTab === 'virgin' ? 'Virgin Milestones' : 'NoFap Milestones'}
                    </Text>
                    {milestones[activeTab].map((milestone, index) => (
                        <View key={index} style={[styles.milestoneItem, milestone.achieved && styles.achievedMilestone]}>
                            <View style={styles.milestoneInfo}>
                                <Text style={[typography.body, milestone.achieved && styles.achievedText]}>{milestone.days} Days</Text>
                                <Text style={typography.body}>{milestone.reward}</Text>
                            </View>
                            {milestone.achieved && <Text style={styles.achievedBadge}>✓</Text>}
                        </View>
                    ))}
                </View>

                {showCelebration && (
                    <View style={styles.celebrationOverlay}>
                        <View style={styles.celebrationContent}>
                            <Text style={styles.celebrationText}>🎉 New Achievement Unlocked! 🎉</Text>
                        </View>
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        width: '100%',
        justifyContent: 'space-around',
    },
    tab: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.primary,
        width: '45%',
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: colors.primary,
    },
    tabText: {
        ...typography.body,
        color: colors.primary,
    },
    activeTabText: {
        color: colors.background,
        fontWeight: 'bold',
    },
    title: {
        marginBottom: 20,
    },
    streakContainer: {
        alignItems: 'center',
        marginBottom: 30,
        width: '100%',
    },
    streakNumber: {
        fontSize: 48,
        color: colors.primary,
        marginBottom: 5,
    },
    streakText: {
        marginBottom: 15,
    },
    checkInButton: {
        width: '100%',
        marginBottom: 20,
    },
    milestonesContainer: {
        width: '100%',
        marginTop: 20,
    },
    milestonesTitle: {
        marginBottom: 10,
    },
    milestoneItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        marginBottom: 10,
        backgroundColor: colors.background,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
    },
    achievedMilestone: {
        borderColor: colors.success,
        backgroundColor: `${colors.success}10`,
    },
    milestoneInfo: {
        flex: 1,
    },
    achievedText: {
        color: colors.success,
        fontWeight: 'bold',
    },
    achievedBadge: {
        color: colors.success,
        fontSize: 20,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    scanMessage: {
        ...typography.body,
        color: colors.primary,
        textAlign: 'center',
        marginBottom: 20,
        fontStyle: 'italic',
    },
    progressBar: {
        width: '100%',
        height: 10,
        backgroundColor: `${colors.primary}30`,
        borderRadius: 5,
        marginBottom: 10,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 5,
    },
    progressText: {
        ...typography.body,
        color: colors.textSecondary,
        marginBottom: 20,
        textAlign: 'center', // Center the progress text
    },
    factContainer: {
        backgroundColor: `${colors.primary}10`,
        padding: 15,
        borderRadius: 10,
        marginBottom: 30,
        width: '100%',
    },
    factText: {
        ...typography.body,
        fontStyle: 'italic',
        textAlign: 'center',
        color: colors.primary,
    },
    celebrationOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    celebrationContent: {
        backgroundColor: colors.background,
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    celebrationText: {
        ...typography.subtitle,
        color: colors.success,
        textAlign: 'center',
    },
    dobContainer: {
      marginBottom: 20,
      width: '100%',
    },
    dobButton: {
        backgroundColor: colors.primary, // Use your app's primary color
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom:10,
    },
    dobButtonText: {
        color: colors.background,
        ...typography.button,
    },
    dobInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 10,
      width: '100%',
      marginBottom: 10,
    },
      resetButton: {
        backgroundColor: colors.danger, // Use a distinct color for reset
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20, // Space below the button
        width: '100%',
    },
    resetButtonText: {
        color: colors.background,
        ...typography.button,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    },
    modalContent: {
        backgroundColor: colors.background,
        padding: 20,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
    },
    modalText: {
        ...typography.body,
        marginBottom: 20,
        textAlign: 'center',
    },
     modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    modalButton: {  //for custom button in modal
      backgroundColor: colors.primary,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      marginHorizontal: 5, // Add some spacing between buttons

    },
     modalButtonText: { //for custom button in modal
      color: colors.background,
      textAlign: 'center',
    },
});

export default StreakScreen;