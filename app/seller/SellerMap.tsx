import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import StoreForm from './StoreForm';

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

export default function SellerMap() {
    const [stores, setStores] = useState<Store[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedCoordinate, setSelectedCoordinate] = useState<{ latitude: number, longitude: number } | null>(null);

    const handleMapPress = (event: any) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        setSelectedCoordinate({ latitude, longitude });
        setShowForm(true);
    };

    const handleSaveStore = (storeData: Omit<Store, 'id'>) => {
        const newStore: Store = {
            ...storeData,
            id: Date.now().toString(),
        };

        setStores([...stores, newStore]);
        Alert.alert('Success!', 'Store added successfully');
    };

    const getMarkerIcon = (type: 'beef' | 'fish') => {
        return type === 'beef' ? '🐄' : '🐟';
    };

    const handleMarkerPress = (store: Store) => {
        Alert.alert(
            store.name,
            `Seller: ${store.sellerName}\nType: ${store.type === 'beef' ? 'Beef Store 🐄' : 'Fish Store 🐟'}\nPrice: ${store.price}\nDescription: ${store.description}`,
            [
                { text: 'OK' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setStores(stores.filter(s => s.id !== store.id));
                        Alert.alert('Deleted', 'Store removed successfully');
                    }
                }
            ]
        );
    };

    return (
        <ThemedView style={styles.container}>
            <ThemedView style={styles.header}>
                <ThemedText type="title">Seller Dashboard</ThemedText>
                <ThemedText>Tap on map to add your store</ThemedText>
                <ThemedText style={styles.storeCount}>Your Stores: {stores.length}</ThemedText>
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
                {stores.map((store) => (
                    <Marker
                        key={store.id}
                        coordinate={{
                            latitude: store.latitude,
                            longitude: store.longitude,
                        }}
                        title={store.name}
                        description={`${store.type} store - ${store.price}`}
                        onPress={() => handleMarkerPress(store)}
                    >
                        <ThemedText style={styles.markerEmoji}>{getMarkerIcon(store.type)}</ThemedText>
                    </Marker>
                ))}
            </MapView>

            <StoreForm
                visible={showForm}
                onClose={() => setShowForm(false)}
                onSave={handleSaveStore}
                latitude={selectedCoordinate?.latitude || 0}
                longitude={selectedCoordinate?.longitude || 0}
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
    storeCount: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
        fontWeight: '600',
    },
    map: {
        flex: 1,
    },
    markerEmoji: {
        fontSize: 30,
    },
}); 