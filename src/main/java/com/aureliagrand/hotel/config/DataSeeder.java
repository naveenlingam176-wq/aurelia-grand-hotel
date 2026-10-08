package com.aureliagrand.hotel.config;

import com.aureliagrand.hotel.entity.*;
import com.aureliagrand.hotel.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Configuration
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final SuiteRepository suiteRepository;
    private final PartyHallRepository partyHallRepository;
    private final BookingRepository bookingRepository;
    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository,
                      RoomRepository roomRepository,
                      SuiteRepository suiteRepository,
                      PartyHallRepository partyHallRepository,
                      BookingRepository bookingRepository,
                      RestaurantRepository restaurantRepository,
                      MenuItemRepository menuItemRepository,
                      InvoiceRepository invoiceRepository,
                      PaymentRepository paymentRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roomRepository = roomRepository;
        this.suiteRepository = suiteRepository;
        this.partyHallRepository = partyHallRepository;
        this.bookingRepository = bookingRepository;
        this.restaurantRepository = restaurantRepository;
        this.menuItemRepository = menuItemRepository;
        this.invoiceRepository = invoiceRepository;
        this.paymentRepository = paymentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedUsers();
        seedRooms();
        seedSuites();
        seedPartyHalls();
        seedRestaurants();
        seedInitialBookings();
    }

    private void seedUsers() {
        if (userRepository.findByEmailIgnoreCase("admin@aureliagrand.com").isEmpty()) {
            User admin = new User();
            admin.setName("Julian Vance");
            admin.setEmail("admin@aureliagrand.com");
            admin.setPassword(passwordEncoder.encode("AdminPassword123!"));
            admin.setPhone("+91 98765 00001");
            admin.setRole(Role.ADMIN);
            admin.setCountry("United States");
            admin.setCurrency("USD");
            admin.setActive(true);
            userRepository.save(admin);
        }

        if (userRepository.findByEmailIgnoreCase("staff@aureliagrand.com").isEmpty()) {
            User staff = new User();
            staff.setName("Elena Rostova");
            staff.setEmail("staff@aureliagrand.com");
            staff.setPassword(passwordEncoder.encode("StaffPassword123!"));
            staff.setPhone("+91 98765 00002");
            staff.setRole(Role.STAFF);
            staff.setCountry("Japan");
            staff.setCurrency("JPY");
            staff.setActive(true);
            userRepository.save(staff);
        }

        if (userRepository.findByEmailIgnoreCase("user@aureliagrand.com").isEmpty()) {
            User guest = new User();
            guest.setName("Lady Genevieve & Lord Sterling");
            guest.setEmail("user@aureliagrand.com");
            guest.setPassword(passwordEncoder.encode("UserPassword123!"));
            guest.setPhone("+91 98765 43210");
            guest.setRole(Role.GUEST);
            guest.setCountry("United Kingdom");
            guest.setCurrency("GBP");
            guest.setActive(true);
            userRepository.save(guest);
        }

        if (userRepository.findByEmailIgnoreCase("guest@aureliagrand.com").isEmpty()) {
            User guest2 = new User();
            guest2.setName("Lord Arthur Wellington");
            guest2.setEmail("guest@aureliagrand.com");
            guest2.setPassword(passwordEncoder.encode("GuestPassword123!"));
            guest2.setPhone("+91 98765 43211");
            guest2.setRole(Role.GUEST);
            guest2.setCountry("India");
            guest2.setCurrency("INR");
            guest2.setActive(true);
            userRepository.save(guest2);
        }
    }

    private void seedRooms() {
        if (roomRepository.count() == 0) {
            Room r1 = new Room("R-701", "The Imperial Ocean Penthouse", "701", "Penthouse", "penthouse",
                    "The pinnacle of barefoot luxury. Suspended above the azure lagoon with 360-degree ocean views, glass floor observatory, bespoke Italian marble, and private steam room.",
                    3450.0, "4 Guests", "Private Infinity Pool, 24/7 Royal Butler, Helipad Access, Wine Cellar",
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
                    "7th Floor", "340 m²", 5.0, false, "occupied");

            Room r2 = new Room("R-702", "The Royal Horizon Penthouse", "702", "Penthouse", "penthouse",
                    "Elevated duplex penthouse offering celestial panoramic skylights, custom bronze finishes, and dedicated sommelier service on demand.",
                    3200.0, "4 Guests", "Sunset Observation Deck, Dornbracht Spa Baths, Private Teppanyaki Kitchen",
                    "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1200&q=80",
                    "7th Floor", "310 m²", 4.98, true, "available");

            Room r3 = new Room("R-602", "Royal Lagoon Overwater Villa", "602", "Villa", "villa",
                    "Private overwater sanctuary resting above coral gardens with suspended sun loungers, outdoor rain pavilion, and direct ocean reef stairway.",
                    2150.0, "2 Guests", "Direct Coral Reef Drop, Sunset Jacuzzi, Private Chef Dining, B&O Sound",
                    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
                    "Overwater Pier", "220 m²", 4.95, false, "occupied");

            Room r4 = new Room("R-605", "Coral Reef Sunset Villa", "605", "Villa", "villa",
                    "West-facing overwater haven offering uninterrupted sunset horizons, private catamaran mooring, plunge pool, and starlight glass ceiling.",
                    1980.0, "2 Guests", "Private Plunge Pool, Star-Gazing Retractable Roof, Butler Station",
                    "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80",
                    "Overwater Pier", "195 m²", 4.92, true, "available");

            Room r5 = new Room("SUITE-205", "Royal Grand Suite", "205", "Suite", "sky",
                    "Opulent palatial suite featuring handcrafted onyx bathrooms, custom silk upholstery, panoramic ocean terraces, and private cigar humidor.",
                    30000.0, "3 Guests", "Oceanfront Balcony, Walk-in Closet, Hermès Amenities, Nespresso Bar",
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
                    "2nd Floor", "180 m²", 4.94, true, "available");

            Room r6 = new Room("ROOM-101", "Deluxe Oceanfront Suite", "101", "Deluxe", "ocean",
                    "Refined beachfront residence steps away from the powder-white private shoreline, featuring private plunge plunge, garden courtyard, and dual rain showers.",
                    18000.0, "2 Guests", "Private Beach Path, Tropical Outdoor Shower, King Bed, Bowers & Wilkins Audio",
                    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
                    "Ground Floor", "145 m²", 4.88, true, "available");

            Room r7 = new Room("R-504", "Presidential Sky Suite", "504", "Suite", "suite",
                    "Sophisticated modern sanctuary with bespoke walnut millwork, tailored silk drapes, deep-soaking bathtub overlooking the ocean skyline.",
                    1850.0, "3 Guests", "Panoramic Balcony, Bulgari Amenities, Cocktail Bar, Dual Rainforest Shower",
                    "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
                    "5th Floor", "180 m²", 4.95, true, "available");

            Room r8 = new Room("R-408", "Azure Grand Pavilion Suite", "408", "Suite", "suite",
                    "Surrounded by lush orchids and gentle ocean breezes, designed for tranquil restorative stays with organic linen and aromatherapy diffusers.",
                    1420.0, "2 Guests", "Tropical Garden View, King Featherbed, Espresso Lab, Private Terrace",
                    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
                    "4th Floor", "140 m²", 4.88, true, "available");

            Room r9 = new Room("R-305", "Deluxe Coral Oceanfront", "305", "Deluxe", "deluxe",
                    "Refined comfort with an unobstructed vantage of the crystal shallows, curated art pieces, and custom organic botanical bath salts.",
                    980.0, "2 Guests", "Lagoon View Deck, King Bed, Artisan Mini Bar, Smart Room Controls",
                    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
                    "3rd Floor", "95 m²", 4.85, true, "available");

            Room r10 = new Room("R-202", "Bespoke Executive Terrace", "202", "Deluxe", "deluxe",
                    "Engineered for discerning global leaders who require seamless tranquility, confidential workspaces, and exceptional concierge services.",
                    890.0, "2 Guests", "Private Cabana, Hermès Toiletries, Executive Desk, High-Speed Satellite",
                    "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80",
                    "2nd Floor", "88 m²", 4.9, true, "available");

            roomRepository.saveAll(List.of(r1, r2, r3, r4, r5, r6, r7, r8, r9, r10));
        } else {
            // Ensure any catalog rooms missing in an existing database are seeded
            List<Room> extraRooms = List.of(
                    new Room("R-504", "Presidential Sky Suite", "504", "Suite", "suite",
                            "Sophisticated modern sanctuary with bespoke walnut millwork, tailored silk drapes, deep-soaking bathtub overlooking the ocean skyline.",
                            1850.0, "3 Guests", "Panoramic Balcony, Bulgari Amenities, Cocktail Bar, Dual Rainforest Shower",
                            "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
                            "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
                            "5th Floor", "180 m²", 4.95, true, "available"),
                    new Room("R-408", "Azure Grand Pavilion Suite", "408", "Suite", "suite",
                            "Surrounded by lush orchids and gentle ocean breezes, designed for tranquil restorative stays with organic linen and aromatherapy diffusers.",
                            1420.0, "2 Guests", "Tropical Garden View, King Featherbed, Espresso Lab, Private Terrace",
                            "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80",
                            "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
                            "4th Floor", "140 m²", 4.88, true, "available"),
                    new Room("R-305", "Deluxe Coral Oceanfront", "305", "Deluxe", "deluxe",
                            "Refined comfort with an unobstructed vantage of the crystal shallows, curated art pieces, and custom organic botanical bath salts.",
                            980.0, "2 Guests", "Lagoon View Deck, King Bed, Artisan Mini Bar, Smart Room Controls",
                            "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
                            "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
                            "3rd Floor", "95 m²", 4.85, true, "available"),
                    new Room("R-202", "Bespoke Executive Terrace", "202", "Deluxe", "deluxe",
                            "Engineered for discerning global leaders who require seamless tranquility, confidential workspaces, and exceptional concierge services.",
                            890.0, "2 Guests", "Private Cabana, Hermès Toiletries, Executive Desk, High-Speed Satellite",
                            "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80",
                            "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80",
                            "2nd Floor", "88 m²", 4.9, true, "available")
            );
            for (Room room : extraRooms) {
                if (!roomRepository.existsById(room.getId())) {
                    roomRepository.save(room);
                }
            }
        }
    }

    private void seedSuites() {
        if (suiteRepository.count() == 0) {
            Suite s1 = new Suite("SUITE-205", "Royal Grand Suite", "205",
                    "Opulent palatial suite with onyx bathrooms, panoramic ocean terrace, and private humidor.",
                    30000.0, "3 Guests", "Oceanfront Balcony, Hermès Amenities, Nespresso Bar",
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
                    true, "available");

            Suite s2 = new Suite("SUITE-504", "Presidential Sky Suite", "504",
                    "Expansive elevated penthouse suite with panoramic terrace and private heated jacuzzi.",
                    2850.0, "3 Guests", "Panoramic Terrace, Jacuzzi, Private Sommelier",
                    "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
                    true, "available");

            suiteRepository.saveAll(List.of(s1, s2));
        }
    }

    private void seedPartyHalls() {
        if (partyHallRepository.count() == 0) {
            PartyHall h1 = new PartyHall("hall-royal-ballroom", "Royal Grand Ballroom", "Grand Ballroom",
                    "Majestic double-height pillarless hall with Austrian crystal chandeliers, concert sound array, 4K LED backdrop, and VIP green room.",
                    650, 85000.0, "10,500 sq ft", "Ground Wing East", 4.97,
                    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80",
                    "Austrian Crystal Chandeliers, Bose Concert Sound, 4K LED Backdrop, Bridal Suite, Helipad Access",
                    "Royal Wedding & Reception, Executive Corporate Gala, Tech Conference & Keynote",
                    true, "AVAILABLE");

            PartyHall h2 = new PartyHall("hall-celebration", "Aurelia Celebration Hall", "Celebration Hall",
                    "Exquisitely styled celebration venue featuring open panoramic lagoon vistas, integrated cocktail lounges, and custom illumination.",
                    350, 60000.0, "6,800 sq ft", "2nd Floor Sanctuary Wing", 4.92,
                    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80",
                    "Lagoon Terrace View, Cocktail Lounge & Bar, Digital Surround Sound, DJ Console, Valet Parking",
                    "High-Society Anniversary, Cocktail & Social Soirée, Milestone Birthday Jubilee",
                    true, "AVAILABLE");

            PartyHall h3 = new PartyHall("hall-coral", "Coral Event Hall", "Event Hall",
                    "Intimate executive banquet sanctuary tailored for high-stakes investor summits and private dinners with private terrace.",
                    180, 45000.0, "3,800 sq ft", "Mezzanine Level Central", 4.88,
                    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80",
                    "Private Terrace Lounge, Video Conference Array, Retractable Screens, Barista Bar",
                    "Executive Corporate Gala, Tech Conference, High-Society Anniversary",
                    true, "AVAILABLE");

            PartyHall h4 = new PartyHall("hall-ocean-view", "Ocean View Banquet Hall", "Banquet Hall",
                    "Perched directly above the azure waters of the Atoll with floor-to-ceiling glass facades and overwater infinity deck.",
                    500, 95000.0, "9,200 sq ft", "Waterfront Pavilion", 4.98,
                    "https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1200&q=80",
                    "Overwater Infinity Deck, Sunset Glazing, Harman Kardon Sound, Live Cooking Stations",
                    "Royal Wedding, Executive Gala, Luxury Product Showcase",
                    true, "AVAILABLE");

            PartyHall h5 = new PartyHall("hall-glasshouse", "The Glasshouse Pavilion", "Glasshouse Pavilion",
                    "A breathtaking glass conservatory framed by tropical flora, starlit skylights, and climate-controlled domes.",
                    420, 110000.0, "7,500 sq ft", "Botanical Gardens West", 4.99,
                    "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&q=80",
                    "Climate-Controlled Domes, Star-Gazing Ceilings, Bose Surround Sound, Executive Gazebo",
                    "Royal Wedding, Haute Couture Fashion Show, Milestone Birthday",
                    false, "OCCUPIED");

            partyHallRepository.saveAll(List.of(h1, h2, h3, h4, h5));
        }
    }

    private void seedRestaurants() {
        if (restaurantRepository.count() == 0) {
            Restaurant r1 = new Restaurant("L'Orangerie", "3 Michelin Stars • Modern French Gastronomy",
                    "Curated gastronomy with rare seasonal imports, degustation tasting menus, and Grand Cru pairings overlooking the moonlit lagoon.",
                    "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80",
                    "19:00 - 23:30");

            Restaurant r2 = new Restaurant("The Amber Cellar & Lounge", "Rare Cognacs & Mixology • Lagoon Terrace",
                    "Bespoke mixology sanctuary showcasing vintage Armagnacs, pre-phylloxera single malts, and infused tapas under ocean breeze.",
                    "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80",
                    "17:00 - 02:00");

            Restaurant r3 = new Restaurant("Azure Longevity Spa", "Ayurvedic Healing & Hydrotherapy",
                    "Holistic wellness sanctuary offering hydrotherapy, salt steam grottos, and bespoke organic elixir tastings.",
                    "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80",
                    "08:00 - 21:00");

            restaurantRepository.saveAll(List.of(r1, r2, r3));

            MenuItem m1 = new MenuItem(r1, "Beluga Caviar Imperial Service", "Traditional accompaniments, blinis, crème fraîche", 4500.0, "Appetizer", "");
            MenuItem m2 = new MenuItem(r1, "A5 Wagyu Tenderloin Rossini", "Perigord black truffle, seared foie gras, Madeira jus", 8500.0, "Main", "");
            MenuItem m3 = new MenuItem(r2, "Vintage Louis XIII Cognac Sip (30ml)", "Grande Champagne premier cru decanter pour", 12000.0, "Cellar", "");
            menuItemRepository.saveAll(List.of(m1, m2, m3));
        }
    }

    private void seedInitialBookings() {
        if (bookingRepository.count() == 0) {
            User guest = userRepository.findByEmailIgnoreCase("user@aureliagrand.com").orElse(null);
            if (guest == null) return;

            Room r205 = roomRepository.findById("SUITE-205").orElse(null);
            if (r205 != null) {
                Booking b1 = new Booking();
                b1.setBookingId("AG-2026-00124");
                b1.setType("room");
                b1.setGuest(guest);
                b1.setRoom(r205);
                b1.setGuestName("John Doe");
                b1.setGuestEmail("john.doe@example.com");
                b1.setGuestPhone("+91 98765 43210");
                b1.setVipTier("gold");
                b1.setCheckInDate(LocalDate.of(2026, 10, 12));
                b1.setCheckOutDate(LocalDate.of(2026, 10, 16));
                b1.setNights(4);
                b1.setAdults(2);
                b1.setChildren(0);
                b1.setBaseAmount(30000.0);
                b1.setTotalAmount(120000.0);
                b1.setCurrency("INR");
                b1.setStatus(BookingStatus.CONFIRMED);
                b1.setPaymentStatus(PaymentStatus.PAID);
                b1.setPaymentMethod("Visa Infinite (Luxury Folio)");
                b1.setSpecialRequests("High floor, late arrival, complimentary airport transfer");
                b1.setImage(r205.getImage());
                Booking savedB1 = bookingRepository.save(b1);

                Invoice inv1 = new Invoice("INV-AG-2026-00124", savedB1, guest, 120000.0, 0.0, 0.0, 120000.0, "INR", LocalDate.of(2026, 9, 1), InvoiceStatus.PAID);
                invoiceRepository.save(inv1);

                Payment pay1 = new Payment(savedB1, 120000.0, "INR", "Visa Infinite (Luxury Folio)", PaymentStatus.PAID, "TXN-FOLIO-1024");
                paymentRepository.save(pay1);
            }

            PartyHall hallGlass = partyHallRepository.findById("hall-glasshouse").orElse(null);
            if (hallGlass != null) {
                Booking b2 = new Booking();
                b2.setBookingId("AG-PH-00125");
                b2.setType("hall");
                b2.setGuest(guest);
                b2.setPartyHall(hallGlass);
                b2.setGuestName("John Doe");
                b2.setGuestEmail("john.doe@example.com");
                b2.setGuestPhone("+91 98765 43210");
                b2.setVipTier("gold");
                b2.setCheckInDate(LocalDate.of(2026, 10, 14));
                b2.setCheckOutDate(LocalDate.of(2026, 10, 14));
                b2.setNights(1);
                b2.setAdults(250);
                b2.setChildren(0);
                b2.setBaseAmount(185000.0);
                b2.setTotalAmount(185000.0);
                b2.setCurrency("INR");
                b2.setStatus(BookingStatus.CONFIRMED);
                b2.setPaymentStatus(PaymentStatus.PAID);
                b2.setPaymentMethod("Corporate Wire Clearance");
                b2.setSpecialRequests("Royal Anniversary Jubilee, evening banquet");
                b2.setImage(hallGlass.getImage());
                Booking savedB2 = bookingRepository.save(b2);

                Invoice inv2 = new Invoice("INV-AG-PH-00125", savedB2, guest, 185000.0, 0.0, 0.0, 185000.0, "INR", LocalDate.of(2026, 9, 5), InvoiceStatus.PAID);
                invoiceRepository.save(inv2);

                Payment pay2 = new Payment(savedB2, 185000.0, "INR", "Corporate Wire Clearance", PaymentStatus.PAID, "TXN-WIRE-1025");
                paymentRepository.save(pay2);
            }
        }
    }
}
