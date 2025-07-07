import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, TextInput, Card, useTheme } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { showValidationAlert, showErrorAlert } from '../utils/errorHandler';

type SignUpScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SignUp'>;

interface SignUpScreenProps {
  navigation: SignUpScreenNavigationProp;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      showValidationAlert('すべての項目を入力してください');
      return;
    }
    
    if (password !== confirmPassword) {
      showValidationAlert('パスワードが一致しません');
      return;
    }
    
    if (password.length < 6) {
      showValidationAlert('パスワードは6文字以上で入力してください');
      return;
    }
    
    setLoading(true);
    try {
      const { registerUser } = await import('../services/firebase');
      
      const result = await registerUser(email, password);
      
      if (result.success) {
        navigation.navigate('BusinessCardUpload');
      } else {
        showErrorAlert('登録エラー', result.error || '登録に失敗しました');
      }
    } catch (error) {
      showErrorAlert('エラー', '登録中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    card: {
      margin: 20,
      elevation: 4,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
    },
    content: {
      padding: 24,
    },
    title: {
      fontWeight: 'bold',
      marginBottom: 8,
      textAlign: 'center',
      color: theme.colors.onSurface,
    },
    subtitle: {
      textAlign: 'center',
      marginBottom: 32,
      color: theme.colors.onSurfaceVariant,
    },
    inputContainer: {
      marginBottom: 24,
      gap: 16,
    },
    input: {
      backgroundColor: theme.colors.surface,
    },
    signUpButton: {
      borderRadius: 8,
    },
    buttonContent: {
      paddingVertical: 8,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <Text variant="headlineSmall" style={styles.title}>
            新規登録
          </Text>
          
          <Text variant="bodyMedium" style={styles.subtitle}>
            アカウントを作成してください
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
            
            <TextInput
              label="パスワード（確認用）"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              mode="outlined"
              secureTextEntry={!showConfirmPassword}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
              style={styles.input}
            />
          </View>
          
          <Button
            mode="contained"
            onPress={handleSignUp}
            style={styles.signUpButton}
            contentStyle={styles.buttonContent}
            disabled={!email || !password || !confirmPassword}
            loading={loading}
          >
            {loading ? '登録中...' : '登録する'}
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};


export default SignUpScreen;
