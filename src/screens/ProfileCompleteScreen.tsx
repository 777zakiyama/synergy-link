import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type ProfileCompleteScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProfileComplete'>;

interface ProfileCompleteScreenProps {
  navigation: ProfileCompleteScreenNavigationProp;
}

const ProfileCompleteScreen: React.FC<ProfileCompleteScreenProps> = ({ navigation: _navigation }) => {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <View style={styles.iconContainer}>
            <Icon name="check-circle" size={80} color="#4caf50" />
          </View>
          
          <Text variant="headlineSmall" style={styles.title}>
            プロフィール設定完了
          </Text>
          
          <Text variant="bodyLarge" style={styles.message}>
            プロフィールの設定が完了しました！
          </Text>
          
          <Text variant="bodyMedium" style={styles.description}>
            これでSynergy Linkの全機能をご利用いただけます。
            素晴らしいビジネスパートナーとの出会いをお楽しみください。
          </Text>
          
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Icon name="people" size={20} color="#666" />
              <Text variant="bodySmall" style={styles.infoText}>
                マッチング機能でパートナーを見つけよう
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Icon name="forum" size={20} color="#666" />
              <Text variant="bodySmall" style={styles.infoText}>
                コミュニティで情報交換しよう
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Icon name="business-center" size={20} color="#666" />
              <Text variant="bodySmall" style={styles.infoText}>
                オープンイノベーションを実現しよう
              </Text>
            </View>
          </View>
          
          <Button
            mode="contained"
            style={styles.continueButton}
            contentStyle={styles.buttonContent}
            onPress={() => console.log('Continue to main app')}
          >
            アプリを開始
          </Button>
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
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  description: {
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
    lineHeight: 20,
  },
  infoContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 32,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  infoText: {
    color: '#666',
    flex: 1,
  },
  continueButton: {
    borderRadius: 8,
    width: '100%',
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

export default ProfileCompleteScreen;
