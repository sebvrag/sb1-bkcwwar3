import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { clubs } from '../../data/clubs';
import { playerConnections } from '../../data/playerConnections';

const INITIAL_TIME = 15; // secondes
const TIME_BONUS = 5; // secondes
const MAX_TIME = 15; // temps maximum

export default function GameScreen() {
  const [club1, setClub1] = useState(clubs[0]);
  const [club2, setClub2] = useState(clubs[1]);
  const [answer, setAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const timerAnimation = useRef(new Animated.Value(1)).current;
  const inputRef = useRef(null);

  const selectRandomClubs = () => {
    const availableClubs = [...clubs];
    const randomIndex1 = Math.floor(Math.random() * availableClubs.length);
    const club1 = availableClubs[randomIndex1];
    availableClubs.splice(randomIndex1, 1);
    const randomIndex2 = Math.floor(Math.random() * availableClubs.length);
    const club2 = availableClubs[randomIndex2];
    
    setClub1(club1);
    setClub2(club2);
  };

  const startGame = () => {
    selectRandomClubs();
    setTimeLeft(INITIAL_TIME);
    setIsPlaying(true);
    setAnswer('');
    setScore(0);
    setGameOver(false);
    
    // Start timer animation
    Animated.timing(timerAnimation, {
      toValue: 0,
      duration: INITIAL_TIME * 1000,
      useNativeDriver: true,
    }).start();
  };

  const checkAnswer = () => {
    if (!answer.trim()) return;

    const normalizedAnswer = answer.trim().toLowerCase();
    const club1Players = playerConnections[club1?.name]?.[club2?.name] || [];
    const club2Players = playerConnections[club2?.name]?.[club1?.name] || [];
    
    const playerExists = [...club1Players, ...club2Players].some(
      player => player.toLowerCase() === normalizedAnswer
    );

    if (playerExists) {
      // Ajouter du temps bonus sans dépasser le maximum
      setTimeLeft(prevTime => Math.min(prevTime + TIME_BONUS, MAX_TIME));
      setScore(prev => prev + 1);
      selectRandomClubs();
      setAnswer('');
      
      // Reset and restart timer animation
      timerAnimation.setValue(1);
      Animated.timing(timerAnimation, {
        toValue: 0,
        duration: timeLeft * 1000,
        useNativeDriver: true,
      }).start();
    }
  };

  useEffect(() => {
    let timer;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsPlaying(false);
            setGameOver(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  return (
    <LinearGradient
      colors={['#1a1a1a', '#2d2d2d']}
      style={styles.container}>
      {!isPlaying ? (
        <View style={styles.startContainer}>
          <View style={styles.contentContainer}>
            {gameOver ? (
              <>
                <Text style={styles.title}>Game Over!</Text>
                <Text style={styles.subtitle}>Score: {score}</Text>
              </>
            ) : (
              <>
                <Text style={styles.title}>Football Connections</Text>
                <Text style={styles.subtitle}>
                  Trouvez les joueurs qui ont joué dans les deux clubs !
                </Text>
                <Text style={styles.rules}>
                  Vous avez 15 secondes pour trouver un joueur qui a joué dans les deux clubs affichés.
                  {'\n\n'}
                  +5 secondes par bonne réponse !
                </Text>
              </>
            )}
            <TouchableOpacity
              style={styles.startButton}
              onPress={startGame}>
              <Text style={styles.startButtonText}>
                {gameOver ? 'Rejouer' : 'Commencer'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <View style={styles.scoreContainer}>
              <Ionicons name="trophy" size={24} color="#FFD700" />
              <Text style={styles.scoreText}>{score}</Text>
            </View>
            <View style={styles.timerContainer}>
              <Animated.View
                style={[
                  styles.timerBar,
                  {
                    transform: [
                      {
                        scaleX: timerAnimation,
                      },
                    ],
                  },
                ]}
              />
              <Text style={styles.timerText}>{timeLeft}s</Text>
            </View>
          </View>

          <View style={styles.clubsContainer}>
            <View style={styles.club}>
              <Text style={styles.clubName}>{club1?.name}</Text>
            </View>
            <Text style={styles.vsText}>VS</Text>
            <View style={styles.club}>
              <Text style={styles.clubName}>{club2?.name}</Text>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Entrez le nom du joueur..."
              placeholderTextColor="#666"
              value={answer}
              onChangeText={setAnswer}
              onSubmitEditing={checkAnswer}
            />
            <TouchableOpacity
              style={styles.submitButton}
              onPress={checkAnswer}>
              <Text style={styles.submitButtonText}>Valider</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: '#888',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 28,
  },
  rules: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    width: '80%',
    maxWidth: 300,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 40,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  timerContainer: {
    width: 100,
    height: 30,
    backgroundColor: '#333',
    borderRadius: 15,
    overflow: 'hidden',
  },
  timerBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    position: 'absolute',
    left: 0,
    right: 0,
  },
  timerText: {
    color: '#fff',
    textAlign: 'center',
    lineHeight: 30,
    fontSize: 16,
    fontWeight: 'bold',
  },
  clubsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  club: {
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 15,
    width: '40%',
  },
  clubName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  vsText: {
    color: '#888',
    fontSize: 24,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    marginRight: 10,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});