import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { createCommunity } from '../services/firebase';

const CommunityCreateScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('エラー', 'コミュニティ名を入力してください');
      return;
    }

    if (!description.trim()) {
      Alert.alert('エラー', '説明を入力してください');
      return;
    }

    if (!icon.trim()) {
      Alert.alert('エラー', 'アイコン絵文字を入力してください');
      return;
    }

    setLoading(true);
    try {
      const result = await createCommunity(name.trim(), description.trim(), icon.trim());
      if (result.success) {
        Alert.alert(
          '成功',
          'コミュニティが作成されました！',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('エラー', result.error || 'コミュニティの作成に失敗しました');
      }
    } catch (error) {
      console.log('Create community error:', error);
      Alert.alert('エラー', 'コミュニティの作成中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          新しいコミュニティを作成
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          同じ興味や関心を持つ人たちと繋がりましょう
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          label="コミュニティ名"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
          placeholder="例: AI活用研究会"
          maxLength={50}
        />

        <TextInput
          label="説明"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          multiline
          numberOfLines={4}
          style={styles.input}
          placeholder="このコミュニティについて説明してください"
          maxLength={200}
        />

        <TextInput
          label="アイコン絵文字"
          value={icon}
          onChangeText={setIcon}
          mode="outlined"
          style={styles.input}
          placeholder="例: 💡, ⛳, 🎯"
          maxLength={2}
        />

        <View style={styles.preview}>
          <Text variant="bodyMedium" style={styles.previewLabel}>
            プレビュー:
          </Text>
          <View style={styles.previewCard}>
            <View style={styles.previewIcon}>
              <Text style={styles.previewIconText}>{icon || '❓'}</Text>
            </View>
            <View style={styles.previewInfo}>
              <Text variant="titleMedium" style={styles.previewName}>
                {name || 'コミュニティ名'}
              </Text>
              <Text variant="bodySmall" style={styles.previewDescription}>
                {description || '説明文がここに表示されます'}
              </Text>
            </View>
          </View>
        </View>

        <Button
          mode="contained"
          onPress={handleCreate}
          loading={loading}
          disabled={loading || !name.trim() || !description.trim() || !icon.trim()}
          style={styles.createButton}
        >
          {loading ? '作成中...' : 'コミュニティを作成'}
        </Button>
      </View>
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
  header: {
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  preview: {
    marginBottom: 24,
  },
  previewLabel: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  previewIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  previewIconText: {
    fontSize: 24,
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  previewDescription: {
    color: '#666',
  },
  createButton: {
    borderRadius: 8,
    paddingVertical: 4,
  },
});

export default CommunityCreateScreen;
