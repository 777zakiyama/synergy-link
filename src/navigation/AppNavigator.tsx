import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from 'react-native-paper';
import {
  WelcomeScreen,
  SignUpScreen,
  LoginScreen,
  BusinessCardUploadScreen,
  PendingReviewScreen,
  ProfileEditScreen,
  ProfileCompleteScreen,
  ChatScreen,
  CommunityCreateScreen,
  CommunityDetailScreen,
} from '../screens';
import TabNavigator from './TabNavigator';
import { User, Community } from '../services/types';

export type RootStackParamList = {
  Welcome: undefined;
  SignUp: undefined;
  Login: undefined;
  BusinessCardUpload: undefined;
  PendingReview: undefined;
  ProfileEdit: undefined;
  ProfileComplete: undefined;
  MainApp: undefined;
  Chat: { matchId: string; partner: User & { uid: string } };
  CommunityCreate: undefined;
  CommunityDetail: { community: Community & { id: string } };
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const theme = useTheme();
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: theme.colors.onPrimary,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{
            title: 'Synergy Link',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{
            title: '新規登録',
          }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            title: 'ログイン',
          }}
        />
        <Stack.Screen
          name="BusinessCardUpload"
          component={BusinessCardUploadScreen}
          options={{
            title: '名刺アップロード',
          }}
        />
        <Stack.Screen
          name="PendingReview"
          component={PendingReviewScreen}
          options={{
            title: '審査状況',
            headerLeft: () => null, // Prevent going back from this screen
          }}
        />
        <Stack.Screen
          name="ProfileEdit"
          component={ProfileEditScreen}
          options={{
            title: 'プロフィール設定',
          }}
        />
        <Stack.Screen
          name="ProfileComplete"
          component={ProfileCompleteScreen}
          options={{
            title: '設定完了',
            headerLeft: () => null, // Prevent going back from this screen
          }}
        />
        <Stack.Screen
          name="MainApp"
          component={TabNavigator}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={({ route }) => ({
            title: route.params?.partner?.profile?.fullName || 'チャット',
            headerShown: true,
          })}
        />
        <Stack.Screen
          name="CommunityCreate"
          component={CommunityCreateScreen}
          options={{
            title: 'コミュニティ作成',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="CommunityDetail"
          component={CommunityDetailScreen}
          options={({ route }) => ({
            title: route.params?.community?.name || 'コミュニティ詳細',
            headerShown: true,
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
