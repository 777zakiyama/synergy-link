import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import { User } from '../services/types';

interface ProfileCardProps {
  user: User;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user }) => {
  const { profile } = user;
  
  if (!profile) {
    return null;
  }

  const displayTags = profile.tags?.slice(0, 3) || [];

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
    backgroundColor: 'white',
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
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  name: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  position: {
    color: '#6200ee',
    marginBottom: 2,
    fontWeight: '600',
  },
  company: {
    color: '#666',
    marginBottom: 12,
  },
  bio: {
    color: '#444',
    lineHeight: 20,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f0f0f0',
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
});

export default ProfileCard;
