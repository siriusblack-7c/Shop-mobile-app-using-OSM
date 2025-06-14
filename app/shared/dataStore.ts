import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Review {
    id: string;
    storeId: string;
    buyerName: string;
    rating: number;
    comment: string;
    date: string;
}

export interface Product {
    id: string;
    name: string;
    price: string;
    description: string;
    picture?: string; // URI to the image
}

export interface Store {
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

// Enhanced data store with AsyncStorage persistence for stores and reviews
class DataStore {
    private reviews: Review[] = [];
    private stores: Store[] = [];
    private listeners: (() => void)[] = [];
    private isInitialized = false;

    constructor() {
        this.initializeAsync();
    }

    // Initialize data asynchronously
    private async initializeAsync(): Promise<void> {
        if (this.isInitialized) return;

        await this.loadFromStorage();
        this.initializeSampleData();
        this.isInitialized = true;
        this.notifyListeners();
    }

    // Ensure initialization before operations
    private async ensureInitialized(): Promise<void> {
        if (!this.isInitialized) {
            await this.initializeAsync();
        }
    }

    // Load data from AsyncStorage
    private async loadFromStorage(): Promise<void> {
        try {
            const storedReviews = await AsyncStorage.getItem('maptest_reviews');
            const storedStores = await AsyncStorage.getItem('maptest_stores');

            if (storedReviews) {
                this.reviews = JSON.parse(storedReviews);
            }

            if (storedStores) {
                this.stores = JSON.parse(storedStores);
            }
        } catch (error) {
            console.warn('Failed to load data from AsyncStorage:', error);
        }
    }

    // Save data to AsyncStorage
    private async saveToStorage(): Promise<void> {
        try {
            await AsyncStorage.setItem('maptest_reviews', JSON.stringify(this.reviews));
            await AsyncStorage.setItem('maptest_stores', JSON.stringify(this.stores));
        } catch (error) {
            console.warn('Failed to save data to AsyncStorage:', error);
        }
    }

    // Initialize with sample data if no data exists
    private initializeSampleData(): void {
        if (this.reviews.length === 0) {
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

        if (this.stores.length === 0) {
            this.stores = [
                {
                    id: 'sample-store-1',
                    latitude: 37.78625,
                    longitude: -122.4344,
                    name: 'Fresh Beef Market',
                    type: 'beef',
                    price: '$15-25',
                    description: 'Premium quality beef, fresh daily delivery',
                    sellerName: 'John Smith',
                    products: [],
                },
                {
                    id: 'sample-store-2',
                    latitude: 37.79025,
                    longitude: -122.4304,
                    name: 'Ocean Fresh Fish',
                    type: 'fish',
                    price: '$12-20',
                    description: 'Freshly caught fish from local waters',
                    sellerName: 'Maria Garcia',
                    products: [],
                },
                {
                    id: 'sample-store-3',
                    latitude: 37.78425,
                    longitude: -122.4384,
                    name: 'Prime Cuts',
                    type: 'beef',
                    price: '$20-30',
                    description: 'Organic grass-fed beef',
                    sellerName: 'David Wilson',
                    products: [],
                },
                {
                    id: 'sample-store-4',
                    latitude: 37.79225,
                    longitude: -122.4284,
                    name: 'Seafood Paradise',
                    type: 'fish',
                    price: '$8-18',
                    description: 'Wide variety of fresh seafood',
                    sellerName: 'Lisa Chen',
                    products: [],
                },
            ];
            // Save initial data
            this.saveToStorage();
        }
    }

    // Store management methods
    getStores(): Store[] {
        return [...this.stores];
    }

    async addStore(storeData: Omit<Store, 'id' | 'products'>): Promise<Store> {
        await this.ensureInitialized();

        const newStore: Store = {
            ...storeData,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            products: [],
        };

        this.stores.push(newStore);
        await this.saveToStorage();
        this.notifyListeners();
        return newStore;
    }

    async updateStore(storeId: string, storeData: Partial<Store>): Promise<Store | null> {
        await this.ensureInitialized();

        const index = this.stores.findIndex(store => store.id === storeId);
        if (index === -1) return null;

        this.stores[index] = { ...this.stores[index], ...storeData };
        await this.saveToStorage();
        this.notifyListeners();
        return this.stores[index];
    }

    async deleteStore(storeId: string): Promise<boolean> {
        await this.ensureInitialized();

        const initialLength = this.stores.length;
        this.stores = this.stores.filter(store => store.id !== storeId);

        if (this.stores.length < initialLength) {
            // Also remove reviews for this store
            this.reviews = this.reviews.filter(review => review.storeId !== storeId);
            await this.saveToStorage();
            this.notifyListeners();
            return true;
        }
        return false;
    }

    getStore(storeId: string): Store | null {
        return this.stores.find(store => store.id === storeId) || null;
    }

    // Review management methods
    getReviews(): Review[] {
        return [...this.reviews];
    }

    getStoreReviews(storeId: string): Review[] {
        return this.reviews.filter(review => review.storeId === storeId);
    }

    async addReview(reviewData: Omit<Review, 'id' | 'date'>): Promise<Review> {
        await this.ensureInitialized();

        const newReview: Review = {
            ...reviewData,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            date: new Date().toISOString(),
        };

        this.reviews.push(newReview);
        await this.saveToStorage();
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

    // Clear all data (for testing purposes)
    async clearAllData(): Promise<void> {
        this.stores = [];
        this.reviews = [];
        await this.saveToStorage();
        this.notifyListeners();
    }

    // Get initialization status
    getInitializationStatus(): boolean {
        return this.isInitialized;
    }
}

// Export singleton instance
export const dataStore = new DataStore(); 