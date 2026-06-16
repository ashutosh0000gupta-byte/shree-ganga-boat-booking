// ==========================================
// WhatsApp Business Automation
// Uses official WhatsApp Business API via wa.me links
// ==========================================

const WHATSAPP_NUMBER = "919170409773";
const WHATSAPP_OWNER = "919170409773";

const WhatsApp = {
    // Send booking confirmation to customer
    sendCustomerConfirmation(booking) {
        const message = [
            `✅ *Booking Confirmed - GangaRide*`,
            ``,
            `Dear ${booking.name},`,
            `Your booking has been confirmed successfully!`,
            ``,
            `🎫 *Ticket ID:* ${booking.ticketId}`,
            `📋 *Service:* ${booking.service}`,
            `📅 *Date:* ${booking.date}`,
            `⏰ *Time:* ${booking.time}`,
            `👥 *Guests:* ${booking.adults} Adults, ${booking.children} Children, ${booking.infants} Infants`,
            `📍 *Pickup:* ${booking.pickupLocation || 'Not specified'}`,
            `💰 *Amount:* ₹${booking.cost?.toLocaleString('en-IN') || '0'}`,
            `📊 *Status:* ${booking.status?.toUpperCase() || 'PENDING'}`,
            ``,
            `📱 *Check your booking status:*`,
            `${window.location.origin}/booking-status.html`,
            ``,
            `🙏 Thank you for choosing GangaRide!`,
            `🌐 www.gangaride.com`
        ].join('\n');
        
        return this.sendMessage(booking.phone, message);
    },

    // Send booking details to owner
    sendOwnerNotification(booking) {
        const message = [
            `🔔 *New Booking Alert - GangaRide*`,
            ``,
            `🎫 *Ticket ID:* ${booking.ticketId}`,
            `👤 *Name:* ${booking.name}`,
            `📞 *Phone:* ${booking.phone}`,
            `✉️ *Email:* ${booking.email || 'N/A'}`,
            `📋 *Service:* ${booking.service}`,
            `📅 *Date:* ${booking.date}`,
            `⏰ *Time:* ${booking.time}`,
            `👥 *Adults:* ${booking.adults}`,
            `👶 *Children:* ${booking.children}`,
            `👼 *Infants:* ${booking.infants}`,
            `📍 *Pickup:* ${booking.pickupLocation || 'Not specified'}`,
            `📝 *Special Requests:* ${booking.specialRequests || 'None'}`,
            `💰 *Cost:* ₹${(booking.cost || 0).toLocaleString('en-IN')}`,
            `💳 *Payment:* ${booking.paymentMethod || booking.payment || 'Not specified'}`,
            `📊 *Status:* ${booking.status?.toUpperCase() || 'PENDING'}`,
            ``,
            `🔗 *Admin Dashboard:*`,
            `${window.location.origin}/admin/`
        ].join('\n');
        
        return this.sendMessage(WHATSAPP_OWNER, message);
    },

    // Send status update to customer
    sendStatusUpdate(booking) {
        const statusEmojis = {
            'pending': '⏳',
            'confirmed': '✅',
            'rejected': '❌',
            'completed': '🎉'
        };
        
        const emoji = statusEmojis[booking.status] || '📋';
        
        const message = [
            `${emoji} *Booking Update - GangaRide*`,
            ``,
            `Dear ${booking.name},`,
            `Your booking status has been updated.`,
            ``,
            `🎫 *Ticket ID:* ${booking.ticketId}`,
            `📋 *Service:* ${booking.service}`,
            `📅 *Date:* ${booking.date}`,
            `📊 *New Status:* *${booking.status?.toUpperCase()}*`,
            ``,
            `💳 *Payment Status:* ${booking.paymentStatus || 'Pending'}`,
            ``,
            `📱 *Check status:* ${window.location.origin}/booking-status.html`,
            ``,
            `🙏 Thank you for choosing GangaRide!`,
            `🌐 www.gangaride.com`
        ].join('\n');
        
        return this.sendMessage(booking.phone, message);
    },

    // Send message via WhatsApp
    sendMessage(phone, message) {
        const cleanedPhone = phone.replace(/[^0-9]/g, '');
        const encodedMessage = encodeURIComponent(message);
        const url = `https://wa.me/${cleanedPhone}?text=${encodedMessage}`;
        
        // Open in new window
        window.open(url, '_blank', 'noopener,noreferrer');
        return url;
    },

    // Send payment receipt
    sendPaymentReceipt(booking) {
        const message = [
            `🧾 *Payment Receipt - GangaRide*`,
            ``,
            `Dear ${booking.name},`,
            `Your payment has been received successfully.`,
            ``,
            `🎫 *Ticket ID:* ${booking.ticketId}`,
            `📋 *Service:* ${booking.service}`,
            `💰 *Amount Paid:* ₹${(booking.cost || 0).toLocaleString('en-IN')}`,
            `💳 *Payment Method:* ${booking.paymentStatus || 'UPI'}`,
            `📊 *Booking Status:* ${booking.status?.toUpperCase() || 'CONFIRMED'}`,
            ``,
            `🙏 Thank you for your payment!`,
            `🌐 www.gangaride.com`
        ].join('\n');
        
        return this.sendMessage(booking.phone, message);
    },

    // Check if WhatsApp is available
    isAvailable() {
        return true; // wa.me links always work
    }
};