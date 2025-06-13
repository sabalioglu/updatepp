import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { theme } from '../../constants/theme';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        Alert.alert('Error', error.message);
      } else if (isSignUp) {
        Alert.alert('Success', 'Account created! Please check your email to verify your account.');
      }
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <User size={48} color={theme.colors.primary} />
          </View>
          <Text style={styles.title}>Pantry Pal</Text>
          <Text style={styles.subtitle}>
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Mail size={20} color={theme.colors.gray[500]} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor={theme.colors.gray[500]}
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color={theme.colors.gray[500]} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor={theme.colors.gray[500]}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={20} color={theme.colors.gray[500]} />
              ) : (
                <Eye size={20} color={theme.colors.gray[500]} />
              )}
            </TouchableOpacity>
          </View>

          {isSignUp && (
            <View style={styles.inputContainer}>
              <Lock size={20} color={theme.colors.gray[500]} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor={theme.colors.gray[500]}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color={theme.colors.gray[500]} />
                ) : (
                  <Eye size={20} color={theme.colors.gray[500]} />
                )}
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setIsSignUp(!isSignUp)}
          >
            <Text style={styles.switchButtonText}>
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    gap: theme.spacing.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  inputIcon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.text,
    paddingVertical: theme.spacing.md,
  },
  passwordInput: {
    paddingRight: theme.spacing.xl,
  },
  eyeIcon: {
    position: 'absolute',
    right: theme.spacing.md,
    padding: theme.spacing.xs,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  submitButtonDisabled: {
    backgroundColor: theme.colors.gray[400],
  },
  submitButtonText: {
    ...theme.typography.bodySemiBold,
    color: 'white',
  },
  switchButton: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  switchButtonText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
  },
});