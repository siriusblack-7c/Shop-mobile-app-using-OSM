import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Product } from './ProductForm';
import StoreDetails from './StoreDetails';

interface Review {
    id: string;
    storeId: string;
    buyerName: string;
    rating: number;
    comment: string;
    date: string;
}

interface Store {
    id: string;
    latitude: number;
    longitude: number;
    name: string;
    type: 'beef' | 'fish';
    price: string;
    description: string;
    sellerName: string;
    products: Product[];
}

interface StoreListProps {
    stores: Store[];
    onDeleteStore: (storeId: string) => void;
    onUpdateStore: (updatedStore: Store) => void;
    reviews?: Review[];
}

export default function StoreList({ stores, onDeleteStore, onUpdateStore, reviews = [] }: StoreListProps) {
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);
    const [showStoreDetails, setShowStoreDetails] = useState(false);

    const getMarkerIcon = (type: 'beef' | 'fish') => {
        return type === 'beef' ? '🐄' : '🐟';
    };

    const handleStorePress = (store: Store) => {
        setSelectedStore(store);
        setShowStoreDetails(true);
    };

    const handleStoreUpdate = (updatedStore: Store) => {
        onUpdateStore(updatedStore);
        setSelectedStore(updatedStore); // Update the selected store to reflect changes
    };

    const handleDeleteStore = (storeId: string) => {
        onDeleteStore(storeId);
        setShowStoreDetails(false);
        setSelectedStore(null);
    };

    const handleEditStore = (store: Store) => {
        // This function would typically trigger editing mode
        // For now, we'll just show an alert since editing is handled differently in the parent
        Alert.alert('Edit Store', 'Store editing is available from the map view');
    };

    const getStoreReviewCount = (storeId: string) => {
        return reviews.filter(review => review.storeId === storeId).length;
    };

    const getStoreAverageRating = (storeId: string) => {
        const storeReviews = reviews.filter(review => review.storeId === storeId);
        if (storeReviews.length === 0) return 0;
        const sum = storeReviews.reduce((acc, review) => acc + review.rating, 0);
        return (sum / storeReviews.length).toFixed(1);
    };

    return (
        <ThemedView style={styles.container}>
            <ScrollView style={styles.listContainer}>
                {stores.length === 0 ? (
                    <ThemedView style={styles.emptyState}>
                        <ThemedText style={styles.emptyText}>No stores added yet</ThemedText>
                        <ThemedText style={styles.emptySubtext}>Switch to map view and tap to add your first store</ThemedText>
                    </ThemedView>
                ) : (
                    stores.map((store) => {
                        const reviewCount = getStoreReviewCount(store.id);
                        const avgRating = getStoreAverageRating(store.id);

                        return (
                            <TouchableOpacity
                                key={store.id}
                                style={styles.storeItem}
                                onPress={() => handleStorePress(store)}
                            >
                                <View style={styles.storeItemHeader}>
                                    <ThemedText style={styles.storeEmoji}>{getMarkerIcon(store.type)}</ThemedText>
                                    <View style={styles.storeInfo}>
                                        <ThemedText style={styles.storeName}>{store.name}</ThemedText>
                                        <ThemedText style={styles.storeType}>
                                            {store.type === 'beef' ? 'Beef Store' : 'Fish Store'}
                                        </ThemedText>
                                    </View>
                                    <View style={styles.storeStats}>
                                        <ThemedText style={styles.storePrice}>{store.price}</ThemedText>
                                        <ThemedText style={styles.productCount}>
                                            📦 {store.products.length} products
                                        </ThemedText>
                                        {reviewCount > 0 && (
                                            <ThemedText style={styles.reviewCount}>
                                                ⭐ {avgRating} ({reviewCount} reviews)
                                            </ThemedText>
                                        )}
                                    </View>
                                </View>
                                <ThemedText style={styles.storeDescription}>{store.description}</ThemedText>
                                <ThemedText style={styles.storeLocation}>
                                    📍 {store.latitude.toFixed(4)}, {store.longitude.toFixed(4)}
                                </ThemedText>

                                {/* Quick actions */}
                                <View style={styles.quickActions}>
                                    <ThemedText style={styles.tapHint}>Tap to manage products & view reviews</ThemedText>
                                    <TouchableOpacity
                                        style={styles.deleteButton}
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            Alert.alert(
                                                'Delete Store',
                                                `Are you sure you want to delete "${store.name}" and all its products?`,
                                                [
                                                    { text: 'Cancel', style: 'cancel' },
                                                    {
                                                        text: 'Delete',
                                                        style: 'destructive',
                                                        onPress: () => onDeleteStore(store.id)
                                                    }
                                                ]
                                            );
                                        }}
                                    >
                                        <ThemedText style={styles.deleteButtonText}>🗑️</ThemedText>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        );
                    })
                )}
            </ScrollView>

            <StoreDetails
                visible={showStoreDetails}
                store={selectedStore}
                onClose={() => {
                    setShowStoreDetails(false);
                    setSelectedStore(null);
                }}
                onUpdateStore={handleStoreUpdate}
                onDeleteStore={handleDeleteStore}
                onEditStore={handleEditStore}
                reviews={reviews}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContainer: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
    storeItem: {
        backgroundColor: '#fff',
        margin: 8,
        marginBottom: 4,
        padding: 16,
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
    storeItemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    storeEmoji: {
        fontSize: 24,
        marginRight: 12,
    },
    storeInfo: {
        flex: 1,
    },
    storeName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    storeType: {
        fontSize: 12,
        color: '#666',
    },
    storeStats: {
        alignItems: 'flex-end',
    },
    storePrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#007AFF',
        marginBottom: 4,
    },
    productCount: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
        marginBottom: 2,
    },
    reviewCount: {
        fontSize: 12,
        color: '#FF9500',
        fontWeight: '500',
    },
    storeDescription: {
        fontSize: 14,
        color: '#444',
        marginBottom: 8,
        lineHeight: 20,
    },
    storeLocation: {
        fontSize: 12,
        color: '#888',
        fontFamily: 'monospace',
        marginBottom: 12,
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    tapHint: {
        fontSize: 12,
        color: '#007AFF',
        fontStyle: 'italic',
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButtonText: {
        fontSize: 14,
    },
}); 