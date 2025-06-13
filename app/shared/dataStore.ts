export interface Review {
    id: string;
    storeId: string;
    buyerName: string;
    rating: number;
    comment: string;
    date: string;
}

// Simple in-memory data store for reviews
class DataStore {
    private reviews: Review[] = [];
    private listeners: (() => void)[] = [];

    // Initialize with some sample data
    constructor() {
        this.reviews = [
            {
                id: '1',
                storeId: 'sample-store-1',
                buyerName: 'Alice Johnson',
                rating: 5,
                comment: 'Excellent quality beef! Very fresh and the seller was very helpful.',
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
                id: '2',
                storeId: 'sample-store-1',
                buyerName: 'Bob Smith',
                rating: 4,
                comment: 'Good quality meat, reasonable prices. Will come back again.',
                date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            },
        ];
    }

    // Get all reviews
    getReviews(): Review[] {
        return [...this.reviews];
    }

    // Get reviews for a specific store
    getStoreReviews(storeId: string): Review[] {
        return this.reviews.filter(review => review.storeId === storeId);
    }

    // Add a new review
    addReview(reviewData: Omit<Review, 'id' | 'date'>): Review {
        const newReview: Review = {
            ...reviewData,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            date: new Date().toISOString(),
        };

        this.reviews.push(newReview);
        this.notifyListeners();
        return newReview;
    }

    // Subscribe to changes
    subscribe(listener: () => void): () => void {
        this.listeners.push(listener);

        // Return unsubscribe function
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    // Notify all listeners of changes
    private notifyListeners(): void {
        this.listeners.forEach(listener => listener());
    }

    // Get average rating for a store
    getStoreAverageRating(storeId: string): number {
        const storeReviews = this.getStoreReviews(storeId);
        if (storeReviews.length === 0) return 0;

        const sum = storeReviews.reduce((acc, review) => acc + review.rating, 0);
        return sum / storeReviews.length;
    }

    // Get review count for a store
    getStoreReviewCount(storeId: string): number {
        return this.getStoreReviews(storeId).length;
    }
}

// Export singleton instance
export const dataStore = new DataStore(); 