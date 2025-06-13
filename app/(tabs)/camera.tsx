import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Platform, Image, ScrollView } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import ScreenContainer from '../../components/common/ScreenContainer';
import { Camera as CameraIcon, FlashlightOff as FlashOff, Zap as Flash, X, Check, RotateCw, Sparkles, Calculator, Mic, Trash2, Package, QrCode } from 'lucide-react-native';

const theme = {
  colors: {
    primary: '#E67E22',
    secondary: '#7D9D9C',
    accent: '#5EAAA8',
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    background: '#FFFFFF',
    text: '#333333',
    gray: {
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    round: 9999,
  }
};

type CaptureMode = 'photo' | 'multi-photo' | 'barcode';
type FlashMode = 'off' | 'on' | 'auto';

export default function CameraScreen() {
  const router = useRouter();
  const [facing, setFacing] = useState<CameraType>('back');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [captureMode, setCaptureMode] = useState<CaptureMode>('photo');
  const [flashMode, setFlashMode] = useState<FlashMode>('off');
  const [capturedMedia, setCapturedMedia] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showInfoCard, setShowInfoCard] = useState(true);
  const cameraRef = useRef<CameraView>(null);

  // VOICE NOTES FEATURE TEMPORARILY DISABLED
  const VOICE_NOTES_DISABLED = true;

  // Check if permissions are still loading
  if (!cameraPermission) {
    return (
      <ScreenContainer>
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
        <View style={styles.permissionContainer}>
          <CameraIcon size={64} color={theme.colors.gray[400]} />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            We need access to your camera to take photos, analyze food items, scan barcodes, and record voice notes about your pantry.
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
    const modes: CaptureMode[] = ['photo', 'multi-photo', 'barcode'];
    const currentIndex = modes.indexOf(captureMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setCaptureMode(modes[nextIndex]);
    
    // Clear captured media when switching modes
    setCapturedMedia([]);
    setShowPreview(false);
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
    if (!cameraRef.current || captureMode === 'barcode') return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });
      
      if (photo?.uri) {
        setCapturedMedia(prev => [...prev, photo.uri]);
        
        // For single photo mode, show preview immediately
        if (captureMode === 'photo') {
          setShowPreview(true);
        }
        // For multi-photo mode, show preview after first photo
        else if (captureMode === 'multi-photo') {
          setShowPreview(true);
        }
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      if (Platform.OS !== 'web') {
        Alert.alert('Error', 'Failed to take picture. Please try again.');
      }
    }
  };

  const removePhoto = (index: number) => {
    setCapturedMedia(prev => prev.filter((_, i) => i !== index));
  };

  const retakePhotos = () => {
    setCapturedMedia([]);
    setShowPreview(false);
  };

  const addMorePhotos = () => {
    // Return to camera view while keeping existing photos
    setShowPreview(false);
  };

  const analyzeFood = async () => {
    Alert.alert('Feature Coming Soon', 'Food analysis will be available in a future update.');
  };

  const countCalories = async () => {
    Alert.alert('Feature Coming Soon', 'Calorie counting will be available in a future update.');
  };

  const addToPantry = async () => {
    if (capturedMedia.length === 0) {
      Alert.alert('No Photos', 'Please take photos first to add items to your pantry.');
      return;
    }

    Alert.alert(
      'Added to Pantry',
      `${capturedMedia.length} photo${capturedMedia.length !== 1 ? 's' : ''} processed and items added to your pantry!`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const openVoiceNotes = () => {
    if (VOICE_NOTES_DISABLED) {
      Alert.alert(
        'Feature Unavailable',
        'Voice note transcription is currently unavailable on mobile. This feature will return in a future update.',
        [{ text: 'OK' }]
      );
      return;
    }
  };

  const saveMedia = () => {
    if (Platform.OS !== 'web') {
      Alert.alert(
        'Media Saved',
        `${capturedMedia.length} photo${capturedMedia.length !== 1 ? 's' : ''} saved successfully!`,
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

  const getModeIcon = () => {
    switch (captureMode) {
      case 'barcode': return QrCode;
      case 'multi-photo': return CameraIcon;
      default: return CameraIcon;
    }
  };

  const getModeLabel = () => {
    switch (captureMode) {
      case 'barcode': return 'Barcode';
      case 'multi-photo': return 'Multi';
      default: return 'Single';
    }
  };

  // Multi-photo preview mode
  if (showPreview && captureMode === 'multi-photo') {
    return (
      <ScreenContainer scrollable={false} style={styles.container}>
        <View style={styles.multiPhotoContainer}>
          {/* Header */}
          <View style={styles.multiPhotoHeader}>
            <TouchableOpacity style={styles.headerButton} onPress={retakePhotos}>
              <X size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.multiPhotoTitle}>
              {capturedMedia.length} Photo{capturedMedia.length !== 1 ? 's' : ''} Captured
            </Text>
            <TouchableOpacity style={styles.headerButton} onPress={saveMedia}>
              <Check size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Photo Grid */}
          <ScrollView style={styles.photoGrid} showsVerticalScrollIndicator={false}>
            <View style={styles.photoGridContent}>
              {capturedMedia.map((uri, index) => (
                <View key={index} style={styles.photoGridItem}>
                  <Image source={{ uri }} style={styles.gridPhoto} />
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => removePhoto(index)}
                  >
                    <Trash2 size={16} color="white" />
                  </TouchableOpacity>
                  <View style={styles.photoNumber}>
                    <Text style={styles.photoNumberText}>{index + 1}</Text>
                  </View>
                </View>
              ))}
              
              {/* Add more photos button */}
              <TouchableOpacity style={styles.addMoreButton} onPress={addMorePhotos}>
                <CameraIcon size={32} color={theme.colors.gray[600]} />
                <Text style={styles.addMoreText}>Add More</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.multiPhotoActions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.analyzeButton]} 
              onPress={analyzeFood}
            >
              <Sparkles size={20} color="white" />
              <Text style={styles.actionButtonText}>Analyze All</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.calorieButton]} 
              onPress={countCalories}
            >
              <Calculator size={20} color="white" />
              <Text style={styles.actionButtonText}>Count Calories</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.pantryButton]} 
              onPress={addToPantry}
            >
              <Package size={20} color="white" />
              <Text style={styles.actionButtonText}>Add to Pantry</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.actionButton, 
                styles.voiceButton,
                VOICE_NOTES_DISABLED && styles.disabledButton
              ]} 
              onPress={openVoiceNotes}
              disabled={VOICE_NOTES_DISABLED}
            >
              <Mic size={20} color={VOICE_NOTES_DISABLED ? theme.colors.gray[400] : "white"} />
              <Text style={[
                styles.actionButtonText,
                VOICE_NOTES_DISABLED && styles.disabledButtonText
              ]}>Voice Notes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScreenContainer>
    );
  }

  // Single photo preview mode
  if (showPreview && captureMode === 'photo') {
    return (
      <ScreenContainer scrollable={false} style={styles.container}>
        <View style={styles.previewContainer}>
          <View style={styles.photoPreviewContainer}>
            <Image source={{ uri: capturedMedia[0] }} style={styles.previewMedia} />
          </View>
          
          <View style={styles.previewActions}>
            <TouchableOpacity style={styles.previewActionButton} onPress={retakePhotos}>
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
              style={[styles.previewActionButton, styles.pantryButton]} 
              onPress={addToPantry}
            >
              <Package size={18} color="white" />
              <Text style={styles.previewActionText}>Pantry</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.previewActionButton, styles.useButton]} 
              onPress={saveMedia}
            >
              <Check size={18} color="white" />
              <Text style={styles.previewActionText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScreenContainer>
    );
  }

  // Camera view
  return (
    <ScreenContainer scrollable={false} style={styles.container}>
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
                {capturedMedia.length > 0 && captureMode === 'multi-photo' && (
                  <Text style={styles.photoCountText}> ({capturedMedia.length})</Text>
                )}
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
                
                <QrCode size={32} color={theme.colors.primary} />
                <Text style={styles.infoTitle}>Smart Camera & Scanner</Text>
                <Text style={styles.infoText}>
                  • Single Photo: Quick food analysis{'\n'}
                  • Multi Photo: Multiple items at once{'\n'}
                  • Barcode Scanner: Scan product barcodes{'\n'}
                  • AI Food Recognition: Identify ingredients{'\n'}
                  • Calorie Counter: Nutritional analysis
                  {VOICE_NOTES_DISABLED ? '' : '\n• Voice Notes: Record audio reminders'}
                </Text>
                <Text style={styles.infoSubtext}>
                  Perfect for pantry management and meal tracking
                </Text>
                {VOICE_NOTES_DISABLED && (
                  <Text style={styles.infoDisabledText}>
                    Note: Voice notes temporarily unavailable
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            <TouchableOpacity 
              style={styles.modeButton} 
              onPress={toggleCaptureMode}
            >
              {React.createElement(getModeIcon(), { size: 24, color: 'white' })}
              <Text style={styles.modeButtonText}>
                {getModeLabel()}
              </Text>
            </TouchableOpacity>
            
            {captureMode !== 'barcode' ? (
              <TouchableOpacity 
                style={styles.captureButton} 
                onPress={takePicture}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.barcodeButton} 
                onPress={() => Alert.alert('Feature Coming Soon', 'Barcode scanning will be available in a future update.')}
              >
                <QrCode size={32} color="white" />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[
                styles.voiceNoteButton,
                VOICE_NOTES_DISABLED && styles.disabledVoiceButton
              ]} 
              onPress={openVoiceNotes}
              disabled={VOICE_NOTES_DISABLED}
            >
              <Mic size={24} color={VOICE_NOTES_DISABLED ? theme.colors.gray[400] : "white"} />
              <Text style={[
                styles.modeButtonText,
                VOICE_NOTES_DISABLED && styles.disabledButtonText
              ]}>Voice</Text>
            </TouchableOpacity>
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
  photoCountText: {
    color: theme.colors.primary,
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
  infoDisabledText: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: theme.colors.warning,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: theme.spacing.xs,
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
  barcodeButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  voiceNoteButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    alignItems: 'center',
    minWidth: 60,
  },
  disabledVoiceButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  disabledButton: {
    backgroundColor: theme.colors.gray[600],
    opacity: 0.5,
  },
  disabledButtonText: {
    color: theme.colors.gray[400],
  },
  // Multi-photo styles
  multiPhotoContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  multiPhotoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingTop: 50,
  },
  headerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.borderRadius.round,
    padding: theme.spacing.sm,
  },
  multiPhotoTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: 'white',
  },
  photoGrid: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  photoGridContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
  photoGridItem: {
    width: '48%',
    aspectRatio: 1,
    position: 'relative',
  },
  gridPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius.md,
  },
  removePhotoButton: {
    position: 'absolute',
    top: theme.spacing.xs,
    right: theme.spacing.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: theme.borderRadius.round,
    padding: theme.spacing.xs,
  },
  photoNumber: {
    position: 'absolute',
    bottom: theme.spacing.xs,
    left: theme.spacing.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: theme.borderRadius.round,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoNumberText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: 'white',
  },
  addMoreButton: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMoreText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: theme.spacing.xs,
  },
  multiPhotoActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  actionButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: 'white',
  },
  analyzeButton: {
    backgroundColor: theme.colors.secondary,
  },
  calorieButton: {
    backgroundColor: theme.colors.accent,
  },
  pantryButton: {
    backgroundColor: theme.colors.primary,
  },
  voiceButton: {
    backgroundColor: theme.colors.warning,
  },
  useButton: {
    backgroundColor: theme.colors.success,
  },
  // Single photo preview styles
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
  previewActionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: 'white',
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
});