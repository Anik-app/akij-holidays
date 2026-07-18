/* =========================================================
   Akij Holidays — Aviation Reference Data
   Curated list of major airlines & airports (worldwide).
   Not exhaustive — covers the airlines / airports used by
   99%+ of Bangladeshi outbound / inbound travel.
   ========================================================= */
(function (global) {

  /* ---------- Airlines (IATA/ICAO codes) ---------- */
  const AIRLINES = [
    // ---- Bangladesh / South Asia ----
    { iata: "BG", icao: "BBC", name: "Biman Bangladesh Airlines", country: "Bangladesh" },
    { iata: "BS", icao: "UBG", name: "US-Bangla Airlines",        country: "Bangladesh" },
    { iata: "VQ", icao: "NOV", name: "Novoair",                   country: "Bangladesh" },
    { iata: "2A", icao: "AJK", name: "Air Astra",                 country: "Bangladesh" },
    { iata: "AI", icao: "AIC", name: "Air India",                 country: "India" },
    { iata: "IX", icao: "AXB", name: "Air India Express",         country: "India" },
    { iata: "6E", icao: "IGO", name: "IndiGo",                    country: "India" },
    { iata: "UK", icao: "VTI", name: "Vistara",                   country: "India" },
    { iata: "SG", icao: "SEJ", name: "SpiceJet",                  country: "India" },
    { iata: "PK", icao: "PIA", name: "Pakistan International Airlines", country: "Pakistan" },
    { iata: "UL", icao: "ALK", name: "SriLankan Airlines",        country: "Sri Lanka" },
    { iata: "RA", icao: "RNA", name: "Nepal Airlines",            country: "Nepal" },
    { iata: "KB", icao: "DRK", name: "Druk Air",                  country: "Bhutan" },

    // ---- Middle East ----
    { iata: "EK", icao: "UAE", name: "Emirates",                  country: "UAE" },
    { iata: "EY", icao: "ETD", name: "Etihad Airways",            country: "UAE" },
    { iata: "FZ", icao: "FDB", name: "flydubai",                  country: "UAE" },
    { iata: "G9", icao: "ABY", name: "Air Arabia",                country: "UAE" },
    { iata: "QR", icao: "QTR", name: "Qatar Airways",             country: "Qatar" },
    { iata: "SV", icao: "SVA", name: "Saudia",                    country: "Saudi Arabia" },
    { iata: "XY", icao: "KNE", name: "flynas",                    country: "Saudi Arabia" },
    { iata: "GF", icao: "GFA", name: "Gulf Air",                  country: "Bahrain" },
    { iata: "KU", icao: "KAC", name: "Kuwait Airways",            country: "Kuwait" },
    { iata: "J9", icao: "JZR", name: "Jazeera Airways",           country: "Kuwait" },
    { iata: "WY", icao: "OMA", name: "Oman Air",                  country: "Oman" },
    { iata: "SM", icao: "MSC", name: "Air Cairo",                 country: "Egypt" },
    { iata: "MS", icao: "MSR", name: "EgyptAir",                  country: "Egypt" },
    { iata: "RJ", icao: "RJA", name: "Royal Jordanian",           country: "Jordan" },
    { iata: "ME", icao: "MEA", name: "Middle East Airlines",      country: "Lebanon" },
    { iata: "TK", icao: "THY", name: "Turkish Airlines",          country: "Türkiye" },
    { iata: "PC", icao: "PGT", name: "Pegasus Airlines",          country: "Türkiye" },

    // ---- Southeast Asia ----
    { iata: "SQ", icao: "SIA", name: "Singapore Airlines",        country: "Singapore" },
    { iata: "TR", icao: "SCO", name: "Scoot",                     country: "Singapore" },
    { iata: "MH", icao: "MAS", name: "Malaysia Airlines",         country: "Malaysia" },
    { iata: "AK", icao: "AXM", name: "AirAsia",                   country: "Malaysia" },
    { iata: "D7", icao: "XAX", name: "AirAsia X",                 country: "Malaysia" },
    { iata: "TG", icao: "THA", name: "Thai Airways International",country: "Thailand" },
    { iata: "FD", icao: "AIQ", name: "Thai AirAsia",              country: "Thailand" },
    { iata: "SL", icao: "TLM", name: "Thai Lion Air",             country: "Thailand" },
    { iata: "VN", icao: "HVN", name: "Vietnam Airlines",          country: "Vietnam" },
    { iata: "VJ", icao: "VJC", name: "VietJet Air",               country: "Vietnam" },
    { iata: "GA", icao: "GIA", name: "Garuda Indonesia",          country: "Indonesia" },
    { iata: "PR", icao: "PAL", name: "Philippine Airlines",       country: "Philippines" },
    { iata: "5J", icao: "CEB", name: "Cebu Pacific",              country: "Philippines" },
    { iata: "MI", icao: "SLK", name: "SilkAir",                   country: "Singapore" },

    // ---- East Asia ----
    { iata: "CX", icao: "CPA", name: "Cathay Pacific",            country: "Hong Kong" },
    { iata: "HX", icao: "CRK", name: "Hong Kong Airlines",        country: "Hong Kong" },
    { iata: "CI", icao: "CAL", name: "China Airlines",            country: "Taiwan" },
    { iata: "BR", icao: "EVA", name: "EVA Air",                   country: "Taiwan" },
    { iata: "CA", icao: "CCA", name: "Air China",                 country: "China" },
    { iata: "MU", icao: "CES", name: "China Eastern Airlines",    country: "China" },
    { iata: "CZ", icao: "CSN", name: "China Southern Airlines",   country: "China" },
    { iata: "HU", icao: "CHH", name: "Hainan Airlines",           country: "China" },
    { iata: "JL", icao: "JAL", name: "Japan Airlines",            country: "Japan" },
    { iata: "NH", icao: "ANA", name: "All Nippon Airways",        country: "Japan" },
    { iata: "KE", icao: "KAL", name: "Korean Air",                country: "South Korea" },
    { iata: "OZ", icao: "AAR", name: "Asiana Airlines",           country: "South Korea" },

    // ---- Europe ----
    { iata: "BA", icao: "BAW", name: "British Airways",           country: "United Kingdom" },
    { iata: "VS", icao: "VIR", name: "Virgin Atlantic",           country: "United Kingdom" },
    { iata: "U2", icao: "EZY", name: "easyJet",                   country: "United Kingdom" },
    { iata: "FR", icao: "RYR", name: "Ryanair",                   country: "Ireland" },
    { iata: "EI", icao: "EIN", name: "Aer Lingus",                country: "Ireland" },
    { iata: "AF", icao: "AFR", name: "Air France",                country: "France" },
    { iata: "LH", icao: "DLH", name: "Lufthansa",                 country: "Germany" },
    { iata: "LX", icao: "SWR", name: "SWISS International",       country: "Switzerland" },
    { iata: "OS", icao: "AUA", name: "Austrian Airlines",         country: "Austria" },
    { iata: "KL", icao: "KLM", name: "KLM Royal Dutch Airlines",  country: "Netherlands" },
    { iata: "SN", icao: "BEL", name: "Brussels Airlines",         country: "Belgium" },
    { iata: "AZ", icao: "ITY", name: "ITA Airways",               country: "Italy" },
    { iata: "IB", icao: "IBE", name: "Iberia",                    country: "Spain" },
    { iata: "TP", icao: "TAP", name: "TAP Air Portugal",          country: "Portugal" },
    { iata: "SK", icao: "SAS", name: "Scandinavian Airlines",     country: "Sweden/Denmark/Norway" },
    { iata: "AY", icao: "FIN", name: "Finnair",                   country: "Finland" },
    { iata: "LO", icao: "LOT", name: "LOT Polish Airlines",       country: "Poland" },
    { iata: "OK", icao: "CSA", name: "Czech Airlines",            country: "Czech Republic" },
    { iata: "SU", icao: "AFL", name: "Aeroflot",                  country: "Russia" },

    // ---- North America ----
    { iata: "AA", icao: "AAL", name: "American Airlines",         country: "United States" },
    { iata: "DL", icao: "DAL", name: "Delta Air Lines",           country: "United States" },
    { iata: "UA", icao: "UAL", name: "United Airlines",           country: "United States" },
    { iata: "B6", icao: "JBU", name: "JetBlue Airways",           country: "United States" },
    { iata: "AS", icao: "ASA", name: "Alaska Airlines",           country: "United States" },
    { iata: "WN", icao: "SWA", name: "Southwest Airlines",        country: "United States" },
    { iata: "F9", icao: "FFT", name: "Frontier Airlines",         country: "United States" },
    { iata: "NK", icao: "NKS", name: "Spirit Airlines",           country: "United States" },
    { iata: "AC", icao: "ACA", name: "Air Canada",                country: "Canada" },
    { iata: "WS", icao: "WJA", name: "WestJet",                   country: "Canada" },

    // ---- Oceania / Africa ----
    { iata: "QF", icao: "QFA", name: "Qantas",                    country: "Australia" },
    { iata: "JQ", icao: "JST", name: "Jetstar Airways",           country: "Australia" },
    { iata: "VA", icao: "VOZ", name: "Virgin Australia",          country: "Australia" },
    { iata: "NZ", icao: "ANZ", name: "Air New Zealand",           country: "New Zealand" },
    { iata: "SA", icao: "SAA", name: "South African Airways",     country: "South Africa" },
    { iata: "ET", icao: "ETH", name: "Ethiopian Airlines",        country: "Ethiopia" },
    { iata: "KQ", icao: "KQA", name: "Kenya Airways",             country: "Kenya" },
  ];

  /* ---------- Airports (IATA/ICAO) ---------- */
  const AIRPORTS = [
    // Bangladesh
    { iata: "DAC", icao: "VGHS", name: "Hazrat Shahjalal International Airport", city: "Dhaka",     country: "Bangladesh" },
    { iata: "CGP", icao: "VGEG", name: "Shah Amanat International Airport",       city: "Chattogram", country: "Bangladesh" },
    { iata: "ZYL", icao: "VGSY", name: "Osmani International Airport",            city: "Sylhet",   country: "Bangladesh" },
    { iata: "CXB", icao: "VGCB", name: "Cox's Bazar Airport",                     city: "Cox's Bazar", country: "Bangladesh" },
    { iata: "JSR", icao: "VGJR", name: "Jessore Airport",                         city: "Jashore",  country: "Bangladesh" },
    { iata: "SPD", icao: "VGSD", name: "Saidpur Airport",                         city: "Saidpur",  country: "Bangladesh" },
    { iata: "BZL", icao: "VGBR", name: "Barisal Airport",                         city: "Barisal",  country: "Bangladesh" },
    { iata: "RJH", icao: "VGRJ", name: "Shah Makhdum Airport",                    city: "Rajshahi", country: "Bangladesh" },

    // India
    { iata: "DEL", icao: "VIDP", name: "Indira Gandhi International Airport",     city: "New Delhi", country: "India" },
    { iata: "BOM", icao: "VABB", name: "Chhatrapati Shivaji Maharaj International", city: "Mumbai", country: "India" },
    { iata: "CCU", icao: "VECC", name: "Netaji Subhas Chandra Bose International", city: "Kolkata", country: "India" },
    { iata: "MAA", icao: "VOMM", name: "Chennai International Airport",           city: "Chennai",  country: "India" },
    { iata: "BLR", icao: "VOBL", name: "Kempegowda International Airport",        city: "Bengaluru", country: "India" },
    { iata: "HYD", icao: "VOHS", name: "Rajiv Gandhi International Airport",      city: "Hyderabad", country: "India" },
    { iata: "COK", icao: "VOCI", name: "Cochin International Airport",            city: "Kochi",    country: "India" },
    { iata: "GOI", icao: "VOGO", name: "Dabolim Airport",                         city: "Goa",      country: "India" },

    // Pakistan / Sri Lanka / Nepal / Bhutan / Maldives
    { iata: "KHI", icao: "OPKC", name: "Jinnah International Airport",            city: "Karachi",  country: "Pakistan" },
    { iata: "LHE", icao: "OPLA", name: "Allama Iqbal International Airport",      city: "Lahore",   country: "Pakistan" },
    { iata: "ISB", icao: "OPIS", name: "Islamabad International Airport",         city: "Islamabad", country: "Pakistan" },
    { iata: "CMB", icao: "VCBI", name: "Bandaranaike International Airport",      city: "Colombo",  country: "Sri Lanka" },
    { iata: "KTM", icao: "VNKT", name: "Tribhuvan International Airport",         city: "Kathmandu", country: "Nepal" },
    { iata: "PBH", icao: "VQPR", name: "Paro International Airport",              city: "Paro",     country: "Bhutan" },
    { iata: "MLE", icao: "VRMM", name: "Velana International Airport",            city: "Malé",     country: "Maldives" },

    // Middle East
    { iata: "DXB", icao: "OMDB", name: "Dubai International Airport",             city: "Dubai",    country: "UAE" },
    { iata: "DWC", icao: "OMDW", name: "Al Maktoum International Airport",        city: "Dubai",    country: "UAE" },
    { iata: "AUH", icao: "OMAA", name: "Zayed International Airport",             city: "Abu Dhabi", country: "UAE" },
    { iata: "SHJ", icao: "OMSJ", name: "Sharjah International Airport",           city: "Sharjah",  country: "UAE" },
    { iata: "DOH", icao: "OTHH", name: "Hamad International Airport",             city: "Doha",     country: "Qatar" },
    { iata: "RUH", icao: "OERK", name: "King Khalid International Airport",       city: "Riyadh",   country: "Saudi Arabia" },
    { iata: "JED", icao: "OEJN", name: "King Abdulaziz International Airport",    city: "Jeddah",   country: "Saudi Arabia" },
    { iata: "MED", icao: "OEMA", name: "Prince Mohammad bin Abdulaziz Airport",   city: "Medina",   country: "Saudi Arabia" },
    { iata: "DMM", icao: "OEDF", name: "King Fahd International Airport",         city: "Dammam",   country: "Saudi Arabia" },
    { iata: "BAH", icao: "OBBI", name: "Bahrain International Airport",           city: "Manama",   country: "Bahrain" },
    { iata: "KWI", icao: "OKBK", name: "Kuwait International Airport",            city: "Kuwait City", country: "Kuwait" },
    { iata: "MCT", icao: "OOMS", name: "Muscat International Airport",            city: "Muscat",   country: "Oman" },
    { iata: "CAI", icao: "HECA", name: "Cairo International Airport",             city: "Cairo",    country: "Egypt" },
    { iata: "AMM", icao: "OJAI", name: "Queen Alia International Airport",        city: "Amman",    country: "Jordan" },
    { iata: "BEY", icao: "OLBA", name: "Beirut–Rafic Hariri International Airport", city: "Beirut", country: "Lebanon" },
    { iata: "IST", icao: "LTFM", name: "Istanbul Airport",                        city: "Istanbul", country: "Türkiye" },
    { iata: "SAW", icao: "LTFJ", name: "Istanbul Sabiha Gökçen International Airport", city: "Istanbul", country: "Türkiye" },

    // Southeast Asia
    { iata: "SIN", icao: "WSSS", name: "Singapore Changi Airport",                city: "Singapore", country: "Singapore" },
    { iata: "KUL", icao: "WMKK", name: "Kuala Lumpur International Airport",      city: "Kuala Lumpur", country: "Malaysia" },
    { iata: "BKK", icao: "VTBS", name: "Suvarnabhumi Airport",                    city: "Bangkok",  country: "Thailand" },
    { iata: "DMK", icao: "VTBD", name: "Don Mueang International Airport",        city: "Bangkok",  country: "Thailand" },
    { iata: "HKT", icao: "VTSP", name: "Phuket International Airport",            city: "Phuket",   country: "Thailand" },
    { iata: "CNX", icao: "VTCC", name: "Chiang Mai International Airport",        city: "Chiang Mai", country: "Thailand" },
    { iata: "SGN", icao: "VVTS", name: "Tan Son Nhat International Airport",      city: "Ho Chi Minh City", country: "Vietnam" },
    { iata: "HAN", icao: "VVNB", name: "Noi Bai International Airport",           city: "Hanoi",    country: "Vietnam" },
    { iata: "CGK", icao: "WIII", name: "Soekarno–Hatta International Airport",    city: "Jakarta",  country: "Indonesia" },
    { iata: "DPS", icao: "WADD", name: "Ngurah Rai International Airport",        city: "Denpasar (Bali)", country: "Indonesia" },
    { iata: "MNL", icao: "RPLL", name: "Ninoy Aquino International Airport",      city: "Manila",   country: "Philippines" },

    // East Asia
    { iata: "HKG", icao: "VHHH", name: "Hong Kong International Airport",         city: "Hong Kong", country: "Hong Kong" },
    { iata: "TPE", icao: "RCTP", name: "Taiwan Taoyuan International Airport",    city: "Taipei",   country: "Taiwan" },
    { iata: "PEK", icao: "ZBAA", name: "Beijing Capital International Airport",   city: "Beijing",  country: "China" },
    { iata: "PKX", icao: "ZBAD", name: "Beijing Daxing International Airport",    city: "Beijing",  country: "China" },
    { iata: "PVG", icao: "ZSPD", name: "Shanghai Pudong International Airport",   city: "Shanghai", country: "China" },
    { iata: "CAN", icao: "ZGGG", name: "Guangzhou Baiyun International Airport",  city: "Guangzhou", country: "China" },
    { iata: "KMG", icao: "ZPPP", name: "Kunming Changshui International Airport", city: "Kunming",  country: "China" },
    { iata: "NRT", icao: "RJAA", name: "Narita International Airport",            city: "Tokyo",    country: "Japan" },
    { iata: "HND", icao: "RJTT", name: "Tokyo Haneda Airport",                    city: "Tokyo",    country: "Japan" },
    { iata: "KIX", icao: "RJBB", name: "Kansai International Airport",            city: "Osaka",    country: "Japan" },
    { iata: "ICN", icao: "RKSI", name: "Incheon International Airport",           city: "Seoul",    country: "South Korea" },
    { iata: "GMP", icao: "RKSS", name: "Gimpo International Airport",             city: "Seoul",    country: "South Korea" },

    // Europe
    { iata: "LHR", icao: "EGLL", name: "London Heathrow Airport",                 city: "London",   country: "United Kingdom" },
    { iata: "LGW", icao: "EGKK", name: "London Gatwick Airport",                  city: "London",   country: "United Kingdom" },
    { iata: "STN", icao: "EGSS", name: "London Stansted Airport",                 city: "London",   country: "United Kingdom" },
    { iata: "MAN", icao: "EGCC", name: "Manchester Airport",                      city: "Manchester", country: "United Kingdom" },
    { iata: "BHX", icao: "EGBB", name: "Birmingham Airport",                      city: "Birmingham", country: "United Kingdom" },
    { iata: "CDG", icao: "LFPG", name: "Paris Charles de Gaulle Airport",         city: "Paris",    country: "France" },
    { iata: "ORY", icao: "LFPO", name: "Paris Orly Airport",                      city: "Paris",    country: "France" },
    { iata: "FRA", icao: "EDDF", name: "Frankfurt Airport",                       city: "Frankfurt", country: "Germany" },
    { iata: "MUC", icao: "EDDM", name: "Munich Airport",                          city: "Munich",   country: "Germany" },
    { iata: "AMS", icao: "EHAM", name: "Amsterdam Airport Schiphol",              city: "Amsterdam", country: "Netherlands" },
    { iata: "ZRH", icao: "LSZH", name: "Zurich Airport",                          city: "Zurich",   country: "Switzerland" },
    { iata: "VIE", icao: "LOWW", name: "Vienna International Airport",            city: "Vienna",   country: "Austria" },
    { iata: "MAD", icao: "LEMD", name: "Madrid Barajas Airport",                  city: "Madrid",   country: "Spain" },
    { iata: "BCN", icao: "LEBL", name: "Barcelona–El Prat Airport",               city: "Barcelona", country: "Spain" },
    { iata: "FCO", icao: "LIRF", name: "Leonardo da Vinci Airport",               city: "Rome",     country: "Italy" },
    { iata: "MXP", icao: "LIMC", name: "Milan Malpensa Airport",                  city: "Milan",    country: "Italy" },
    { iata: "LIS", icao: "LPPT", name: "Lisbon Portela Airport",                  city: "Lisbon",   country: "Portugal" },
    { iata: "CPH", icao: "EKCH", name: "Copenhagen Airport",                      city: "Copenhagen", country: "Denmark" },
    { iata: "ARN", icao: "ESSA", name: "Stockholm Arlanda Airport",               city: "Stockholm", country: "Sweden" },
    { iata: "HEL", icao: "EFHK", name: "Helsinki-Vantaa Airport",                 city: "Helsinki", country: "Finland" },
    { iata: "OSL", icao: "ENGM", name: "Oslo Airport",                            city: "Oslo",     country: "Norway" },
    { iata: "SVO", icao: "UUEE", name: "Sheremetyevo International Airport",      city: "Moscow",   country: "Russia" },

    // North America
    { iata: "JFK", icao: "KJFK", name: "John F. Kennedy International Airport",   city: "New York", country: "United States" },
    { iata: "EWR", icao: "KEWR", name: "Newark Liberty International Airport",    city: "Newark",   country: "United States" },
    { iata: "LGA", icao: "KLGA", name: "LaGuardia Airport",                       city: "New York", country: "United States" },
    { iata: "LAX", icao: "KLAX", name: "Los Angeles International Airport",       city: "Los Angeles", country: "United States" },
    { iata: "SFO", icao: "KSFO", name: "San Francisco International Airport",     city: "San Francisco", country: "United States" },
    { iata: "ORD", icao: "KORD", name: "Chicago O'Hare International Airport",    city: "Chicago",  country: "United States" },
    { iata: "ATL", icao: "KATL", name: "Hartsfield–Jackson Atlanta International",city: "Atlanta", country: "United States" },
    { iata: "DFW", icao: "KDFW", name: "Dallas/Fort Worth International Airport", city: "Dallas",   country: "United States" },
    { iata: "MIA", icao: "KMIA", name: "Miami International Airport",             city: "Miami",    country: "United States" },
    { iata: "IAD", icao: "KIAD", name: "Washington Dulles International Airport", city: "Washington", country: "United States" },
    { iata: "SEA", icao: "KSEA", name: "Seattle–Tacoma International Airport",    city: "Seattle",  country: "United States" },
    { iata: "BOS", icao: "KBOS", name: "Boston Logan International Airport",      city: "Boston",   country: "United States" },
    { iata: "YYZ", icao: "CYYZ", name: "Toronto Pearson International Airport",   city: "Toronto",  country: "Canada" },
    { iata: "YUL", icao: "CYUL", name: "Montréal–Trudeau International Airport",  city: "Montréal", country: "Canada" },
    { iata: "YVR", icao: "CYVR", name: "Vancouver International Airport",         city: "Vancouver", country: "Canada" },

    // Oceania / Africa
    { iata: "SYD", icao: "YSSY", name: "Sydney Kingsford Smith Airport",          city: "Sydney",   country: "Australia" },
    { iata: "MEL", icao: "YMML", name: "Melbourne Airport",                       city: "Melbourne", country: "Australia" },
    { iata: "BNE", icao: "YBBN", name: "Brisbane Airport",                        city: "Brisbane", country: "Australia" },
    { iata: "PER", icao: "YPPH", name: "Perth Airport",                           city: "Perth",    country: "Australia" },
    { iata: "AKL", icao: "NZAA", name: "Auckland Airport",                        city: "Auckland", country: "New Zealand" },
    { iata: "JNB", icao: "FAOR", name: "OR Tambo International Airport",          city: "Johannesburg", country: "South Africa" },
    { iata: "ADD", icao: "HAAB", name: "Addis Ababa Bole International Airport",  city: "Addis Ababa", country: "Ethiopia" },
    { iata: "NBO", icao: "HKJK", name: "Jomo Kenyatta International Airport",     city: "Nairobi",  country: "Kenya" },
  ];

  /* ---------- Class / Cabin / Meal / Status vocab ---------- */
  const CLASSES = ["Economy", "Premium Economy", "Business", "First"];
  const CABINS  = ["Y — Economy", "W — Premium Economy", "C — Business", "F — First"];
  const MEALS   = ["No meal", "Standard", "Vegetarian (VGML)", "Vegan (VGML)", "Halal (MOML)", "Kosher (KSML)", "Hindu (HNML)", "Special / Diabetic"];
  const STATUSES = ["Confirmed (HK)", "Waitlisted (HL)", "On Request (RQ)", "Cancelled (XX)"];

  /* ---------- Helpers ---------- */
  const norm = (s) => String(s || "").toLowerCase();
  const matchAirline = (a, q) => {
    q = norm(q);
    return norm(a.name).includes(q) || norm(a.iata) === q || norm(a.icao) === q || norm(a.iata + " " + a.name).includes(q) || norm(a.country).includes(q);
  };
  const matchAirport = (a, q) => {
    q = norm(q);
    return norm(a.name).includes(q) || norm(a.city).includes(q) || norm(a.country).includes(q) || norm(a.iata) === q || norm(a.icao) === q || norm(a.iata + " " + a.city).includes(q);
  };
  const findAirlineByIata = (iata) => AIRLINES.find(a => a.iata.toUpperCase() === String(iata || "").toUpperCase());
  const findAirportByIata = (iata) => AIRPORTS.find(a => a.iata.toUpperCase() === String(iata || "").toUpperCase());

  /* Airline logo helper (uses a widely-used public CDN of airline logos). */
  const airlineLogo = (iata) => iata ? `https://images.kiwi.com/airlines/64/${String(iata).toUpperCase()}.png` : "";

  global.Aviation = {
    AIRLINES, AIRPORTS, CLASSES, CABINS, MEALS, STATUSES,
    matchAirline, matchAirport, findAirlineByIata, findAirportByIata, airlineLogo,
    searchAirlines: (q) => AIRLINES.filter(a => matchAirline(a, q)).slice(0, 30),
    searchAirports: (q) => AIRPORTS.filter(a => matchAirport(a, q)).slice(0, 30),
  };
})(window);
