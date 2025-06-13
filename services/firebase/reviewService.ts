import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    setDoc,
    updateDoc,
    where
} from 'firebase/firestore';
import { auth, db } from '../../config/firebase';

export interface Review {
    id: string;
    storeId: string;
    buyerId: string; // Firebase user ID
    buyerName: string;
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
}

export class ReviewService {
    // Add a new review
    static async addReview(reviewData: Omit<Review, 'id' | 'buyerId' | 'createdAt' | 'updatedAt'>): Promise<Review> {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('User must be authenticated');

            // Check if user already reviewed this store
            const existingReview = await this.getUserReviewForStore(reviewData.storeId, user.uid);
            if (existingReview) {
                throw new Error('You have already reviewed this store. You can update your existing review.');
            }

            const now = new Date().toISOString();
            const reviewDoc = doc(collection(db, 'reviews'));

            const review: Review = {
                ...reviewData,
                id: reviewDoc.id,
                buyerId: user.uid,
                createdAt: now,
                updatedAt: now,
            };

            await setDoc(reviewDoc, review);
            return review;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    // Get all reviews for a store
    static async getStoreReviews(storeId: string): Promise<Review[]> {
        try {
            const q = query(
                collection(db, 'reviews'),
                where('storeId', '==', storeId),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => doc.data() as Review);
        } catch (error: any) {
            console.error('Error getting store reviews:', error);
            return [];
        }
    }

    // Get all reviews (for admin or analytics)
    static async getAllReviews(): Promise<Review[]> {
        try {
            const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => doc.data() as Review);
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    // Get reviews by user
    static async getUserReviews(userId?: string): Promise<Review[]> {
        try {
            const buyerId = userId || auth.currentUser?.uid;
            if (!buyerId) throw new Error('User ID required');

            const q = query(
                collection(db, 'reviews'),
                where('buyerId', '==', buyerId),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => doc.data() as Review);
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    // Get user's review for a specific store
    static async getUserReviewForStore(storeId: string, userId?: string): Promise<Review | null> {
        try {
            const buyerId = userId || auth.currentUser?.uid;
            if (!buyerId) return null;

            const q = query(
                collection(db, 'reviews'),
                where('storeId', '==', storeId),
                where('buyerId', '==', buyerId)
            );

            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) return null;

            return querySnapshot.docs[0].data() as Review;
        } catch (error: any) {
            console.error('Error getting user review:', error);
            return null;
        }
    }

    // Update a review
    static async updateReview(reviewId: string, updates: Partial<Review>): Promise<void> {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('User must be authenticated');

            // Verify ownership
            const reviewDoc = await getDoc(doc(db, 'reviews', reviewId));
            if (!reviewDoc.exists()) throw new Error('Review not found');

            const reviewData = reviewDoc.data() as Review;
            if (reviewData.buyerId !== user.uid) {
                throw new Error('Unauthorized to update this review');
            }

            const updatedData = {
                ...updates,
                updatedAt: new Date().toISOString(),
            };

            await updateDoc(doc(db, 'reviews', reviewId), updatedData);
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    // Delete a review
    static async deleteReview(reviewId: string): Promise<void> {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('User must be authenticated');

            // Verify ownership
            const reviewDoc = await getDoc(doc(db, 'reviews', reviewId));
            if (!reviewDoc.exists()) throw new Error('Review not found');

            const reviewData = reviewDoc.data() as Review;
            if (reviewData.buyerId !== user.uid) {
                throw new Error('Unauthorized to delete this review');
            }

            await deleteDoc(doc(db, 'reviews', reviewId));
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    // Get review statistics for a store
    static async getStoreReviewStats(storeId: string): Promise<{
        averageRating: number;
        totalReviews: number;
        ratingDistribution: { [key: number]: number };
    }> {
        try {
            const reviews = await this.getStoreReviews(storeId);

            if (reviews.length === 0) {
                return {
                    averageRating: 0,
                    totalReviews: 0,
                    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
                };
            }

            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = totalRating / reviews.length;

            const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            reviews.forEach(review => {
                ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
            });

            return {
                averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
                totalReviews: reviews.length,
                ratingDistribution
            };
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    // Get reviews for multiple stores (useful for seller dashboard)
    static async getReviewsForStores(storeIds: string[]): Promise<Review[]> {
        try {
            if (storeIds.length === 0) return [];

            // Firestore 'in' query has a limit of 10 items
            const chunks = [];
            for (let i = 0; i < storeIds.length; i += 10) {
                chunks.push(storeIds.slice(i, i + 10));
            }

            const allReviews: Review[] = [];

            for (const chunk of chunks) {
                const q = query(
                    collection(db, 'reviews'),
                    where('storeId', 'in', chunk),
                    orderBy('createdAt', 'desc')
                );

                const querySnapshot = await getDocs(q);
                const chunkReviews = querySnapshot.docs.map(doc => doc.data() as Review);
                allReviews.push(...chunkReviews);
            }

            return allReviews;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }
} 