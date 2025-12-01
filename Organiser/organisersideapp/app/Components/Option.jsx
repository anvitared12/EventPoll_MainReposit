import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import io from 'socket.io-client';
import { database } from '../../firebaseConfig';
import { ref, push, set, update } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { Chart } from 'react-google-charts';

const socket = io('http://localhost:3000'); // Replace with your server IP if needed

export default function Option() {
    const router = useRouter();
    const { user } = useAuth();
    const [name, setName] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [isLive, setIsLive] = useState(false);
    const [liveResults, setLiveResults] = useState(null);
    const [currentPollId, setCurrentPollId] = useState(null);

    useEffect(() => {
        socket.on("poll_update", (data) => {
            console.log("Poll update received:", data);
            setLiveResults(data);
            
            // Update Firebase with new vote counts
            if (currentPollId && user) {
                const pollRef = ref(database, `userPolls/${user.uid}/${currentPollId}`);
                const totalVotes = data.options.reduce((sum, opt) => sum + opt.count, 0);
                update(pollRef, {
                    options: data.options,
                    totalVotes: totalVotes
                });
            }
        });

        return () => {
            socket.off("poll_update");
        };
    }, [currentPollId, user]);

    const handleOptionChange = (text, index) => {
        const newOptions = [...options];
        newOptions[index] = text;
        setOptions(newOptions);
    };

    const addOption = () => {
        setOptions([...options, '']);
    };

    const goLive = async () => {
        const pollData = {
            question: name,
            options: options.map((opt, index) => ({ id: index, text: opt }))
        };
        console.log('Going Live:', pollData);
        
        // Save to Firebase
        if (user) {
            const userPollsRef = ref(database, `userPolls/${user.uid}`);
            const newPollRef = push(userPollsRef);
            const pollId = newPollRef.key;
            
            await set(newPollRef, {
                question: name,
                options: pollData.options.map(opt => ({ ...opt, count: 0 })),
                createdAt: Date.now(),
                status: 'live',
                totalVotes: 0
            });
            
            setCurrentPollId(pollId);
        }
        
        // Emit to socket for real-time updates
        socket.emit("create_poll", pollData);
        setIsLive(true);
        setLiveResults({
            question: name,
            options: pollData.options.map(opt => ({ ...opt, count: 0 }))
        });
    };

    if (isLive) {
        return (
            <LinearGradient colors={['#540863', '#fdfdfdff']} style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <Text style={styles.headerText}>Live Results</Text>
                <Text style={styles.questionText}>{liveResults?.question}</Text>
                
                <ScrollView style={styles.mainScrollView} contentContainerStyle={styles.scrollContent}>
                    {/* Vote Count Bars */}
                    <View style={styles.voteBarsSection}>
                        <Text style={styles.sectionTitle}>Vote Counts</Text>
                        {liveResults?.options.map((opt, index) => (
                            <View key={index} style={styles.resultItem}>
                                <Text style={styles.resultText}>{opt.text}</Text>
                                <Text style={styles.countText}>{opt.count} votes</Text>
                            </View>
                        ))}
                    </View>

                    {/* Pie Chart */}
                    <View style={styles.chartContainer}>
                        <Chart
                            chartType="PieChart"
                            data={[
                                ["Option", "Votes"],
                                ...liveResults?.options.map(opt => [opt.text, opt.count]) || []
                            ]}
                            options={{
                                title: "Vote Distribution",
                                pieHole: 0,
                                is3D: false,
                                colors: ['#1f0124', '#540863', '#7d0a91', '#9d4edd', '#c77dff', '#e0aaff'],
                                backgroundColor: 'transparent',
                                titleTextStyle: {
                                    color: '#ffffff',
                                    fontSize: 20,
                                    fontFamily: 'Courier-Prime'
                                },
                                legend: {
                                    textStyle: {
                                        color: '#ffffff',
                                        fontSize: 14,
                                        fontFamily: 'Courier-Prime'
                                    }
                                }
                            }}
                            width={"100%"}
                            height={"300px"}
                        />
                    </View>
                </ScrollView>

                <TouchableOpacity 
                    style={styles.button} 
                    onPress={async () => {
                        console.log('Ending Poll');
                        
                        // Update Firebase status to 'ended'
                        if (currentPollId && user) {
                            const pollRef = ref(database, `userPolls/${user.uid}/${currentPollId}`);
                            await update(pollRef, {
                                status: 'ended'
                            });
                        }
                        
                        socket.emit("end_poll");
                        setIsLive(false);
                        setLiveResults(null);
                        setCurrentPollId(null);
                    }}
                >
                    <Text style={styles.buttonText}>End Poll</Text>
                </TouchableOpacity>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={['#540863', '#fdfdfdff']} style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => router.replace('/Components/PollCreate')}
            >
                <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>

            <Text style={styles.headerText}>Optional Poll</Text>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your question"
                    placeholderTextColor="#C4C4C4"
                    value={name}
                    onChangeText={setName} />

                {options.map((option, index) => (
                    <TextInput
                        key={index}
                        style={styles.input}
                        placeholder={`Option ${index + 1}`}
                        placeholderTextColor="#C4C4C4"
                        value={option}
                        onChangeText={(text) => handleOptionChange(text, index)}
                    />
                ))}

                <TouchableOpacity style={styles.addButton} onPress={addOption}>
                    <Text style={styles.addButtonText}>+ Add Option</Text>
                </TouchableOpacity>

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
        justifyContent: 'center',
        padding: 20,
    },
    headerText: {
        fontFamily: 'Courier-Prime',
        fontSize: 48,
        marginBottom: 40,
        color: '#ffffffff',
        textAlign: 'center',
    },
    questionText: {
        fontFamily: 'Courier-Prime',
        fontSize: 24,
        marginBottom: 30,
        color: '#ffffffff',
        textAlign: 'center',
    },
    inputContainer: {
        width: '100%',
        marginBottom: 50,
    },
    input: {
        fontFamily: 'Courier-Prime',
        fontSize: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#2D2D2D',
        paddingVertical: 10,
        marginBottom: 30,
        color: '#2D2D2D',
    },
    button: {
        backgroundColor: '#1f0124ff',
        paddingVertical: 15,
        paddingHorizontal: 50,
        borderRadius: 25,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        fontFamily: 'Courier-Prime',
        fontSize: 24,
        color: '#ffffffff',
    },
    addButton: {
        marginBottom: 20,
        alignSelf: 'flex-start',
    },
    addButtonText: {
        fontFamily: 'Courier-Prime',
        fontSize: 18,
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
        color: '#240056ff',
    },
    resultsContainer: {
        width: '100%',
        maxHeight: '30%',
        marginBottom: 15,
    },
    resultItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    resultText: {
        fontFamily: 'Courier-Prime',
        fontSize: 18,
        color: '#ffffffff',
    },
    countText: {
        fontFamily: 'Courier-Prime',
        fontSize: 18,
        color: '#ffffffff',
        fontWeight: 'bold',
    },
    chartContainer: {
        width: '100%',
        marginTop: 20,
        marginBottom: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 15,
        padding: 15,
    },
    mainScrollView: {
        flex: 1,
        width: '100%',
        marginBottom: 20,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    voteBarsSection: {
        width: '100%',
        marginBottom: 20,
    },
    sectionTitle: {
        fontFamily: 'Courier-Prime',
        fontSize: 22,
        color: '#ffffffff',
        marginBottom: 15,
        textAlign: 'center',
    },
});
