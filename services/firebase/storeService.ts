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

export interface Product {
    id: string;
    name: string;
    price: string;
    description: string;
    picture?: string;
    storeId: string;
    createdAt: string;
    updatedAt: string;
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
    sellerId: string; // Firebase user ID
    products: Product[];
    createdAt: string;
    updatedAt: string;
}

export class StoreService {
    // Create a new store
    static async createStore(storeData: Omit<Store, 'id' | 'sellerId' | 'products' | 'createdAt' | 'updatedAt'>): Promise<Store> {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('User must be authenticated');

            const now = new Date().toISOString();
            const storeDoc = doc(collection(db, 'stores'));

            const store: Store = {
                ...storeData,
                id: storeDoc.id,
                sellerId: user.uid,
                products: [],
                createdAt: now,
                updatedAt: now,
            };

            await setDoc(storeDoc, store);
            return store;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    // Get all stores
    static async getAllStores(): Promise<Store[]> {
        try {
            const querySnapshot = await getDocs(collection(db, 'stores'));
            const stores: Store[] = [];

            for (const doc of querySnapshot.docs) {
                const storeData = doc.data() as Store;
                // Get products for each store
                const products = await this.getStoreProducts(doc.id);
                stores.push({ ...storeData, products });
            }

            return stores;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    // Get stores by seller
    static async getStoresBySeller(sellerId?: string): Promise<Store[]> {
        try {
            const userId = sellerId || auth.currentUser?.uid;
            if (!userId) throw new Error('User ID required');

            const q = query(
                collection(db, 'stores'),
                where('sellerId', '==', userId),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const stores: Store[] = [];

            for (const doc of querySnapshot.docs) {
                const storeData = doc.data() as Store;
                // Get products for each store
                const products = await this.getStoreProducts(doc.id);
                stores.push({ ...storeData, products });
            }

            return stores;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    // Get a single store
    static async getStore(storeId: string): Promise<Store | null> {
        try {
            const storeDoc = await getDoc(doc(db, 'stores', storeId));
            if (!storeDoc.exists()) return null;

            const storeData = storeDoc.data() as Store;
            const products = await this.getStoreProducts(storeId);

            return { ...storeData, products };
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    // Update a store
    static async updateStore(storeId: string, updates: Partial<Store>): Promise<void> {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('User must be authenticated');

            // Verify ownership
            const storeDoc = await getDoc(doc(db, 'stores', storeId));
            if (!storeDoc.exists()) throw new Error('Store not found');

            const storeData = storeDoc.data() as Store;
            if (storeData.sellerId !== user.uid) {
                throw new Error('Unauthorized to update this store');
            }

            const updatedData = {
                ...updates,
                updatedAt: new Date().toISOString(),
            };

            await updateDoc(doc(db, 'stores', storeId), updatedData);
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    // Delete a store
    static async deleteStore(storeId: string): Promise<void> {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('User must be authenticated');

            // Verify ownership
            const storeDoc = await getDoc(doc(db, 'stores', storeId));
            if (!storeDoc.exists()) throw new Error('Store not found');

            const storeData = storeDoc.data() as Store;
            if (storeData.sellerId !== user.uid) {
                throw new Error('Unauthorized to delete this store');
            }

            // Delete all products first
            await this.deleteAllStoreProducts(storeId);

            // Delete the store
            await deleteDoc(doc(db, 'stores', storeId));
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    // Add product to store
    static async addProduct(storeId: string, productData: Omit<Product, 'id' | 'storeId' | 'createdAt' | 'updatedAt'>): Promise<Product> {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('User must be authenticated');

            // Verify store ownership
            const storeDoc = await getDoc(doc(db, 'stores', storeId));
            if (!storeDoc.exists()) throw new Error('Store not found');

            const storeData = storeDoc.data() as Store;
            if (storeData.sellerId !== user.uid) {
                throw new Error('Unauthorized to add products to this store');
            }

            const now = new Date().toISOString();
            const productDoc = doc(collection(db, 'products'));

            const product: Product = {
                ...productData,
                id: productDoc.id,
                storeId,
                createdAt: now,
                updatedAt: now,
            };

            await setDoc(productDoc, product);
            return product;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    // Get products for a store
    static async getStoreProducts(storeId: string): Promise<Product[]> {
        try {
            const q = query(
                collection(db, 'products'),
                where('storeId', '==', storeId),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => doc.data() as Product);
        } catch (error: any) {
            console.error('Error getting store products:', error);
            return [];
        }
    }

    // Update product
    static async updateProduct(productId: string, updates: Partial<Product>): Promise<void> {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('User must be authenticated');

            // Verify ownership through store
            const productDoc = await getDoc(doc(db, 'products', productId));
            if (!productDoc.exists()) throw new Error('Product not found');

            const productData = productDoc.data() as Product;
            const storeDoc = await getDoc(doc(db, 'stores', productData.storeId));

            if (!storeDoc.exists()) throw new Error('Store not found');
            const storeData = storeDoc.data() as Store;

            if (storeData.sellerId !== user.uid) {
                throw new Error('Unauthorized to update this product');
            }

            const updatedData = {
                ...updates,
                updatedAt: new Date().toISOString(),
            };

            await updateDoc(doc(db, 'products', productId), updatedData);
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    // Delete product
    static async deleteProduct(productId: string): Promise<void> {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('User must be authenticated');

            // Verify ownership through store
            const productDoc = await getDoc(doc(db, 'products', productId));
            if (!productDoc.exists()) throw new Error('Product not found');

            const productData = productDoc.data() as Product;
            const storeDoc = await getDoc(doc(db, 'stores', productData.storeId));

            if (!storeDoc.exists()) throw new Error('Store not found');
            const storeData = storeDoc.data() as Store;

            if (storeData.sellerId !== user.uid) {
                throw new Error('Unauthorized to delete this product');
            }

            await deleteDoc(doc(db, 'products', productId));
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    // Delete all products for a store (used when deleting store)
    private static async deleteAllStoreProducts(storeId: string): Promise<void> {
        try {
            const q = query(collection(db, 'products'), where('storeId', '==', storeId));
            const querySnapshot = await getDocs(q);

            const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);
        } catch (error: any) {
            console.error('Error deleting store products:', error);
        }
    }
} 