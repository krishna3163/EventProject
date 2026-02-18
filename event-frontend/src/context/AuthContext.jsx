import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    getIdToken,
    GoogleAuthProvider,
    signInWithPopup,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    signInAnonymously
} from 'firebase/auth';
import { auth } from '../firebase';
import { toast } from 'react-toastify';
import api, { apiService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Get fresh info from our MongoDB backend
                try {
                    const token = await getIdToken(firebaseUser);
                    localStorage.setItem('token', token);

                    const response = await apiService.user.getMe();
                    const userData = {
                        ...response.data,
                        uid: firebaseUser.uid,
                    };
                    setUser(userData);
                    localStorage.setItem('user', JSON.stringify(userData));
                } catch (error) {
                    console.error("Auth sync error:", error);
                    // If user exists in Firebase but not in MongoDB, we might need to sync
                    setUser({
                        id: firebaseUser.uid,
                        username: firebaseUser.email.split('@')[0],
                        email: firebaseUser.email,
                        role: 'STUDENT' // Default
                    });
                }
            } else {
                setUser(null);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const login = async (emailOrUsername, password) => {
        // â”€â”€ Try Firebase first (for real registered users) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        // Resolve shorthand demo names to emails
        let email = emailOrUsername;
        if (email.toLowerCase() === 'admin') email = 'admin@eventhub.com';
        if (email.toLowerCase() === 'student') email = 'student@demo.com';

        try {
            // Firebase login path
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const token = await getIdToken(userCredential.user);
            localStorage.setItem('token', token);

            // Sync with MongoDB backend to get role and profile
            const response = await apiService.user.getMe();
            const userData = { ...response.data, uid: userCredential.user.uid };
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return userData;
        } catch (firebaseError) {
            // â”€â”€ Fallback: Custom JWT login (for seeded MongoDB-only accounts) â”€â”€
            // e.g. admin/admin123, student/student123 seeded by DataInitializer
            console.warn('Firebase login failed, trying custom JWT:', firebaseError.code);
            try {
                const response = await apiService.auth.login(emailOrUsername, password);
                const { token, ...userData } = response.data;
                localStorage.setItem('token', token);
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                return userData;
            } catch (jwtError) {
                // Both failed â€” throw the original Firebase error for better UX messaging
                throw firebaseError;
            }
        }
    };

    const registerStudent = async (formData) => {
        const { email, password, name } = formData;
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const token = await getIdToken(userCredential.user);
        localStorage.setItem('token', token);

        // Register in our MongoDB backend too
        const response = await apiService.auth.registerStudent({
            ...formData,
            firebaseUid: userCredential.user.uid
        });

        setUser(response.data);
        return response.data;
    };

    const registerOrganization = async (formData) => {
        const { email, password } = formData;
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const token = await getIdToken(userCredential.user);
        localStorage.setItem('token', token);

        // Register in our MongoDB backend
        const response = await apiService.auth.registerOrganization({
            ...formData,
            firebaseUid: userCredential.user.uid
        });

        setUser(response.data);
        return response.data;
    };

    const signup = async (userData) => {
        return registerStudent({
            name: `${userData.firstName} ${userData.lastName}`,
            email: userData.email,
            password: userData.password,
            username: userData.username,
        });
    };

    // Helper: Sync external Firebase user with MongoDB
    const _syncUserWithBackend = async (firebaseUser) => {
        const token = await getIdToken(firebaseUser);
        localStorage.setItem('token', token);

        try {
            // Try to fetch existing user profile
            const response = await apiService.user.getMe();
            const userData = { ...response.data, uid: firebaseUser.uid };
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return userData;
        } catch (error) {
            // User likely doesn't exist in MongoDB â€” auto-register as STUDENT
            console.warn("User missing in MongoDB, auto-registering...");

            const randomSuffix = Math.random().toString(36).substring(2, 8);
            const email = firebaseUser.email ||
                (firebaseUser.phoneNumber ? `${firebaseUser.phoneNumber}@phone.active` : `guest_${randomSuffix}@anon.active`);
            const name = firebaseUser.displayName ||
                (firebaseUser.isAnonymous ? 'Guest User' : 'New User');

            const payload = {
                name,
                email,
                username: `user_${firebaseUser.uid.substring(0, 6)}`,
                password: 'firebase_auto_generated',
                role: 'STUDENT',
                firebaseUid: firebaseUser.uid
            };

            try {
                const regResponse = await apiService.auth.registerStudent(payload);
                setUser(regResponse.data);
                return regResponse.data;
            } catch (regError) {
                console.error("Auto-registration failed:", regError);
                toast.error("Account setup failed. Please contact support.");
                throw regError;
            }
        }
    };

    // â”€â”€ Social / Phone / Anon Auth â”€â”€

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            return await _syncUserWithBackend(result.user);
        } catch (error) {
            console.error("Google login error:", error);
            throw error;
        }
    };

    const setupRecaptcha = (elementId) => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
                'size': 'invisible',
                'callback': () => { }
            });
        }
    };

    const loginWithPhone = async (phoneNumber) => {
        try {
            // applicationVerifier must be passed
            if (!window.recaptchaVerifier) setupRecaptcha('recaptcha-container');
            const appVerifier = window.recaptchaVerifier;
            const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
            window.confirmationResult = confirmationResult;
            return confirmationResult;
        } catch (error) {
            console.error("Phone auth error:", error);
            throw error;
        }
    };

    const verifyPhoneOtp = async (otp) => {
        try {
            const result = await window.confirmationResult.confirm(otp);
            return await _syncUserWithBackend(result.user);
        } catch (error) {
            console.error("OTP verification error:", error);
            throw error;
        }
    };

    const loginAnonymouslyUser = async () => {
        try {
            const result = await signInAnonymously(auth);
            return await _syncUserWithBackend(result.user);
        } catch (error) {
            console.error("Anonymous login error:", error);
            throw error;
        }
    };


    const logout = async () => {
        if (window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
            window.recaptchaVerifier = null;
        }
        await signOut(auth);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.info('Logged out successfully');
    };

    const resetPassword = async (email) => {
        await sendPasswordResetEmail(auth, email);
        toast.success('Password reset email sent!');
    };

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'ORG_ADMIN' || user?.role === 'SUPER_ADMIN';
    const isOrgAdmin = user?.role === 'ORG_ADMIN';
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    const isStudent = user?.role === 'STUDENT' || user?.role === 'USER';

    const value = {
        user,
        loading,
        login,
        signup,
        registerStudent,
        registerOrganization,
        logout,
        resetPassword,
        isAdmin,
        isOrgAdmin,
        isSuperAdmin,
        isStudent,
        isAuthenticated: !!user,
        loginWithGoogle,
        loginWithPhone,
        verifyPhoneOtp,
        loginAnonymouslyUser,
        setupRecaptcha
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
