import { Alert } from 'react-native';

export const showErrorAlert = (title: string, message?: string) => {
  Alert.alert(title, message || '予期しないエラーが発生しました。時間をおいて再度お試しください。');
};

export const showSuccessAlert = (title: string, message?: string, onPress?: () => void) => {
  Alert.alert(title, message, onPress ? [{ text: 'OK', onPress }] : undefined);
};

export const showConfirmAlert = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
) => {
  Alert.alert(
    title,
    message,
    [
      { text: 'キャンセル', style: 'cancel', onPress: onCancel },
      { text: '確認', onPress: onConfirm },
    ]
  );
};

export const showValidationAlert = (message: string) => {
  Alert.alert('入力エラー', message);
};

export const showNetworkErrorAlert = () => {
  Alert.alert(
    '通信エラー',
    'ネットワーク接続を確認して、時間をおいて再度お試しください。'
  );
};
