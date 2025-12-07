import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { Stack, router, useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function PollCreate() {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            router.replace('/Authentication/Login');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <LinearGradient colors={['#c3b3b3ff', '#fdfdfdff']} style={styles.container}>
            <Stack.Screen options={{
                headerShown: false
            }} />

            <View style={styles.header}>
                <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={styles.welcomeText}>
                        Welcome, {user?.name || user?.displayName || user?.username || 'User'}!
                    </Text>
                </View>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={() => router.push('/Components/Option')}>
                    <Text style={styles.buttonText}>Post your Question</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={() => router.push('/Components/Descriptive')}>
                    <Text style={styles.buttonText}>Post Descriptive Question</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={() => router.push('/Components/History')}>
                    <Text style={styles.buttonText}>History and Statistics</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}


//StyleSheet --
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        position: 'absolute',
        top: 50,
        width: '100%',
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: 25,
        color: '#373639ff',
        fontFamily:'Courier-Prime'
    },
    logoutButton: {
        backgroundColor: '#fff6e9ff',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    logoutText: {
        fontSize: 14,
        color: '#363437ff',
        fontFamily: 'Courier-Prime',
    },
    buttonContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#ffffffff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    buttonText: {
        color: '#383739ff',
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'Courier-Prime',
    },
});

