import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Circle, Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { dataStore, Review, Store } from '../shared/dataStore';
import StoreDetails from './StoreDetails';

interface StoreWithDistance extends Store {
    distance?: number; // Distance from buyer location
}

export default function BuyerMap() {
    const [buyerLocation, setBuyerLocation] = useState<{ latitude: number, longitude: number } | null>(null);
    const [allStores, setAllStores] = useState<Store[]>([]);
    const [nearbyStores, setNearbyStores] = useState<StoreWithDistance[]>([]);
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);
    const [showStoreDetails, setShowStoreDetails] = useState(false);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [lastClickedStore, setLastClickedStore] = useState<string | null>(null);
    const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);

    // Subscribe to data changes
    useEffect(() => {
        const updateData = () => {
            const stores = dataStore.getStores();
            setAllStores(stores);
            setReviews(dataStore.getReviews());

            // Recalculate nearby stores if buyer location is set
            if (buyerLocation) {
                updateNearbyStores(buyerLocation, stores);
            }
        };

        // Initial load
        updateData();

        // Subscribe to changes
        const unsubscribe = dataStore.subscribe(updateData);

        return unsubscribe;
    }, [buyerLocation]);

    // Calculate distance between two coordinates (in km)
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // Radius of the Earth in km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return Math.round(distance * 100) / 100; // Round to 2 decimal places
    };

    const updateNearbyStores = (location: { latitude: number, longitude: number }, stores: Store[]) => {
        // Find stores within 5km
        const storesWithDistance = stores.map(store => ({
            ...store,
            distance: calculateDistance(location.latitude, location.longitude, store.latitude, store.longitude)
        }));

        const nearby = storesWithDistance.filter(store => store.distance! <= 5);
        setNearbyStores(nearby);
    };

    const handleMapPress = (event: any) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        const location = { latitude, longitude };
        setBuyerLocation(location);

        // Find stores within 5km for the alert
        const storesWithDistance = allStores.map(store => ({
            ...store,
            distance: calculateDistance(location.latitude, location.longitude, store.latitude, store.longitude)
        }));
        const nearby = storesWithDistance.filter(store => store.distance! <= 5);

        updateNearbyStores(location, allStores);

        Alert.alert(
            'Location Set!',
            `Found ${nearby.length} stores within 5km of your location.`,
            [{ text: 'OK' }]
        );

        // Clear any selected store when clicking on empty map
        setLastClickedStore(null);
        if (clickTimeout) {
            clearTimeout(clickTimeout);
            setClickTimeout(null);
        }
    };

    const getMarkerIcon = (type: 'beef' | 'fish') => {
        return type === 'beef' ? '🐄' : '🐟';
    };

    const handleStorePress = (store: Store) => {
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

    const handleAddReview = async (reviewData: Omit<Review, 'id' | 'date'>) => {
        await dataStore.addReview(reviewData);
    };

    const clearLocation = () => {
        setBuyerLocation(null);
        setNearbyStores([]);
        Alert.alert('Cleared', 'Location and stores cleared');
    };

    const getStoreReviewCount = (storeId: string) => {
        return dataStore.getStoreReviewCount(storeId);
    };

    const getStoreAverageRating = (storeId: string) => {
        return dataStore.getStoreAverageRating(storeId).toFixed(1);
    };

    return (
        <ThemedView style={styles.container}>
            <ThemedView style={styles.header}>
                <ThemedText type="title">Find Stores</ThemedText>
                <ThemedText>Tap on map to set your location. Tap stores once for info, twice for details.</ThemedText>
                {buyerLocation && (
                    <ThemedView style={styles.locationInfo}>
                        <ThemedText style={styles.storeCount}>
                            Stores within 5km: {nearbyStores.length}
                        </ThemedText>
                        <TouchableOpacity style={styles.clearButton} onPress={clearLocation}>
                            <ThemedText style={styles.clearButtonText}>Clear Location</ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                )}
            </ThemedView>

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
                {/* Buyer location marker */}
                {buyerLocation && (
                    <>
                        <Marker
                            coordinate={buyerLocation}
                            title="Your Location"
                            description="Tap to clear"
                            pinColor="blue"
                        />
                        {/* 5km radius circle */}
                        <Circle
                            center={buyerLocation}
                            radius={5000} // 5km in meters
                            fillColor="rgba(0, 122, 255, 0.1)"
                            strokeColor="rgba(0, 122, 255, 0.5)"
                            strokeWidth={2}
                        />
                    </>
                )}

                {/* Store markers (only show nearby stores) */}
                {nearbyStores.map((store) => {
                    const reviewCount = getStoreReviewCount(store.id);
                    const avgRating = getStoreAverageRating(store.id);
                    const productCount = store.products.length;

                    let description = `${store.distance}km away - ${productCount} products - ${store.price}`;
                    if (reviewCount > 0) {
                        description += ` - ⭐${avgRating} (${reviewCount} reviews)`;
                    }

                    return (
                        <Marker
                            key={store.id}
                            coordinate={{
                                latitude: store.latitude,
                                longitude: store.longitude,
                            }}
                            title={store.name}
                            description={description}
                            onPress={() => handleStorePress(store)}
                        >
                            <ThemedText style={styles.markerEmoji}>{getMarkerIcon(store.type)}</ThemedText>
                        </Marker>
                    );
                })}
            </MapView>

            <StoreDetails
                visible={showStoreDetails}
                store={selectedStore}
                onClose={() => setShowStoreDetails(false)}
                reviews={reviews}
                onAddReview={handleAddReview}
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
        backgroundColor: '#e8f5e8',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    locationInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    storeCount: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    clearButton: {
        backgroundColor: '#FF3B30',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    clearButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    map: {
        flex: 1,
    },
    markerEmoji: {
        fontSize: 30,
    },
}); 