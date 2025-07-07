import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, ActivityIndicator, Button } from 'react-native-paper';
import Swiper from 'react-native-deck-swiper';
import ProfileCard from '../components/ProfileCard';
import MatchModal from '../components/MatchModal';
import { getDiscoverUsers, saveSwipeAction, auth, firestore, getCollectionPath } from '../services/firebase';
import { User } from '../services/types';

const DiscoverScreen: React.FC = () => {
  const [users, setUsers] = useState<(User & { uid: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedUser, setMatchedUser] = useState<User & { uid: string } | null>(null);
  const [currentUserData, setCurrentUserData] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
    loadCurrentUserData();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await getDiscoverUsers();
      if (result.success) {
        setUsers(result.users || []);
      } else {
        Alert.alert('エラー', result.error || 'ユーザーの取得に失敗しました');
      }
    } catch (error) {
      console.log('Load users error:', error);
      Alert.alert('エラー', 'ユーザーの取得中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentUserData = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const { doc, getDoc } = await import('firebase/firestore');
        
        const userDocRef = doc(firestore, getCollectionPath('USERS'), currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          setCurrentUserData(userDoc.data() as User);
        }
      }
    } catch (error) {
      console.log('Load current user error:', error);
    }
  };

  const handleSwipe = async (cardIndex: number, action: 'like' | 'pass') => {
    const user = users[cardIndex];
    if (!user) return;

    try {
      const result = await saveSwipeAction(user.uid, action);
      if (result.success) {
        if (result.isMatch && action === 'like') {
          setMatchedUser(user);
          setShowMatchModal(true);
        }
      } else {
        Alert.alert('エラー', result.error || 'スワイプの保存に失敗しました');
      }
    } catch (error) {
      console.log('Swipe error:', error);
      Alert.alert('エラー', 'スワイプ中にエラーが発生しました');
    }
  };

  const handleSwipedLeft = (cardIndex: number) => {
    handleSwipe(cardIndex, 'pass');
  };

  const handleSwipedRight = (cardIndex: number) => {
    handleSwipe(cardIndex, 'like');
  };

  const handleSwipedAll = () => {
    Alert.alert(
      '全て確認済み',
      '新しいユーザーをチェックしますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        { text: '更新', onPress: loadUsers },
      ]
    );
  };

  const handleSendMessage = () => {
    setShowMatchModal(false);
    Alert.alert('メッセージ機能', 'メッセージ機能は今後実装予定です');
  };

  const handleContinueSwiping = () => {
    setShowMatchModal(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text variant="bodyLarge" style={styles.loadingText}>
          ユーザーを読み込み中...
        </Text>
      </View>
    );
  }

  if (users.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="headlineSmall" style={styles.emptyTitle}>
          新しいユーザーがいません
        </Text>
        <Text variant="bodyMedium" style={styles.emptySubtitle}>
          後でもう一度確認してみてください
        </Text>
        <Button
          mode="contained"
          onPress={loadUsers}
          style={styles.refreshButton}
        >
          更新
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Discover
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          新しいつながりを見つけよう
        </Text>
      </View>

      <View style={styles.swiperContainer}>
        <Swiper
          cards={users}
          renderCard={(user) => user ? <ProfileCard user={user} /> : null}
          onSwipedLeft={handleSwipedLeft}
          onSwipedRight={handleSwipedRight}
          onSwipedAll={handleSwipedAll}
          backgroundColor="transparent"
          stackSize={3}
          stackSeparation={15}
          animateOverlayLabelsOpacity
          animateCardOpacity
          swipeBackCard
          overlayLabels={{
            left: {
              title: 'PASS',
              style: {
                label: {
                  backgroundColor: '#FF6B6B',
                  borderColor: '#FF6B6B',
                  color: 'white',
                  borderWidth: 1,
                  fontSize: 24,
                  fontWeight: 'bold',
                  padding: 10,
                  borderRadius: 10,
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-start',
                  marginTop: 30,
                  marginLeft: -30,
                },
              },
            },
            right: {
              title: 'LIKE',
              style: {
                label: {
                  backgroundColor: '#4ECDC4',
                  borderColor: '#4ECDC4',
                  color: 'white',
                  borderWidth: 1,
                  fontSize: 24,
                  fontWeight: 'bold',
                  padding: 10,
                  borderRadius: 10,
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  marginTop: 30,
                  marginLeft: 30,
                },
              },
            },
          }}
        />
      </View>

      <View style={styles.instructions}>
        <Text variant="bodySmall" style={styles.instructionText}>
          左にスワイプ: パス　｜　右にスワイプ: いいね
        </Text>
      </View>

      {/* Match Modal */}
      {showMatchModal && matchedUser && currentUserData && (
        <MatchModal
          visible={showMatchModal}
          currentUser={currentUserData}
          matchedUser={matchedUser}
          onSendMessage={handleSendMessage}
          onContinueSwiping={handleContinueSwiping}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 32,
  },
  emptyTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
  },
  refreshButton: {
    borderRadius: 8,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    color: '#666',
    marginTop: 4,
  },
  swiperContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  instructions: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  instructionText: {
    textAlign: 'center',
    color: '#666',
  },
});

export default DiscoverScreen;
