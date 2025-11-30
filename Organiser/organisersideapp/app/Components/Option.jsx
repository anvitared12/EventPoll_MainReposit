import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';

export default function Option() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [options, setOptions] = useState(['', '']);

    const handleOptionChange = (text, index) => {
        const newOptions = [...options];
        newOptions[index] = text;
        setOptions(newOptions);
    };

    const addOption = () => {
        setOptions([...options, '']);
    };

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

                <TouchableOpacity style={styles.button} onPress={() => console.log('Create a Poll', { question: name, options })}>
                    <Text style={styles.buttonText}>Go Live</Text>
                </TouchableOpacity>
            </View>

        </LinearGradient>
    );
}

//StyleSheet -------------------------------------------------------------------------------------

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
        marginBottom: 60,
        color: '#ffffffff',
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
    },
    backButtonText: {
        fontFamily: 'ForemostRegular',
        fontSize: 20,
        color: '#AF7F3B',
    },
});
