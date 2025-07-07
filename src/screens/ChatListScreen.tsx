import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator, Avatar, Card, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { getUserMatches } from '../services/firebase';
import { User } from '../services/types';
import { showErrorAlert } from '../utils/errorHandler';

interface MatchItem {
  matchId: string;
  partner: User & { uid: string };
  createdAt: any;
}

type ChatListNavigationProp = StackNavigationProp<RootStackParamList>;

const ChatListScreen: React.FC = () => {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<ChatListNavigationProp>();
  const theme = useTheme();

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
    },
    listContainer: {
      padding: 16,
    },
    matchCard: {
      marginBottom: 12,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
    },
    matchContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    avatar: {
      marginRight: 16,
    },
    matchInfo: {
      flex: 1,
    },
    partnerName: {
      fontWeight: 'bold',
      marginBottom: 4,
      color: theme.colors.onSurface,
    },
    partnerCompany: {
      color: theme.colors.onSurfaceVariant,
      marginBottom: 4,
    },
    matchDate: {
      color: theme.colors.onSurfaceDisabled,
      fontSize: 12,
    },
  });

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    setLoading(true);
    try {
      const result = await getUserMatches();
      if (result.success) {
        setMatches(result.matches || []);
      }
    } catch (error) {
      showErrorAlert('エラー', 'マッチの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleMatchPress = (match: MatchItem) => {
    navigation.navigate('Chat', {
      matchId: match.matchId,
      partner: match.partner,
    });
  };

  const renderMatch = ({ item }: { item: MatchItem }) => (
    <TouchableOpacity onPress={() => handleMatchPress(item)}>
      <Card style={styles.matchCard}>
        <Card.Content style={styles.matchContent}>
          {item.partner.profile?.profileImageUrl ? (
            <Avatar.Image
              size={60}
              source={{ uri: item.partner.profile.profileImageUrl }}
              style={styles.avatar}
            />
          ) : (
            <Avatar.Text
              size={60}
              label={item.partner.profile?.fullName?.charAt(0) || '?'}
              style={styles.avatar}
            />
          )}
          <View style={styles.matchInfo}>
            <Text variant="titleMedium" style={styles.partnerName}>
              {item.partner.profile?.fullName || 'Unknown'}
            </Text>
            <Text variant="bodySmall" style={styles.partnerCompany}>
              {item.partner.profile?.position} at {item.partner.profile?.companyName}
            </Text>
            <Text variant="bodySmall" style={styles.matchDate}>
              マッチ成立
            </Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text variant="bodyLarge" style={styles.loadingText}>
          マッチを読み込み中...
        </Text>
      </View>
    );
  }

  if (matches.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="headlineSmall" style={styles.emptyTitle}>
          まだマッチがありません
        </Text>
        <Text variant="bodyMedium" style={styles.emptySubtitle}>
          Discoverでマッチを見つけましょう
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={matches}
        renderItem={renderMatch}
        keyExtractor={(item) => item.matchId}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

export default ChatListScreen;
