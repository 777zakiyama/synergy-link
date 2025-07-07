import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Card, Text, Chip, useTheme } from 'react-native-paper';
import { User } from '../services/types';

interface ProfileCardProps {
  user: User;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user }) => {
  const { profile } = user;
  const theme = useTheme();
  
  if (!profile) {
    return null;
  }

  const displayTags = profile.tags?.slice(0, 3) || [];

  const styles = StyleSheet.create({
    card: {
      flex: 1,
      borderRadius: 16,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      backgroundColor: theme.colors.surface,
    },
    imageContainer: {
      height: 300,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      overflow: 'hidden',
    },
    profileImage: {
      width: '100%',
      height: '100%',
    },
    placeholderImage: {
      width: '100%',
      height: '100%',
      backgroundColor: theme.colors.outlineVariant,
      justifyContent: 'center',
      alignItems: 'center',
    },
    placeholderText: {
      color: theme.colors.onSurfaceVariant,
      fontWeight: 'bold',
    },
    content: {
      padding: 20,
    },
    name: {
      fontWeight: 'bold',
      marginBottom: 4,
      color: theme.colors.onSurface,
    },
    position: {
      color: theme.colors.primary,
      marginBottom: 2,
      fontWeight: '600',
    },
    company: {
      color: theme.colors.onSurfaceVariant,
      marginBottom: 12,
    },
    bio: {
      color: theme.colors.onSurface,
      lineHeight: 20,
      marginBottom: 16,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    tag: {
      backgroundColor: theme.colors.outlineVariant,
    },
    tagText: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
  });

  return (
    <Card style={styles.card}>
      <View style={styles.imageContainer}>
        {profile.profileImageUrl ? (
          <Image
            source={{ uri: profile.profileImageUrl }}
            style={styles.profileImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text variant="headlineLarge" style={styles.placeholderText}>
              {profile.fullName?.charAt(0) || '?'}
            </Text>
          </View>
        )}
      </View>
      
      <Card.Content style={styles.content}>
        <Text variant="headlineSmall" style={styles.name}>
          {profile.fullName}
        </Text>
        
        <Text variant="titleMedium" style={styles.position}>
          {profile.position}
        </Text>
        
        <Text variant="bodyMedium" style={styles.company}>
          {profile.companyName}
        </Text>
        
        {profile.bio && (
          <Text variant="bodySmall" style={styles.bio} numberOfLines={3}>
            {profile.bio}
          </Text>
        )}
        
        {displayTags.length > 0 && (
          <View style={styles.tagsContainer}>
            {displayTags.map((tag, index) => (
              <Chip key={index} style={styles.tag} textStyle={styles.tagText}>
                {tag}
              </Chip>
            ))}
          </View>
        )}
      </Card.Content>
    </Card>
  );
};


export default ProfileCard;
