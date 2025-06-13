import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

interface Store {
    id: string;
    latitude: number;
    longitude: number;
    name: string;
    type: 'beef' | 'fish';
    price: string;
    description: string;
    sellerName: string;
    distance?: number;
}

interface StoreDetailsProps {
    visible: boolean;
    store: Store | null;
    onClose: () => void;
}

export default function StoreDetails({ visible, store, onClose }: StoreDetailsProps) {
    if (!store) return null;

    const getStoreIcon = (type: 'beef' | 'fish') => {
        return type === 'beef' ? '🐄' : '🐟';
    };

    const getStoreType = (type: 'beef' | 'fish') => {
        return type === 'beef' ? 'Beef Store' : 'Fish Store';
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <ThemedView style={styles.overlay}>
                <ThemedView style={styles.modal}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Header */}
                        <ThemedView style={styles.header}>
                            <ThemedText style={styles.storeIcon}>{getStoreIcon(store.type)}</ThemedText>
                            <ThemedView style={styles.headerText}>
                                <ThemedText type="title" style={styles.storeName}>{store.name}</ThemedText>
                                <ThemedText style={styles.storeType}>{getStoreType(store.type)}</ThemedText>
                            </ThemedView>
                            {store.distance && (
                                <ThemedView style={styles.distanceBadge}>
                                    <ThemedText style={styles.distanceText}>{store.distance}km</ThemedText>
                                </ThemedView>
                            )}
                        </ThemedView>

                        {/* Store Information */}
                        <ThemedView style={styles.section}>
                            <ThemedText style={styles.sectionTitle}>Seller Information</ThemedText>
                            <ThemedView style={styles.infoRow}>
                                <ThemedText style={styles.label}>Seller:</ThemedText>
                                <ThemedText style={styles.value}>{store.sellerName}</ThemedText>
                            </ThemedView>
                        </ThemedView>

                        <ThemedView style={styles.section}>
                            <ThemedText style={styles.sectionTitle}>Product Information</ThemedText>
                            <ThemedView style={styles.infoRow}>
                                <ThemedText style={styles.label}>Price Range:</ThemedText>
                                <ThemedText style={styles.priceValue}>{store.price}</ThemedText>
                            </ThemedView>
                            <ThemedView style={styles.descriptionContainer}>
                                <ThemedText style={styles.label}>Description:</ThemedText>
                                <ThemedText style={styles.description}>{store.description}</ThemedText>
                            </ThemedView>
                        </ThemedView>

                        {/* Location */}
                        <ThemedView style={styles.section}>
                            <ThemedText style={styles.sectionTitle}>Location</ThemedText>
                            <ThemedView style={styles.infoRow}>
                                <ThemedText style={styles.label}>Coordinates:</ThemedText>
                                <ThemedText style={styles.value}>
                                    {store.latitude.toFixed(4)}, {store.longitude.toFixed(4)}
                                </ThemedText>
                            </ThemedView>
                        </ThemedView>

                        {/* Action Buttons */}
                        <ThemedView style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                                <ThemedText style={styles.closeButtonText}>Close</ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.contactButton}>
                                <ThemedText style={styles.contactButtonText}>Contact Seller</ThemedText>
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
        borderRadius: 16,
        padding: 20,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    storeIcon: {
        fontSize: 40,
        marginRight: 12,
    },
    headerText: {
        flex: 1,
    },
    storeName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    storeType: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    distanceBadge: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    distanceText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
        minWidth: 100,
    },
    value: {
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    priceValue: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '600',
        flex: 1,
    },
    descriptionContainer: {
        marginTop: 8,
    },
    description: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
        marginTop: 4,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    closeButton: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    contactButton: {
        flex: 1,
        backgroundColor: '#34C759',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
    },
    contactButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
}); 