package com.company.event.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void initialize() {
        // If Firebase is already initialized (e.g. hot-reload), skip
        if (!FirebaseApp.getApps().isEmpty()) {
            System.out.println("🔥 Firebase Admin already initialized");
            return;
        }

        // ── Attempt 1: Service account JSON from classpath ───────────────────
        try {
            InputStream serviceAccount = getClass().getClassLoader()
                    .getResourceAsStream("firebase-service-account.json");

            if (serviceAccount != null) {
                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .setProjectId("eventproject-main")
                        .build();
                FirebaseApp.initializeApp(options);
                System.out.println("🔥 Firebase Admin initialized with service account");
                return;
            }
        } catch (Exception e) {
            System.err.println("⚠️ Service account JSON load failed: " + e.getMessage());
        }

        // ── Attempt 2: Application Default Credentials (GCP / gcloud CLI) ───
        try {
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.getApplicationDefault())
                    .setProjectId("eventproject-main")
                    .build();
            FirebaseApp.initializeApp(options);
            System.out.println("🔥 Firebase Admin initialized with application default credentials");
            return;
        } catch (IOException e) {
            System.err.println("⚠️ Application default credentials not found: " + e.getMessage());
        }

        // ── Fallback: No credentials — Firebase token verification disabled ──
        // The app will still run; JwtAuthFilter will fall back to custom JWT for all
        // requests.
        System.err.println("⚠️ Firebase Admin NOT initialized — running in JWT-only mode.");
        System.err.println(
                "   To enable Firebase token verification, add src/main/resources/firebase-service-account.json");
        System.err.println(
                "   Download it from: Firebase Console → Project Settings → Service Accounts → Generate new private key");
    }
}
