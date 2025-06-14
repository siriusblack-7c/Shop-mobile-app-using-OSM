import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { dataStore, Review, Store } from '../shared/dataStore';
import StoreDetails from './StoreDetails';
import StoreForm from './StoreForm';
import StoreList from './StoreList';

export default function SellerMap() {
    const [stores, setStores] = useState<Store[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [showStoreForm, setShowStoreForm] = useState(false);
    const [showStoreDetails, setShowStoreDetails] = useState(false);
    const [selectedCoordinate, setSelectedCoordinate] = useState<{ latitude: number, longitude: number } | null>(null);
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);
    const [editingStore, setEditingStore] = useState<Store | null>(null);
    const [viewMode, setViewMode] = useState<'map' | 'stores'>('map');
    const [lastClickedStore, setLastClickedStore] = useState<string | null>(null);
    const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);

    // Subscribe to data changes
    useEffect(() => {
        const updateData = () => {
            setStores(dataStore.getStores());
            setReviews(dataStore.getReviews());
        };

        // Initial load
        updateData();

        // Subscribe to changes
        const unsubscribe = dataStore.subscribe(updateData);

        return unsubscribe;
    }, []);

    const handleMapPress = (event: any) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        setSelectedCoordinate({ latitude, longitude });
        setEditingStore(null); // Clear editing store for new store creation
        setShowStoreForm(true);

        // Clear any selected store when clicking on empty map
        setLastClickedStore(null);
        if (clickTimeout) {
            clearTimeout(clickTimeout);
            setClickTimeout(null);
        }
    };

    const handleSaveStore = async (storeData: Omit<Store, 'id' | 'products'>) => {
        if (editingStore) {
            // Update existing store
            const updatedStore = await dataStore.updateStore(editingStore.id, storeData);
            if (updatedStore) {
                Alert.alert('Success!', 'Store updated successfully');
                setEditingStore(null);
            } else {
                Alert.alert('Error', 'Failed to update store');
            }
        } else {
            // Create new store
            const newStore = await dataStore.addStore(storeData);
            Alert.alert('Success!', 'Store added successfully');
        }
    };

    const handleUpdateStore = async (updatedStore: Store) => {
        const result = await dataStore.updateStore(updatedStore.id, updatedStore);
        if (result) {
            setSelectedStore(result); // Update selected store to reflect changes
        }
    };

    const getMarkerIcon = (type: 'beef' | 'fish') => {
        return type === 'beef' ? '🐄' : '🐟';
    };

    const handleMarkerPress = (store: Store) => {
        // Clear any existing timeout
        if (clickTimeout) {
            clearTimeout(clickTimeout);
            setClickTimeout(null);
        }

        // Check if this is the same store clicked within a short time (double click)
        if (lastClickedStore === store.id) {
            // Second click - open store details
            setSelectedStore(store);
            setShowStoreDetails(true);
            setLastClickedStore(null);
        } else {
            // First click - just show the tooltip (marker's built-in callout)
            setLastClickedStore(store.id);

            // Set a timeout to reset the click state after 2 seconds
            const timeout = setTimeout(() => {
                setLastClickedStore(null);
            }, 2000);
            setClickTimeout(timeout);
        }
    };

    const handleEditStoreFromDetails = (store: Store) => {
        setEditingStore(store);
        setSelectedCoordinate({ latitude: store.latitude, longitude: store.longitude });
        setShowStoreDetails(false);
        setShowStoreForm(true);
    };

    const deleteStore = async (storeId: string) => {
        const success = await dataStore.deleteStore(storeId);
        if (success) {
            Alert.alert('Deleted', 'Store removed successfully');
        } else {
            Alert.alert('Error', 'Failed to delete store');
        }
    };

    const getStoreReviewCount = (storeId: string) => {
        return dataStore.getStoreReviewCount(storeId);
    };

    const getStoreAverageRating = (storeId: string) => {
        return dataStore.getStoreAverageRating(storeId).toFixed(1);
    };

    const renderMapView = () => (
        <MapView
            style={styles.map}
            provider={PROVIDER_DEFAULT}
            initialRegion={{
                latitude: 37.78825,
                longitude: -122.4324,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            }}
            mapType="standard"
            onPress={handleMapPress}
        >
            {stores.map((store) => {
                const reviewCount = getStoreReviewCount(store.id);
                const avgRating = getStoreAverageRating(store.id);
                const description = reviewCount > 0
                    ? `${store.type} store - ${store.products.length} products - ⭐${avgRating} (${reviewCount} reviews)`
                    : `${store.type} store - ${store.products.length} products`;

                return (
                    <Marker
                        key={store.id}
                        coordinate={{
                            latitude: store.latitude,
                            longitude: store.longitude,
                        }}
                        title={store.name}
                        description={description}
                        onPress={() => handleMarkerPress(store)}
                        onCalloutPress={() => {
                            // Clicking on the callout/tooltip opens store details directly
                            setSelectedStore(store);
                            setShowStoreDetails(true);
                            setLastClickedStore(null);
                        }}
                    >
                        <ThemedText style={styles.markerEmoji}>{getMarkerIcon(store.type)}</ThemedText>
                    </Marker>
                );
            })}
        </MapView>
    );

    const getViewModeText = () => {
        switch (viewMode) {
            case 'map': return 'Tap on map to add store, tap markers for info, tap info or marker again for details';
            case 'stores': return 'Your stores and products';
            default: return '';
        }
    };

    const getTotalProducts = () => {
        return stores.reduce((total, store) => total + store.products.length, 0);
    };

    const getTotalReviews = () => {
        return reviews.filter(review =>
            stores.some(store => store.id === review.storeId)
        ).length;
    };

    const renderCurrentView = () => {
        switch (viewMode) {
            case 'map':
                return renderMapView();
            case 'stores':
                return (
                    <StoreList
                        stores={stores}
                        onDeleteStore={deleteStore}
                        onUpdateStore={handleUpdateStore}
                        onEditStore={handleEditStoreFromDetails}
                        reviews={reviews}
                    />
                );
            default:
                return renderMapView();
        }
    };

    return (
        <ThemedView style={styles.container}>
            <ThemedView style={styles.header}>
                <ThemedText type="title">Seller Dashboard</ThemedText>
                <ThemedText>{getViewModeText()}</ThemedText>
                <View style={styles.headerBottom}>
                    <ThemedView style={styles.countsContainer}>
                        <ThemedText style={styles.countText}>Stores: {stores.length}</ThemedText>
                        <ThemedText style={styles.countText}>Products: {getTotalProducts()}</ThemedText>
                        <ThemedText style={styles.countText}>Reviews: {getTotalReviews()}</ThemedText>
                    </ThemedView>
                    <View style={styles.toggleContainer}>
                        <TouchableOpacity
                            style={[styles.toggleButton, viewMode === 'map' && styles.activeToggle]}
                            onPress={() => setViewMode('map')}
                        >
                            <ThemedText style={[styles.toggleText, viewMode === 'map' && styles.activeToggleText]}>
                                🗺️ Map
                            </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.toggleButton, viewMode === 'stores' && styles.activeToggle]}
                            onPress={() => setViewMode('stores')}
                        >
                            <ThemedText style={[styles.toggleText, viewMode === 'stores' && styles.activeToggleText]}>
                                🏪 Stores & Products
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </ThemedView>

            {renderCurrentView()}

            {/* Store Form for creating/editing stores */}
            <StoreForm
                visible={showStoreForm}
                onClose={() => {
                    setShowStoreForm(false);
                    setEditingStore(null);
                }}
                onSave={handleSaveStore}
                latitude={selectedCoordinate?.latitude || 0}
                longitude={selectedCoordinate?.longitude || 0}
                editStore={editingStore}
            />

            {/* Store Details for managing products and editing store */}
            <StoreDetails
                visible={showStoreDetails}
                store={selectedStore}
                onClose={() => {
                    setShowStoreDetails(false);
                    setSelectedStore(null);
                }}
                onUpdateStore={handleUpdateStore}
                onDeleteStore={(storeId) => {
                    deleteStore(storeId);
                    setShowStoreDetails(false);
                    setSelectedStore(null);
                }}
                onEditStore={handleEditStoreFromDetails}
                reviews={reviews}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 16,
        backgroundColor: '#f0f0f0',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    headerBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    countsContainer: {
        flexDirection: 'column',
    },
    countText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#ddd',
        borderRadius: 8,
        padding: 2,
    },
    toggleButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        minWidth: 80,
        alignItems: 'center',
    },
    activeToggle: {
        backgroundColor: '#007AFF',
    },
    toggleText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#666',
        textAlign: 'center',
    },
    activeToggleText: {
        color: '#fff',
    },
    map: {
        flex: 1,
    },
    markerEmoji: {
        fontSize: 30,
    },
}); 