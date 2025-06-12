import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Platform } from 'react-native';
import { theme } from '@/constants/theme';
import { ArrowLeft, Package, Zap } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function BarcodeTestScreen() {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [BarCodeScannerComponent, setBarCodeScannerComponent] = useState<any>(null);
  const [moduleError, setModuleError] = useState<string | null>(null);
  const [moduleLoading, setModuleLoading] = useState(true);

  useEffect(() => {
    getBarCodeScannerPermissions();
  }, []);

  const getBarCodeScannerPermissions = async () => {
    if (Platform.OS === 'web') {
      setHasPermission(false);
      setModuleError('Barcode scanning not available on web');
      setModuleLoading(false);
      return;
    }

    try {
      console.log('🔍 BarcodeTest: Loading expo-camera module...');
      console.log('🔍 BarcodeTest: Platform:', Platform.OS);
      
      // Dynamically import BarCodeScanner
      const { CameraView } = await import('expo-camera');
      console.log('✅ BarcodeTest: Module imported successfully');
      
      if (!CameraView) {
        throw new Error('CameraView component not found in module');
      }
      
      setBarCodeScannerComponent(() => CameraView);
      setHasPermission(true);
      setModuleError(null);
      
    } catch (error) {
      console.error('❌ BarcodeTest: Error during setup:', error);
      setModuleError(error instanceof Error ? error.message : 'Unknown error');
      setHasPermission(false);
    } finally {
      setModuleLoading(false);
    }
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    console.log('✅ BarcodeTest: Barcode scanned successfully!');
    console.log('📊 BarcodeTest: Type:', type);
    console.log('📊 BarcodeTest: Data:', data);
    
    Alert.alert(
      'Barcode Scanned!',
      `Type: ${type}\nData: ${data}`,
      [
        { text: 'Scan Another', onPress: () => setScanned(false) },
        { text: 'Close', onPress: () => router.back() }
      ]
    );
  };

  const renderStatus = () => {
    if (moduleLoading) {
      return (
        <View style={styles.statusContainer}>
          <Zap size={48} color={theme.colors.primary} />
          <Text style={styles.statusTitle}>Loading Scanner Module</Text>
          <Text style={styles.statusText}>Checking expo-camera availability...</Text>
        </View>
      );
    }

    if (moduleError) {
      return (
        <View style={styles.statusContainer}>
          <Package size={48} color={theme.colors.error} />
          <Text style={styles.statusTitle}>Module Error</Text>
          <Text style={styles.statusText}>{moduleError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={getBarCodeScannerPermissions}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (hasPermission === false) {
      return (
        <View style={styles.statusContainer}>
          <Package size={48} color={theme.colors.warning} />
          <Text style={styles.statusTitle}>Camera Permission Required</Text>
          <Text style={styles.statusText}>
            Camera access is needed to scan barcodes. Please grant permission to continue.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={getBarCodeScannerPermissions}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (hasPermission === true && BarCodeScannerComponent) {
      return (
        <View style={styles.scannerContainer}>
          <BarCodeScannerComponent
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={styles.scanner}
            barcodeScannerSettings={{
              barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'],
            }}
          />
          
          <View style={styles.overlay}>
            <View style={styles.scanFrame}>
              <Text style={styles.scanText}>
                {scanned ? 'Barcode Scanned!' : 'Point camera at barcode'}
              </Text>
            </View>
          </View>
          
          {scanned && (
            <TouchableOpacity 
              style={styles.scanAgainButton} 
              onPress={() => setScanned(false)}
            >
              <Text style={styles.scanAgainText}>Scan Another</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return (
      <View style={styles.statusContainer}>
        <Package size={48} color={theme.colors.gray[400]} />
        <Text style={styles.statusTitle}>Unknown State</Text>
        <Text style={styles.statusText}>Something went wrong. Please try again.</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Barcode Scanner Test</Text>
        <View style={styles.placeholder} />
      </View>

      {renderStatus()}

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Test Information</Text>
        <Text style={styles.infoText}>Platform: {Platform.OS}</Text>
        <Text style={styles.infoText}>Module Loading: {moduleLoading ? 'Yes' : 'No'}</Text>
        <Text style={styles.infoText}>Has Permission: {hasPermission?.toString() || 'null'}</Text>
        <Text style={styles.infoText}>Component Available: {!!BarCodeScannerComponent ? 'Yes' : 'No'}</Text>
        {moduleError && (
          <Text style={styles.errorText}>Error: {moduleError}</Text>
        )}
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
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.borderRadius.round,
    padding: theme.spacing.sm,
  },
  headerTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  statusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  statusTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: 'white',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  statusText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
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
  retryButton: {
    backgroundColor: theme.colors.warning,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
  },
  retryButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  scanText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
  scanAgainButton: {
    position: 'absolute',
    bottom: 100,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  scanAgainText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: 'white',
  },
  infoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  infoTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: 'white',
    marginBottom: theme.spacing.sm,
  },
  infoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
});