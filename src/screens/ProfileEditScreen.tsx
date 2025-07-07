import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { Button, Text, TextInput, Card, useTheme } from 'react-native-paper';
import { showErrorAlert, showValidationAlert, showSuccessAlert } from '../utils/errorHandler';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { launchImageLibrary, launchCamera, ImagePickerResponse, CameraOptions, ImageLibraryOptions } from 'react-native-image-picker';

type ProfileEditScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProfileEdit'>;

interface ProfileEditScreenProps {
  navigation: ProfileEditScreenNavigationProp;
}

const ProfileEditScreen: React.FC<ProfileEditScreenProps> = ({ navigation: _navigation }) => {
  const theme = useTheme();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [position, setPosition] = useState('');
  const [bio, setBio] = useState('');
  const [tags, setTags] = useState('');
  const [needs, setNeeds] = useState('');
  const [seeds, setSeeds] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageSelection = () => {
    Alert.alert(
      'プロフィール写真を選択',
      'プロフィール写真を選択してください',
      [
        {
          text: 'カメラで撮影',
          onPress: () => openCamera(),
        },
        {
          text: 'ライブラリから選択',
          onPress: () => openImageLibrary(),
        },
        {
          text: 'キャンセル',
          style: 'cancel',
        },
      ]
    );
  };

  const openCamera = () => {
    const options: CameraOptions = {
      mediaType: 'photo',
      quality: 0.8,
      includeBase64: false,
    };

    launchCamera(options, (response: ImagePickerResponse) => {
      if (response.assets && response.assets[0]) {
        setProfileImage(response.assets[0].uri!);
      }
    });
  };

  const openImageLibrary = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      quality: 0.8,
      includeBase64: false,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.assets && response.assets[0]) {
        setProfileImage(response.assets[0].uri!);
      }
    });
  };

  const handleSaveProfile = async () => {
    if (!fullName || !companyName || !position) {
      showValidationAlert('氏名、会社名、役職は必須項目です');
      return;
    }

    setLoading(true);
    try {
      const { updateUserProfile } = await import('../services/firebase');
      
      const profileData = {
        fullName,
        companyName,
        position,
        bio,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        needs,
        seeds,
      };

      const result = await updateUserProfile(profileData, profileImage);
      
      if (result.success) {
        showSuccessAlert('成功', 'プロフィールが保存されました');
      } else {
        showErrorAlert('エラー', `保存に失敗しました: ${result.error}`);
      }
    } catch (error) {
      showErrorAlert('エラー', 'プロフィール保存中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    card: {
      margin: 20,
      elevation: 4,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
    },
    content: {
      padding: 24,
    },
    title: {
      fontWeight: 'bold',
      marginBottom: 8,
      textAlign: 'center',
      color: theme.colors.onSurface,
    },
    subtitle: {
      textAlign: 'center',
      marginBottom: 32,
      color: theme.colors.onSurfaceVariant,
    },
    imageSection: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontWeight: 'bold',
      marginBottom: 16,
      color: theme.colors.onSurface,
    },
    imageContainer: {
      alignItems: 'center',
      gap: 12,
    },
    profileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
    },
    imagePlaceholder: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.colors.outlineVariant,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.outline,
      borderStyle: 'dashed',
    },
    imageButton: {
      borderRadius: 8,
    },
    inputSection: {
      marginBottom: 32,
    },
    input: {
      backgroundColor: theme.colors.surface,
      marginBottom: 16,
    },
    saveButton: {
      borderRadius: 8,
      marginTop: 16,
    },
    buttonContent: {
      paddingVertical: 8,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <Text variant="headlineSmall" style={styles.title}>
            プロフィール設定
          </Text>
          
          <Text variant="bodyMedium" style={styles.subtitle}>
            あなたの情報を入力してください
          </Text>
          
          {/* Profile Image Section */}
          <View style={styles.imageSection}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              プロフィール写真
            </Text>
            
            <View style={styles.imageContainer}>
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Icon name="person" size={48} color="#ccc" />
                </View>
              )}
              
              <Button
                mode="outlined"
                onPress={handleImageSelection}
                style={styles.imageButton}
                compact
              >
                写真を選択
              </Button>
            </View>
          </View>
          
          {/* Basic Information */}
          <View style={styles.inputSection}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              基本情報
            </Text>
            
            <TextInput
              label="氏名 *"
              value={fullName}
              onChangeText={setFullName}
              mode="outlined"
              style={styles.input}
            />
            
            <TextInput
              label="会社名 *"
              value={companyName}
              onChangeText={setCompanyName}
              mode="outlined"
              style={styles.input}
            />
            
            <TextInput
              label="役職 *"
              value={position}
              onChangeText={setPosition}
              mode="outlined"
              style={styles.input}
            />
            
            <TextInput
              label="自己紹介文"
              value={bio}
              onChangeText={setBio}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.input}
            />
            
            <TextInput
              label="趣味・関心事タグ（カンマ区切り）"
              value={tags}
              onChangeText={setTags}
              mode="outlined"
              placeholder="例: AI活用, サウナ, ゴルフ"
              style={styles.input}
            />
          </View>
          
          {/* Open Innovation */}
          <View style={styles.inputSection}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              オープンイノベーション
            </Text>
            
            <TextInput
              label="探していること（Needs）"
              value={needs}
              onChangeText={setNeeds}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
            />
            
            <TextInput
              label="提供できること（Seeds）"
              value={seeds}
              onChangeText={setSeeds}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
            />
          </View>
          
          <Button
            mode="contained"
            onPress={handleSaveProfile}
            style={styles.saveButton}
            contentStyle={styles.buttonContent}
            disabled={!fullName || !companyName || !position || loading}
            loading={loading}
          >
            プロフィールを保存
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};


export default ProfileEditScreen;
