export const theme = {
  colors: {
    primary: '#E67E22',
    secondary: '#7D9D9C',
    accent: '#5EAAA8',
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    text: '#333333',
    textSecondary: '#666666',
    textMuted: '#999999',
    border: '#E0E0E0',
    fresh: '#E8F5E8',
    expiring: '#FFF3CD',
    expired: '#F8D7DA',
    gray: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 9999,
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },
  typography: {
    h1: {
      fontFamily: 'Poppins-Bold',
      fontSize: 32,
      lineHeight: 40,
    },
    h2: {
      fontFamily: 'Poppins-SemiBold',
      fontSize: 24,
      lineHeight: 32,
    },
    h3: {
      fontFamily: 'Poppins-SemiBold',
      fontSize: 20,
      lineHeight: 28,
    },
    body: {
      fontFamily: 'Inter-Regular',
      fontSize: 16,
      lineHeight: 24,
    },
    bodyMedium: {
      fontFamily: 'Inter-Medium',
      fontSize: 16,
      lineHeight: 24,
    },
    bodySemiBold: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 16,
      lineHeight: 24,
    },
    caption: {
      fontFamily: 'Inter-Regular',
      fontSize: 14,
      lineHeight: 20,
    },
    captionMedium: {
      fontFamily: 'Inter-Medium',
      fontSize: 14,
      lineHeight: 20,
    },
    small: {
      fontFamily: 'Inter-Regular',
      fontSize: 12,
      lineHeight: 16,
    },
    smallMedium: {
      fontFamily: 'Inter-Medium',
      fontSize: 12,
      lineHeight: 16,
    },
  },
};

export type Theme = typeof theme;