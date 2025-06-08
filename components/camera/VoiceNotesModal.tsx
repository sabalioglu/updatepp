import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal, Alert, Platform } from 'react-native';
import { theme } from '@/constants/theme';
import { X, Mic, Square, Play, Pause, Trash2, Clock, FileAudio } from 'lucide-react-native';

interface VoiceNote {
  id: string;
  uri: string;
  duration: number;
  timestamp: string;
  transcription?: string;
}

interface VoiceNotesModalProps {
  visible: boolean;
  onClose: () => void;
  voiceNotes: VoiceNote[];
  onVoiceNoteAdded: (voiceNote: VoiceNote) => void;
  onVoiceNoteDeleted: (voiceNoteId: string) => void;
}

export default function VoiceNotesModal({
  visible,
  onClose,
  voiceNotes,
  onVoiceNoteAdded,
  onVoiceNoteDeleted,
}: VoiceNotesModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playingNoteId, setPlayingNoteId] = useState<string | null>(null);
  const [recordingPermission, setRecordingPermission] = useState<boolean | null>(null);
  
  const recordingRef = useRef<any>(null);
  const soundRef = useRef<any>(null);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    checkPermissions();
    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const checkPermissions = async () => {
    if (Platform.OS === 'web') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setRecordingPermission(true);
      } catch (error) {
        setRecordingPermission(false);
      }
    } else {
      // For native platforms, we'll assume permission is granted for demo
      // In a real app, you'd use expo-av's Audio.requestPermissionsAsync()
      setRecordingPermission(true);
    }
  };

  const startRecording = async () => {
    if (!recordingPermission) {
      Alert.alert('Permission Required', 'Microphone access is required to record voice notes.');
      return;
    }

    try {
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Start duration counter
      durationInterval.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      if (Platform.OS === 'web') {
        // Web implementation using MediaRecorder
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const chunks: BlobPart[] = [];

        mediaRecorder.ondataavailable = (event) => {
          chunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/wav' });
          const url = URL.createObjectURL(blob);
          
          const voiceNote: VoiceNote = {
            id: Date.now().toString(),
            uri: url,
            duration: recordingDuration,
            timestamp: new Date().toISOString(),
          };
          
          onVoiceNoteAdded(voiceNote);
          stream.getTracks().forEach(track => track.stop());
        };

        recordingRef.current = mediaRecorder;
        mediaRecorder.start();
      } else {
        // For native platforms, you would use expo-av's Audio.Recording
        // This is a placeholder for the native implementation
        console.log('Recording started on native platform');
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
      setIsRecording(false);
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }

      if (Platform.OS === 'web' && recordingRef.current) {
        recordingRef.current.stop();
      } else {
        // Native implementation would stop the expo-av recording here
        // For demo purposes, create a mock voice note
        const voiceNote: VoiceNote = {
          id: Date.now().toString(),
          uri: 'mock-recording-uri',
          duration: recordingDuration,
          timestamp: new Date().toISOString(),
          transcription: 'This is a mock voice note for demonstration purposes.',
        };
        
        onVoiceNoteAdded(voiceNote);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Failed to stop recording.');
    }
  };

  const playVoiceNote = async (voiceNote: VoiceNote) => {
    try {
      if (playingNoteId === voiceNote.id) {
        // Stop playing
        if (soundRef.current) {
          await soundRef.current.pauseAsync();
        }
        setPlayingNoteId(null);
        return;
      }

      setPlayingNoteId(voiceNote.id);

      if (Platform.OS === 'web') {
        // Web implementation
        const audio = new Audio(voiceNote.uri);
        audio.onended = () => setPlayingNoteId(null);
        await audio.play();
      } else {
        // Native implementation would use expo-av's Audio.Sound
        console.log('Playing voice note on native platform:', voiceNote.id);
        // For demo, auto-stop after duration
        setTimeout(() => setPlayingNoteId(null), voiceNote.duration * 1000);
      }
    } catch (error) {
      console.error('Error playing voice note:', error);
      Alert.alert('Error', 'Failed to play voice note.');
      setPlayingNoteId(null);
    }
  };

  const deleteVoiceNote = (voiceNoteId: string) => {
    Alert.alert(
      'Delete Voice Note',
      'Are you sure you want to delete this voice note?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => onVoiceNoteDeleted(voiceNoteId)
        }
      ]
    );
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (recordingPermission === false) {
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

          <View style={styles.permissionContainer}>
            <Mic size={64} color={theme.colors.gray[400]} />
            <Text style={styles.permissionTitle}>Microphone Permission Required</Text>
            <Text style={styles.permissionText}>
              We need access to your microphone to record voice notes about your food items.
            </Text>
            <TouchableOpacity style={styles.permissionButton} onPress={checkPermissions}>
              <Text style={styles.permissionButtonText}>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

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

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Recording Section */}
          <View style={styles.recordingSection}>
            <View style={styles.recordingControls}>
              <TouchableOpacity
                style={[
                  styles.recordButton,
                  isRecording && styles.recordButtonActive,
                ]}
                onPress={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? (
                  <Square size={32} color="white" fill="white" />
                ) : (
                  <Mic size={32} color="white" />
                )}
              </TouchableOpacity>
              
              <View style={styles.recordingInfo}>
                <Text style={styles.recordingLabel}>
                  {isRecording ? 'Recording...' : 'Tap to record'}
                </Text>
                {isRecording && (
                  <Text style={styles.recordingDuration}>
                    {formatDuration(recordingDuration)}
                  </Text>
                )}
              </View>
            </View>
            
            <Text style={styles.recordingHint}>
              Record notes about expiry dates, cooking tips, or meal ideas
            </Text>
          </View>

          {/* Voice Notes List */}
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>
              Recorded Notes ({voiceNotes.length})
            </Text>
            
            {voiceNotes.length === 0 ? (
              <View style={styles.emptyState}>
                <FileAudio size={48} color={theme.colors.gray[400]} />
                <Text style={styles.emptyTitle}>No voice notes yet</Text>
                <Text style={styles.emptyText}>
                  Record your first voice note to keep track of important food information
                </Text>
              </View>
            ) : (
              <View style={styles.notesList}>
                {voiceNotes.map((note) => (
                  <View key={note.id} style={styles.noteItem}>
                    <TouchableOpacity
                      style={styles.playButton}
                      onPress={() => playVoiceNote(note)}
                    >
                      {playingNoteId === note.id ? (
                        <Pause size={20} color={theme.colors.primary} />
                      ) : (
                        <Play size={20} color={theme.colors.primary} />
                      )}
                    </TouchableOpacity>
                    
                    <View style={styles.noteInfo}>
                      <View style={styles.noteHeader}>
                        <Text style={styles.noteTimestamp}>
                          {formatTimestamp(note.timestamp)}
                        </Text>
                        <View style={styles.noteDuration}>
                          <Clock size={12} color={theme.colors.gray[600]} />
                          <Text style={styles.noteDurationText}>
                            {formatDuration(note.duration)}
                          </Text>
                        </View>
                      </View>
                      
                      {note.transcription && (
                        <Text style={styles.noteTranscription}>
                          {note.transcription}
                        </Text>
                      )}
                    </View>
                    
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteVoiceNote(note.id)}
                    >
                      <Trash2 size={18} color={theme.colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
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
    ...theme.shadows.sm,
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
    ...theme.shadows.md,
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
    ...theme.shadows.sm,
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
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  playButton: {
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.round,
    padding: theme.spacing.sm,
    marginRight: theme.spacing.md,
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
  noteTranscription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[700],
    lineHeight: 18,
  },
  deleteButton: {
    padding: theme.spacing.sm,
  },
});