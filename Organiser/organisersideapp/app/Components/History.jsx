import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { database } from '../../firebaseConfig';
import { ref, onValue, off } from 'firebase/database';
import { useAuth } from '../context/AuthContext';

export default function History() {
    const router = useRouter();
    const { user } = useAuth();
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedPoll, setExpandedPoll] = useState(null);

    useEffect(() => {
        if (!user) {
            router.replace('/Authentication/Login');
            return;
        }

        const userPollsRef = ref(database, `userPolls/${user.uid}`);
        
        const unsubscribe = onValue(userPollsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const pollsArray = Object.entries(data).map(([id, poll]) => ({
                    id,
                    ...poll
                }));
                pollsArray.sort((a, b) => b.createdAt - a.createdAt);
                setPolls(pollsArray);
            } else {
                setPolls([]);
            }
            setLoading(false);
        });

        return () => {
            off(userPollsRef);
        };
    }, [user]);

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const calculatePercentage = (count, total) => {
        if (total === 0) return 0;
        return ((count / total) * 100).toFixed(1);
    };

    const toggleExpand = (pollId) => {
        setExpandedPoll(expandedPoll === pollId ? null : pollId);
    };

    if (loading) {
        return (
            <LinearGradient colors={['#c3b3b3ff', '#fdfdfdff']} style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <ActivityIndicator size="large" color="#ffffffff" />
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

            <Text style={styles.headerText}>History & Statistics</Text>

            {polls.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No polls created yet</Text>
                    <Text style={styles.emptySubtext}>Create your first poll to see it here!</Text>
                </View>
            ) : (
                <ScrollView style={styles.pollsList} contentContainerStyle={styles.pollsListContent}>
                    {polls.map((poll) => (
                        <View key={poll.id} style={styles.pollCard}>
                            <TouchableOpacity onPress={() => toggleExpand(poll.id)}>
                                <View style={styles.pollHeader}>
                                    <View style={styles.pollHeaderLeft}>
                                        <Text style={styles.pollQuestion}>{poll.question}</Text>
                                        <Text style={styles.pollDate}>{formatDate(poll.createdAt)}</Text>
                                    </View>
                                    <View style={styles.pollHeaderRight}>
                                        <View style={[styles.statusBadge, poll.status === 'live' ? styles.statusLive : styles.statusEnded]}>
                                            <Text style={styles.statusText}>{poll.status === 'live' ? 'Live' : 'Ended'}</Text>
                                        </View>
                                        <Text style={styles.totalVotes}>{poll.totalVotes || 0} votes</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>

                            {expandedPoll === poll.id && (
                                <View style={styles.pollDetails}>
                                    <Text style={styles.detailsHeader}>Results:</Text>
                                    {poll.options.map((option, index) => (
                                        <View key={index} style={styles.optionRow}>
                                            <View style={styles.optionInfo}>
                                                <Text style={styles.optionText}>{option.text}</Text>
                                                <Text style={styles.optionCount}>{option.count} votes ({calculatePercentage(option.count, poll.totalVotes || 0)}%)</Text>
                                            </View>
                                            <View style={styles.progressBarContainer}>
                                                <View 
                                                    style={[
                                                        styles.progressBar, 
                                                        { width: `${calculatePercentage(option.count, poll.totalVotes || 0)}%` }
                                                    ]} 
                                                />
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    ))}
                </ScrollView>
            )}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
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
        color: '#373639ff',
    },
    headerText: {
        fontFamily: 'Courier-Prime',
        fontSize: 36,
        marginTop: 80,
        marginBottom: 30,
        color: '#232323ff',
        textAlign: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontFamily: 'Courier-Prime',
        fontSize: 24,
        color: '#373639ff',
        marginBottom: 10,
    },
    emptySubtext: {
        fontFamily: 'Courier-Prime',
        fontSize: 16,
        color: 'rgba(43, 43, 43, 0.7)',
    },
    pollsList: {
        flex: 1,
    },
    pollsListContent: {
        paddingBottom: 20,
    },
    pollCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
    },
    pollHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    pollHeaderLeft: {
        flex: 1,
        marginRight: 10,
    },
    pollHeaderRight: {
        alignItems: 'flex-end',
    },
    pollQuestion: {
        fontFamily: 'Courier-Prime',
        fontSize: 20,
        color: '#272626ff',
        marginBottom: 5,
    },
    pollDate: {
        fontFamily: 'Courier-Prime',
        fontSize: 14,
        color: 'rgba(37, 37, 37, 0.7)',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 5,
    },
    statusLive: {
        backgroundColor: '#4CAF50',
    },
    statusEnded: {
        backgroundColor: '#757575',
    },
    statusText: {
        fontFamily: 'Courier-Prime',
        fontSize: 12,
        color: '#222222ff',
        fontWeight: 'bold',
    },
    totalVotes: {
        fontFamily: 'Courier-Prime',
        fontSize: 14,
        color: '#222222ff',
    },
    pollDetails: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.2)',
    },
    detailsHeader: {
        fontFamily: 'Courier-Prime',
        fontSize: 18,
        color: '#222222ff',
        marginBottom: 10,
        fontWeight: 'bold',
    },
    optionRow: {
        marginBottom: 15,
    },
    optionInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    optionText: {
        fontFamily: 'Courier-Prime',
        fontSize: 16,
        color: '#222222ff',
    },
    optionCount: {
        fontFamily: 'Courier-Prime',
        fontSize: 14,
        color: '#222222ff',
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#4CAF50',
        borderRadius: 4,
    },
});
