import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import io from 'socket.io-client';
import { database } from '../../firebaseConfig';
import { ref, push, set, update } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const socket = io('https://eventpoll-signaling-server.onrender.com'); 

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
        

        socket.emit("create_poll", pollData);
        setIsLive(true);
        setLiveResults({
            question: name,
            options: pollData.options.map(opt => ({ ...opt, count: 0 }))
        });
    };

    if (isLive) {
        return (
            <LinearGradient colors={['#c3b3b3ff', '#fdfdfdff']} style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <Text style={styles.headerText}>Live Results</Text>
                <Text style={styles.questionText}>{liveResults?.question}</Text>
                
                <ScrollView style={styles.mainScrollView} contentContainerStyle={styles.scrollContent}>

                    <View style={styles.voteBarsSection}>
                        <Text style={styles.sectionTitle}>Vote Counts</Text>
                        {liveResults?.options.map((opt, index) => (
                            <View key={index} style={styles.resultItem}>
                                <Text style={styles.resultText}>{opt.text}</Text>
                                <Text style={styles.countText}>{opt.count} votes</Text>
                            </View>
                        ))}
                    </View>


                    <View style={styles.chartContainer}>
                        <PieChart
                            data={liveResults?.options.map((opt, index) => ({
                                name: opt.text,
                                population: opt.count,
                                color: ['#1f0124', '#540863', '#7d0a91', '#9d4edd', '#c77dff', '#e0aaff'][index % 6],
                                legendFontColor: '#202020ff',
                                legendFontSize: 14
                            })) || []}
                            width={Dimensions.get('window').width - 40}
                            height={220}
                            chartConfig={{
                                backgroundColor: 'transparent',
                                backgroundGradientFrom: 'transparent',
                                backgroundGradientTo: 'transparent',
                                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                            }}
                            accessor="population"
                            backgroundColor="transparent"
                            paddingLeft="15"
                            absolute
                        />
                    </View>
                </ScrollView>

                <TouchableOpacity 
                    style={styles.button} 
                    onPress={async () => {
                        console.log('Ending Poll');
                        
 
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
        <LinearGradient colors={['#c3b3b3ff', '#fdfdfdff']} style={styles.container}>
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
                    placeholderTextColor="#363637ff"
                    value={name}
                    onChangeText={setName} />

                {options.map((option, index) => (
                    <TextInput
                        key={index}
                        style={styles.input}
                        placeholder={`Option ${index + 1}`}
                        placeholderTextColor="#363637ff"
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


//Stylesheet--
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
        color: '#2a2a2aff',
        textAlign: 'center',
    },
    questionText: {
        fontFamily: 'Courier-Prime',
        fontSize: 24,
        marginBottom: 30,
        color: '#222222ff',
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
        backgroundColor: '#1f1f1fff',
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
        color: '#2c2b2bff',
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
        color: '#292929ff',
    },
    countText: {
        fontFamily: 'Courier-Prime',
        fontSize: 18,
        color: '#3d3d3dff',
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
        color: '#454545ff',
        marginBottom: 15,
        textAlign: 'center',
    },
});
