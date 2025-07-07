import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator, Card, Button, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { getCommunities } from '../services/firebase';
import { Community } from '../services/types';

type CommunityListNavigationProp = StackNavigationProp<RootStackParamList>;

interface CommunityItem extends Community {
  id: string;
}

const CommunityListScreen: React.FC = () => {
  const [communities, setCommunities] = useState<CommunityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<CommunityListNavigationProp>();

  useEffect(() => {
    loadCommunities();
  }, []);

  const loadCommunities = async () => {
    setLoading(true);
    try {
      const result = await getCommunities();
      if (result.success) {
        setCommunities(result.communities || []);
      }
    } catch (error) {
      console.log('Load communities error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommunityPress = (community: CommunityItem) => {
    navigation.navigate('CommunityDetail', { community });
  };

  const handleCreateCommunity = () => {
    navigation.navigate('CommunityCreate');
  };

  const renderCommunity = ({ item }: { item: CommunityItem }) => (
    <TouchableOpacity onPress={() => handleCommunityPress(item)}>
      <Card style={styles.communityCard}>
        <Card.Content style={styles.communityContent}>
          <View style={styles.iconContainer}>
            <Text style={styles.communityIcon}>{item.icon}</Text>
          </View>
          <View style={styles.communityInfo}>
            <Text variant="titleMedium" style={styles.communityName}>
              {item.name}
            </Text>
            <Text variant="bodySmall" style={styles.communityDescription}>
              {item.description}
            </Text>
            <Text variant="bodySmall" style={styles.memberCount}>
              {item.memberUids.length}人のメンバー
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
          コミュニティを読み込み中...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          mode="contained"
          onPress={handleCreateCommunity}
          style={styles.createButton}
          icon="plus"
        >
          新しいコミュニティを作成
        </Button>
      </View>

      {communities.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text variant="headlineSmall" style={styles.emptyTitle}>
            まだコミュニティがありません
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtitle}>
            最初のコミュニティを作成してみましょう
          </Text>
        </View>
      ) : (
        <FlatList
          data={communities}
          renderItem={renderCommunity}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={loadCommunities}
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleCreateCommunity}
        label="作成"
      />
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
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  createButton: {
    borderRadius: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  listContainer: {
    padding: 16,
  },
  communityCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  communityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    marginRight: 16,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  communityIcon: {
    fontSize: 30,
  },
  communityInfo: {
    flex: 1,
  },
  communityName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  communityDescription: {
    color: '#666',
    marginBottom: 4,
  },
  memberCount: {
    color: '#999',
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
});

export default CommunityListScreen;
