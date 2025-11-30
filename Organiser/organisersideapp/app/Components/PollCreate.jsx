import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { Stack, router, useRouter } from 'expo-router';

export default function PollCreate() {
    // Mock user for now
    const user = { displayName: 'Organiser' };

    const handleLogout = () => {
        router.replace('/Authentication/Login');
    };

    return (
        <LinearGradient colors={['#4E270C', '#C08E45']} style={styles.container}>
            <Stack.Screen options={{
                headerShown: false
            }} />

            <View style={styles.header}>
                <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={styles.welcomeText}>
                        Welcome, {user.displayName || 'User'}!
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

                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>History and Statistics</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}


//StyleSheet -------------------------------------------------------------------------------------
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
        color: '#AF7F3B',
        fontFamily:'JuliaMono-Light'
    },
    logoutButton: {
        backgroundColor: '#AF7F3B',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    logoutText: {
        fontSize: 14,
        color: '#FFF',
        fontFamily: 'JuliaMono-Light',
    },
    buttonContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#41200A',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    buttonText: {
        color: '#ffffffff',
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'JuliaMono-Light',
    },
});

