import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import io from 'socket.io-client';
import { database } from '../../firebaseConfig';
import { ref, push, set, update, onValue, off } from 'firebase/database';
import { useAuth } from '../context/AuthContext';

const socket = io('https://eventpoll-signaling-server.onrender.com');

export default function Descriptive() {
    const router = useRouter();
    const { user } = useAuth();
    const [question, setQuestion] = useState('');
    const [isLive, setIsLive] = useState(false);
    const [currentPollId, setCurrentPollId] = useState(null);
    const [answers, setAnswers] = useState([]);

    useEffect(() => {
        if (isLive && currentPollId && user) {
            const answersRef = ref(database, `userPolls/${user.uid}/${currentPollId}/answers`);
            
            const unsubscribe = onValue(answersRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const loadedAnswers = Object.values(data);
                    setAnswers(loadedAnswers.reverse()); // Newest first
                } else {
                    setAnswers([]);
                }
            });

            const handleNewAnswer = (data) => {
                if (data.pollId === currentPollId) {
                    push(answersRef, {
                        text: data.text,
                        createdAt: data.createdAt
                    });
                }
            };

            socket.on("receive_descriptive_vote", handleNewAnswer);

            return () => {
                off(answersRef);
                socket.off("receive_descriptive_vote", handleNewAnswer);
            };
        }
    }, [isLive, currentPollId, user]);

    const goLive = async () => {
        if (!question.trim()) {
            alert("Please enter a question");
            return;
        }

        if (user) {
            const userPollsRef = ref(database, `userPolls/${user.uid}`);
            const newPollRef = push(userPollsRef);
            const pollId = newPollRef.key;
            
            const pollData = {
                question: question,
                type: 'descriptive',
                createdAt: Date.now(),
                status: 'live',
                answers: {}
            };

            await set(newPollRef, pollData);
            
            setCurrentPollId(pollId);
            setIsLive(true);

            // Emit to socket so User App knows there is a new poll
            // Include pollId and organizerId so User App can write to Firebase
            socket.emit("create_poll", {
                question: question,
                type: 'descriptive',
                pollId: pollId,
                organizerId: user.uid
            });
        }
    };

    const endPoll = async () => {
        if (currentPollId && user) {
            const pollRef = ref(database, `userPolls/${user.uid}/${currentPollId}`);
            await update(pollRef, {
                status: 'ended'
            });
        }
        
        socket.emit("end_poll");
        setIsLive(false);
        setAnswers([]);
        setCurrentPollId(null);
        router.replace('/Components/PollCreate');
    };

    if (isLive) {
        return (
            <LinearGradient colors={['#c3b3b3ff', '#fdfdfdff']} style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <Text style={styles.headerText}>Live Responses</Text>
                <Text style={styles.questionText}>{question}</Text>
                
                <View style={styles.answersContainer}>
                    <FlatList
                        data={answers}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.answerItem}>
                                <Text style={styles.answerText}>{item.text}</Text>
                            </View>
                        )}
                        ListEmptyComponent={<Text style={styles.waitingText}>Waiting for responses...</Text>}
                    />
                </View>

                <TouchableOpacity style={styles.button} onPress={endPoll}>
                    <Text style={styles.buttonText}>End Poll</Text>
                </TouchableOpacity>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={['#c3b3b3ff', '#fdfdfdff']} style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => router.replace('/Components/PollCreate')}
            >
                <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>

            <Text style={styles.headerText}>Descriptive Question</Text>
            
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your question"
                    placeholderTextColor="#363637ff"
                    value={question}
                    onChangeText={setQuestion}
                    multiline
                />

                <TouchableOpacity style={styles.button} onPress={goLive}>
                    <Text style={styles.buttonText}>Go Live</Text>
                </TouchableOpacity>
            </View>

        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
        justifyContent: 'center',
    },
    headerText: {
        fontFamily: 'Courier-Prime',
        fontSize: 32,
        marginTop: 60,
        marginBottom: 30,
        color: '#2a2a2aff',
        textAlign: 'center',
    },
    questionText: {
        fontFamily: 'Courier-Prime',
        fontSize: 24,
        marginBottom: 20,
        color: '#222222ff',
        textAlign: 'center',
        paddingHorizontal: 10,
    },
    inputContainer: {
        width: '100%',
        alignItems: 'center',
    },
    input: {
        fontFamily: 'Courier-Prime',
        fontSize: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#2D2D2D',
        paddingVertical: 10,
        marginBottom: 40,
        color: '#2D2D2D',
        width: '100%',
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#1f1f1fff',
        paddingVertical: 15,
        paddingHorizontal: 50,
        borderRadius: 25,
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonText: {
        fontFamily: 'Courier-Prime',
        fontSize: 24,
        color: '#ffffffff',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        padding: 10,
        zIndex: 10,
    },
    backButtonText: {
        fontFamily: 'Courier-Prime',
        fontSize: 20,
        color: '#363637ff',
    },
    answersContainer: {
        flex: 1,
        width: '100%',
        marginBottom: 20,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 10,
        padding: 10,
    },
    answerItem: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#540863',
    },
    answerText: {
        fontFamily: 'Courier-Prime',
        fontSize: 16,
        color: '#333',
    },
    waitingText: {
        fontFamily: 'Courier-Prime',
        textAlign: 'center',
        marginTop: 20,
        fontStyle: 'italic',
        color: '#666',
    },
});
