import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import io from 'socket.io-client';

const socket = io('http://localhost:3000'); // Replace with your server IP if needed

export default function Option() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [isLive, setIsLive] = useState(false);
    const [liveResults, setLiveResults] = useState(null);

    useEffect(() => {
        socket.on("poll_update", (data) => {
            console.log("Poll update received:", data);
            setLiveResults(data);
        });

        return () => {
            socket.off("poll_update");
        };
    }, []);

    const handleOptionChange = (text, index) => {
        const newOptions = [...options];
        newOptions[index] = text;
        setOptions(newOptions);
    };

    const addOption = () => {
        setOptions([...options, '']);
    };

    const goLive = () => {
        const pollData = {
            question: name,
            options: options.map((opt, index) => ({ id: index, text: opt }))
        };
        console.log('Going Live:', pollData);
        socket.emit("create_poll", pollData);
        setIsLive(true);
        setLiveResults({
            question: name,
            options: pollData.options.map(opt => ({ ...opt, count: 0 }))
        });
    };

    if (isLive) {
        return (
            <LinearGradient colors={['#4E270C', '#C08E45']} style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <Text style={styles.headerText}>Live Results</Text>
                <Text style={styles.questionText}>{liveResults?.question}</Text>
                
                <ScrollView style={styles.resultsContainer}>
                    {liveResults?.options.map((opt, index) => (
                        <View key={index} style={styles.resultItem}>
                            <Text style={styles.resultText}>{opt.text}</Text>
                            <Text style={styles.countText}>{opt.count} votes</Text>
                        </View>
                    ))}
                </ScrollView>

                <TouchableOpacity 
                    style={styles.button} 
                    onPress={() => {
                        console.log('Ending Poll');
                        socket.emit("end_poll");
                        setIsLive(false);
                        setLiveResults(null);
                    }}
                >
                    <Text style={styles.buttonText}>End Poll</Text>
                </TouchableOpacity>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={['#4E270C', '#C08E45']} style={styles.container}>
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
        fontFamily: 'JuliaMono-Light',
        fontSize: 48,
        marginBottom: 40,
        color: '#ffffffff',
        textAlign: 'center',
    },
    questionText: {
        fontFamily: 'JuliaMono-Light',
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
        fontFamily: 'JuliaMono-Light',
        fontSize: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#2D2D2D',
        paddingVertical: 10,
        marginBottom: 30,
        color: '#2D2D2D',
    },
    button: {
        backgroundColor: '#41200A',
        paddingVertical: 15,
        paddingHorizontal: 50,
        borderRadius: 25,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        fontFamily: 'JuliaMono-Light',
        fontSize: 24,
        color: '#ffffffff',
    },
    addButton: {
        marginBottom: 20,
        alignSelf: 'flex-start',
    },
    addButtonText: {
        fontFamily: 'JuliaMono-Light',
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
        fontFamily: 'ForemostRegular',
        fontSize: 20,
        color: '#AF7F3B',
    },
    resultsContainer: {
        width: '100%',
        maxHeight: '50%',
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
        fontFamily: 'JuliaMono-Light',
        fontSize: 18,
        color: '#ffffffff',
    },
    countText: {
        fontFamily: 'JuliaMono-Light',
        fontSize: 18,
        color: '#ffffffff',
        fontWeight: 'bold',
    },
});
