import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Review, Store } from '../shared/dataStore';
import ReviewForm from './ReviewForm';

interface StoreWithDistance extends Store {
    distance?: number;
}

interface StoreDetailsProps {
    visible: boolean;
    store: StoreWithDistance | null;
    onClose: () => void;
    reviews: Review[];
    onAddReview: (review: Omit<Review, 'id' | 'date'>) => void;
}

export default function StoreDetails({ visible, store, onClose, reviews, onAddReview }: StoreDetailsProps) {
    const [showReviewForm, setShowReviewForm] = useState(false);

    if (!store) return null;

    const getStoreIcon = (type: 'beef' | 'fish') => {
        return type === 'beef' ? '🐄' : '🐟';
    };

    const handleLeaveReview = () => {
        setShowReviewForm(true);
    };

    const handleSaveReview = (reviewData: Omit<Review, 'id' | 'date'>) => {
        onAddReview(reviewData);
        setShowReviewForm(false);
    };

    const storeReviews = reviews.filter(review => review.storeId === store.id);

    const getAverageRating = () => {
        if (storeReviews.length === 0) return 0;
        const sum = storeReviews.reduce((acc, review) => acc + review.rating, 0);
        return sum / storeReviews.length;
    };

    const getAverageRatingText = () => {
        return getAverageRating().toFixed(1);
    };

    const renderStars = (rating: number) => {
        return (
            <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <ThemedText
                        key={star}
                        style={[
                            styles.star,
                            star <= rating ? styles.starFilled : styles.starEmpty
                        ]}
                    >
                        ⭐
                    </ThemedText>
                ))}
            </View>
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
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
                        <TouchableOpacity style={styles.reviewButton} onPress={handleLeaveReview}>
                            <ThemedText style={styles.reviewButtonText}>📝</ThemedText>
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

                            {/* Rating Summary */}
                            {storeReviews.length > 0 && (
                                <View style={styles.ratingSummary}>
                                    <View style={styles.ratingRow}>
                                        {renderStars(Math.round(getAverageRating()))}
                                        <ThemedText style={styles.averageRating}>
                                            {getAverageRatingText()} ({storeReviews.length} review{storeReviews.length !== 1 ? 's' : ''})
                                        </ThemedText>
                                    </View>
                                </View>
                            )}

                            <ThemedText style={styles.storeDescription}>{store.description}</ThemedText>
                            <ThemedText style={styles.sellerName}>Seller: {store.sellerName}</ThemedText>
                            {store.distance && (
                                <ThemedText style={styles.distance}>📍 {store.distance}km away</ThemedText>
                            )}

                            {/* Action Button */}
                            <View style={styles.actionButtons}>
                                <TouchableOpacity style={styles.leaveReviewButton} onPress={handleLeaveReview}>
                                    <ThemedText style={styles.leaveReviewButtonText}>📝 Leave Review</ThemedText>
                                </TouchableOpacity>
                            </View>
                        </ThemedView>

                        {/* Products Section */}
                        <ThemedView style={styles.productsSection}>
                            <ThemedText type="subtitle" style={styles.productsTitle}>
                                Available Products ({store.products.length})
                            </ThemedText>

                            {store.products.length === 0 ? (
                                <ThemedView style={styles.emptyProducts}>
                                    <ThemedText style={styles.emptyIcon}>📦</ThemedText>
                                    <ThemedText style={styles.emptyText}>No products available</ThemedText>
                                    <ThemedText style={styles.emptySubtext}>This store hasn't added any products yet</ThemedText>
                                </ThemedView>
                            ) : (
                                <View style={styles.productsList}>
                                    {store.products.map((product) => (
                                        <View key={product.id} style={styles.productItem}>
                                            <View style={styles.productContent}>
                                                {product.picture && (
                                                    <Image source={{ uri: product.picture }} style={styles.productImage} />
                                                )}
                                                <View style={styles.productInfo}>
                                                    <ThemedText style={styles.productName}>{product.name}</ThemedText>
                                                    <ThemedText style={styles.productPrice}>{product.price}</ThemedText>
                                                    <ThemedText style={styles.productDescription} numberOfLines={2}>
                                                        {product.description}
                                                    </ThemedText>
                                                </View>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </ThemedView>

                        {/* Reviews Section */}
                        <ThemedView style={styles.reviewsSection}>
                            <ThemedText type="subtitle" style={styles.reviewsTitle}>
                                Reviews ({storeReviews.length})
                            </ThemedText>

                            {storeReviews.length === 0 ? (
                                <ThemedView style={styles.emptyReviews}>
                                    <ThemedText style={styles.emptyIcon}>💬</ThemedText>
                                    <ThemedText style={styles.emptyText}>No reviews yet</ThemedText>
                                    <ThemedText style={styles.emptySubtext}>Be the first to leave a review!</ThemedText>
                                </ThemedView>
                            ) : (
                                storeReviews
                                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                    .map((review) => (
                                        <View key={review.id} style={styles.reviewItem}>
                                            <View style={styles.reviewHeader}>
                                                <ThemedText style={styles.reviewerName}>{review.buyerName}</ThemedText>
                                                <ThemedText style={styles.reviewDate}>{formatDate(review.date)}</ThemedText>
                                            </View>
                                            <View style={styles.reviewRating}>
                                                {renderStars(review.rating)}
                                                <ThemedText style={styles.ratingText}>
                                                    {review.rating} star{review.rating !== 1 ? 's' : ''}
                                                </ThemedText>
                                            </View>
                                            <ThemedText style={styles.reviewComment}>{review.comment}</ThemedText>
                                        </View>
                                    ))
                            )}
                        </ThemedView>
                    </ScrollView>

                    <ReviewForm
                        visible={showReviewForm}
                        onClose={() => setShowReviewForm(false)}
                        onSave={handleSaveReview}
                        storeId={store.id}
                        storeName={store.name}
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
    reviewButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    reviewButtonText: {
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
        marginBottom: 16,
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
    ratingSummary: {
        marginBottom: 16,
        padding: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    starsContainer: {
        flexDirection: 'row',
        marginRight: 8,
    },
    star: {
        fontSize: 16,
    },
    starFilled: {
        opacity: 1,
    },
    starEmpty: {
        opacity: 0.3,
    },
    averageRating: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
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
    distance: {
        fontSize: 12,
        color: '#888',
        marginBottom: 16,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    leaveReviewButton: {
        flex: 1,
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    leaveReviewButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    productsSection: {
        padding: 20,
    },
    productsTitle: {
        marginBottom: 16,
        color: '#333',
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
    productsList: {
        gap: 12,
    },
    productItem: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    productContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    productImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: '#e0e0e0',
    },
    productInfo: {
        flex: 1,
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
    reviewsSection: {
        padding: 20,
    },
    reviewsTitle: {
        marginBottom: 16,
        color: '#333',
    },
    emptyReviews: {
        alignItems: 'center',
        padding: 40,
    },
    reviewItem: {
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    reviewerName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    reviewDate: {
        fontSize: 12,
        color: '#888',
    },
    reviewRating: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    ratingText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 8,
    },
    reviewComment: {
        fontSize: 14,
        color: '#444',
        lineHeight: 20,
    },
}); 