import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal, Alert, Platform } from 'react-native';
import { usePantryItems } from '@/hooks/usePantryItems';
import { theme } from '@/constants/theme';
import { X, Mic, Square, Play, Pause, Trash2, Clock, FileAudio, Plus, Sparkles, Check, MessageSquare } from 'lucide-react-native';
import { PantryItem, FoodCategory } from '@/types';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { getFoodImage } from '@/utils/foodImages';

interface VoiceNote {
  id: string;
  uri: string;
  duration: number;
  timestamp: string;
  transcription?: string;
  processed?: boolean;
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
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playingNoteId, setPlayingNoteId] = useState<string | null>(null);
  const [recordingPermission, setRecordingPermission] = useState<boolean | null>(null);
  const [processingNoteId, setProcessingNoteId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<PantryAnalysisResult | null>(null);
  const [showAnalysisResult, setShowAnalysisResult] = useState(false);
  const [addingToPantry, setAddingToPantry] = useState(false);
  
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
        await soundRef.current.unloadAsync();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    } else {
      if (recordingRef.current) {
        try {
          await recordingRef.current.stopAndUnloadAsync();
        } catch (error) {
          console.log('Error stopping recording:', error);
        }
      }
      if (soundRef.current) {
        try {
          await soundRef.current.unloadAsync();
        } catch (error) {
          console.log('Error unloading sound:', error);
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
      } catch (error) {
        console.error('Permission check error:', error);
        setRecordingPermission(false);
      }
    } else {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        setRecordingPermission(status === 'granted');
        
        if (status === 'granted') {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
          });
        }
      } catch (error) {
        console.error('Permission check error:', error);
        setRecordingPermission(false);
      }
    }
  };

  const convertBlobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const convertFileToBase64 = async (uri: string): Promise<string> => {
    if (Platform.OS === 'web') {
      const response = await fetch(uri);
      const blob = await response.blob();
      return convertBlobToBase64(blob);
    } else {
      return await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
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
      
      durationInterval.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      if (Platform.OS === 'web') {
        audioChunksRef.current = [];
        
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            sampleRate: 16000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true
          }
        });
        
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus'
        });
        
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          try {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
            const audioBase64 = await convertBlobToBase64(audioBlob);
            const url = URL.createObjectURL(audioBlob);
            
            console.log('Web audio recorded, size:', audioBlob.size, 'bytes');
            console.log('Base64 length:', audioBase64.length);
            
            const voiceNote: VoiceNote = {
              id: Date.now().toString(),
              uri: url,
              duration: recordingDuration,
              timestamp: new Date().toISOString(),
              processed: false,
            };
            
            await transcribeAudio(voiceNote, audioBase64);
            onVoiceNoteAdded(voiceNote);
            stream.getTracks().forEach(track => track.stop());
          } catch (error) {
            console.error('Error processing web recorded audio:', error);
            Alert.alert('Error', 'Failed to process recorded audio.');
          }
        };

        mediaRecorder.start(1000);
      } else {
        // Native recording
        const recording = new Audio.Recording();
        await recording.prepareToRecordAsync({
          android: {
            extension: '.m4a',
            outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
            audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
            sampleRate: 16000,
            numberOfChannels: 1,
            bitRate: 128000,
          },
          ios: {
            extension: '.m4a',
            outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
            audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
            sampleRate: 16000,
            numberOfChannels: 1,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
          web: {
            mimeType: 'audio/webm;codecs=opus',
            bitsPerSecond: 128000,
          },
        });
        
        recordingRef.current = recording;
        await recording.startAsync();
        console.log('Native recording started');
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

      if (Platform.OS === 'web') {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      } else {
        // Native recording
        if (recordingRef.current) {
          await recordingRef.current.stopAndUnloadAsync();
          const uri = recordingRef.current.getURI();
          
          if (uri) {
            console.log('Native recording stopped, URI:', uri);
            
            try {
              const audioBase64 = await convertFileToBase64(uri);
              console.log('Native audio base64 length:', audioBase64.length);
              
              const voiceNote: VoiceNote = {
                id: Date.now().toString(),
                uri: uri,
                duration: recordingDuration,
                timestamp: new Date().toISOString(),
                processed: false,
              };
              
              await transcribeAudio(voiceNote, audioBase64);
              onVoiceNoteAdded(voiceNote);
            } catch (error) {
              console.error('Error processing native recorded audio:', error);
              Alert.alert('Error', 'Failed to process recorded audio.');
            }
          }
          
          recordingRef.current = null;
        }
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Failed to stop recording.');
    }
  };

  const transcribeAudio = async (voiceNote: VoiceNote, audioBase64: string) => {
    try {
      console.log('Sending audio for transcription, base64 length:', audioBase64.length);
      
      const response = await fetch('/api/voice-to-pantry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioBase64: audioBase64,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Transcription API error:', errorData);
        throw new Error(errorData.error || 'Failed to transcribe audio');
      }

      const result = await response.json();
      console.log('Transcription result:', result);
      
      voiceNote.transcription = result.transcription;
      
    } catch (error) {
      console.error('Transcription error:', error);
      voiceNote.transcription = 'Failed to transcribe audio';
    }
  };

  const playVoiceNote = async (voiceNote: VoiceNote) => {
    try {
      if (playingNoteId === voiceNote.id) {
        if (soundRef.current) {
          await soundRef.current.pauseAsync();
        }
        setPlayingNoteId(null);
        return;
      }

      // Stop any currently playing sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      setPlayingNoteId(voiceNote.id);

      if (Platform.OS === 'web') {
        const audio = new Audio(voiceNote.uri);
        audio.onended = () => setPlayingNoteId(null);
        await audio.play();
      } else {
        // Native playback
        const { sound } = await Audio.Sound.createAsync(
          { uri: voiceNote.uri },
          { shouldPlay: true }
        );
        
        soundRef.current = sound;
        
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setPlayingNoteId(null);
          }
        });
      }
    } catch (error) {
      console.error('Error playing voice note:', error);
      Alert.alert('Error', 'Failed to play voice note.');
      setPlayingNoteId(null);
    }
  };

  const processVoiceNote = async (voiceNote: VoiceNote) => {
    if (!voiceNote.transcription) {
      Alert.alert('Error', 'No transcription available for this voice note.');
      return;
    }

    setProcessingNoteId(voiceNote.id);
    setAnalysisResult(null);

    try {
      console.log('Processing transcription:', voiceNote.transcription);
      
      const response = await fetch('/api/voice-to-pantry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcription: voiceNote.transcription,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process voice note');
      }

      const result = await response.json();
      console.log('Processing result:', result);
      setAnalysisResult(result);
      setShowAnalysisResult(true);
    } catch (error) {
      console.error('Voice processing error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to process voice note');
    } finally {
      setProcessingNoteId(null);
    }
  };

  const mapCategoryToFoodCategory = (category: string): FoodCategory => {
    const categoryMap: { [key: string]: FoodCategory } = {
      'fruits': 'fruits',
      'vegetables': 'vegetables',
      'dairy': 'dairy',
      'meat': 'meat',
      'seafood': 'seafood',
      'grains': 'grains',
      'canned': 'canned',
      'frozen': 'frozen',
      'spices': 'spices',
      'condiments': 'condiments',
      'baking': 'baking',
      'snacks': 'snacks',
      'beverages': 'beverages',
    };
    
    return categoryMap[category.toLowerCase()] || 'other';
  };

  const addItemsToPantry = async () => {
    if (!analysisResult?.pantryItems || !Array.isArray(analysisResult.pantryItems)) {
      Alert.alert('Error', 'No pantry items to add.');
      return;
    }

    setAddingToPantry(true);

    try {
      const today = new Date();
      let addedCount = 0;
      
      for (const item of analysisResult.pantryItems) {
        try {
          const expiryDate = new Date(today);
          expiryDate.setDate(today.getDate() + item.estimatedExpiryDays);
          
          const category = mapCategoryToFoodCategory(item.category);
          const image = getFoodImage(item.name, category);
          
          const pantryItem: PantryItem = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: item.name,
            category: category,
            quantity: item.quantity,
            unit: item.unit,
            purchaseDate: today.toISOString().split('T')[0],
            expiryDate: expiryDate.toISOString().split('T')[0],
            notes: item.notes || 'Added from voice note',
            image: image,
          };
          
          console.log('Adding pantry item:', pantryItem);
          await addItem(pantryItem);
          addedCount++;
        } catch (itemError) {
          console.error('Error adding individual item:', item.name, itemError);
        }
      }

      if (addedCount > 0) {
        // Mark the voice note as processed
        const updatedVoiceNotes = voiceNotes.map(note => {
          if (note.transcription === analysisResult.transcription) {
            return { ...note, processed: true };
          }
          return note;
        });

        Alert.alert(
          'Success!', 
          `Added ${addedCount} item${addedCount !== 1 ? 's' : ''} to your pantry from voice note.`,
          [{ 
            text: 'OK', 
            onPress: () => {
              setShowAnalysisResult(false);
              setAnalysisResult(null);
            }
          }]
        );
      } else {
        Alert.alert('Error', 'Failed to add any items to pantry. Please try again.');
      }
    } catch (error) {
      console.error('Error adding items to pantry:', error);
      Alert.alert('Error', 'Failed to add items to pantry. Please try again.');
    } finally {
      setAddingToPantry(false);
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
          <Text style={styles.headerTitle}>Smart Voice Pantry</Text>
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
              Say: "I bought 2 pounds of chicken, 1 gallon of milk, and 6 bananas"
            </Text>
          </View>

          {/* Voice Notes List */}
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>
              Voice Notes ({voiceNotes.length})
            </Text>
            
            {voiceNotes.length === 0 ? (
              <View style={styles.emptyState}>
                <FileAudio size={48} color={theme.colors.gray[400]} />
                <Text style={styles.emptyTitle}>No voice notes yet</Text>
                <Text style={styles.emptyText}>
                  Record your grocery hauls and let AI automatically add items to your pantry
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
                          "{note.transcription}"
                        </Text>
                      )}

                      {note.processed && (
                        <View style={styles.processedBadge}>
                          <Check size={12} color={theme.colors.success} />
                          <Text style={styles.processedText}>Added to pantry</Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.noteActions}>
                      {!note.processed && note.transcription && (
                        <TouchableOpacity
                          style={[
                            styles.processButton,
                            processingNoteId === note.id && styles.processingButton
                          ]}
                          onPress={() => processVoiceNote(note)}
                          disabled={processingNoteId === note.id}
                        >
                          <Sparkles size={16} color="white" />
                        </TouchableOpacity>
                      )}
                      
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => deleteVoiceNote(note.id)}
                      >
                        <Trash2 size={16} color={theme.colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Analysis Result Modal */}
        <Modal
          visible={showAnalysisResult}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAnalysisResult(false)}
        >
          <View style={styles.analysisOverlay}>
            <View style={styles.analysisModal}>
              <View style={styles.analysisHeader}>
                <Text style={styles.analysisTitle}>AI Analysis Results</Text>
                <TouchableOpacity onPress={() => setShowAnalysisResult(false)}>
                  <X size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              {analysisResult && (
                <ScrollView style={styles.analysisContent}>
                  {/* Transcription Section */}
                  {analysisResult.transcription && (
                    <View style={styles.transcriptionSection}>
                      <View style={styles.transcriptionHeader}>
                        <MessageSquare size={20} color={theme.colors.primary} />
                        <Text style={styles.transcriptionTitle}>Transcription</Text>
                      </View>
                      <View style={styles.transcriptionBox}>
                        <Text style={styles.transcriptionText}>
                          "{analysisResult.transcription}"
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Summary */}
                  {analysisResult.summary && (
                    <Text style={styles.analysisSummary}>{analysisResult.summary}</Text>
                  )}

                  {/* Pantry Items Section */}
                  {Array.isArray(analysisResult.pantryItems) && analysisResult.pantryItems.length > 0 ? (
                    <View style={styles.itemsSection}>
                      <Text style={styles.itemsSectionTitle}>Items to Add:</Text>
                      {analysisResult.pantryItems.map((item, index) => (
                        <View key={index} style={styles.analysisItem}>
                          <Text style={styles.itemName}>{item.name}</Text>
                          <Text style={styles.itemDetails}>
                            {item.quantity} {item.unit} • {item.category}
                          </Text>
                          <Text style={styles.itemExpiry}>
                            Expires in {item.estimatedExpiryDays} days
                          </Text>
                          {item.notes && (
                            <Text style={styles.itemNotes}>{item.notes}</Text>
                          )}
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={styles.noItemsSection}>
                      <Text style={styles.noItemsTitle}>No Food Items Detected</Text>
                      <Text style={styles.noItemsText}>
                        The AI couldn't identify any specific food items from your voice note. Try mentioning specific foods with quantities.
                      </Text>
                    </View>
                  )}

                  {/* Storage Tips */}
                  {Array.isArray(analysisResult.suggestions) && analysisResult.suggestions.length > 0 && (
                    <View style={styles.suggestionsSection}>
                      <Text style={styles.suggestionsSectionTitle}>Storage Tips:</Text>
                      {analysisResult.suggestions.map((suggestion, index) => (
                        <Text key={index} style={styles.suggestionText}>
                          • {suggestion}
                        </Text>
                      ))}
                    </View>
                  )}

                  {/* Error Message */}
                  {analysisResult.error && (
                    <View style={styles.errorSection}>
                      <Text style={styles.errorText}>{analysisResult.error}</Text>
                    </View>
                  )}

                  {/* Add to Pantry Button */}
                  {Array.isArray(analysisResult.pantryItems) && analysisResult.pantryItems.length > 0 && (
                    <TouchableOpacity 
                      style={[
                        styles.addToPantryButton,
                        addingToPantry && styles.addToPantryButtonDisabled
                      ]} 
                      onPress={addItemsToPantry}
                      disabled={addingToPantry}
                    >
                      <Plus size={20} color="white" />
                      <Text style={styles.addToPantryText}>
                        {addingToPantry ? 'Adding to Pantry...' : 'Add to Pantry'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
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
    fontStyle: 'italic',
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
    alignItems: 'flex-start',
    ...theme.shadows.sm,
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
  noteTranscription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[700],
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
    ...theme.shadows.lg,
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
    ...theme.shadows.md,
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