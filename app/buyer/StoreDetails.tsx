import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { useState } from 'react';
import { Alert, Linking, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Review } from '../shared/dataStore';
import ReviewForm from './ReviewForm';

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
    reviews: Review[];
    onAddReview: (review: Omit<Review, 'id' | 'date'>) => void;
}

export default function StoreDetails({ visible, store, onClose, reviews, onAddReview }: StoreDetailsProps) {
    const [showReviewForm, setShowReviewForm] = useState(false);

    if (!store) return null;

    const getStoreIcon = (type: 'beef' | 'fish') => {
        return type === 'beef' ? '🐄' : '🐟';
    };

    const handleContact = () => {
        Alert.alert(
            'Contact Seller',
            `Would you like to contact ${store.sellerName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Call', onPress: () => Linking.openURL('tel:+1234567890') },
                { text: 'Message', onPress: () => Alert.alert('Message', 'Messaging feature coming soon!') }
            ]
        );
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

                            {/* Action Buttons */}
                            <View style={styles.actionButtons}>
                                <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
                                    <ThemedText style={styles.contactButtonText}>📞 Contact Seller</ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.leaveReviewButton} onPress={handleLeaveReview}>
                                    <ThemedText style={styles.leaveReviewButtonText}>📝 Leave Review</ThemedText>
                                </TouchableOpacity>
                            </View>
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
    contactButton: {
        flex: 1,
        backgroundColor: '#34C759',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    contactButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
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