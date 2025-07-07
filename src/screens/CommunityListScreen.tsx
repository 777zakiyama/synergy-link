import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator, Card, Button, FAB, SegmentedButtons } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { getCommunities, supportCommunity, auth } from '../services/firebase';
import { Community } from '../services/types';

type CommunityListNavigationProp = StackNavigationProp<RootStackParamList>;

interface CommunityItem extends Community {
  id: string;
}

const CommunityListScreen: React.FC = () => {
  const [communities, setCommunities] = useState<CommunityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('official');
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

  const handleSupportCommunity = async (communityId: string) => {
    try {
      const result = await supportCommunity(communityId);
      if (result.success) {
        loadCommunities(); // Refresh the list
      }
    } catch (error) {
      console.log('Support community error:', error);
    }
  };

  const filteredCommunities = communities.filter(community => 
    community.status === selectedTab
  );

  const isUserSupporter = (community: CommunityItem) => {
    const currentUser = auth.currentUser;
    return currentUser && community.supporterUids.includes(currentUser.uid);
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
            {item.status === 'official' ? (
              <Text variant="bodySmall" style={styles.memberCount}>
                {item.memberUids.length}人のメンバー
              </Text>
            ) : (
              <View style={styles.proposedInfo}>
                <Text variant="bodySmall" style={styles.supporterCount}>
                  サポーター: {item.supporterUids.length} / 20人
                </Text>
                {!isUserSupporter(item) && (
                  <Button
                    mode="outlined"
                    onPress={() => handleSupportCommunity(item.id)}
                    style={styles.supportButton}
                    compact
                  >
                    応援する
                  </Button>
                )}
              </View>
            )}
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
        
        <SegmentedButtons
          value={selectedTab}
          onValueChange={setSelectedTab}
          buttons={[
            {
              value: 'official',
              label: '公式',
            },
            {
              value: 'proposed',
              label: '提案中',
            },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      {filteredCommunities.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text variant="headlineSmall" style={styles.emptyTitle}>
            {selectedTab === 'official' ? '公式コミュニティがありません' : '提案中のコミュニティがありません'}
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtitle}>
            {selectedTab === 'official' 
              ? '提案中のコミュニティが20人のサポーターを集めると公式になります'
              : '新しいコミュニティを提案してみましょう'
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredCommunities}
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
    marginBottom: 16,
  },
  segmentedButtons: {
    marginBottom: 8,
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
  proposedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  supporterCount: {
    color: '#999',
    fontSize: 12,
    flex: 1,
  },
  supportButton: {
    marginLeft: 8,
    borderRadius: 16,
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
