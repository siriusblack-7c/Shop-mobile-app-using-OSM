import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

interface Store {
    id: string;
    latitude: number;
    longitude: number;
    name: string;
    type: 'beef' | 'fish';
    price: string;
    description: string;
    sellerName: string;
}

interface StoreFormProps {
    visible: boolean;
    onClose: () => void;
    onSave: (store: Omit<Store, 'id' | 'products'>) => void;
    latitude: number;
    longitude: number;
}

export default function StoreForm({ visible, onClose, onSave, latitude, longitude }: StoreFormProps) {
    const [storeName, setStoreName] = useState('');
    const [storeType, setStoreType] = useState<'beef' | 'fish'>('beef');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [sellerName, setSellerName] = useState('');

    const handleSave = () => {
        if (!storeName || !price || !description || !sellerName) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        const store: Omit<Store, 'id' | 'products'> = {
            latitude,
            longitude,
            name: storeName,
            type: storeType,
            price,
            description,
            sellerName,
        };

        onSave(store);

        // Reset form
        setStoreName('');
        setPrice('');
        setDescription('');
        setSellerName('');
        onClose();
    };

    const handleCancel = () => {
        // Reset form
        setStoreName('');
        setPrice('');
        setDescription('');
        setSellerName('');
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <ThemedView style={styles.overlay}>
                <ThemedView style={styles.modal}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <ThemedText type="title" style={styles.title}>Add Store Details</ThemedText>

                        {/* Store Name */}
                        <ThemedText style={styles.label}>Store Name</ThemedText>
                        <TextInput
                            style={styles.input}
                            value={storeName}
                            onChangeText={setStoreName}
                            placeholder="Enter store name"
                            placeholderTextColor="#999"
                        />

                        {/* Seller Name */}
                        <ThemedText style={styles.label}>Seller Name</ThemedText>
                        <TextInput
                            style={styles.input}
                            value={sellerName}
                            onChangeText={setSellerName}
                            placeholder="Enter your name"
                            placeholderTextColor="#999"
                        />

                        {/* Store Type */}
                        <ThemedText style={styles.label}>Store Type</ThemedText>
                        <ThemedView style={styles.typeContainer}>
                            <TouchableOpacity
                                style={[styles.typeButton, storeType === 'beef' && styles.selectedType]}
                                onPress={() => setStoreType('beef')}
                            >
                                <ThemedText style={styles.typeEmoji}>🐄</ThemedText>
                                <ThemedText style={[styles.typeText, storeType === 'beef' && styles.selectedTypeText]}>
                                    Beef Store
                                </ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.typeButton, storeType === 'fish' && styles.selectedType]}
                                onPress={() => setStoreType('fish')}
                            >
                                <ThemedText style={styles.typeEmoji}>🐟</ThemedText>
                                <ThemedText style={[styles.typeText, storeType === 'fish' && styles.selectedTypeText]}>
                                    Fish Store
                                </ThemedText>
                            </TouchableOpacity>
                        </ThemedView>

                        {/* Price */}
                        <ThemedText style={styles.label}>Price Range</ThemedText>
                        <TextInput
                            style={styles.input}
                            value={price}
                            onChangeText={setPrice}
                            placeholder="e.g., $10-20"
                            placeholderTextColor="#999"
                        />

                        {/* Description */}
                        <ThemedText style={styles.label}>Description</ThemedText>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Brief description of your products"
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={3}
                        />

                        {/* Buttons */}
                        <ThemedView style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                <ThemedText style={styles.saveButtonText}>Save Store</ThemedText>
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
        marginBottom: 20,
        color: '#333',
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
        height: 80,
        textAlignVertical: 'top',
    },
    typeContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    typeButton: {
        flex: 1,
        borderWidth: 2,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
    },
    selectedType: {
        borderColor: '#007AFF',
        backgroundColor: '#E3F2FD',
    },
    typeEmoji: {
        fontSize: 24,
        marginBottom: 4,
    },
    typeText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
    },
    selectedTypeText: {
        color: '#007AFF',
        fontWeight: '600',
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