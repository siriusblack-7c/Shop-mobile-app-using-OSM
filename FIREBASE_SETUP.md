# Firebase Setup Guide

This guide will help you set up Firebase for your React Native map application.

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "map-store-app")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Register Your App

1. In your Firebase project, click the web icon (</>) to add a web app
2. Enter an app nickname (e.g., "Map Store App")
3. You don't need to set up Firebase Hosting for now
4. Click "Register app"

## Step 3: Get Your Configuration

After registering, you'll see a configuration object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id-here"
};
```

## Step 4: Update Your Config File

1. Open `config/firebase.ts` in your project
2. Replace the placeholder values with your actual Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Step 5: Enable Authentication

1. In the Firebase Console, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" authentication:
   - Click on "Email/Password"
   - Toggle "Enable"
   - Click "Save"

## Step 6: Set Up Firestore Database

1. In the Firebase Console, go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" for now (we'll add security rules later)
4. Select a location for your database (choose the one closest to your users)
5. Click "Done"

## Step 7: Configure Firestore Security Rules

1. In Firestore, go to the "Rules" tab
2. Replace the default rules with these security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Anyone can read stores (for buyers to find them)
    match /stores/{storeId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (resource == null || resource.data.sellerId == request.auth.uid);
    }
    
    // Anyone can read products (for buyers to see them)
    match /products/{productId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/stores/$(resource.data.storeId)) &&
        get(/databases/$(database)/documents/stores/$(resource.data.storeId)).data.sellerId == request.auth.uid;
    }
    
    // Reviews can be read by anyone, written by authenticated users
    match /reviews/{reviewId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.buyerId;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.buyerId;
    }
  }
}
```

3. Click "Publish"

## Step 8: Test Your Setup

1. Start your React Native app: `npm start`
2. Try registering a new account
3. Try logging in with the account you created
4. Verify that the user appears in Firebase Authentication
5. Check that user data is created in Firestore

## Firestore Collections Structure

Your Firestore database will have these collections:

### users
```
{
  uid: string,
  email: string,
  displayName: string,
  userType: 'buyer' | 'seller',
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### stores
```
{
  id: string,
  latitude: number,
  longitude: number,
  name: string,
  type: 'beef' | 'fish',
  price: string,
  description: string,
  sellerName: string,
  sellerId: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### products
```
{
  id: string,
  name: string,
  price: string,
  description: string,
  picture?: string,
  storeId: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### reviews
```
{
  id: string,
  storeId: string,
  buyerId: string,
  buyerName: string,
  rating: number,
  comment: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Optional: Set Up Firebase CLI

For advanced features and deployment:

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Initialize Firebase in your project: `firebase init`

## Troubleshooting

### Common Issues:

1. **"Firebase: Error (auth/invalid-api-key)"**
   - Check that your API key in `config/firebase.ts` is correct

2. **"Firebase: Error (auth/project-not-found)"**
   - Verify your projectId in the config

3. **"Firebase: Error (auth/network-request-failed)"**
   - Check your internet connection
   - Verify your Firebase project is active

4. **Firestore permission errors**
   - Make sure you published the security rules
   - Check that the user is authenticated before making requests

5. **"Firebase: Error (auth/web-storage-unsupported)"**
   - This can happen in development. Try clearing your browser/simulator cache

## Next Steps

Once Firebase is set up:

1. Test user registration and login
2. Test creating stores (seller mode)
3. Test viewing stores (buyer mode)
4. Test adding reviews
5. Consider setting up Firebase Storage for product images
6. Set up proper security rules for production

## Environment Variables (Optional)

For better security, you can use environment variables:

1. Create a `.env` file in your root directory
2. Add your Firebase config:
```
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-auth-domain
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-storage-bucket
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
```

3. Update your config file to use these variables (requires additional setup for React Native)

Remember to add `.env` to your `.gitignore` file to keep your credentials secure! 