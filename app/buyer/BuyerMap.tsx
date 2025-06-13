import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Circle, Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import StoreDetails from './StoreDetails';

interface Store {
    id: string;
    latitude: number;
    longitude: number;
    name: string;
    type: 'beef' | 'fish';
    price: string;
    description: string;
    sellerName: string;
    distance?: number; // Distance from buyer location
}

export default function BuyerMap() {
    const [buyerLocation, setBuyerLocation] = useState<{ latitude: number, longitude: number } | null>(null);
    const [nearbyStores, setNearbyStores] = useState<Store[]>([]);
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);
    const [showStoreDetails, setShowStoreDetails] = useState(false);

    // Mock stores data (in real app, this would come from backend)
    const allStores: Store[] = [
        {
            id: '1',
            latitude: 37.78625,
            longitude: -122.4344,
            name: 'Fresh Beef Market',
            type: 'beef',
            price: '$15-25',
            description: 'Premium quality beef, fresh daily delivery',
            sellerName: 'John Smith',
        },
        {
            id: '2',
            latitude: 37.79025,
            longitude: -122.4304,
            name: 'Ocean Fresh Fish',
            type: 'fish',
            price: '$12-20',
            description: 'Freshly caught fish from local waters',
            sellerName: 'Maria Garcia',
        },
        {
            id: '3',
            latitude: 37.78425,
            longitude: -122.4384,
            name: 'Prime Cuts',
            type: 'beef',
            price: '$20-30',
            description: 'Organic grass-fed beef',
            sellerName: 'David Wilson',
        },
        {
            id: '4',
            latitude: 37.79225,
            longitude: -122.4284,
            name: 'Seafood Paradise',
            type: 'fish',
            price: '$8-18',
            description: 'Wide variety of fresh seafood',
            sellerName: 'Lisa Chen',
        },
    ];

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

    const handleMapPress = (event: any) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        setBuyerLocation({ latitude, longitude });

        // Find stores within 5km
        const storesWithDistance = allStores.map(store => ({
            ...store,
            distance: calculateDistance(latitude, longitude, store.latitude, store.longitude)
        }));

        const nearby = storesWithDistance.filter(store => store.distance! <= 5);
        setNearbyStores(nearby);

        Alert.alert(
            'Location Set!',
            `Found ${nearby.length} stores within 5km of your location.`,
            [{ text: 'OK' }]
        );
    };

    const getMarkerIcon = (type: 'beef' | 'fish') => {
        return type === 'beef' ? '🐄' : '🐟';
    };

    const handleStorePress = (store: Store) => {
        setSelectedStore(store);
        setShowStoreDetails(true);
    };

    const clearLocation = () => {
        setBuyerLocation(null);
        setNearbyStores([]);
        Alert.alert('Cleared', 'Location and stores cleared');
    };

    return (
        <ThemedView style={styles.container}>
            <ThemedView style={styles.header}>
                <ThemedText type="title">Find Stores</ThemedText>
                <ThemedText>Tap on map to set your location</ThemedText>
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
                {nearbyStores.map((store) => (
                    <Marker
                        key={store.id}
                        coordinate={{
                            latitude: store.latitude,
                            longitude: store.longitude,
                        }}
                        title={store.name}
                        description={`${store.distance}km away - ${store.price}`}
                        onPress={() => handleStorePress(store)}
                    >
                        <ThemedText style={styles.markerEmoji}>{getMarkerIcon(store.type)}</ThemedText>
                    </Marker>
                ))}
            </MapView>

            <StoreDetails
                visible={showStoreDetails}
                store={selectedStore}
                onClose={() => setShowStoreDetails(false)}
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
        backgroundColor: '#ff6b6b',
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