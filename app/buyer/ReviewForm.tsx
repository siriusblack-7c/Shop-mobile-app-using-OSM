import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Review } from '../shared/dataStore';

interface ReviewFormProps {
    visible: boolean;
    onClose: () => void;
    onSave: (review: Omit<Review, 'id' | 'date'>) => void;
    storeId: string;
    storeName: string;
}

export default function ReviewForm({ visible, onClose, onSave, storeId, storeName }: ReviewFormProps) {
    const [buyerName, setBuyerName] = useState('');
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    const resetForm = () => {
        setBuyerName('');
        setRating(5);
        setComment('');
    };

    const handleSave = () => {
        if (!buyerName.trim() || !comment.trim()) {
            Alert.alert('Error', 'Please fill in your name and comment');
            return;
        }

        const review: Omit<Review, 'id' | 'date'> = {
            storeId,
            buyerName: buyerName.trim(),
            rating,
            comment: comment.trim(),
        };

        onSave(review);
        resetForm();
        onClose();
        Alert.alert('Success!', 'Your review has been submitted');
    };

    const handleCancel = () => {
        resetForm();
        onClose();
    };

    const renderStars = () => {
        return (
            <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                        key={star}
                        onPress={() => setRating(star)}
                        style={styles.starButton}
                    >
                        <ThemedText style={[
                            styles.star,
                            star <= rating ? styles.starFilled : styles.starEmpty
                        ]}>
                            ⭐
                        </ThemedText>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    const getRatingText = () => {
        const ratingTexts = {
            1: 'Poor',
            2: 'Fair',
            3: 'Good',
            4: 'Very Good',
            5: 'Excellent'
        };
        return ratingTexts[rating as keyof typeof ratingTexts];
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <ThemedView style={styles.overlay}>
                <ThemedView style={styles.modal}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <ThemedText type="title" style={styles.title}>Leave a Review</ThemedText>

                        <ThemedText style={styles.storeName}>for {storeName}</ThemedText>

                        {/* Buyer Name */}
                        <ThemedText style={styles.label}>Your Name *</ThemedText>
                        <TextInput
                            style={styles.input}
                            value={buyerName}
                            onChangeText={setBuyerName}
                            placeholder="Enter your name"
                            placeholderTextColor="#999"
                        />

                        {/* Rating */}
                        <ThemedText style={styles.label}>Rating *</ThemedText>
                        {renderStars()}
                        <ThemedText style={styles.ratingText}>
                            {rating} star{rating !== 1 ? 's' : ''} - {getRatingText()}
                        </ThemedText>

                        {/* Comment */}
                        <ThemedText style={styles.label}>Your Review *</ThemedText>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={comment}
                            onChangeText={setComment}
                            placeholder="Share your experience with this store..."
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={5}
                        />

                        {/* Buttons */}
                        <ThemedView style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                <ThemedText style={styles.saveButtonText}>Submit Review</ThemedText>
                            </TouchableOpacity>
                        </ThemedView>
                    </ScrollView>
                </ThemedView>
            </ThemedView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        maxHeight: '80%',
    },
    title: {
        textAlign: 'center',
        marginBottom: 8,
        color: '#333',
    },
    storeName: {
        textAlign: 'center',
        fontSize: 16,
        color: '#007AFF',
        marginBottom: 20,
        fontWeight: '600',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 12,
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
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 8,
    },
    starButton: {
        padding: 4,
    },
    star: {
        fontSize: 32,
    },
    starFilled: {
        opacity: 1,
    },
    starEmpty: {
        opacity: 0.3,
    },
    ratingText: {
        textAlign: 'center',
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        fontWeight: '500',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#007AFF',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
}); 