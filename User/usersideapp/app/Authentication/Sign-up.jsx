import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

const Signin = () => {
    const router = useRouter();
    const { register } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSignUp = async () => {
        setLoading(true);
        try {
            await register(email, password);
            setLoading(false);
            router.replace('/Authentication/Login');
        } catch (err) {
            setError('Failed to sign up: ' + err.message);
            setLoading(false);
        }
    };

    return (
        <LinearGradient colors={['#2c5affff', '#7fa3dfff']} style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <Text style={styles.headerText}>Sign Up</Text>
    
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter Name"
                    placeholderTextColor="#C4C4C4"
                    value={name}
                    onChangeText={setName}
                    editable={!loading}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Enter email"
                    placeholderTextColor="#C4C4C4"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!loading}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Enter password"
                    placeholderTextColor="#C4C4C4"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    editable={!loading}
                />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={handleSignUp}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#000" />
                ) : (
                    <Text style={styles.buttonText}>Submit</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.replace('/Authentication/Login')} disabled={loading}>
                <Text style={styles.loginText}>Already have an account? Login</Text>
            </TouchableOpacity>
        </LinearGradient>
    );
}

//StyleSheet --

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
        marginBottom: 60,
        color: '#041347',
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
        backgroundColor: '#041347',
        paddingVertical: 15,
        paddingHorizontal: 50,
        borderRadius: 25,
    },
    buttonText: {
        fontFamily: 'Courier-Prime',
        fontSize: 24,
        color: '#ffffffff',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    errorText: {
        color: '#D32F2F',
        fontSize: 14,
        marginBottom: 15,
        textAlign: 'center',
    },
    loginText: {
        fontFamily: 'Courier-Prime',
        fontSize: 16,
        color: '#4E270C',
        marginTop: 15,
    },
});

export default Signin;
