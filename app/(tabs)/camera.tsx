import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Platform, Image } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import ScreenContainer from '@/components/common/ScreenContainer';
import Header from '@/components/common/Header';
import FoodAnalysisModal from '@/components/camera/FoodAnalysisModal';
import { theme } from '@/constants/theme';
import { Camera as CameraIcon, RotateCcw, Video, Square, Circle, FlashlightOff as FlashOff, Zap as Flash, X, Check, RotateCw, Sparkles } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';

type CaptureMode = 'photo' | 'video';
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

export default function CameraScreen() {
  const router = useRouter();
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [captureMode, setCaptureMode] = useState<CaptureMode>('photo');
  const [flashMode, setFlashMode] = useState<FlashMode>('off');
  const [isRecording, setIsRecording] = useState(false);
  const [capturedMedia, setCapturedMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'photo' | 'video' | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResult | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return (
      <ScreenContainer>
        <Header title="Camera" showBack onBackPress={() => router.back()} />
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Loading camera permissions...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!permission.granted) {
    return (
      <ScreenContainer>
        <Header title="Camera" showBack onBackPress={() => router.back()} />
        <View style={styles.permissionContainer}>
          <CameraIcon size={64} color={theme.colors.gray[400]} />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            We need access to your camera to take photos and analyze food items for recipe suggestions.
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
    setCaptureMode(current => current === 'photo' ? 'video' : 'photo');
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
        setCapturedMedia(photo.uri);
        setMediaType('photo');
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
      const video = await cameraRef.current.recordAsync({
        quality: '720p',
        maxDuration: 30, // 30 seconds max
      });
      
      if (video?.uri) {
        setCapturedMedia(video.uri);
        setMediaType('video');
      }
    } catch (error) {
      console.error('Error recording video:', error);
      if (Platform.OS !== 'web') {
        Alert.alert('Error', 'Failed to record video. Please try again.');
      }
    } finally {
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
  };

  const handleCapture = () => {
    if (captureMode === 'photo') {
      takePicture();
    } else {
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    }
  };

  const retakeMedia = () => {
    setCapturedMedia(null);
    setMediaType(null);
    setAnalysisResult(null);
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
    if (!capturedMedia || mediaType !== 'photo') {
      setAnalysisError('Only photos can be analyzed for food recognition');
      return;
    }

    setAnalysisLoading(true);
    setAnalysisError(null);
    setShowAnalysisModal(true);

    try {
      // Convert image to base64 using platform-specific method
      const base64 = await convertImageToBase64(capturedMedia);

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

  const useMedia = () => {
    // In a real app, you would save this media or pass it to another screen
    // For now, we'll just show an alert and go back
    if (Platform.OS !== 'web') {
      Alert.alert(
        'Media Captured',
        `${mediaType === 'photo' ? 'Photo' : 'Video'} saved successfully!`,
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
  if (capturedMedia) {
    return (
      <ScreenContainer scrollable={false} style={styles.container}>
        <View style={styles.previewContainer}>
          {mediaType === 'photo' ? (
            <Image source={{ uri: capturedMedia }} style={styles.previewMedia} />
          ) : (
            <View style={styles.videoPreview}>
              <Video size={64} color="white" />
              <Text style={styles.videoPreviewText}>Video Recorded</Text>
            </View>
          )}
          
          <View style={styles.previewActions}>
            <TouchableOpacity style={styles.previewActionButton} onPress={retakeMedia}>
              <X size={24} color="white" />
              <Text style={styles.previewActionText}>Retake</Text>
            </TouchableOpacity>
            
            {mediaType === 'photo' && (
              <TouchableOpacity 
                style={[styles.previewActionButton, styles.analyzeButton]} 
                onPress={analyzeFood}
              >
                <Sparkles size={24} color="white" />
                <Text style={styles.previewActionText}>Analyze Food</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.previewActionButton, styles.useButton]} 
              onPress={useMedia}
            >
              <Check size={24} color="white" />
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
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable={false} style={styles.container}>
      <Header title="Camera" showBack onBackPress={() => router.back()} />
      
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
                {captureMode.toUpperCase()}
                {isRecording && ' • REC'}
              </Text>
            </View>
            
            <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
              <RotateCw size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            <TouchableOpacity 
              style={styles.modeButton} 
              onPress={toggleCaptureMode}
              disabled={isRecording}
            >
              {captureMode === 'photo' ? (
                <Video size={24} color={isRecording ? theme.colors.gray[400] : 'white'} />
              ) : (
                <CameraIcon size={24} color={isRecording ? theme.colors.gray[400] : 'white'} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.captureButton,
                captureMode === 'video' && styles.videoCaptureButton,
                isRecording && styles.recordingButton
              ]} 
              onPress={handleCapture}
            >
              {captureMode === 'photo' ? (
                <Circle size={32} color="white" fill="white" />
              ) : isRecording ? (
                <Square size={24} color="white" fill="white" />
              ) : (
                <Circle size={32} color={theme.colors.error} fill={theme.colors.error} />
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
    borderRadius: theme.borderRadius.round,
    padding: theme.spacing.md,
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
    width: 56,
    height: 56,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  previewMedia: {
    flex: 1,
    width: '100%',
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
  previewActions: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.lg,
  },
  previewActionButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    minWidth: 80,
  },
  analyzeButton: {
    backgroundColor: theme.colors.secondary,
  },
  useButton: {
    backgroundColor: theme.colors.primary,
  },
  previewActionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: 'white',
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
});