import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const dummyLeaderboard = [
  { id: '1', name: 'Player 1', score: 15 },
  { id: '2', name: 'Player 2', score: 12 },
  { id: '3', name: 'Player 3', score: 10 },
  { id: '4', name: 'Player 4', score: 8 },
  { id: '5', name: 'Player 5', score: 6 },
];

export default function LeaderboardScreen() {
  const renderItem = ({ item, index }) => (
    <View style={styles.leaderboardItem}>
      <Text style={styles.rank}>#{index + 1}</Text>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.score}>{item.score}</Text>
    </View>
  );

  return (
    <LinearGradient
      colors={['#1a1a1a', '#2d2d2d']}
      style={styles.container}>
      <Text style={styles.title}>Leaderboard</Text>
      <FlatList
        data={dummyLeaderboard}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
    marginTop: 40,
  },
  listContainer: {
    padding: 10,
  },
  leaderboardItem: {
    flexDirection: 'row',
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  rank: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    width: 50,
  },
  name: {
    color: '#fff',
    fontSize: 18,
    flex: 1,
  },
  score: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: 'bold',
  },
});