// ===============================
// CESIUM BIM VIEWER - FIREBASE AUTH MODULE v1.1
// Simple Email/Password Login Protection
// FIXED: Now initializes Comments module after login
// ===============================
'use strict';

(function() {
  
  console.log('🔐 Loading Firebase Auth module v1.1...');

  // =====================================
  // FIREBASE AUTH CONFIG
  // Uses the same project as comments!
  // =====================================
  
  const FIREBASE_AUTH_CONFIG = {
    apiKey: "AIzaSyAL409coGn10I8afll2aae5vuvog_qVWZA",
    authDomain: "publictwin-ad6c7.firebaseapp.com",
    projectId: "publictwin-ad6c7",
    storageBucket: "publictwin-ad6c7.firebasestorage.app",
    messagingSenderId: "151464184627",
    appId: "1:151464184627:web:4de03973466ef510eecc46"
  };

  // =====================================
  // AUTH STATE
  // =====================================
  
  window.BimAuth = {
    currentUser: null,
    initialized: false,
    app: null,
    
    // Initialize Firebase Auth
    init: function() {
      if (this.initialized) {
        console.log('🔐 Auth already initialized');
        return;
      }
      
      if (typeof firebase === 'undefined') {
        console.error('❌ Firebase SDK not loaded!');
        this.showError('Firebase SDK not loaded');
        return;
      }
      
      try {
        // Check if Firebase is already initialized (from comments.js)
        if (firebase.apps.length === 0) {
          this.app = firebase.initializeApp(FIREBASE_AUTH_CONFIG);
        } else {
          this.app = firebase.apps[0];
        }
        
        this.initialized = true;
        console.log('✅ Firebase Auth initialized');
        
        // Listen for auth state changes
        firebase.auth().onAuthStateChanged((user) => {
          this.currentUser = user;
          
          if (user) {
            console.log('✅ User logged in:', user.email);
            this.hideLoginScreen();
            this.showApp();
            this.updateUserBadge(user);
          } else {
            console.log('❌ No user logged in');
            this.showLoginScreen();
            this.hideApp();
          }
        });
        
      } catch (error) {
        console.error('❌ Firebase Auth init error:', error);
        this.showError('Firebase initialization failed: ' + error.message);
      }
    },
    
    // Login with email/password
    login: async function(email, password) {
      if (!this.initialized) {
        this.showError('Auth not initialized');
        return false;
      }
      
      this.showLoginLoading(true);
      this.hideError();
      
      try {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        console.log('✅ Login successful:', userCredential.user.email);
        return true;
        
      } catch (error) {
        console.error('❌ Login error:', error);
        
        let message = 'Login fehlgeschlagen';
        switch(error.code) {
          case 'auth/user-not-found':
            message = 'Benutzer nicht gefunden';
            break;
          case 'auth/wrong-password':
            message = 'Falsches Passwort';
            break;
          case 'auth/invalid-email':
            message = 'Ungültige E-Mail-Adresse';
            break;
          case 'auth/too-many-requests':
            message = 'Zu viele Versuche. Bitte später erneut versuchen.';
            break;
          case 'auth/invalid-credential':
            message = 'Ungültige Anmeldedaten';
            break;
          case 'auth/network-request-failed':
            message = 'Netzwerkfehler. Bitte Verbindung prüfen.';
            break;
        }
        
        this.showError(message);
        return false;
        
      } finally {
        this.showLoginLoading(false);
      }
    },
    
    // Logout
    logout: async function() {
      try {
        await firebase.auth().signOut();
        console.log('✅ Logout successful');
        return true;
      } catch (error) {
        console.error('❌ Logout error:', error);
        return false;
      }
    },
    
    // UI Functions
    showLoginScreen: function() {
      const loginScreen = document.getElementById('loginScreen');
      if (loginScreen) {
        loginScreen.style.display = 'flex';
      }
    },
    
    hideLoginScreen: function() {
      const loginScreen = document.getElementById('loginScreen');
      if (loginScreen) {
        loginScreen.style.display = 'none';
      }
    },
    
    showApp: function() {
      const cesiumContainer = document.getElementById('cesiumContainer');
      const toolbar = document.getElementById('toolbar');
      
      if (cesiumContainer) cesiumContainer.style.display = 'block';
      if (toolbar) toolbar.style.display = 'block';
      
      // ✅ NEU v1.1: Comments-Modul initialisieren nach erfolgreichem Login
      // Warte kurz, damit BimViewer vollständig geladen ist
      setTimeout(() => {
        if (typeof BimViewer !== 'undefined' && typeof BimViewer.initFirebase === 'function') {
          console.log('🔐 Initializing Comments module after login...');
          BimViewer.initFirebase();
        } else {
          console.warn('⚠️ BimViewer.initFirebase not available yet, retrying...');
          // Retry nach weiteren 500ms
          setTimeout(() => {
            if (typeof BimViewer !== 'undefined' && typeof BimViewer.initFirebase === 'function') {
              BimViewer.initFirebase();
            }
          }, 500);
        }
      }, 100);
      
      // Show all other UI elements
      document.querySelectorAll('.mode-indicator, .status-indicator, #commentDialog, #infoBoxCustom').forEach(el => {
        // Don't change display, just allow them to be shown when needed
      });
    },
    
    hideApp: function() {
      const cesiumContainer = document.getElementById('cesiumContainer');
      const toolbar = document.getElementById('toolbar');
      
      if (cesiumContainer) cesiumContainer.style.display = 'none';
      if (toolbar) toolbar.style.display = 'none';
      
      // Hide all overlays
      document.querySelectorAll('.mode-indicator, .status-indicator, #commentDialog, #infoBoxCustom').forEach(el => {
        if (el.classList.contains('active')) {
          el.classList.remove('active');
        }
      });
    },
    
    showError: function(message) {
      const errorEl = document.getElementById('loginError');
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
      }
    },
    
    hideError: function() {
      const errorEl = document.getElementById('loginError');
      if (errorEl) {
        errorEl.style.display = 'none';
      }
    },
    
    showLoginLoading: function(show) {
      const btn = document.getElementById('loginBtn');
      const spinner = document.getElementById('loginSpinner');
      const btnText = document.getElementById('loginBtnText');
      
      if (btn) btn.disabled = show;
      if (spinner) spinner.style.display = show ? 'inline-block' : 'none';
      if (btnText) btnText.textContent = show ? 'Anmelden...' : 'Anmelden';
    },
    
    updateUserBadge: function(user) {
      const badge = document.getElementById('userBadge');
      const emailSpan = document.getElementById('userEmail');
      
      if (badge && user) {
        badge.style.display = 'flex';
        if (emailSpan) {
          emailSpan.textContent = user.email;
        }
      } else if (badge) {
        badge.style.display = 'none';
      }
    },
    
    // Get current user
    getCurrentUser: function() {
      return this.currentUser;
    },
    
    // Check if logged in
    isLoggedIn: function() {
      return this.currentUser !== null;
    },
    
    // ✅ NEU v1.1: Passwort zurücksetzen
    resetPassword: async function(email) {
      if (!email) {
        this.showError('Bitte E-Mail-Adresse eingeben');
        return false;
      }
      
      try {
        await firebase.auth().sendPasswordResetEmail(email);
        alert('Passwort-Reset E-Mail wurde gesendet!');
        return true;
      } catch (error) {
        console.error('❌ Password reset error:', error);
        
        let message = 'Fehler beim Zurücksetzen';
        switch(error.code) {
          case 'auth/user-not-found':
            message = 'E-Mail-Adresse nicht gefunden';
            break;
          case 'auth/invalid-email':
            message = 'Ungültige E-Mail-Adresse';
            break;
        }
        
        this.showError(message);
        return false;
      }
    }
  };

  // =====================================
  // SETUP LOGIN FORM
  // =====================================
  
  document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
          BimAuth.showError('Bitte E-Mail und Passwort eingeben');
          return;
        }
        
        await BimAuth.login(email, password);
      });
    }
    
    // Initialize auth after a short delay to ensure Firebase SDK is ready
    setTimeout(() => {
      BimAuth.init();
    }, 100);
  });

  console.log('✅ Firebase Auth module loaded (v1.1)');
  console.log('💡 Usage:');
  console.log('   - BimAuth.login(email, password)');
  console.log('   - BimAuth.logout()');
  console.log('   - BimAuth.getCurrentUser()');
  console.log('   - BimAuth.isLoggedIn()');
  console.log('   - BimAuth.resetPassword(email)');

})();
