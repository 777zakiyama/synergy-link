import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Text, TextInput, Card } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('エラー', 'メールアドレスとパスワードを入力してください');
      return;
    }

    setLoading(true);
    try {
      const { loginUser } = await import('../services/firebase');
      
      const result = await loginUser(email, password);
      
      if (result.success) {
        console.log('Login successful:', result.uid);
        
        if (result.redirect === 'PendingReview') {
          navigation.navigate('PendingReview');
        } else if (result.redirect === 'ProfileEdit') {
          navigation.navigate('ProfileEdit');
        } else if (result.redirect === 'ProfileComplete') {
          navigation.navigate('ProfileComplete');
        }
      } else {
        Alert.alert('ログインエラー', result.error || 'ログインに失敗しました');
      }
    } catch (error) {
      console.log('Login error:', error);
      Alert.alert('エラー', 'ログイン中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <Text variant="headlineSmall" style={styles.title}>
            ログイン
          </Text>
          
          <Text variant="bodyMedium" style={styles.subtitle}>
            アカウントにログインしてください
          </Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              label="メールアドレス"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
            
            <TextInput
              label="パスワード"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry={!showPassword}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              style={styles.input}
            />
          </View>
          
          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.loginButton}
            contentStyle={styles.buttonContent}
            disabled={!email || !password || loading}
            loading={loading}
          >
            ログイン
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 20,
    elevation: 4,
    borderRadius: 12,
  },
  content: {
    padding: 24,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
  },
  inputContainer: {
    marginBottom: 24,
    gap: 16,
  },
  input: {
    backgroundColor: 'white',
  },
  loginButton: {
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

export default LoginScreen;
