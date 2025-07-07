import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ActivityIndicator, Button, useTheme } from 'react-native-paper';
import { showErrorAlert, showConfirmAlert } from '../utils/errorHandler';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Swiper from 'react-native-deck-swiper';
import ProfileCard from '../components/ProfileCard';
import MatchModal from '../components/MatchModal';
import { getDiscoverUsers, saveSwipeAction, auth, firestore, getCollectionPath } from '../services/firebase';
import { User } from '../services/types';

type DiscoverNavigationProp = StackNavigationProp<RootStackParamList>;

const DiscoverScreen: React.FC = () => {
  const [users, setUsers] = useState<(User & { uid: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const theme = useTheme();
  const [matchedUser, setMatchedUser] = useState<User & { uid: string } | null>(null);
  const [currentUserData, setCurrentUserData] = useState<User | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);
  const navigation = useNavigation<DiscoverNavigationProp>();

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
        showErrorAlert('エラー', result.error || 'ユーザーの取得に失敗しました');
      }
    } catch (error) {
      showErrorAlert('エラー', 'ユーザーの取得中にエラーが発生しました');
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
          setMatchId(result.matchId);
          setShowMatchModal(true);
        }
      } else {
        showErrorAlert('エラー', result.error || 'スワイプの保存に失敗しました');
      }
    } catch (error) {
      showErrorAlert('エラー', 'スワイプ中にエラーが発生しました');
    }
  };

  const handleSwipedLeft = (cardIndex: number) => {
    handleSwipe(cardIndex, 'pass');
  };

  const handleSwipedRight = (cardIndex: number) => {
    handleSwipe(cardIndex, 'like');
  };

  const handleSwipedAll = () => {
    showConfirmAlert(
      '全て確認済み',
      '新しいユーザーをチェックしますか？',
      loadUsers
    );
  };

  const handleSendMessage = () => {
    setShowMatchModal(false);
    if (matchId && matchedUser) {
      navigation.navigate('Chat', { matchId, partner: matchedUser });
    }
  };

  const handleContinueSwiping = () => {
    setShowMatchModal(false);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    loadingText: {
      marginTop: 16,
      color: theme.colors.onSurfaceVariant,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      padding: 32,
    },
    emptyTitle: {
      fontWeight: 'bold',
      marginBottom: 8,
      textAlign: 'center',
      color: theme.colors.onSurface,
    },
    emptySubtitle: {
      textAlign: 'center',
      color: theme.colors.onSurfaceVariant,
      marginBottom: 24,
    },
    refreshButton: {
      borderRadius: 8,
    },
    header: {
      padding: 20,
      paddingTop: 40,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    headerTitle: {
      fontWeight: 'bold',
      color: theme.colors.onSurface,
    },
    headerSubtitle: {
      color: theme.colors.onSurfaceVariant,
      marginTop: 4,
    },
    swiperContainer: {
      flex: 1,
      paddingHorizontal: 20,
      paddingVertical: 20,
    },
    instructions: {
      padding: 20,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
    },
    instructionText: {
      textAlign: 'center',
      color: theme.colors.onSurfaceVariant,
    },
  });

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
      {showMatchModal && matchedUser && currentUserData && matchId && (
        <MatchModal
          visible={showMatchModal}
          currentUser={currentUserData}
          matchedUser={matchedUser}
          matchId={matchId}
          onSendMessage={handleSendMessage}
          onContinueSwiping={handleContinueSwiping}
        />
      )}
    </View>
  );
};

export default DiscoverScreen;
