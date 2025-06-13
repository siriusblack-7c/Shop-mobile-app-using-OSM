import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import ProductForm, { Product } from './ProductForm';

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

interface StoreDetailsProps {
    visible: boolean;
    store: Store | null;
    onClose: () => void;
    onUpdateStore: (updatedStore: Store) => void;
    onDeleteStore: (storeId: string) => void;
}

export default function StoreDetails({ visible, store, onClose, onUpdateStore, onDeleteStore }: StoreDetailsProps) {
    const [showProductForm, setShowProductForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

    if (!store) return null;

    const getStoreIcon = (type: 'beef' | 'fish') => {
        return type === 'beef' ? '🐄' : '🐟';
    };

    const handleAddProduct = () => {
        setEditingProduct(undefined);
        setShowProductForm(true);
    };

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setShowProductForm(true);
    };

    const handleSaveProduct = (productData: Omit<Product, 'id'>) => {
        let updatedProducts: Product[];

        if (editingProduct) {
            // Update existing product
            updatedProducts = store.products.map(p =>
                p.id === editingProduct.id
                    ? { ...productData, id: editingProduct.id }
                    : p
            );
            Alert.alert('Success!', 'Product updated successfully');
        } else {
            // Add new product
            const newProduct: Product = {
                ...productData,
                id: Date.now().toString(),
            };
            updatedProducts = [...store.products, newProduct];
            Alert.alert('Success!', 'Product added successfully');
        }

        const updatedStore: Store = {
            ...store,
            products: updatedProducts
        };

        onUpdateStore(updatedStore);
        setEditingProduct(undefined);
        setShowProductForm(false);
    };

    const handleDeleteProduct = (productId: string) => {
        const updatedProducts = store.products.filter(p => p.id !== productId);
        const updatedStore: Store = {
            ...store,
            products: updatedProducts
        };
        onUpdateStore(updatedStore);
        Alert.alert('Deleted', 'Product removed successfully');
    };

    const confirmDeleteProduct = (product: Product) => {
        Alert.alert(
            'Delete Product',
            `Are you sure you want to delete "${product.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => handleDeleteProduct(product.id)
                }
            ]
        );
    };

    const confirmDeleteStore = () => {
        Alert.alert(
            'Delete Store',
            `Are you sure you want to delete "${store.name}" and all its products?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        onDeleteStore(store.id);
                        onClose();
                    }
                }
            ]
        );
    };

    const getTotalProducts = () => {
        return store.products.length;
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <ThemedView style={styles.overlay}>
                <ThemedView style={styles.modal}>
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <ThemedText style={styles.closeButtonText}>✕</ThemedText>
                        </TouchableOpacity>
                        <ThemedText type="title" style={styles.title}>Store Details</ThemedText>
                        <TouchableOpacity style={styles.deleteStoreButton} onPress={confirmDeleteStore}>
                            <ThemedText style={styles.deleteStoreText}>🗑️</ThemedText>
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Store Information */}
                        <ThemedView style={styles.storeInfo}>
                            <View style={styles.storeHeader}>
                                <ThemedText style={styles.storeIcon}>{getStoreIcon(store.type)}</ThemedText>
                                <View style={styles.storeMainInfo}>
                                    <ThemedText style={styles.storeName}>{store.name}</ThemedText>
                                    <ThemedText style={styles.storeType}>
                                        {store.type === 'beef' ? 'Beef Store' : 'Fish Store'}
                                    </ThemedText>
                                    <ThemedText style={styles.storePrice}>{store.price}</ThemedText>
                                </View>
                            </View>
                            <ThemedText style={styles.storeDescription}>{store.description}</ThemedText>
                            <ThemedText style={styles.sellerName}>Seller: {store.sellerName}</ThemedText>
                            <ThemedText style={styles.storeLocation}>
                                📍 {store.latitude.toFixed(4)}, {store.longitude.toFixed(4)}
                            </ThemedText>
                        </ThemedView>

                        {/* Products Section */}
                        <ThemedView style={styles.productsSection}>
                            <View style={styles.productsHeader}>
                                <ThemedText type="subtitle" style={styles.productsTitle}>
                                    Products ({getTotalProducts()})
                                </ThemedText>
                                <TouchableOpacity style={styles.addProductButton} onPress={handleAddProduct}>
                                    <ThemedText style={styles.addProductText}>+ Add Product</ThemedText>
                                </TouchableOpacity>
                            </View>

                            {store.products.length === 0 ? (
                                <ThemedView style={styles.emptyProducts}>
                                    <ThemedText style={styles.emptyIcon}>📦</ThemedText>
                                    <ThemedText style={styles.emptyText}>No products yet</ThemedText>
                                    <ThemedText style={styles.emptySubtext}>Add your first product to this store</ThemedText>
                                </ThemedView>
                            ) : (
                                store.products.map((product) => (
                                    <TouchableOpacity
                                        key={product.id}
                                        style={styles.productItem}
                                        onPress={() => handleEditProduct(product)}
                                    >
                                        <View style={styles.productContent}>
                                            {product.picture ? (
                                                <Image source={{ uri: product.picture }} style={styles.productImage} />
                                            ) : (
                                                <View style={styles.placeholderImage}>
                                                    <ThemedText style={styles.placeholderText}>📷</ThemedText>
                                                </View>
                                            )}

                                            <View style={styles.productInfo}>
                                                <ThemedText style={styles.productName}>{product.name}</ThemedText>
                                                <ThemedText style={styles.productPrice}>{product.price}</ThemedText>
                                                <ThemedText style={styles.productDescription} numberOfLines={2}>
                                                    {product.description}
                                                </ThemedText>
                                            </View>

                                            <View style={styles.productActions}>
                                                <TouchableOpacity
                                                    style={styles.editButton}
                                                    onPress={(e) => {
                                                        e.stopPropagation();
                                                        handleEditProduct(product);
                                                    }}
                                                >
                                                    <ThemedText style={styles.actionButtonText}>✏️</ThemedText>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={styles.deleteButton}
                                                    onPress={(e) => {
                                                        e.stopPropagation();
                                                        confirmDeleteProduct(product);
                                                    }}
                                                >
                                                    <ThemedText style={styles.actionButtonText}>🗑️</ThemedText>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))
                            )}
                        </ThemedView>
                    </ScrollView>

                    <ProductForm
                        visible={showProductForm}
                        onClose={() => {
                            setShowProductForm(false);
                            setEditingProduct(undefined);
                        }}
                        onSave={handleSaveProduct}
                        editProduct={editingProduct}
                    />
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
        maxHeight: '90%',
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 16,
        color: '#666',
    },
    title: {
        flex: 1,
        textAlign: 'center',
        color: '#333',
    },
    deleteStoreButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FF3B30',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteStoreText: {
        fontSize: 16,
    },
    storeInfo: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    storeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    storeIcon: {
        fontSize: 32,
        marginRight: 16,
    },
    storeMainInfo: {
        flex: 1,
    },
    storeName: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 4,
        color: '#333',
    },
    storeType: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    storePrice: {
        fontSize: 16,
        fontWeight: '600',
        color: '#007AFF',
    },
    storeDescription: {
        fontSize: 14,
        color: '#444',
        marginBottom: 12,
        lineHeight: 20,
    },
    sellerName: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    storeLocation: {
        fontSize: 12,
        color: '#888',
        fontFamily: 'monospace',
    },
    productsSection: {
        padding: 20,
    },
    productsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    productsTitle: {
        color: '#333',
    },
    addProductButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addProductText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyProducts: {
        alignItems: 'center',
        padding: 40,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
    productItem: {
        backgroundColor: '#f8f8f8',
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    productContent: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
    },
    productImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
    },
    placeholderImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    placeholderText: {
        fontSize: 20,
        color: '#999',
    },
    productInfo: {
        flex: 1,
        marginRight: 12,
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
        color: '#333',
    },
    productPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#007AFF',
        marginBottom: 4,
    },
    productDescription: {
        fontSize: 12,
        color: '#666',
        lineHeight: 16,
    },
    productActions: {
        flexDirection: 'column',
        gap: 8,
    },
    editButton: {
        backgroundColor: '#007AFF',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButtonText: {
        fontSize: 12,
    },
}); 