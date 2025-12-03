import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Stack } from 'expo-router';
import io from 'socket.io-client';

const socket = io('https://eventpoll-signaling-server.onrender.com'); 

export default function PollPage() {
    const [pollData, setPollData] = useState(null);
    const [hasVoted, setHasVoted] = useState(false);

    useEffect(() => {
        socket.on("new_poll", (data) => {
            console.log("New poll received:", data);
            setPollData(data);
            setHasVoted(false);
        });

        socket.on("poll_ended", () => {
            console.log("Poll ended received");
            setPollData(null);
            setHasVoted(false);
            Alert.alert("Poll Ended", "The organizer has ended the poll.");
        });

        return () => {
            socket.off("new_poll");
            socket.off("poll_ended");
        };
    }, []);

    const handleVote = (optionId) => {
        if (hasVoted) {
            Alert.alert("Already Voted", "You have already voted in this poll.");
            return;
        }
        console.log("Voting for option:", optionId);
        socket.emit("submit_vote", { optionId });
        setHasVoted(true);
        Alert.alert("Vote Submitted", "Thank you for voting!");
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <Text style={styles.title}>Live Poll User</Text>
            
            {pollData ? (
                <View style={styles.pollContainer}>
                    <Text style={styles.question}>{pollData.question}</Text>
                    <ScrollView style={styles.optionsContainer}>
                        {pollData.options.map((option) => (
                            <TouchableOpacity 
                                key={option.id} 
                                style={[styles.optionButton, hasVoted && styles.disabledButton]} 
                                onPress={() => handleVote(option.id)}
                                disabled={hasVoted}
                            >
                                <Text style={styles.optionText}>{option.text}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    {hasVoted && <Text style={styles.votedText}>Vote Submitted!</Text>}
                </View>
            ) : (
                <View style={styles.waitingContainer}>
                    <Text style={styles.status}>Status: Waiting</Text>
                    <Text style={styles.instruction}>Waiting for organizer to start a poll...</Text>
                </View>
            )}
        </View>
    );
}

//StyleSheet --

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#333',
    },
    pollContainer: {
        width: '100%',
        alignItems: 'center',
    },
    question: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 20,
        textAlign: 'center',
        color: '#444',
    },
    optionsContainer: {
        width: '100%',
        maxHeight: 300,
    },
    optionButton: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#A0A0A0',
    },
    optionText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '500',
    },
    waitingContainer: {
        alignItems: 'center',
    },
    status: {
        fontSize: 18,
        marginBottom: 10,
        color: 'gray',
    },
    instruction: {
        fontSize: 18,
        textAlign: 'center',
        color: '#666',
    },
    votedText: {
        marginTop: 20,
        fontSize: 18,
        color: 'green',
        fontWeight: 'bold',
    },
});
