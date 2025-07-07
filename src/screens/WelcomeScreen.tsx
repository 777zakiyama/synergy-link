import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type WelcomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Welcome'>;

interface WelcomeScreenProps {
  navigation: WelcomeScreenNavigationProp;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <View style={styles.logoContainer}>
            <Icon name="business" size={80} color="#6200ee" />
          </View>
          
          <Text variant="headlineMedium" style={styles.title}>
            Synergy Link
          </Text>
          
          <Text variant="titleMedium" style={styles.subtitle}>
            審査制ビジネスSNS
          </Text>
          
          <Text variant="bodyMedium" style={styles.description}>
            ハイクラスなビジネスパーソン限定の
            プロフェッショナル・コミュニティ
          </Text>
          
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleSignUp}
              style={styles.signUpButton}
              contentStyle={styles.buttonContent}
            >
              新規登録
            </Button>
            
            <Button
              mode="outlined"
              onPress={handleLogin}
              style={styles.loginButton}
              contentStyle={styles.buttonContent}
            >
              ログイン
            </Button>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  card: {
    elevation: 4,
    borderRadius: 12,
  },
  content: {
    alignItems: 'center',
    padding: 32,
  },
  logoContainer: {
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 16,
    textAlign: 'center',
    color: '#666',
  },
  description: {
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  signUpButton: {
    borderRadius: 8,
  },
  loginButton: {
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

export default WelcomeScreen;
