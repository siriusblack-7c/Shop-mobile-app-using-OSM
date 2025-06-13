import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { AuthService, UserProfile } from '../../services/firebase/authService';

interface RegisterFormProps {
    onRegisterSuccess: (user: UserProfile) => void;
    onSwitchToLogin: () => void;
}

export default function RegisterForm({ onRegisterSuccess, onSwitchToLogin }: RegisterFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [userType, setUserType] = useState<'buyer' | 'seller'>('buyer');
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        if (!displayName.trim()) {
            Alert.alert('Error', 'Please enter your name');
            return false;
        }
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter your email');
            return false;
        }
        if (!email.includes('@')) {
            Alert.alert('Error', 'Please enter a valid email');
            return false;
        }
        if (!password.trim()) {
            Alert.alert('Error', 'Please enter a password');
            return false;
        }
        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return false;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return false;
        }
        return true;
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const userProfile = await AuthService.register(
                email.trim(),
                password,
                displayName.trim(),
                userType
            );
            Alert.alert('Success!', `Welcome to the app, ${userProfile.displayName}!`);
            onRegisterSuccess(userProfile);
        } catch (error: any) {
            Alert.alert('Registration Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <ThemedText type="title" style={styles.title}>Join Us</ThemedText>
            <ThemedText style={styles.subtitle}>Create your account</ThemedText>

            <ThemedView style={styles.form}>
                <ThemedText style={styles.label}>Full Name</ThemedText>
                <TextInput
                    style={styles.input}
                    value={displayName}
                    onChangeText={setDisplayName}
                    placeholder="Enter your full name"
                    placeholderTextColor="#999"
                    autoCapitalize="words"
                />

                <ThemedText style={styles.label}>Email</ThemedText>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                />

                <ThemedText style={styles.label}>Password</ThemedText>
                <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter password (min 6 characters)"
                    placeholderTextColor="#999"
                    secureTextEntry
                />

                <ThemedText style={styles.label}>Confirm Password</ThemedText>
                <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm your password"
                    placeholderTextColor="#999"
                    secureTextEntry
                />

                <ThemedText style={styles.label}>Account Type</ThemedText>
                <View style={styles.userTypeContainer}>
                    <TouchableOpacity
                        style={[styles.userTypeButton, userType === 'buyer' && styles.userTypeButtonActive]}
                        onPress={() => setUserType('buyer')}
                    >
                        <ThemedText style={styles.userTypeEmoji}>🛒</ThemedText>
                        <ThemedText style={[styles.userTypeText, userType === 'buyer' && styles.userTypeTextActive]}>
                            Buyer
                        </ThemedText>
                        <ThemedText style={[styles.userTypeDesc, userType === 'buyer' && styles.userTypeDescActive]}>
                            Find and purchase products
                        </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.userTypeButton, userType === 'seller' && styles.userTypeButtonActive]}
                        onPress={() => setUserType('seller')}
                    >
                        <ThemedText style={styles.userTypeEmoji}>🏪</ThemedText>
                        <ThemedText style={[styles.userTypeText, userType === 'seller' && styles.userTypeTextActive]}>
                            Seller
                        </ThemedText>
                        <ThemedText style={[styles.userTypeDesc, userType === 'seller' && styles.userTypeDescActive]}>
                            Sell your products
                        </ThemedText>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleRegister}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <ThemedText style={styles.buttonText}>Create Account</ThemedText>
                    )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.switchButton} onPress={onSwitchToLogin}>
                    <ThemedText style={styles.switchText}>
                        Already have an account? <ThemedText style={styles.switchTextBold}>Sign In</ThemedText>
                    </ThemedText>
                </TouchableOpacity>
            </ThemedView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f8f9fa',
    },
    title: {
        textAlign: 'center',
        marginBottom: 8,
        color: '#333',
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: 40,
        color: '#666',
        fontSize: 16,
    },
    form: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 16,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
        color: '#333',
    },
    userTypeContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 8,
    },
    userTypeButton: {
        flex: 1,
        borderWidth: 2,
        borderColor: '#ddd',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
    },
    userTypeButtonActive: {
        borderColor: '#007AFF',
        backgroundColor: '#f0f8ff',
    },
    userTypeEmoji: {
        fontSize: 32,
        marginBottom: 8,
    },
    userTypeText: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
        color: '#666',
    },
    userTypeTextActive: {
        color: '#007AFF',
    },
    userTypeDesc: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
    },
    userTypeDescActive: {
        color: '#007AFF',
    },
    button: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginTop: 24,
    },
    buttonDisabled: {
        backgroundColor: '#999',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    switchButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    switchText: {
        color: '#666',
        fontSize: 14,
    },
    switchTextBold: {
        color: '#007AFF',
        fontWeight: '600',
    },
}); 