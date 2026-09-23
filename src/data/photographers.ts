import { Photographer, BookingAddOn, BookingRequest } from '../types';

export const AVAILABLE_ADDONS: BookingAddOn[] = [
  {
    id: 'digitech-assistant',
    name: 'Lighting Assistant & Laptop Screen (+₹12,000)',
    price: 12000,
    description: 'A professional assistant to manage lighting equipment, live camera preview on a calibrated laptop screen, and instant backup.'
  },
  {
    id: 'medium-format',
    name: 'Ultra High-Resolution Camera (+₹18,000)',
    price: 18000,
    description: '100-Megapixel Hasselblad medium format camera for ultra-sharp billboard and luxury print details.'
  },
  {
    id: 'retouching-express',
    name: 'Fast Photo Retouching (15 Photos) (+₹14,000)',
    price: 14000,
    description: 'High-end color correction and skin/garment retouching delivered within 48 hours.'
  },
  {
    id: 'drone-aerial',
    name: 'Drone Aerial Photos (+₹16,000)',
    price: 16000,
    description: 'Certified drone pilot for overhead 4K aerial shots of heritage venues, landscapes, and architectural locations.'
  },
  {
    id: 'location-scout',
    name: 'Location Scouting & Shoot Permits (+₹10,000)',
    price: 10000,
    description: 'Prior visit to the location, lighting check, and assistance with venue entry permissions.'
  }
];

export const INITIAL_PHOTOGRAPHERS: Photographer[] = [
  {
    id: 'darshan-mehta',
    name: 'Darshan Mehta',
    location: 'Ahmedabad & Kutch, Gujarat',
    officeLocation: 'Ahmedabad Heritage Studio, Ashram Road, Ahmedabad, Gujarat',
    officeAddress: '12/3 Ashram Road, Ahmedabad, Gujarat 380009',
    officeMapUrl: 'https://www.google.com/maps?q=Ashram%20Road%20Ahmedabad%20Gujarat&output=embed',
    baseCity: 'Ahmedabad',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    heroImage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=85',
    primaryCategory: 'Architecture & Real Estate',
    specialties: ['Architecture & Real Estate', 'Travel & Documentary'],
    experienceLevel: 'master',
    experienceYears: 12,
    rating: 4.98,
    reviewCount: 47,
    dayRate: 95000,
    halfDayRate: 58000,
    availableNow: true,
    nextAvailableDate: '2026-09-24',
    clientRoster: ['National Institute of Design (NID)', 'Vogue India', 'Gujarat Tourism', 'Raw Mango', 'Torani India', 'Crafts Council of India'],
    bio: 'Based in the UNESCO World Heritage city of Ahmedabad and the salt plains of Kutch, Darshan specializes in documenting Gujarat\'s living architectural wonders, subterranean stepwells, and ancient craft traditions. From the intricate five-story sandstone carvings of Adalaj Vav to the stark white expanse of the Rann of Kutch and Patan Patola double-ikat silk looms, his work celebrates Gujarat with ethnographic depth and refined editorial restraint.',
    awards: ['NID Excellence in Visual Craft 2025', 'UNESCO Asia-Pacific Cultural Documentation Fellow', 'National Geography Heritage Storyteller'],
    equipment: ['Hasselblad X2D 100C', 'XCD 38mm f/2.5 & 90mm f/2.5', 'Linhof 617 Panoramic Film Camera', 'Profoto B10X Plus'],
    cameraFormat: 'Medium Format 100MP & 6x17 Panoramic',
    turnaroundDays: 3,
    assistantIncluded: true,
    homeSliderPhotos: [
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1000&q=85'
    ],
    portfolio: [
      {
        id: 'dm-1',
        title: 'Heritage Sandstone Pavilion & Archway',
        clientOrSeries: 'Torani Rann Monograph & Gujarat Tourism',
        category: 'Heritage Architecture & Spaces',
        imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1000&q=85',
        aspectRatio: '4:5',
        year: '2026',
        location: 'Historic Stepwell Pavilion, Ahmedabad / Gujarat',
        techSpecs: 'Hasselblad X2D • 38mm f/2.5 • 1/320s at f/5.6 • ISO 64',
        story: 'Hand-carved Solanki sandstone arches and morning sunbeams illuminating ancient geometric motifs.'
      },
      {
        id: 'dm-2',
        title: 'Subterranean Carvings of Adalaj Vav',
        clientOrSeries: 'Architectural Digest India Heritage Issue',
        category: 'Heritage Architecture & Spaces',
        imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=85',
        aspectRatio: '3:2',
        year: '2025',
        location: 'Adalaj Stepwell, Gandhinagar / Ahmedabad',
        techSpecs: 'Linhof 617 Panoramic • Rodenstock 70mm • 8s at f/16 • ISO 50',
        story: 'Five levels of carved Solanki sandstone octagonal colonnades illuminated by filtered zenith sunlight shafts.'
      },
      {
        id: 'dm-3',
        title: 'Patan Patola Double Ikat Geometry',
        clientOrSeries: 'Raw Mango Artisan Master Series',
        category: 'Documentary & Handloom Arts',
        imageUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1000&q=85',
        aspectRatio: '1:1',
        year: '2026',
        location: 'Salvi Wada Weavers, Patan, North Gujarat',
        techSpecs: 'Hasselblad X2D • 120mm Macro • 1/250s at f/8 • ISO 100',
        story: 'Natural vegetable dyes of madder red and indigo warp-and-weft threads aligned with thousand-year-old mathematical precision.'
      },
      {
        id: 'dm-4',
        title: 'Pols of Old Ahmedabad & Carved Otlas',
        clientOrSeries: 'UNESCO World Heritage City Monograph',
        category: 'Heritage Architecture & Spaces',
        imageUrl: 'https://images.unsplash.com/photo-1566438480900-0609be27a4be?auto=format&fit=crop&w=1200&q=85',
        aspectRatio: '16:9',
        year: '2025',
        location: 'Dhal ni Pol, Historic Old Ahmedabad',
        techSpecs: 'Hasselblad X2D • 38mm f/2.5 • 1/125s at f/5.6 • ISO 100',
        story: 'Hand-carved wooden Burma teak jharokhas, brass-embossed doorways, and morning birdfeeders (chabutras).'
      }
    ]
  },
  {
    id: 'kavita-patel',
    name: 'Kavita Patel',
    location: 'Vadodara & Surat, Gujarat',
    officeLocation: 'Lukshmi Villas Studio, Vadodara, Gujarat',
    officeAddress: 'Lukshmi Villas Palace Area, Vadodara, Gujarat 390001',
    officeMapUrl: 'https://www.google.com/maps?q=Lukshmi%20Villas%20Vadodara%20Gujarat&output=embed',
    baseCity: 'Vadodara',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    heroImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
    primaryCategory: 'Fashion & Editorial',
    specialties: ['Fashion & Editorial', 'Product & E-Commerce'],
    experienceLevel: 'professional',
    experienceYears: 6,
    rating: 4.96,
    reviewCount: 38,
    dayRate: 65000,
    halfDayRate: 40000,
    availableNow: true,
    nextAvailableDate: '2026-09-23',
    clientRoster: ['Asopalav Couture', "Harper\'s Bazaar India", 'Good Earth', 'Forest Essentials', 'Sabyasachi'],
    bio: 'An alumna of Maharaja Sayajirao University (MSU) Faculty of Fine Arts Vadodara, Kavita blends Gujarat\'s vibrant royal heritage with contemporary haute couture. She is celebrated for capturing Bandhani tie-dye silks, Ashavali brocade saris, and the Indo-Saracenic splendor of Vadodara\'s Lukshmi Villas Palace.',
    awards: ['Vogue India Emerging Fashion Voice 2025', 'Gujarat State Lalit Kala Visual Arts Honor'],
    equipment: ['Fujifilm GFX 100 II', 'GF 110mm f/2 R LM WR', 'Broncolor Siros 800S', 'Calibrated EIZO ColorEdge'],
    cameraFormat: 'Fujifilm GFX 102MP Medium Format',
    turnaroundDays: 4,
    assistantIncluded: true,
    homeSliderPhotos: [
      'https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1609137144822-085e68ca4be6?auto=format&fit=crop&w=1000&q=85'
    ],
    portfolio: [
      {
        id: 'kp-1',
        title: 'Lukshmi Villas Palace Sunken Court',
        clientOrSeries: 'Asopalav Royal Couture Monograph',
        category: 'Fashion & Haute Couture',
        imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&w=1000&q=85',
        aspectRatio: '4:5',
        year: '2026',
        location: 'Lukshmi Villas Palace, Vadodara, Gujarat',
        techSpecs: 'Fujifilm GFX 100 II • GF 45mm f/2.8 • 1/160s at f/5.6 • ISO 100',
        story: 'Belgian stained-glass windows casting ruby and amber reflections across Ashavali gold brocade bridal drapes.'
      },
      {
        id: 'kp-2',
        title: 'Mandvi Bandhani Wind Symphony',
        clientOrSeries: 'Harper\'s Bazaar India Festive Spread',
        category: 'Fashion & Haute Couture',
        imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=85',
        aspectRatio: '3:2',
        year: '2025',
        location: 'Mandvi Palace Coast, Kutch, Gujarat',
        techSpecs: 'Fujifilm GFX 100 II • GF 110mm f/2 • 1/1000s at f/2.2 • ISO 100',
        story: 'Hand-tied pure georgette Bandhani dupattas in crimson and haldi yellow floating against the Arabian Sea surf.'
      },
      {
        id: 'kp-3',
        title: 'Surya Kund Solstice Dawn',
        clientOrSeries: 'Good Earth Cultural Campaign',
        category: 'Still Life & Ayurvedic Craft',
        imageUrl: 'https://images.unsplash.com/photo-1609137144822-085e68ca4be6?auto=format&fit=crop&w=1000&q=85',
        aspectRatio: '1:1',
        year: '2026',
        location: 'Modhera Sun Temple, Mehsana, Gujarat',
        techSpecs: 'GFX 100 II • GF 32-64mm • 1/250s at f/8 • ISO 100',
        story: '11th-century carved miniature shrines around the sacred stepped reservoir reflecting golden equinox rays.'
      },
      {
        id: 'kp-4',
        title: 'Rajkot Polki & Meenakari Jewels',
        clientOrSeries: 'Forest Essentials & Heritage Stills',
        category: 'Still Life & Ayurvedic Craft',
        imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=85',
        aspectRatio: '16:9',
        year: '2025',
        location: 'Goldsmiths Atelier, Rajkot, Gujarat',
        techSpecs: 'GFX 100 II • 120mm Macro • Focus Stacking 20 frames • ISO 64',
        story: 'Detailed macro of green enamel meenakari work and uncut diamonds nestled on vintage Gujarati brocade.'
      }
    ]
  },
  {
    id: 'rohan-varma',
    name: 'Rohan Varma',
    location: 'Mumbai, Maharashtra',
    officeLocation: 'Bandra Creative Studio, Mumbai, Maharashtra',
    officeAddress: '7th Floor, Hill Road, Bandra West, Mumbai, Maharashtra 400050',
    officeMapUrl: 'https://www.google.com/maps?q=Bandra%20West%20Mumbai%20Maharashtra&output=embed',
    baseCity: 'Mumbai',
    avatar: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?auto=format&fit=crop&w=300&q=80',
    heroImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
    primaryCategory: 'Fashion & Editorial',
    specialties: ['Fashion & Editorial', 'Portraits & Headshots'],
    experienceLevel: 'master',
    experienceYears: 14,
    rating: 4.98,
    reviewCount: 48,
    dayRate: 140000,
    halfDayRate: 85000,
    availableNow: true,
    nextAvailableDate: '2026-09-24',
    clientRoster: ['Vogue India', 'Sabyasachi', "Harper\'s Bazaar India", 'Manish Malhotra', 'Elle India'],
    bio: 'Renowned for his dramatic mastery of Indian natural chiaroscuro and cinematic grandeur. Rohan synthesizes royal handwoven silks, raw Banarasi brocades, and modern couture without artificial studio rigidity, capturing emotional intimacy and intricate craftsmanship.',
    awards: ['Vogue Beauty & Fashion Photographer of the Year 2024', 'Lalit Kala Akademi National Visual Arts Honor'],
    equipment: ['Hasselblad X2D 100C', 'Leica M11-P 35mm f/1.4 Summilux', 'Profoto Pro-11 Generators', 'Broncolor Parabol 177cm'],
    cameraFormat: 'Medium Format 100MP & Leica Rangefinder',
    turnaroundDays: 4,
    assistantIncluded: true,
    homeSliderPhotos: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=85'
    ],
    portfolio: [
      {
        id: 'rv-1',
        title: 'The Crimson Silk Chronicle',
        clientOrSeries: 'Sabyasachi Heritage Bridal 2026',
        category: 'Fashion & Haute Couture',
        imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=85',
        aspectRatio: '4:5',
        year: '2026',
        location: 'City Palace, Jaipur',
        techSpecs: 'Hasselblad X2D • XCD 90mm f/2.5 • 1/250s at f/4.0 • ISO 64',
        story: 'Handwoven crimson lehenga and heritage polki emeralds photographed under early morning filtered sunlight through carved marble jharokhas.'
      },
      {
        id: 'rv-2',
        title: 'Banaras Gold Weft Studies',
        clientOrSeries: 'Vogue India Cover Story',
        category: 'Editorial Portraiture',
        imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=85',
        aspectRatio: '3:2',
        year: '2025',
        location: 'Assi Ghat, Varanasi',
        techSpecs: 'Leica M11-P • 50mm Noctilux f/0.95 • 1/500s at f/1.2 • ISO 100',
        story: 'Natural golden hour ambient glow over the Ganga river capturing intricate pure gold zari weaves and unscripted feminine poise.'
      },
      {
        id: 'rv-3',
        title: 'Modern Rajputana Minimalist',
        clientOrSeries: 'Raw Mango Capsule Monograph',
        category: 'Fashion & Haute Couture',
        imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=85',
        aspectRatio: '1:1',
        year: '2026',
        location: 'Amer Stepwell (Panna Meena Ka Kund)',
        techSpecs: 'Phase One IQ4 • 80mm Schneider • 1/320s at f/8 • ISO 50',
        story: 'Geometric sandstone stairways framing draped tussar silk in high-noon hard graphic shadows.'
      },
      {
        id: 'rv-4',
        title: 'The Royal Velvet Archive',
        clientOrSeries: 'Architectural Digest & Tarun Tahiliani',
        category: 'Fashion & Haute Couture',
        imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=85',
        aspectRatio: '16:9',
        year: '2026',
        location: 'Mehboob Studios, Bandra Mumbai',
        techSpecs: 'Hasselblad X2D • 120mm Macro • Broncolor Scoro 3200',
        story: 'Intimate close-range macro of bullion zardozi metallic wirework and antique gem insets.'
      }
    ]
  },
  {
    id: 'ananya-deshmukh',
    name: 'Ananya Deshmukh',
    location: 'Jaipur & New Delhi',
    baseCity: 'Jaipur',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    heroImage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=85',
    primaryCategory: 'Architecture & Real Estate',
    specialties: ['Architecture & Real Estate', 'Commercial & Advertising'],
    experienceLevel: 'master',
    experienceYears: 10,
    rating: 4.96,
    reviewCount: 39,
    dayRate: 125000,
    halfDayRate: 75000,
    availableNow: false,
    nextAvailableDate: '2026-09-29',
    clientRoster: ['Architectural Digest India', 'Taj Hotels & Palaces', 'The Oberoi Group', 'Good Earth', 'Conde Nast Traveller India'],
    bio: 'Trained in architecture at CEPT University Ahmedabad, Ananya documents India\'s most storied palatial restorations, stepwells, and modernist pavilions. Her compositions balance strict geometric alignment with the organic movement of dust and desert sunlight.',
    awards: ['Architectural Photographer of the Year, India Design ID 2025', 'Pritzker Photography Fellowship Nominee'],
    equipment: ['Phase One IQ4 150MP Achromatic', 'Linhof Techno Technical Camera', 'Rodenstock HR Digaron 32mm & 70mm', 'Cambo Actus-G'],
    cameraFormat: '150MP Large Format Technical',
    turnaroundDays: 5,
    assistantIncluded: true,
    portfolio: [
      {
        id: 'ad-1',
        title: 'Morning Light at Samode Haveli',
        clientOrSeries: 'Taj Heritage Conservation Monograph',
        category: 'Heritage Architecture & Spaces',
        imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1000&q=85',
        aspectRatio: '4:5',
        year: '2025',
        location: 'Samode, Rajasthan',
        techSpecs: 'Linhof Techno • Rodenstock 32mm • 2s at f/11 • ISO 35 • Tilt +2°',
        story: 'Centuries-old frescoed courtyards captured precisely as morning amber sunlight cuts through carved sandstone jharokhas.'
      },
      {
        id: 'ad-2',
        title: 'Mughal Marble Pavilion Symmetry',
        clientOrSeries: 'Architectural Digest India Exclusive',
        category: 'Heritage Architecture & Spaces',
        imageUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1000&q=85',
        aspectRatio: '3:2',
        year: '2026',
        location: 'Agra Fort & Taj Courtyards',
        techSpecs: 'Phase One IQ4 • 50mm Digaron • 1/60s at f/8 • ISO 50',
        story: 'Pure Makrana white marble arches reflecting morning mist across serene fountain waterways.'
      },
      {
        id: 'ad-3',
        title: 'Jaipur Terracotta & Sandstone Facades',
        clientOrSeries: 'Good Earth Heritage Campaign',
        category: 'Commercial Campaigns',
        imageUrl: 'https://images.unsplash.com/photo-1598890777032-bde835ba27c2?auto=format&fit=crop&w=1000&q=85',
        aspectRatio: '1:1',
        year: '2025',
        location: 'Hawa Mahal Precinct, Jaipur',
        techSpecs: 'Phase One IQ4 • 70mm Rodenstock • 1/125s at f/11 • ISO 50',
        story: 'Pink city lime-plaster latticework framing curated artisanal brass homeware and silk tapestries.'
      },
      {
        id: 'ad-4',
        title: 'The Oberoi Udaivilas Lake Pavilion',
        clientOrSeries: 'The Oberoi Group Luxury Campaign',
        category: 'Commercial Campaigns',
        imageUrl: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=85',
        aspectRatio: '16:9',
        year: '2026',
        location: 'Lake Pichola, Udaipur',
        techSpecs: 'Linhof Techno • 40mm HR Digaron • Blue Hour Exposure 8s at f/8',
        story: 'Hand-chiseled dome columns illuminated by floating lotus oil lamps during twilight.'
      }
    ]
  },
  {
    id: 'kabir-malhotra',
    name: 'Kabir Malhotra',
    location: 'Mumbai, Maharashtra',
    baseCity: 'Mumbai',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    heroImage: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=85',
    primaryCategory: 'Product & E-Commerce',
    specialties: ['Product & E-Commerce', 'Commercial & Advertising'],
    experienceLevel: 'master',
    experienceYears: 13,
    rating: 4.97,
    reviewCount: 52,
    dayRate: 110000,
    halfDayRate: 68000,
    availableNow: true,
    nextAvailableDate: '2026-09-25',
    clientRoster: ['Tanishq', 'Titan Raga', 'Forest Essentials', 'Cartier India', 'Kama Ayurveda'],
    bio: 'India\'s foremost luxury jewelry and botanical cosmetic still-life photographer, operating out of Famous Studios, Mahalaxmi. Kabir has pioneered custom micro-lighting rigs to highlight uncut Polki diamonds, 22K temple gold patina, and pure Ayurvedic cold-pressed botanical oils.',
    awards: ['Cannes Lions Bronze (Luxury Craft Photography)', 'Kyoorius D&AD Black Elephant for Commercial Stills'],
    equipment: ['Hasselblad H6D-100c', 'Schneider Apo-Digitar 120mm Macro', 'Broncolor Fiber Optic Lightguides', 'Briese Focus 100'],
    cameraFormat: '100MP Medium Format & Fiber-Optic Rigs',
    turnaroundDays: 3,
    assistantIncluded: true,
    portfolio: [
      {
        id: 'km-1',
        title: 'Polki Emerald & Basra Pearl Cascade',
        clientOrSeries: 'Tanishq Royal Heritage Collection',
        category: 'Still Life & Ayurvedic Craft',
        imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=85',
        aspectRatio: '4:5',
        year: '2026',
        location: 'Famous Studios, Mahalaxmi Mumbai',
        techSpecs: 'Hasselblad H6D • 120mm Macro • 24-frame focus stack • ISO 64',
        story: 'Natural diamond refraction and antique uncut emerald hues illuminated using miniature fiber-optic probes.'
      },
      {
        id: 'km-2',
        title: 'Kundan Choker on Black Basalt',
        clientOrSeries: 'Titan Raga Luxury Launch',
        category: 'Commercial Campaigns',
        imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&q=85',
        aspectRatio: '3:2',
        year: '2025',
        location: 'Studio 4, South Bombay',
        techSpecs: 'Hasselblad H6D • 90mm f/2.2 • 1/250s at f/11 • ISO 64',
        story: 'Sculptural pure 22K gold temple motifs reflecting liquid amber tones on rough Deccan basalt stone.'
      },
      {
        id: 'km-3',
        title: 'Ayurvedic Botanicals & Saffron Nectar',
        clientOrSeries: 'Forest Essentials Soundarya Monograph',
        category: 'Still Life & Ayurvedic Craft',
        imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1000&q=85',
        aspectRatio: '1:1',
        year: '2026',
        location: 'Famous Studios, Mumbai',
        techSpecs: 'Hasselblad H6D • 120mm Macro • Broncolor Scoro High-Speed Flash',
        story: 'Kashmiri Mogra saffron strands, cold-pressed almond oil droplets, and hand-beaten gold leaf.'
      },
      {
        id: 'km-4',
        title: 'Solitaire Solstice',
        clientOrSeries: 'De Beers Forevermark India',
        category: 'Commercial Campaigns',
        imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=85',
        aspectRatio: '16:9',
        year: '2025',
        location: 'Worli Studio Pavilion',
        techSpecs: 'Phase One IQ4 • 150mm Rodenstock • Focus Stacking 32 frames',
        story: 'Precision facet dispersion capturing fire and scintillation with absolute edge sharpness.'
      }
    ]
  },
  {
    id: 'devika-sundaram',
    name: 'Devika Sundaram',
    location: 'Bengaluru & Kochi',
    baseCity: 'Bengaluru',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    heroImage: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=85',
    primaryCategory: 'Product & E-Commerce',
    specialties: ['Product & E-Commerce', 'Food & Culinary'],
    experienceLevel: 'professional',
    experienceYears: 7,
    rating: 4.95,
    reviewCount: 36,
    dayRate: 75000,
    halfDayRate: 45000,
    availableNow: true,
    nextAvailableDate: '2026-09-23',
    clientRoster: ['Fabindia', 'Nicobar', 'Kama Ayurveda', 'Blue Tokai', 'Crafts Council of India'],
    bio: 'An alumnus of the National Institute of Design (NID) Ahmedabad, Devika explores the tactile relationship between organic materials, indigenous craft, and contemporary slow-living aesthetics. Her imagery celebrates natural plant dyes, brassware patina, and handloom cotton textures.',
    awards: ['Serendipity Arts Festival Commission 2024', 'Kochi-Muziris Biennale Invited Artist'],
    equipment: ['Fujifilm GFX 100 II', 'GF 110mm f/2 R LM WR', 'Contax 645 Zeiss 80mm Planar', 'Binchotan Diffusers'],
    cameraFormat: 'Fujifilm GFX 102MP & Medium Format Film',
    turnaroundDays: 4,
    assistantIncluded: true,
    portfolio: [
      {
        id: 'ds-1',
        title: 'Vetiver & Sandalwood Elixir',
        clientOrSeries: 'Kama Ayurveda Pure Ingredients',
        category: 'Still Life & Ayurvedic Craft',
        imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=85',
        aspectRatio: '4:5',
        year: '2026',
        location: 'Kumarakom Plantation, Kerala',
        techSpecs: 'Fujifilm GFX 100 II • GF 120mm Macro • 1/125s at f/5.6 • ISO 100',
        story: 'Distilled vetiver roots and wet clay unglazed pottery photographed in soft monsoonal morning mist.'
      },
      {
        id: 'ds-2',
        title: 'Indigo Resist Dye on Khadi',
        clientOrSeries: 'Nicobar Craft Monograph',
        category: 'Documentary & Handloom Arts',
        imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1000&q=85',
        aspectRatio: '3:2',
        year: '2025',
        location: 'Bagru Artisan Colony, Rajasthan',
        techSpecs: 'Contax 645 • Kodak Portra 400 • 80mm Planar f/2',
        story: 'Drying lengths of hand-block indigo cloth billowing under desert sun, revealing rich mineral blue gradations.'
      },
      {
        id: 'ds-3',
        title: 'Bell Metal Vessels of Kerala',
        clientOrSeries: 'Fabindia Home Collection',
        category: 'Still Life & Ayurvedic Craft',
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1000&q=85',
        aspectRatio: '1:1',
        year: '2026',
        location: 'Fort Kochi Heritage Studio',
        techSpecs: 'GFX 100 II • GF 45mm f/2.8 • 1/60s at f/8 • ISO 200',
        story: 'Cast bronze uruli and brass lamps bathed in warm sidelight from wooden courtyard louvers.'
      },
      {
        id: 'ds-4',
        title: 'The Spice Warehouse Tables',
        clientOrSeries: 'Blue Tokai Roastery & Crafts',
        category: 'Documentary & Handloom Arts',
        imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=85',
        aspectRatio: '16:9',
        year: '2025',
        location: 'Mattancherry, Kochi',
        techSpecs: 'GFX 100 II • GF 110mm f/2 • 1/200s at f/2.8 • ISO 400',
        story: 'Green cardamom, Malabar black pepper mounds, and sun-bleached teak sorting tables.'
      }
    ]
  },
  {
    id: 'arjun-nambiar',
    name: 'Arjun Nambiar',
    location: 'Mumbai & Goa',
    baseCity: 'Mumbai',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
    heroImage: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=1200&q=85',
    primaryCategory: 'Portraits & Headshots',
    specialties: ['Portraits & Headshots', 'Fashion & Editorial'],
    experienceLevel: 'master',
    experienceYears: 15,
    rating: 4.99,
    reviewCount: 64,
    dayRate: 135000,
    halfDayRate: 80000,
    availableNow: true,
    nextAvailableDate: '2026-09-22',
    clientRoster: ['GQ India', 'Rolling Stone India', 'Netflix India', 'Apple India', 'Tarun Tahiliani'],
    bio: 'Renowned for intense, soul-stirring portraits of Bollywood cinema legends, indie musicians, and cultural icons. Arjun combines vintage Leica optical character with continuous warm tungsten kino flos, revealing honest character without clinical digital retouching.',
    awards: ['GQ Men of the Year - Photographer of the Decade', 'Sony World Photography Awards National Winner'],
    equipment: ['Leica SL3', 'Leica Noctilux-M 75mm f/1.25', 'Hasselblad 907X 50C', 'Arri Skypanel S60-C & Tungsten Fresnels'],
    cameraFormat: 'Leica Full Frame & Hasselblad Digital Back',
    turnaroundDays: 3,
    assistantIncluded: true,
    portfolio: [
      {
        id: 'an-1',
        title: 'Cinema Luminary Monograph',
        clientOrSeries: 'GQ India Anniversary Cover',
        category: 'Editorial Portraiture',
        imageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=1000&q=85',
        aspectRatio: '4:5',
        year: '2026',
        location: 'Mehboob Studios, Bandra Mumbai',
        techSpecs: 'Leica SL3 • 75mm Noctilux • 1/250s at f/1.4 • ISO 100 • Arri Tungsten',
        story: 'High-contrast monochrome lighting sculpting the gaze of an iconic Indian performing artist.'
      },
      {
        id: 'an-2',
        title: 'Goa Dusk in Khadi Sherwani',
        clientOrSeries: 'Tarun Tahiliani Men\'s Couture',
        category: 'Fashion & Haute Couture',
        imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1000&q=85',
        aspectRatio: '3:2',
        year: '2025',
        location: 'Fontainhas Latin Quarter, Panaji Goa',
        techSpecs: 'Hasselblad 907X • 45mm f/4 • 1/160s at f/4.5 • ISO 100',
        story: 'Ochre Portuguese colonial facades and raw linen tailored silhouettes in the sultry twilight breeze.'
      },
      {
        id: 'an-3',
        title: 'The Independent Musician',
        clientOrSeries: 'Rolling Stone India Feature',
        category: 'Editorial Portraiture',
        imageUrl: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?auto=format&fit=crop&w=1000&q=85',
        aspectRatio: '1:1',
        year: '2026',
        location: 'Arambol Beach Cliff, North Goa',
        techSpecs: 'Leica SL3 • 50mm Summilux • 1/1000s at f/2.0 • ISO 200',
        story: 'Natural sunset spray and sea salt haze catching silhouetted posture against the Arabian Sea.'
      },
      {
        id: 'an-4',
        title: 'Midnight Stage Chiaroscuro',
        clientOrSeries: 'Netflix India Spotlight',
        category: 'Editorial Portraiture',
        imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=85',
        aspectRatio: '16:9',
        year: '2025',
        location: 'Royal Opera House, South Mumbai',
        techSpecs: 'Leica SL3 • 90mm APO-Summicron • 1/125s at f/2.0 • ISO 800',
        story: 'Gilded 19th-century Victorian proscenium arch creating golden reflections during rehearsal pause.'
      }
    ]
  },
  {
    id: 'tara-kulkarni',
    name: 'Tara Kulkarni',
    location: 'New Delhi, NCR',
    baseCity: 'New Delhi',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    heroImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
    primaryCategory: 'Fashion & Editorial',
    specialties: ['Fashion & Editorial', 'Commercial & Advertising'],
    experienceLevel: 'professional',
    experienceYears: 7,
    rating: 4.97,
    reviewCount: 44,
    dayRate: 90000,
    halfDayRate: 55000,
    availableNow: true,
    nextAvailableDate: '2026-09-26',
    clientRoster: ['Elle India', 'Raw Mango', 'Torani', 'Anita Dongre', "Harper\'s Bazaar India"],
    bio: 'Celebrating India\'s living textiles, architectural monuments, and contemporary feminist expression. Tara weaves lyrical narratives with vivid jewel tones, floating handloom organzas, and Lutyens\' Delhi sunrise geometry.',
    awards: ['Elle Fashion Photographer of the Year 2025', 'National Geographic Explorer Storyteller Grantee'],
    equipment: ['Canon EOS R5C', 'Canon RF 50mm f/1.2L', 'Hasselblad H6D-100c', 'Profoto B10X Plus'],
    cameraFormat: 'Medium Format & High-Speed Mirrorless',
    turnaroundDays: 4,
    assistantIncluded: true,
    portfolio: [
      {
        id: 'tk-1',
        title: 'Organza & Red Sandstone Ode',
        clientOrSeries: 'Torani Festive Capsule',
        category: 'Fashion & Haute Couture',
        imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=85',
        aspectRatio: '4:5',
        year: '2026',
        location: 'Humayun\'s Tomb Gardens, New Delhi',
        techSpecs: 'Hasselblad H6D • 80mm f/2.8 • 1/500s at f/4.0 • ISO 100',
        story: 'Layered chanderi and sheer organza odhnis catching first morning rays in symmetrical Mughal charbagh.'
      },
      {
        id: 'tk-2',
        title: 'The Lodhi Mural Dialogue',
        clientOrSeries: 'Elle India Fashion Editorial',
        category: 'Fashion & Haute Couture',
        imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=85',
        aspectRatio: '3:2',
        year: '2025',
        location: 'Lodhi Art District, New Delhi',
        techSpecs: 'Canon R5C • RF 85mm f/1.2L • 1/800s at f/2.0 • ISO 100',
        story: 'Graphic handloom stripes contrasted against bold contemporary public street murals.'
      },
      {
        id: 'tk-3',
        title: 'Gulmarg Cashmere Campaign',
        clientOrSeries: 'Anita Dongre Grassroot Luxury',
        category: 'Commercial Campaigns',
        imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85',
        aspectRatio: '1:1',
        year: '2026',
        location: 'Pine Valleys, Gulmarg Kashmir',
        techSpecs: 'Canon R5C • RF 50mm f/1.2L • 1/1200s at f/2.8 • ISO 64',
        story: 'Natural wool pashmina and needlework sozni embroidery captured in high Himalayan diffused light.'
      },
      {
        id: 'tk-4',
        title: 'The Heritage Terrace',
        clientOrSeries: 'Raw Mango Festive Monograph',
        category: 'Fashion & Haute Couture',
        imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=85',
        aspectRatio: '16:9',
        year: '2025',
        location: 'Haveli Dharampura, Old Delhi',
        techSpecs: 'Hasselblad H6D • 100mm f/2.2 • 1/320s at f/5.6 • ISO 100',
        story: 'Terrace views overlooking Jama Masjid minarets at sunset with pigeon flocks in flight.'
      }
    ]
  },
  {
    id: 'ishaan-chawla',
    name: 'Ishaan Chawla',
    location: 'Gurugram & Mumbai',
    baseCity: 'New Delhi',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    heroImage: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=85',
    primaryCategory: 'Commercial & Advertising',
    specialties: ['Commercial & Advertising', 'Architecture & Real Estate'],
    experienceLevel: 'master',
    experienceYears: 11,
    rating: 4.98,
    reviewCount: 57,
    dayRate: 150000,
    halfDayRate: 90000,
    availableNow: false,
    nextAvailableDate: '2026-09-28',
    clientRoster: ['Tata Motors Luxury', 'Royal Enfield', 'Mahindra Automotive', 'Samsung India', 'GQ India'],
    bio: 'India\'s premier automotive and large-scale commercial location photographer. Ishaan is renowned for cinematic precision lighting on high-gloss metallic surfaces, moving rig captures, and bold architectural backdrops across India\'s desert highways and coastal sea links.',
    awards: ['Adfest Asia Gold - Best Commercial Photography', 'Auto Car India Visual Campaign of the Year'],
    equipment: ['Sony A1 Dual Kits', 'Broncolor Move 1200L Mobile Generators', 'Rigwheels Automotive Suction Rigs', 'Sony GM Primes'],
    cameraFormat: 'High-Speed 50MP Rigged & Strobe Pack',
    turnaroundDays: 4,
    assistantIncluded: true,
    portfolio: [
      {
        id: 'ic-1',
        title: 'Bandra-Worli Sea Link Twilight Run',
        clientOrSeries: 'Tata Motors EV Flagship Campaign',
        category: 'Commercial Campaigns',
        imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1000&q=85',
        aspectRatio: '4:5',
        year: '2026',
        location: 'Mumbai Coastal Road & Sea Link',
        techSpecs: 'Sony A1 • 24mm f/1.4 GM • 1/30s at f/8 • Rig Tracking • ISO 100',
        story: 'Motion-blurred Arabian Sea waves juxtaposed against the crisp cable-stayed bridge towers at dusk.'
      },
      {
        id: 'ic-2',
        title: 'Thar Desert Dunes Speed Trial',
        clientOrSeries: 'Royal Enfield Himalayan Global Campaign',
        category: 'Commercial Campaigns',
        imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=85',
        aspectRatio: '3:2',
        year: '2025',
        location: 'Sam Sand Dunes, Jaisalmer',
        techSpecs: 'Sony A1 • 70-200mm f/2.8 GM II • 1/2500s at f/4 • ISO 200',
        story: 'Golden sand plume backlit by harsh desert sun revealing bike suspension articulation.'
      },
      {
        id: 'ic-3',
        title: 'Brutalist Concrete Pavilion',
        clientOrSeries: 'Architectural Digest & Tech Campaign',
        category: 'Heritage Architecture & Spaces',
        imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=85',
        aspectRatio: '1:1',
        year: '2026',
        location: 'Chandigarh Capitol Complex',
        techSpecs: 'Sony A1 • 35mm f/1.4 GM • 1/160s at f/11 • ISO 100',
        story: 'Le Corbusier\'s raw exposed concrete geometry framed by monsoon rain puddles.'
      },
      {
        id: 'ic-4',
        title: 'Modern Villa Water Mirror',
        clientOrSeries: 'Luxury Living India Monograph',
        category: 'Heritage Architecture & Spaces',
        imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=85',
        aspectRatio: '16:9',
        year: '2025',
        location: 'Alibaug Waterfront Villa, Maharashtra',
        techSpecs: 'Sony A1 • 16-35mm GM II • 5s at f/11 • Blue Hour Strobe Wash',
        story: 'Infinite pool reflection merging with palm silhouette and illuminated architectural glass facade.'
      }
    ]
  },
  {
    id: 'rohit-saxena',
    name: 'Rohit Saxena',
    location: 'Jaipur & Udaipur, Rajasthan',
    baseCity: 'Jaipur',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
    heroImage: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=85',
    primaryCategory: 'Wedding & Pre-Wedding',
    specialties: ['Wedding & Pre-Wedding', 'Portraits & Headshots'],
    experienceLevel: 'professional',
    experienceYears: 6,
    rating: 4.97,
    reviewCount: 41,
    dayRate: 75000,
    halfDayRate: 45000,
    availableNow: true,
    nextAvailableDate: '2026-09-25',
    clientRoster: ['WedMeGood Curated', 'Vogue Weddings', 'Taj Lake Palace', 'Samode Hotels', 'ShaadiSaga'],
    bio: 'Specializing in royal Indian destination weddings and intimate emotional moments. Rohit combines cinematic documentary storytelling with editorial portraiture across Jaipur havelis and Udaipur palaces.',
    awards: ['Fearless Photographers Excellence Award', 'WedMeGood Best Destination Photographer 2025'],
    equipment: ['Sony A7R V Dual', 'Sony 50mm f/1.2 GM', 'Sony 85mm f/1.4 GM II', 'Godox AD300 Pro Mobile Strobes'],
    cameraFormat: 'Sony 61MP Full Frame & Prime Lenses',
    turnaroundDays: 4,
    assistantIncluded: true,
    portfolio: [
      {
        id: 'rs-1',
        title: 'Amber Courtyard Vows',
        clientOrSeries: 'Royal Samode Wedding Monograph',
        category: 'Wedding & Pre-Wedding',
        imageUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1000&q=85',
        aspectRatio: '4:5',
        year: '2026',
        location: 'Samode Palace Courtyard, Jaipur',
        techSpecs: 'Sony A7R V • 50mm f/1.2 • 1/1000s at f/1.4 • ISO 100',
        story: 'Marigold petal shower catching golden afternoon rays as the royal couple exchanges varmalas.'
      },
      {
        id: 'rs-2',
        title: 'Lake Pichola Twilight Boat',
        clientOrSeries: 'Taj Lake Palace Pre-Wedding Story',
        category: 'Wedding & Pre-Wedding',
        imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=85',
        aspectRatio: '3:2',
        year: '2025',
        location: 'Lake Pichola, Udaipur',
        techSpecs: 'Sony A7R V • 35mm f/1.4 GM • 1/250s at f/2.0 • ISO 200',
        story: 'Handcrafted wooden royal barge cruising in calm waters with illuminated palace arches in background.'
      }
    ]
  },
  {
    id: 'zoya-merchant',
    name: 'Zoya Merchant',
    location: 'Bengaluru & Hyderabad',
    baseCity: 'Bengaluru',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    heroImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=85',
    primaryCategory: 'Food & Culinary',
    specialties: ['Food & Culinary', 'Product & E-Commerce'],
    experienceLevel: 'professional',
    experienceYears: 5,
    rating: 4.96,
    reviewCount: 34,
    dayRate: 52000,
    halfDayRate: 32000,
    availableNow: true,
    nextAvailableDate: '2026-09-24',
    clientRoster: ['Swiggy Gourmet', 'Blue Tokai', 'Subko Coffee', 'Toast & Tonic', 'Olive Beach'],
    bio: 'Crafting mouth-watering culinary stories for premier restaurants, artisan cloud kitchens, and luxury cookbooks. Zoya works with natural window light and precision macro lighting to highlight steam, textures, and rich spices.',
    awards: ['Food Stylist & Photographer of the Year, F&B India 2024'],
    equipment: ['Canon EOS R5', 'Canon RF 100mm f/2.8L Macro', 'Profoto B10X', 'Aputure Continuous LED'],
    cameraFormat: 'Canon 45MP & Precision Macro',
    turnaroundDays: 3,
    assistantIncluded: true,
    portfolio: [
      {
        id: 'zm-1',
        title: 'Artisan Pour-Over & Malabar Beans',
        clientOrSeries: 'Subko Specialty Coffee Series',
        category: 'Food & Culinary',
        imageUrl: 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?auto=format&fit=crop&w=1000&q=85',
        aspectRatio: '4:5',
        year: '2026',
        location: 'Indiranagar Roastery, Bengaluru',
        techSpecs: 'Canon R5 • RF 100mm Macro • 1/200s at f/4.0 • ISO 100',
        story: 'Golden blooming crema and swirling extraction highlighted by morning beam.'
      },
      {
        id: 'zm-2',
        title: 'Saffron & Pistachio Kulfi Palette',
        clientOrSeries: 'Gourmet Indian Desserts Monograph',
        category: 'Food & Culinary',
        imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1000&q=85',
        aspectRatio: '3:2',
        year: '2025',
        location: 'Culinary Arts Studio, Bengaluru',
        techSpecs: 'Canon R5 • 50mm f/1.2 • 1/160s at f/2.8 • ISO 100',
        story: 'Crushed raw green pistachios and edible silver vark on chilled earthen matkas.'
      }
    ]
  },
  {
    id: 'riddhi-parekh',
    name: 'Riddhi Parekh',
    location: 'Ahmedabad & Gandhinagar, Gujarat',
    baseCity: 'Ahmedabad',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    heroImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85',
    primaryCategory: 'Portraits & Headshots',
    specialties: ['Portraits & Headshots', 'Fashion & Editorial'],
    experienceLevel: 'beginner',
    experienceYears: 2,
    rating: 4.92,
    reviewCount: 22,
    dayRate: 38000,
    halfDayRate: 22000,
    availableNow: true,
    nextAvailableDate: '2026-09-22',
    clientRoster: ['NID Graduate Lookbooks', 'Aura Creative Studio', 'CEPT Students Guild', 'Independent Authors'],
    bio: 'An energetic emerging portrait artist from Ahmedabad. Riddhi brings fresh, natural perspectives to creative headshots, graduation portfolios, and indie fashion lookbooks with authentic lighting and quick turnaround.',
    awards: ['NID Young Visionary Merit Award 2025'],
    equipment: ['Fujifilm X-T5', 'Fujinon XF 56mm f/1.2 R WR', 'Godox V1 Flash', 'Reflector Kits'],
    cameraFormat: 'Fujifilm 40MP APS-C & Prime Glass',
    turnaroundDays: 2,
    assistantIncluded: false,
    portfolio: [
      {
        id: 'rp-1',
        title: 'Terracotta Wall Character Study',
        clientOrSeries: 'Ahmedabad Creative Directors Headshots',
        category: 'Portraits & Headshots',
        imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85',
        aspectRatio: '4:5',
        year: '2026',
        location: 'Sabarmati Riverfront Art Center, Ahmedabad',
        techSpecs: 'Fujifilm X-T5 • 56mm f/1.2 • 1/500s at f/1.8 • ISO 125',
        story: 'Natural warm sidelight reflecting off baked terracotta clay creating soft eye catchlights.'
      },
      {
        id: 'rp-2',
        title: 'Monochrome Poet Headshot',
        clientOrSeries: 'Gujarati Literary Society Feature',
        category: 'Portraits & Headshots',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1000&q=85',
        aspectRatio: '3:2',
        year: '2025',
        location: 'Manek Chowk, Old Ahmedabad',
        techSpecs: 'Fujifilm X-T5 • 33mm f/1.4 • 1/250s at f/2.0 • ISO 200',
        story: 'Deep contrast black and white portrait focusing on expressive character lines.'
      }
    ]
  },
  {
    id: 'ananya-joshi',
    name: 'Ananya Joshi',
    location: 'Mumbai & Pune, Maharashtra',
    baseCity: 'Mumbai',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=300&q=80',
    heroImage: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=1200&q=85',
    primaryCategory: 'Maternity & Newborn',
    specialties: ['Maternity & Newborn', 'Portraits & Headshots'],
    experienceLevel: 'beginner',
    experienceYears: 2,
    rating: 4.94,
    reviewCount: 26,
    dayRate: 35000,
    halfDayRate: 20000,
    availableNow: true,
    nextAvailableDate: '2026-09-23',
    clientRoster: ['Mothercare India', 'FirstCry Premium', 'Private Families', 'Vogue Living Feature'],
    bio: 'Gentle, comforting maternity and newborn lifestyle photography. Ananya creates serene, safe environments capturing genuine family warmth, baby details, and joyful maternal glow in natural home light.',
    awards: ['BabyCenter India Emerging Family Photographer 2025'],
    equipment: ['Sony A7 IV', 'Sony FE 35mm f/1.4 GM', 'Sony FE 85mm f/1.8', 'Diffused Softbox Kit'],
    cameraFormat: 'Sony Full Frame 33MP',
    turnaroundDays: 3,
    assistantIncluded: true,
    portfolio: [
      {
        id: 'aj-1',
        title: 'Morning Window Maternity Radiance',
        clientOrSeries: 'Motherhood Serenity Series',
        category: 'Maternity & Newborn',
        imageUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=1000&q=85',
        aspectRatio: '4:5',
        year: '2026',
        location: 'Bandra West, Mumbai',
        techSpecs: 'Sony A7 IV • 35mm f/1.4 GM • 1/200s at f/2.0 • ISO 100',
        story: 'Soft white linen sheer curtains diffusing warm morning sun around expectant mother.'
      }
    ]
  },
  {
    id: 'sameer-ali',
    name: 'Sameer Ali',
    location: 'New Delhi & NCR',
    baseCity: 'New Delhi',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    heroImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=85',
    primaryCategory: 'Events & Concerts',
    specialties: ['Events & Concerts', 'Portraits & Headshots'],
    experienceLevel: 'beginner',
    experienceYears: 3,
    rating: 4.93,
    reviewCount: 29,
    dayRate: 42000,
    halfDayRate: 25000,
    availableNow: true,
    nextAvailableDate: '2026-09-23',
    clientRoster: ['NH7 Weekender', 'Sunburn Arena', 'India Design ID', 'Zomaland Cultural Fest'],
    bio: 'Capturing dynamic energy and high-adrenaline stage atmosphere for live concerts, brand activations, and cultural festivals across Delhi NCR and beyond.',
    awards: ['Rolling Stone India Live Gig Lens Winner 2025'],
    equipment: ['Nikon Z8', 'Nikkor Z 70-200mm f/2.8 VR S', 'Nikkor Z 24-70mm f/2.8 S'],
    cameraFormat: 'Nikon 45.7MP High Speed Stills',
    turnaroundDays: 2,
    assistantIncluded: false,
    portfolio: [
      {
        id: 'sa-1',
        title: 'Festival Stage Laser Symphony',
        clientOrSeries: 'NH7 Weekender Main Stage Feature',
        category: 'Events & Concerts',
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=85',
        aspectRatio: '4:5',
        year: '2026',
        location: 'Jawaharlal Nehru Stadium, New Delhi',
        techSpecs: 'Nikon Z8 • 70-200mm f/2.8 • 1/800s at f/2.8 • ISO 1600',
        story: 'Dramatic neon laser beams piercing concert smoke over celebrating festival crowd.'
      }
    ]
  }
];

export const INITIAL_BOOKINGS: BookingRequest[] = [
  {
    id: 'CS-2026-IND-089',
    photographerId: 'darshan-mehta',
    photographerName: 'Darshan Mehta',
    photographerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    campaignTitle: 'Rann of Kutch & Adalaj Vav Heritage Monograph',
    clientBrand: 'Torani & Gujarat Tourism Cultural Board',
    artDirectorName: 'Parthiv Trivedi',
    artDirectorEmail: 'p.trivedi@torani.in',
    shootDate: '2026-10-02',
    callTime: '05:30 AM IST (Sunrise over Salt Flats)',
    locationName: 'White Desert Dhordo & Adalaj Stepwell',
    locationAddress: 'Dhordo Tent City, Great Rann of Kutch, Gujarat 370510',
    durationType: 'two-day',
    usageRights: 'commercial-standard',
    selectedAddOns: ['medium-format', 'location-scout'],
    dayRate: 95000,
    durationCost: 180500,
    usageCost: 42750,
    addOnsCost: 28000,
    productionFee: 5000,
    totalCost: 256250,
    status: 'confirmed',
    createdAt: '2026-09-19',
    notes: 'Permissions secured from Gujarat Tourism and ASI for tripod and medium format setup at Adalaj Stepwell. Sunrise session at White Rann Dhordo for traditional bandhani and mirrorwork lehenga silhouettes.',
    shotListOverview: 'Shot 01: Sunrise glow on crystalline white salt flats with crimson bandhani dupatta. Shot 02-05: Solanki carved sandstone colonnades at Adalaj Vav. Shot 06-10: Master artisan Rogan art painting demonstration in Nirona.'
  },
  {
    id: 'CS-2026-IND-094',
    photographerId: 'rohan-varma',
    photographerName: 'Rohan Varma',
    photographerAvatar: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?auto=format&fit=crop&w=300&q=80',
    campaignTitle: 'Sabyasachi Heritage Royal Bridal Capsule 2026',
    clientBrand: 'Sabyasachi Couture & Vogue India',
    artDirectorName: 'Rhea Singhania',
    artDirectorEmail: 'r.singhania@sabyasachi-press.in',
    shootDate: '2026-09-28',
    callTime: '05:45 AM IST (Dawn Sunrise Call)',
    locationName: 'City Palace & Samode Haveli Courtyards',
    locationAddress: 'Jalebi Chowk, City Palace Complex, Jaipur, Rajasthan 302002',
    durationType: 'full-day',
    usageRights: 'commercial-global',
    selectedAddOns: ['digitech-assistant', 'medium-format', 'retouching-express'],
    dayRate: 140000,
    durationCost: 140000,
    usageCost: 105000,
    addOnsCost: 44000,
    productionFee: 5000,
    totalCost: 294000,
    status: 'confirmed',
    createdAt: '2026-09-18',
    notes: 'Rajasthan Tourism & City Palace Trust permissions granted for tripod and lighting generator setup at 05:30 AM. 4 bridal lehenga changes on location; hair & makeup station staged inside Badal Mahal guest suites.',
    shotListOverview: 'Shot 01: Dawn light through peacock arch with Banarasi silk drape. Shot 02: Polki necklace close-up in marble colonnade. Shot 03-08: Samode fresco mirror hall portraits with soft continuous tungsten fill.'
  }
];

// Helpers for registered dynamic photographers
export function getStoredRegisteredPhotographers(): Photographer[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('mtshoots_registered_photographers') : null;
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRegisteredPhotographer(photographer: Photographer): void {
  try {
    if (typeof window === 'undefined') return;
    const existing = getStoredRegisteredPhotographers();
    const updated = [photographer, ...existing.filter(p => p.id !== photographer.id)];
    localStorage.setItem('mtshoots_registered_photographers', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('photographers-updated'));

    // Asynchronously synchronize with Supabase PostgreSQL database
    import('../lib/supabase').then(mod => {
      if (mod.savePhotographerToSupabase) {
        mod.savePhotographerToSupabase(photographer).catch(e => {
          console.warn('Background Supabase photographer sync:', e);
        });
      }
    }).catch(() => {});
  } catch (err) {
    console.error('Failed to save photographer to storage:', err);
  }
}

export function getAllPhotographers(): Photographer[] {
  const registered = getStoredRegisteredPhotographers();
  return [...registered, ...INITIAL_PHOTOGRAPHERS];
}
