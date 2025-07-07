import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { DiscoverScreen, ChatListScreen, CommunityListScreen } from '../screens';

export type TabParamList = {
  Discover: undefined;
  Messages: undefined;
  Communities: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const TabBarIcon: React.FC<{ iconName: string; color: string; size: number }> = ({ iconName, color, size }) => (
  <Icon name={iconName} size={size} color={color} />
);

const TabNavigator: React.FC = () => {
  const theme = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        let iconName: string;

        switch (route.name) {
          case 'Discover':
            iconName = 'explore';
            break;
          case 'Messages':
            iconName = 'chat';
            break;
          case 'Communities':
            iconName = 'groups';
            break;
          default:
            iconName = 'help';
            break;
        }

        return {
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon iconName={iconName} color={color} size={size} />
          ),
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopWidth: 1,
            borderTopColor: theme.colors.outline,
          },
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: theme.colors.onPrimary,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        };
      }}
    >
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          title: '発見',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Messages"
        component={ChatListScreen}
        options={{
          title: 'メッセージ',
          headerShown: true,
          headerTitle: 'メッセージ',
        }}
      />
      <Tab.Screen
        name="Communities"
        component={CommunityListScreen}
        options={{
          title: 'コミュニティ',
          headerShown: true,
          headerTitle: 'コミュニティ',
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
