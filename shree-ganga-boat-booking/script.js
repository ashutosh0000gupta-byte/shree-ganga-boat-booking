/* ==========================================
   EXISTING BOOKING FORM LOGIC (PRESERVED)
   ========================================== */

const bookingForm = document.getElementById("bookingForm");
const formMessage = document.getElementById("formMessage");
const tourType = document.getElementById("tourType");
const rideDate = document.getElementById("rideDate");
const rideTime = document.getElementById("rideTime");
const adultsInput = document.getElementById("adults");
const childrenInput = document.getElementById("children");
const infantsInput = document.getElementById("infants");
const guestsInput = document.getElementById("guests");
const summaryTour = document.getElementById("summaryTour");
const summaryPassengers = document.getElementById("summaryPassengers");
const summaryCost = document.getElementById("summaryCost");
const upiNote = document.getElementById("upiNote");
const paymentModal = document.getElementById("paymentModal");
const paymentClose = document.getElementById("paymentClose");
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const packageButtons = document.querySelectorAll("[data-tour]");
const paymentOptions = document.querySelectorAll('input[name="payment"]');
const searchWidget = document.getElementById("searchWidget");
const whatsappNumber = "919170409773";

const seats = {
    sunrise: 20,
    aarti: 20
};

const tourNames = {
    sunrise: "Morning Sunrise Ride",
    aarti: "Evening Ganga Aarti",
    privateBoat: "Private Boat",
    private: "Private Motor Boat",
    cruise: "Alaknanda Cruise",
    luxury: "Luxury Bajra Boat",
    car: "Rental Car Service",
    hotel: "Hotel Booking",
    temple: "Kashi Vishwanath Temple Tour",
    sarnath: "Sarnath Tour",
    airport: "Airport Transfer",
    prayagraj: "Prayagraj Tour",
    ayodhya: "Ayodhya Tour"
};

const defaultTourTimes = {
    sunrise: "05:30",
    aarti: "18:00"
};

const tourPrices = {
    sunrise: 3000,
    aarti: 3500,
    privateBoat: 3000,
    private: 4500,
    cruise: 700,
    luxury: 5000,
    car: 1500,
    hotel: 2000,
    temple: 1500,
    sarnath: 2500,
    airport: 1500,
    prayagraj: 5500,
    ayodhya: 6500
};

const perPersonTours = new Set(["cruise", "luxury"]);

function formatRupees(amount) {
    return `Rs. ${Number(amount || 0).toLocaleString("en-IN")}`;
}

function setMinimumDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    rideDate.min = `${yyyy}-${mm}-${dd}`;
    document.querySelectorAll('input[type="date"]').forEach((input) => {
        input.min = `${yyyy}-${mm}-${dd}`;
    });
}

function updateAvailability() {
    document.getElementById("sunriseSeats").textContent =
        seats.sunrise > 0 ? `${seats.sunrise} seats` : "Fully booked";
    document.getElementById("aartiSeats").textContent =
        seats.aarti > 0 ? `${seats.aarti} seats` : "Fully booked";
}

function showMessage(message, isError = false) {
    if (!formMessage) return;
    formMessage.textContent = message;
    formMessage.style.color = isError ? "#9f1239" : "#094b55";
    formMessage.style.background = isError ? "#ffe4e6" : "#eef6f5";
}

function setDefaultRideTime(selectedTour) {
    if (defaultTourTimes[selectedTour]) {
        rideTime.value = defaultTourTimes[selectedTour];
        rideTime.readOnly = true;
        rideTime.classList.add("is-locked");
        rideTime.setAttribute("aria-label", "Fixed ride time");
    } else {
        rideTime.readOnly = false;
        rideTime.classList.remove("is-locked");
        rideTime.removeAttribute("aria-label");
    }
}

function getPassengerCounts() {
    const adults = Number(adultsInput.value || 0);
    const children = Number(childrenInput.value || 0);
    const infants = Number(infantsInput.value || 0);
    const total = Math.max(1, adults + children + infants);
    return { adults, children, infants, total };
}

function calculateTourCost(selectedTour, passengers) {
    const basePrice = tourPrices[selectedTour] || 0;
    if (perPersonTours.has(selectedTour)) {
        return basePrice * Math.max(1, passengers.adults + passengers.children);
    }
    return basePrice;
}

function updateBookingSummary() {
    const selectedTour = tourType.value;
    const passengers = getPassengerCounts();
    const estimatedCost = calculateTourCost(selectedTour, passengers);
    guestsInput.value = passengers.total;
    summaryTour.textContent = selectedTour
        ? `${tourNames[selectedTour]} selected.`
        : "Select a tour to see estimate.";
    summaryPassengers.textContent = `Total passengers: ${passengers.total} (${passengers.adults} adults, ${passengers.children} children, ${passengers.infants} infants)`;
    summaryCost.textContent = `Estimated cost: ${formatRupees(estimatedCost)}`;
}

function buildUpiPaymentMessage() {
    const formData = new FormData(bookingForm);
    const selectedTour = formData.get("tourType");
    return [
        "Hello, I want to book a Ganga boat ride.",
        "",
        `Name: ${formData.get("name")}`,
        `Phone: ${formData.get("phone")}`,
        `Email: ${formData.get("email") || "Not shared"}`,
        `Tour: ${tourNames[selectedTour] || "Not selected"}`,
        `Date: ${formData.get("rideDate")}`,
        `Time: ${formData.get("rideTime")}`,
        `Adults: ${formData.get("adults")}`,
        `Children: ${formData.get("children")}`,
        `Infants: ${formData.get("infants")}`,
        `Total Passengers: ${formData.get("guests")}`,
        `Pickup: ${formData.get("pickupLocation") || "Not shared"}`,
        `Special Requests: ${formData.get("specialRequests") || "None"}`,
        summaryCost.textContent,
        "Payment: UPI",
        "UPI NO: 9170409773"
    ].join("\n");
}

function openPaymentWhatsApp() {
    const message = encodeURIComponent(buildUpiPaymentMessage());
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank", "noopener");
}

function updatePaymentNote() {
    const selectedPayment = document.querySelector('input[name="payment"]:checked');
    const isUpi = selectedPayment && selectedPayment.value === "UPI";
    upiNote.hidden = !isUpi;
    if (isUpi) {
        paymentModal.hidden = false;
        if (bookingForm.checkValidity()) {
            openPaymentWhatsApp();
        } else {
            showMessage("Fill booking details first, then UPI WhatsApp will send full details.", true);
        }
    } else {
        paymentModal.hidden = true;
    }
}

function closePaymentWindow() {
    paymentModal.hidden = true;
}

/* ==========================================
   EXISTING EVENT LISTENERS (PRESERVED)
   ========================================== */

navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.classList.toggle("is-active", isOpen);
});

siteNav.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
        siteNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.classList.remove("is-active");
    }
});

function selectService(service, options = {}) {
    if (service === "hotel") {
        const quickDate = options.date || "";
        if (quickDate) document.getElementById("checkIn").value = quickDate;
        document.getElementById("hotel-booking").scrollIntoView({ behavior: "smooth" });
        return;
    }
    if (service === "car" || service === "airport") {
        const quickDate = options.date || "";
        if (quickDate) document.getElementById("pickupDate").value = quickDate;
        document.getElementById("cab-booking").scrollIntoView({ behavior: "smooth" });
        return;
    }
    tourType.value = service;
    if (options.date) rideDate.value = options.date;
    if (options.guests) {
        adultsInput.value = Math.max(1, Number(options.guests || 1));
        childrenInput.value = 0;
        infantsInput.value = 0;
    }
    setDefaultRideTime(service);
    updateBookingSummary();
    document.getElementById("booking").scrollIntoView({ behavior: "smooth" });
    showMessage(`${tourNames[service]} selected.`);
}

packageButtons.forEach((button) => {
    button.addEventListener("click", () => selectService(button.dataset.tour));
});

document.querySelectorAll("[data-count]").forEach((counter) => {
    const finalLabel = counter.textContent;
    const target = Number(counter.dataset.count);
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 48));
    const timer = window.setInterval(() => {
        current += step;
        if (current >= target) {
            counter.textContent = finalLabel;
            window.clearInterval(timer);
            return;
        }
        counter.textContent = target >= 1000 ? `${current.toLocaleString("en-IN")}+` : `${current}+`;
    }, 24);
});

tourType.addEventListener("change", () => {
    setDefaultRideTime(tourType.value);
    updateBookingSummary();
});

[adultsInput, childrenInput, infantsInput].forEach((input) => {
    input.addEventListener("input", updateBookingSummary);
});

searchWidget.addEventListener("submit", (event) => {
    event.preventDefault();
    selectService(
        document.getElementById("quickService").value,
        { date: document.getElementById("quickDate").value, guests: document.getElementById("quickGuests").value }
    );
});

/* ==========================================
   HERO SLIDER
   ========================================== */
let activeSlide = 0;
const heroSlides = document.querySelectorAll(".hero-slide");
const heroDots = document.querySelectorAll(".hero-dot");

function goToSlide(index) {
    if (!heroSlides.length) return;
    heroSlides.forEach((slide) => slide.classList.remove("is-active"));
    heroDots.forEach((dot) => dot.classList.remove("is-active"));
    activeSlide = index;
    heroSlides[activeSlide].classList.add("is-active");
    heroDots[activeSlide].classList.add("is-active");
}

heroDots.forEach((dot) => {
    dot.addEventListener("click", () => goToSlide(Number(dot.dataset.slide)));
});

window.setInterval(() => {
    if (!heroSlides.length) return;
    goToSlide((activeSlide + 1) % heroSlides.length);
}, 4500);

/* ==========================================
   PAYMENT MODAL
   ========================================== */
paymentOptions.forEach((option) => option.addEventListener("change", updatePaymentNote));
paymentClose.addEventListener("click", closePaymentWindow);
paymentModal.addEventListener("click", (event) => { if (event.target === paymentModal) closePaymentWindow(); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closePaymentWindow(); });

/* ==========================================
   HOTEL CALCULATOR
   ========================================== */
function daysBetween(start, end) {
    if (!start || !end) return 1;
    return Math.max(1, Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)));
}

function updateHotelEstimate() {
    const hotelName = document.getElementById("hotelName");
    const hotelRate = document.getElementById("hotelRate");
    const checkIn = document.getElementById("checkIn");
    const checkOut = document.getElementById("checkOut");
    const hotelAdults = document.getElementById("hotelAdults");
    const hotelChildren = document.getElementById("hotelChildren");
    const hotelInfants = document.getElementById("hotelInfants");
    const rooms = document.getElementById("rooms");
    const roomType = document.getElementById("roomType");
    const guestDetails = document.getElementById("guestDetails");
    const hotelSummary = document.getElementById("hotelSummary");
    const hotelWhatsApp = document.getElementById("hotelWhatsApp");

    const nights = daysBetween(checkIn.value, checkOut.value);
    const guests = Number(hotelAdults.value || 0) + Number(hotelChildren.value || 0) + Number(hotelInfants.value || 0);
    const roomCount = Math.max(1, Number(rooms.value || 1));
    const total = nights * roomCount * Number(hotelRate.value || 0);

    hotelSummary.textContent = `${hotelName.value}, ${roomType.value}, ${nights} night(s), ${guests} guest(s), ${roomCount} room(s), ${formatRupees(total)} estimated.`;
    hotelWhatsApp.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent([
        "Hello, I want to book a hotel in Varanasi.",
        "", `Hotel: ${hotelName.value}`, `Room Type: ${roomType.value}`,
        `Check-in: ${checkIn.value || "Not selected"}`, `Check-out: ${checkOut.value || "Not selected"}`,
        `Adults: ${hotelAdults.value}`, `Children: ${hotelChildren.value}`, `Infants: ${hotelInfants.value}`,
        `Rooms: ${rooms.value}`, `Guest Details: ${guestDetails.value || "Not shared"}`,
        `Estimated Cost: ${formatRupees(total)}`
    ].join("\n"))}`;
}

document.querySelectorAll("[data-hotel-select]").forEach((button) => {
    button.addEventListener("click", () => {
        const card = button.closest(".hotel-card, .hotel-compare-card");
        document.getElementById("hotelName").value = card.dataset.hotelName;
        document.getElementById("hotelRate").value = card.dataset.hotelPrice;
        updateHotelEstimate();
        document.getElementById("hotelCalculator").scrollIntoView({ behavior: "smooth", block: "center" });
    });
});

document.querySelectorAll("#hotelCalculator input, #hotelCalculator select, #hotelCalculator textarea").forEach((input) => {
    input.addEventListener("input", updateHotelEstimate);
    input.addEventListener("change", updateHotelEstimate);
});

document.getElementById("hotelCalculator").addEventListener("submit", (event) => event.preventDefault());

/* ==========================================
   CAB CALCULATOR
   ========================================== */
function updateCabEstimate() {
    const vehicleName = document.getElementById("vehicleName");
    const vehicleCapacity = document.getElementById("vehicleCapacity");
    const vehicleRate = document.getElementById("vehicleRate");
    const cabOption = document.getElementById("cabOption");
    const pickupDate = document.getElementById("pickupDate");
    const pickupTime = document.getElementById("pickupTime");
    const cabPickup = document.getElementById("cabPickup");
    const cabDrop = document.getElementById("cabDrop");
    const cabAdults = document.getElementById("cabAdults");
    const cabChildren = document.getElementById("cabChildren");
    const cabInfants = document.getElementById("cabInfants");
    const luggage = document.getElementById("luggage");
    const cabSummary = document.getElementById("cabSummary");
    const cabWhatsApp = document.getElementById("cabWhatsApp");

    const passengers = Number(cabAdults.value || 0) + Number(cabChildren.value || 0) + Number(cabInfants.value || 0);
    const capacity = Number(vehicleCapacity.value || 0);
    const baseRate = Number(vehicleRate.value || 0);
    const optionMultiplier = cabOption.value === "Outstation Tour" ? 1.8 : cabOption.value === "Local Sightseeing" ? 1.35 : 1;
    const total = Math.round(baseRate * optionMultiplier);
    const capacityNote = passengers > capacity ? "Capacity exceeded. Please choose a larger vehicle." : "Capacity suitable.";

    cabSummary.textContent = `${vehicleName.value}, ${capacity} seats, ${cabOption.value}, ${passengers} passenger(s), ${luggage.value} luggage, ${formatRupees(total)} estimated. ${capacityNote}`;
    cabWhatsApp.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent([
        "Hello, I want to book a cab in Varanasi.",
        "", `Vehicle: ${vehicleName.value}`, `Trip Type: ${cabOption.value}`,
        `Pickup Date: ${pickupDate.value || "Not selected"}`, `Pickup Time: ${pickupTime.value || "Not selected"}`,
        `Pickup: ${cabPickup.value || "Not shared"}`, `Drop: ${cabDrop.value || "Not shared"}`,
        `Adults: ${cabAdults.value}`, `Children: ${cabChildren.value}`, `Infants: ${cabInfants.value}`,
        `Luggage: ${luggage.value}`, `Vehicle Capacity: ${capacity} seats`,
        `Estimated Cost: ${formatRupees(total)}`, capacityNote
    ].join("\n"))}`;
}

document.querySelectorAll("[data-vehicle]").forEach((button) => {
    button.addEventListener("click", () => {
        document.querySelectorAll("[data-vehicle]").forEach((item) => item.classList.remove("is-selected"));
        button.classList.add("is-selected");
        document.getElementById("vehicleName").value = button.dataset.vehicle;
        document.getElementById("vehicleCapacity").value = button.dataset.capacity;
        document.getElementById("vehicleRate").value = button.dataset.price;
        updateCabEstimate();
    });
});

document.querySelectorAll("#cabCalculator input, #cabCalculator select").forEach((input) => {
    input.addEventListener("input", updateCabEstimate);
    input.addEventListener("change", updateCabEstimate);
});

document.getElementById("cabCalculator").addEventListener("submit", (event) => event.preventDefault());

/* ==========================================
   INIT
   ========================================== */
setMinimumDate();
updateAvailability();
updateBookingSummary();
updateHotelEstimate();
updateCabEstimate();

// ============================================
// ENHANCED BOOKING SYSTEM (runs after DB loads)
// ============================================
(function initEnhancedBooking() {
    function tryInit() {
        if (typeof DB === 'undefined' || typeof generateTicketId === 'undefined') {
            setTimeout(tryInit, 200);
            return;
        }
        
        // --- MAIN BOOKING FORM ---
        const form = document.getElementById("bookingForm");
        if (form) {
            // Create a new submit button to replace old one (clears old listeners)
            const oldBtn = form.querySelector('.submit-button');
            if (oldBtn) {
                const newBtn = oldBtn.cloneNode(true);
                oldBtn.parentNode.replaceChild(newBtn, oldBtn);
                
                // Prevent default form submission
                form.addEventListener('submit', function(e) { e.preventDefault(); return false; });
                
                // Enhanced submit handler
                newBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    const formData = new FormData(form);
                    const selectedTour = formData.get('tourType');
                    
                    if (!selectedTour) {
                        showMessage("Please select a tour type.", true);
                        return;
                    }
                    
                    const passCounts = getPassengerCounts();
                    const cost = calculateTourCost(selectedTour, passCounts);
                    const ticketId = generateTicketId();
                    
                    const booking = {
                        ticketId: ticketId,
                        name: formData.get('name'),
                        phone: formData.get('phone'),
                        email: formData.get('email') || '',
                        service: tourNames[selectedTour] || selectedTour,
                        date: formData.get('rideDate'),
                        time: formData.get('rideTime'),
                        adults: formData.get('adults'),
                        children: formData.get('children'),
                        infants: formData.get('infants'),
                        guests: passCounts.total,
                        pickupLocation: formData.get('pickupLocation') || '',
                        specialRequests: formData.get('specialRequests') || '',
                        cost: cost,
                        payment: formData.get('payment') || 'Cash',
                        paymentMethod: formData.get('payment') || 'Cash',
                        paymentStatus: 'Pending',
                        status: 'pending',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                    
                    const saved = DB.saveBooking(booking);
                    
                    if (typeof WhatsApp !== 'undefined') {
                        WhatsApp.sendOwnerNotification(saved);
                    }
                    
                    sessionStorage.setItem('lastBooking', JSON.stringify(saved));
                    showMessage(`✅ Booking created! Ticket ID: ${ticketId}. Redirecting...`);
                    
                    setTimeout(() => {
                        window.location.href = 'pages/confirmation.html';
                    }, 1500);
                });
            }
        }
        
        // --- HOTEL BOOKING ---
        const hotelForm = document.getElementById('hotelCalculator');
        if (hotelForm) {
            const hotelBtn = hotelForm.querySelector('.button.primary');
            if (hotelBtn) {
                const newHotelBtn = hotelBtn.cloneNode(true);
                hotelBtn.parentNode.replaceChild(newHotelBtn, hotelBtn);
                
                newHotelBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    const hotelName = document.getElementById('hotelName').value;
                    const total = daysBetween(
                        document.getElementById('checkIn').value,
                        document.getElementById('checkOut').value
                    ) * Math.max(1, Number(document.getElementById('rooms').value || 1)) * Number(document.getElementById('hotelRate').value || 0);
                    
                    const ticketId = generateTicketId();
                    const booking = {
                        ticketId: ticketId,
                        name: document.getElementById('guestDetails').value.split('\n')[0] || 'Hotel Guest',
                        phone: '', email: '',
                        service: `Hotel: ${hotelName} (${document.getElementById('roomType').value})`,
                        date: document.getElementById('checkIn').value,
                        time: 'Check-in',
                        adults: document.getElementById('hotelAdults').value,
                        children: document.getElementById('hotelChildren').value,
                        infants: document.getElementById('hotelInfants').value,
                        guests: Number(document.getElementById('hotelAdults').value) + Number(document.getElementById('hotelChildren').value) + Number(document.getElementById('hotelInfants').value),
                        pickupLocation: '',
                        specialRequests: `Rooms: ${document.getElementById('rooms').value}, Room Type: ${document.getElementById('roomType').value}, Check-out: ${document.getElementById('checkOut').value}`,
                        cost: total,
                        payment: 'Cash', paymentMethod: 'Cash',
                        paymentStatus: 'Pending', status: 'pending',
                        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
                    };
                    
                    DB.saveBooking(booking);
                    sessionStorage.setItem('lastBooking', JSON.stringify(booking));
                    if (typeof WhatsApp !== 'undefined') WhatsApp.sendOwnerNotification(booking);
                    alert(`✅ Hotel booking created! Ticket ID: ${ticketId}`);
                    window.location.href = 'pages/confirmation.html';
                });
            }
        }
        
        // --- CAB BOOKING ---
        const cabForm = document.getElementById('cabCalculator');
        if (cabForm) {
            const cabBtn = cabForm.querySelector('.button.primary');
            if (cabBtn) {
                const newCabBtn = cabBtn.cloneNode(true);
                cabBtn.parentNode.replaceChild(newCabBtn, cabBtn);
                
                newCabBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    const vehicleName = document.getElementById('vehicleName').value;
                    const optionMultiplier = document.getElementById('cabOption').value === 'Outstation Tour' ? 1.8 : 
                        document.getElementById('cabOption').value === 'Local Sightseeing' ? 1.35 : 1;
                    const total = Math.round(Number(document.getElementById('vehicleRate').value || 0) * optionMultiplier);
                    
                    const ticketId = generateTicketId();
                    const booking = {
                        ticketId: ticketId,
                        name: `Cab: ${vehicleName}`,
                        phone: '', email: '',
                        service: `Cab: ${vehicleName} (${document.getElementById('cabOption').value})`,
                        date: document.getElementById('pickupDate').value,
                        time: document.getElementById('pickupTime').value,
                        adults: document.getElementById('cabAdults').value,
                        children: document.getElementById('cabChildren').value,
                        infants: document.getElementById('cabInfants').value,
                        guests: Number(document.getElementById('cabAdults').value) + Number(document.getElementById('cabChildren').value) + Number(document.getElementById('cabInfants').value),
                        pickupLocation: document.getElementById('cabPickup').value,
                        specialRequests: `Drop: ${document.getElementById('cabDrop').value}, Luggage: ${document.getElementById('luggage').value}`,
                        cost: total,
                        payment: 'Cash', paymentMethod: 'Cash',
                        paymentStatus: 'Pending', status: 'pending',
                        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
                    };
                    
                    DB.saveBooking(booking);
                    sessionStorage.setItem('lastBooking', JSON.stringify(booking));
                    if (typeof WhatsApp !== 'undefined') WhatsApp.sendOwnerNotification(booking);
                    alert(`✅ Cab booking created! Ticket ID: ${ticketId}`);
                    window.location.href = 'pages/confirmation.html';
                });
            }
        }
    }
    
    tryInit();
})();

/* ==========================================
   PREMIUM ENHANCEMENTS
   ========================================== */

// Page Loader
(function() {
    const loader = document.querySelector('.page-loader');
    if (!loader) return;
    window.addEventListener('load', function() { setTimeout(() => loader.classList.add('hidden'), 400); });
    setTimeout(() => loader.classList.add('hidden'), 2000);
})();

// Scroll Progress Bar
(function() {
    const bar = document.querySelector('.scroll-progress');
    if (!bar) return;
    window.addEventListener('scroll', function() {
        const winScroll = document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        bar.style.width = height > 0 ? (winScroll / height * 100) + '%' : '0%';
    });
})();

// Scroll Reveal
function handleScrollReveal() {
    document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale").forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.85) {
            el.classList.add("is-visible");
        }
    });
}
window.addEventListener("load", handleScrollReveal);
window.addEventListener("scroll", handleScrollReveal);
window.addEventListener("resize", handleScrollReveal);

// Back to Top
const backToTop = document.getElementById("backToTop");
if (backToTop) {
    window.addEventListener("scroll", () => {
        backToTop.classList.toggle("is-visible", window.scrollY > 600);
    });
    backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

// Gallery Lightbox
(function() {
    const galleryLightbox = document.getElementById("galleryLightbox");
    const lightboxImage = document.getElementById("lightboxImage");
    const galleryImages = document.querySelectorAll("#galleryGrid img");
    const lightboxClose = document.querySelector(".lightbox-close");
    const lightboxPrev = document.querySelector(".lightbox-prev");
    const lightboxNext = document.querySelector(".lightbox-next");
    if (!galleryLightbox || !galleryImages.length) return;
    
    let currentImageIndex = 0;
    
    function openLightbox(index) {
        currentImageIndex = index;
        lightboxImage.src = galleryImages[index].src;
        lightboxImage.alt = galleryImages[index].alt;
        galleryLightbox.hidden = false;
        requestAnimationFrame(() => galleryLightbox.classList.add("is-open"));
        document.body.style.overflow = "hidden";
    }
    
    function closeLightbox() {
        galleryLightbox.classList.remove("is-open");
        setTimeout(() => { galleryLightbox.hidden = true; document.body.style.overflow = ""; }, 300);
    }
    
    function navigateLightbox(direction) {
        currentImageIndex = (currentImageIndex + direction + galleryImages.length) % galleryImages.length;
        lightboxImage.src = galleryImages[currentImageIndex].src;
        lightboxImage.alt = galleryImages[currentImageIndex].alt;
    }
    
    galleryImages.forEach((img, i) => {
        img.addEventListener("click", () => openLightbox(i));
        img.style.cursor = "pointer";
    });
    lightboxClose?.addEventListener("click", closeLightbox);
    lightboxPrev?.addEventListener("click", () => navigateLightbox(-1));
    lightboxNext?.addEventListener("click", () => navigateLightbox(1));
    galleryLightbox.addEventListener("click", (e) => { if (e.target === galleryLightbox) closeLightbox(); });
    document.addEventListener("keydown", (e) => {
        if (!galleryLightbox.classList.contains("is-open")) return;
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowLeft") navigateLightbox(-1);
        if (e.key === "ArrowRight") navigateLightbox(1);
    });
})();

// Testimonials Slider
(function() {
    const slider = document.getElementById("testimonialsSlider");
    if (!slider) return;
    const track = slider.querySelector(".testimonials-track");
    const slides = slider.querySelectorAll(".testimonial-slide");
    const prevBtn = slider.querySelector(".prev");
    const nextBtn = slider.querySelector(".next");
    if (!track || !slides.length) return;
    
    let current = 0;
    function update() { track.style.transform = `translateX(-${current * 100}%)`; }
    nextBtn?.addEventListener("click", () => { current = (current + 1) % slides.length; update(); });
    prevBtn?.addEventListener("click", () => { current = (current - 1 + slides.length) % slides.length; update(); });
    setInterval(() => { if (!document.hidden) { current = (current + 1) % slides.length; update(); } }, 6000);
})();

// Particles
(function() {
    const bg = document.querySelector(".particles-bg");
    if (!bg) return;
    for (let i = 0; i < 12; i++) {
        const p = document.createElement("div");
        p.className = "particle";
        const s = Math.random() * 4 + 2;
        p.style.cssText = `width:${s}px;height:${s}px;left:${Math.random()*100}%;bottom:${Math.random()*40}%;animation-delay:${Math.random()*12}s;animation-duration:${8+Math.random()*8}s`;
        bg.appendChild(p);
    }
})();

// Smooth anchor scrolling
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
        const id = anchor.getAttribute("href");
        if (id === "#" || !id) return;
        const target = document.querySelector(id);
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: "smooth", block: "start" }); }
    });
});
