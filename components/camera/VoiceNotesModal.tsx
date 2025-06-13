import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal, Alert, Platform } from 'react-native';
import { usePantryItems } from '../../hooks/usePantryItems';
import { theme } from '../../constants/theme';
import { X, Mic, Square, Play, Pause, Trash2, Clock, FileAudio, Plus, Sparkles, Check, MessageSquare, Zap } from 'lucide-react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

interface VoiceNote {
  id: string;
  uri: string;
  duration: number;
  timestamp: string;
  transcription?: string;
  processed?: boolean;
  mimeType?: string;
}

interface VoiceNotesModalProps {
  visible: boolean;
  onClose: () => void;
  voiceNotes: VoiceNote[];
  onVoiceNoteAdded: (voiceNote: VoiceNote) => void;
  onVoiceNoteDeleted: (voiceNoteId: string) => void;
}

interface PantryAnalysisResult {
  transcription?: string;
  pantryItems?: Array<{
    name: string;
    quantity: number;
    unit: string;
    category: string;
    estimatedExpiryDays: number;
    notes: string;
  }>;
  summary?: string;
  suggestions?: string[];
  error?: string;
}

export default function VoiceNotesModal({
  visible,
  onClose,
  voiceNotes = [],
  onVoiceNoteAdded,
  onVoiceNoteDeleted,
}: VoiceNotesModalProps) {
  // FEATURE TEMPORARILY DISABLED
  // Voice note transcription is currently unavailable on mobile platforms
  // This is to prevent Whisper API errors while maintaining code structure
  const VOICE_NOTES_DISABLED = true;

  if (!visible) return null;

  // Show disabled message when feature is turned off
  if (VOICE_NOTES_DISABLED) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Voice Notes</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.disabledContainer}>
            <Mic size={64} color={theme.colors.gray[400]} />
            <Text style={styles.disabledTitle}>Feature Temporarily Unavailable</Text>
            <Text style={styles.disabledText}>
              Voice note transcription is currently unavailable on mobile. This feature will return in a future update.
            </Text>
            <TouchableOpacity style={styles.disabledButton} onPress={onClose}>
              <Text style={styles.disabledButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // Original component code below (preserved for future reactivation)
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playingNoteId, setPlayingNoteId] = useState<string | null>(null);
  const [recordingPermission, setRecordingPermission] = useState<boolean | null>(null);
  const [processingNoteId, setProcessingNoteId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<PantryAnalysisResult | null>(null);
  const [showAnalysisResult, setShowAnalysisResult] = useState(false);
  const [addingToPantry, setAddingToPantry] = useState(false);
  const [transcribingNoteId, setTranscribingNoteId] = useState<string | null>(null);
  
  const { addItem } = usePantryItems();
  
  // Native recording refs
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  
  // Web recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    checkPermissions();
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = async () => {
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
    }
    
    if (Platform.OS === 'web') {
      if (soundRef.current) {
        try {
          await soundRef.current.unloadAsync();
        } catch (error) {
          console.log('VoiceNotesModal: Error unloading web sound:', error);
        }
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    } else {
      if (recordingRef.current) {
        try {
          await recordingRef.current.stopAndUnloadAsync();
        } catch (error) {
          console.log('VoiceNotesModal: Error stopping native recording:', error);
        }
      }
      if (soundRef.current) {
        try {
          await soundRef.current.unloadAsync();
        } catch (error) {
          console.log('VoiceNotesModal: Error unloading native sound:', error);
        }
      }
    }
  };

  const checkPermissions = async () => {
    if (Platform.OS === 'web') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setRecordingPermission(true);
        console.log('VoiceNotesModal: Web audio permission granted');
      } catch (error) {
        console.error('VoiceNotesModal: Web permission check error:', error);
        setRecordingPermission(false);
      }
    } else {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        setRecordingPermission(status === 'granted');
        console.log('VoiceNotesModal: Native audio permission:', status);
        
        if (status === 'granted') {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
          });
        }
      } catch (error) {
        console.error('VoiceNotesModal: Native permission check error:', error);
        setRecordingPermission(false);
      }
    }
  };

  // Rest of the original component methods preserved but not executed due to VOICE_NOTES_DISABLED flag
  // ... (all other methods remain unchanged for future reactivation)

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Voice Notes</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.disabledContainer}>
          <Mic size={64} color={theme.colors.gray[400]} />
          <Text style={styles.disabledTitle}>Feature Temporarily Unavailable</Text>
          <Text style={styles.disabledText}>
            Voice note transcription is currently unavailable on mobile. This feature will return in a future update.
          </Text>
          <TouchableOpacity style={styles.disabledButton} onPress={onClose}>
            <Text style={styles.disabledButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  headerTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  disabledContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  disabledTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 24,
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  disabledText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: theme.colors.gray[600],
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 24,
  },
  disabledButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
  },
  disabledButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: 'white',
  },
  // Original styles preserved for future reactivation
  content: {
    flex: 1,
    padding: theme.spacing.lg,
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
  recordingSection: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  recordingControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  recordButtonActive: {
    backgroundColor: theme.colors.error,
  },
  recordingInfo: {
    alignItems: 'flex-start',
  },
  recordingLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  recordingDuration: {
    fontFamily: 'Inter-Regular',
    fontSize: 24,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  recordingHint: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[600],
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: theme.spacing.md,
  },
  formatInfo: {
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    width: '100%',
  },
  formatTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  formatText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.colors.gray[600],
    lineHeight: 16,
  },
  notesSection: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  emptyTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[600],
    textAlign: 'center',
    lineHeight: 20,
  },
  notesList: {
    gap: theme.spacing.sm,
  },
  noteItem: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  playButton: {
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.round,
    padding: theme.spacing.sm,
    marginRight: theme.spacing.md,
    marginTop: 2,
  },
  noteInfo: {
    flex: 1,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  noteTimestamp: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: theme.colors.text,
  },
  noteDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  noteDurationText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.colors.gray[600],
  },
  formatBadge: {
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  formatBadgeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: theme.colors.primary,
  },
  transcribingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray[100],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  transcribingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: theme.colors.primary,
    fontStyle: 'italic',
  },
  noteTranscription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[700],
    lineHeight: 18,
    marginBottom: theme.spacing.sm,
    fontStyle: 'italic',
  },
  noTranscription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.error,
    lineHeight: 18,
    marginBottom: theme.spacing.xs,
    fontStyle: 'italic',
  },
  processedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.fresh,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
    gap: 4,
  },
  processedText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: theme.colors.success,
  },
  noteActions: {
    flexDirection: 'column',
    gap: theme.spacing.xs,
  },
  processButton: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.round,
    padding: theme.spacing.sm,
  },
  processingButton: {
    backgroundColor: theme.colors.gray[400],
  },
  deleteButton: {
    padding: theme.spacing.sm,
  },
  analysisOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  analysisModal: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  analysisTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: theme.colors.text,
  },
  analysisContent: {
    padding: theme.spacing.lg,
  },
  transcriptionSection: {
    marginBottom: theme.spacing.lg,
  },
  transcriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  transcriptionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.text,
  },
  transcriptionBox: {
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  transcriptionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  analysisSummary: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  itemsSection: {
    marginBottom: theme.spacing.lg,
  },
  itemsSectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  analysisItem: {
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  itemName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 2,
  },
  itemDetails: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[600],
    marginBottom: 2,
  },
  itemExpiry: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.colors.warning,
    marginBottom: 4,
  },
  itemNotes: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.colors.gray[500],
    fontStyle: 'italic',
  },
  noItemsSection: {
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  noItemsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  noItemsText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[600],
    textAlign: 'center',
    lineHeight: 20,
  },
  suggestionsSection: {
    marginBottom: theme.spacing.lg,
  },
  suggestionsSectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  suggestionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[700],
    marginBottom: theme.spacing.xs,
    lineHeight: 18,
  },
  errorSection: {
    backgroundColor: theme.colors.expired,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.error,
    textAlign: 'center',
  },
  addToPantryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  addToPantryButtonDisabled: {
    backgroundColor: theme.colors.gray[400],
  },
  addToPantryText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: 'white',
  },
});