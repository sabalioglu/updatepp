import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Platform, Image } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import ScreenContainer from '@/components/common/ScreenContainer';
import Header from '@/components/common/Header';
import FoodAnalysisModal from '@/components/camera/FoodAnalysisModal';
import CalorieCounterModal from '@/components/camera/CalorieCounterModal';
import { theme } from '@/constants/theme';
import { Camera as CameraIcon, RotateCcw, Video, Square, Circle, FlashlightOff as FlashOff, Zap as Flash, X, Check, RotateCw, Sparkles, Calculator, Play, Pause } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';

type CaptureMode = 'photo' | 'video' | 'multi-photo';
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

export default function CameraScreen() {
  const router = useRouter();
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [captureMode, setCaptureMode] = useState<CaptureMode>('photo');
  const [flashMode, setFlashMode] = useState<FlashMode>('off');
  const [isRecording, setIsRecording] = useState(false);
  const [capturedMedia, setCapturedMedia] = useState<string[]>([]);
  const [mediaType, setMediaType] = useState<'photo' | 'video' | 'multi-photo' | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showCalorieModal, setShowCalorieModal] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResult | null>(null);
  const [calorieResult, setCalorieResult] = useState<CalorieAnalysisResult | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null);
  const [showInfoCard, setShowInfoCard] = useState(true);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return (
      <ScreenContainer>
        <Header title="Camera & Calorie Counter\" showBack onBackPress={() => router.back()} />
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Loading camera permissions...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!permission.granted) {
    return (
      <ScreenContainer>
        <Header title="Camera & Calorie Counter" showBack onBackPress={() => router.back()} />
        <View style={styles.permissionContainer}>
          <CameraIcon size={64} color={theme.colors.gray[400]} />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            We need access to your camera to take photos, record videos, analyze food items, and count calories.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
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
    if (isRecording) return; // Don't allow mode change while recording
    setCaptureMode(current => {
      switch (current) {
        case 'photo': return 'multi-photo';
        case 'multi-photo': return 'video';
        case 'video': return 'photo';
        default: return 'photo';
      }
    });
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

  const startRecording = async () => {
    if (!cameraRef.current || isRecording) return;

    try {
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start recording timer
      const interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      setRecordingInterval(interval);

      const video = await cameraRef.current.recordAsync({
        quality: '720p',
        maxDuration: 60, // 60 seconds max
      });
      
      if (video?.uri) {
        setCapturedMedia([video.uri]);
        setMediaType('video');
      }
    } catch (error) {
      console.error('Error recording video:', error);
      if (Platform.OS !== 'web') {
        Alert.alert('Error', 'Failed to record video. Please try again.');
      }
    } finally {
      setIsRecording(false);
      if (recordingInterval) {
        clearInterval(recordingInterval);
        setRecordingInterval(null);
      }
      setRecordingTime(0);
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
  };

  const handleCapture = () => {
    if (captureMode === 'video') {
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    } else {
      takePicture();
    }
  };

  const retakeMedia = () => {
    setCapturedMedia([]);
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

  const useMedia = () => {
    // In a real app, you would save this media or pass it to another screen
    // For now, we'll just show an alert and go back
    if (Platform.OS !== 'web') {
      Alert.alert(
        'Media Captured',
        `${mediaType === 'video' ? 'Video' : 'Photo(s)'} saved successfully!`,
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

  const getCaptureIcon = () => {
    switch (captureMode) {
      case 'video': return Video;
      case 'multi-photo': return CameraIcon;
      default: return CameraIcon;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Preview captured media
  if (capturedMedia.length > 0) {
    return (
      <ScreenContainer scrollable={false} style={styles.container}>
        <View style={styles.previewContainer}>
          {mediaType === 'video' ? (
            <View style={styles.videoPreview}>
              <Video size={64} color="white" />
              <Text style={styles.videoPreviewText}>Video Recorded</Text>
              <Text style={styles.videoPreviewSubtext}>{formatTime(recordingTime)} duration</Text>
            </View>
          ) : (
            <View style={styles.photoPreviewContainer}>
              <Image source={{ uri: capturedMedia[0] }} style={styles.previewMedia} />
              {mediaType === 'multi-photo' && capturedMedia.length > 1 && (
                <View style={styles.photoCounter}>
                  <Text style={styles.photoCounterText}>{capturedMedia.length} photos</Text>
                </View>
              )}
            </View>
          )}
          
          <View style={styles.previewActions}>
            <TouchableOpacity style={styles.previewActionButton} onPress={retakeMedia}>
              <X size={20} color="white" />
              <Text style={styles.previewActionText}>Retake</Text>
            </TouchableOpacity>
            
            {(mediaType === 'photo' || mediaType === 'multi-photo') && (
              <>
                <TouchableOpacity 
                  style={[styles.previewActionButton, styles.analyzeButton]} 
                  onPress={analyzeFood}
                >
                  <Sparkles size={20} color="white" />
                  <Text style={styles.previewActionText}>Analyze Food</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.previewActionButton, styles.calorieButton]} 
                  onPress={countCalories}
                >
                  <Calculator size={20} color="white" />
                  <Text style={styles.previewActionText}>Count Calories</Text>
                </TouchableOpacity>
              </>
            )}
            
            <TouchableOpacity 
              style={[styles.previewActionButton, styles.useButton]} 
              onPress={useMedia}
            >
              <Check size={20} color="white" />
              <Text style={styles.previewActionText}>Use {mediaType}</Text>
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
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable={false} style={styles.container}>
      <Header title="Camera & Calorie Counter" showBack onBackPress={() => router.back()} />
      
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
                {isRecording && ` • REC ${formatTime(recordingTime)}`}
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
                
                <Calculator size={32} color={theme.colors.primary} />
                <Text style={styles.infoTitle}>Multi-Function Camera</Text>
                <Text style={styles.infoText}>
                  • Single Photo: Quick food analysis{'\n'}
                  • Multi Photo: Multiple items at once{'\n'}
                  • Video: Record pantry inventory{'\n'}
                  • Calorie Counter: Nutritional analysis
                </Text>
              </View>
            </View>
          )}

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            <TouchableOpacity 
              style={styles.modeButton} 
              onPress={toggleCaptureMode}
              disabled={isRecording}
            >
              {React.createElement(getCaptureIcon(), { 
                size: 24, 
                color: isRecording ? theme.colors.gray[400] : 'white' 
              })}
              <Text style={[
                styles.modeButtonText,
                { color: isRecording ? theme.colors.gray[400] : 'white' }
              ]}>
                {captureMode === 'multi-photo' ? 'Multi' : captureMode}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.captureButton,
                captureMode === 'video' && styles.videoCaptureButton,
                isRecording && styles.recordingButton
              ]} 
              onPress={handleCapture}
            >
              {captureMode === 'video' ? (
                isRecording ? (
                  <Square size={24} color="white" fill="white" />
                ) : (
                  <Circle size={32} color={theme.colors.error} fill={theme.colors.error} />
                )
              ) : (
                <Circle size={32} color="white" fill="white" />
              )}
            </TouchableOpacity>
            
            <View style={styles.placeholder} />
          </View>
        </CameraView>
      </View>
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
  videoCaptureButton: {
    borderColor: theme.colors.error,
  },
  recordingButton: {
    backgroundColor: theme.colors.error,
    borderColor: theme.colors.error,
  },
  placeholder: {
    width: 60,
    height: 60,
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
  videoPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  videoPreviewText: {
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    color: 'white',
    marginTop: theme.spacing.md,
  },
  videoPreviewSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: theme.spacing.xs,
  },
  previewActions: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.sm,
  },
  previewActionButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    alignItems: 'center',
    minWidth: 70,
  },
  analyzeButton: {
    backgroundColor: theme.colors.secondary,
  },
  calorieButton: {
    backgroundColor: theme.colors.accent,
  },
  useButton: {
    backgroundColor: theme.colors.primary,
  },
  previewActionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: 'white',
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
});