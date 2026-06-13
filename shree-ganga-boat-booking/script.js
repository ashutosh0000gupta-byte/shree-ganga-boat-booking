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

function buildWhatsAppMessage(booking) {
    return [
        "Hello, I want to book a Ganga boat ride.",
        "",
        `Booking ID: ${booking.id}`,
        `Name: ${booking.name}`,
        `Phone: ${booking.phone}`,
        `Email: ${booking.email || "Not shared"}`,
        `Tour: ${booking.tour}`,
        `Date: ${booking.date}`,
        `Time: ${booking.time}`,
        `Adults: ${booking.adults}`,
        `Children: ${booking.children}`,
        `Infants: ${booking.infants}`,
        `Total Passengers: ${booking.guests}`,
        `Pickup: ${booking.pickup || "Not shared"}`,
        `Special Requests: ${booking.requests || "None"}`,
        `Estimated Cost: ${formatRupees(booking.cost)}`,
        `Payment: ${booking.payment}`
    ].join("\n");
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
        if (quickDate) {
            document.getElementById("checkIn").value = quickDate;
            updateHotelEstimate();
        }
        document.getElementById("hotel-booking").scrollIntoView({ behavior: "smooth" });
        return;
    }

    if (service === "car" || service === "airport") {
        const quickDate = options.date || "";
        if (quickDate) {
            document.getElementById("pickupDate").value = quickDate;
            updateCabEstimate();
        }
        document.getElementById("cab-booking").scrollIntoView({ behavior: "smooth" });
        return;
    }

    tourType.value = service;
    if (options.date) {
        rideDate.value = options.date;
    }
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
    button.addEventListener("click", () => {
        selectService(button.dataset.tour);
    });
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
    const quickService = document.getElementById("quickService").value;
    const quickDate = document.getElementById("quickDate").value;
    const quickGuests = document.getElementById("quickGuests").value;

    selectService(quickService, { date: quickDate, guests: quickGuests });
});

/* ==========================================
   HERO SLIDER (PRESERVED + ENHANCED WITH DOTS)
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
    dot.addEventListener("click", () => {
        goToSlide(Number(dot.dataset.slide));
    });
});

window.setInterval(() => {
    if (!heroSlides.length) return;
    const next = (activeSlide + 1) % heroSlides.length;
    goToSlide(next);
}, 4500);

/* ==========================================
   PAYMENT MODAL (PRESERVED)
   ========================================== */

paymentOptions.forEach((option) => {
    option.addEventListener("change", updatePaymentNote);
});

paymentClose.addEventListener("click", closePaymentWindow);

paymentModal.addEventListener("click", (event) => {
    if (event.target === paymentModal) {
        closePaymentWindow();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closePaymentWindow();
    }
});

/* ==========================================
   BOOKING FORM SUBMIT (PRESERVED)
   ========================================== */

bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(bookingForm);
    const selectedTour = formData.get("tourType");
    setDefaultRideTime(selectedTour);
    updateBookingSummary();
    const guests = Number(formData.get("guests"));
    const cost = calculateTourCost(selectedTour, getPassengerCounts());

    if ((selectedTour === "sunrise" || selectedTour === "aarti") && guests > seats[selectedTour]) {
        showMessage(`Only ${seats[selectedTour]} seats are available for this tour.`, true);
        return;
    }

    if (selectedTour === "sunrise" || selectedTour === "aarti") {
        seats[selectedTour] -= guests;
        updateAvailability();
    }

    const booking = {
        id: `BK${Date.now()}`,
        name: formData.get("name"),
        phone: formData.get("phone"),
        email: formData.get("email"),
        tour: tourNames[selectedTour],
        date: formData.get("rideDate"),
        time: formData.get("rideTime"),
        adults: formData.get("adults"),
        children: formData.get("children"),
        infants: formData.get("infants"),
        guests,
        pickup: formData.get("pickupLocation"),
        requests: formData.get("specialRequests"),
        cost,
        payment: formData.get("payment")
    };

    showMessage(`Booking request created: ${booking.id}. WhatsApp is ready to send.`);

    const message = encodeURIComponent(buildWhatsAppMessage(booking));
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank", "noopener");
    bookingForm.reset();
    setMinimumDate();
    adultsInput.value = 2;
    childrenInput.value = 0;
    infantsInput.value = 0;
    updateBookingSummary();
    updatePaymentNote();
});

/* ==========================================
   HOTEL CALCULATOR (PRESERVED)
   ========================================== */

function daysBetween(start, end) {
    if (!start || !end) {
        return 1;
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    return Math.max(1, diff);
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

    const message = encodeURIComponent([
        "Hello, I want to book a hotel in Varanasi.",
        "",
        `Hotel: ${hotelName.value}`,
        `Room Type: ${roomType.value}`,
        `Check-in: ${checkIn.value || "Not selected"}`,
        `Check-out: ${checkOut.value || "Not selected"}`,
        `Adults: ${hotelAdults.value}`,
        `Children: ${hotelChildren.value}`,
        `Infants: ${hotelInfants.value}`,
        `Rooms: ${rooms.value}`,
        `Guest Details: ${guestDetails.value || "Not shared"}`,
        `Estimated Cost: ${formatRupees(total)}`
    ].join("\n"));

    hotelWhatsApp.href = `https://wa.me/${whatsappNumber}?text=${message}`;
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

document.getElementById("hotelCalculator").addEventListener("submit", (event) => {
    event.preventDefault();
});

/* ==========================================
   CAB CALCULATOR (PRESERVED)
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

    const message = encodeURIComponent([
        "Hello, I want to book a cab in Varanasi.",
        "",
        `Vehicle: ${vehicleName.value}`,
        `Trip Type: ${cabOption.value}`,
        `Pickup Date: ${pickupDate.value || "Not selected"}`,
        `Pickup Time: ${pickupTime.value || "Not selected"}`,
        `Pickup: ${cabPickup.value || "Not shared"}`,
        `Drop: ${cabDrop.value || "Not shared"}`,
        `Adults: ${cabAdults.value}`,
        `Children: ${cabChildren.value}`,
        `Infants: ${cabInfants.value}`,
        `Luggage: ${luggage.value}`,
        `Vehicle Capacity: ${capacity} seats`,
        `Estimated Cost: ${formatRupees(total)}`,
        capacityNote
    ].join("\n"));

    cabWhatsApp.href = `https://wa.me/${whatsappNumber}?text=${message}`;
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

document.getElementById("cabCalculator").addEventListener("submit", (event) => {
    event.preventDefault();
});

/* ==========================================
   INIT (PRESERVED)
   ========================================== */

setMinimumDate();
updateAvailability();
updateBookingSummary();
updateHotelEstimate();
updateCabEstimate();

/* ==========================================
   ===== NEW FEATURES (ADDITIONS) =====
   ========================================== */

/* ==========================================
   SCROLL REVEAL ANIMATIONS
   ========================================== */

function handleScrollReveal() {
    const revealElements = document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale");
    
    revealElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        if (rect.top < windowHeight * 0.85) {
            el.classList.add("is-visible");
        }
    });
}

// Run on load and scroll
window.addEventListener("load", handleScrollReveal);
window.addEventListener("scroll", handleScrollReveal);
window.addEventListener("resize", handleScrollReveal);

/* ==========================================
   BACK TO TOP BUTTON
   ========================================== */

const backToTop = document.getElementById("backToTop");

if (backToTop) {
    window.addEventListener("scroll", () => {
        if (window.scrollY > 600) {
            backToTop.classList.add("is-visible");
        } else {
            backToTop.classList.remove("is-visible");
        }
    });

    backToTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

/* ==========================================
   GALLERY LIGHTBOX
   ========================================== */

const galleryLightbox = document.getElementById("galleryLightbox");
const lightboxImage = document.getElementById("lightboxImage");
const galleryImages = document.querySelectorAll("#galleryGrid img");
const lightboxClose = document.querySelector(".lightbox-close");
const lightboxPrev = document.querySelector(".lightbox-prev");
const lightboxNext = document.querySelector(".lightbox-next");

let currentImageIndex = 0;

function openLightbox(index) {
    if (!galleryLightbox || !lightboxImage) return;
    currentImageIndex = index;
    lightboxImage.src = galleryImages[index].src;
    lightboxImage.alt = galleryImages[index].alt;
    galleryLightbox.hidden = false;
    // Small delay to enable transition
    requestAnimationFrame(() => {
        galleryLightbox.classList.add("is-open");
    });
    document.body.style.overflow = "hidden";
}

function closeLightbox() {
    if (!galleryLightbox) return;
    galleryLightbox.classList.remove("is-open");
    setTimeout(() => {
        galleryLightbox.hidden = true;
        document.body.style.overflow = "";
    }, 300);
}

function navigateLightbox(direction) {
    const total = galleryImages.length;
    currentImageIndex = (currentImageIndex + direction + total) % total;
    lightboxImage.src = galleryImages[currentImageIndex].src;
    lightboxImage.alt = galleryImages[currentImageIndex].alt;
}

if (galleryImages.length) {
    galleryImages.forEach((img, index) => {
        img.addEventListener("click", () => openLightbox(index));
        img.style.cursor = "pointer";
    });
}

if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
if (lightboxPrev) lightboxPrev.addEventListener("click", () => navigateLightbox(-1));
if (lightboxNext) lightboxNext.addEventListener("click", () => navigateLightbox(1));

if (galleryLightbox) {
    galleryLightbox.addEventListener("click", (e) => {
        if (e.target === galleryLightbox) closeLightbox();
    });

    document.addEventListener("keydown", (e) => {
        if (!galleryLightbox.classList.contains("is-open")) return;
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowLeft") navigateLightbox(-1);
        if (e.key === "ArrowRight") navigateLightbox(1);
    });
}

/* ==========================================
   TESTIMONIALS SLIDER
   ========================================== */

const testimonialsSlider = document.getElementById("testimonialsSlider");

if (testimonialsSlider) {
    const track = testimonialsSlider.querySelector(".testimonials-track");
    const slides = testimonialsSlider.querySelectorAll(".testimonial-slide");
    const prevBtn = testimonialsSlider.querySelector(".prev");
    const nextBtn = testimonialsSlider.querySelector(".next");
    let currentTestimonial = 0;
    const totalTestimonials = slides.length;

    function updateTestimonialSlider() {
        if (!track) return;
        track.style.transform = `translateX(-${currentTestimonial * 100}%)`;
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            currentTestimonial = (currentTestimonial + 1) % totalTestimonials;
            updateTestimonialSlider();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            currentTestimonial = (currentTestimonial - 1 + totalTestimonials) % totalTestimonials;
            updateTestimonialSlider();
        });
    }

    // Auto-rotate testimonials
    setInterval(() => {
        if (!document.hidden) {
            currentTestimonial = (currentTestimonial + 1) % totalTestimonials;
            updateTestimonialSlider();
        }
    }, 6000);

    // Keyboard navigation
    testimonialsSlider.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") {
            currentTestimonial = (currentTestimonial - 1 + totalTestimonials) % totalTestimonials;
            updateTestimonialSlider();
        }
        if (e.key === "ArrowRight") {
            currentTestimonial = (currentTestimonial + 1) % totalTestimonials;
            updateTestimonialSlider();
        }
    });
}

/* ==========================================
   PARTICLE BACKGROUND GENERATOR
   ========================================== */

const particlesBg = document.querySelector(".particles-bg");

if (particlesBg) {
    const particleCount = 12;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div");
        particle.className = "particle";
        const size = Math.random() * 4 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.bottom = `${Math.random() * 40}%`;
        particle.style.animationDelay = `${Math.random() * 12}s`;
        particle.style.animationDuration = `${8 + Math.random() * 8}s`;
        particlesBg.appendChild(particle);
    }
}

/* ==========================================
   SMOOTH ANCHOR SCROLLING ENHANCEMENT
   ========================================== */

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
        const targetId = anchor.getAttribute("href");
        if (targetId === "#" || targetId === "") return;
        const target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });
});

/* ==========================================
   PERFORMANCE: IMAGE LAZY LOADING
   ========================================== */

if ("loading" in HTMLImageElement.prototype) {
    // Browser supports native lazy loading, no action needed
} else {
    // Fallback for older browsers - load all images
    document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
        img.loading = "auto";
    });
}
