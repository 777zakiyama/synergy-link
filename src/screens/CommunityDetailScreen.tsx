import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, ActivityIndicator, Card, Avatar, Chip, useTheme } from 'react-native-paper';
import { showErrorAlert, showConfirmAlert, showSuccessAlert } from '../utils/errorHandler';
import { useRoute, RouteProp } from '@react-navigation/native';
import { joinCommunity, leaveCommunity, supportCommunity, auth } from '../services/firebase';
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
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    contentContainer: {
      padding: 16,
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
    headerCard: {
      marginBottom: 16,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
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
      backgroundColor: theme.colors.outlineVariant,
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
      color: theme.colors.onSurface,
    },
    communityDescription: {
      color: theme.colors.onSurfaceVariant,
      marginBottom: 12,
      lineHeight: 20,
    },
    statsContainer: {
      flexDirection: 'row',
    },
    memberChip: {
      backgroundColor: theme.colors.primaryContainer,
    },
    supporterChip: {
      backgroundColor: theme.colors.secondaryContainer,
      marginRight: 8,
    },
    proposedChip: {
      backgroundColor: theme.colors.errorContainer,
    },
    actionCard: {
      marginBottom: 16,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
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
      backgroundColor: theme.colors.primaryContainer,
    },
    leaveButton: {
      borderColor: theme.colors.error,
    },
    creatorChip: {
      backgroundColor: theme.colors.secondaryContainer,
    },
    proposedActions: {
      alignItems: 'center',
    },
    creatorSection: {
      alignItems: 'center',
      width: '100%',
    },
    supporterSection: {
      alignItems: 'center',
      width: '100%',
    },
    supportSection: {
      alignItems: 'center',
      width: '100%',
    },
    supportedChip: {
      backgroundColor: theme.colors.primaryContainer,
      marginBottom: 8,
    },
    promotionText: {
      textAlign: 'center',
      color: theme.colors.onSurfaceVariant,
      fontStyle: 'italic',
      marginTop: 8,
    },
    membersCard: {
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
    },
    sectionTitle: {
      fontWeight: 'bold',
      marginBottom: 16,
      color: theme.colors.onSurface,
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
      backgroundColor: theme.colors.primary,
    },
    memberInfo: {
      flex: 1,
    },
    youLabel: {
      color: theme.colors.primary,
      fontStyle: 'italic',
    },
  });

  useEffect(() => {
    if (route.params?.community) {
      setCommunity(route.params.community);
    }
  }, [route.params]);

  const currentUser = auth.currentUser;
  const isMember = currentUser && community?.memberUids.includes(currentUser.uid);
  const isCreator = currentUser && community?.creatorUid === currentUser.uid;
  const isSupporter = currentUser && community?.supporterUids?.includes(currentUser.uid);

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
        showSuccessAlert('成功', 'コミュニティに参加しました！');
      } else {
        showErrorAlert('エラー', result.error || 'コミュニティへの参加に失敗しました');
      }
    } catch (error) {
      showErrorAlert('エラー', 'コミュニティへの参加中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveCommunity = async () => {
    if (!community) return;

    showConfirmAlert(
      '確認',
      'このコミュニティから退会しますか？',
      async () => {
        setLoading(true);
        try {
          const result = await leaveCommunity(community.id);
          if (result.success) {
            setCommunity(prev => prev ? {
              ...prev,
              memberUids: prev.memberUids.filter(uid => uid !== currentUser!.uid)
            } : null);
            showSuccessAlert('成功', 'コミュニティから退会しました');
          } else {
            showErrorAlert('エラー', result.error || 'コミュニティからの退会に失敗しました');
          }
        } catch (error) {
          showErrorAlert('エラー', 'コミュニティからの退会中にエラーが発生しました');
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const handleSupportCommunity = async () => {
    if (!community) return;

    setLoading(true);
    try {
      const result = await supportCommunity(community.id);
      if (result.success) {
        setCommunity(prev => prev ? {
          ...prev,
          supporterUids: [...(prev.supporterUids || []), currentUser!.uid]
        } : null);
        showSuccessAlert('成功', 'コミュニティを応援しました！');
      } else {
        showErrorAlert('エラー', result.error || 'コミュニティの応援に失敗しました');
      }
    } catch (error) {
      showErrorAlert('エラー', 'コミュニティの応援中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
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
              {community.status === 'official' ? (
                <Chip icon="account-group" style={styles.memberChip}>
                  {community.memberUids.length}人のメンバー
                </Chip>
              ) : (
                <>
                  <Chip icon="thumb-up" style={styles.supporterChip}>
                    サポーター: {community.supporterUids?.length || 0} / 20人
                  </Chip>
                  <Chip icon="clock" style={styles.proposedChip}>
                    提案中
                  </Chip>
                </>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.actionCard}>
        <Card.Content>
          {community.status === 'proposed' ? (
            <View style={styles.proposedActions}>
              {isCreator ? (
                <View style={styles.creatorSection}>
                  <Chip icon="crown" style={styles.creatorChip}>
                    提案者
                  </Chip>
                  <Text variant="bodySmall" style={styles.promotionText}>
                    20人のサポーターが集まると公式コミュニティになります
                  </Text>
                </View>
              ) : isSupporter ? (
                <View style={styles.supporterSection}>
                  <Chip icon="check" style={styles.supportedChip}>
                    応援済み
                  </Chip>
                  <Text variant="bodySmall" style={styles.promotionText}>
                    20人のサポーターが集まると公式コミュニティになります
                  </Text>
                </View>
              ) : (
                <View style={styles.supportSection}>
                  <Button
                    mode="contained"
                    onPress={handleSupportCommunity}
                    loading={loading}
                    disabled={loading}
                    style={styles.actionButton}
                    icon="thumb-up"
                  >
                    このコミュニティを応援する
                  </Button>
                  <Text variant="bodySmall" style={styles.promotionText}>
                    20人のサポーターが集まると公式コミュニティになります
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <>
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
                      textColor={theme.colors.error}
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
            </>
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

export default CommunityDetailScreen;
