const bookingForm = document.getElementById("bookingForm");
const formMessage = document.getElementById("formMessage");
const tourType = document.getElementById("tourType");
const rideDate = document.getElementById("rideDate");
const rideTime = document.getElementById("rideTime");
const upiNote = document.getElementById("upiNote");
const paymentModal = document.getElementById("paymentModal");
const paymentClose = document.getElementById("paymentClose");
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const packageButtons = document.querySelectorAll("[data-tour]");
const paymentOptions = document.querySelectorAll('input[name="payment"]');
const whatsappNumber = "919170409773";

const seats = {
    sunrise: 20,
    aarti: 20
};

const tourNames = {
    sunrise: "Morning Sunrise Ride",
    aarti: "Evening Ganga Aarti",
    private: "Private Motor Boat",
    cruise: "Alaknanda Cruise"
};

const defaultTourTimes = {
    sunrise: "05:30",
    aarti: "18:00"
};

function setMinimumDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    rideDate.min = `${yyyy}-${mm}-${dd}`;
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

function buildUpiPaymentMessage() {
    const formData = new FormData(bookingForm);
    const selectedTour = formData.get("tourType");

    return [
        "Hello, I want to book a Ganga boat ride.",
        "",
        `Name: ${formData.get("name")}`,
        `Phone: ${formData.get("phone")}`,
        `Tour: ${tourNames[selectedTour] || "Not selected"}`,
        `Date: ${formData.get("rideDate")}`,
        `Time: ${formData.get("rideTime")}`,
        `Guests: ${formData.get("guests")}`,
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
        `Tour: ${booking.tour}`,
        `Date: ${booking.date}`,
        `Time: ${booking.time}`,
        `Guests: ${booking.guests}`,
        `Payment: ${booking.payment}`
    ].join("\n");
}

navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
});

siteNav.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
        siteNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
    }
});

packageButtons.forEach((button) => {
    button.addEventListener("click", () => {
        tourType.value = button.dataset.tour;
        setDefaultRideTime(button.dataset.tour);
        document.getElementById("booking").scrollIntoView({ behavior: "smooth" });
        showMessage(`${tourNames[button.dataset.tour]} selected.`);
    });
});

tourType.addEventListener("change", () => {
    setDefaultRideTime(tourType.value);
});

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

bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(bookingForm);
    const selectedTour = formData.get("tourType");
    setDefaultRideTime(selectedTour);
    const guests = Number(formData.get("guests"));

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
        tour: tourNames[selectedTour],
        date: formData.get("rideDate"),
        time: formData.get("rideTime"),
        guests,
        payment: formData.get("payment")
    };

    showMessage(`Booking request created: ${booking.id}. WhatsApp is ready to send.`);

    const message = encodeURIComponent(buildWhatsAppMessage(booking));
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank", "noopener");
    bookingForm.reset();
    setMinimumDate();
    updatePaymentNote();
});

setMinimumDate();
updateAvailability();
