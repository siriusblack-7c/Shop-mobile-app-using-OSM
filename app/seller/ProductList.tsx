import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React from 'react';
import { Alert, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Product } from './ProductForm';

interface ProductListProps {
    products: Product[];
    onEditProduct: (product: Product) => void;
    onDeleteProduct: (productId: string) => void;
    onAddProduct: () => void;
}

export default function ProductList({ products, onEditProduct, onDeleteProduct, onAddProduct }: ProductListProps) {
    const handleProductPress = (product: Product) => {
        Alert.alert(
            product.name,
            `Price: ${product.price}\nDescription: ${product.description}`,
            [
                { text: 'Edit', onPress: () => onEditProduct(product) },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert(
                            'Delete Product',
                            `Are you sure you want to delete "${product.name}"?`,
                            [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Delete',
                                    style: 'destructive',
                                    onPress: () => onDeleteProduct(product.id)
                                }
                            ]
                        );
                    }
                },
                { text: 'Cancel', style: 'cancel' }
            ]
        );
    };

    return (
        <ThemedView style={styles.container}>
            <ThemedView style={styles.header}>
                <ThemedText type="title">Your Products</ThemedText>
                <TouchableOpacity style={styles.addButton} onPress={onAddProduct}>
                    <ThemedText style={styles.addButtonText}>+ Add Product</ThemedText>
                </TouchableOpacity>
            </ThemedView>

            <ScrollView style={styles.productList}>
                {products.length === 0 ? (
                    <ThemedView style={styles.emptyState}>
                        <ThemedText style={styles.emptyIcon}>📦</ThemedText>
                        <ThemedText style={styles.emptyText}>No products added yet</ThemedText>
                        <ThemedText style={styles.emptySubtext}>Tap "Add Product" to create your first product</ThemedText>
                    </ThemedView>
                ) : (
                    products.map((product) => (
                        <TouchableOpacity
                            key={product.id}
                            style={styles.productItem}
                            onPress={() => handleProductPress(product)}
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
                                            onEditProduct(product);
                                        }}
                                    >
                                        <ThemedText style={styles.actionButtonText}>✏️</ThemedText>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.deleteButton}
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            Alert.alert(
                                                'Delete Product',
                                                `Are you sure you want to delete "${product.name}"?`,
                                                [
                                                    { text: 'Cancel', style: 'cancel' },
                                                    {
                                                        text: 'Delete',
                                                        style: 'destructive',
                                                        onPress: () => onDeleteProduct(product.id)
                                                    }
                                                ]
                                            );
                                        }}
                                    >
                                        <ThemedText style={styles.actionButtonText}>🗑️</ThemedText>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    addButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    productList: {
        flex: 1,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        marginTop: 60,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
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
    productItem: {
        backgroundColor: '#fff',
        margin: 8,
        marginBottom: 4,
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
    productContent: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 16,
    },
    placeholderImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    placeholderText: {
        fontSize: 24,
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
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButtonText: {
        fontSize: 14,
    },
}); 