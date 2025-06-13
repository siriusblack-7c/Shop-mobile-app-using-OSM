import { ThemedView } from '@/components/ThemedView';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { UserProfile } from '../../services/firebase/authService';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthScreenProps {
    onAuthSuccess: (user: UserProfile) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
    const [isLogin, setIsLogin] = useState(true);

    const handleAuthSuccess = (user: UserProfile) => {
        onAuthSuccess(user);
    };

    return (
        <ThemedView style={styles.container}>
            {isLogin ? (
                <LoginForm
                    onLoginSuccess={handleAuthSuccess}
                    onSwitchToRegister={() => setIsLogin(false)}
                />
            ) : (
                <RegisterForm
                    onRegisterSuccess={handleAuthSuccess}
                    onSwitchToLogin={() => setIsLogin(true)}
                />
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
}); 