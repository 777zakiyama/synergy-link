import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Button, Text, Card, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { launchImageLibrary, launchCamera, ImagePickerResponse, CameraOptions, ImageLibraryOptions } from 'react-native-image-picker';
import { showErrorAlert, showValidationAlert } from '../utils/errorHandler';

type BusinessCardUploadScreenNavigationProp = StackNavigationProp<RootStackParamList, 'BusinessCardUpload'>;

interface BusinessCardUploadScreenProps {
  navigation: BusinessCardUploadScreenNavigationProp;
}

const BusinessCardUploadScreen: React.FC<BusinessCardUploadScreenProps> = ({ navigation }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const handleImageSelection = () => {
    const { Alert } = require('react-native');
    Alert.alert(
      '画像を選択',
      '名刺の画像を選択してください',
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
      if (response.errorMessage) {
        showErrorAlert('エラー', '画像の撮影に失敗しました');
        return;
      }
      if (response.assets && response.assets[0]) {
        setSelectedImage(response.assets[0].uri!);
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
      if (response.errorMessage) {
        showErrorAlert('エラー', '画像の選択に失敗しました');
        return;
      }
      if (response.assets && response.assets[0]) {
        setSelectedImage(response.assets[0].uri!);
      }
    });
  };

  const handleSubmitApplication = async () => {
    if (!selectedImage) {
      showValidationAlert('名刺画像を選択してください');
      return;
    }

    setLoading(true);
    try {
      const { auth, uploadBusinessCard } = await import('../services/firebase');
      
      const currentUser = auth.currentUser;
      if (!currentUser) {
        showErrorAlert('エラー', 'ユーザーが認証されていません');
        return;
      }
      
      const result = await uploadBusinessCard(currentUser.uid, selectedImage);
      
      if (result.success) {
        navigation.navigate('PendingReview');
      } else {
        showErrorAlert('エラー', `アップロードに失敗しました: ${result.error}`);
      }
    } catch (error) {
      showErrorAlert('エラー', 'アップロード中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: theme.colors.background,
    },
    card: {
      elevation: 4,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
    },
    content: {
      padding: 24,
    },
    title: {
      fontWeight: 'bold',
      marginBottom: 16,
      textAlign: 'center',
      color: theme.colors.onSurface,
    },
    description: {
      textAlign: 'center',
      marginBottom: 32,
      color: theme.colors.onSurfaceVariant,
      lineHeight: 20,
    },
    uploadSection: {
      marginBottom: 32,
    },
    uploadButton: {
      borderRadius: 8,
      marginBottom: 24,
    },
    uploadButtonContent: {
      paddingVertical: 8,
    },
    previewContainer: {
      minHeight: 200,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: theme.colors.outline,
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.outlineVariant,
    },
    imagePreview: {
      alignItems: 'center',
      padding: 16,
    },
    previewImage: {
      width: 250,
      height: 150,
      borderRadius: 8,
      marginBottom: 12,
    },
    previewText: {
      color: theme.colors.onSurfaceVariant,
    },
    placeholderContainer: {
      alignItems: 'center',
      padding: 32,
    },
    placeholderText: {
      marginTop: 12,
      color: theme.colors.onSurfaceDisabled,
    },
    submitButton: {
      borderRadius: 8,
    },
    buttonContent: {
      paddingVertical: 8,
    },
  });

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <Text variant="headlineSmall" style={styles.title}>
            名刺アップロード
          </Text>
          
          <Text variant="bodyMedium" style={styles.description}>
            審査のため、名刺の画像をアップロードしてください。
          </Text>
          
          <View style={styles.uploadSection}>
            <Button
              mode="outlined"
              onPress={handleImageSelection}
              style={styles.uploadButton}
              contentStyle={styles.uploadButtonContent}
              icon="camera"
            >
              カメラで撮影またはライブラリから選択
            </Button>
            
            <View style={styles.previewContainer}>
              {selectedImage ? (
                <View style={styles.imagePreview}>
                  <Image
                    source={{ uri: selectedImage }}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                  <Text variant="bodySmall" style={styles.previewText}>
                    名刺画像が選択されました
                  </Text>
                </View>
              ) : (
                <View style={styles.placeholderContainer}>
                  <Icon name="image" size={48} color={theme.colors.onSurfaceVariant} />
                  <Text variant="bodyMedium" style={styles.placeholderText}>
                    画像を選択してください
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          <Button
            mode="contained"
            onPress={handleSubmitApplication}
            style={styles.submitButton}
            contentStyle={styles.buttonContent}
            disabled={!selectedImage}
            loading={loading}
          >
            {loading ? 'アップロード中...' : '審査を申請する'}
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

export default BusinessCardUploadScreen;
