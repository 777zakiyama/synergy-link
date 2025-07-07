import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, ActivityIndicator, Card, Avatar, Chip } from 'react-native-paper';
import { useRoute, RouteProp } from '@react-navigation/native';
import { joinCommunity, leaveCommunity, auth } from '../services/firebase';
import { Community } from '../services/types';

type CommunityDetailRouteProp = RouteProp<{
  CommunityDetail: {
    community: Community & { id: string };
  };
}, 'CommunityDetail'>;

const CommunityDetailScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [community, setCommunity] = useState<(Community & { id: string }) | null>(null);
  const route = useRoute<CommunityDetailRouteProp>();

  useEffect(() => {
    if (route.params?.community) {
      setCommunity(route.params.community);
    }
  }, [route.params]);

  const currentUser = auth.currentUser;
  const isMember = currentUser && community?.memberUids.includes(currentUser.uid);
  const isCreator = currentUser && community?.creatorUid === currentUser.uid;

  const handleJoinCommunity = async () => {
    if (!community) return;

    setLoading(true);
    try {
      const result = await joinCommunity(community.id);
      if (result.success) {
        setCommunity(prev => prev ? {
          ...prev,
          memberUids: [...prev.memberUids, currentUser!.uid]
        } : null);
        Alert.alert('成功', 'コミュニティに参加しました！');
      } else {
        Alert.alert('エラー', result.error || 'コミュニティへの参加に失敗しました');
      }
    } catch (error) {
      console.log('Join community error:', error);
      Alert.alert('エラー', 'コミュニティへの参加中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveCommunity = async () => {
    if (!community) return;

    Alert.alert(
      '確認',
      'このコミュニティから退会しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '退会',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const result = await leaveCommunity(community.id);
              if (result.success) {
                setCommunity(prev => prev ? {
                  ...prev,
                  memberUids: prev.memberUids.filter(uid => uid !== currentUser!.uid)
                } : null);
                Alert.alert('成功', 'コミュニティから退会しました');
              } else {
                Alert.alert('エラー', result.error || 'コミュニティからの退会に失敗しました');
              }
            } catch (error) {
              console.log('Leave community error:', error);
              Alert.alert('エラー', 'コミュニティからの退会中にエラーが発生しました');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (!community) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text variant="bodyLarge" style={styles.loadingText}>
          コミュニティ情報を読み込み中...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Card style={styles.headerCard}>
        <Card.Content style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <Text style={styles.communityIcon}>{community.icon}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text variant="headlineSmall" style={styles.communityName}>
              {community.name}
            </Text>
            <Text variant="bodyMedium" style={styles.communityDescription}>
              {community.description}
            </Text>
            <View style={styles.statsContainer}>
              <Chip icon="account-group" style={styles.memberChip}>
                {community.memberUids.length}人のメンバー
              </Chip>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.actionCard}>
        <Card.Content>
          {!isMember ? (
            <Button
              mode="contained"
              onPress={handleJoinCommunity}
              loading={loading}
              disabled={loading}
              style={styles.actionButton}
              icon="account-plus"
            >
              コミュニティに参加する
            </Button>
          ) : (
            <View style={styles.memberActions}>
              <Chip icon="check" style={styles.memberStatus}>
                参加済み
              </Chip>
              {!isCreator && (
                <Button
                  mode="outlined"
                  onPress={handleLeaveCommunity}
                  loading={loading}
                  disabled={loading}
                  style={styles.leaveButton}
                  textColor="#d32f2f"
                >
                  退会する
                </Button>
              )}
              {isCreator && (
                <Chip icon="crown" style={styles.creatorChip}>
                  作成者
                </Chip>
              )}
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.membersCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            メンバー ({community.memberUids.length}人)
          </Text>
          <View style={styles.membersContainer}>
            {community.memberUids.map((memberUid, index) => (
              <View key={memberUid} style={styles.memberItem}>
                <Avatar.Text
                  size={40}
                  label={`${index + 1}`}
                  style={styles.memberAvatar}
                />
                <View style={styles.memberInfo}>
                  <Text variant="bodyMedium">
                    {memberUid === community.creatorUid ? '作成者' : 'メンバー'}
                  </Text>
                  {memberUid === currentUser?.uid && (
                    <Text variant="bodySmall" style={styles.youLabel}>
                      (あなた)
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
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
  contentContainer: {
    padding: 16,
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
  headerCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
  },
  iconContainer: {
    marginRight: 16,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  communityIcon: {
    fontSize: 40,
  },
  headerInfo: {
    flex: 1,
  },
  communityName: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  communityDescription: {
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
  },
  memberChip: {
    backgroundColor: '#e3f2fd',
  },
  actionCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  actionButton: {
    borderRadius: 8,
    paddingVertical: 4,
  },
  memberActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  memberStatus: {
    backgroundColor: '#e8f5e8',
  },
  leaveButton: {
    borderColor: '#d32f2f',
  },
  creatorChip: {
    backgroundColor: '#fff3e0',
  },
  membersCard: {
    borderRadius: 12,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  membersContainer: {
    gap: 12,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    marginRight: 12,
    backgroundColor: '#6200ee',
  },
  memberInfo: {
    flex: 1,
  },
  youLabel: {
    color: '#6200ee',
    fontStyle: 'italic',
  },
});

export default CommunityDetailScreen;
