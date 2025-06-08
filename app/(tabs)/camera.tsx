import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Platform, Image } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import ScreenContainer from '@/components/common/ScreenContainer';
import Header from '@/components/common/Header';
import FoodAnalysisModal from '@/components/camera/FoodAnalysisModal';
import CalorieCounterModal from '@/components/camera/CalorieCounterModal';
import VoiceNotesModal from '@/components/camera/VoiceNotesModal';
import { theme } from '@/constants/theme';
import { Camera as CameraIcon, FlashlightOff as FlashOff, Zap as Flash, X, Check, RotateCw, Sparkles, Calculator, Mic } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';

type CaptureMode = 'photo' | 'multi-photo';
type FlashMode = 'off' | 'on' | 'auto';

interface FoodAnalysisResult {
  identifiedFoods: string[];
  freshnessAssessment: string;
  suggestedRecipes: Array<{
    name: string;
    description: string;
    mainIngredients: string[];
    cookTime: string;
    difficulty: string;
  }>;
  storageTips: string[];
  complementaryIngredients: string[];
}

interface CalorieAnalysisResult {
  identifiedFoods: Array<{
    name: string;
    quantity: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  }>;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  mealType: string;
  healthScore: number;
  nutritionalTips: string[];
}

interface VoiceNote {
  id: string;
  uri: string;
  duration: number;
  timestamp: string;
  transcription?: string;
}

export default function CameraScreen() {
  const router = useRouter();
  const [facing, setFacing] = useState<CameraType>('back');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [captureMode, setCaptureMode] = useState<CaptureMode>('photo');
  const [flashMode, setFlashMode] = useState<FlashMode>('off');
  const [capturedMedia, setCapturedMedia] = useState<string[]>([]);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [mediaType, setMediaType] = useState<'photo' | 'multi-photo' | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showCalorieModal, setShowCalorieModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResult | null>(null);
  const [calorieResult, setCalorieResult] = useState<CalorieAnalysisResult | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [showInfoCard, setShowInfoCard] = useState(true);
  const cameraRef = useRef<CameraView>(null);

  // Check if permissions are still loading
  if (!cameraPermission) {
    return (
      <ScreenContainer>
        <Header title="Camera & Voice Notes" showBack onBackPress={() => router.back()} />
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Loading permissions...</Text>
        </View>
      </ScreenContainer>
    );
  }

  // Check if camera permission is granted
  if (!cameraPermission.granted) {
    return (
      <ScreenContainer>
        <Header title="Camera & Voice Notes" showBack onBackPress={() => router.back()} />
        <View style={styles.permissionContainer}>
          <CameraIcon size={64} color={theme.colors.gray[400]} />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            We need access to your camera to take photos, analyze food items, and record voice notes about your pantry.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestCameraPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleCaptureMode = () => {
    setCaptureMode(current => current === 'photo' ? 'multi-photo' : 'photo');
  };

  const toggleFlashMode = () => {
    setFlashMode(current => {
      switch (current) {
        case 'off': return 'on';
        case 'on': return 'auto';
        case 'auto': return 'off';
        default: return 'off';
      }
    });
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });
      
      if (photo?.uri) {
        if (captureMode === 'multi-photo') {
          setCapturedMedia(prev => [...prev, photo.uri]);
          setMediaType('multi-photo');
        } else {
          setCapturedMedia([photo.uri]);
          setMediaType('photo');
        }
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      if (Platform.OS !== 'web') {
        Alert.alert('Error', 'Failed to take picture. Please try again.');
      }
    }
  };

  const retakeMedia = () => {
    setCapturedMedia([]);
    setVoiceNotes([]);
    setMediaType(null);
    setAnalysisResult(null);
    setCalorieResult(null);
    setAnalysisError(null);
  };

  const convertImageToBase64 = async (imageUri: string): Promise<string> => {
    if (Platform.OS === 'web') {
      // Web platform: use fetch and FileReader
      try {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
            const base64Data = base64String.split(',')[1];
            resolve(base64Data);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        throw new Error('Failed to convert image to base64 on web platform');
      }
    } else {
      // Native platform: use FileSystem
      return await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
    }
  };

  const analyzeFood = async () => {
    if (capturedMedia.length === 0 || (mediaType !== 'photo' && mediaType !== 'multi-photo')) {
      setAnalysisError('Only photos can be analyzed for food recognition');
      return;
    }

    setAnalysisLoading(true);
    setAnalysisError(null);
    setShowAnalysisModal(true);

    try {
      // Use the first image for analysis
      const base64 = await convertImageToBase64(capturedMedia[0]);

      // Call our API route
      const response = await fetch('/api/food-recognition', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze image');
      }

      const result = await response.json();
      setAnalysisResult(result);
    } catch (error) {
      console.error('Food analysis error:', error);
      setAnalysisError(error instanceof Error ? error.message : 'Failed to analyze food image');
    } finally {
      setAnalysisLoading(false);
    }
  };

  const countCalories = async () => {
    if (capturedMedia.length === 0 || (mediaType !== 'photo' && mediaType !== 'multi-photo')) {
      setAnalysisError('Only photos can be analyzed for calorie counting');
      return;
    }

    setAnalysisLoading(true);
    setAnalysisError(null);
    setShowCalorieModal(true);

    try {
      // Use the first image for analysis
      const base64 = await convertImageToBase64(capturedMedia[0]);

      // Call our API route for calorie counting
      const response = await fetch('/api/calorie-counter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze calories');
      }

      const result = await response.json();
      setCalorieResult(result);
    } catch (error) {
      console.error('Calorie analysis error:', error);
      setAnalysisError(error instanceof Error ? error.message : 'Failed to analyze calories');
    } finally {
      setAnalysisLoading(false);
    }
  };

  const openVoiceNotes = () => {
    setShowVoiceModal(true);
  };

  const handleVoiceNoteAdded = (voiceNote: VoiceNote) => {
    setVoiceNotes(prev => [...prev, voiceNote]);
  };

  const handleVoiceNoteDeleted = (voiceNoteId: string) => {
    setVoiceNotes(prev => prev.filter(note => note.id !== voiceNoteId));
  };

  const useMedia = () => {
    // In a real app, you would save this media or pass it to another screen
    // For now, we'll just show an alert and go back
    if (Platform.OS !== 'web') {
      Alert.alert(
        'Media Captured',
        `Photo${mediaType === 'multi-photo' ? 's' : ''} and ${voiceNotes.length} voice note${voiceNotes.length !== 1 ? 's' : ''} saved successfully!`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } else {
      router.back();
    }
  };

  const getFlashIcon = () => {
    switch (flashMode) {
      case 'on': return Flash;
      case 'auto': return Flash;
      default: return FlashOff;
    }
  };

  // Preview captured media
  if (capturedMedia.length > 0) {
    return (
      <ScreenContainer scrollable={false} style={styles.container}>
        <View style={styles.previewContainer}>
          <View style={styles.photoPreviewContainer}>
            <Image source={{ uri: capturedMedia[0] }} style={styles.previewMedia} />
            {mediaType === 'multi-photo' && capturedMedia.length > 1 && (
              <View style={styles.photoCounter}>
                <Text style={styles.photoCounterText}>{capturedMedia.length} photos</Text>
              </View>
            )}
            {voiceNotes.length > 0 && (
              <View style={styles.voiceCounter}>
                <Mic size={16} color="white" />
                <Text style={styles.voiceCounterText}>{voiceNotes.length}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.previewActions}>
            <TouchableOpacity style={styles.previewActionButton} onPress={retakeMedia}>
              <X size={18} color="white" />
              <Text style={styles.previewActionText}>Retake</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.previewActionButton, styles.analyzeButton]} 
              onPress={analyzeFood}
            >
              <Sparkles size={18} color="white" />
              <Text style={styles.previewActionText}>Analyze</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.previewActionButton, styles.calorieButton]} 
              onPress={countCalories}
            >
              <Calculator size={18} color="white" />
              <Text style={styles.previewActionText}>Calories</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.previewActionButton, styles.voiceButton]} 
              onPress={openVoiceNotes}
            >
              <Mic size={18} color="white" />
              <Text style={styles.previewActionText}>Voice</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.previewActionButton, styles.useButton]} 
              onPress={useMedia}
            >
              <Check size={18} color="white" />
              <Text style={styles.previewActionText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        <FoodAnalysisModal
          visible={showAnalysisModal}
          onClose={() => setShowAnalysisModal(false)}
          analysisResult={analysisResult}
          loading={analysisLoading}
          error={analysisError}
        />

        <CalorieCounterModal
          visible={showCalorieModal}
          onClose={() => setShowCalorieModal(false)}
          analysisResult={calorieResult}
          loading={analysisLoading}
          error={analysisError}
        />

        <VoiceNotesModal
          visible={showVoiceModal}
          onClose={() => setShowVoiceModal(false)}
          voiceNotes={voiceNotes}
          onVoiceNoteAdded={handleVoiceNoteAdded}
          onVoiceNoteDeleted={handleVoiceNoteDeleted}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable={false} style={styles.container}>
      <Header title="Camera & Voice Notes" showBack onBackPress={() => router.back()} />
      
      <View style={styles.cameraContainer}>
        <CameraView 
          ref={cameraRef}
          style={styles.camera} 
          facing={facing}
          flash={flashMode}
        >
          {/* Top Controls */}
          <View style={styles.topControls}>
            <TouchableOpacity style={styles.controlButton} onPress={toggleFlashMode}>
              {React.createElement(getFlashIcon(), { 
                size: 24, 
                color: flashMode === 'off' ? 'white' : theme.colors.warning 
              })}
            </TouchableOpacity>
            
            <View style={styles.modeIndicator}>
              <Text style={styles.modeText}>
                {captureMode.toUpperCase().replace('-', ' ')}
              </Text>
            </View>
            
            <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
              <RotateCw size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Center Info Card with Close Button */}
          {showInfoCard && (
            <View style={styles.centerInfo}>
              <View style={styles.infoCard}>
                <TouchableOpacity 
                  style={styles.infoCloseButton}
                  onPress={() => setShowInfoCard(false)}
                >
                  <X size={20} color="white" />
                </TouchableOpacity>
                
                <Mic size={32} color={theme.colors.primary} />
                <Text style={styles.infoTitle}>Smart Food Camera</Text>
                <Text style={styles.infoText}>
                  • Single Photo: Quick food analysis{'\n'}
                  • Multi Photo: Multiple items at once{'\n'}
                  • AI Food Recognition: Identify ingredients{'\n'}
                  • Calorie Counter: Nutritional analysis{'\n'}
                  • Voice Notes: Record audio reminders
                </Text>
                <Text style={styles.infoSubtext}>
                  Perfect for pantry management and meal tracking
                </Text>
              </View>
            </View>
          )}

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            <TouchableOpacity 
              style={styles.modeButton} 
              onPress={toggleCaptureMode}
            >
              <CameraIcon size={24} color="white" />
              <Text style={styles.modeButtonText}>
                {captureMode === 'multi-photo' ? 'Multi' : 'Single'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.captureButton} 
              onPress={takePicture}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.voiceNoteButton} 
              onPress={openVoiceNotes}
            >
              <Mic size={24} color="white" />
              <Text style={styles.modeButtonText}>Voice</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>

      <VoiceNotesModal
        visible={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        voiceNotes={voiceNotes}
        onVoiceNoteAdded={handleVoiceNoteAdded}
        onVoiceNoteDeleted={handleVoiceNoteDeleted}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  permissionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 24,
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  permissionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: theme.colors.gray[600],
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
  },
  permissionButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: 'white',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: theme.spacing.lg,
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: theme.borderRadius.round,
    padding: theme.spacing.sm,
  },
  modeIndicator: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  modeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: 'white',
  },
  centerInfo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  infoCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    maxWidth: 300,
    position: 'relative',
  },
  infoCloseButton: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.borderRadius.round,
    padding: theme.spacing.xs,
    zIndex: 1,
  },
  infoTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: 'white',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  infoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  infoSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  modeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    alignItems: 'center',
    minWidth: 60,
  },
  modeButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    marginTop: 2,
    color: 'white',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 4,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  voiceNoteButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    alignItems: 'center',
    minWidth: 60,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  photoPreviewContainer: {
    flex: 1,
    position: 'relative',
  },
  previewMedia: {
    flex: 1,
    width: '100%',
  },
  photoCounter: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  photoCounterText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: 'white',
  },
  voiceCounter: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  voiceCounterText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: 'white',
  },
  previewActions: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.xs,
  },
  previewActionButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
    alignItems: 'center',
    minWidth: 60,
  },
  analyzeButton: {
    backgroundColor: theme.colors.secondary,
  },
  calorieButton: {
    backgroundColor: theme.colors.accent,
  },
  voiceButton: {
    backgroundColor: theme.colors.warning,
  },
  useButton: {
    backgroundColor: theme.colors.primary,
  },
  previewActionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: 'white',
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
});