import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

export interface Product {
    id: string;
    name: string;
    price: string;
    description: string;
    picture?: string; // URI to the image
}

interface ProductFormProps {
    visible: boolean;
    onClose: () => void;
    onSave: (product: Omit<Product, 'id'>) => void;
    editProduct?: Product; // For editing existing products
}

export default function ProductForm({ visible, onClose, onSave, editProduct }: ProductFormProps) {
    const [name, setName] = useState(editProduct?.name || '');
    const [price, setPrice] = useState(editProduct?.price || '');
    const [description, setDescription] = useState(editProduct?.description || '');
    const [picture, setPicture] = useState(editProduct?.picture || '');

    const resetForm = () => {
        setName('');
        setPrice('');
        setDescription('');
        setPicture('');
    };

    const handleSave = () => {
        if (!name || !price || !description) {
            Alert.alert('Error', 'Please fill in all required fields (name, price, description)');
            return;
        }

        const product: Omit<Product, 'id'> = {
            name,
            price,
            description,
            picture: picture || undefined,
        };

        onSave(product);
        resetForm();
        onClose();
    };

    const handleCancel = () => {
        resetForm();
        onClose();
    };

    const pickImage = async () => {
        // Request permission to access media library
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert('Permission Required', 'Permission to access camera roll is required to add photos!');
            return;
        }

        // Launch image picker
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        });

        if (!result.canceled && result.assets[0]) {
            setPicture(result.assets[0].uri);
        }
    };

    const takePicture = async () => {
        // Request permission to access camera
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert('Permission Required', 'Permission to access camera is required to take photos!');
            return;
        }

        // Launch camera
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        });

        if (!result.canceled && result.assets[0]) {
            setPicture(result.assets[0].uri);
        }
    };

    const showImageOptions = () => {
        Alert.alert(
            'Add Photo',
            'Choose how you want to add a photo',
            [
                { text: 'Camera', onPress: takePicture },
                { text: 'Photo Library', onPress: pickImage },
                { text: 'Cancel', style: 'cancel' }
            ]
        );
    };

    const removePicture = () => {
        setPicture('');
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <ThemedView style={styles.overlay}>
                <ThemedView style={styles.modal}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <ThemedText type="title" style={styles.title}>
                            {editProduct ? 'Edit Product' : 'Add Product'}
                        </ThemedText>

                        {/* Product Name */}
                        <ThemedText style={styles.label}>Product Name *</ThemedText>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter product name"
                            placeholderTextColor="#999"
                        />

                        {/* Price */}
                        <ThemedText style={styles.label}>Price *</ThemedText>
                        <TextInput
                            style={styles.input}
                            value={price}
                            onChangeText={setPrice}
                            placeholder="e.g., $15.99"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                        />

                        {/* Description */}
                        <ThemedText style={styles.label}>Description *</ThemedText>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Describe your product"
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={4}
                        />

                        {/* Picture Section */}
                        <ThemedText style={styles.label}>Product Photo</ThemedText>
                        {picture ? (
                            <ThemedView style={styles.imageContainer}>
                                <Image source={{ uri: picture }} style={styles.productImage} />
                                <ThemedView style={styles.imageActions}>
                                    <TouchableOpacity style={styles.changeImageButton} onPress={showImageOptions}>
                                        <ThemedText style={styles.changeImageText}>📷 Change Photo</ThemedText>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.removeImageButton} onPress={removePicture}>
                                        <ThemedText style={styles.removeImageText}>🗑️ Remove</ThemedText>
                                    </TouchableOpacity>
                                </ThemedView>
                            </ThemedView>
                        ) : (
                            <TouchableOpacity style={styles.addImageButton} onPress={showImageOptions}>
                                <ThemedText style={styles.addImageIcon}>📷</ThemedText>
                                <ThemedText style={styles.addImageText}>Add Photo</ThemedText>
                                <ThemedText style={styles.addImageSubtext}>Tap to take photo or choose from library</ThemedText>
                            </TouchableOpacity>
                        )}

                        {/* Buttons */}
                        <ThemedView style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                <ThemedText style={styles.saveButtonText}>
                                    {editProduct ? 'Update Product' : 'Save Product'}
                                </ThemedText>
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
        maxHeight: '90%',
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
        height: 100,
        textAlignVertical: 'top',
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    productImage: {
        width: 200,
        height: 150,
        borderRadius: 8,
        marginBottom: 12,
    },
    imageActions: {
        flexDirection: 'row',
        gap: 12,
    },
    changeImageButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    changeImageText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    removeImageButton: {
        backgroundColor: '#FF3B30',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    removeImageText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    addImageButton: {
        borderWidth: 2,
        borderColor: '#ddd',
        borderStyle: 'dashed',
        borderRadius: 8,
        padding: 32,
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
    },
    addImageIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    addImageText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#007AFF',
        marginBottom: 4,
    },
    addImageSubtext: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
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