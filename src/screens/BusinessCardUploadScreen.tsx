import React, { useState } from 'react';
import { View, StyleSheet, Image, Alert } from 'react-native';
import { Button, Text, Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { launchImageLibrary, launchCamera, ImagePickerResponse, CameraOptions, ImageLibraryOptions } from 'react-native-image-picker';

type BusinessCardUploadScreenNavigationProp = StackNavigationProp<RootStackParamList, 'BusinessCardUpload'>;

interface BusinessCardUploadScreenProps {
  navigation: BusinessCardUploadScreenNavigationProp;
}

const BusinessCardUploadScreen: React.FC<BusinessCardUploadScreenProps> = ({ navigation }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageSelection = () => {
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
      if (response.assets && response.assets[0]) {
        setSelectedImage(response.assets[0].uri!);
      }
    });
  };

  const handleSubmitApplication = async () => {
    if (!selectedImage) {
      Alert.alert('エラー', '名刺画像を選択してください');
      return;
    }

    try {
      const { auth, uploadBusinessCard } = await import('../services/firebase');
      
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('エラー', 'ユーザーが認証されていません');
        return;
      }

      console.log('Uploading business card for user:', currentUser.uid);
      
      const result = await uploadBusinessCard(currentUser.uid, selectedImage);
      
      if (result.success) {
        console.log('Business card uploaded successfully:', result.downloadURL);
        navigation.navigate('PendingReview');
      } else {
        Alert.alert('エラー', `アップロードに失敗しました: ${result.error}`);
      }
    } catch (error) {
      console.log('Upload error:', error);
      Alert.alert('エラー', 'アップロード中にエラーが発生しました');
    }
  };

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
                  <Icon name="image" size={48} color="#ccc" />
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
          >
            審査を申請する
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  card: {
    elevation: 4,
    borderRadius: 12,
  },
  content: {
    padding: 24,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
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
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
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
    color: '#666',
  },
  placeholderContainer: {
    alignItems: 'center',
    padding: 32,
  },
  placeholderText: {
    marginTop: 12,
    color: '#ccc',
  },
  submitButton: {
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

export default BusinessCardUploadScreen;
