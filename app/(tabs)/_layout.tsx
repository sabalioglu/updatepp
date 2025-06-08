import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { User, BookOpen, ShoppingBag, Refrigerator, Camera } from 'lucide-react-native';
import { theme } from '@/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.gray[400],
        tabBarLabelStyle: styles.tabBarLabel,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <User size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pantry"
        options={{
          title: 'Pantry',
          tabBarIcon: ({ color, size }) => (
            <Refrigerator size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: 'Camera',
          tabBarIcon: ({ color, size }) => (
            <Camera size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: 'Recipes',
          tabBarIcon: ({ color, size }) => (
            <BookOpen size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="shopping-list"
        options={{
          title: 'Shopping',
          tabBarIcon: ({ color, size }) => (
            <ShoppingBag size={size - 2} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
    height: 60,
    paddingBottom: 6,
    paddingTop: 6,
  },
  tabBarLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
  },
});