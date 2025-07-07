import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type PendingReviewScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PendingReview'>;

interface PendingReviewScreenProps {
  navigation: PendingReviewScreenNavigationProp;
}

const PendingReviewScreen: React.FC<PendingReviewScreenProps> = ({ navigation: _navigation }) => {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <View style={styles.iconContainer}>
            <Icon name="hourglass-empty" size={80} color="#6200ee" />
          </View>
          
          <Text variant="headlineSmall" style={styles.title}>
            審査中です
          </Text>
          
          <Text variant="bodyLarge" style={styles.message}>
            ご申請ありがとうございます。
          </Text>
          
          <Text variant="bodyMedium" style={styles.description}>
            現在審査中です。完了まで今しばらくお待ちください。
          </Text>
          
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Icon name="schedule" size={20} color="#666" />
              <Text variant="bodySmall" style={styles.infoText}>
                審査には通常1-3営業日かかります
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Icon name="email" size={20} color="#666" />
              <Text variant="bodySmall" style={styles.infoText}>
                結果はメールでお知らせします
              </Text>
            </View>
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
});

export default PendingReviewScreen;
