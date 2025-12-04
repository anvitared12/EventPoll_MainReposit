import { View, Text , StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Login = () => {
    const router = useRouter();
    const { login } = useAuth();
    const [Lemail, LsetEmail] = useState('');
    const [Lpassword, setLpassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');


    const handleLogin = async () => {
        setLoading(true);
        try {
            await login(Lemail, Lpassword);
            setLoading(false);
            router.replace('/components/PollPage');
        } catch (err) {
            setError('Failed to login: ' + err.message);
            setLoading(false);
        }
    };

    return (
        <LinearGradient colors={['#7c767694', '#ffffffff']} style={styles.container}>
            <Stack.Screen options={{
                headerShown: false
            }} />

            <Text style={styles.headerText}>Login</Text>

            <View style={styles.inputContainer}>

                <TextInput
                    style={styles.input}
                    placeholder="Enter Email"
                    placeholderTextColor="#000000ff"
                    value={Lemail}
                    onChangeText={LsetEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!loading}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Enter password"
                    placeholderTextColor="#000000ff"
                    value={Lpassword}
                    onChangeText={setLpassword}
                    secureTextEntry
                    editable={!loading}
                />

            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={handleLogin}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#000" />
                ) : (
                    <Text style={styles.buttonText}>Submit</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.replace('/Authentication/Sign-up')} disabled={loading}>
                <Text style={styles.signUpText}>Don't have an account? Sign Up</Text>
            </TouchableOpacity>

        </LinearGradient>
    )
}

export default Login;


// StyleSheet --

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
        color: '#2c2c2cff',
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
        backgroundColor: '#2c2c2cff',
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
        fontSize: 18,
        marginBottom: 15,
        textAlign: 'center',
    },
    signUpText: {
        fontFamily: 'Courier-Prime',
        fontSize: 16,
        color: '#2D2D2D',
        marginTop: 15,
    },
});