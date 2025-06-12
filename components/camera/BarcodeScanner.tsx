import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Platform, TextInput } from 'react-native';
import { theme } from '@/constants/theme';
import { X, Package, Zap, Search, CircleAlert as AlertCircle } from 'lucide-react-native';

interface BarcodeScannerProps {
  visible: boolean;
  onClose: () => void;
  onBarcodeScanned: (barcode: string) => void;
}

export default function BarcodeScanner({ visible, onClose, onBarcodeScanned }: BarcodeScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(true);
  const [manualBarcode, setManualBarcode] = useState('');
  const [BarCodeScannerComponent, setBarCodeScannerComponent] = useState<any>(null);

  useEffect(() => {
    if (visible) {
      if (Platform.OS === 'web') {
        // On web, we'll show a manual input interface
        setHasPermission(true);
      } else {
        getBarCodeScannerPermissions();
      }
      setScanned(false);
      setScanning(true);
    }
  }, [visible]);

  const getBarCodeScannerPermissions = async () => {
    if (Platform.OS === 'web') {
      setHasPermission(true);
      return;
    }

    try {
      // Dynamically import BarCodeScanner only on native platforms
      const { BarCodeScanner } = await import('expo-barcode-scanner');
      setBarCodeScannerComponent(BarCodeScanner);
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    } catch (error) {
      console.warn('BarCodeScanner not available:', error);
      setHasPermission(false);
    }
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    setScanning(false);
    
    console.log('BarcodeScanner: Scanned barcode:', { type, data });
    
    // Vibrate on successful scan (web-safe)
    if (Platform.OS !== 'web' && 'vibrate' in navigator) {
      navigator.vibrate(100);
    }
    
    onBarcodeScanned(data);
  };

  const handleManualSubmit = () => {
    if (manualBarcode.trim()) {
      handleBarCodeScanned({ type: 'manual', data: manualBarcode.trim() });
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setScanning(true);
    setManualBarcode('');
  };

  if (!visible) {
    return null;
  }

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Barcode Scanner</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.permissionContainer}>
          <Package size={64} color={theme.colors.gray[400]} />
          <Text style={styles.permissionText}>Initializing scanner...</Text>
        </View>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Barcode Scanner</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.permissionContainer}>
          <Package size={64} color={theme.colors.gray[400]} />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            We need camera access to scan product barcodes and automatically add items to your pantry.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={getBarCodeScannerPermissions}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Web version with manual input
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Barcode Scanner</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.webContainer}>
          <View style={styles.webNotice}>
            <AlertCircle size={24} color={theme.colors.warning} />
            <Text style={styles.webNoticeTitle}>Web Version</Text>
            <Text style={styles.webNoticeText}>
              Camera barcode scanning is not available on web. Please enter the barcode manually.
            </Text>
          </View>

          <View style={styles.manualInputContainer}>
            <Text style={styles.inputLabel}>Enter Barcode:</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                value={manualBarcode}
                onChangeText={setManualBarcode}
                placeholder="Enter barcode number..."
                placeholderTextColor={theme.colors.gray[400]}
                keyboardType="numeric"
                autoFocus
              />
              <TouchableOpacity 
                style={[styles.submitButton, !manualBarcode.trim() && styles.submitButtonDisabled]} 
                onPress={handleManualSubmit}
                disabled={!manualBarcode.trim()}
              >
                <Search size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.instructionCard}>
            <Package size={24} color={theme.colors.primary} />
            <Text style={styles.instructionTitle}>Manual Barcode Entry</Text>
            <Text style={styles.instructionText}>
              Enter the barcode number found on your product packaging. This is usually a 12-13 digit number below the barcode lines.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // Native version with camera scanner
  if (!BarCodeScannerComponent) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Barcode Scanner</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading camera...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Barcode Scanner</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.scannerContainer}>
        <BarCodeScannerComponent
          onBarCodeScanned={scanning ? handleBarCodeScanned : undefined}
          style={styles.scanner}
        />
        
        {/* Scanning Overlay */}
        <View style={styles.overlay}>
          {/* Top overlay */}
          <View style={styles.overlayTop} />
          
          {/* Middle section with scanning frame */}
          <View style={styles.overlayMiddle}>
            <View style={styles.overlaySide} />
            <View style={styles.scanFrame}>
              <View style={styles.scanCorners}>
                <View style={[styles.corner, styles.cornerTopLeft]} />
                <View style={[styles.corner, styles.cornerTopRight]} />
                <View style={[styles.corner, styles.cornerBottomLeft]} />
                <View style={[styles.corner, styles.cornerBottomRight]} />
              </View>
              
              {scanning && (
                <View style={styles.scanLine} />
              )}
            </View>
            <View style={styles.overlaySide} />
          </View>
          
          {/* Bottom overlay */}
          <View style={styles.overlayBottom} />
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <View style={styles.instructionCard}>
            {scanning ? (
              <>
                <Search size={24} color={theme.colors.primary} />
                <Text style={styles.instructionTitle}>Scan Product Barcode</Text>
                <Text style={styles.instructionText}>
                  Position the barcode within the frame to automatically identify and add the product to your pantry.
                </Text>
              </>
            ) : (
              <>
                <Package size={24} color={theme.colors.success} />
                <Text style={styles.instructionTitle}>Barcode Scanned!</Text>
                <Text style={styles.instructionText}>
                  Processing barcode data...
                </Text>
                <TouchableOpacity style={styles.scanAgainButton} onPress={resetScanner}>
                  <Text style={styles.scanAgainText}>Scan Another</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingTop: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  headerTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: 'white',
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.borderRadius.round,
    padding: theme.spacing.sm,
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
    color: 'white',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  permissionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
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
  webContainer: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  webNotice: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  webNoticeTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: theme.colors.warning,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  webNoticeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
  manualInputContainer: {
    marginBottom: theme.spacing.xl,
  },
  inputLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: 'white',
    marginBottom: theme.spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: 'white',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: theme.colors.gray[600],
    opacity: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: 'white',
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  scanner: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: 250,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanCorners: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: theme.colors.primary,
    borderWidth: 3,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: theme.colors.primary,
    opacity: 0.8,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 50,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
  },
  instructionCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  instructionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: 'white',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  instructionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
  scanAgainButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
  },
  scanAgainText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: 'white',
  },
});