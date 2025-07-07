import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { DiscoverScreen, ChatListScreen } from '../screens';

export type TabParamList = {
  Discover: undefined;
  Messages: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator: React.FC = () => {
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
          default:
            iconName = 'help';
            break;
        }

        return {
          tabBarIcon: ({ color, size }) => (
            <Icon name={iconName} size={size} color={color} />
          ),
          tabBarActiveTintColor: '#6200ee',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: 'white',
            borderTopWidth: 1,
            borderTopColor: '#e0e0e0',
          },
          headerStyle: {
            backgroundColor: '#6200ee',
          },
          headerTintColor: '#fff',
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
    </Tab.Navigator>
  );
};

export default TabNavigator;
