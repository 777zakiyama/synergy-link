import React from 'react';
import { View, StyleSheet, Image, Modal } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { User } from '../services/types';

interface MatchModalProps {
  visible: boolean;
  currentUser: User;
  matchedUser: User;
  onSendMessage: () => void;
  onContinueSwiping: () => void;
}

const MatchModal: React.FC<MatchModalProps> = ({
  visible,
  currentUser,
  matchedUser,
  onSendMessage,
  onContinueSwiping,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Card style={styles.matchCard}>
          <Card.Content style={styles.content}>
            <Text variant="headlineLarge" style={styles.matchTitle}>
              IT'S A MATCH!
            </Text>
            
            <Text variant="bodyLarge" style={styles.matchSubtitle}>
              お互いに興味を持ちました！
            </Text>
            
            <View style={styles.profilesContainer}>
              <View style={styles.profileImageContainer}>
                {currentUser.profile?.profileImageUrl ? (
                  <Image
                    source={{ uri: currentUser.profile.profileImageUrl }}
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Text variant="headlineMedium" style={styles.placeholderText}>
                      {currentUser.profile?.fullName?.charAt(0) || '?'}
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={styles.heartContainer}>
                <Text style={styles.heartIcon}>💖</Text>
              </View>
              
              <View style={styles.profileImageContainer}>
                {matchedUser.profile?.profileImageUrl ? (
                  <Image
                    source={{ uri: matchedUser.profile.profileImageUrl }}
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Text variant="headlineMedium" style={styles.placeholderText}>
                      {matchedUser.profile?.fullName?.charAt(0) || '?'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            
            <View style={styles.namesContainer}>
              <Text variant="titleMedium" style={styles.userName}>
                {currentUser.profile?.fullName}
              </Text>
              <Text variant="titleMedium" style={styles.userName}>
                {matchedUser.profile?.fullName}
              </Text>
            </View>
            
            <View style={styles.buttonsContainer}>
              <Button
                mode="contained"
                onPress={onSendMessage}
                style={[styles.button, styles.messageButton]}
                contentStyle={styles.buttonContent}
              >
                メッセージを送る
              </Button>
              
              <Button
                mode="outlined"
                onPress={onContinueSwiping}
                style={[styles.button, styles.continueButton]}
                contentStyle={styles.buttonContent}
              >
                スワイプを続ける
              </Button>
            </View>
          </Card.Content>
        </Card>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  matchCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  content: {
    padding: 32,
    alignItems: 'center',
  },
  matchTitle: {
    fontWeight: 'bold',
    color: '#e91e63',
    textAlign: 'center',
    marginBottom: 8,
  },
  matchSubtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 32,
  },
  profilesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 20,
  },
  profileImageContainer: {
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#e91e63',
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#e91e63',
  },
  placeholderText: {
    color: '#666',
    fontWeight: 'bold',
  },
  heartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartIcon: {
    fontSize: 32,
  },
  namesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  userName: {
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    flex: 1,
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    borderRadius: 12,
  },
  messageButton: {
    backgroundColor: '#e91e63',
  },
  continueButton: {
    borderColor: '#e91e63',
  },
  buttonContent: {
    paddingVertical: 12,
  },
});

export default MatchModal;
