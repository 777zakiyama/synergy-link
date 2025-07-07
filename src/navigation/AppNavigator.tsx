import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {
  WelcomeScreen,
  SignUpScreen,
  LoginScreen,
  BusinessCardUploadScreen,
  PendingReviewScreen,
  ProfileEditScreen,
  ProfileCompleteScreen,
} from '../screens';

export type RootStackParamList = {
  Welcome: undefined;
  SignUp: undefined;
  Login: undefined;
  BusinessCardUpload: undefined;
  PendingReview: undefined;
  ProfileEdit: undefined;
  ProfileComplete: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#6200ee',
          },
          headerTintColor: '#fff',
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
