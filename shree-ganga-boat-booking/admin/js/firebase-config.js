// ==========================================
// Firebase Configuration
// Replace with your own Firebase project config
// ==========================================

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
let db = null;
let auth = null;
let firebaseApp = null;

function initFirebase() {
    if (typeof firebase !== 'undefined') {
        try {
            firebaseApp = firebase.initializeApp(firebaseConfig);
            db = firebase.firestore();
            auth = firebase.auth();
            
            // Enable offline persistence
            db.enablePersistence({ synchronizeTabs: true })
                .catch(err => console.warn('Firestore persistence:', err));
            
            console.log('✅ Firebase initialized successfully');
            return true;
        } catch (error) {
            console.warn('Firebase init error:', error);
            return false;
        }
    } else {
        console.warn('Firebase SDK not loaded, using localStorage fallback');
        return false;
    }
}

// ==========================================
// Local Storage Database (Fallback / Primary)
// ==========================================

const DB = {
    // Get all bookings
    getBookings() {
        try {
            return JSON.parse(localStorage.getItem('gangaRide_bookings') || '[]');
        } catch {
            return [];
        }
    },
    
    // Save a booking
    saveBooking(booking) {
        const bookings = this.getBookings();
        bookings.push(booking);
        localStorage.setItem('gangaRide_bookings', JSON.stringify(bookings));
        
        // Also update Firestore if available
        if (db) {
            db.collection('bookings').doc(booking.ticketId).set(booking)
                .catch(err => console.error('Firestore save error:', err));
        }
        return booking;
    },
    
    // Update booking status
    updateBookingStatus(ticketId, status, paymentStatus) {
        const bookings = this.getBookings();
        const index = bookings.findIndex(b => b.ticketId === ticketId);
        if (index !== -1) {
            if (status) bookings[index].status = status;
            if (paymentStatus) bookings[index].paymentStatus = paymentStatus;
            if (status === 'confirmed') bookings[index].confirmedAt = new Date().toISOString();
            bookings[index].updatedAt = new Date().toISOString();
            localStorage.setItem('gangaRide_bookings', JSON.stringify(bookings));
            
            // Update Firestore
            if (db) {
                const updates = {};
                if (status) updates.status = status;
                if (paymentStatus) updates.paymentStatus = paymentStatus;
                updates.updatedAt = new Date().toISOString();
                db.collection('bookings').doc(ticketId).update(updates)
                    .catch(err => console.error('Firestore update error:', err));
            }
            return bookings[index];
        }
        return null;
    },
    
    // Get booking by ticket ID
    getBookingByTicket(ticketId) {
        const bookings = this.getBookings();
        return bookings.find(b => b.ticketId === ticketId) || null;
    },
    
    // Get booking by ticket ID + phone
    getBookingByTicketAndPhone(ticketId, phone) {
        const bookings = this.getBookings();
        return bookings.find(b => 
            b.ticketId === ticketId && 
            (b.phone === phone || b.phone.replace(/[^0-9]/g, '') === phone.replace(/[^0-9]/g, ''))
        ) || null;
    },
    
    // Get all bookings for a phone number
    getCustomerBookings(phone) {
        const bookings = this.getBookings();
        return bookings.filter(b => 
            b.phone.replace(/[^0-9]/g, '') === phone.replace(/[^0-9]/g, '')
        ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    
    // Get stats
    getStats() {
        const bookings = this.getBookings();
        const today = new Date().toDateString();
        const todayBookings = bookings.filter(b => new Date(b.createdAt).toDateString() === today);
        const revenue = bookings.reduce((sum, b) => sum + (b.cost || 0), 0);
        const pending = bookings.filter(b => b.status === 'pending').length;
        const confirmed = bookings.filter(b => b.status === 'confirmed').length;
        
        return {
            total: bookings.length,
            today: todayBookings.length,
            revenue,
            pending,
            confirmed,
            rejected: bookings.filter(b => b.status === 'rejected').length,
            completed: bookings.filter(b => b.status === 'completed').length
        };
    }
};

// ==========================================
// Generate Ticket ID
// ==========================================

function generateTicketId() {
    const year = new Date().getFullYear();
    const bookings = DB.getBookings();
    const yearBookings = bookings.filter(b => b.ticketId && b.ticketId.startsWith(`BK${year}`));
    const nextNumber = yearBookings.length + 1;
    return `BK${year}-${String(nextNumber).padStart(4, '0')}`;
}

// ==========================================
// Initialize on load
// ==========================================

// Try to initialize Firebase (non-blocking)
if (typeof firebase !== 'undefined') {
    initFirebase();
}