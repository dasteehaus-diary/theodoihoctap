// ========================================================
// DAS TEEHAUS — APP.JS (TEA BAG SELECTION + BREWING)
// ========================================================

// --- Safe Fallbacks for CDNs (Lucide, Chart.js) ---
if (typeof window.lucide === 'undefined') {
  window.lucide = {
    createIcons: function() { console.warn("Lucide CDN not loaded. Icons skipped."); }
  };
}
if (typeof window.Chart === 'undefined') {
  window.Chart = function() {
    console.warn("Chart.js CDN not loaded. Charts skipped.");
    return { destroy: function(){} };
  };
}

const DB_KEY = 'lerntagebuch_data';

// --- DEFAULT DATA ---
const DEFAULT_SUBJECTS = [
  { id: 'sub-1', name: 'Đức - Nghe (Hören)', color: '#ffb3ba' },
  { id: 'sub-2', name: 'Đức - Nói (Sprechen)', color: '#baffc9' },
  { id: 'sub-3', name: 'Đức - Đọc & Viết (Lesen/Schreiben)', color: '#bae1ff' },
  { id: 'sub-4', name: 'Đức - Ngữ pháp (Grammatik)', color: '#e8d7ff' },
  { id: 'sub-5', name: 'Đức - Từ vựng (Wortschatz)', color: '#ffdfba' }
];

const GERMAN_QUOTES = [
  { quote: '"Lernen ist wie Rudern gegen den Strom."', author: 'Benjamin Britten', trans: 'Học tập giống như chèo thuyền ngược dòng.' },
  { quote: '"Aller Anfang ist schwer."', author: 'Tục ngữ Đức', trans: 'Mọi sự khởi đầu đều gian nan.' },
  { quote: '"Übung macht den Meister."', author: 'Tục ngữ Đức', trans: 'Luyện tập tạo nên bậc thầy.' },
  { quote: '"Wer sich heute freut, lernt morgen besser."', author: 'Tục ngữ Đức', trans: 'Ai hôm nay vui vẻ, ngày mai học tốt hơn.' },
  { quote: '"Die Kunst des Ausruhens ist ein Teil der Kunst des Arbeitens."', author: 'J. Steinbeck', trans: 'Nghệ thuật nghỉ ngơi là một phần của nghệ thuật làm việc.' }
];

// ===== 8 TEA BAG TYPES =====
// steamBottom = khoảng cách từ đáy brewing-stage (340px) đến miệng ly
// = 340 - (25 + wCy% × 290) — 25px là padding top của container trong stage
const TEA_BAGS = [
  { id: 'tb-1', name: 'Kamillentee', nameVi: 'Trà hoa cúc', emoji: '🌼', minutes: 10, points: 1, bagColor: '#f5e6a3', bagBorder: '#d4c47a', liquidColor: '#f0dfa0', pattern: 'chamomile', cupType: 'green', cupImage: 'images/cup_chamomile_icon.png', waterImage: 'images/cup_chamomile_water.jpg', steamBottom: 235, steamWidth: 140 },
  { id: 'tb-2', name: 'Grüner Tee', nameVi: 'Trà xanh', emoji: '🍃', minutes: 15, points: 2, bagColor: '#a8c48a', bagBorder: '#7a9a5c', liquidColor: '#b3cfa7', pattern: 'bamboo', cupType: 'green', cupImage: 'images/cup_green_icon.png', waterImage: 'images/cup_green_water.jpg', steamBottom: 265, steamWidth: 120 },
  { id: 'tb-3', name: 'Schwarzer Tee', nameVi: 'Trà đen', emoji: '🫖', minutes: 25, points: 3, bagColor: '#b08968', bagBorder: '#7a5c3e', liquidColor: '#8a4a21', pattern: 'lattice', cupType: 'black', cupImage: 'images/cup_black_icon.png', waterImage: 'images/cup_black_water.jpg', steamBottom: 262, steamWidth: 130 },
  { id: 'tb-4', name: 'Jasmintee', nameVi: 'Trà hoa nhài', emoji: '🌸', minutes: 30, points: 5, bagColor: '#d4c8e8', bagBorder: '#a89cc0', liquidColor: '#e8d5c4', pattern: 'jasmine', cupType: 'black', cupImage: 'images/cup_jasmine_icon.png', waterImage: 'images/cup_jasmine_water.jpg', steamBottom: 260, steamWidth: 118 },
  { id: 'tb-5', name: 'Rosentee', nameVi: 'Trà hoa hồng', emoji: '🌹', minutes: 45, points: 8, bagColor: '#e8a7b5', bagBorder: '#c27a8a', liquidColor: '#e8a0b0', pattern: 'rose', cupType: 'rose', cupImage: 'images/cup_rose_icon.png', waterImage: 'images/cup_rose_water.jpg', steamBottom: 220, steamWidth: 155 },
  { id: 'tb-6', name: 'Oolong-Tee', nameVi: 'Trà Ô Long', emoji: '🍵', minutes: 60, points: 12, bagColor: '#c4915e', bagBorder: '#8e6530', liquidColor: '#b87333', pattern: 'waves', cupType: 'rose', cupImage: 'images/cup_oolong_icon.png', waterImage: 'images/cup_oolong_water.jpg', steamBottom: 248, steamWidth: 105 },
  { id: 'tb-7', name: 'Chai-Tee', nameVi: 'Trà Chai', emoji: '🧋', minutes: 90, points: 18, bagColor: '#d4805a', bagBorder: '#a05830', liquidColor: '#c06a35', pattern: 'mandala', cupType: 'royal', cupImage: 'images/cup_chai_icon.png', waterImage: 'images/cup_chai_water.jpg', steamBottom: 232, steamWidth: 145 },
  { id: 'tb-8', name: 'Königlicher Milchtee', nameVi: 'Trà sữa hoàng gia', emoji: '👑', minutes: 120, points: 25, bagColor: '#4a6a90', bagBorder: '#2b4570', liquidColor: '#dfcbb5', pattern: 'royal', cupType: 'royal', cupImage: 'images/cup_royal_icon.png', waterImage: 'images/cup_royal_water.jpg', steamBottom: 262, steamWidth: 125 }
];


// Cup image mapping for dashboard cabinet (one per category)
const CUP_TYPE_IMAGES = {
  green: 'images/cup_green_icon.png',
  black: 'images/cup_black_icon.png',
  rose: 'images/cup_rose_icon.png',
  royal: 'images/cup_royal_icon.png'
};

// ===== UNIQUE CUP DESIGNS PER TEA TYPE =====
// wCx/wCy = center of tea surface ellipse (in viewBox 0-100 units)
// wRx/wRy = radii of tea surface ellipse
// NOTE: wCy must be INSIDE the cup opening (below rim line visible in image)
const CUP_DESIGNS = {
  chamomile: { wCx: 46, wCy: 41, wRx: 29, wRy: 7  },  // wide shallow cup
  bamboo:    { wCx: 50, wCy: 24, wRx: 27, wRy: 7  },  // tall cylinder
  lattice:   { wCx: 46, wCy: 40, wRx: 30, wRy: 8  },  // wide Delft cup
  jasmine:   { wCx: 44, wCy: 43, wRx: 25, wRy: 6  },  // medium tall round
  rose:      { wCx: 45, wCy: 41, wRx: 28, wRy: 7  },  // medium round
  waves:     { wCx: 46, wCy: 42, wRx: 32, wRy: 8  },  // wide bowl
  mandala:   { wCx: 46, wCy: 41, wRx: 28, wRy: 7  },  // medium round
  royal:     { wCx: 45, wCy: 41, wRx: 28, wRy: 7  }   // wide royal cup
};

// Cup wall decorative pattern per tea type
function getCupWallPattern(pattern, d) {
  switch(pattern) {
    case 'chamomile': return (
      '<circle cx="72" cy="148" r="6" fill="' + d.a1 + '" opacity="0.5"/><circle cx="72" cy="148" r="2.5" fill="white" opacity="0.4"/>' +
      '<circle cx="248" cy="148" r="6" fill="' + d.a1 + '" opacity="0.5"/><circle cx="248" cy="148" r="2.5" fill="white" opacity="0.4"/>' +
      '<circle cx="100" cy="218" r="4" fill="' + d.a1 + '" opacity="0.4"/><circle cx="220" cy="218" r="4" fill="' + d.a1 + '" opacity="0.4"/>' +
      '<circle cx="60" cy="175" r="3" fill="' + d.a1 + '" opacity="0.35"/><circle cx="260" cy="175" r="3" fill="' + d.a1 + '" opacity="0.35"/>'
    );
    case 'bamboo': return (
      '<line x1="68" y1="130" x2="68" y2="200" stroke="' + d.a2 + '" stroke-width="2" opacity="0.3"/>' +
      '<line x1="252" y1="130" x2="252" y2="200" stroke="' + d.a2 + '" stroke-width="2" opacity="0.3"/>' +
      '<path d="M63,155 Q68,148 73,155" fill="' + d.a1 + '" opacity="0.35"/><path d="M63,170 Q68,163 73,170" fill="' + d.a1 + '" opacity="0.3"/>' +
      '<path d="M247,155 Q252,148 257,155" fill="' + d.a1 + '" opacity="0.35"/><path d="M247,170 Q252,163 257,170" fill="' + d.a1 + '" opacity="0.3"/>'
    );
    case 'lattice': return (
      '<path d="M60,145 Q85,135 70,165" fill="none" stroke="' + d.a1 + '" stroke-width="2" opacity="0.35"/>' +
      '<circle cx="75" cy="150" r="4" fill="none" stroke="' + d.a1 + '" stroke-width="1.5" opacity="0.3"/>' +
      '<path d="M260,145 Q235,135 250,165" fill="none" stroke="' + d.a1 + '" stroke-width="2" opacity="0.35"/>' +
      '<circle cx="245" cy="150" r="4" fill="none" stroke="' + d.a1 + '" stroke-width="1.5" opacity="0.3"/>' +
      '<circle cx="100" cy="220" r="2.5" fill="' + d.a1 + '" opacity="0.25"/><circle cx="220" cy="220" r="2.5" fill="' + d.a1 + '" opacity="0.25"/>'
    );
    case 'jasmine': return (
      '<circle cx="70" cy="155" r="3" fill="white" opacity="0.5"/><circle cx="65" cy="148" r="2.5" fill="white" opacity="0.4"/>' +
      '<circle cx="75" cy="148" r="2.5" fill="white" opacity="0.4"/><circle cx="70" cy="162" r="2.5" fill="white" opacity="0.4"/>' +
      '<circle cx="250" cy="155" r="3" fill="white" opacity="0.5"/><circle cx="245" cy="148" r="2.5" fill="white" opacity="0.4"/>' +
      '<circle cx="255" cy="148" r="2.5" fill="white" opacity="0.4"/><circle cx="250" cy="162" r="2.5" fill="white" opacity="0.4"/>' +
      '<circle cx="90" cy="215" r="2" fill="' + d.a1 + '" opacity="0.3"/><circle cx="230" cy="215" r="2" fill="' + d.a1 + '" opacity="0.3"/>'
    );
    case 'rose': return (
      '<path d="M70,150 C72,146 76,150 73,153 C77,155 73,158 70,155 C67,158 63,155 67,152 C63,149 67,146 70,150Z" fill="' + d.a2 + '" opacity="0.45"/>' +
      '<path d="M250,150 C252,146 256,150 253,153 C257,155 253,158 250,155 C247,158 243,155 247,152 C243,149 247,146 250,150Z" fill="' + d.a2 + '" opacity="0.45"/>' +
      '<circle cx="85" cy="210" r="3" fill="' + d.a1 + '" opacity="0.3"/><circle cx="235" cy="210" r="3" fill="' + d.a1 + '" opacity="0.3"/>'
    );
    case 'waves': return (
      '<path d="M55,148 Q65,140 75,148 Q85,140 90,148" fill="none" stroke="' + d.a2 + '" stroke-width="1.8" opacity="0.35"/>' +
      '<path d="M55,158 Q65,150 75,158 Q85,150 90,158" fill="none" stroke="' + d.a2 + '" stroke-width="1.5" opacity="0.3"/>' +
      '<path d="M230,148 Q240,140 250,148 Q260,140 265,148" fill="none" stroke="' + d.a2 + '" stroke-width="1.8" opacity="0.35"/>' +
      '<path d="M230,158 Q240,150 250,158 Q260,150 265,158" fill="none" stroke="' + d.a2 + '" stroke-width="1.5" opacity="0.3"/>'
    );
    case 'mandala': return (
      '<circle cx="70" cy="155" r="3" fill="' + d.a2 + '" opacity="0.4"/><circle cx="70" cy="155" r="7" fill="none" stroke="' + d.a2 + '" stroke-width="1" opacity="0.3"/>' +
      '<circle cx="250" cy="155" r="3" fill="' + d.a2 + '" opacity="0.4"/><circle cx="250" cy="155" r="7" fill="none" stroke="' + d.a2 + '" stroke-width="1" opacity="0.3"/>' +
      '<circle cx="90" cy="215" r="2" fill="' + d.a1 + '" opacity="0.3"/><circle cx="230" cy="215" r="2" fill="' + d.a1 + '" opacity="0.3"/>'
    );
    case 'royal': return (
      '<path d="M64,155 L67,145 L70,150 L73,145 L76,155 Z" fill="' + d.a1 + '" opacity="0.5"/><circle cx="70" cy="148" r="1.5" fill="' + d.a1 + '" opacity="0.4"/>' +
      '<path d="M244,155 L247,145 L250,150 L253,145 L256,155 Z" fill="' + d.a1 + '" opacity="0.5"/><circle cx="250" cy="148" r="1.5" fill="' + d.a1 + '" opacity="0.4"/>' +
      '<circle cx="85" cy="135" r="2" fill="' + d.a1 + '" opacity="0.3"/><circle cx="235" cy="135" r="2" fill="' + d.a1 + '" opacity="0.3"/>' +
      '<circle cx="100" cy="215" r="2" fill="' + d.a1 + '" opacity="0.25"/><circle cx="220" cy="215" r="2" fill="' + d.a1 + '" opacity="0.25"/>'
    );
    default: return '';
  }
}

const BOUTIQUE_SEALS = [
  { id: 'seal-default', name: 'Hoa Hồng Cổ Điển', color: '#b87b80', price: 0, insignia: 'rose' },
  { id: 'seal-royal', name: 'Vương Miện Hoàng Gia', color: '#6a3b66', price: 75, insignia: 'crown' },
  { id: 'seal-moon', name: 'Trăng Khuyết Dạ Thảo', color: '#2b3a4a', price: 100, insignia: 'moon' },
  { id: 'seal-emerald', name: 'Lá Nguyệt Quế', color: '#4a6547', price: 125, insignia: 'leaf' },
  { id: 'seal-butterfly', name: 'Hồ Điệp Tuyết Hoa', color: '#8fa89b', price: 150, insignia: 'butterfly' },
  { id: 'seal-tulip', name: 'Tulip Kiêu Kỳ', color: '#d88c9a', price: 175, insignia: 'tulip' },
  { id: 'seal-gold', name: 'Mặt Trời Cổ Đại', color: '#c29647', price: 200, insignia: 'sun' },
  { id: 'seal-bee', name: 'Ong Mật Hoàng Gia', color: '#8e5a32', price: 200, insignia: 'bee' },
  { id: 'seal-mushroom', name: 'Nấm Rừng Cổ Tích', color: '#b07d62', price: 225, insignia: 'mushroom' },
  { id: 'seal-lily-valley', name: 'Linh Lan Chiêu Dương', color: '#588157', price: 250, insignia: 'lily_valley' }
];

const BOUTIQUE_MUSIC = [
  { id: 'paddington', name: 'Paddington in London', src: 'sounds/paddington.mp3', price: 0 },
  { id: 'dl', name: 'Focus Study Music', src: 'sounds/dl.mp3', price: 0 },
  { id: 'fantasy', name: 'Fantasy Playlist', src: 'sounds/fantasy.mp3', price: 0 },
  { id: 'frieren', name: 'Frieren - Zoltraak', src: 'sounds/frieren.mp3', price: 75 },
  { id: 'hogwarts', name: 'Studying at Hogwarts', src: 'sounds/hogwarts.mp3', price: 125 },
  { id: 'kpop_nyc', name: 'New York K-Pop Study', src: 'sounds/kpop.mp3', price: 200 },
  { id: 'shamisen', name: 'Relaxing Shamisen Study', src: 'sounds/shamisen.mp3', price: 150 },
  { id: 'morning_classical', name: 'Morning Classical Ensemble', src: 'sounds/classical.mp3', price: 175 },
  { id: 'city_pop', name: 'Neon Bar Nights (City Pop)', src: 'sounds/citypop.mp3', price: 250 },
  { id: 'dreamy_summer', name: 'A Playlist for Dreamy Summer Days', src: 'sounds/dreamy_summer.mp3', price: 200 },
  { id: 'laufey_playlist', name: 'The Laufey Playlist ♬', src: 'sounds/laufey.mp3', price: 225 },
  { id: 'korean_playlist', name: '무슨 맛 먹을래? (Korean Playlist)', src: 'sounds/korean_playlist.mp3', price: 175 },
  { id: 'dl1_focus', name: 'Deep Focus - Track 1', src: 'sounds/dl_1.mp3', price: 100 },
  { id: 'dl2_focus', name: 'Deep Focus - Track 2', src: 'sounds/dl_2.mp3', price: 100 },
  { id: 'forest-moss-ambient', name: 'Rừng Thông: Mưa Rơi & Gió Rì Rào', src: 'https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg', price: 9999 },
  { id: 'kaiserin-rose-ambient', name: 'Đóa Hồng: Dương Cầm Mưa Trên Hiên Gỗ', src: 'https://actions.google.com/sounds/v1/music/classical_industrial_canyon.ogg', price: 9999 },
  { id: 'sea-glass-ambient', name: 'Thủy Tinh Biển: Sóng Vỗ Rì Rào', src: 'https://actions.google.com/sounds/v1/ambiences/ocean_waves.ogg', price: 9999 },
  { id: 'italian-summer-ambient', name: 'Mùa Hè Ý: Sóng Biển Lapping & Vespa Amalfi', src: 'https://actions.google.com/sounds/v1/water/sea_waves_lapping.ogg', price: 9999 },
  { id: 'kalligraphie-ambient', name: 'Mưa Anh Đào: Sáo Thiền Shakuhachi', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', price: 9999 }
];

const BOUTIQUE_DRINKS = [
  { id: 'drink-espresso', name: 'Kaffee Espresso', nameVi: 'Espresso Đậm Đà', emoji: '☕', minutes: 20, points: 4, price: 100, bagColor: '#4e3629', bagBorder: '#3c2f2f', liquidColor: '#3c2f2f', pattern: 'coffee_bean', cupType: 'black', cupImage: 'images/cup_latte.png', steamBottom: 240, steamWidth: 120 },
  { id: 'drink-flat-white', name: 'Kaffee Flat White', nameVi: 'Flat White Cổ Điển', emoji: '☕', minutes: 25, points: 5, price: 125, bagColor: '#e6ccb2', bagBorder: '#b08968', liquidColor: '#ddb892', pattern: 'flat_white', cupType: 'black', cupImage: 'images/cup_flat_white.png', steamBottom: 240, steamWidth: 120 },
  { id: 'drink-cacao', name: 'Heiße Schokolade', nameVi: 'Cacao Dạ Thảo', emoji: '🍫', minutes: 30, points: 5, price: 125, bagColor: '#7f4f24', bagBorder: '#5c3d2e', liquidColor: '#5c3d2e', pattern: 'cacao_pod', cupType: 'black', cupImage: 'images/cup_cauldron_cacao.png', steamBottom: 240, steamWidth: 120 },
  { id: 'drink-cappuccino', name: 'Kaffee Cappuccino', nameVi: 'Cappuccino Bồng Bềnh', emoji: '☕', minutes: 40, points: 7, price: 150, bagColor: '#d6ccc2', bagBorder: '#b5835a', liquidColor: '#b5835a', pattern: 'latte_art', cupType: 'royal', cupImage: 'images/cup_mocha.png', steamBottom: 240, steamWidth: 120 },
  { id: 'drink-cat-matcha', name: 'Katzen-Matcha-Tee', nameVi: 'Trà Matcha Mèo Đen', emoji: '🐈', minutes: 45, points: 8, price: 175, bagColor: '#ffb3c1', bagBorder: '#ff758f', liquidColor: '#8cb369', pattern: 'cat_paw', cupType: 'green', cupImage: 'images/cup_cat_matcha.png', steamBottom: 240, steamWidth: 120 },
  { id: 'drink-matcha', name: 'Matcha Latte', nameVi: 'Matcha Latte Vân Đá', emoji: '🍵', minutes: 50, points: 9, price: 175, bagColor: '#a3b18a', bagBorder: '#8cb369', liquidColor: '#8cb369', pattern: 'tea_whisk', cupType: 'green', cupImage: 'images/cup_matcha_latte.png', steamBottom: 240, steamWidth: 120 },
  { id: 'drink-orange-cinnamon', name: 'Orangen-Zimt-Tee', nameVi: 'Trà Cam Quế An Yên', emoji: '🍊', minutes: 60, points: 12, price: 200, bagColor: '#f4a261', bagBorder: '#e76f51', liquidColor: '#f4a261', pattern: 'orange_cinnamon', cupType: 'rose', cupImage: 'images/cup_orange_cinnamon.png', steamBottom: 240, steamWidth: 120 },
  { id: 'drink-black-floral', name: 'Klassischer Blumentee', nameVi: 'Trà Hoa Đen Cổ Điển', emoji: '🌸', minutes: 60, points: 12, price: 225, bagColor: '#2e2825', bagBorder: '#1c1816', liquidColor: '#8a4a21', pattern: 'blossom', cupType: 'black', cupImage: 'images/cup_black_floral.png', steamBottom: 240, steamWidth: 120 },
  { id: 'drink-royal-blueberry', name: 'Blaubeer-Tee', nameVi: 'Trà Việt Quất Hoàng Gia', emoji: '🫐', minutes: 75, points: 15, price: 250, bagColor: '#457b9d', bagBorder: '#1d3557', liquidColor: '#457b9d', pattern: 'blue_rose', cupType: 'royal', cupImage: 'images/cup_royal_blueberry.png', steamBottom: 240, steamWidth: 120 },
  
  /* --- NEW USER CUPS INTEGRATION --- */
  { id: 'drink-wildflower-blue', name: 'Wildblumen-Teetasse', nameVi: 'Trà Hoa Dại Bắc Âu', emoji: '☕', minutes: 35, points: 6, price: 140, bagColor: '#a2b9bc', bagBorder: '#87a96b', liquidColor: '#87a96b', pattern: 'blossom', cupType: 'default', cupImage: 'images/cup_wildflower_blue.png', steamBottom: 240, steamWidth: 120 },
  { id: 'drink-vintage-spoon', name: 'Löffel-Kaffee', nameVi: 'Cà Phê Muỗng Bạc Cổ Điển', emoji: '🥄', minutes: 45, points: 8, price: 160, bagColor: '#b08968', bagBorder: '#4e3629', liquidColor: '#4e3629', pattern: 'coffee_bean', cupType: 'default', cupImage: 'images/cup_vintage_spoon.png', steamBottom: 240, steamWidth: 120 },
  { id: 'drink-scallop-orange', name: 'Kürbis-Rahm-Teetasse', nameVi: 'Trà Bí Ngô Kem Điển Nhã', emoji: '🎃', minutes: 90, points: 18, price: 300, bagColor: '#f4a261', bagBorder: '#f26419', liquidColor: '#f4a261', pattern: 'pumpkin', cupType: 'default', cupImage: 'images/cup_scallop_orange.png', steamBottom: 240, steamWidth: 120 },
  { id: 'drink-joe-mug', name: 'Joe-Milchkakao', nameVi: 'Ca Cao Sữa Nóng Joe', emoji: '🥛', minutes: 15, points: 3, price: 80, bagColor: '#ff6b6b', bagBorder: '#5c3d2e', liquidColor: '#5c3d2e', pattern: 'cacao_pod', cupType: 'default', cupImage: 'images/cup_joe_mug.png', steamBottom: 240, steamWidth: 120 },
  { id: 'drink-floral-cream', name: 'Kamillentee-Vintage', nameVi: 'Trà Cúc La Mã Cổ Kính', emoji: '🌼', minutes: 55, points: 10, price: 180, bagColor: '#e9d8a6', bagBorder: '#ee9b00', liquidColor: '#ee9b00', pattern: 'chamomile', cupType: 'default', cupImage: 'images/cup_floral_cream.png', steamBottom: 240, steamWidth: 120 },
  { id: 'drink-wildflower-yellow', name: 'Wildblumen-Kaffee', nameVi: 'Cà Phê Đen Hoa Dã Quỳ', emoji: '☕', minutes: 75, points: 15, price: 250, bagColor: '#3d3d3d', bagBorder: '#2d2d2d', liquidColor: '#2d2d2d', pattern: 'coffee_bean', cupType: 'default', cupImage: 'images/cup_wildflower_yellow.png', steamBottom: 240, steamWidth: 120 },
  { id: 'drink-rosemary-pink', name: 'Kirsch-Rosmarin-Tee', nameVi: 'Trà Hương Thảo Anh Đào', emoji: '🌸', minutes: 60, points: 12, price: 220, bagColor: '#ffb3c1', bagBorder: '#ff758f', liquidColor: '#ff758f', pattern: 'blossom', cupType: 'default', cupImage: 'images/cup_rosemary_pink.png', steamBottom: 240, steamWidth: 120 },
  { id: 'drink-blossom-white', name: 'Apfelblüten-Tee', nameVi: 'Trà Hoa Táo Thuần Khiết', emoji: '🍎', minutes: 30, points: 5, price: 120, bagColor: '#eae2d6', bagBorder: '#a3b18a', liquidColor: '#a3b18a', pattern: 'blossom', cupType: 'default', cupImage: 'images/cup_blossom_white.png', steamBottom: 240, steamWidth: 120 }
];

const BOUTIQUE_COMBOS = [
  { id: 'combo-default-light', name: 'Mặc định - Gỗ Ấm & Be Sáng', price: 0, themeClass: 'light', skinClass: 'default', desc: 'Giao diện gỗ ấm cổ điển và nền be sáng tự nhiên ban đầu.' },
  { id: 'combo-lavender-birch', name: 'Gỗ Bạch Dương Oải Hương', price: 150, themeClass: 'lavender', skinClass: 'lilac-birch', desc: 'Đồng hoa oải hương nhạt lãng mạn' },
  { id: 'combo-forest-moss', name: 'Premium: Rừng Thông Xanh Nắng', price: 800, themeClass: 'forest-moss', skinClass: 'forest-moss', desc: 'Xanh rêu thông và hoa dại dã ngoại' },
  { id: 'combo-kaiserin-rose', name: 'Premium: Đóa Hồng Bắc Âu', price: 900, themeClass: 'kaiserin-rose', skinClass: 'kaiserin-rose', desc: 'Gió cát Bắc Âu ấm áp và cành hồng dại mộc mạc' },
  { id: 'combo-sea-glass', name: 'Premium: Thủy Tinh Biển Cả', price: 1000, themeClass: 'sea-glass', skinClass: 'sea-glass', desc: 'Kính mờ xanh ngọc bọt biển mát rượi' },
  { id: 'combo-italian-summer', name: 'Premium: Mùa Hè Nước Ý', price: 950, themeClass: 'italian-summer', skinClass: 'italian-summer', desc: 'Sọc đứng Sea Breeze mát mẻ, chanh vàng Citrus Zest trĩu quả, thẻ Card kem Gelato mờ và gốm sứ Majolica lãng mạn.' },
  { id: 'combo-kalligraphie', name: 'Premium: Mưa Anh Đào Kyoto', price: 850, themeClass: 'kalligraphie', skinClass: 'kalligraphie', desc: 'Bát trà Matcha Nhật Bản và cơn mưa hoa anh đào cố đô Kyoto thanh tịnh.' }
];

const BOUTIQUE_THEMES = [];
const BOUTIQUE_SKINS = [];

const BOUTIQUE_READING_ITEMS = [
  { id: 'decor-bookmark', name: 'Kẹp Sách Đồng Thau', price: 50, emoji: '🔖', description: 'Kẹp sách hoa văn lá phong cổ kính để lưu trang.' },
  { id: 'decor-candle', name: 'Đèn Cầy Sáp Ong', price: 75, emoji: '🕯️', description: 'Nến thơm thắp sáng ấm áp cho giá sách của chị.' },
  { id: 'decor-magnifier', name: 'Kính Lúp Cổ Điển', price: 100, emoji: '🔍', description: 'Kính lúp tay cầm gỗ đọc sách cổ xưa.' }
];

const BOUTIQUE_QUOTES = [
  { id: 'quote-philosophy', name: 'Triết Học Vĩ Nhân', price: 80, quotes: [
    { text: "Die Grenzen meiner Sprache bedeuten die Grenzen meiner Welt.", translation: "Giới hạn ngôn ngữ của tôi là giới hạn thế giới của tôi. (Wittgenstein)" },
    { text: "Wer zwei Sprachen spricht, ist zwei Menschen.", translation: "Người nói hai thứ tiếng bằng hai con người cộng lại. (Châm ngôn)" },
    { text: "Was mich nicht umbringt, macht mich stärker.", translation: "Cái gì không tiêu diệt được tôi sẽ làm tôi mạnh mẽ hơn. (Nietzsche)" },
    { text: "Auch aus Steinen, die einem in den Weg gelegt werden, kann man Schönes bauen.", translation: "Ngay cả từ những tảng đá cản đường, người ta vẫn xây nên những điều tuyệt đẹp. (Goethe)" },
    { text: "Sapere aude! Habe Mut, dich deines eigenen Verstandes zu bedienen!", translation: "Dám nghĩ dám làm! Hãy có dũng khí sử dụng trí tuệ của chính mình! (Kant)" }
  ]},
  { id: 'quote-perseverance', name: 'Kiên Trì Bền Bỉ', price: 150, quotes: [
    { text: "Es ist nicht genug zu wissen, man muss auch anwenden.", translation: "Biết thôi chưa đủ, ta phải áp dụng. (Goethe)" },
    { text: "Der Langsamste, der sein Ziel nicht aus den Augen verliert, geht noch immer geschwinder als jener, der ohne Ziel umherirrt.", translation: "Người chậm nhất không mất mục tiêu vẫn đi nhanh hơn kẻ đi không định hướng. (Lessing)" },
    { text: "Geduld ist ein bitteres Kraut, aber es bringt süße Früchte.", translation: "Kiên nhẫn là một cây thuốc đắng, nhưng mang lại trái ngọt quả ngon. (Châm ngôn)" },
    { text: "Erfolg ist eine Treppe, keine Tür.", translation: "Thành công là những bậc thang phải leo, không phải là một cánh cửa mở sẵn. (Châm ngôn)" },
    { text: "Kleine Schritte führen zum großen Erfolg.", translation: "Những bước đi nhỏ bé sẽ dẫn tới thành công to lớn. (Châm ngôn)" }
  ]},
  { id: 'quote-mindfulness', name: 'An Yên Tự Tại', price: 220, quotes: [
    { text: "In der Ruhe liegt die Kraft.", translation: "Sức mạnh nằm trong sự tĩnh lặng. (Châm ngôn)" },
    { text: "Ruhe bringt Gleichgewicht in dein Leben.", translation: "Sự bình yên mang lại sự cân bằng cho cuộc sống của bạn. (Châm ngôn)" },
    { text: "Die Kunst des Ausruhens ist ein Teil der Kunst des Arbeitens.", translation: "Nghệ thuật nghỉ ngơi là một phần của nghệ thuật làm việc. (John Lubbock)" },
    { text: "Manchmal ist das Schönste an der Arbeit die Pause.", translation: "Đôi khi điều tuyệt vời nhất của công việc chính là giờ nghỉ giải lao. (Châm ngôn)" },
    { text: "Gib jedem Tag die Chance, der schönste deines Lebens zu werden.", translation: "Hãy cho mỗi ngày cơ hội trở thành ngày đẹp nhất cuộc đời bạn. (Mark Twain)" }
  ]}
];

// ========================================================
//  INDEXEDDB MEDIA STORE FOR DIARY (AUDIO/IMAGE)
// ========================================================
const MEDIA_DB_NAME = 'TeeHausMediaDB';
const MEDIA_DB_VERSION = 2; // Nâng lên phiên bản 2 để hỗ trợ tủ sách
const MEDIA_STORE_NAME = 'media';
const BOOKS_STORE_NAME = 'books';

function initMediaDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(MEDIA_DB_NAME, MEDIA_DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(MEDIA_STORE_NAME)) {
        db.createObjectStore(MEDIA_STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(BOOKS_STORE_NAME)) {
        db.createObjectStore(BOOKS_STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

function saveBookFileToDB(bookId, fileData, fileType) {
  return initMediaDB().then(db => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(BOOKS_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(BOOKS_STORE_NAME);
      const request = store.put({ id: bookId, fileData, fileType });
      request.onsuccess = () => resolve();
      request.onerror = (e) => reject(e.target.error);
    });
  });
}

function getBookFileFromDB(bookId) {
  return initMediaDB().then(db => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(BOOKS_STORE_NAME, 'readonly');
      const store = transaction.objectStore(BOOKS_STORE_NAME);
      const request = store.get(bookId);
      request.onsuccess = (e) => resolve(e.target.result || null);
      request.onerror = (e) => reject(e.target.error);
    });
  });
}

function deleteBookFileFromDB(bookId) {
  return initMediaDB().then(db => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(BOOKS_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(BOOKS_STORE_NAME);
      const request = store.delete(bookId);
      request.onsuccess = () => resolve();
      request.onerror = (e) => reject(e.target.error);
    });
  });
}

function saveMediaToDB(diaryId, audioBase64, imageBase64) {
  return initMediaDB().then(db => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(MEDIA_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(MEDIA_STORE_NAME);
      const request = store.put({ id: diaryId, audioBase64, imageBase64 });
      request.onsuccess = () => resolve();
      request.onerror = (e) => reject(e.target.error);
    });
  });
}

function getMediaFromDB(diaryId) {
  return initMediaDB().then(db => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(MEDIA_STORE_NAME, 'readonly');
      const store = transaction.objectStore(MEDIA_STORE_NAME);
      const request = store.get(diaryId);
      request.onsuccess = (e) => resolve(e.target.result || { id: diaryId, audioBase64: null, imageBase64: null });
      request.onerror = (e) => reject(e.target.error);
    });
  });
}

function deleteMediaFromDB(diaryId) {
  return initMediaDB().then(db => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(MEDIA_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(MEDIA_STORE_NAME);
      const request = store.delete(diaryId);
      request.onsuccess = () => resolve();
      request.onerror = (e) => reject(e.target.error);
    });
  });
}

function clearAllMediaFromDB() {
  return initMediaDB().then(db => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(MEDIA_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(MEDIA_STORE_NAME);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = (e) => reject(e.target.error);
    });
  });
}

// ========================================================
//  CUSTOM VINTAGE DIALOG SYSTEM (PROMISE-BASED)
// ========================================================
function showCustomDialog({ title = 'Das TeeHaus', message = '', isConfirm = false }) {
  return new Promise((resolve) => {
    const backdrop = document.getElementById('custom-dialog-backdrop');
    const titleEl = document.getElementById('dialog-title');
    const msgEl = document.getElementById('dialog-message');
    const footerEl = document.getElementById('dialog-footer');

    titleEl.textContent = title;
    msgEl.innerHTML = message.replace(/\n/g, '<br>');
    footerEl.innerHTML = '';

    if (isConfirm) {
      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'btn btn-secondary';
      cancelBtn.textContent = 'Hủy bỏ';
      cancelBtn.onclick = () => {
        backdrop.classList.remove('show');
        setTimeout(() => backdrop.classList.add('hidden'), 300);
        resolve(false);
      };

      const confirmBtn = document.createElement('button');
      confirmBtn.className = 'btn btn-primary';
      confirmBtn.textContent = 'Đồng ý';
      confirmBtn.onclick = () => {
        backdrop.classList.remove('show');
        setTimeout(() => backdrop.classList.add('hidden'), 300);
        resolve(true);
      };

      footerEl.appendChild(cancelBtn);
      footerEl.appendChild(confirmBtn);
    } else {
      const okBtn = document.createElement('button');
      okBtn.className = 'btn btn-primary';
      okBtn.textContent = 'Đồng ý';
      okBtn.onclick = () => {
        backdrop.classList.remove('show');
        setTimeout(() => backdrop.classList.add('hidden'), 300);
        resolve(true);
      };
      footerEl.appendChild(okBtn);
    }

    backdrop.classList.remove('hidden');
    backdrop.offsetHeight; // force reflow
    backdrop.classList.add('show');

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  });
}

window.closeCustomDialog = function() {
  const backdrop = document.getElementById('custom-dialog-backdrop');
  if (backdrop) {
    backdrop.classList.remove('show');
    setTimeout(() => backdrop.classList.add('hidden'), 300);
  }
};

function customAlert(message, title = 'Das TeeHaus') {
  return showCustomDialog({ title, message, isConfirm: false });
}

function customConfirm(message, title = 'Xác nhận') {
  return showCustomDialog({ title, message, isConfirm: true });
}

// --- APP STATE ---
let appState = {
  settings: {
    theme: 'light',
    dailyGoalMinutes: 120,
    pomoWorkMinutes: 25,
    pomoShortBreakMinutes: 5,
    pomoLongBreakMinutes: 15,
    pomoCycleCount: 4,
    pomoAutostart: true,
    pomoMusicBehavior: 'continuous',
    pomoStrictness: 'mild'
  },
  subjects: DEFAULT_SUBJECTS,
  studySessions: [],
  diaries: [],
  todos: [],
  streak: { count: 0, lastActiveDate: null },
  teaPoints: 0,
  unlockedSeals: ['seal-default'],
  unlockedMusic: ['paddington', 'dl', 'fantasy'],
  unlockedDrinks: [],
  unlockedThemes: [],
  unlockedSkins: [],
  unlockedQuotes: [],
  selectedTheme: 'light',
  selectedSkin: 'default',
  dailyTeaCabinet: [],
  books: [],
  readingSessions: [],
  unlockedReadingItems: [],
  syncCode: null
};

// --- TIMER STATE ---
let timerInterval = null;
let timerMode = 'teabag'; // 'teabag' | 'stopwatch' | 'pomodoro'
let timerStatus = 'idle';  // 'idle' | 'running' | 'paused'
let selectedTeaBagId = null;
let timeRemaining = 0;
let stopwatchSeconds = 0;
let totalTimerDuration = 0;
let bubbleInterval = null;
let pomoStage = 'study'; // 'study' | 'short_break' | 'long_break'
let pomoCompletedCycles = 0;
let activeTaskId = null;

// --- AUDIO RECORDING ---
let mediaRecorder = null;
let audioChunks = [];
let recordStartTime = null;
let recordTimerInterval = null;
let recordedAudioBase64 = null;

// --- DIARY EDITOR STATE ---
let selectedMood = null;
let currentEditorTags = [];
let currentEditorVocabularies = [];
let currentEditorImageBase64 = null;
let selectedWaxSealId = 'seal-default';

// --- MUSIC STATE ---
let currentActiveMusicId = 'paddington';
let audioCtx = null;

// Tự động mở khóa AudioContext của trình duyệt ngay từ lần click/chạm đầu tiên
function initGlobalAudioContext() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
  } catch(e) {
    console.warn("Global AudioContext unlock failed:", e);
  }
}
document.addEventListener('click', initGlobalAudioContext, { once: true });
document.addEventListener('touchstart', initGlobalAudioContext, { once: true });

let activeAmbientNodes = {};
let synthMusicInterval = null;

// --- CHARTS ---
let weeklyBarChartInstance = null;
let subjectPieChartInstance = null;


// =============================================
//  WEB AUDIO API SYNTHESIZERS
// =============================================
//  HTML5 AUDIO PLAYBACK FOR AMBIENT MP3 MUSIC
// =============================================
let ambientAudioPlayer = null;

function playAmbientMusicFile(src) {
  if (ambientAudioPlayer) {
    ambientAudioPlayer.pause();
    ambientAudioPlayer = null;
  }
  ambientAudioPlayer = new Audio(src);
  ambientAudioPlayer.loop = true;
  ambientAudioPlayer.volume = 0.5;
  ambientAudioPlayer.play().catch(err => {
    console.error("Lỗi phát nhạc:", err);
    // Cảnh báo nếu chạy offline trực tiếp từ file://
    if (window.location.protocol === 'file:') {
      customAlert("Không thể phát nhạc MP3 trực tiếp từ tệp tin cục bộ (file://) do chính sách bảo mật CORS của trình duyệt. Chị vui lòng chạy ứng dụng qua Local Server hoặc dùng trình duyệt Firefox để thưởng thức nhạc nền đầy đủ nhé! (Các âm thanh tự nhiên trong Bộ trộn vẫn hoạt động bình thường)");
    }
  });
}

function stopAmbientMusicFile() {
  if (ambientAudioPlayer) {
    ambientAudioPlayer.pause();
    ambientAudioPlayer = null;
  }
}
function playSynthChime(){if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();const now=audioCtx.currentTime;[293.66,587.33,880.99,1174.66].forEach((f,i)=>{const gains=[.15,.08,.04,.01];const decays=[3.5,2.5,1.8,1];const o=audioCtx.createOscillator();const g=audioCtx.createGain();const fl=audioCtx.createBiquadFilter();o.type='sine';o.frequency.setValueAtTime(f,now);fl.type='lowpass';fl.frequency.setValueAtTime(1500,now);g.gain.setValueAtTime(0,now);g.gain.linearRampToValueAtTime(gains[i],now+.02);g.gain.exponentialRampToValueAtTime(.00001,now+decays[i]);o.connect(fl);fl.connect(g);g.connect(audioCtx.destination);o.start(now);o.stop(now+decays[i]+.1);});}

function playWindChime() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    
    // Frequencies of a pentatonic metal wind chime: C5, D5, E5, G5, A5, C6
    const freqs = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
    
    // Stagger the strikes of 5 tubes randomly to sound like a natural breeze chime
    for (let i = 0; i < 5; i++) {
      const freq = freqs[Math.floor(Math.random() * freqs.length)];
      const delay = Math.random() * 0.35; // strike start time scattered over 350ms
      const strikeTime = now + delay;
      const decay = 2.0 + Math.random() * 1.5; // chime ring decay (2 - 3.5 seconds)
      
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();
      
      osc.type = Math.random() > 0.4 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, strikeTime);
      
      // Add subtle vibrato (wind blowing chime)
      const lfo = audioCtx.createOscillator();
      const lfoGain = audioCtx.createGain();
      lfo.frequency.value = 5 + Math.random() * 3; // 5-8Hz vibrato
      lfoGain.gain.value = 2 + Math.random() * 2; // frequency deviation
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(400, strikeTime);
      
      gainNode.gain.setValueAtTime(0, strikeTime);
      gainNode.gain.linearRampToValueAtTime(0.06, strikeTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, strikeTime + decay);
      
      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      lfo.start(strikeTime);
      osc.start(strikeTime);
      
      lfo.stop(strikeTime + decay + 0.1);
      osc.stop(strikeTime + decay + 0.1);
    }
  } catch(e) {
    console.warn("Audio Context error", e);
  }
}

window.triggerCelebrationEffect = function() {
  const emojis = ['🍃', '🌸', '🌼', '🍁', '🍀', '🍂'];
  for (let i = 0; i < 35; i++) {
    const leaf = document.createElement('div');
    leaf.className = 'leaf-particle';
    leaf.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    
    // Vị trí và kích thước ngẫu nhiên
    leaf.style.left = Math.random() * 100 + 'vw';
    leaf.style.top = '-50px';
    leaf.style.fontSize = (16 + Math.random() * 18) + 'px';
    
    // Tốc độ và độ trễ ngẫu nhiên
    const duration = 3 + Math.random() * 4;
    const delay = Math.random() * 2;
    leaf.style.animationDuration = duration + 's';
    leaf.style.animationDelay = delay + 's';
    
    document.body.appendChild(leaf);
    
    // Dọn dẹp sau khi bay hết màn hình
    setTimeout(() => {
      leaf.remove();
    }, (duration + delay) * 1000);
  }
};

// =============================================
//  UTILITY FUNCTIONS
// =============================================
function saveState(){
  try {
    localStorage.setItem(DB_KEY,JSON.stringify(appState));
    if (appState.syncCode) {
      triggerCloudSyncUpload();
    }
    if (typeof triggerSupabaseUploadDebounced === 'function') {
      triggerSupabaseUploadDebounced();
    }
  } catch(e) {
    console.warn("localStorage is blocked or full. State not saved permanently.", e);
  }
}
function loadState(){
  let d = null;
  let hasBooksKey = false;
  try {
    d = localStorage.getItem(DB_KEY);
  } catch(e) {
    console.warn("localStorage is blocked. Using temporary in-memory state.", e);
  }
  if (d) {
    try {
      const p = JSON.parse(d);
      if (p && typeof p === 'object') {
        appState = {
          ...appState,
          ...p,
          settings: { ...appState.settings, ...(p.settings || {}) },
          streak: { ...appState.streak, ...(p.streak || {}) }
        };
        if (p.hasOwnProperty('books')) {
          hasBooksKey = true;
        }
      }
    } catch(e) {
      console.error('Error loading state', e);
    }
  }
  
  if (!Array.isArray(appState.subjects)) appState.subjects = DEFAULT_SUBJECTS;
  if (!Array.isArray(appState.studySessions)) appState.studySessions = [];
  if (!Array.isArray(appState.diaries)) appState.diaries = [];
  if (!Array.isArray(appState.todos)) appState.todos = [];
  if (typeof appState.streak !== 'object' || appState.streak === null) appState.streak = { count: 0, lastActiveDate: null };
  
  if (!Array.isArray(appState.unlockedSeals)) appState.unlockedSeals = ['seal-default'];
  if (!Array.isArray(appState.unlockedDrinks)) appState.unlockedDrinks = [];
  if (!Array.isArray(appState.unlockedThemes)) appState.unlockedThemes = ['theme-lavender'];
  if (!appState.unlockedThemes.includes('theme-lavender')) appState.unlockedThemes.push('theme-lavender');
  if (!Array.isArray(appState.unlockedSkins)) appState.unlockedSkins = ['skin-lilac-birch'];
  if (!appState.unlockedSkins.includes('skin-lilac-birch')) appState.unlockedSkins.push('skin-lilac-birch');
  if (!Array.isArray(appState.unlockedQuotes)) appState.unlockedQuotes = [];
  if (!appState.selectedTheme || appState.selectedTheme === 'light') {
    appState.selectedTheme = 'lavender';
    if (appState.settings) appState.settings.theme = 'lavender';
  }
  if (!appState.selectedSkin || appState.selectedSkin === 'default') {
    appState.selectedSkin = 'lilac-birch';
  }

  // Khởi tạo các mảng cho Góc Đọc Sách nếu chưa có hoặc dọn dẹp sách mẫu cũ
  if (!hasBooksKey || Array.isArray(appState.books)) {
    const defaultBookIds = ['book-banh-chung', 'book-faust', 'book-steppenwolf', 'book-grimms'];
    appState.books = (appState.books || []).filter(b => !defaultBookIds.includes(b.id));
  }
  localStorage.setItem('hasPreloadedBanhChungV2', 'true');

  if (!Array.isArray(appState.readingSessions)) appState.readingSessions = [];
  if (!Array.isArray(appState.unlockedReadingItems)) appState.unlockedReadingItems = [];
  
  if (Array.isArray(appState.unlockedMusic)) {
    const oldIds = ['sound-lofi','sound-rain','sound-waves','sound-harp','sound-piano','sound-musicbox'];
    appState.unlockedMusic = appState.unlockedMusic.filter(id => !oldIds.includes(id));
    ['paddington','dl','fantasy'].forEach(defId => {
      if (!appState.unlockedMusic.includes(defId)) appState.unlockedMusic.push(defId);
    });
    // Đồng bộ mở khóa nhạc ambient cho người dùng đã sở hữu combo premium tương ứng
    if (appState.unlockedSkins) {
      if (appState.unlockedSkins.includes('forest-moss') && !appState.unlockedMusic.includes('forest-moss-ambient')) appState.unlockedMusic.push('forest-moss-ambient');
      if (appState.unlockedSkins.includes('kaiserin-rose') && !appState.unlockedMusic.includes('kaiserin-rose-ambient')) appState.unlockedMusic.push('kaiserin-rose-ambient');
      if (appState.unlockedSkins.includes('sea-glass') && !appState.unlockedMusic.includes('sea-glass-ambient')) appState.unlockedMusic.push('sea-glass-ambient');
      if (appState.unlockedSkins.includes('italian-summer') && !appState.unlockedMusic.includes('italian-summer-ambient')) appState.unlockedMusic.push('italian-summer-ambient');
      if (appState.unlockedSkins.includes('kalligraphie') && !appState.unlockedMusic.includes('kalligraphie-ambient')) appState.unlockedMusic.push('kalligraphie-ambient');
    }
  } else {
    appState.unlockedMusic = ['paddington','dl','fantasy'];
  }
  
  if (typeof appState.teaPoints !== 'number') appState.teaPoints = 0;
  if (!Array.isArray(appState.dailyTeaCabinet)) appState.dailyTeaCabinet = [];
  
  // Reset dự phòng nếu dữ liệu cũ đang lưu trữ chủ đề lá phong đã xóa
  if (appState.selectedTheme === 'kyoto-maple') appState.selectedTheme = 'kalligraphie';
  if (appState.selectedSkin === 'kyoto-maple') appState.selectedSkin = 'kalligraphie';
  
  // Khóa lại chủ đề Mưa Anh Đào Kyoto (kalligraphie) đúng 1 lần duy nhất để đưa vào cửa hàng
  if (!appState.cleanedKalligraphie) {
    if (appState.unlockedSkins) {
      appState.unlockedSkins = appState.unlockedSkins.filter(s => s !== 'kalligraphie' && s !== 'skin-kalligraphie');
    }
    if (appState.unlockedThemes) {
      appState.unlockedThemes = appState.unlockedThemes.filter(t => t !== 'kalligraphie' && t !== 'theme-kalligraphie');
    }
    if (appState.selectedTheme === 'kalligraphie') appState.selectedTheme = 'lavender';
    if (appState.selectedSkin === 'kalligraphie' || appState.selectedSkin === 'skin-kalligraphie') appState.selectedSkin = 'lilac-birch';
    appState.cleanedKalligraphie = true;
  }
  
  // Data Migration: Map old subjects to tags in To-Dos and Study Sessions
  if (Array.isArray(appState.todos)) {
    let migrated = false;
    appState.todos.forEach(todo => {
      if (todo.subjectId && !todo.tag) {
        const sub = appState.subjects.find(s => s.id === todo.subjectId) || { name: 'Chung' };
        todo.tag = sub.name.replace(/#/g, '').trim();
        delete todo.subjectId;
        migrated = true;
      }
    });
    if (migrated) console.log("Migrated To-Do subjects to tags.");
  }
  if (Array.isArray(appState.studySessions)) {
    let migrated = false;
    appState.studySessions.forEach(session => {
      if (session.subjectId && !session.tag) {
        const sub = appState.subjects.find(s => s.id === session.subjectId) || { name: 'Chung' };
        session.tag = sub.name.replace(/#/g, '').trim();
        delete session.subjectId;
        migrated = true;
      }
    });
    if (migrated) console.log("Migrated Study Sessions subjects to tags.");
  }
  // Rollover unfinished tasks to today
  if (Array.isArray(appState.todos)) {
    const todayStr = getLocalDateString();
    let rolledOver = false;
    appState.todos.forEach(todo => {
      if (!todo.completed && todo.date && todo.date < todayStr) {
        todo.date = todayStr;
        rolledOver = true;
      }
    });
    if (rolledOver) console.log("Rolled over unfinished tasks to today.");
  }

  saveState();
  applyTheme(appState.selectedTheme);
  applySkin(appState.selectedSkin);
}

let isApplyingThemeOrSkin = false;

window.applyTheme = function(theme) {
  if (document.documentElement.getAttribute('data-theme') === theme) return;
  document.documentElement.setAttribute('data-theme', theme);
  const sel = document.getElementById('settings-theme-selector');
  if (sel) sel.value = theme;
  
  if (isApplyingThemeOrSkin) return;
  isApplyingThemeOrSkin = true;
  
  // Đồng bộ sang Skin thiết bị tương ứng
  let matchingSkin = 'skin-lilac-birch';
  if (theme === 'light' || theme === 'dark') matchingSkin = 'default';
  else if (theme === 'kraft') matchingSkin = 'skin-brass';
  else if (theme === 'lavender') matchingSkin = 'skin-lilac-birch';
  else if (theme === 'rain-night') matchingSkin = 'skin-silver';
  else if (theme === 'pine-forest') matchingSkin = 'skin-mahogany';
  else if (theme === 'forest-moss') matchingSkin = 'skin-forest-moss';
  else if (theme === 'kaiserin-rose') matchingSkin = 'skin-kaiserin-rose';
  else if (theme === 'sea-glass') matchingSkin = 'skin-sea-glass';
  else if (theme === 'italian-summer') matchingSkin = 'skin-italian-summer';
  else if (theme === 'kalligraphie') matchingSkin = 'skin-kalligraphie';
  
  window.applySkin(matchingSkin);
  isApplyingThemeOrSkin = false;
};

window.applySkin = function(skin) {
  if (document.documentElement.getAttribute('data-skin') === skin) return;
  document.documentElement.setAttribute('data-skin', skin);
  const sel = document.getElementById('settings-skin-selector');
  if (sel) sel.value = skin;
  
  // Vẽ lại danh sách công việc và thống kê để đổi hình thái hoa checkmark
  if (typeof refreshTodoList === 'function') refreshTodoList();
  if (typeof refreshAnalytics === 'function') refreshAnalytics();
  
  // Đồng bộ giá trị hiển thị ở bộ chọn Combo trong cài đặt
  const comboSel = document.getElementById('settings-combo-selector');
  if (comboSel) {
    const activeCombo = BOUTIQUE_COMBOS.find(c => c.skinClass === skin);
    if (activeCombo) comboSel.value = activeCombo.id;
  }
  
  if (isApplyingThemeOrSkin) return;
  isApplyingThemeOrSkin = true;
  
  // Đồng bộ sang Chủ đề màu sắc tương ứng để đổi màu toàn trang web
  let matchingTheme = 'theme-lavender';
  if (skin === 'default') {
    matchingTheme = (appState.selectedTheme === 'dark') ? 'theme-dark' : 'theme-light';
  }
  else if (skin === 'skin-brass' || skin === 'brass') matchingTheme = 'theme-kraft';
  else if (skin === 'skin-mahogany' || skin === 'mahogany') matchingTheme = 'theme-pine-forest';
  else if (skin === 'skin-silver' || skin === 'silver') matchingTheme = 'theme-rain-night';
  else if (skin === 'skin-lilac-birch' || skin === 'lilac-birch') matchingTheme = 'theme-lavender';
  else if (skin === 'skin-forest-moss' || skin === 'forest-moss') matchingTheme = 'theme-forest-moss';
  else if (skin === 'skin-kaiserin-rose' || skin === 'kaiserin-rose') matchingTheme = 'theme-kaiserin-rose';
  else if (skin === 'skin-sea-glass' || skin === 'sea-glass') matchingTheme = 'theme-sea-glass';
  else if (skin === 'skin-italian-summer' || skin === 'italian-summer') matchingTheme = 'theme-italian-summer';
  else if (skin === 'skin-kalligraphie' || skin === 'kalligraphie') matchingTheme = 'theme-kalligraphie';
  
  const themeClass = matchingTheme.replace('theme-', '');
  window.applyTheme(themeClass);
  isApplyingThemeOrSkin = false;
};

window.changeAppStateTheme = function() {
  const val = document.getElementById('settings-theme-selector').value;
  appState.selectedTheme = val;
  appState.settings.theme = val;
  saveState();
  applyTheme(val);
  playPaperRustleSound();
};

window.changeAppStateSkin = function() {
  const val = document.getElementById('settings-skin-selector').value;
  appState.selectedSkin = val;
  saveState();
  applySkin(val);
  playPaperRustleSound();
};

window.playPaperRustleSound = function() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    const bufferSize = audioCtx.sampleRate * 0.15;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioCtx.sampleRate * 0.04));
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.12);
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start(now);
  } catch(e) {
    console.warn("Audio Context error", e);
  }
};

window.playWaxSealStompSound = function() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    
    const osc = audioCtx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
    const oscGain = audioCtx.createGain();
    oscGain.gain.setValueAtTime(0.3, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(oscGain);
    oscGain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.2);

    const bufferSize = audioCtx.sampleRate * 0.12;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioCtx.sampleRate * 0.02));
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start(now);
  } catch(e) {
    console.warn("Audio Context error", e);
  }
};

window.playCatMeowSound = function() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc1.type = 'triangle';
    osc2.type = 'sawtooth';
    
    // Cute meow sound: frequency sweeps up and down
    osc1.frequency.setValueAtTime(580, now);
    osc1.frequency.linearRampToValueAtTime(820, now + 0.12);
    osc1.frequency.exponentialRampToValueAtTime(480, now + 0.4);
    
    osc2.frequency.setValueAtTime(585, now);
    osc2.frequency.linearRampToValueAtTime(825, now + 0.12);
    osc2.frequency.exponentialRampToValueAtTime(485, now + 0.4);
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.06, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.45);
    osc2.stop(now + 0.45);
  } catch(e) {
    console.warn("Audio Context error in playCatMeowSound:", e);
  }
};

window.playTeaPouringSound = function() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    
    const duration = 1.8;
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      const t = i / audioCtx.sampleRate;
      const bubble = Math.sin(2 * Math.PI * 140 * t + Math.sin(2 * Math.PI * 9 * t) * 6) * (Math.random() > 0.993 ? 0.35 : 0.04);
      data[i] = (white * 0.12 + bubble) * Math.max(0, 1 - t / duration);
    }
    
    const noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = buffer;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(550, now);
    filter.frequency.exponentialRampToValueAtTime(950, now + duration);
    filter.Q.setValueAtTime(2.2, now);
    
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.18, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    noiseNode.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    noiseNode.start(now);
  } catch(e) {
    console.warn("Audio Context error in playTeaPouringSound:", e);
  }
};

window.playTypewriterClickSound = function() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(1100, now + 0.02);
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2600, now);
    
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.015, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    
    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start(now);
    osc.stop(now + 0.04);
  } catch(e) {}
};

let boilingNoiseSource = null;
let boilingGainNode = null;

window.startBoilingSound = function() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    stopBoilingSound();

    const now = audioCtx.currentTime;
    const bufferSize = audioCtx.sampleRate * 2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }
    
    boilingNoiseSource = audioCtx.createBufferSource();
    boilingNoiseSource.buffer = buffer;
    boilingNoiseSource.loop = true;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(250, now);
    filter.Q.setValueAtTime(1.5, now);

    const lfo = audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(4, now);
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.setValueAtTime(60, now);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start(now);

    boilingGainNode = audioCtx.createGain();
    boilingGainNode.gain.setValueAtTime(0.015, now);

    boilingNoiseSource.connect(filter);
    filter.connect(boilingGainNode);
    boilingGainNode.connect(audioCtx.destination);
    
    boilingNoiseSource.start(now);
    boilingNoiseSource.lfo = lfo;
  } catch(e) {
    console.warn("Audio Context error", e);
  }
};

window.stopBoilingSound = function() {
  try {
    if (boilingNoiseSource) {
      boilingNoiseSource.stop();
      if (boilingNoiseSource.lfo) boilingNoiseSource.lfo.stop();
      boilingNoiseSource = null;
    }
  } catch(e){}
  boilingGainNode = null;
};

window.speakGermanQuote = function(text) {
  if (!text) return;
  window.speechSynthesis.cancel();
  let deText = text.split('(')[0].replace(/"/g, '').trim();
  const utterance = new SpeechSynthesisUtterance(deText);
  utterance.lang = 'de-DE';
  const voices = window.speechSynthesis.getVoices();
  const deVoice = voices.find(v => v.lang.startsWith('de') || v.lang.startsWith('DE'));
  if (deVoice) utterance.voice = deVoice;
  utterance.rate = 0.85;
  window.speechSynthesis.speak(utterance);
};

window.speakCurrentQuote = function() {
  const quoteEl = document.getElementById('dashboard-quote');
  if (quoteEl) {
    speakGermanQuote(quoteEl.textContent);
  }
};
function getLocalDateString(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
function formatVietnameseDate(s){if(!s)return'';const d=new Date(s);const days=['Chủ Nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy'];return`${days[d.getDay()]} - ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;}
function formatTimeDisplay(t){const m=Math.floor(t/60);const s=t%60;return`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;}
function formatDurationDisplay(m){if(m<60)return`${m}m`;return`${Math.floor(m/60)}h ${m%60}m`;}
function interpolateColor(c1,c2,f){const p=h=>{let c=h.substring(1);if(c.length===3)c=c[0]+c[0]+c[1]+c[1]+c[2]+c[2];return[parseInt(c.substring(0,2),16),parseInt(c.substring(2,4),16),parseInt(c.substring(4,6),16)];};const a=p(c1),b=p(c2);return`rgb(${Math.round(a[0]+(b[0]-a[0])*f)},${Math.round(a[1]+(b[1]-a[1])*f)},${Math.round(a[2]+(b[2]-a[2])*f)})`;}

function updateStreak(){const today=getLocalDateString();const y=new Date();y.setDate(y.getDate()-1);const ys=getLocalDateString(y);const l=appState.streak.lastActiveDate;if(l===today)return;if(l===ys){appState.streak.count+=1;}else if(!l){appState.streak.count=1;}else{appState.streak.count=1;}appState.streak.lastActiveDate=today;saveState();}
function checkAndLogActivityToday(){const t=getLocalDateString();const studied=appState.studySessions.some(s=>s.date===t&&s.durationSeconds>0);const diary=appState.diaries.some(d=>d.date===t&&d.content.trim().length>0);const read=appState.readingSessions && appState.readingSessions.some(s=>s.date===t&&s.minutes>0);if(studied||diary||read){updateStreak();renderSidebarStreak();}}


// =============================================
//  TEA BAG SVG GENERATOR (8 UNIQUE DESIGNS WITH PATTERNS)
// =============================================
function getTeaBagSVG(tb, size) {
  const vb = '0 0 60 90';
  let patternSvg = '';

  // Each tea bag has a unique decorative pattern (hoa văn)
  switch(tb.pattern) {
    case 'chamomile': // 🌼 Daisy flowers
      patternSvg = `
        <circle cx="30" cy="52" r="3.5" fill="#e8c83a"/>
        <ellipse cx="30" cy="46" rx="2.2" ry="4" fill="white" opacity="0.9"/>
        <ellipse cx="30" cy="58" rx="2.2" ry="4" fill="white" opacity="0.9"/>
        <ellipse cx="24" cy="52" rx="4" ry="2.2" fill="white" opacity="0.9"/>
        <ellipse cx="36" cy="52" rx="4" ry="2.2" fill="white" opacity="0.9"/>
        <ellipse cx="26" cy="48" rx="2" ry="3" fill="white" opacity="0.7" transform="rotate(-40 26 48)"/>
        <ellipse cx="34" cy="48" rx="2" ry="3" fill="white" opacity="0.7" transform="rotate(40 34 48)"/>
      `;
      break;
    case 'bamboo': // 🍃 Bamboo leaves
      patternSvg = `
        <path d="M30,42 Q26,48 22,44 Q26,47 30,42Z" fill="#4a7a3a" opacity="0.8"/>
        <path d="M30,42 Q34,48 38,44 Q34,47 30,42Z" fill="#4a7a3a" opacity="0.8"/>
        <line x1="30" y1="42" x2="30" y2="64" stroke="#3a6a2a" stroke-width="1.2"/>
        <path d="M30,52 Q26,58 22,54 Q26,57 30,52Z" fill="#5a8a4a" opacity="0.7"/>
        <path d="M30,52 Q34,58 38,54 Q34,57 30,52Z" fill="#5a8a4a" opacity="0.7"/>
        <path d="M30,60 Q26,66 24,62 Q27,65 30,60Z" fill="#6a9a5a" opacity="0.6"/>
      `;
      break;
    case 'lattice': // 🫖 Diamond lattice (English style)
      patternSvg = `
        <line x1="20" y1="42" x2="40" y2="62" stroke="#5a3a1a" stroke-width="0.8" opacity="0.5"/>
        <line x1="25" y1="42" x2="45" y2="62" stroke="#5a3a1a" stroke-width="0.8" opacity="0.5"/>
        <line x1="15" y1="42" x2="35" y2="62" stroke="#5a3a1a" stroke-width="0.8" opacity="0.5"/>
        <line x1="40" y1="42" x2="20" y2="62" stroke="#5a3a1a" stroke-width="0.8" opacity="0.5"/>
        <line x1="45" y1="42" x2="25" y2="62" stroke="#5a3a1a" stroke-width="0.8" opacity="0.5"/>
        <line x1="35" y1="42" x2="15" y2="62" stroke="#5a3a1a" stroke-width="0.8" opacity="0.5"/>
        <circle cx="30" cy="52" r="5" fill="none" stroke="#5a3a1a" stroke-width="1" opacity="0.6"/>
        <circle cx="30" cy="52" r="2" fill="#5a3a1a" opacity="0.4"/>
      `;
      break;
    case 'jasmine': // 🌸 Jasmine star flowers
      patternSvg = `
        <g transform="translate(30,50)">
          <circle r="2.5" fill="#f0e0f0"/>
          ${[0,72,144,216,288].map(a => `<ellipse cx="0" cy="-5" rx="2" ry="3.5" fill="white" opacity="0.85" transform="rotate(${a})"/>`).join('')}
        </g>
        <g transform="translate(22,60)" opacity="0.6">
          <circle r="1.5" fill="#f0e0f0"/>
          ${[0,72,144,216,288].map(a => `<ellipse cx="0" cy="-3.5" rx="1.5" ry="2.5" fill="white" opacity="0.8" transform="rotate(${a})"/>`).join('')}
        </g>
        <g transform="translate(38,44)" opacity="0.5">
          <circle r="1.5" fill="#f0e0f0"/>
          ${[0,72,144,216,288].map(a => `<ellipse cx="0" cy="-3" rx="1.2" ry="2" fill="white" opacity="0.8" transform="rotate(${a})"/>`).join('')}
        </g>
      `;
      break;
    case 'rose': // 🌹 Rose spiral
      patternSvg = `
        <g transform="translate(30,52)">
          <path d="M0,-2 C3,-4 5,0 2,2 C4,5 0,6 -2,3 C-5,5 -6,1 -3,-1 C-5,-4 -1,-6 0,-2Z" fill="#c27080" stroke="#a05060" stroke-width="0.5"/>
          <circle r="2" fill="#d0808a"/>
          <path d="M-8,5 Q-4,2 0,6 Q-2,10 -8,8Z" fill="#6a9a5a" opacity="0.7"/>
          <path d="M8,5 Q4,2 0,6 Q2,10 8,8Z" fill="#5a8a4a" opacity="0.6"/>
        </g>
        <path d="M22,45 Q26,43 24,47" fill="none" stroke="#6a9a5a" stroke-width="0.8" opacity="0.5"/>
        <circle cx="23" cy="44" r="2" fill="#d08090" opacity="0.4"/>
      `;
      break;
    case 'waves': // 🍵 Chinese wave/cloud pattern
      patternSvg = `
        <path d="M16,48 Q20,44 24,48 Q28,44 32,48 Q36,44 40,48" fill="none" stroke="#6a4520" stroke-width="1.2" opacity="0.5" stroke-linecap="round"/>
        <path d="M16,54 Q20,50 24,54 Q28,50 32,54 Q36,50 40,54" fill="none" stroke="#6a4520" stroke-width="1.2" opacity="0.4" stroke-linecap="round"/>
        <path d="M16,60 Q20,56 24,60 Q28,56 32,60 Q36,56 40,60" fill="none" stroke="#6a4520" stroke-width="1.2" opacity="0.3" stroke-linecap="round"/>
        <circle cx="30" cy="52" r="4" fill="none" stroke="#6a4520" stroke-width="1" opacity="0.35"/>
      `;
      break;
    case 'mandala': // 🧋 Mandala dots
      patternSvg = `
        <circle cx="30" cy="52" r="3" fill="#8a4020" opacity="0.5"/>
        <circle cx="30" cy="52" r="6" fill="none" stroke="#8a4020" stroke-width="0.8" opacity="0.4"/>
        <circle cx="30" cy="52" r="9" fill="none" stroke="#8a4020" stroke-width="0.6" opacity="0.3"/>
        ${[0,45,90,135,180,225,270,315].map(a => {
          const r = 6;
          const x = 30 + r * Math.cos(a * Math.PI / 180);
          const y = 52 + r * Math.sin(a * Math.PI / 180);
          return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.2" fill="#8a4020" opacity="0.5"/>`;
        }).join('')}
        ${[0,60,120,180,240,300].map(a => {
          const r = 10;
          const x = 30 + r * Math.cos(a * Math.PI / 180);
          const y = 52 + r * Math.sin(a * Math.PI / 180);
          return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="0.8" fill="#8a4020" opacity="0.35"/>`;
        }).join('')}
      `;
      break;
    case 'royal': // 👑 Crown + laurel
      patternSvg = `
        <g transform="translate(30,49)">
          <path d="M-8,6 L-5,-2 L0,3 L5,-2 L8,6 Z" fill="none" stroke="#d4af37" stroke-width="1.5" stroke-linejoin="round"/>
          <circle cx="-5" cy="-3" r="1.2" fill="#d4af37"/>
          <circle cx="0" cy="2" r="1.2" fill="#d4af37"/>
          <circle cx="5" cy="-3" r="1.2" fill="#d4af37"/>
          <line x1="-8" y1="7" x2="8" y2="7" stroke="#d4af37" stroke-width="1.2"/>
        </g>
        <path d="M20,62 Q24,58 28,62" fill="none" stroke="#d4af37" stroke-width="0.8" opacity="0.5"/>
        <path d="M32,62 Q36,58 40,62" fill="none" stroke="#d4af37" stroke-width="0.8" opacity="0.5"/>
      `;
      break;
    case 'coffee_bean':
      patternSvg = `
        <ellipse cx="30" cy="52" rx="4.5" ry="6.5" fill="#4e3629" transform="rotate(30 30 52)"/>
        <path d="M28,47 Q31,52 32,57" stroke="#faf0e6" stroke-width="0.8" fill="none" transform="rotate(30 30 52)"/>
      `;
      break;
    case 'latte_art':
      patternSvg = `
        <path d="M30,58 C30,58 24,53 24,49 C24,46 27,45 30,48 C33,45 36,46 36,49 C36,53 30,58 30,58 Z" fill="#faf5ea" stroke="#d6ccc2" stroke-width="0.8"/>
      `;
      break;
    case 'cacao_pod':
      patternSvg = `
        <path d="M30,42 C23,47 23,57 30,62 C37,57 37,47 30,42 Z" fill="#7f4f24" stroke="#faf5ea" stroke-width="0.8"/>
        <line x1="30" y1="42" x2="30" y2="62" stroke="#faf5ea" stroke-width="0.6" stroke-dasharray="1.5,1.5"/>
      `;
      break;
    case 'tea_whisk':
      patternSvg = `
        <path d="M26,45 L34,45 L32,55 L28,55 Z" fill="#faf5ea" stroke="#8cb369" stroke-width="0.6"/>
        <line x1="28" y1="55" x2="26" y2="62" stroke="#faf5ea" stroke-width="0.8"/>
        <line x1="30" y1="55" x2="30" y2="64" stroke="#faf5ea" stroke-width="0.8"/>
        <line x1="32" y1="55" x2="34" y2="62" stroke="#faf5ea" stroke-width="0.8"/>
        <path d="M26,45 Q30,41 34,45" stroke="#faf5ea" stroke-width="0.8" fill="none"/>
      `;
      break;
    case 'orange_cinnamon':
      patternSvg = `
        <circle cx="28" cy="54" r="5" fill="#f4a261" stroke="#e76f51" stroke-width="0.8"/>
        <line x1="28" y1="54" x2="25" y2="50" stroke="#faf5ea" stroke-width="0.6"/>
        <line x1="28" y1="54" x2="31" y2="50" stroke="#faf5ea" stroke-width="0.6"/>
        <line x1="28" y1="54" x2="28" y2="59" stroke="#faf5ea" stroke-width="0.6"/>
        <path d="M32,45 L36,49" stroke="#9a7b56" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M33,44 L37,48" stroke="#7a5c3e" stroke-width="1" stroke-linecap="round"/>
      `;
      break;
    case 'blue_rose':
      patternSvg = `
        <g transform="translate(30,52)">
          <path d="M0,-2 C3,-4 5,0 2,2 C4,5 0,6 -2,3 C-5,5 -6,1 -3,-1 C-5,-4 -1,-6 0,-2Z" fill="#457b9d" stroke="#1d3557" stroke-width="0.5"/>
          <circle r="2" fill="#a8dadc"/>
          <path d="M-8,5 Q-4,2 0,6 Q-2,10 -8,8Z" fill="#1d3557" opacity="0.6"/>
          <path d="M8,5 Q4,2 0,6 Q2,10 8,8Z" fill="#1d3557" opacity="0.5"/>
        </g>
      `;
      break;
    case 'flat_white':
      patternSvg = `
        <ellipse cx="30" cy="52" rx="6" ry="4" fill="none" stroke="#7a5c3e" stroke-width="0.8"/>
        <path d="M25,51 C27,48 33,48 35,51 C32,53 28,53 25,51 Z" fill="#faf5ea" opacity="0.6"/>
      `;
      break;
    case 'cat_paw':
      patternSvg = `
        <circle cx="30" cy="54" r="3.5" fill="#ff758f"/>
        <circle cx="25" cy="48" r="1.5" fill="#ff758f"/>
        <circle cx="30" cy="46" r="1.7" fill="#ff758f"/>
        <circle cx="35" cy="48" r="1.5" fill="#ff758f"/>
      `;
      break;
    case 'blossom':
      patternSvg = `
        <circle cx="30" cy="52" r="2.5" fill="#faf5ea" stroke="#1d3557" stroke-width="0.8"/>
        <circle cx="30" cy="46" r="2" fill="#faf5ea" stroke="#1d3557" stroke-width="0.6"/>
        <circle cx="35" cy="49" r="2" fill="#faf5ea" stroke="#1d3557" stroke-width="0.6"/>
        <circle cx="34" cy="55" r="2" fill="#faf5ea" stroke="#1d3557" stroke-width="0.6"/>
        <circle cx="26" cy="55" r="2" fill="#faf5ea" stroke="#1d3557" stroke-width="0.6"/>
        <circle cx="25" cy="49" r="2" fill="#faf5ea" stroke="#1d3557" stroke-width="0.6"/>
      `;
      break;
  }

  return `
    <svg width="${size}" height="${size}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">
      <!-- String -->
      <line x1="30" y1="30" x2="30" y2="10" stroke="#8B7355" stroke-width="1"/>
      <!-- Tag -->
      <rect x="22" y="2" width="16" height="9" rx="2" fill="#faf5ea" stroke="#c0aa88" stroke-width="0.7"/>
      <text x="30" y="8.5" text-anchor="middle" font-size="5" fill="#3c2f2f">${tb.emoji}</text>
      <!-- Staple -->
      <rect x="28" y="9" width="4" height="3" rx="0.5" fill="#b0a090"/>
      <!-- Tea bag pouch -->
      <path d="M14,30 L46,30 L44,68 C44,74 16,74 16,68 Z" fill="${tb.bagColor}" stroke="${tb.bagBorder}" stroke-width="1.8"/>
      <!-- Stitching -->
      <line x1="16" y1="33" x2="44" y2="33" stroke="${tb.bagBorder}" stroke-width="0.7" stroke-dasharray="2,1.5" opacity="0.6"/>
      <!-- Decorative border at bottom -->
      <path d="M18,65 Q30,70 42,65" fill="none" stroke="${tb.bagBorder}" stroke-width="0.8" opacity="0.4"/>
      <!-- Corner ornaments -->
      <path d="M16,35 Q18,37 20,35" fill="none" stroke="${tb.bagBorder}" stroke-width="0.6" opacity="0.4"/>
      <path d="M40,35 Q42,37 44,35" fill="none" stroke="${tb.bagBorder}" stroke-width="0.6" opacity="0.4"/>
      <!-- Pattern -->
      ${patternSvg}
    </svg>
  `;
}


// =============================================
//  TEA CUP IMAGE FOR CABINET (Folk Art illustrations)
// =============================================
function getTeaCupHTML(type, size = 60) {
  const img = CUP_TYPE_IMAGES[type] || CUP_TYPE_IMAGES.green;
  return `<img src="${img}" alt="${type} tea" width="${size}" height="${size}" style="object-fit:contain;border-radius:6px;">`;
}


// =============================================
//  SOUND EFFECTS FOR BREWING
// =============================================
function playSplashSound() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const now = audioCtx.currentTime;
  const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.3, audioCtx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < buf.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioCtx.sampleRate * 0.06));
  const src = audioCtx.createBufferSource(); src.buffer = buf;
  const f = audioCtx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.setValueAtTime(800, now); f.Q.setValueAtTime(1.5, now);
  const g = audioCtx.createGain(); g.gain.setValueAtTime(0.15, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
  src.connect(f); f.connect(g); g.connect(audioCtx.destination); src.start(now); src.stop(now + 0.35);
  const osc = audioCtx.createOscillator(); osc.type = 'sine'; osc.frequency.setValueAtTime(600, now); osc.frequency.exponentialRampToValueAtTime(200, now + 0.25);
  const og = audioCtx.createGain(); og.gain.setValueAtTime(0.06, now); og.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
  osc.connect(og); og.connect(audioCtx.destination); osc.start(now); osc.stop(now + 0.3);
}

function playBubbleSound() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const now = audioCtx.currentTime;
  const freq = 400 + Math.random() * 600;
  const osc = audioCtx.createOscillator(); osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, now); osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.04);
  const g = audioCtx.createGain(); g.gain.setValueAtTime(0.03, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
  osc.connect(g); g.connect(audioCtx.destination); osc.start(now); osc.stop(now + 0.1);
}

function renderBrewingScene(teaBag, percent) {
  var stage = document.getElementById('brewing-stage');
  if (!stage) return;

  if (timerMode === 'pomodoro') {
    if (pomoStage === 'short_break') {
      stage.innerHTML = `
        <div style="text-align: center; color: var(--text-main); padding-top: 1rem;">
          <h4 style="font-family: var(--font-title); margin-bottom: 0.5rem;">Giá» nghá»‰ ngáº¯n (Short Break)</h4>
          <span style="font-size: 0.8rem; color: var(--text-muted);">Uá»‘ng má»™t ngá»¥m nÆ°á»›c áº¥m vÃ  vÆ°Æ¡n vai nhÃ© chá»‹!</span>
          <div style="margin-top: 1rem;">
            ${shortBreakSVG}
          </div>
        </div>
      `;
      updateHourglass(percent, timerStatus === 'running' || timerStatus === 'paused', timerStatus === 'paused');
      return;
    } else if (pomoStage === 'long_break') {
      stage.innerHTML = `
        <div style="text-align: center; color: var(--text-main); padding-top: 1rem;">
          <h4 style="font-family: var(--font-title); margin-bottom: 0.5rem;">Giá» nghá»‰ dÃ i (Long Break)</h4>
          <span style="font-size: 0.8rem; color: var(--text-muted);">ThÆ°á»Ÿng thá»©c trÃ  vÃ  bÃ¡nh ngá»t Ä‘á»ƒ náº¡p nÄƒng lÆ°á»£ng!</span>
          <div style="margin-top: 1rem;">
            ${longBreakSVG}
          </div>
        </div>
      `;
      updateHourglass(percent, timerStatus === 'running' || timerStatus === 'paused', timerStatus === 'paused');
      return;
    }
  }

  // Khói bốc lên từ % > 10, mạnh dần theo thời gian
  var showSteam = percent > 10;
  var steamIntensity = Math.min(1, percent / 60); // 0→1 trong 60% đầu
  var showGlow = percent > 5;

  // Dây và tag: treo trên mép phải ly (cố định, không di chuyển)
  // SVG viewBox 0–100, tag treo ở góc trên phải
  var rimX  = 72;  // x mép phải miệng ly
  var rimY  = 30;  // y mép phải miệng ly
  var tagX  = 82;
  
  // Steam: bottom = khoảng cách từ đáy stage đến miệng ly → khói bốc LÊN đúng hướng
  var steamBottom = (teaBag.steamBottom !== undefined) ? teaBag.steamBottom : 235;
  var steamWidth  = (teaBag.steamWidth  !== undefined) ? teaBag.steamWidth  : 130;

  const skin = appState.selectedSkin || 'default';
  if (skin === 'sea-glass') {
    steamBottom = 240;
    steamWidth = 90;
  } else if (skin === 'italian-summer') {
    steamBottom = 240;
    steamWidth = 80; // thin wisp of espresso steam
  }
  let cupHTML = '';
  if (skin === 'kaiserin-rose') {
    cupHTML = 
      '<div class="brewing-cup-composite-container">' +
      '  <svg class="premium-cup-svg" viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">' +
      '    <defs>' +
      '      <linearGradient id="nordic-clay" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '        <stop offset="0%" stop-color="#ebdcd5"/>' +
      '        <stop offset="60%" stop-color="#dec9be"/>' +
      '        <stop offset="100%" stop-color="#cbb0a2"/>' +
      '      </linearGradient>' +
      '      <linearGradient id="oak-wood" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '        <stop offset="0%" stop-color="#ebdcd5"/>' +
      '        <stop offset="50%" stop-color="#7a6655"/>' +
      '        <stop offset="100%" stop-color="#4a3c31"/>' +
      '      </linearGradient>' +
      '    </defs>' +
      '    <ellipse cx="50" cy="74" rx="32" ry="4" fill="rgba(0,0,0,0.1)"/>' +
      '    <!-- Wooden Saucer -->' +
      '    <path d="M 18 64 C 18 72, 82 72, 82 64 Z" fill="url(#nordic-clay)" stroke="#7a6655" stroke-width="1.2"/>' +
      '    <ellipse cx="50" cy="64" rx="20" ry="2" fill="#7a6655"/>' +
      '    <!-- Handle (Rustic Loop) -->' +
      '    <path d="M 72 26 C 90 22, 88 54, 72 50" fill="none" stroke="#7a6655" stroke-width="2.5" stroke-linecap="round"/>' +
      '    <!-- Cup Body -->' +
      '    <path d="M 28 20 C 30 58, 70 58, 72 20 Z" fill="url(#nordic-clay)" stroke="#7a6655" stroke-width="1.5"/>' +
      '    <!-- Liquid inside -->' +
      '    <ellipse cx="50" cy="20" rx="22" ry="4.5" fill="#f5ece5" stroke="#7a6655" stroke-width="1"/>' +
      '    <path d="M 40 56 L 60 56 L 62 64 L 38 64 Z" fill="#7a6655"/>' +
      '    <!-- Wild rose branch minimalist drawing in Sepia/Charcoal -->' +
      '    <path d="M 38 48 Q 48 38 52 48 T 62 40" fill="none" stroke="#4a3c31" stroke-width="1.2" stroke-linecap="round"/>' +
      '    <circle cx="50" cy="42" r="2.2" fill="#a37075"/>' +
      '    <path d="M 44 43 Q 41 40 44 38" fill="none" stroke="#4a3c31" stroke-width="0.8"/>' +
      '  </svg>' +
      '  <!-- Low-opacity wild rose petals drifting from cup -->' +
      '  <div class="cup-inner-particle" style="left:42px; top:32px; animation: float-cup-petal-1 3.2s infinite ease-in-out; opacity:0.45; font-size:0.65rem;">🌸</div>' +
      '  <div class="cup-inner-particle" style="left:52px; top:28px; animation: float-cup-petal-2 3.8s infinite ease-in-out; animation-delay:1.5s; opacity:0.45; font-size:0.65rem;">🌸</div>' +
      '</div>';
  } else if (skin === 'forest-moss') {
    cupHTML = 
      '<div class="brewing-cup-composite-container">' +
      '  <svg class="premium-cup-svg" viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">' +
      '    <defs>' +
      '      <linearGradient id="olivine-glaze" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '        <stop offset="0%" stop-color="#C2CCA8"/>' +
      '        <stop offset="60%" stop-color="#A5B576"/>' +
      '        <stop offset="100%" stop-color="#808F56"/>' +
      '      </linearGradient>' +
      '      <linearGradient id="clay-base" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '        <stop offset="0%" stop-color="#B08F7A"/>' +
      '        <stop offset="100%" stop-color="#793138"/>' +
      '      </linearGradient>' +
      '    </defs>' +
      '    <ellipse cx="50" cy="74" rx="30" ry="4" fill="rgba(0,0,0,0.18)"/>' +
      '    <!-- Rustic Clay Saucer -->' +
      '    <path d="M 18 64 C 18 72, 82 72, 82 64 Z" fill="url(#clay-base)" stroke="#396153" stroke-width="1.2"/>' +
      '    <ellipse cx="50" cy="64" rx="20" ry="2" fill="#396153"/>' +
      '    <!-- Thick Ceramic Handle with wood theme -->' +
      '    <path d="M 68 28 C 86 25, 86 54, 68 52 C 78 48, 76 32, 68 32" fill="url(#clay-base)" stroke="#396153" stroke-width="1.5"/>' +
      '    <!-- Ceramic Cup Body -->' +
      '    <path d="M 26 20 C 30 62, 70 62, 74 20 Z" fill="url(#olivine-glaze)" stroke="#396153" stroke-width="1.8"/>' +
      '    <!-- Liquid (Olivine green) -->' +
      '    <ellipse cx="50" cy="20" rx="23" ry="4.8" fill="#A5B576" stroke="#396153" stroke-width="1"/>' +
      '    <!-- Cracked Glaze lines (Men rạn) -->' +
      '    <path d="M 32 30 Q 40 45 42 55 M 68 28 Q 62 48 55 58 M 48 35 Q 52 50 48 60 M 58 22 Q 52 38 60 48" fill="none" stroke="rgba(57, 97, 83, 0.25)" stroke-width="0.8"/>' +
      '    <!-- Pine leaf decal on cup face -->' +
      '    <path d="M 45 38 Q 50 32 55 38 M 50 32 L 50 46" fill="none" stroke="#396153" stroke-width="1.2" stroke-linecap="round"/>' +
      '  </svg>' +
      '  <div class="cup-inner-particle" style="left:42px; top:36px; font-size:10px; animation: float-cup-needle-1 2s infinite ease-in-out;">🌲</div>' +
      '  <div class="cup-inner-particle" style="left:52px; top:32px; font-size:10px; animation: float-cup-needle-2 2.6s infinite ease-in-out; animation-delay:0.8s;">🌱</div>' +
      '</div>';
  } else if (skin === 'sea-glass') {
    cupHTML = 
      '<div class="brewing-cup-composite-container">' +
      '  <svg class="premium-cup-svg" viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">' +
      '    <ellipse cx="50" cy="74" rx="30" ry="4" fill="rgba(0,0,0,0.12)"/>' +
      '    <!-- Ceramic Saucer (Concerto) -->' +
      '    <path d="M 18 64 C 18 72, 82 72, 82 64 Z" fill="#D9D9D8" stroke="#2A4D88" stroke-width="1.5"/>' +
      '    <ellipse cx="50" cy="64" rx="20" ry="2" fill="#2A4D88"/>' +
      '    <!-- Thick Ceramic Handle with wave details -->' +
      '    <path d="M 68 28 C 88 24, 88 56, 68 52 C 78 48, 76 32, 68 32" fill="#D9D9D8" stroke="#2A4D88" stroke-width="2"/>' +
      '    <!-- Ceramic Cup Body (Men rạn thô) -->' +
      '    <path d="M 26 20 C 30 62, 70 62, 74 20 Z" fill="#D9D9D8" stroke="#2A4D88" stroke-width="1.8"/>' +
      '    <!-- Liquid inside (Deep Blue) -->' +
      '    <ellipse cx="50" cy="20" rx="23" ry="4.8" fill="#2A4D88" stroke="#2A4D88" stroke-width="1"/>' +
      '    <!-- Cracked Glaze lines (Men rạn) -->' +
      '    <path d="M 32 30 Q 40 45 42 55 M 68 28 Q 62 48 55 58 M 48 35 Q 52 50 48 60 M 58 22 Q 52 38 60 48" fill="none" stroke="rgba(42, 77, 136, 0.25)" stroke-width="0.8"/>' +
      '    <!-- Waves decal on cup face -->' +
      '    <path d="M 38 42 Q 44 36 50 42 T 62 42" fill="none" stroke="#2A4D88" stroke-width="1.2" stroke-linecap="round"/>' +
      '    <path d="M 36 46 Q 44 40 50 46 T 64 46" fill="none" stroke="#2A4D88" stroke-width="0.8" opacity="0.6" stroke-linecap="round"/>' +
      '  </svg>' +
      '  <div class="cup-inner-particle" style="left:44px; top:36px; font-size:12px; animation: float-cup-bubble-1 1.8s infinite ease-in-out;">🫧</div>' +
      '  <div class="cup-inner-particle" style="left:54px; top:30px; font-size:11px; animation: float-cup-bubble-2 2.4s infinite ease-in-out; animation-delay:0.6s;">🐚</div>' +
      '</div>';
  } else if (skin === 'kalligraphie') {
    cupHTML = 
      '<div class="brewing-cup-composite-container">' +
      '  <svg class="premium-cup-svg" viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">' +
      '    <defs>' +
      '      <linearGradient id="chawan-glaze" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '        <stop offset="0%" stop-color="#fdfaf6"/>' +
      '        <stop offset="70%" stop-color="#f4eae1"/>' +
      '        <stop offset="100%" stop-color="#d8c5b3"/>' +
      '      </linearGradient>' +
      '    </defs>' +
      '    <ellipse cx="50" cy="74" rx="28" ry="4.5" fill="rgba(0,0,0,0.15)"/>' +
      '    <!-- Traditional wide Chawan shape (Matcha bowl) -->' +
      '    <path d="M 22 25 C 26 62, 74 62, 78 25 Z" fill="url(#chawan-glaze)" stroke="#5c4d4d" stroke-width="2"/>' +
      '    <!-- Green Matcha Liquid inside -->' +
      '    <ellipse cx="50" cy="25" rx="25" ry="5.5" fill="#8cb369" stroke="#5c4d4d" stroke-width="1"/>' +
      '    <!-- Sakura prints on bowl -->' +
      '    <circle cx="44" cy="42" r="3" fill="#ffccd5" opacity="0.9"/>' +
      '    <circle cx="50" cy="45" r="2.5" fill="#ffccd5" opacity="0.9"/>' +
      '    <circle cx="56" cy="41" r="3.2" fill="#ffccd5" opacity="0.9"/>' +
      '    <circle cx="50" cy="42" r="1" fill="#ff758f"/>' +
      '  </svg>' +
      '  <div class="cup-inner-particle" style="left:40px; top:32px; font-size:12px; animation: float-cup-petal-1 2.2s infinite ease-in-out;">🌸</div>' +
      '  <div class="cup-inner-particle" style="left:52px; top:28px; font-size:10px; animation: float-cup-petal-2 2.8s infinite ease-in-out; animation-delay:1s;">🌸</div>' +
      '</div>';
  } else if (skin === 'italian-summer') {
    cupHTML = 
      '<div class="brewing-cup-composite-container">' +
      '  <svg class="premium-cup-svg" viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">' +
      '    <ellipse cx="50" cy="74" rx="26" ry="3.5" fill="rgba(0,0,0,0.12)"/>' +
      '    <!-- Amalfi White Porcelain Saucer -->' +
      '    <path d="M 22 64 C 22 72, 78 72, 78 64 Z" fill="#FFFDF6" stroke="#2E5AA7" stroke-width="1.5"/>' +
      '    <ellipse cx="50" cy="64" rx="16" ry="1.5" fill="#2E5AA7"/>' +
      '    <!-- Cup Handle -->' +
      '    <path d="M 68 28 C 84 25, 84 52, 68 48 C 74 44, 74 32, 68 32" fill="#FFFDF6" stroke="#2E5AA7" stroke-width="1.8"/>' +
      '    <!-- Cup Body -->' +
      '    <path d="M 30 22 C 34 58, 66 58, 70 22 Z" fill="#FFFDF6" stroke="#2E5AA7" stroke-width="1.8"/>' +
      '    <!-- Espresso Liquid with Crema -->' +
      '    <ellipse cx="50" cy="22" rx="19" ry="4" fill="#5B3113" stroke="#2E5AA7" stroke-width="1"/>' +
      '    <ellipse cx="50" cy="22" rx="15" ry="2.8" fill="#FFA62B" opacity="0.85"/>' +
      '    <!-- Amalfi Lemon Decal -->' +
      '    <ellipse cx="50" cy="40" rx="3.5" ry="4.8" fill="#FFA62B" stroke="#2E5AA7" stroke-width="0.5"/>' +
      '    <path d="M 50 35 Q 46 32 48 37 Z" fill="#969752"/>' +
      '  </svg>' +
      '  <div class="cup-inner-particle" style="left:44px; top:32px; font-size:10px; color:#F8E6A0; animation: float-cup-petal-1 2.4s infinite ease-in-out;">🌼</div>' +
      '  <div class="cup-inner-particle" style="left:52px; top:28px; font-size:8px; color:#FFA62B; animation: float-cup-petal-2 2.8s infinite ease-in-out; animation-delay:0.8s;">🍋</div>' +
      '</div>';
  } else {
    cupHTML = 
      '<div class="brewing-cup-composite-container">' +
      '  <img src="' + teaBag.cupImage + '" class="brewing-cup-base-image" alt="' + teaBag.nameVi + '">' +
      '</div>';
  }

  stage.innerHTML =
    '<div class="warm-glow-ring ' + (showGlow ? 'active' : '') + '" style="background:radial-gradient(ellipse at 50% 65%,' +
      teaBag.liquidColor + '33 0%,' + teaBag.liquidColor + '10 55%,transparent 75%);"></div>' +
    cupHTML +
    '<div class="steam-layer ' + (showSteam ? 'visible' : '') + '" id="steam-layer"' +
    '  style="opacity:' + (0.5 + steamIntensity * 0.5).toFixed(2) + ';' +
    '         bottom:' + steamBottom + 'px;' +
    '         width:' + steamWidth + 'px;">' +
    '  <svg class="steam-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '    <path class="steam-wisp wisp-1" d="M 26 80 C 29 70, 21 60, 25 50 C 29 40, 35 38, 28 25 C 34 35, 25 40, 20 50 C 15 60, 22 70, 26 80 Z" />' +
    '    <path class="steam-wisp wisp-2" d="M 42 80 C 45 70, 37 60, 41 50 C 45 40, 51 38, 44 25 C 50 35, 41 40, 36 50 C 31 60, 38 70, 42 80 Z" />' +
    '    <path class="steam-wisp wisp-3" d="M 58 80 C 61 70, 53 60, 57 50 C 61 40, 67 38, 60 25 C 66 35, 57 40, 52 50 C 47 60, 54 70, 58 80 Z" />' +
    '    <path class="steam-wisp wisp-4" d="M 74 80 C 77 70, 69 60, 73 50 C 77 40, 83 38, 76 25 C 82 35, 73 40, 68 50 C 63 60, 70 70, 74 80 Z" />' +
    '  </svg>' +
    '</div>';

  // Update vintage hourglass animation state
  updateHourglass(percent, timerStatus === 'running' || timerStatus === 'paused', timerStatus === 'paused');
}

function updateHourglass(pct, isRunning, isPaused) {
  const container = document.getElementById('vintage-hourglass-container');
  if (!container) return;

  const clipTopRect = document.getElementById('rect-clip-top');
  const clipBottomRect = document.getElementById('rect-clip-bottom');

  if (isRunning) {
    container.classList.add('running', 'flipped');
    container.classList.remove('paused');
    if (isPaused) {
      container.classList.add('paused');
    }

    // In flipped state:
    // .sand-bottom (now at physical top) decreases from 1 to 0
    // .sand-top (now at physical bottom) increases from 0 to 1
    const sourceScale = Math.max(0, 1 - (pct / 100));
    const destScale = Math.min(1, pct / 100);

    // SVG top sand (physically at bottom) fills from y=20 base downwards (height from 0 to 60)
    if (clipTopRect) {
      clipTopRect.setAttribute('y', '20');
      clipTopRect.setAttribute('height', (60 * destScale).toFixed(1));
    }

    // SVG bottom sand (physically at top) drains from y=80 neck downwards (height from 60 to 0)
    if (clipBottomRect) {
      clipBottomRect.setAttribute('y', '80');
      clipBottomRect.setAttribute('height', (60 * sourceScale).toFixed(1));
    }

    // Sand mound scales up as sand accumulates at the physical bottom base
    const sandMoundEl = container.querySelector('.sand-mound');
    if (sandMoundEl) {
      sandMoundEl.style.transform = `scaleY(${destScale.toFixed(3)})`;
      sandMoundEl.style.transformOrigin = `bottom center`;
    }
  } else {
    // Reset/Idle state: upright, unflipped
    container.classList.remove('running', 'flipped', 'paused');
    
    // SVG top sand is empty (y=20, height=0)
    if (clipTopRect) {
      clipTopRect.setAttribute('y', '20');
      clipTopRect.setAttribute('height', '0');
    }

    // SVG bottom sand is full (y=80, height=60)
    if (clipBottomRect) {
      clipBottomRect.setAttribute('y', '80');
      clipBottomRect.setAttribute('height', '60');
    }

    const sandMoundEl = container.querySelector('.sand-mound');
    if (sandMoundEl) {
      sandMoundEl.style.transform = 'scaleY(0)';
    }
  }
}



function getTeaBagMiniPatternOverlay(tb) {
  switch(tb.pattern) {
    case 'chamomile': 
      return '<circle cx="0" cy="2.5" r="1.5" fill="#e8c83a" opacity="0.8"/>' +
             '<circle cx="-1.5" cy="1" r="0.8" fill="white" opacity="0.6"/>' +
             '<circle cx="1.5" cy="1" r="0.8" fill="white" opacity="0.6"/>';
    case 'bamboo': 
      return '<path d="M0,0 Q-1.5,2 -2.5,1 Q-1,2 0,0Z" fill="#4a7a3a" opacity="0.8"/>' +
             '<path d="M0,0 Q1.5,2 2.5,1 Q1,2 0,0Z" fill="#4a7a3a" opacity="0.8"/>' +
             '<line x1="0" y1="0" x2="0" y2="5" stroke="#3a6a2a" stroke-width="0.3" opacity="0.6"/>';
    case 'lattice': 
      return '<line x1="-3" y1="-2" x2="3" y2="4" stroke="#5a3a1a" stroke-width="0.3" opacity="0.5"/>' +
             '<line x1="3" y1="-2" x2="-3" y2="4" stroke="#5a3a1a" stroke-width="0.3" opacity="0.5"/>';
    case 'jasmine': 
      return '<circle cx="0" cy="2.5" r="0.8" fill="#f0e0f0" opacity="0.8"/>' +
             '<circle cx="-1.2" cy="2" r="0.6" fill="white" opacity="0.6"/>' +
             '<circle cx="1.2" cy="2" r="0.6" fill="white" opacity="0.6"/>';
    case 'rose': 
      return '<path d="M0,1 C1,0 1.5,1.5 0.5,2 C1.5,2.5 0.5,3 -0.5,2.5 C-1.5,3 -1.5,2 -0.5,1.5 C-1.5,1 -0.5,0.5 0,1Z" fill="#c27080" opacity="0.8"/>';
    case 'waves': 
      return '<path d="M-3,1 Q-1.5,0 0,1 Q1.5,0 3,1" fill="none" stroke="#6a4520" stroke-width="0.3" opacity="0.5"/>' +
             '<path d="M-3,3.5 Q-1.5,2.5 0,3.5 Q1.5,2.5 3,3.5" fill="none" stroke="#6a4520" stroke-width="0.3" opacity="0.4"/>';
    case 'mandala': 
      return '<circle cx="0" cy="2.5" r="0.8" fill="#8a4020" opacity="0.6"/>' +
             '<circle cx="0" cy="2.5" r="2" fill="none" stroke="#8a4020" stroke-width="0.25" opacity="0.5"/>';
    case 'royal': 
      return '<path d="M-2,3.5 L-1,1 L0,2.5 L1,1 L2,3.5 Z" fill="none" stroke="#d4af37" stroke-width="0.35" opacity="0.8"/>';
    default: 
      return '';
  }
}

function getTeaBagMiniPattern(tb) {
  switch(tb.pattern) {
    case 'chamomile': return '<circle cx="0" cy="14" r="3.5" fill="#e8c83a" opacity="0.6"/><circle cx="-3" cy="10" r="1.8" fill="white" opacity="0.5"/><circle cx="3" cy="10" r="1.8" fill="white" opacity="0.5"/>';
    case 'bamboo': return '<path d="M0,7 Q-3,12 -5,9 Q-2,11 0,7Z" fill="#4a7a3a" opacity="0.6"/><path d="M0,7 Q3,12 5,9 Q2,11 0,7Z" fill="#4a7a3a" opacity="0.6"/><line x1="0" y1="7" x2="0" y2="22" stroke="#3a6a2a" stroke-width="0.7" opacity="0.5"/>';
    case 'lattice': return '<line x1="-7" y1="7" x2="7" y2="24" stroke="#5a3a1a" stroke-width="0.5" opacity="0.4"/><line x1="7" y1="7" x2="-7" y2="24" stroke="#5a3a1a" stroke-width="0.5" opacity="0.4"/><circle cx="0" cy="15" r="2.5" fill="none" stroke="#5a3a1a" stroke-width="0.5" opacity="0.4"/>';
    case 'jasmine': return '<circle cx="0" cy="14" r="1.8" fill="#f0e0f0" opacity="0.6"/><circle cx="0" cy="10" r="1.3" fill="white" opacity="0.5"/><circle cx="3" cy="13" r="1.3" fill="white" opacity="0.5"/><circle cx="-3" cy="13" r="1.3" fill="white" opacity="0.5"/>';
    case 'rose': return '<path d="M0,12 C2,10 3,13 1,15 C3,17 1,18 -1,16 C-3,18 -3,15 -1,13 C-3,11 -1,10 0,12Z" fill="#c27080" opacity="0.6"/>';
    case 'waves': return '<path d="M-7,12 Q-4,9 0,12 Q4,9 7,12" fill="none" stroke="#6a4520" stroke-width="0.7" opacity="0.4"/><path d="M-7,17 Q-4,14 0,17 Q4,14 7,17" fill="none" stroke="#6a4520" stroke-width="0.7" opacity="0.35"/>';
    case 'mandala': return '<circle cx="0" cy="14" r="1.8" fill="#8a4020" opacity="0.4"/><circle cx="0" cy="14" r="4.5" fill="none" stroke="#8a4020" stroke-width="0.4" opacity="0.3"/>';
    case 'royal': return '<path d="M-4,17 L-2,11 L0,14 L2,11 L4,17 Z" fill="none" stroke="#d4af37" stroke-width="0.8" opacity="0.6"/><circle cx="0" cy="13" r="0.8" fill="#d4af37" opacity="0.5"/>';
    default: return '';
  }
}


// =============================================
//  BUBBLE SPAWNING (with sound)
// =============================================
function startBubbles() {
  stopBubbles();
  const layer = document.getElementById('bubbles-layer');
  if (!layer) return;

  startBoilingSound();

  bubbleInterval = setInterval(function() {
    if (timerStatus !== 'running') return;
    const bubble = document.createElement('div');
    bubble.className = 'bubble-dot';
    const size = 3 + Math.random() * 5;
    bubble.style.width = size + 'px';
    bubble.style.height = size + 'px';
    bubble.style.left = (20 + Math.random() * 100) + 'px';
    bubble.style.top = (10 + Math.random() * 70) + 'px';
    bubble.style.animationDuration = (1 + Math.random() * 1.5) + 's';
    layer.appendChild(bubble);
    if (Math.random() < 0.2) playBubbleSound();
    setTimeout(function() { if (bubble.parentNode) bubble.parentNode.removeChild(bubble); }, 4000);
  }, 800);
}

function stopBubbles() {
  if (bubbleInterval) { clearInterval(bubbleInterval); bubbleInterval = null; }
  const layer = document.getElementById('bubbles-layer');
  if (layer) layer.innerHTML = '';
  stopBoilingSound();
}


// =============================================
//  WAX SEAL SVG
// =============================================
function getWaxSealSVG(id, size = 48) {
  const seal = BOUTIQUE_SEALS.find(s => s.id === id) || BOUTIQUE_SEALS[0];
  let color = seal.color;
  const skin = document.documentElement.getAttribute('data-skin') || 'lilac-birch';

  // Tự động đổi màu sáp mặc định theo skin hoạt động
  if (id === 'seal-default') {
    if (skin === 'kaiserin-rose') color = '#b85a4b'; // Sáp nâu đỏ đất nung dập nổi bông hồng héo
    else if (skin === 'kalligraphie') color = '#705844'; // Sáp nâu phong thư cổ
    else if (skin === 'forest-moss') color = '#588157'; // Sáp xanh rêu lá
    else if (skin === 'sea-glass') color = '#2A4D88'; // Sáp xanh dương thẫm đại dương Deep Blue
    else if (skin === 'italian-summer') color = '#FFA62B'; // Sáp cam Citrus Zest Địa Trung Hải
    else if (skin === 'lilac-birch') color = '#8e62ad'; // Sáp tím oải hương
  }

  let insignia = seal.insignia;
  if (id === 'seal-default' && skin === 'italian-summer') {
    insignia = 'sun'; // Mặc định dập nổi hình mặt trời cho mùa hè nước Ý
  }

  let insigniaPath = '';
  if (insignia === 'rose') { insigniaPath = `<path d="M24 24 C24 16 40 16 40 24 C40 32 24 32 24 24Z M32 24 C28 20 36 20 32 24Z" stroke="white" stroke-width="2" fill="none"/><path d="M32 30 Q32 42 24 46" stroke="white" stroke-width="2" fill="none"/>`; }
  else if (seal.insignia === 'crown') { insigniaPath = `<path d="M18 42 L22 26 L32 34 L42 26 L46 42Z" fill="none" stroke="white" stroke-width="2.5"/><circle cx="22" cy="24" r="2" fill="white"/><circle cx="32" cy="32" r="2" fill="white"/><circle cx="42" cy="24" r="2" fill="white"/>`; }
  else if (seal.insignia === 'leaf') { insigniaPath = `<path d="M22 42 Q32 38 42 22 M32 34 Q38 32 40 28 M28 38 Q22 34 20 30" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"/>`; }
  else if (seal.insignia === 'sun') { insigniaPath = `<circle cx="32" cy="32" r="8" fill="none" stroke="white" stroke-width="2"/><path d="M32 16 L32 20 M32 44 L32 48 M16 32 L20 32 M44 32 L48 32 M21 21 L24 24 M40 40 L43 43 M21 43 L24 40 M40 21 L43 24" stroke="white" stroke-width="2" stroke-linecap="round"/>`; }
  else if (seal.insignia === 'moon') { insigniaPath = `<path d="M30 20 A 12 12 0 0 0 30 44 A 10 10 0 0 1 30 20 Z M38 22 L39 24 L41 24 L39.5 25 L40 27 L38 25.5 L36 27 L36.5 25 L35 24 L37 24 Z M42 30 L42.5 31.5 L44 31.5 L42.8 32.2 L43.2 33.5 L42 32.5 L40.8 33.5 L41.2 32.2 L40 31.5 L41.5 31.5 Z M36 38 L36.5 39.5 L38 39.5 L36.8 40.2 L37.2 41.5 L36 40.5 L34.8 41.5 L35.2 40.2 L34 39.5 L35.5 39.5 Z" fill="white" stroke="none"/>`; }
  else if (seal.insignia === 'butterfly') { insigniaPath = `<path d="M32 18 L32 42 M31 16 Q28 10 26 12 M33 16 Q36 10 38 12 M30 26 C16 12 12 28 30 31 Z M34 26 C48 12 52 28 34 31 Z M30 32 C18 34 20 44 30 38 Z M34 32 C46 34 44 44 34 38 Z" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="32" cy="16" r="1.5" fill="white"/>`; }
  else if (seal.insignia === 'tulip') { insigniaPath = `<path d="M32 30 L32 48 M32 30 C24 28 24 18 29 18 C30.5 18 32 21 32 23 C32 21 33.5 18 35 18 C40 18 40 28 32 30 Z M28 18 Q32 14 36 18 M32 44 Q22 40 22 30 Q28 36 32 44 M32 44 Q42 40 42 30 Q36 36 32 44" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`; }
  else if (seal.insignia === 'bee') { insigniaPath = `<path d="M32 22 C35 22 36 34 32 42 C28 34 29 22 32 22 Z M30 26 C16 18 16 30 28 30 Z M34 26 C48 18 48 30 36 30 Z M30 16 Q28 12 26 13 M34 16 Q36 12 38 13 M29 28 L35 28 M29 33 L35 33 M30 38 L34 38" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="32" cy="18" r="2" fill="white"/>`; }
  else if (seal.insignia === 'mushroom') { insigniaPath = `<path d="M20 32 C20 18 44 18 44 32 Z M20 32 Q32 35 44 32 M29 33 Q27 45 29 46 L35 46 Q37 45 35 33" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="28" cy="24" r="1.2" fill="white"/><circle cx="36" cy="25" r="1.2" fill="white"/><circle cx="32" cy="20" r="0.8" fill="white"/>`; }
  else if (seal.insignia === 'lily_valley') { insigniaPath = `<path d="M24 46 Q24 22 42 16 M37 20 Q34 21 34 23 M34 23 C31 23 30 25 30 27 Q30 29 33 29 Q36 29 36 27 Z M29 30 Q26 31 26 32 M26 32 C23 32 22 34 22 36 Q22 38 25 38 Q28 38 28 36 Z M24 46 Q32 40 34 28 Q26 34 24 46" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`; }
  return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M32 4 C48 3 58 12 60 28 C61 44 49 57 34 60 C18 61 5 50 4 34 C3 18 16 5 32 4Z" fill="${color}" stroke="rgba(0,0,0,0.15)" stroke-width="1"/><circle cx="32" cy="32" r="22" fill="${color}" stroke="rgba(255,255,255,0.2)" stroke-width="2"/><circle cx="32" cy="32" r="20" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="1.5"/>${insigniaPath}</svg>`;
}

function initSunbeams() {
  const container = document.getElementById('sunbeam-container');
  if (!container) return;
  container.innerHTML = '';
  // Sinh ra 15 hạt bụi nắng lơ lửng
  for (let i = 0; i < 15; i++) {
    const mote = document.createElement('div');
    mote.className = 'dust-mote';
    mote.style.left = Math.random() * 100 + 'vw';
    const size = (4 + Math.random() * 6);
    mote.style.width = size + 'px';
    mote.style.height = size + 'px';
    
    const duration = 10 + Math.random() * 10;
    const delay = Math.random() * -20; // Khởi đầu ngẫu nhiên để không tụ lại cùng lúc
    mote.style.animationDuration = duration + 's';
    mote.style.animationDelay = delay + 's';
    
    container.appendChild(mote);
  }
}


// =============================================
//  INITIALIZATION
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  // Register Service Worker for PWA
  // Register Service Worker for PWA (Only on secure HTTPS origins or localhost)
  if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => console.log('Service Worker registered:', reg.scope))
      .catch(err => console.warn('Service Worker registration failed:', err));
  }

  try { checkAndSeedDatabase(); } catch(e) { console.error("seed failed", e); }
  try { loadState(); } catch(e) { console.error("loadState failed", e); }
  try { lucide.createIcons(); } catch(e) { console.error("lucide failed", e); }
  try { setupTheme(); } catch(e) { console.error("setupTheme failed", e); }
  try { setupNavigation(); } catch(e) { console.error("setupNavigation failed", e); }
  try { initDashboard(); } catch(e) { console.error("initDashboard failed", e); }
  try { initTimer(); } catch(e) { console.error("initTimer failed", e); }
  try { initDiary(); } catch(e) { console.error("initDiary failed", e); }
  try { initAnalytics(); } catch(e) { console.error("initAnalytics failed", e); }
  try { initSettings(); } catch(e) { console.error("initSettings failed", e); }
  try { initSupabaseAuth(); } catch(e) { console.error("initSupabaseAuth failed", e); }
  try { refreshReadingTab(); } catch(e) { console.error("refreshReadingTab failed", e); }
  try { initSunbeams(); } catch(e) { console.error("initSunbeams failed", e); }
  
  try {
    const tpEl = document.getElementById('nav-tea-points');
    if (tpEl) tpEl.textContent = appState.teaPoints;
  } catch(e) { console.error("Setting tea points failed", e); }
  
  try { renderSidebarStreak(); } catch(e) { console.error("renderSidebarStreak failed", e); }
  try { if (typeof window.initCanvasParticles === 'function') window.initCanvasParticles(); } catch(e) { console.error("initCanvasParticles failed", e); }
  try { if (typeof window.showWelcomeLetter === 'function') window.showWelcomeLetter(); } catch(e) { console.error("showWelcomeLetter failed", e); }
});


// =============================================
//  THEME
// =============================================
function setupTheme(){
  // Auto-reset to light mode if user previously had dark mode enabled
  if (appState.selectedTheme === 'dark') {
    appState.selectedTheme = 'light';
  }
  if (appState.settings && appState.settings.theme === 'dark') {
    appState.settings.theme = 'light';
  }
  
  const t = appState.selectedTheme || (appState.settings && appState.settings.theme) || 'light';
  window.applyTheme(t);
  updateThemeButtonUI('light');
  
  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.style.display = 'none'; // Ensure it is hidden programmatically
  }
}
function updateThemeButtonUI(t){document.querySelector('.theme-text').textContent=t==='dark'?'Giao diện sáng':'Giao diện tối';}

function renderSidebarStreak(){
  const el=document.getElementById('nav-streak-count');
  el.textContent=appState.streak.count||0;
  const a=document.getElementById('streak-animation');
  if(a) {
    a.innerHTML = getTeaSproutSVG(appState.streak.count || 0);
  }
  try { renderStreakGrid(); } catch(e) {}
}

function renderStreakGrid() {
  const grid = document.getElementById('nav-streak-grid');
  if (!grid) return;
  grid.innerHTML = '';
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = getLocalDateString(d);
    
    const hasStudied = appState.studySessions.some(s => s.date === dateStr && s.durationSeconds > 0);
    const hasDiary = appState.diaries.some(dy => dy.date === dateStr && dy.content.trim().length > 0);
    const isCompleted = hasStudied || hasDiary;
    
    const cell = document.createElement('div');
    cell.className = `streak-cell-vintage ${isCompleted ? 'completed' : ''}`;
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    cell.title = `${days[d.getDay()]} (${d.getDate()}/${d.getMonth() + 1})`;
    grid.appendChild(cell);
  }
}

function getTeaSproutSVG(streak) {
  let leaves = '';
  let stem = '<path d="M16,28 C16,20 16,14 16,10" stroke="#7d6b60" stroke-width="2" stroke-linecap="round" fill="none"/>';
  if (streak === 0) {
    leaves = '<path d="M16,10 C14,8 14,5 16,3 C18,5 18,8 16,10 Z" fill="#8cb369" stroke="#606c38" stroke-width="1"/>';
  } else {
    if (streak >= 1) leaves += '<path d="M16,22 C10,20 8,16 6,17 C8,21 12,23 16,22 Z" fill="#8cb369" stroke="#606c38" stroke-width="1"/>';
    if (streak >= 2) leaves += '<path d="M16,18 C22,16 24,12 26,13 C24,17 20,19 16,18 Z" fill="#8cb369" stroke="#606c38" stroke-width="1"/>';
    if (streak >= 3) leaves += '<path d="M16,14 C11,12 10,8 8,9 C10,13 13,14 16,14 Z" fill="#8cb369" stroke="#606c38" stroke-width="1"/>';
    if (streak >= 4) leaves += '<path d="M16,12 C21,10 22,6 24,7 C22,11 19,12 16,12 Z" fill="#8cb369" stroke="#606c38" stroke-width="1"/>';
    if (streak >= 5) {
      leaves += `
        <path d="M16,10 C14,6 14,3 16,1 C18,3 18,6 16,10 Z" fill="#8cb369" stroke="#606c38" stroke-width="1"/>
        <circle cx="16" cy="6" r="3" fill="#ffb3c1" stroke="#ff758f" stroke-width="0.8"/>
        <circle cx="16" cy="6" r="1" fill="#fbbf24"/>
      `;
    } else {
      leaves += '<path d="M16,10 C14,6 14,3 16,1 C18,3 18,6 16,10 Z" fill="#8cb369" stroke="#606c38" stroke-width="1"/>';
    }
  }
  return `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M6,28 C10,26 22,26 26,28 C24,30 8,30 6,28 Z" fill="#7a523d" opacity="0.85"/>
      ${stem}
      ${leaves}
    </svg>
  `;
}


// =============================================
//  NAVIGATION
// =============================================
function setupNavigation(){const btns=document.querySelectorAll('.menu-item');const tabs=document.querySelectorAll('.tab-content');btns.forEach(btn=>{btn.addEventListener('click',()=>{
      if (timerStatus === 'running' && timerMode === 'pomodoro' && appState.settings.pomoStrictness === 'hard') {
        customAlert('Chị đang trong phiên học NGHIÊM KHẮC! Vui lòng hoàn thành buổi học hoặc bấm Bỏ cuộc để chuyển trang.');
        return;
      }
      playPaperRustleSound();const target=btn.getAttribute('data-tab');btns.forEach(b=>b.classList.remove('active'));btn.classList.add('active');tabs.forEach(tab=>{tab.classList.remove('active');if(tab.id===`${target}-tab`)tab.classList.add('active');});if(target==='dashboard')refreshDashboard();else if(target==='timer'){refreshTimerSubjects();renderTeaBagGrid();}else if(target==='diary')refreshDiaryEntries();else if(target==='reading')refreshReadingTab();else if(target==='analytics')refreshAnalytics();else if(target==='settings'){refreshSettings();if(typeof window.playBoutiqueBellSound === 'function') window.playBoutiqueBellSound();}lucide.createIcons();});});

  // Hover chú mèo ở sidebar để mở mắt liếc lên phát tiếng kêu meo meo lười biếng
  const catWidget = document.getElementById('sidebar-cat');
  if (catWidget) {
    catWidget.addEventListener('mouseenter', () => {
      const openEyes = document.getElementById('cat-eyes-open');
      if (openEyes && openEyes.classList.contains('hidden')) {
        triggerCatStretch();
        playCatMeowSound();
      }
    });
  }
}


// =============================================
//  DASHBOARD (TAB 1)
// =============================================
function initDashboard(){
  refreshDashboardQuote();
  document.getElementById('current-date-display').textContent=formatVietnameseDate(getLocalDateString());
  document.getElementById('dash-add-todo-btn').addEventListener('click',()=>{
    document.getElementById('dash-todo-input-row').classList.toggle('hidden');
    refreshTodoSubjectSelect();
    document.getElementById('dash-new-todo-input').focus();
  });
  document.getElementById('dash-submit-todo-btn').addEventListener('click',()=>addDashboardTodo());
  document.getElementById('dash-new-todo-input').addEventListener('keydown',e=>{if(e.key==='Enter')addDashboardTodo();});
  document.getElementById('dash-write-now-btn').addEventListener('click',()=>{document.querySelector('.menu-item[data-tab="diary"]').click();});
  
  document.querySelectorAll('.todo-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.todo-tab-btn').forEach(b => {
        b.classList.remove('active');
        b.style.borderBottom = 'none';
        b.style.color = 'var(--text-muted)';
      });
      btn.classList.add('active');
      btn.style.borderBottom = '2px solid var(--primary)';
      btn.style.color = 'var(--primary)';
      activeTodoTab = btn.getAttribute('data-tab');
      renderDashboardTodos();
    });
  });
  
  refreshDashboard();
}

function refreshDashboardQuote(){
  const el=document.getElementById('dashboard-quote');
  if(!el) return;
  
  let pool = GERMAN_QUOTES.map(q => ({ quote: q.quote, author: q.author, trans: q.trans }));
  
  if (appState.unlockedQuotes) {
    appState.unlockedQuotes.forEach(qid => {
      const pack = BOUTIQUE_QUOTES.find(p => p.id === qid);
      if (pack && pack.quotes) {
        pack.quotes.forEach(qItem => {
          pool.push({
            quote: `"${qItem.text}"`,
            author: pack.name,
            trans: qItem.translation
          });
        });
      }
    });
  }

  const q=pool[Math.floor(Math.random()*pool.length)];
  el.innerHTML=`${q.quote}<br><small style="font-weight:500;font-size:0.8rem;color:var(--text-muted);">— ${q.author} (${q.trans})</small>`;
}

function refreshDashboard(){
  const todayStr=getLocalDateString();
  const todaySessions=appState.studySessions.filter(s=>s.date===todayStr);
  const todayTotalSecs=todaySessions.reduce((a,c)=>a+c.durationSeconds,0);
  const todayMins=Math.floor(todayTotalSecs/60);
  document.getElementById('dash-today-time').textContent=formatDurationDisplay(todayMins);
  const oneWeekAgo=new Date();oneWeekAgo.setDate(oneWeekAgo.getDate()-6);const weekStr=getLocalDateString(oneWeekAgo);
  const weekSecs=appState.studySessions.filter(s=>s.date>=weekStr).reduce((a,c)=>a+c.durationSeconds,0);
  document.getElementById('dash-week-time').textContent=formatDurationDisplay(Math.floor(weekSecs/60));
  document.getElementById('dash-diary-count').textContent=appState.diaries.length;

  const goal=appState.settings.dailyGoalMinutes||120;
  document.getElementById('dash-goal-text').textContent=`Mục tiêu: ${goal} phút`;
  let pct=Math.min(Math.round((todayMins/goal)*100),100);if(isNaN(pct))pct=0;
  document.getElementById('dash-goal-circle').style.strokeDashoffset=283-(pct/100)*283;
  document.getElementById('dash-goal-percent').textContent=`${pct}%`;
  const left=goal-todayMins;
  document.getElementById('dash-goal-minutes-left').textContent=left>0?`Cần thêm ${left}m`:'Đạt mục tiêu!';
  
  const teapotContainer = document.getElementById('dash-teapot-svg-container');
  if (teapotContainer && typeof window.getTeapotSkinSVG === 'function') {
    teapotContainer.innerHTML = window.getTeapotSkinSVG(appState.selectedSkin || 'default');
    if (timerStatus === 'running') {
      teapotContainer.style.transform = 'scale(1.08)';
    } else {
      teapotContainer.style.transform = 'scale(1)';
    }
  }
  const badge=document.getElementById('dash-goal-badge');
  const enc=document.getElementById('dash-goal-encouragement');
  if(pct>=100){badge.textContent='Hoàn thành!';badge.className='status-badge completed';enc.textContent='Tuyệt vời! Chị đã hoàn thành mục tiêu hôm nay. Gute Arbeit!';}
  else{badge.textContent='Đang ủ trà';badge.className='status-badge';enc.textContent=pct>50?'Nước sắp sôi rồi, cố lên!':'Hãy chọn một túi trà để bắt đầu nhé!';}

  renderDashboardTodos();

  const hasDiary=appState.diaries.some(d=>d.date===todayStr);
  const dot=document.getElementById('dash-diary-status-dot');
  const box=document.getElementById('dash-diary-status-box');
  if(hasDiary){dot.className='status-dot completed';box.innerHTML=`<p style="color:var(--success);font-weight:600;">Hôm nay chị đã viết nhật ký rồi!</p><button class="btn btn-secondary btn-sm" id="dash-view-diary-btn"><i data-lucide="eye"></i> Xem</button>`;document.getElementById('dash-view-diary-btn').addEventListener('click',()=>{document.querySelector('.menu-item[data-tab="diary"]').click();});}
  else{dot.className='status-dot';box.innerHTML=`<p>Hôm nay chị chưa viết nhật ký.</p><button class="btn btn-primary" id="dash-write-now-btn"><i data-lucide="pen-tool"></i> Viết ngay</button>`;document.getElementById('dash-write-now-btn').addEventListener('click',()=>{document.querySelector('.menu-item[data-tab="diary"]').click();});}
  renderDashboardBookDecor();
  lucide.createIcons();
}

function getVintageDecorSVG(type, size = 50) {
  if (type === 'teapot') {
    return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <!-- Handle -->
      <path d="M 18 34 C 10 34, 8 22, 16 18 C 18 17, 20 19, 20 20" fill="none" stroke="#b07d62" stroke-width="3" stroke-linecap="round"/>
      <!-- Spout -->
      <path d="M 46 32 Q 54 24, 56 16 Q 52 16, 44 24" fill="none" stroke="#b07d62" stroke-width="3" stroke-linecap="round"/>
      <!-- Body -->
      <path d="M 18 34 C 18 20, 46 20, 46 34 C 46 46, 18 46, 18 34 Z" fill="#faf0e6" stroke="#b07d62" stroke-width="2"/>
      <!-- Lid -->
      <path d="M 24 20 Q 32 15, 40 20 L 38 17 H 26 Z" fill="#faf0e6" stroke="#b07d62" stroke-width="2"/>
      <circle cx="32" cy="15" r="2.5" fill="#b07d62"/>
      <!-- Base -->
      <path d="M 26 44 L 28 47 H 36 L 38 44 Z" fill="#b07d62"/>
      <!-- Red Floral Details -->
      <circle cx="28" cy="32" r="2" fill="#d62828"/>
      <circle cx="36" cy="32" r="2" fill="#d62828"/>
      <circle cx="32" cy="36" r="2.5" fill="#d62828"/>
      <path d="M 32 30 Q 32 38, 32 40" fill="none" stroke="#606c38" stroke-width="1"/>
    </svg>`;
  }
  if (type === 'plate') {
    return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <!-- Outer Plate shadow and body -->
      <circle cx="32" cy="32" r="24" fill="#faf0e6" stroke="#e07a5f" stroke-width="2.5"/>
      <circle cx="32" cy="32" r="16" fill="none" stroke="#ffb3c1" stroke-dasharray="2,2" stroke-width="1"/>
      <!-- Cherry / Strawberry in center -->
      <path d="M 28 32 C 26 30, 24 34, 28 36 C 32 34, 30 30, 28 32 Z" fill="#e76f51"/>
      <path d="M 34 33 C 32 31, 30 35, 34 37 C 38 35, 36 31, 34 33 Z" fill="#e76f51"/>
      <!-- Stem -->
      <path d="M 28 32 Q 31 24, 34 33" fill="none" stroke="#4a6547" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`;
  }
  if (type === 'candle') {
    return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <!-- Black Stand -->
      <path d="M 20 48 L 44 48 M 24 48 L 28 38 L 36 38 L 40 48 Z" fill="#2b2d42" stroke="#1d1e2c" stroke-width="1"/>
      <path d="M 30 38 L 30 30 H 34 L 34 38 Z" fill="#2b2d42"/>
      <path d="M 22 30 H 42 L 39 32 H 25 Z" fill="#2b2d42"/>
      <!-- Candle body -->
      <rect x="27" y="16" width="10" height="14" fill="#faf0e6" rx="1"/>
      <!-- Melted wax drips -->
      <path d="M 27 18 Q 29 23, 29 20 Q 32 24, 33 19" fill="none" stroke="#eae4db" stroke-width="1.5"/>
      <!-- Wick -->
      <line x1="32" y1="16" x2="32" y2="12" stroke="#2b2d42" stroke-width="1.5"/>
      <!-- Flame -->
      <path d="M 32 12 C 30 10, 30 6, 32 2 C 34 6, 34 10, 32 12 Z" fill="#f4a261" opacity="0.9"/>
      <path d="M 32 11 C 31 9, 31 7, 32 4 C 33 7, 33 9, 32 11 Z" fill="#e76f51" opacity="0.95"/>
    </svg>`;
  }
  if (type === 'vase') {
    return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <!-- Vase body -->
      <path d="M 24 16 L 40 16 C 40 16, 38 24, 44 32 C 50 40, 42 48, 32 48 C 22 48, 14 40, 20 32 C 26 24, 24 16, 24 16 Z" fill="#f4f1de" stroke="#c8c2ae" stroke-width="1.5"/>
      <!-- Lips -->
      <ellipse cx="32" cy="16" rx="8" ry="2" fill="#e6e1cd" stroke="#c8c2ae" stroke-width="1"/>
      <!-- Base -->
      <ellipse cx="32" cy="48" rx="8" ry="2" fill="#c8c2ae"/>
      <!-- Pink Hearts -->
      <path d="M 32 34 C 30 32, 28 32, 28 34 C 28 36, 32 39, 32 39 C 32 39, 36 36, 36 34 C 36 32, 34 32, 32 34 Z" fill="#e5989b"/>
    </svg>`;
  }
  return '';
}

let activeTodoTab = 'today';

function isDateInThisWeek(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  d.setHours(0,0,0,0);
  const today = new Date();
  today.setHours(0,0,0,0);
  const diffTime = d - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= -7 && diffDays <= 7;
}

function getPastelColorForTag(tag) {
  if (!tag) return 'var(--bg-card)';
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 55%, 94%)`;
}

function renderDashboardTodos(){
  const todayStr=getLocalDateString();
  const container=document.getElementById('dash-todo-list');
  if (!container) return;
  container.innerHTML='';

  let filtered = appState.todos;
  if (activeTodoTab === 'today') {
    filtered = appState.todos.filter(t => t.date === todayStr || t.dueDate === todayStr);
  } else if (activeTodoTab === 'week') {
    filtered = appState.todos.filter(t => isDateInThisWeek(t.date) || isDateInThisWeek(t.dueDate));
  }

  if(filtered.length===0){
    container.innerHTML='<p style="padding:1rem;text-align:center;color:var(--text-muted);font-size:0.85rem;">Không có nhiệm vụ nào.</p>';
    return;
  }

  filtered.forEach(todo=>{
    const li=document.createElement('li');
    li.className=`todo-item ${todo.completed?'completed':''}`;
    const bgColor = todo.tag ? getPastelColorForTag(todo.tag) : 'var(--bg-card)';
    li.style.cssText = `display:flex; align-items:center; justify-content:space-between; padding:0.65rem 0.75rem; margin-bottom:0.5rem; border-radius:6px; border:1px solid var(--border-color); background:${bgColor};`;
    
    let dueHTML = '';
    if (todo.dueDate) {
      const isOverdue = !todo.completed && todo.dueDate < todayStr;
      dueHTML = `<span style="font-size:0.7rem; padding:1px 4px; border-radius:3px; margin-left:0.5rem; ${isOverdue ? 'background-color:var(--danger); color:white; font-weight:700;' : 'background-color:var(--bg-sidebar); color:var(--text-muted);'}">Hạn: ${todo.dueDate} ${isOverdue ? '[Quá Hạn]' : ''}</span>`;
    }

    let tagHTML = '';
    if (todo.tag) {
      tagHTML = `<span style="font-size:0.65rem; background-color:rgba(0,0,0,0.05); border:1px solid rgba(0,0,0,0.1); padding:2px 5px; border-radius:4px; font-weight:700; color:var(--text-main);">${todo.tag}</span>`;
    }

    const learnBtnHTML = !todo.completed 
      ? `<button class="btn btn-secondary btn-sm btn-todo-learn" data-id="${todo.id}" style="padding:0.25rem 0.5rem; font-size:0.75rem; display:inline-flex; align-items:center; gap:0.25rem; font-weight:700; color:var(--primary); margin-left:auto; margin-right:0.5rem;"><i data-lucide="play" style="width:12px;height:12px;"></i> Học</button>`
      : '';
    
    li.innerHTML = `
      <div class="todo-item-left" data-id="${todo.id}" style="display:flex; align-items:center; gap:0.5rem; flex:1; cursor:pointer;">
        <span class="todo-checkbox-container">${window.getTodoFlowerSVG(todo.completed)}</span>
        <div style="display:flex; flex-direction:column; gap:0.15rem;">
          <span class="todo-text" style="font-weight:700; font-size:0.9rem; color:var(--text-main);">${todo.text}</span>
          <div style="display:flex; align-items:center; gap:0.35rem; flex-wrap:wrap;">
            ${tagHTML}
            ${dueHTML}
          </div>
        </div>
      </div>
      ${learnBtnHTML}
      <button class="btn-todo-delete" data-id="${todo.id}" style="background:none; border:none; cursor:pointer; color:var(--text-muted); padding:0.2rem; display:flex; align-items:center; justify-content:center;"><i data-lucide="trash-2" style="width:16px;height:16px;"></i></button>
    `;

    li.querySelector('.todo-item-left').addEventListener('click',(e)=>toggleTodo(todo.id, e));
    if (!todo.completed) {
      li.querySelector('.btn-todo-learn').addEventListener('click', e => {
        e.stopPropagation();
        startStudySessionFromTodo(todo.id);
      });
    }
    li.querySelector('.btn-todo-delete').addEventListener('click',e=>{e.stopPropagation();deleteTodo(todo.id);});
    container.appendChild(li);
  });
  lucide.createIcons();
}

function addDashboardTodo(){
  const input=document.getElementById('dash-new-todo-input');
  const text=input.value.trim();
  if(!text)return;
  
  const rawTag = document.getElementById('todo-input-tag').value.trim();
  let tag = '';
  if (rawTag) {
    tag = rawTag.startsWith('#') ? rawTag : '#' + rawTag;
  }
  const due = document.getElementById('todo-input-due').value || '';
  
  appState.todos.push({
    id: 'todo-' + Date.now(),
    text: text,
    completed: false,
    date: getLocalDateString(),
    tag: tag,
    dueDate: due
  });
  
  saveState();
  input.value='';
  document.getElementById('todo-input-tag').value = '';
  document.getElementById('todo-input-due').value = '';
  document.getElementById('dash-todo-input-row').classList.add('hidden');
  refreshDashboard();
  checkAndLogActivityToday();
}

window.triggerCheckboxSparkles = function(rect) {
  const colors = ['#fbbf24', '#ffb3c1', '#a3b18a', '#eae1d2', '#ff758f'];
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;
  const centerX = rect.left + rect.width / 2 + scrollX;
  const centerY = rect.top + rect.height / 2 + scrollY;

  for (let i = 0; i < 8; i++) {
    const sp = document.createElement('span');
    sp.innerHTML = '✦';
    sp.style.cssText = `
      position: absolute;
      color: ${colors[Math.floor(Math.random()*colors.length)]};
      font-size: ${10 + Math.random()*6}px;
      pointer-events: none;
      left: ${centerX}px;
      top: ${centerY}px;
      transform: translate(-50%, -50%) scale(1);
      transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
      z-index: 99999;
    `;
    document.body.appendChild(sp);
    
    const angle = (i / 8) * 360 * (Math.PI / 180);
    const dist = 18 + Math.random() * 15;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;
    
    setTimeout(() => {
      sp.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`;
      sp.style.opacity = '0';
    }, 20);
    
    setTimeout(() => {
      sp.remove();
    }, 600);
  }
};

function toggleTodo(id, event){
  const i=appState.todos.findIndex(t=>t.id===id);
  if(i!==-1){
    const willBeCompleted = !appState.todos[i].completed;
    if (willBeCompleted) {
      if (typeof window.playBloomSound === 'function') {
        window.playBloomSound();
      }
      if (event) {
        const itemLeft = event.currentTarget;
        const checkbox = itemLeft.querySelector('.todo-checkbox-flower');
        if (checkbox) {
          const rect = checkbox.getBoundingClientRect();
          triggerCheckboxSparkles(rect);
        }
      }
    }
    appState.todos[i].completed=willBeCompleted;
    saveState();
    refreshDashboard();
    renderTimerTodoList();
    if (typeof refreshAnalytics === 'function') refreshAnalytics();
  }
}
function deleteTodo(id){
  appState.todos=appState.todos.filter(t=>t.id!==id);
  saveState();
  refreshDashboard();
  renderTimerTodoList();
  if (typeof refreshAnalytics === 'function') refreshAnalytics();
}


// =============================================
//  TIMER (TAB 2) — TEA BAG SELECTION + BREWING
// =============================================
function initTimer() {
  refreshTimerSubjects();
  renderTeaBagGrid();

  // Mode toggle
  document.querySelectorAll('.timer-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const selectMode = () => {
        fullResetTimer();
        document.querySelectorAll('.timer-mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        timerMode = btn.getAttribute('data-mode');

                if (timerMode === 'teabag') {
          document.getElementById('tea-bag-selection').classList.remove('hidden');
          document.getElementById('timer-clock-text').textContent = '--:--';
          document.getElementById('timer-clock-label').textContent = 'Chọn túi trà để bắt đầu';
          document.getElementById('brew-reward-info').innerHTML = '<span>Chọn một túi trà yêu thích!</span>';
          document.getElementById('timer-active-task').style.display = 'none';
        } else if (timerMode === 'pomodoro') {
          document.getElementById('tea-bag-selection').classList.add('hidden');
          const workMins = appState.settings.pomoWorkMinutes || 25;
          timeRemaining = workMins * 60;
          totalTimerDuration = timeRemaining;
          pomoStage = 'study';
          document.getElementById('timer-clock-text').textContent = formatTimeDisplay(timeRemaining);
          document.getElementById('timer-clock-label').textContent = 'POMODORO — PHIÊN HỌC #' + (pomoCompletedCycles + 1);
          document.getElementById('brew-reward-info').innerHTML = '<span>Chu kỳ Pomodoro #' + (pomoCompletedCycles + 1) + '. Hoàn thành chu kỳ nhân đôi điểm!</span>';
          updateTimerActiveTaskUI();
        } else {
          document.getElementById('tea-bag-selection').classList.add('hidden');
          stopwatchSeconds = 0;
          document.getElementById('timer-clock-text').textContent = '00:00';
          document.getElementById('timer-clock-label').textContent = 'STOPWATCH — HỌC TỰ DO';
          document.getElementById('brew-reward-info').innerHTML = '<span>Bấm Play để bắt đầu học tự do.</span>';
          document.getElementById('timer-active-task').style.display = 'none';
        }

      };

      if (timerStatus === 'running') {
        customConfirm('Đang ngâm trà, chuyển chế độ sẽ hủy phiên hiện tại. Tiếp tục?').then(confirmed => {
          if (confirmed) selectMode();
        });
      } else {
        selectMode();
      }
    });
  });

  // Play / Pause
  document.getElementById('timer-play-btn').addEventListener('click', () => {
    if (timerStatus === 'idle' || timerStatus === 'paused') {
      startTimer();
    } else {
      if (timerMode === 'pomodoro' && pomoStage === 'study') {
        customAlert('KhÃ´ng thá»ƒ táº¡m dá»«ng trong chu ká»³ Pomodoro!');
        return;
      }
      pauseTimer();
    }
  });

  // Reset
  document.getElementById('timer-reset-btn').addEventListener('click', () => {
    if (timerStatus === 'running' || timerStatus === 'paused') {
      if (timerMode === 'stopwatch' && stopwatchSeconds >= 10) {
        customConfirm('Lưu phiên học hiện tại?').then(save => {
          if (save) {
            saveStudySession(stopwatchSeconds, 'stopwatch');
          }
          fullResetTimer();
        });
        return;
      }
    }
    fullResetTimer();
  });

  // Give up
    document.getElementById('timer-giveup-btn').addEventListener('click', () => {
    let msg = 'Bỏ cuộc?';
    if (timerMode === 'pomodoro' && pomoStage === 'study' && appState.settings.pomoStrictness === 'hard') {
      msg = 'Bỏ cuộc? Chị đang trong chế độ NGHIÊM KHẮC, ấm trà sẽ bị hỏng và chị sẽ bị trừ 10 đồng xu cổ!';
    } else {
      msg = 'Bỏ cuộc? Túi trà sẽ bị lãng phí và không nhận được đồng xu cổ thưởng.';
    }
    customConfirm(msg).then(giveup => {
      if (giveup) {
        if (timerMode === 'pomodoro' && pomoStage === 'study') {
          if (appState.settings.pomoStrictness === 'hard') {
            appState.teaPoints = Math.max(0, appState.teaPoints - 10);
            saveState();
            try {
              document.getElementById('nav-tea-points').textContent = appState.teaPoints;
              if (document.getElementById('shop-user-points')) {
                document.getElementById('shop-user-points').textContent = appState.teaPoints;
              }
            } catch(e){}
            playSadSound();
            customAlert('Ấm trà đã bị hỏng! Chị bị trừ 10 đồng xu cổ vì bỏ cuộc giữa chừng.');
          }
        }
        fullResetTimer();
      }
    });
  });


  // Vinyl player
  document.querySelectorAll('.track-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sound = btn.getAttribute('data-sound');
      const isPlaying = document.querySelector('.vinyl-player-card').classList.contains('playing');
      stopActiveAmbientSound();
      document.querySelectorAll('.track-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentActiveMusicId = sound;
      document.getElementById('vinyl-label-text').textContent = btn.textContent.substring(0, 7);
      if (isPlaying) startActiveAmbientSound(sound);
    });
  });
  document.getElementById('vinyl-disc').addEventListener('click', () => toggleVinylPlayback());

  // Timer todo
  document.getElementById('timer-add-todo').addEventListener('click', () => addTimerTodo());
  document.getElementById('timer-new-todo').addEventListener('keydown', e => { if (e.key === 'Enter') addTimerTodo(); });
  renderTimerTodoList();
  updateTimerSessionCountUI();
}

function refreshTimerSubjects() {
  const sel = document.getElementById('timer-subject');
  if(!sel) return;
  sel.innerHTML = '';
  appState.subjects.forEach(sub => {
    const opt = document.createElement('option');
    opt.value = sub.id;
    opt.textContent = sub.name;
    sel.appendChild(opt);
  });
}

function renderTeaBagGrid() {
  const grid = document.getElementById('tea-bag-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const allDrinks = [...TEA_BAGS];
  if (appState.unlockedDrinks) {
    BOUTIQUE_DRINKS.forEach(bd => {
      if (appState.unlockedDrinks.includes(bd.id)) {
        allDrinks.push(bd);
      }
    });
  }

  allDrinks.forEach(tb => {
    const card = document.createElement('div');
    card.className = `tea-bag-card ${selectedTeaBagId === tb.id ? 'selected' : ''}`;
    card.dataset.id = tb.id;
    card.innerHTML = `
      <div class="tea-bag-svg-wrapper">${getTeaBagSVG(tb, 56)}</div>
      <span class="tea-bag-card-name">${tb.nameVi}</span>
      <span class="tea-bag-card-german">${tb.name}</span>
      <span class="tea-bag-card-duration">${tb.minutes} phút</span>
      <div class="tea-bag-card-reward"><img src="${tb.cupImage}" alt="${tb.nameVi}" class="tea-bag-reward-img" style="object-fit:contain;">+${tb.points} điểm</div>
    `;
    card.addEventListener('click', () => selectTeaBag(tb.id));
    grid.appendChild(card);
  });
}

function selectTeaBag(tbId) {
  if (timerStatus === 'running') return;
  selectedTeaBagId = tbId;
  const tb = TEA_BAGS.find(t => t.id === tbId) || BOUTIQUE_DRINKS.find(t => t.id === tbId);
  if (!tb) return;

  document.querySelectorAll('.tea-bag-card').forEach(c => {
    c.classList.toggle('selected', c.dataset.id === tbId);
  });

  timeRemaining = tb.minutes * 60;
  totalTimerDuration = tb.minutes * 60;
  document.getElementById('timer-clock-text').textContent = formatTimeDisplay(timeRemaining);
  document.getElementById('timer-clock-label').textContent = tb.name;
  document.getElementById('brew-reward-info').innerHTML = `Ngâm xong <b>${tb.minutes} phút</b> sẽ nhận 1 <b>Tách ${tb.nameVi}</b> (+${tb.points} Đồng xu cổ)`;
}

function startTimer() {
  if (timerMode === 'teabag' && !selectedTeaBagId) {
    customAlert('Vui lòng chọn một túi trà trước khi bắt đầu!');
    return;
  }

  timerStatus = 'running';
  
  if (typeof window.playMechanicalClickSound === 'function') {
    window.playMechanicalClickSound();
  }
  if (typeof window.playSandTrickle === 'function') {
    window.playSandTrickle(true);
  }

  // Trigger 3D Hourglass Flip
  const hg = document.querySelector('.vintage-hourglass-container');
  if (hg) {
    hg.classList.add('flipping');
    setTimeout(() => hg.classList.remove('flipping'), 1200);
  }

  // Show brewing scene, hide tea bag grid
  document.getElementById('tea-bag-selection').classList.add('hidden');
  document.getElementById('brewing-scene').classList.remove('hidden');

  // Update play button to pause
  const playBtn = document.getElementById('timer-play-btn');
  playBtn.innerHTML = '<i data-lucide="pause"></i>';
  document.getElementById('timer-giveup-btn').classList.remove('hidden');
  lucide.createIcons();

  // Render the initial brewing scene
  const currentTb = timerMode === 'teabag'
    ? (TEA_BAGS.find(t => t.id === selectedTeaBagId) || BOUTIQUE_DRINKS.find(t => t.id === selectedTeaBagId))
    : TEA_BAGS[2]; // Default to Schwarzer Tee for stopwatch

  renderBrewingScene(currentTb, 0);

  // Animate tea bag entrance + splash sound
  setTimeout(() => {
    const tbGroup = document.getElementById('brewing-teabag-anim');
    if (tbGroup) tbGroup.classList.add('visible');
    playSplashSound();
    playTeaPouringSound();
  }, 300);

  // Start bubbles
  startBubbles();

  // Start ticking interval
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (timerStatus !== 'running') return;

    if (timerMode === 'teabag') {
      timeRemaining--;
      if (timeRemaining <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        timerStatus = 'idle';
        const tb = TEA_BAGS.find(t => t.id === selectedTeaBagId) || BOUTIQUE_DRINKS.find(t => t.id === selectedTeaBagId);
        saveStudySession(totalTimerDuration, 'teabag', tb);
        triggerCatStretch();
        triggerSandFlowerBloom();
        playWindChime();
        fullResetTimer();
      } else {
        document.getElementById('timer-clock-text').textContent = formatTimeDisplay(timeRemaining);
        const pct = ((totalTimerDuration - timeRemaining) / totalTimerDuration) * 100;
        renderBrewingScene(currentTb, pct);
      }
    } else if (timerMode === 'pomodoro') {
      timeRemaining--;
      if (timeRemaining <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        timerStatus = 'idle';

        if (pomoStage === 'study') {
          saveStudySession(totalTimerDuration, 'pomodoro');
          pomoCompletedCycles++;
          triggerCatStretch();
          triggerSandFlowerBloom();
          playWindChime();

          // Kích hoạt màu hoàng hôn ấm áp và thông báo vươn vai
          const sunset = document.getElementById('sunset-overlay');
          if (sunset) sunset.classList.add('active');
          customAlert('Đã hoàn thành phiên học! Đến giờ nghỉ ngơi rồi chị ơi. Hãy đứng dậy vươn vai, ra vườn hít thở hoặc nhấp một ngụm nước ấm nhé! 🍵');

          const isLong = (pomoCompletedCycles % (appState.settings.pomoCycleCount || 4) === 0);
          pomoStage = isLong ? 'long_break' : 'short_break';
          const breakMins = isLong
            ? (appState.settings.pomoLongBreakMinutes || 15)
            : (appState.settings.pomoShortBreakMinutes || 5);
          timeRemaining = breakMins * 60;
          totalTimerDuration = timeRemaining;

          if (appState.settings.pomoAutostart) {
            startTimer();
          } else {
            fullResetTimer();
          }
        } else {
          // Break finished
          const sunset = document.getElementById('sunset-overlay');
          if (sunset) sunset.classList.remove('active');
          
          pomoStage = 'study';
          const workMins = appState.settings.pomoWorkMinutes || 25;
          timeRemaining = workMins * 60;
          totalTimerDuration = timeRemaining;
          playWindChime();
          customAlert('Hết giờ nghỉ! Chị bắt đầu phiên học tiếp theo nhé. Los geht\'s!');
          if (appState.settings.pomoAutostart) {
            startTimer();
          } else {
            fullResetTimer();
          }
        }
      } else {
        document.getElementById('timer-clock-text').textContent = formatTimeDisplay(timeRemaining);
        const pct = ((totalTimerDuration - timeRemaining) / totalTimerDuration) * 100;
        renderBrewingScene(currentTb, pct);
      }
    } else if (timerMode === 'stopwatch') {
      stopwatchSeconds++;
      document.getElementById('timer-clock-text').textContent = formatTimeDisplay(stopwatchSeconds);
      const pct = Math.min(100, (stopwatchSeconds / 3600) * 100);
      renderBrewingScene(currentTb, pct);
    }
  }, 1000);
}

function fullResetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timerStatus = 'idle';
  stopBubbles();
  
  if (typeof window.playSandTrickle === 'function') {
    window.playSandTrickle(false);
  }
  if (typeof window.playMechanicalClickSound === 'function') {
    window.playMechanicalClickSound();
  }

  const sunset = document.getElementById('sunset-overlay');
  if (sunset) sunset.classList.remove('active');

  // Reset vintage hourglass state
  updateHourglass(0, false, false);

  // Show selection, hide brewing
  document.getElementById('tea-bag-selection').classList.remove('hidden');
  document.getElementById('brewing-scene').classList.add('hidden');
  document.getElementById('timer-giveup-btn').classList.add('hidden');

  const playBtn = document.getElementById('timer-play-btn');
  playBtn.innerHTML = '<i data-lucide="play"></i>';
  playBtn.className = 'btn btn-primary btn-circle-lg';
  lucide.createIcons();

          if (timerMode === 'teabag') {
          document.getElementById('tea-bag-selection').classList.remove('hidden');
          document.getElementById('timer-clock-text').textContent = '--:--';
          document.getElementById('timer-clock-label').textContent = 'Chọn túi trà để bắt đầu';
          document.getElementById('brew-reward-info').innerHTML = '<span>Chọn một túi trà yêu thích!</span>';
          document.getElementById('timer-active-task').style.display = 'none';
        } else if (timerMode === 'pomodoro') {
          document.getElementById('tea-bag-selection').classList.add('hidden');
          const workMins = appState.settings.pomoWorkMinutes || 25;
          timeRemaining = workMins * 60;
          totalTimerDuration = timeRemaining;
          pomoStage = 'study';
          document.getElementById('timer-clock-text').textContent = formatTimeDisplay(timeRemaining);
          document.getElementById('timer-clock-label').textContent = 'POMODORO — PHIÊN HỌC #' + (pomoCompletedCycles + 1);
          document.getElementById('brew-reward-info').innerHTML = '<span>Chu kỳ Pomodoro #' + (pomoCompletedCycles + 1) + '. Hoàn thành chu kỳ nhân đôi điểm!</span>';
          updateTimerActiveTaskUI();
        } else {
          document.getElementById('tea-bag-selection').classList.add('hidden');
          stopwatchSeconds = 0;
          document.getElementById('timer-clock-text').textContent = '00:00';
          document.getElementById('timer-clock-label').textContent = 'STOPWATCH — HỌC TỰ DO';
          document.getElementById('brew-reward-info').innerHTML = '<span>Bấm Play để bắt đầu học tự do.</span>';
          document.getElementById('timer-active-task').style.display = 'none';
        }


  renderTeaBagGrid();
}

function saveStudySession(durationSecs, type, teaBag) {
  const rawTag = document.getElementById('timer-focus-tag').value.trim();
  let tag = 'Chung';
  if (rawTag) {
    tag = rawTag.startsWith('#') ? rawTag : '#' + rawTag;
  }
  const todayStr = getLocalDateString();

  appState.studySessions.push({
    id: 'session-' + Date.now(),
    date: todayStr,
    tag: tag,
    durationSeconds: durationSecs,
    type: type,
    taskId: activeTaskId
  });

  // Determine cup type for cabinet
  let cupType = 'green';
  if (teaBag) {
    cupType = teaBag.cupType;
  } else {
    // Stopwatch mode: determine by duration
    const mins = durationSecs / 60;
    if (mins >= 60) cupType = 'royal';
    else if (mins >= 30) cupType = 'rose';
    else if (mins >= 15) cupType = 'black';
  }

  // Update daily tea cabinet
  let ci = appState.dailyTeaCabinet.findIndex(c => c.date === todayStr);
  if (ci === -1) {
    appState.dailyTeaCabinet.push({ date: todayStr, green: 0, black: 0, rose: 0, royal: 0 });
    ci = appState.dailyTeaCabinet.length - 1;
  }
  appState.dailyTeaCabinet[ci][cupType] += 1;
  justAddedCupType = cupType;

  // Add tea points
  let pts = teaBag ? teaBag.points : getStopwatchTeaBag(durationSecs).points;
  if (type === 'pomodoro') {
    pts = 3;
    if (appState.settings.pomoStrictness === 'hard') {
      pts = 6;
    }
  }
  appState.teaPoints += pts;

  saveState();
  triggerCelebrationEffect();
  document.getElementById('nav-tea-points').textContent = appState.teaPoints;

  const tbName = teaBag ? teaBag.nameVi : (type === 'pomodoro' ? 'Pomodoro' : getStopwatchTeaBag(durationSecs).nameVi);
  customAlert(`Gute Arbeit! Chị đã ủ thành công 1 Tách ${tbName} và nhận +${pts} Đồng xu cổ!`);

  refreshDashboard();
  refreshSettings();
  updateTimerSessionCountUI();
  checkAndLogActivityToday();
}

function updateTimerSessionCountUI() {
  const todayStr = getLocalDateString();
  const cab = appState.dailyTeaCabinet.find(c => c.date === todayStr) || { green: 0, black: 0, rose: 0, royal: 0 };
  const total = cab.green + cab.black + cab.rose + cab.royal;
  document.getElementById('timer-session-count').textContent = `Hôm nay chị đã ủ thành công: ${total} tách trà`;
}

function pauseTimer() {
  timerStatus = 'paused';
  stopBubbles();
  
  if (typeof window.playSandTrickle === 'function') {
    window.playSandTrickle(false);
  }
  if (typeof window.playMechanicalClickSound === 'function') {
    window.playMechanicalClickSound();
  }
  
  const playBtn = document.getElementById('timer-play-btn');
  playBtn.innerHTML = '<i data-lucide="play"></i>';
  lucide.createIcons();
  
  const currentTb = timerMode === 'teabag'
    ? (TEA_BAGS.find(t => t.id === selectedTeaBagId) || BOUTIQUE_DRINKS.find(t => t.id === selectedTeaBagId))
    : TEA_BAGS[2];
  const pct = timerMode === 'teabag' || timerMode === 'pomodoro'
    ? ((totalTimerDuration - timeRemaining) / totalTimerDuration) * 100
    : Math.min(100, (stopwatchSeconds / 3600) * 100);
    
  renderBrewingScene(currentTb, pct);
}

function triggerCatStretch() {
  const closedEyes = document.getElementById('cat-eyes-closed');
  const openEyes = document.getElementById('cat-eyes-open');
  if (closedEyes && openEyes) {
    // Mở mắt liếc lên nhìn bướm bay
    closedEyes.classList.add('hidden');
    openEyes.classList.remove('hidden');
    
    // Tạm thời ẩn hiệu ứng ngủ ngáy Zzz
    const zzzs = document.querySelectorAll('.cat-zzz');
    zzzs.forEach(z => z.style.display = 'none');
    
    setTimeout(() => {
      // Nhắm mắt đi ngủ tiếp
      closedEyes.classList.remove('hidden');
      openEyes.classList.add('hidden');
      zzzs.forEach(z => z.style.display = 'block');
    }, 4000);
  }
}

function triggerSandFlowerBloom() {
  const flower = document.getElementById('hourglass-flower');
  if (flower) {
    flower.classList.add('blooming');
    setTimeout(() => {
      flower.classList.remove('blooming');
    }, 6000);
  }
}


// --- MUSIC ---
let vinylRotationAngle = 0;
let vinylRotationSpeed = 0;
let vinylTargetSpeed = 0;
let vinylAnimationId = null;

function animateVinyl() {
  vinylRotationSpeed += (vinylTargetSpeed - vinylRotationSpeed) * 0.05;
  
  let currentStep = vinylRotationSpeed;
  const skin = document.documentElement.getAttribute('data-skin') || 'default';
  if (skin === 'kaiserin-rose' && vinylTargetSpeed > 0) {
    // Mechanical wind-up spring wobble: speed modulates periodically using a sine wave
    const factor = 1 + Math.sin(Date.now() / 600) * 0.22; // speed varies smoothly between 78% and 122%
    currentStep = vinylRotationSpeed * factor;
  }
  
  vinylRotationAngle = (vinylRotationAngle + currentStep) % 360;
  
  const disc = document.getElementById('vinyl-disc');
  if (disc) {
    disc.style.transform = `rotate(${vinylRotationAngle}deg)`;
  }
  
  if (vinylRotationSpeed > 0.01 || vinylTargetSpeed > 0) {
    vinylAnimationId = requestAnimationFrame(animateVinyl);
  } else {
    vinylAnimationId = null;
  }
}

window.toggleVinylPlayback = function() {
  const card = document.querySelector('.vinyl-player-card');
  const st = document.getElementById('vinyl-status-text');
  if (!card) return;
  const isP = card.classList.contains('playing');
  
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  
  if (isP) {
    stopActiveAmbientSound();
    card.classList.remove('playing');
    st.textContent = 'Trạng thái: Đang tắt nhạc';
    vinylTargetSpeed = 0;
  } else {
    startActiveAmbientSound(currentActiveMusicId);
    card.classList.add('playing');
    const tr = BOUTIQUE_MUSIC.find(m => m.id === currentActiveMusicId) || { name: 'Nhạc nền' };
    st.textContent = `Trạng thái: Đang phát ${tr.name}`;
    vinylTargetSpeed = 1.5;
    if (!vinylAnimationId) {
      animateVinyl();
    }
  }
};
function startActiveAmbientSound(sid){
  const track = BOUTIQUE_MUSIC.find(m => m.id === sid);
  if (track && track.src) {
    playAmbientMusicFile(track.src);
  }
}
function stopActiveAmbientSound(){
  stopAmbientMusicFile();
}

window.getTodoFlowerSVG = function(completed) {
  const skin = document.documentElement.getAttribute('data-skin') || 'lilac-birch';
  const bloomedClass = completed ? 'bloomed' : '';
  
  if (skin === 'forest-moss') {
    // Pine Needle Checkbox
    const pineColor = completed ? '#396153' : '#B08F7A';
    return `
      <svg class="todo-checkbox-flower pine-needle ${bloomedClass}" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="none" stroke="${pineColor}" stroke-width="1" opacity="0.6"/>
        <path d="M12 18 V6" stroke="${pineColor}" stroke-width="1.5" stroke-linecap="round"></path>
        <path d="M12 8 Q7 6, 6 6 M12 8 Q17 6, 18 6" stroke="${pineColor}" stroke-width="1" stroke-linecap="round" opacity="0.85"></path>
        <path d="M12 11 Q6 9, 5 9 M12 11 Q18 9, 19 9" stroke="${pineColor}" stroke-width="1" stroke-linecap="round" opacity="0.85"></path>
        <path d="M12 14 Q5 12, 4 12 M12 14 Q19 12, 20 12" stroke="${pineColor}" stroke-width="1" stroke-linecap="round" opacity="0.85"></path>
        <path d="M12 17 Q4 15, 3 15 M12 17 Q20 15, 21 15" stroke="${pineColor}" stroke-width="1" stroke-linecap="round" opacity="0.85"></path>
        <path class="flower-tick" d="M9 12.5l2.5 2.5l4.5-5" stroke="#E4E8B8" stroke-width="1.5" stroke-linecap="round" fill="none"></path>
      </svg>
    `;
  } else if (skin === 'kaiserin-rose') {
    // Nordic Wild Rose Checkbox
    return `
      <svg class="todo-checkbox-flower rose-flower ${bloomedClass}" viewBox="0 0 24 24">
        <!-- Outer oak ring container -->
        <circle cx="12" cy="12" r="10" fill="none" stroke="#795138" stroke-width="1.2"/>
        <!-- Stem and leaves -->
        <path class="flower-stem" d="M12 14v5" stroke="#795138" stroke-width="1.2" stroke-linecap="round"></path>
        <path class="flower-leaves" d="M10 16.5c-1 0-1.8-0.5-1.8-0.5s0.5-1 1.8-0.5" fill="#795138"></path>
        <!-- Petals (Nordic Rose style) -->
        <g class="flower-petals">
          <circle cx="12" cy="11.5" r="4.2" class="petal outer-rose-petal" fill="#CB8D95"></circle>
          <circle cx="10" cy="10" r="2.8" class="petal" fill="#EFBFC2"></circle>
          <circle cx="14" cy="10" r="2.8" class="petal" fill="#EFBFC2"></circle>
          <circle cx="12" cy="13" r="2.8" class="petal" fill="#B08F7A"></circle>
          <circle cx="12" cy="11.2" r="1.8" class="flower-center" fill="#E6D2B9"></circle>
        </g>
        <path class="flower-tick" d="M10 11.5l1.5 1.5 2.5-3" stroke="#E6D2B9" stroke-width="1.5" stroke-linecap="round" fill="none"></path>
      </svg>
    `;
  } else if (skin === 'sea-glass') {
    // Scallop Shell (Vỏ sò quạt biển) Checkbox
    const shellColor = completed ? '#2A4D88' : '#B1BBC8';
    const rayOpacity = completed ? 0.75 : 0.45;
    return `
      <svg class="todo-checkbox-flower seaglass-flower ${bloomedClass}" viewBox="0 0 24 24">
        <!-- Outer circle border -->
        <circle cx="12" cy="12" r="10" fill="none" stroke="${shellColor}" stroke-width="1.2"/>
        <!-- Scallop Shell body -->
        <path d="M12 18 C 9 14, 5 13.5, 5 11 C 5 7.5, 19 7.5, 19 11 C 19 13.5, 15 14, 12 18 Z" 
              fill="${completed ? '#B1BBC8' : 'none'}" 
              stroke="${shellColor}" 
              stroke-width="1.2" 
              stroke-linejoin="round"
              opacity="0.9"/>
        <!-- Shell rays -->
        <path d="M12 18 L12 8 M12 18 L8.5 9.5 M12 18 L15.5 9.5 M12 18 L6 11 M12 18 L18 11" 
              stroke="${shellColor}" 
              stroke-width="0.8" 
              opacity="${rayOpacity}"/>
        <!-- Completion tick -->
        <path class="flower-tick" d="M9 11.5l2 2l4.5-4.5" stroke="#fff" stroke-width="1.8" stroke-linecap="round" fill="none"></path>
      </svg>
    `;
  } else if (skin === 'italian-summer') {
    // Italian Lemon Slice Checkbox
    const lemonColor = completed ? '#FFA62B' : '#CA6702';
    return `
      <svg class="todo-checkbox-flower lemon-flower ${bloomedClass}" viewBox="0 0 24 24">
        <!-- Outer circle -->
        <circle cx="12" cy="12" r="10" fill="${completed ? '#FFA62B' : 'none'}" stroke="${lemonColor}" stroke-width="1.2"/>
        <!-- Lemon rind ring (white inner circle) -->
        <circle cx="12" cy="12" r="8.5" fill="none" stroke="#fff" stroke-width="0.8" opacity="${completed ? 1 : 0}"/>
        <!-- Lemon slice segment dividers -->
        <g stroke="${completed ? '#fff' : '#CA6702'}" stroke-width="0.6" opacity="${completed ? 0.9 : 0.4}">
          <line x1="12" y1="3.5" x2="12" y2="20.5"/>
          <line x1="3.5" y1="12" x2="20.5" y2="12"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
          <line x1="6" y1="18" x2="18" y2="6"/>
        </g>
        <!-- Center axis -->
        <circle cx="12" cy="12" r="1.5" fill="${completed ? '#fff' : '#CA6702'}"/>
        <!-- Completion tick -->
        <path class="flower-tick" d="M9 11.5l2 2l4.5-4.5" stroke="#2E5AA7" stroke-width="2" stroke-linecap="round" fill="none"></path>
      </svg>
    `;
  } else if (skin === 'kalligraphie') {
    // Calligraphy ink-drop rosette
    return `
      <svg class="todo-checkbox-flower ink-flower ${bloomedClass}" viewBox="0 0 24 24">
        <path class="flower-stem" d="M12 14v6" stroke="#8c6c53" stroke-width="1.5" stroke-linecap="round"></path>
        <g class="flower-petals">
          <path d="M12 7c1.5 0 2.5 1.5 2.5 2.5S13.5 12 12 12s-2.5-1.5-2.5-2.5S10.5 7 12 7z" class="petal" fill="#2d2d2d"></path>
          <path d="M12 17c1.5 0 2.5-1.5 2.5-2.5S13.5 12 12 12s-2.5 1.5-2.5 2.5S10.5 17 12 17z" class="petal" fill="#2d2d2d"></path>
          <path d="M17 12c0 1.5-1.5 2.5-2.5 2.5S12 13.5 12 12s1.5-2.5 2.5-2.5S17 10.5 17 12z" class="petal" fill="#2d2d2d"></path>
          <path d="M7 12c0 1.5 1.5 2.5 2.5 2.5S12 13.5 12 12s-1.5-2.5-2.5-2.5S7 10.5 7 12z" class="petal" fill="#2d2d2d"></path>
          <circle cx="12" cy="12" r="2.8" class="flower-center" fill="#faf6eb"></circle>
        </g>
        <path class="flower-tick" d="M10.5 12l1 1 2-2" stroke="#2d2d2d" stroke-width="1.8" stroke-linecap="round" fill="none"></path>
      </svg>
    `;
  } else {
    // Default Chamomile Daisy
    return `
      <svg class="todo-checkbox-flower chamomile-flower ${bloomedClass}" viewBox="0 0 24 24">
        <path class="flower-stem" d="M12 14v6" stroke="#8cb369" stroke-width="1.5" stroke-linecap="round"></path>
        <path class="flower-leaves" d="M10 18c-2 0-3-1-3-1s1-2 3-1 M14 16c2 0 3-1 3-1s-1-2-3-1" fill="#8cb369"></path>
        <g class="flower-petals">
          <circle cx="12" cy="12" r="3" class="flower-center" fill="#ffd54f"></circle>
          <circle cx="12" cy="7" r="2.5" class="petal" fill="#fff"></circle>
          <circle cx="12" cy="17" r="2.5" class="petal" fill="#fff"></circle>
          <circle cx="17" cy="12" r="2.5" class="petal" fill="#fff"></circle>
          <circle cx="7" cy="12" r="2.5" class="petal" fill="#fff"></circle>
          <circle cx="15.5" cy="8.5" r="2.2" class="petal" fill="#fff"></circle>
          <circle cx="8.5" cy="15.5" r="2.2" class="petal" fill="#fff"></circle>
          <circle cx="15.5" cy="15.5" r="2.2" class="petal" fill="#fff"></circle>
          <circle cx="8.5" cy="8.5" r="2.2" class="petal" fill="#fff"></circle>
        </g>
        <path class="flower-tick" d="M10.5 12l1 1 2-2" stroke="#4a2c11" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"></path>
      </svg>
    `;
  }
};

function renderTimerTodoList() {
  const todayStr = getLocalDateString();
  const container = document.getElementById('timer-todo-list');
  if (!container) return;
  container.innerHTML = '';
  const todos = appState.todos.filter(t => t.date === todayStr);
  if (todos.length === 0) {
    container.innerHTML = '<p style="padding:1rem;text-align:center;color:var(--text-muted);font-size:0.85rem;">Không có checklist.</p>';
    return;
  }
  todos.forEach(todo => {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    const bgColor = todo.tag ? getPastelColorForTag(todo.tag) : 'var(--bg-card)';
    li.style.cssText = `display:flex; align-items:center; justify-content:space-between; padding:0.65rem 0.75rem; margin-bottom:0.5rem; border-radius:6px; border:1px solid var(--border-color); background:${bgColor}; width:100%;`;
    
    let dueHTML = '';
    if (todo.dueDate) {
      const isOverdue = !todo.completed && todo.dueDate < todayStr;
      dueHTML = `<span style="font-size:0.7rem; padding:1px 4px; border-radius:3px; margin-left:0.5rem; ${isOverdue ? 'background-color:var(--danger); color:white; font-weight:700;' : 'background-color:var(--bg-sidebar); color:var(--text-muted);'}">Hạn: ${todo.dueDate} ${isOverdue ? '[Quá Hạn]' : ''}</span>`;
    }

    let tagHTML = '';
    if (todo.tag) {
      tagHTML = `<span style="font-size:0.65rem; background-color:rgba(0,0,0,0.05); border:1px solid rgba(0,0,0,0.1); padding:2px 5px; border-radius:4px; font-weight:700; color:var(--text-main);">${todo.tag}</span>`;
    }

    const flowerSvg = window.getTodoFlowerSVG(todo.completed);
    
    li.innerHTML = `
      <div class="todo-item-left" data-id="${todo.id}" style="display:flex; align-items:center; gap:0.5rem; flex:1; cursor:pointer;">
        <span class="todo-checkbox-container">${flowerSvg}</span>
        <div style="display:flex; flex-direction:column; gap:0.15rem;">
          <span class="todo-text" style="font-weight:700; font-size:0.9rem; color:var(--text-main);">${todo.text}</span>
          <div style="display:flex; align-items:center; gap:0.35rem; flex-wrap:wrap;">
            ${tagHTML}
            ${dueHTML}
          </div>
        </div>
      </div>
      <button class="btn-todo-delete" data-id="${todo.id}" style="background:none; border:none; cursor:pointer; color:var(--text-muted); padding: 0.2rem; display: flex; align-items: center; justify-content: center;"><i data-lucide="trash-2" style="width:16px;height:16px;"></i></button>
    `;
    li.querySelector('.todo-item-left').addEventListener('click', (e) => toggleTodo(todo.id, e));
    li.querySelector('.btn-todo-delete').addEventListener('click', e => {
      e.stopPropagation();
      deleteTodo(todo.id);
    });
    container.appendChild(li);
  });
  lucide.createIcons();
}
function addTimerTodo(){
  const input=document.getElementById('timer-new-todo');
  const text=input.value.trim();
  if(!text)return;
  
  const rawTag = document.getElementById('timer-todo-tag').value.trim();
  let tag = '';
  if (rawTag) {
    tag = rawTag.startsWith('#') ? rawTag : '#' + rawTag;
  }
  const due = document.getElementById('timer-todo-due').value || '';
  
  appState.todos.push({
    id: 'todo-' + Date.now(),
    text: text,
    completed: false,
    date: getLocalDateString(),
    tag: tag,
    dueDate: due
  });
  
  saveState();
  input.value='';
  document.getElementById('timer-todo-tag').value = '';
  document.getElementById('timer-todo-due').value = '';
  renderTimerTodoList();
  refreshDashboard();
  checkAndLogActivityToday();
}


// =============================================
//  DIARY (TAB 3) — (KEPT FROM PREVIOUS VERSION)
// =============================================
function initDiary(){
  document.getElementById('diary-search-input').addEventListener('input',()=>renderDiaryList());
  document.getElementById('diary-filter-date').addEventListener('change',()=>renderDiaryList());
  document.getElementById('diary-filter-tag').addEventListener('change',()=>renderDiaryList());
  document.getElementById('diary-new-btn').addEventListener('click',()=>loadDiaryToEditor(getLocalDateString()));
  document.getElementById('diary-auto-fill-stats').addEventListener('click',()=>insertStudyStatsIntoDiary());
  document.getElementById('diary-save-btn').addEventListener('click',()=>saveDiaryEntry());
  document.querySelectorAll('.mood-btn').forEach(btn=>{btn.addEventListener('click',()=>{document.querySelectorAll('.mood-btn').forEach(b=>b.classList.remove('selected'));btn.classList.add('selected');selectedMood=btn.getAttribute('data-mood');});});
  document.getElementById('editor-tag-input').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();const v=e.target.value.trim().replace('#','');if(v&&!currentEditorTags.includes(v)){currentEditorTags.push(v);renderEditorTags();e.target.value='';}}});
  document.getElementById('vocab-add-btn').addEventListener('click',()=>addVocabularyToEditor());
  document.getElementById('vocab-meaning').addEventListener('keydown',e=>{if(e.key==='Enter')addVocabularyToEditor();});
  document.getElementById('record-btn').addEventListener('click',()=>toggleAudioRecording());
  document.getElementById('delete-audio-btn').addEventListener('click',()=>deleteRecordedAudio());
  document.getElementById('image-upload-input').addEventListener('change',e=>{const file=e.target.files[0];if(!file)return;document.getElementById('image-upload-name').textContent=file.name;const reader=new FileReader();reader.onload=function(ev){const img=new Image();img.src=ev.target.result;img.onload=function(){const canvas=document.createElement('canvas');let w=img.width,h=img.height;const max=400;if(w>h){if(w>max){h*=max/w;w=max;}}else{if(h>max){w*=max/h;h=max;}}canvas.width=w;canvas.height=h;canvas.getContext('2d').drawImage(img,0,0,w,h);currentEditorImageBase64=canvas.toDataURL('image/jpeg',0.7);renderImagePreviews();};};reader.readAsDataURL(file);});
  const player = document.getElementById('audio-player');
  if (player) {
    player.addEventListener('play', () => {
      document.getElementById('audio-cassette-widget').classList.add('playing-tape');
    });
    player.addEventListener('pause', () => {
      document.getElementById('audio-cassette-widget').classList.remove('playing-tape');
    });
    player.addEventListener('ended', () => {
      document.getElementById('audio-cassette-widget').classList.remove('playing-tape');
    });
  }

  // Hiệu ứng phím máy đánh chữ cơ học khi gõ nhật ký
  const editorContent = document.getElementById('editor-content');
  if (editorContent) {
    editorContent.addEventListener('keydown', () => {
      const card = editorContent.closest('.diary-editor-card');
      if (card) {
        card.classList.remove('typewriter-key-press');
        card.offsetHeight; // trigger reflow
        card.classList.add('typewriter-key-press');
      }
      playTypewriterClickSound();
    });
  }

  refreshDiaryEntries();
  loadDiaryToEditor(getLocalDateString());
}

function refreshDiaryEntries(){renderDiaryList();populateDiaryTagFilterDropdown();}

function renderDiaryList(){
  const container=document.getElementById('diary-entries-list');container.innerHTML='';
  const sv=document.getElementById('diary-search-input').value.toLowerCase();
  const dv=document.getElementById('diary-filter-date').value;
  const tv=document.getElementById('diary-filter-tag').value;
  let filtered=[...appState.diaries].sort((a,b)=>b.date.localeCompare(a.date));
  if(sv)filtered=filtered.filter(d=>d.content.toLowerCase().includes(sv)||(d.vocabularies||[]).some(v=>v.word.toLowerCase().includes(sv)||v.meaning.toLowerCase().includes(sv))||(d.tags||[]).some(t=>t.toLowerCase().includes(sv)));
  if(dv)filtered=filtered.filter(d=>d.date===dv);
  if(tv)filtered=filtered.filter(d=>(d.tags||[]).includes(tv));
  if(filtered.length===0){container.innerHTML='<p style="padding:2rem;text-align:center;color:var(--text-muted);">Chưa có bài viết nào.</p>';return;}
  filtered.forEach(entry=>{
    const card=document.createElement('div');const isSel=(document.getElementById('editor-date').value===entry.date);
    card.className=`diary-entry-card-item ${isSel?'selected':''}`;
    const moodMap={happy:'😊',focused:'🎯',relaxed:'🍃',tired:'😴'};
    card.innerHTML=`<div class="diary-item-header"><span class="diary-item-date">${formatVietnameseDate(entry.date)}</span><span class="diary-item-mood">${moodMap[entry.mood]||''}</span></div><div class="diary-item-preview">${entry.content||'Chưa có nội dung...'}</div><div class="diary-item-tags" style="margin-top:0.5rem;">${(entry.tags||[]).map(t=>`<span class="diary-tag-badge">#${t}</span>`).join('')}</div>`;
    card.addEventListener('click',()=>{loadDiaryToEditor(entry.date);document.querySelectorAll('.diary-entry-card-item').forEach(c=>c.classList.remove('selected'));card.classList.add('selected');});
    container.appendChild(card);
  });lucide.createIcons();
}

function populateDiaryTagFilterDropdown(){const sel=document.getElementById('diary-filter-tag');const cv=sel.value;sel.innerHTML='<option value="">Tất cả các thẻ</option>';const ts=new Set();appState.diaries.forEach(d=>{if(d.tags)d.tags.forEach(t=>ts.add(t));});ts.forEach(tag=>{const opt=document.createElement('option');opt.value=tag;opt.textContent='#'+tag;if(tag===cv)opt.selected=true;sel.appendChild(opt);});}

function loadDiaryToEditor(dateStr){
  document.getElementById('editor-date').value=dateStr;
  document.getElementById('editor-content').value='';
  selectedMood=null;
  document.querySelectorAll('.mood-btn').forEach(b=>b.classList.remove('selected'));
  currentEditorTags=[];
  currentEditorVocabularies=[];
  recordedAudioBase64=null;
  currentEditorImageBase64=null;
  selectedWaxSealId=null;
  
  document.getElementById('audio-preview-container').classList.add('hidden');
  document.getElementById('record-text').textContent='Ghi âm';
  document.getElementById('record-timer').classList.add('hidden');
  document.getElementById('image-upload-name').textContent='Chưa chọn ảnh';
  document.getElementById('image-previews').classList.add('hidden');
  document.getElementById('diary-stamped-seal').classList.add('hidden');

  const entry=appState.diaries.find(d=>d.date===dateStr);
  if(entry){
    document.getElementById('editor-content').value=entry.content;
    selectedMood=entry.mood;
    if(selectedMood){
      const mb=document.querySelector(`.mood-btn[data-mood="${selectedMood}"]`);
      if(mb)mb.classList.add('selected');
    }
    currentEditorTags=[...(entry.tags||[])];
    currentEditorVocabularies=[...(entry.vocabularies||[])];
    if(entry.waxSealId){
      selectedWaxSealId=entry.waxSealId;
      renderStampedSealUI(entry.waxSealId);
    }
    
    // Backwards compatibility check
    if(entry.audioBase64){
      recordedAudioBase64=entry.audioBase64;
      document.getElementById('audio-player').src=entry.audioBase64;
      document.getElementById('audio-preview-container').classList.remove('hidden');
    }
    if(entry.images&&entry.images.length>0){
      currentEditorImageBase64=entry.images[0];
      renderImagePreviews();
    }

    // Load from IndexedDB
    getMediaFromDB(entry.id).then(media => {
      if(media) {
        if(media.audioBase64) {
          recordedAudioBase64=media.audioBase64;
          document.getElementById('audio-player').src=media.audioBase64;
          document.getElementById('audio-preview-container').classList.remove('hidden');
        }
        if(media.imageBase64) {
          currentEditorImageBase64=media.imageBase64;
          renderImagePreviews();
        }
      }
    }).catch(err => console.error("Lỗi lấy dữ liệu từ IndexedDB:", err));
  }
  renderEditorTags();
  renderEditorVocabulariesTable();
  renderEditorWaxSealPicker();
}

function renderEditorWaxSealPicker(){const c=document.getElementById('editor-wax-seal-picker');c.innerHTML='';const nb=document.createElement('div');nb.className=`wax-seal-option ${!selectedWaxSealId?'selected':''}`;nb.style.cssText='background:#eae1d2;border:2px dashed var(--border-color);display:flex;align-items:center;justify-content:center;color:var(--text-muted);';nb.title='Không niêm phong';nb.innerHTML='<i data-lucide="slash" style="width:18px;height:18px;"></i>';nb.addEventListener('click',()=>{selectedWaxSealId=null;document.querySelectorAll('.wax-seal-option').forEach(o=>o.classList.remove('selected'));nb.classList.add('selected');document.getElementById('diary-stamped-seal').classList.add('hidden');});c.appendChild(nb);BOUTIQUE_SEALS.forEach(seal=>{const u=appState.unlockedSeals.includes(seal.id);const o=document.createElement('div');o.className=`wax-seal-option ${selectedWaxSealId===seal.id?'selected':''}`;o.innerHTML=getWaxSealSVG(seal.id,44);if(!u){const l=document.createElement('div');l.className='wax-seal-lock-overlay';l.innerHTML='<i data-lucide="lock"></i>';o.appendChild(l);o.title=`${seal.name} (Khóa)`;}else{o.title=seal.name;o.addEventListener('click',()=>{selectedWaxSealId=seal.id;document.querySelectorAll('.wax-seal-option').forEach(x=>x.classList.remove('selected'));o.classList.add('selected');renderStampedSealUI(seal.id);});}c.appendChild(o);});lucide.createIcons();}

function renderStampedSealUI(sealId){
  const el=document.getElementById('diary-stamped-seal');
  if(!el) return;
  if(sealId){
    el.style.opacity = '0';
    el.style.transform = 'scale(2.5)';
    el.style.transition = 'none';
    el.innerHTML=getWaxSealSVG(sealId,60);
    el.classList.remove('hidden');
    
    const container = el.parentNode;
    const handle = document.createElement('div');
    handle.className = 'stamp-handle-animation';
    handle.innerHTML = `
      <svg width="70" height="140" viewBox="0 0 70 140" xmlns="http://www.w3.org/2000/svg">
        <path d="M 35 15 C 20 15 15 35 35 55 C 55 35 50 15 35 15 Z" fill="#8c5a47" stroke="#5c3e29" stroke-width="1.5"></path>
        <rect x="31" y="55" width="8" height="40" fill="url(#brassGrad)" stroke="#7d5e27" stroke-width="1"></rect>
        <ellipse cx="35" cy="95" rx="14" ry="8" fill="url(#brassGrad)" stroke="#7d5e27" stroke-width="1.2"></ellipse>
        <defs>
          <linearGradient id="brassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#9b7222" />
            <stop offset="50%" stop-color="#cca752" />
            <stop offset="100%" stop-color="#7d5e27" />
          </linearGradient>
        </defs>
      </svg>
    `;
    container.appendChild(handle);
    
    setTimeout(() => {
      el.style.transition = 'all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      el.style.opacity = '1';
      el.style.transform = 'scale(1)';
      playWaxSealStompSound();
      
      // Spawn wax dust/smoke puff particles
      const cx = el.offsetLeft + el.offsetWidth / 2;
      const cy = el.offsetTop + el.offsetHeight / 2;
      for (let i = 0; i < 8; i++) {
        const p = document.createElement('span');
        p.style.cssText = `
          position: absolute;
          width: 8px;
          height: 8px;
          background: rgba(140, 90, 71, 0.45);
          border-radius: 50%;
          left: ${cx}px;
          top: ${cy}px;
          pointer-events: none;
          z-index: 15;
          transform: translate(-50%, -50%) scale(1);
          filter: blur(1.5px);
          transition: all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
        `;
        el.parentNode.appendChild(p);
        
        const angle = Math.random() * Math.PI * 2;
        const dist = 15 + Math.random() * 25;
        const tx = Math.cos(angle) * dist;
        const ty = Math.sin(angle) * dist;
        
        setTimeout(() => {
          p.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(2.5)`;
          p.style.opacity = '0';
        }, 10);
        
        setTimeout(() => p.remove(), 700);
      }

      const card = el.closest('.card') || document.querySelector('.diary-sidebar-card');
      if (card) {
        card.classList.add('diary-shake');
        setTimeout(() => { card.classList.remove('diary-shake'); }, 300);
      }
    }, 400);
    
    setTimeout(() => {
      if (handle.parentNode) handle.parentNode.removeChild(handle);
    }, 800);
  } else {
    el.classList.add('hidden');
  }
}
function renderEditorTags(){const c=document.getElementById('editor-tags-badges');c.innerHTML='';currentEditorTags.forEach(tag=>{const b=document.createElement('span');b.className='tag-badge';b.innerHTML=`#${tag} <button onclick="removeEditorTag('${tag}')">×</button>`;c.appendChild(b);});}
window.removeEditorTag=function(t){currentEditorTags=currentEditorTags.filter(x=>x!==t);renderEditorTags();};
function addVocabularyToEditor(){const w=document.getElementById('vocab-word');const m=document.getElementById('vocab-meaning');if(!w.value.trim()||!m.value.trim())return;currentEditorVocabularies.push({word:w.value.trim(),meaning:m.value.trim()});renderEditorVocabulariesTable();w.value='';m.value='';w.focus();}
function renderEditorVocabulariesTable(){const tb=document.getElementById('vocab-list-tbody');tb.innerHTML='';if(currentEditorVocabularies.length===0){tb.innerHTML='<tr><td colspan="3" style="text-align:center;color:var(--text-muted);">Chưa có từ vựng.</td></tr>';return;}currentEditorVocabularies.forEach((v,i)=>{const tr=document.createElement('tr');tr.innerHTML=`<td style="font-weight:600;">${v.word}</td><td>${v.meaning}</td><td><button onclick="deleteEditorVocab(${i})"><i data-lucide="trash-2" style="width:16px;height:16px;"></i></button></td>`;tb.appendChild(tr);});lucide.createIcons();}
window.deleteEditorVocab=function(i){currentEditorVocabularies.splice(i,1);renderEditorVocabulariesTable();};
function insertStudyStatsIntoDiary(){const dt=document.getElementById('editor-date').value;const ss=appState.studySessions.filter(s=>s.date===dt);if(ss.length===0){customAlert(`Chưa có phiên ủ trà nào ngày ${dt}.`);return;}const ts=ss.reduce((a,c)=>a+c.durationSeconds,0);const tm=Math.floor(ts/60);const sm={};ss.forEach(s=>{if(!sm[s.subjectId])sm[s.subjectId]=0;sm[s.subjectId]+=s.durationSeconds;});let str=`\n\n--- Lernstatistik (${formatVietnameseDate(dt)}) ---\nHôm nay học tổng cộng: ${tm} phút.\n`;Object.entries(sm).forEach(([id,secs])=>{const sub=appState.subjects.find(s=>s.id===id)||{name:'Khác'};str+=`- ${sub.name}: ${Math.floor(secs/60)} phút\n`;});str+='---';document.getElementById('editor-content').value+=str;}
function toggleAudioRecording(){
  const btn=document.getElementById('record-btn');
  const txt=document.getElementById('record-text');
  const tmr=document.getElementById('record-timer');
  const tape = document.querySelector('.cassette-tape');
  
  if(!mediaRecorder || mediaRecorder.state==='inactive'){
    navigator.mediaDevices.getUserMedia({audio:true}).then(stream=>{
      if (typeof window.playMechanicalClickSound === 'function') {
        window.playMechanicalClickSound();
      }
      
      // Sử dụng Web Audio API để tạo nút khuếch đại âm lượng ghi âm
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      
      const source = audioCtx.createMediaStreamSource(stream);
      const gainNode = audioCtx.createGain();
      gainNode.gain.value = 3.5; // Tăng âm lượng thu âm lên gấp 3.5 lần
      
      const dest = audioCtx.createMediaStreamDestination();
      source.connect(gainNode);
      gainNode.connect(dest);

      mediaRecorder = new MediaRecorder(dest.stream);
      audioChunks = [];
      mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunks, {type:'audio/webm'});
        const r = new FileReader();
        r.readAsDataURL(blob);
        r.onloadend = () => {
          recordedAudioBase64 = r.result;
          document.getElementById('audio-player').src = recordedAudioBase64;
          document.getElementById('audio-preview-container').classList.remove('hidden');
        };
        // Dừng các track microphone ban đầu
        stream.getTracks().forEach(t => t.stop());
      };
      
      mediaRecorder.start();
      btn.className = 'btn btn-danger';
      document.getElementById('audio-cassette-widget').classList.add('recording');
      if (tape) tape.classList.add('recording');
      if (typeof window.playCassetteMotor === 'function') {
        window.playCassetteMotor(true);
      }
      
      txt.textContent = 'Dừng';
      tmr.classList.remove('hidden');
      recordStartTime = Date.now();
      tmr.textContent = '00:00';
      recordTimerInterval = setInterval(() => {
        const d = Math.floor((Date.now() - recordStartTime) / 1000);
        tmr.textContent = `${String(Math.floor(d/60)).padStart(2,'0')}:${String(d%60).padStart(2,'0')}`;
        
        // Update physical tape roll thickness
        const maxDur = 120; // 2 minutes max
        const progress = Math.min(1.0, d / maxDur);
        const leftWidth = 44 - (16 * progress); // 44px down to 28px
        const rightWidth = 28 + (16 * progress); // 28px up to 44px
        
        const leftTape = document.getElementById('cassette-tape-left');
        const rightTape = document.getElementById('cassette-tape-right');
        if (leftTape) {
          leftTape.style.width = `${leftWidth}px`;
          leftTape.style.height = `${leftWidth}px`;
        }
        if (rightTape) {
          rightTape.style.width = `${rightWidth}px`;
          rightTape.style.height = `${rightWidth}px`;
        }
      }, 1000);
    }).catch(err => {
      customAlert('Không truy cập được Micro.');
      console.error(err);
    });
  } else if (mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    clearInterval(recordTimerInterval);
    btn.className = 'btn btn-secondary';
    txt.textContent = 'Ghi âm';
    document.getElementById('audio-cassette-widget').classList.remove('recording');
    if (tape) tape.classList.remove('recording');
    if (typeof window.playCassetteMotor === 'function') {
      window.playCassetteMotor(false);
    }
    if (typeof window.playMechanicalClickSound === 'function') {
      window.playMechanicalClickSound();
    }
    tmr.classList.add('hidden');
  }
}
function deleteRecordedAudio(){customConfirm('Xóa đoạn thu âm?').then(confirmed=>{if(confirmed){recordedAudioBase64=null;document.getElementById('audio-player').src='';document.getElementById('audio-preview-container').classList.add('hidden');}});}
function renderImagePreviews(){const c=document.getElementById('image-previews');c.innerHTML='';if(!currentEditorImageBase64){c.classList.add('hidden');return;}c.classList.remove('hidden');const d=document.createElement('div');d.className='image-preview-item';d.innerHTML=`<img src="${currentEditorImageBase64}"><button onclick="removeEditorImage()">×</button>`;c.appendChild(d);}
window.removeEditorImage=function(){currentEditorImageBase64=null;document.getElementById('image-upload-name').textContent='Chưa chọn ảnh';document.getElementById('image-upload-input').value='';renderImagePreviews();};
function saveDiaryEntry(){
  const dt=document.getElementById('editor-date').value;
  const content=document.getElementById('editor-content').value.trim();
  if(!content){
    customAlert('Vui lòng viết nhật ký trước khi lưu.');
    return;
  }
  const idx=appState.diaries.findIndex(d=>d.date===dt);
  const entryId=idx!==-1?appState.diaries[idx].id:'diary-'+Date.now();
  
  // Save text details in localStorage (under appState), setting flags for media existence
  const data={
    id:entryId,
    date:dt,
    mood:selectedMood,
    content,
    vocabularies:currentEditorVocabularies,
    tags:currentEditorTags,
    waxSealId:selectedWaxSealId,
    // Store flags to let the app know there are media attachments
    hasAudio: !!recordedAudioBase64,
    hasImage: !!currentEditorImageBase64
  };

  if(idx!==-1) appState.diaries[idx]=data;
  else appState.diaries.push(data);

  // Write text data to localStorage
  saveState();

  // Write media to IndexedDB
  saveMediaToDB(entryId, recordedAudioBase64, currentEditorImageBase64).then(() => {
    if (typeof window.triggerWaxSealAnimation === 'function') {
      window.triggerWaxSealAnimation(selectedWaxSealId).then(() => {
        refreshDiaryEntries();
        refreshDashboard();
        checkAndLogActivityToday();
        customAlert('Đã niêm phong và lưu trang nhật ký thành công!');
      });
    } else {
      refreshDiaryEntries();
      refreshDashboard();
      checkAndLogActivityToday();
      customAlert('Đã lưu trang nhật ký thành công!');
    }
  }).catch(err => {
    console.error("Lỗi lưu trữ tệp nhị phân IndexedDB:", err);
    if (typeof window.triggerWaxSealAnimation === 'function') {
      window.triggerWaxSealAnimation(selectedWaxSealId).then(() => {
        refreshDiaryEntries();
        refreshDashboard();
        checkAndLogActivityToday();
        customAlert('Đã niêm phong và lưu nhật ký thành công! (Không lưu được ảnh/ghi âm do dung lượng)');
      });
    } else {
      refreshDiaryEntries();
      refreshDashboard();
      checkAndLogActivityToday();
      customAlert('Đã lưu nhật ký thành công! (Không lưu được ảnh/ghi âm do lỗi bộ nhớ trình duyệt)');
    }
  });
}

window.deleteCurrentDiaryEntry = function() {
  const dt = document.getElementById('editor-date').value;
  const idx = appState.diaries.findIndex(d => d.date === dt);
  if (idx === -1) {
    customAlert('Trang nhật ký ngày này chưa được lưu nên không thể xóa!');
    return;
  }
  
  const entry = appState.diaries[idx];
  customConfirm(`Chị có chắc chắn muốn xóa trang nhật ký ngày ${formatVietnameseDate(dt)} không?`).then(confirmed => {
    if (confirmed) {
      // Xóa trong appState
      appState.diaries.splice(idx, 1);
      saveState();
      
      // Xóa file ghi âm và hình ảnh trong IndexedDB
      deleteMediaFromDB(entry.id).catch(err => console.error("Error deleting media from DB:", err));
      
      // Reset trình biên tập về trống
      const todayStr = getLocalDateString();
      loadDiaryToEditor(todayStr);
      
      // Cập nhật giao diện danh sách
      refreshDiaryEntries();
      refreshDashboard();
      
      customAlert('Đã xóa trang nhật ký thành công!');
    }
  });
}


// =============================================
//  ANALYTICS (TAB 4)
// =============================================
function initAnalytics(){
  const clearBtn = document.getElementById('btn-clear-history');
  if (clearBtn) {
    clearBtn.onclick = function() {
      customConfirm('Xóa sạch lịch sử học?').then(confirmed=>{
        if(confirmed){
          appState.studySessions=[];
          appState.dailyTeaCabinet=[];
          saveState();
          refreshDashboard();
          refreshAnalytics();
        }
      });
    };
  }
  // Khởi tạo tab con đầu tiên
  window.switchAnalyticsSubTab('overview');
}

function refreshAnalytics(){
  const ts=appState.studySessions.reduce((a,c)=>a+c.durationSeconds,0);
  const tm=Math.floor(ts/60);
  const th=Math.floor(tm/60);
  
  // Cập nhật các note ghim gỗ sồi
  const totalTimeEl = document.getElementById('stats-total-time');
  if (totalTimeEl) totalTimeEl.textContent=`${th}h ${tm%60}m`;
  
  const ad=new Set(appState.studySessions.map(s=>s.date));
  const avg=ad.size>0?Math.round(tm/ad.size):0;
  const avgTimeEl = document.getElementById('stats-avg-time');
  if (avgTimeEl) avgTimeEl.textContent=`${avg}m / ngày`;
  
  const goal=appState.settings.dailyGoalMinutes||120;
  let gc=0;
  ad.forEach(d=>{
    const ds=appState.studySessions.filter(s=>s.date===d).reduce((a,c)=>a+c.durationSeconds,0);
    if(ds>=goal*60) gc++;
  });
  const goalsCompletedEl = document.getElementById('stats-goals-completed');
  if (goalsCompletedEl) goalsCompletedEl.textContent=`${gc} ngày`;
  
  let tc=0;
  appState.dailyTeaCabinet.forEach(c=>{
    tc+=(c.green||0)+(c.black||0)+(c.rose||0)+(c.royal||0);
  });
  const totalTeacupsEl = document.getElementById('stats-total-teacups');
  if (totalTeacupsEl) totalTeacupsEl.textContent=`${tc} tách`;
  
  // Xác định tab con đang active để render lại nội dung phù hợp
  const activeBtn = document.querySelector('.analytics-sub-nav .sub-nav-btn.active');
  if (activeBtn) {
    const attr = activeBtn.getAttribute('onclick') || '';
    if (attr.includes('overview')) {
      toggleCombinedChart('weekly');
      renderDiaryTagCloud();
    } else if (attr.includes('efficiency')) {
      renderPomoTaskStatsTable();
      renderChamomileBloomRate();
    } else if (attr.includes('history')) {
      renderLibraryTimeline();
    }
  } else {
    toggleCombinedChart('weekly');
    renderDiaryTagCloud();
  }
}

let combinedChartInstance = null;

window.switchAnalyticsSubTab = function(tabName) {
  if (typeof window.playMechanicalClickSound === 'function') {
    window.playMechanicalClickSound();
  }
  
  // Cập nhật trạng thái active của nút tab con
  const buttons = document.querySelectorAll('.analytics-sub-nav .sub-nav-btn');
  buttons.forEach(btn => {
    const attr = btn.getAttribute('onclick') || '';
    if (attr.includes(tabName)) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Ẩn tất cả các tab con, chỉ hiện tab con được chọn
  const contents = document.querySelectorAll('.analytics-sub-content');
  contents.forEach(el => {
    if (el.id === `subtab-${tabName}`) {
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  });

  // Gọi hàm render tương ứng của tab con
  if (tabName === 'overview') {
    window.toggleCombinedChart('weekly');
    renderDiaryTagCloud();
  } else if (tabName === 'efficiency') {
    renderPomoTaskStatsTable();
    renderChamomileBloomRate();
  } else if (tabName === 'history') {
    renderLibraryTimeline();
  }
};

window.toggleCombinedChart = function(type) {
  const btnWeekly = document.getElementById('btn-chart-weekly');
  const btnComp = document.getElementById('btn-chart-completion');
  if (btnWeekly && btnComp) {
    if (type === 'weekly') {
      btnWeekly.classList.add('active');
      btnComp.classList.remove('active');
      document.getElementById('chart-display-title').textContent = "Thời gian học 7 ngày qua";
    } else {
      btnWeekly.classList.remove('active');
      btnComp.classList.add('active');
      document.getElementById('chart-display-title').textContent = "Tỷ lệ hoàn thành nhiệm vụ theo môn";
    }
  }

  const canvas = document.getElementById('combined-analytics-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  if (combinedChartInstance) {
    combinedChartInstance.destroy();
    combinedChartInstance = null;
  }

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#ad9a8f' : '#3e3025';
  const gridColor = isDark ? '#2f3e2f' : '#d1c2a5';
  const chartFontFamily = "'Playfair Display', Georgia, serif";

  // Lấy màu primary thực tế của skin đang chọn để Chart.js vẽ đúng (tránh lỗi canvas tô màu đen)
  const rootStyles = getComputedStyle(document.documentElement);
  const primaryColor = rootStyles.getPropertyValue('--primary').trim() || '#8e62ad';
  const primaryHoverColor = rootStyles.getPropertyValue('--primary-hover').trim() || '#734c91';

  if (type === 'weekly') {
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7.push(getLocalDateString(d));
    }
    const wData = last7.map(ds => Math.round(appState.studySessions.filter(s => s.date === ds).reduce((a, c) => a + c.durationSeconds, 0) / 60));
    const wLabels = last7.map(s => {
      const d = new Date(s);
      return `${d.getDate()}/${d.getMonth() + 1}`;
    });

    combinedChartInstance = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: wLabels,
        datasets: [{
          label: 'Phút',
          data: wData,
          backgroundColor: primaryColor,
          borderColor: primaryHoverColor,
          borderWidth: 1.5,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: textColor, font: { family: chartFontFamily, size: 11, weight: 'bold' } }
          },
          y: {
            grid: { color: gridColor },
            ticks: { color: textColor, font: { family: chartFontFamily, size: 11 } }
          }
        }
      }
    });
  } else {
    const ratesBySubject = {};
    appState.subjects.forEach(sub => {
      const subTasks = appState.todos.filter(t => t.subjectId === sub.id);
      if (subTasks.length > 0) {
        const completed = subTasks.filter(t => t.completed).length;
        ratesBySubject[sub.name] = {
          rate: Math.round((completed / subTasks.length) * 100),
          color: sub.color
        };
      }
    });

    const pomoLabels = Object.keys(ratesBySubject);
    const pomoData = pomoLabels.map(k => ratesBySubject[k].rate);
    const pomoColors = pomoLabels.map(k => ratesBySubject[k].color);

    if (pomoLabels.length === 0) {
      combinedChartInstance = new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: ['Chưa có việc'],
          datasets: [{ data: [1], backgroundColor: [gridColor] }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: textColor, font: { family: chartFontFamily, size: 11 } }
            }
          }
        }
      });
    } else {
      combinedChartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: pomoLabels,
          datasets: [{
            label: 'Tỷ lệ hoàn thành (%)',
            data: pomoData,
            backgroundColor: pomoColors.length > 0 ? pomoColors : primaryColor,
            borderColor: 'rgba(0,0,0,0.1)',
            borderWidth: 1.5,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: textColor, font: { family: chartFontFamily, size: 11, weight: 'bold' } }
            },
            y: {
              min: 0,
              max: 100,
              grid: { color: gridColor },
              ticks: { color: textColor, font: { family: chartFontFamily, size: 11 } }
            }
          }
        }
      });
    }
  }
};

function renderDiaryTagCloud() {
  const container = document.getElementById('diary-tag-cloud');
  if (!container) return;
  container.innerHTML = '';

  const tagCounts = {};
  appState.diaries.forEach(d => {
    if (Array.isArray(d.tags)) {
      d.tags.forEach(tag => {
        const cleaned = tag.trim();
        if (cleaned) {
          tagCounts[cleaned] = (tagCounts[cleaned] || 0) + 1;
        }
      });
    }
  });

  const tagsArray = Object.entries(tagCounts);
  if (tagsArray.length === 0) {
    container.innerHTML = '<span style="color:var(--text-muted); font-size:0.85rem; font-style:italic;">Chưa viết nhật ký hoặc chưa có tag nào để hiển thị đám mây.</span>';
    return;
  }

  const counts = tagsArray.map(t => t[1]);
  const maxCount = Math.max(...counts);
  const minCount = Math.min(...counts);

  const colors = ['#8c5a47', '#588157', '#3d5a80', '#b5835a', '#6d597a', '#e07a5f', '#3d405b', '#81b29a'];

  tagsArray.forEach(([tag, count]) => {
    let size = 0.85;
    if (maxCount !== minCount) {
      size = 0.85 + ((count - minCount) / (maxCount - minCount)) * 0.9;
    } else if (maxCount > 1) {
      size = 1.35;
    }
    const color = colors[Math.floor(Math.random() * colors.length)];
    const span = document.createElement('span');
    span.className = 'word-cloud-tag';
    span.style.fontSize = `${size}rem`;
    span.style.color = color;
    span.textContent = `#${tag}`;
    span.title = `Dùng ${count} lần`;
    container.appendChild(span);
  });
}

function renderPomoTaskStatsTable() {
  const tb = document.getElementById('pomo-tasks-tbody');
  if (!tb) return;
  tb.innerHTML = '';

  const taskStats = {};

  appState.studySessions.forEach(s => {
    const tId = s.taskId || 'general';
    if (!taskStats[tId]) {
      taskStats[tId] = {
        name: 'Học chung (Không chọn việc)',
        cycles: 0,
        seconds: 0
      };
    }
    if (s.type === 'pomodoro') {
      taskStats[tId].cycles++;
    }
    taskStats[tId].seconds += s.durationSeconds;
  });

  Object.keys(taskStats).forEach(tId => {
    if (tId !== 'general') {
      const todo = appState.todos.find(t => t.id === tId);
      if (todo) {
        taskStats[tId].name = todo.text;
      } else {
        taskStats[tId].name = `Nhiệm vụ đã xóa (${tId.substring(5, 10)})`;
      }
    }
  });

  const statsArray = Object.values(taskStats);
  if (statsArray.length === 0) {
    tb.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--text-muted);">Chưa có dữ liệu nhiệm vụ.</td></tr>';
    return;
  }

  statsArray.forEach(stat => {
    const tr = document.createElement('tr');
    const mins = Math.round(stat.seconds / 60);
    tr.innerHTML = `
      <td style="font-weight:600; color:var(--text-main);">${stat.name}</td>
      <td style="text-align:center;">${stat.cycles} chu kỳ</td>
      <td style="text-align:center; font-weight:700;">${mins} phút</td>
    `;
    tb.appendChild(tr);
  });
}

function renderChamomileBloomRate() {
  const allTodos = appState.todos || [];
  const completed = allTodos.filter(t => t.completed).length;
  const rate = allTodos.length > 0 ? Math.round((completed / allTodos.length) * 100) : 0;
  
  const txt = document.getElementById('bloom-rate-text');
  if (txt) txt.textContent = `${rate}%`;
  
  const circle = document.getElementById('bloom-rate-progress-circle');
  if (circle) {
    const dashoffset = 263.8 - (rate / 100) * 263.8;
    circle.style.strokeDashoffset = dashoffset;
  }
  
  const enc = document.getElementById('bloom-rate-encouragement');
  if (enc) {
    if (rate === 100) {
      enc.textContent = "Tuyệt vời! Tất cả hoa trà đã nở rộ thơm ngát vườn Das TeeHaus! Gute Arbeit!";
    } else if (rate >= 50) {
      enc.textContent = "Vườn hoa trà của chị đã nở được một nửa rồi, cố gắng tích hoàn thành nốt nhé!";
    } else if (rate > 0) {
      enc.textContent = "Những bông hoa trà chamomile đầu tiên đã hé nở. Chị tiếp tục tập trung nhé!";
    } else {
      enc.textContent = "Bông hoa trà chamomile đang đợi chị hoàn thành nhiệm vụ để nở rộ đó!";
    }
  }
}

function renderLibraryTimeline() {
  const container = document.getElementById('history-timeline-container');
  if (!container) return;
  container.innerHTML = '';

  const sorted = [...appState.studySessions].sort((a, b) => b.id.localeCompare(a.id));
  if (sorted.length === 0) {
    container.innerHTML = '<p style="text-align:center; color:var(--text-muted); font-size:0.85rem; font-style:italic; padding: 2rem 0;">Chưa có phiên học tập nào được lưu trữ.</p>';
    return;
  }

  sorted.forEach(s => {
    const sub = appState.subjects.find(x => x.id === s.subjectId) || { name: 'Học tập chung', color: '#7c6553' };
    const mins = Math.floor(s.durationSeconds / 60);
    const secs = s.durationSeconds % 60;
    
    // Sử dụng con dấu sáp cổ cho decor
    const sealSvg = typeof getWaxSealSVG === 'function' ? getWaxSealSVG('seal-classic', 44) : '⚜️';

    const item = document.createElement('div');
    item.className = 'library-card-item';
    item.innerHTML = `
      <div class="library-card-header">
        <span class="library-card-date">📅 ${formatVietnameseDate(s.date)}</span>
        <span class="library-card-subject" style="color: ${sub.color};">${sub.name}</span>
      </div>
      <div class="library-card-meta">
        <span>⏱️ <b>Thời lượng:</b> ${mins}:${String(secs).padStart(2,'0')} phút</span>
        <span>🍵 <b>Hình thức:</b> ${s.type === 'teabag' ? 'Ủ túi trà' : 'Chạy đồng hồ'}</span>
        <button class="btn btn-secondary btn-icon-sm" onclick="deleteStudySession('${s.id}')" title="Xóa phiên này" style="position:relative; z-index:10; margin-left:auto; padding:0.2rem 0.4rem; border:none; background:transparent;">
          <i data-lucide="trash-2" style="width:14px; height:14px; color:var(--text-muted);"></i>
        </button>
      </div>
      <div class="library-seal-stamp" style="color: ${sub.color};">
        ${sealSvg}
      </div>
    `;
    container.appendChild(item);
  });
  lucide.createIcons();
}

window.deleteStudySession = function(id) {
  customConfirm('Xóa phiên học tập này?').then(confirmed => {
    if (confirmed) {
      appState.studySessions = appState.studySessions.filter(s => s.id !== id);
      saveState();
      refreshDashboard();
      refreshAnalytics();
    }
  });
};

window.exportDataMailbox = function() {
  if (typeof window.playMechanicalClickSound === 'function') {
    window.playMechanicalClickSound();
  }
  exportAllData();
};

window.triggerImportMailbox = function() {
  if (typeof window.playMechanicalClickSound === 'function') {
    window.playMechanicalClickSound();
  }
  const input = document.getElementById('mailbox-import-file');
  if (input) input.click();
};

window.importDataMailbox = function(fileInput) {
  const file = fileInput.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    importAllData(e.target.result);
  };
  reader.readAsText(file);
  fileInput.value = '';
};

function exportAllData() {
  initMediaDB().then(db => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(MEDIA_STORE_NAME, 'readonly');
      const store = transaction.objectStore(MEDIA_STORE_NAME);
      const request = store.getAll();
      request.onsuccess = (e) => resolve(e.target.result);
      request.onerror = (e) => reject(e.target.error);
    });
  }).then(mediaRecords => {
    const backupData = {
      appState: appState,
      mediaRecords: mediaRecords
    };
    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute("href", url);
    a.setAttribute("download", `teehaus_backup_${getLocalDateString()}.json`);
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }).catch(err => {
    console.error("Lỗi xuất file backup:", err);
    customAlert("Lỗi khi xuất file sao lưu dữ liệu.");
  });
}

function importAllData(jsonContent) {
  try {
    const parsed = JSON.parse(jsonContent);
    let importedState = null;
    let importedMedia = [];

    if (parsed && parsed.appState && parsed.mediaRecords) {
      importedState = parsed.appState;
      importedMedia = parsed.mediaRecords;
    } else if (parsed && parsed.subjects && parsed.diaries) {
      importedState = parsed;
      importedState.diaries.forEach(d => {
        if (d.audioBase64 || (d.images && d.images.length > 0)) {
          importedMedia.push({
            id: d.id,
            audioBase64: d.audioBase64 || null,
            imageBase64: (d.images && d.images.length > 0) ? d.images[0] : null
          });
          d.hasAudio = !!d.audioBase64;
          d.hasImage = !!(d.images && d.images.length > 0);
          delete d.audioBase64;
          delete d.images;
        }
      });
    } else {
      customAlert('File sao lưu không hợp lệ.');
      return;
    }

    customConfirm('Ghi đè dữ liệu hiện tại?').then(confirmed => {
      if (confirmed) {
        appState = importedState;
        saveState();

        clearAllMediaFromDB().then(() => {
          const promises = importedMedia.map(m => saveMediaToDB(m.id, m.audioBase64, m.imageBase64));
          return Promise.all(promises);
        }).then(() => {
          location.reload();
        }).catch(err => {
          console.error("Lỗi khôi phục cơ sở dữ liệu IndexedDB:", err);
          location.reload();
        });
      }
    });
  } catch (err) {
    console.error(err);
    customAlert('Không đọc được file hoặc định dạng file bị lỗi.');
  }
}

// =============================================
//  SETTINGS & BOUTIQUE (TAB 5)
// =============================================
function initSettings(){
  const tourBtn = document.getElementById('settings-tour-btn');
  if (tourBtn) {
    tourBtn.addEventListener('click', () => {
      const dashBtn = document.querySelector('[data-tab="dashboard"]');
      if (dashBtn) dashBtn.click();
      setTimeout(() => {
        if (typeof startOnboardingTour === 'function') startOnboardingTour();
      }, 300);
    });
  }

  document.getElementById('settings-save-goal-btn').addEventListener('click',()=>{
    const v=parseInt(document.getElementById('settings-daily-goal').value);
    if(isNaN(v)||v<5){
      customAlert('Tối thiểu 5 phút.');
      return;
    }
    appState.settings.dailyGoalMinutes=v;
    saveState();
    refreshDashboard();
    customAlert('Cập nhật mục tiêu thành công!');
  });
  
  const savePomoBtn = document.getElementById('settings-save-pomo-btn');
  if (savePomoBtn) {
    savePomoBtn.addEventListener('click', ()=>{
      const w = parseInt(document.getElementById('settings-pomo-work').value);
      const s = parseInt(document.getElementById('settings-pomo-short').value);
      const l = parseInt(document.getElementById('settings-pomo-long').value);
      const c = parseInt(document.getElementById('settings-pomo-cycle').value);
      const auto = document.getElementById('settings-pomo-autostart-on').checked;
      const music = document.getElementById('settings-pomo-music-behavior').value;
      const strict = document.getElementById('settings-pomo-strict-hard').checked ? 'hard' : 'mild';

      if(isNaN(w)||w<1 || isNaN(s)||s<1 || isNaN(l)||l<1 || isNaN(c)||c<1){
        customAlert('Vui lòng nhập các giá trị hợp lệ lớn hơn hoặc bằng 1.');
        return;
      }

      appState.settings.pomoWorkMinutes = w;
      appState.settings.pomoShortBreakMinutes = s;
      appState.settings.pomoLongBreakMinutes = l;
      appState.settings.pomoCycleCount = c;
      appState.settings.pomoAutostart = auto;
      appState.settings.pomoMusicBehavior = music;
      appState.settings.pomoStrictness = strict;

      saveState();
      customAlert('Cấu hình Pomodoro đã được lưu thành công!');
    });
  }

  document.getElementById('settings-add-subject-btn').addEventListener('click',()=>addSubjectFromSettings());
  document.getElementById('settings-subject-name').addEventListener('keydown',e=>{if(e.key==='Enter')addSubjectFromSettings();});
  document.getElementById('settings-export-btn').addEventListener('click',()=>exportAllData());
  document.getElementById('settings-import-input').addEventListener('change',e=>{
    const file=e.target.files[0];
    if(!file)return;
    document.getElementById('import-file-name').textContent=file.name;
    const r=new FileReader();
    r.onload=function(ev){
      importAllData(ev.target.result);
    };
    r.readAsText(file);
  });
  const resetBtn = document.getElementById('settings-reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Chị có chắc chắn muốn xóa toàn bộ dữ liệu học tập và ủ trà thử nghiệm không? Hành động này sẽ đưa trang web về trạng thái ban đầu và không thể hoàn tác.')) {
        localStorage.removeItem(DB_KEY);
        localStorage.removeItem('hasPreloadedBanhChungV2');
        window.location.reload();
      }
    });
  }
  try { initCloudSyncUI(); } catch(e) { console.error("initCloudSyncUI failed", e); }
  refreshSettings();
}

/* --- CLOUD SYNC IMPLEMENTATION (KVDB-backed) --- */
const SYNC_API_URL = 'https://kvdb.io/Mn9HjN3bB6H9d5R2z8G1p/'; // Public free key-value bucket

function triggerCloudSyncUpload() {
  if (!appState.syncCode) return;
  const statusEl = document.getElementById('sync-status-msg');
  if (statusEl) statusEl.textContent = 'Trạng thái: Đang đồng bộ...';
  
  fetch(SYNC_API_URL + appState.syncCode, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(appState)
  })
  .then(res => {
    if (!res.ok) throw new Error('Network response not ok');
    if (statusEl) statusEl.textContent = 'Trạng thái: Đã đồng bộ lên đám mây';
  })
  .catch(err => {
    console.warn('Cloud sync failed:', err);
    if (statusEl) statusEl.textContent = 'Trạng thái: Lỗi kết nối đám mây (đã lưu cục bộ)';
  });
}

function initCloudSyncUI() {
  const codeInput = document.getElementById('sync-code-input');
  const generateBtn = document.getElementById('sync-generate-btn');
  const connectCodeInput = document.getElementById('sync-connect-code');
  const connectBtn = document.getElementById('sync-connect-btn');
  const statusMsg = document.getElementById('sync-status-msg');

  if (appState.syncCode) {
    if (codeInput) codeInput.value = appState.syncCode;
    if (generateBtn) {
      generateBtn.textContent = 'Đang đồng bộ';
      generateBtn.disabled = true;
    }
    if (statusMsg) statusMsg.textContent = 'Trạng thái: Đã kết nối đám mây';
    triggerCloudSyncUpload();
  }

  if (generateBtn) {
    generateBtn.addEventListener('click', () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let randomPart = '';
      for (let i = 0; i < 6; i++) {
        randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const newCode = 'TR-' + randomPart;
      appState.syncCode = newCode;
      saveState();
      
      if (codeInput) codeInput.value = newCode;
      generateBtn.textContent = 'Đang đồng bộ';
      generateBtn.disabled = true;
      triggerCloudSyncUpload();
      customAlert(`Đã kích hoạt đồng bộ đám mây thành công! Mã đồng bộ của chị là: ${newCode}. Chị hãy lưu mã này lại để nhập trên thiết bị khác.`);
    });
  }

  if (connectBtn) {
    connectBtn.addEventListener('click', () => {
      const code = connectCodeInput.value.trim().toUpperCase();
      if (!code.startsWith('TR-') || code.length !== 9) {
        customAlert('Mã đồng bộ không hợp lệ. Vui lòng nhập đúng định dạng (Ví dụ: TR-8F9B2D).');
        return;
      }

      if (statusMsg) statusMsg.textContent = 'Trạng thái: Đang tải dữ liệu từ đám mây...';

      fetch(SYNC_API_URL + code)
        .then(res => {
          if (!res.ok) throw new Error('Không tìm thấy mã hoặc lỗi kết nối.');
          return res.json();
        })
        .then(data => {
          if (data && data.settings) {
            if (confirm('Tìm thấy dữ liệu từ thiết bị khác. Chị có muốn ghi đè dữ liệu hiện tại trên máy này bằng dữ liệu đồng bộ không?')) {
              appState = data;
              saveState();
              window.location.reload();
            } else {
              if (statusMsg) statusMsg.textContent = 'Trạng thái: Hủy tải dữ liệu';
            }
          } else {
            customAlert('Dữ liệu tải về không hợp lệ.');
          }
        })
        .catch(err => {
          console.warn('Restore failed:', err);
          customAlert('Đồng bộ thất bại. Vui lòng kiểm tra lại mã hoặc kết nối internet.');
          if (statusMsg) statusMsg.textContent = 'Trạng thái: Đồng bộ thất bại';
        });
    });
  }
}

function refreshSettings(){
  try {
    const dgEl = document.getElementById('settings-daily-goal');
    if (dgEl) dgEl.value = appState.settings.dailyGoalMinutes || 120;
  } catch(e){}
  try {
    const s = appState.settings;
    if (document.getElementById('settings-pomo-work')) {
      document.getElementById('settings-pomo-work').value = s.pomoWorkMinutes || 25;
      document.getElementById('settings-pomo-short').value = s.pomoShortBreakMinutes || 5;
      document.getElementById('settings-pomo-long').value = s.pomoLongBreakMinutes || 15;
      document.getElementById('settings-pomo-cycle').value = s.pomoCycleCount || 4;
      if (s.pomoAutostart === false) {
        document.getElementById('settings-pomo-autostart-off').checked = true;
      } else {
        document.getElementById('settings-pomo-autostart-on').checked = true;
      }
      document.getElementById('settings-pomo-music-behavior').value = s.pomoMusicBehavior || 'continuous';
      if (s.pomoStrictness === 'hard') {
        document.getElementById('settings-pomo-strict-hard').checked = true;
      } else {
        document.getElementById('settings-pomo-strict-mild').checked = true;
      }
    }
  } catch(e){}
  try {
    const upEl = document.getElementById('shop-user-points');
    if (upEl) upEl.textContent = appState.teaPoints;
  } catch(e){}
  try {
    renderSettingsSubjectsList();
  } catch(e){ console.error("renderSettingsSubjectsList failed", e); }
  try {
    renderBoutiqueShop();
  } catch(e){ console.error("renderBoutiqueShop failed", e); }
  try {
    renderSettingsThemesAndSkinsSelectors();
  } catch(e){ console.error("renderSettingsThemesAndSkinsSelectors failed", e); }
}

function renderSettingsSubjectsList() {
  const list = document.getElementById('settings-subjects-list');
  if (!list) return;
  list.innerHTML = '';
  appState.subjects.forEach(sub => {
    const li = document.createElement('li');
    li.className = 'subject-mgmt-item';
    li.innerHTML = `
      <div class="subject-info" style="display:flex; align-items:center;">
        <span class="subject-mgmt-color" style="background-color: ${sub.color};"></span>
        <span class="subject-name" style="font-weight:600; color:var(--text-main);">${sub.name}</span>
      </div>
      <button class="btn-delete-subject" onclick="deleteSubject('${sub.id}')" title="Xóa môn học này">
        <i data-lucide="trash-2"></i>
      </button>
    `;
    list.appendChild(li);
  });
  lucide.createIcons();
}

function addSubjectFromSettings() {
  const nameInput = document.getElementById('settings-subject-name');
  const colorInput = document.getElementById('settings-subject-color');
  if (!nameInput || !colorInput) return;
  
  const name = nameInput.value.trim();
  if (!name) {
    customAlert("Vui lòng nhập tên môn học!");
    return;
  }
  
  const id = 'sub-' + Date.now();
  const color = colorInput.value;
  
  appState.subjects.push({ id, name, color });
  saveState();
  
  nameInput.value = '';
  renderSettingsSubjectsList();
  
  if (typeof refreshTimerSubjects === 'function') refreshTimerSubjects();
  if (typeof refreshTodoSubjectSelect === 'function') refreshTodoSubjectSelect();
  
  customAlert(`Đã thêm môn học "${name}" thành công!`);
}

window.deleteSubject = function(subId) {
  const sub = appState.subjects.find(s => s.id === subId);
  if (!sub) return;
  
  customConfirm(`Chị có chắc chắn muốn xóa môn học "${sub.name}" không?`).then(confirmed => {
    if (confirmed) {
      appState.subjects = appState.subjects.filter(s => s.id !== subId);
      saveState();
      renderSettingsSubjectsList();
      
      if (typeof refreshTimerSubjects === 'function') refreshTimerSubjects();
      if (typeof refreshTodoSubjectSelect === 'function') refreshTodoSubjectSelect();
      
      customAlert(`Đã xóa môn học "${sub.name}" thành công!`);
    }
  });
};

function renderSettingsThemesAndSkinsSelectors() {
  const comboSel = document.getElementById('settings-combo-selector');
  if (comboSel) {
    comboSel.innerHTML = '';
    BOUTIQUE_COMBOS.forEach(c => {
      // Một combo được mở khóa nếu skin tương ứng nằm trong unlockedSkins hoặc nếu combo đó miễn phí (giá = 0)
      const isUnlocked = appState.unlockedSkins.includes(c.skinClass) || c.price === 0 || c.id === 'combo-lavender-birch';
      if (isUnlocked) {
        comboSel.innerHTML += `<option value="${c.id}">${c.name}</option>`;
      }
    });
    
    // Tìm combo đang active dựa trên selectedSkin hiện tại
    const activeSkin = appState.selectedSkin || 'lilac-birch';
    const activeCombo = BOUTIQUE_COMBOS.find(c => c.skinClass === activeSkin) || BOUTIQUE_COMBOS[0];
    comboSel.value = activeCombo.id;
  }
}

window.changeAppStateCombo = function() {
  const comboSel = document.getElementById('settings-combo-selector');
  if (!comboSel) return;
  const comboId = comboSel.value;
  const combo = BOUTIQUE_COMBOS.find(c => c.id === comboId);
  if (!combo) return;
  
  appState.selectedSkin = combo.skinClass;
  appState.selectedTheme = combo.themeClass;
  saveState();
  
  window.applySkin(combo.skinClass);
  window.applyTheme(combo.themeClass);
  window.playPaperRustleSound();
};

function renderBoutiqueShop(){
  const sg=document.getElementById('shop-seals-grid');
  if (sg) {
    sg.innerHTML='';
    BOUTIQUE_SEALS.forEach(seal=>{const u=appState.unlockedSeals.includes(seal.id);const ic=document.createElement('div');ic.className='boutique-item-card';ic.innerHTML=`<div class="boutique-item-visual">${getWaxSealSVG(seal.id,40)}</div><span class="boutique-item-name">${seal.name}</span><div class="boutique-item-price"><i data-lucide="award"></i> ${seal.price} Điểm</div>${u?`<button class="btn btn-secondary btn-buy" disabled>Đã có</button>`:`<div style="display:flex; gap:0.4rem; width:100%;"><button class="btn btn-secondary" style="flex:1; padding:0.4rem 0.25rem; font-size:0.75rem;" onclick="previewBoutiqueItem('seal','${seal.id}')">Xem thử</button><button class="btn btn-primary" style="flex:1.2; padding:0.4rem 0.25rem; font-size:0.75rem;" onclick="buyBoutiqueItem('seal','${seal.id}')">Mua</button></div>`}`;sg.appendChild(ic);});
  }
  const mg=document.getElementById('shop-music-grid');
  if (mg) {
    mg.innerHTML='';
    BOUTIQUE_MUSIC.forEach(m=>{
      if (m.id.endsWith('-ambient')) return;
      const u=appState.unlockedMusic.includes(m.id);
      const ic=document.createElement('div');
      ic.className='boutique-item-card';
      ic.innerHTML=`<div class="boutique-item-visual" style="color:var(--primary);"><i data-lucide="music" style="width:30px;height:30px;"></i></div><span class="boutique-item-name">${m.name}</span><div class="boutique-item-price"><i data-lucide="award"></i> ${m.price} Điểm</div>${u?`<button class="btn btn-secondary btn-buy" disabled>Đã có</button>`:`<div style="display:flex; gap:0.4rem; width:100%;"><button class="btn btn-secondary" style="flex:1; padding:0.4rem 0.25rem; font-size:0.75rem;" onclick="previewBoutiqueItem('music','${m.id}')">Xem thử</button><button class="btn btn-primary" style="flex:1.2; padding:0.4rem 0.25rem; font-size:0.75rem;" onclick="buyBoutiqueItem('music','${m.id}')">Mua</button></div>`}`;
      mg.appendChild(ic);
    });
  }
  
  const dg=document.getElementById('shop-drinks-grid');
  if(dg) {
    dg.innerHTML='';
    BOUTIQUE_DRINKS.forEach(d=>{
      const u=appState.unlockedDrinks.includes(d.id);
      const ic=document.createElement('div');
      ic.className='boutique-item-card';
      ic.innerHTML=`
        <div class="boutique-item-visual">
          <img src="${d.cupImage}" alt="${d.nameVi}" style="width:36px;height:36px;object-fit:contain;">
        </div>
        <span class="boutique-item-name">${d.nameVi}</span>
        <div class="boutique-item-price"><i data-lucide="award"></i> ${d.price} Điểm</div>
        ${u?`<button class="btn btn-secondary btn-buy" disabled>Đã có</button>`:`
          <div style="display:flex; gap:0.4rem; width:100%;">
            <button class="btn btn-secondary" style="flex:1; padding:0.4rem 0.25rem; font-size:0.75rem;" onclick="previewBoutiqueItem('drink','${d.id}')">Xem thử</button>
            <button class="btn btn-primary" style="flex:1.2; padding:0.4rem 0.25rem; font-size:0.75rem;" onclick="buyBoutiqueItem('drink','${d.id}')">Mua</button>
          </div>
        `}
      `;
      dg.appendChild(ic);
    });
  }

  const tsg = document.getElementById('shop-themes-skins-grid');
  if (tsg) {
    tsg.innerHTML = '';
    BOUTIQUE_COMBOS.forEach(c => {
      // Đã mở khóa nếu skin tương ứng nằm trong unlockedSkins hoặc là combo mặc định lavender-birch
      const u = appState.unlockedSkins.includes(c.skinClass) || c.id === 'combo-lavender-birch';
      const ic = document.createElement('div');
      ic.className = 'boutique-item-card';
      ic.innerHTML = `
        <div class="boutique-item-visual" style="color:var(--primary);"><i data-lucide="palette" style="width:30px;height:30px;"></i></div>
        <span class="boutique-item-name">${c.name}</span>
        <div class="boutique-item-price"><i data-lucide="award"></i> ${c.price} Điểm</div>
        ${u ? `<button class="btn btn-secondary btn-buy" disabled>Đã có</button>` : `
          <div style="display:flex; gap:0.4rem; width:100%;">
            <button class="btn btn-secondary" style="flex:1; padding:0.4rem 0.25rem; font-size:0.75rem;" onclick="previewBoutiqueItem('combo','${c.id}')">Xem thử</button>
            <button class="btn btn-primary" style="flex:1.2; padding:0.4rem 0.25rem; font-size:0.75rem;" onclick="buyBoutiqueItem('combo','${c.id}')">Mua</button>
          </div>
        `}
      `;
      tsg.appendChild(ic);
    });
  }

  const rdg=document.getElementById('shop-reading-grid');
  if(rdg) {
    rdg.innerHTML='';
    BOUTIQUE_READING_ITEMS.forEach(r=>{
      const u=appState.unlockedReadingItems.includes(r.id);
      const ic=document.createElement('div');
      ic.className='boutique-item-card';
      ic.innerHTML=`
        <div class="boutique-item-visual" style="font-size:1.8rem; display:flex; justify-content:center; align-items:center; height:30px;">${r.emoji}</div>
        <span class="boutique-item-name">${r.name}</span>
        <div class="boutique-item-price">
          <svg class="signature-coin-icon" viewBox="0 0 24 24" style="width:12px; height:12px; vertical-align:middle; display:inline-block; margin-right:2px;">
            <circle cx="12" cy="12" r="11" fill="#c27a4d" stroke="#804420" stroke-width="1.2"/>
          </svg> ${r.price}
        </div>
        ${u?`<button class="btn btn-secondary btn-buy" disabled>Đã có</button>`:`
          <div style="display:flex; gap:0.4rem; width:100%;">
            <button class="btn btn-secondary" style="flex:1; padding:0.4rem 0.25rem; font-size:0.75rem;" onclick="previewBoutiqueItem('reading','${r.id}')">Xem thử</button>
            <button class="btn btn-primary" style="flex:1.2; padding:0.4rem 0.25rem; font-size:0.75rem;" onclick="buyBoutiqueItem('reading','${r.id}')">Mua</button>
          </div>
        `}
      `;
      rdg.appendChild(ic);
    });
  }



  const qg=document.getElementById('shop-quotes-grid');
  if(qg) {
    qg.innerHTML='';
    BOUTIQUE_QUOTES.forEach(q=>{
      const u=appState.unlockedQuotes.includes(q.id);
      const ic=document.createElement('div');
      ic.className='boutique-item-card';
      ic.innerHTML=`
        <div class="boutique-item-visual" style="color:var(--primary);"><i data-lucide="quote" style="width:30px;height:30px;"></i></div>
        <span class="boutique-item-name">${q.name}</span>
        <div class="boutique-item-price"><i data-lucide="award"></i> ${q.price} Điểm</div>
        ${u?`<button class="btn btn-secondary btn-buy" disabled>Đã có</button>`:`
          <div style="display:flex; gap:0.4rem; width:100%;">
            <button class="btn btn-secondary" style="flex:1; padding:0.4rem 0.25rem; font-size:0.75rem;" onclick="previewBoutiqueItem('quote','${q.id}')">Xem thử</button>
            <button class="btn btn-primary" style="flex:1.2; padding:0.4rem 0.25rem; font-size:0.75rem;" onclick="buyBoutiqueItem('quote','${q.id}')">Mua</button>
          </div>
        `}
      `;
      qg.appendChild(ic);
    });
  }

  lucide.createIcons();

  // 3D Hologram Tilt Effect listener registration
  setTimeout(() => {
    document.querySelectorAll('.boutique-item-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const xc = rect.width / 2;
        const yc = rect.height / 2;
        const dx = x - xc;
        const dy = y - yc;
        const tiltX = -(dy / yc) * 10;
        const tiltY = (dx / xc) * 10;
        card.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'rotateX(0deg) rotateY(0deg) translateY(0px)';
      });
    });
  }, 100);
}

window.buyBoutiqueItem=function(type,id){
  let item;
  if(type==='seal') item = BOUTIQUE_SEALS.find(s=>s.id===id);
  else if(type==='music') item = BOUTIQUE_MUSIC.find(m=>m.id===id);
  else if(type==='drink') item = BOUTIQUE_DRINKS.find(d=>d.id===id);
  else if(type==='quote') item = BOUTIQUE_QUOTES.find(q=>q.id===id);
  else if(type==='reading') item = BOUTIQUE_READING_ITEMS.find(r=>r.id===id);
  else if(type==='combo') item = BOUTIQUE_COMBOS.find(c=>c.id===id);
  
  if(!item)return;
  if(appState.teaPoints<item.price){
    customAlert(`Không đủ Đồng xu cổ! Cần thêm ${item.price-appState.teaPoints} đồng xu.`);
    return;
  }
  customConfirm(`Dùng ${item.price} Đồng xu cổ để mở khóa "${item.nameVi || item.name}"?`).then(confirmed => {
    if(confirmed){
      appState.teaPoints-=item.price;
      if(type==='seal') {
        appState.unlockedSeals.push(id);
        renderEditorWaxSealPicker();
      } else if(type==='music') {
        appState.unlockedMusic.push(id);
        addUnlockedMusicButton(id,item.name);
      } else if(type==='drink') {
        appState.unlockedDrinks.push(id);
        renderTeaBagGrid();
      } else if(type==='reading') {
        appState.unlockedReadingItems.push(id);
        try { renderBookshelfDecors(); } catch(e){}
      } else if(type==='quote') {
        appState.unlockedQuotes.push(id);
        refreshDashboardQuote();
      } else if(type==='combo') {
        if (!appState.unlockedSkins.includes(item.skinClass)) appState.unlockedSkins.push(item.skinClass);
        if (!appState.unlockedThemes.includes(item.themeClass)) appState.unlockedThemes.push(item.themeClass);
        
        let matchingMusicId = '';
        if (item.skinClass === 'forest-moss') matchingMusicId = 'forest-moss-ambient';
        else if (item.skinClass === 'kaiserin-rose') matchingMusicId = 'kaiserin-rose-ambient';
        else if (item.skinClass === 'sea-glass') matchingMusicId = 'sea-glass-ambient';
        else if (item.skinClass === 'italian-summer') matchingMusicId = 'italian-summer-ambient';
        else if (item.skinClass === 'kalligraphie') matchingMusicId = 'kalligraphie-ambient';
        
        if (matchingMusicId && !appState.unlockedMusic.includes(matchingMusicId)) {
          appState.unlockedMusic.push(matchingMusicId);
          const track = BOUTIQUE_MUSIC.find(m => m.id === matchingMusicId);
          if (track) addUnlockedMusicButton(matchingMusicId, track.name);
        }
        
        saveState();
        playWindChime();
        triggerCelebrationEffect();
        document.getElementById('nav-tea-points').textContent = appState.teaPoints;
        refreshSettings();
        
        if (['forest-moss', 'kaiserin-rose', 'sea-glass', 'italian-summer', 'kalligraphie'].includes(item.skinClass)) {
          window.showPremiumInvoiceReceipt(item);
          return;
        }
        
        setTimeout(() => {
          customConfirm(`Chị có muốn áp dụng ngay chủ đề & giao diện "${item.name}" vừa mua không?`).then(applyNow => {
            if (applyNow) {
              appState.selectedSkin = item.skinClass;
              appState.selectedTheme = item.themeClass;
              window.applySkin(item.skinClass);
              window.applyTheme(item.themeClass);
              saveState();
              refreshSettings();
              customAlert(`Đã kích hoạt "${item.name}"!`);
            }
          });
        }, 600);
      }
      
      saveState();
      playWindChime();
      triggerCelebrationEffect();
      document.getElementById('nav-tea-points').textContent=appState.teaPoints;
      refreshSettings();
      customAlert(`Đã mở khóa "${item.nameVi || item.name}"!`);
    }
  });
};

function addUnlockedMusicButton(id,name){
  const c=document.querySelector('.vinyl-track-selector');const soundKey=id.replace('sound-','');if(c.querySelector(`button[data-sound="${soundKey}"]`))return;
  const btn=document.createElement('button');btn.className='track-btn';btn.setAttribute('data-sound',soundKey);btn.textContent=name;
  btn.addEventListener('click',()=>{const isP=document.querySelector('.vinyl-player-card').classList.contains('playing');stopActiveAmbientSound();document.querySelectorAll('.track-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');currentActiveMusicId=id;document.getElementById('vinyl-label-text').textContent=name.substring(0,7);if(isP)startActiveAmbientSound(id);});
  c.appendChild(btn);
}

// Load unlocked music buttons on startup
setTimeout(()=>{if(appState.unlockedMusic){appState.unlockedMusic.forEach(mid=>{if(!['paddington','dl','fantasy'].includes(mid)){const m=BOUTIQUE_MUSIC.find(x=>x.id===mid);if(m)addUnlockedMusicButton(mid,m.name);}});}},500);

// --- PREVIEW SYSTEM FOR TEE-BOUTIQUE ---
let currentPreviewCancelCallback = null;
let currentPreviewType = null;
let previewAudio = null;
let previewTimeoutId = null;

function showPreviewBanner(type, labelText, onCancel) {
  // Clear any existing preview of a DIFFERENT type first
  if (currentPreviewType && currentPreviewType !== type) {
    if (currentPreviewCancelCallback) {
      try { currentPreviewCancelCallback(); } catch(e) { console.error(e); }
    }
  }

  // Remove the old banner DOM element without firing its cancel callback
  const b = document.getElementById('boutique-preview-banner');
  if (b) b.remove();
  
  currentPreviewType = type;
  currentPreviewCancelCallback = onCancel;
  
  const newBanner = document.createElement('div');
  newBanner.id = 'boutique-preview-banner';
  newBanner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background-color: var(--primary);
    color: white;
    padding: 0.75rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 100000;
    font-family: var(--font-title);
    font-weight: bold;
    box-shadow: 0 4px 10px rgba(0,0,0,0.25);
    font-size: 0.9rem;
    animation: slide-down 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  `;
  
  newBanner.innerHTML = `
    <span>✨ Đang xem thử: <span style="text-decoration:underline;">${labelText}</span> (Tạm thời áp dụng)</span>
    <button class="btn btn-secondary" style="padding: 0.25rem 0.75rem; font-size: 0.8rem; background: rgba(255,255,255,0.25); border: 1px solid white; color: white; cursor: pointer; border-radius: 4px;" onclick="window.removePreviewBanner()">Dừng xem thử</button>
  `;
  document.body.appendChild(newBanner);
}

window.removePreviewBanner = function() {
  const b = document.getElementById('boutique-preview-banner');
  if (b) b.remove();
  if (currentPreviewCancelCallback) {
    try { currentPreviewCancelCallback(); } catch(e) { console.error(e); }
    currentPreviewCancelCallback = null;
  }
  currentPreviewType = null;
};

function playPreviewMusic(src) {
  stopPreviewMusic();
  previewAudio = new Audio(src);
  previewAudio.volume = 0.5;
  previewAudio.play().catch(e => console.error("Preview audio play failed", e));
  
  previewTimeoutId = setTimeout(() => {
    if (previewAudio) {
      stopPreviewMusic();
      const b = document.getElementById('boutique-preview-banner');
      if (b) b.remove();
      currentPreviewCancelCallback = null;
      currentPreviewType = null;
    }
  }, 12000);
}

function stopPreviewMusic() {
  if (previewAudio) {
    previewAudio.pause();
    previewAudio = null;
  }
  if (previewTimeoutId) {
    clearTimeout(previewTimeoutId);
    previewTimeoutId = null;
  }
}

window.previewBoutiqueItem = function(type, id) {
  if (type === 'combo') {
    const item = BOUTIQUE_COMBOS.find(c => c.id === id);
    if (!item) return;
    window.applySkin(item.skinClass);
    window.applyTheme(item.themeClass);
    showPreviewBanner('combo', `Bộ chủ đề & Giao diện ${item.name}`, () => {
      window.applySkin(appState.selectedSkin || 'lilac-birch');
      window.applyTheme(appState.selectedTheme || 'lavender');
    });
    window.playPaperRustleSound();
  } else if (type === 'music') {
    const item = BOUTIQUE_MUSIC.find(m => m.id === id);
    if (!item) return;
    playPreviewMusic(item.src);
    showPreviewBanner('music', `Nhạc nền ${item.name}`, () => {
      stopPreviewMusic();
    });
  } else if (type === 'seal') {
    const item = BOUTIQUE_SEALS.find(s => s.id === id);
    if (!item) return;
    customAlert(`
      <div style="display:flex; flex-direction:column; align-items:center; gap:1rem;">
        <div style="filter: drop-shadow(0 4px 8px rgba(140, 90, 71, 0.25)); transform:scale(1.3); margin: 1.5rem 0;">
          ${getWaxSealSVG(item.id, 80)}
        </div>
        <span style="font-size:0.85rem; color:var(--text-muted); text-align:center;">Mẫu dấu sáp niêm phong cao cấp dành cho nhật ký của chị.</span>
      </div>
    `, `Xem Thử Dấu Sáp: ${item.name}`);
  } else if (type === 'drink') {
    const item = BOUTIQUE_DRINKS.find(d => d.id === id);
    if (!item) return;
    customAlert(`
      <div style="display:flex; flex-direction:column; align-items:center; gap:0.5rem; text-align:center;">
        <div style="margin: 1rem 0;">
          <img src="${item.cupImage}" style="width:70px; height:70px; object-fit:contain;">
        </div>
        <p style="font-size:0.95rem;">Thời gian ủ: <b>${item.minutes} phút</b></p>
        <p style="font-size:0.95rem;">Đồng xu cổ nhận được: <b>+${item.points} Đồng xu</b></p>
        <p style="font-size:0.85rem; color:var(--text-muted); margin-top:0.5rem;">Ủ món này sẽ xuất hiện tách trà độc quyền trong tủ trà lịch sử của chị.</p>
      </div>
    `, `Xem Thử Đồ Uống: ${item.nameVi}`);
  } else if (type === 'quote') {
    const item = BOUTIQUE_QUOTES.find(q => q.id === id);
    if (!item) return;
    const sample = item.quotes[Math.floor(Math.random() * item.quotes.length)];
    customAlert(`
      <div style="display:flex; flex-direction:column; gap:0.75rem; text-align:center;">
        <div style="border-left:3px solid var(--primary); padding-left:1rem; margin:1rem 0; text-align:left; font-style:italic;">
          <p style="font-family:var(--font-title); font-weight:bold; color:var(--text-main); font-size:1.05rem;">"${sample.text}"</p>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-top:0.25rem;">— ${sample.translation}</p>
        </div>
        <span style="font-size:0.85rem; color:var(--text-muted);">Gói này chứa nhiều câu nói châm ngôn tuyệt vời giúp tạo động lực học tập hàng ngày.</span>
      </div>
    `, `Xem Thử Châm Ngôn: ${item.name}`);
  } else if (type === 'reading') {
    const item = BOUTIQUE_READING_ITEMS.find(r => r.id === id);
    if (!item) return;
    customAlert(`
      <div style="display:flex; flex-direction:column; align-items:center; gap:0.5rem; text-align:center;">
        <span style="font-size:3rem; margin:1rem 0;">${item.emoji}</span>
        <p style="font-size:0.95rem; font-weight:bold;">${item.name}</p>
        <p style="font-size:0.85rem; color:var(--text-muted);">${item.description}</p>
        <p style="font-size:0.85rem; color:var(--text-muted); margin-top:0.5rem;">Khi mua, vật phẩm này sẽ xuất hiện trên giá sách Lese-Ecke của chị để trang trí.</p>
      </div>
    `, `Xem Thử Đồ Trang Trí`);
  }
};

// =============================================
//  LESE-ECKE (READING CORNER) IMPLEMENTATION
// =============================================
let readingTimerInterval = null;
let readingTimerSeconds = 0;
let readingTimerStatus = 'idle'; // 'idle' | 'running' | 'paused'
let readingActiveBookId = '';
const READING_DAILY_GOAL_SECS = 20 * 60; // 20 minutes

// Variables to hold the active loaded book's parsed pages
let currentReaderBookId = '';
let currentReaderPages = [];
let currentReaderCurrentPageIdx = 0;
let currentReaderRawText = '';
let readerFontSize = 0.85;

window.refreshReadingTab = function() {
  renderBookshelf();
  renderLibraryCards();
  renderPocketVocab();
  updateReadingTimerUI();
  updateReadingActiveBookSelect();
  renderBookshelfDecors();
};

function renderBookshelf() {
  const shelfReading = document.getElementById('shelf-reading');
  const shelfWant = document.getElementById('shelf-want');
  const shelfFinished = document.getElementById('shelf-finished');
  
  if (!shelfReading || !shelfWant || !shelfFinished) return;
  
  shelfReading.innerHTML = '';
  shelfWant.innerHTML = '';
  shelfFinished.innerHTML = '';
  
  if (!Array.isArray(appState.books)) appState.books = [];
  
  appState.books.forEach(book => {
    // Generate height and spine styling
    const percent = book.totalPages > 0 ? Math.round((book.currentPage / book.totalPages) * 100) : 0;
    const height = 75 + (book.totalPages % 30); // height based on length
    const width = 20 + (book.totalPages % 15);  // thickness based on pages
    const color = book.coverColor || '#8a5a47';
    
    const tooltip = `"${book.title}" by ${book.author} (${book.currentPage}/${book.totalPages} trang - ${percent}%)`;
    
    const bookSpine = document.createElement('div');
    bookSpine.className = 'vintage-book-spine';
    bookSpine.setAttribute('data-id', book.id);
    bookSpine.setAttribute('data-tooltip', tooltip);
    bookSpine.style.backgroundColor = color;
    bookSpine.style.height = `${height}px`;
    bookSpine.style.width = `${width}px`;
    
    // Add text and ribs on the spine
    bookSpine.innerHTML = `
      <div class="vintage-book-spine-ribs"></div>
      <span class="spine-text">${book.title}</span>
    `;
    
    bookSpine.addEventListener('click', () => openBookDetails(book.id));
    
    if (book.status === 'reading') {
      shelfReading.appendChild(bookSpine);
    } else if (book.status === 'want') {
      shelfWant.appendChild(bookSpine);
    } else if (book.status === 'finished') {
      shelfFinished.appendChild(bookSpine);
    }
  });
  
  // Also render decorations on dashboard
  renderDashboardBookDecor();
}

function renderBookshelfDecors() {
  const container = document.getElementById('bookshelf-decors');
  if (!container) return;
  container.innerHTML = '';
  
  if (!Array.isArray(appState.unlockedReadingItems)) appState.unlockedReadingItems = [];
  
  appState.unlockedReadingItems.forEach(itemId => {
    const item = BOUTIQUE_READING_ITEMS.find(r => r.id === itemId);
    if (item) {
      container.innerHTML += `
        <span style="font-size: 1.4rem;" title="${item.name}">
          ${item.emoji}
        </span>
      `;
    }
  });
}

window.openAddBookModal = function() {
  const colors = ['#8a5a47', '#3d5a80', '#386641', '#b5835a', '#6b705c', '#5c3e29', '#a5a58d', '#b7b7a4'];
  let colorsHtml = colors.map((c, i) => `
    <label style="display:inline-block; width:24px; height:24px; border-radius:50%; background-color:${c}; border:2px solid ${i===0?'var(--primary)':'transparent'}; cursor:pointer; margin-right:5px;">
      <input type="radio" name="book-color" value="${c}" ${i===0?'checked':''} style="display:none;" onchange="selectColorInAddBook(this)">
    </label>
  `).join('');
  
  const content = `
    <div style="display:flex; flex-direction:column; gap:0.75rem; text-align:left; font-family:var(--font-body);">
      <div>
        <label class="editor-label">Tên sách:</label>
        <input type="text" id="add-book-title" placeholder="z.B. Faust I" style="width:100%; padding:0.4rem; border:1px solid var(--border-color); border-radius:4px;">
      </div>
      <div>
        <label class="editor-label">Tác giả:</label>
        <input type="text" id="add-book-author" placeholder="z.B. Goethe" style="width:100%; padding:0.4rem; border:1px solid var(--border-color); border-radius:4px;">
      </div>
      <div style="display:grid; grid-template-columns: 1fr 1.2fr; gap:0.75rem;">
        <div>
          <label class="editor-label">Tổng số trang:</label>
          <input type="number" id="add-book-pages" value="100" min="1" style="width:100%; padding:0.4rem; border:1px solid var(--border-color); border-radius:4px;">
        </div>
        <div>
          <label class="editor-label">Trạng thái:</label>
          <select id="add-book-status" class="vintage-select" style="width:100%;">
            <option value="want">Muốn đọc (Möchte lesen)</option>
            <option value="reading">Đang đọc (Lesen)</option>
            <option value="finished">Đã xong (Gelesen)</option>
          </select>
        </div>
      </div>
      <div>
        <label class="editor-label">Màu gáy sách:</label>
        <div style="display:flex; align-items:center; margin-top:0.25rem;" id="add-book-color-picker">
          ${colorsHtml}
        </div>
      </div>
      <div style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:0.5rem;">
        <button class="btn btn-secondary" onclick="closeCustomDialog()">Hủy</button>
        <button class="btn btn-primary" onclick="submitAddBook()">Thêm sách</button>
      </div>
    </div>
  `;
  customAlert(content, "Thêm Sách Mới");
};

window.selectColorInAddBook = function(input) {
  const container = document.getElementById('add-book-color-picker');
  if (container) {
    container.querySelectorAll('label').forEach(lbl => lbl.style.borderColor = 'transparent');
    input.parentNode.style.borderColor = 'var(--primary)';
  }
};

window.submitAddBook = function() {
  const title = document.getElementById('add-book-title').value.trim();
  const author = document.getElementById('add-book-author').value.trim();
  const pages = parseInt(document.getElementById('add-book-pages').value) || 100;
  const status = document.getElementById('add-book-status').value;
  const color = document.querySelector('input[name="book-color"]:checked').value;
  
  if (!title) {
    customAlert("Vui lòng nhập tên sách!");
    return;
  }
  
  const id = 'book-' + Date.now();
  const newBook = {
    id,
    title,
    author: author || 'Khuyết danh',
    totalPages: pages,
    currentPage: status === 'finished' ? pages : 0,
    status,
    startDate: status === 'reading' ? getLocalDateString() : null,
    endDate: status === 'finished' ? getLocalDateString() : null,
    notes: [],
    coverColor: color
  };
  
  if (!Array.isArray(appState.books)) appState.books = [];
  appState.books.push(newBook);
  saveState();
  closeCustomDialog();
  refreshReadingTab();
};

const curatedSpineColors = [
  { hex: '#8a5a47', name: 'Gỗ Phong' },
  { hex: '#3d5a80', name: 'Mây Xanh' },
  { hex: '#386641', name: 'Rừng Thông' },
  { hex: '#b5835a', name: 'Sáp Ong' },
  { hex: '#6b705c', name: 'Rêu Đá' },
  { hex: '#b87b80', name: 'Cánh Hồng' },
  { hex: '#4a4e69', name: 'Lavender' },
  { hex: '#8b5a2b', name: 'Da Thuộc' },
  { hex: '#d4af37', name: 'Nhũ Vàng' }
];
let selectedBookEditColor = '#8a5a47';

window.openBookDetails = function(bookId) {
  const book = appState.books.find(b => b.id === bookId);
  if (!book) return;
  
  selectedBookEditColor = book.coverColor || '#8a5a47';
  const percent = book.totalPages > 0 ? Math.round((book.currentPage / book.totalPages) * 100) : 0;
  let notesHtml = '';
  
  if (book.notes && book.notes.length > 0) {
    notesHtml = book.notes.map(n => `
      <div style="border-bottom: 1px dashed rgba(139, 90, 71, 0.2); padding: 0.4rem 0; font-size: 0.8rem;">
        <div style="display:flex; justify-content:space-between; color:var(--primary); font-weight:700;">
          <span>Ngày ${n.date}</span>
          <span>Trang ${n.startPage} -> ${n.endPage} (${n.minutes} phút)</span>
        </div>
        <p style="font-style:italic; margin-top:0.2rem; color:#5c3e29;">"${n.text}"</p>
      </div>
    `).join('');
  } else {
    notesHtml = '<p style="color:var(--text-muted); font-size:0.8rem; font-style:italic; padding:0.5rem 0;">Chưa có ghi chép buổi đọc nào.</p>';
  }
  
  const detailsContent = `
    <div style="text-align:left; font-family:var(--font-body); display:flex; flex-direction:column; gap:0.75rem;">
      <div style="border-bottom:1px solid var(--border-color); padding-bottom:0.5rem;">
        <div id="book-details-view-mode">
          <h2 style="font-family:var(--font-title); color:#3b2f2f; margin:0; font-size:1.35rem; display:flex; justify-content:space-between; align-items:center;">
            <span id="lbl-detail-title">${book.title}</span>
            <button class="btn btn-secondary btn-icon-sm" onclick="toggleBookDetailsEditMode(true)" style="padding:0.2rem 0.4rem; font-size:0.75rem; display:inline-flex; align-items:center; gap:0.25rem;" title="Sửa tên sách và tác giả">
              <i data-lucide="edit-3" style="width:12px; height:12px;"></i> Sửa
            </button>
          </h2>
          <p style="color:var(--text-muted); margin:0.2rem 0 0 0; font-size:0.85rem;">Tác giả: <b id="lbl-detail-author">${book.author}</b></p>
        </div>
        <div id="book-details-edit-mode" class="hidden" style="display:flex; flex-direction:column; gap:0.4rem;">
          <input type="text" id="txt-edit-title" value="${book.title.replace(/"/g, '&quot;')}" placeholder="Tên sách" class="vintage-input" style="width:100%; padding:0.35rem; border:1px solid var(--border-color); border-radius:4px;">
          <input type="text" id="txt-edit-author" value="${book.author.replace(/"/g, '&quot;')}" placeholder="Tác giả" class="vintage-input" style="width:100%; padding:0.35rem; border:1px solid var(--border-color); border-radius:4px;">
          
          <label class="editor-label" style="display:block; margin-top:0.3rem; margin-bottom:0.1rem;">Chọn màu gáy sách:</label>
          <div style="display:flex; gap:0.45rem; flex-wrap:wrap; margin-bottom:0.4rem;" id="edit-color-swatches">
            ${curatedSpineColors.map(c => `
              <span class="color-dot-select ${c.hex === selectedBookEditColor ? 'active' : ''}" style="background:${c.hex};" onclick="setBookEditColor('${c.hex}', this)" title="${c.name}"></span>
            `).join('')}
          </div>
          
          <div style="display:flex; gap:0.4rem; justify-content:flex-end; margin-top:0.2rem;">
            <button class="btn btn-secondary" onclick="toggleBookDetailsEditMode(false)" style="padding:0.2rem 0.5rem; font-size:0.75rem;">Hủy</button>
            <button class="btn btn-primary" onclick="saveBookDetails('${book.id}')" style="padding:0.2rem 0.5rem; font-size:0.75rem;">Lưu lại</button>
          </div>
        </div>
      </div>
      
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem; font-size:0.85rem;">
        <div>
          <p style="margin:0;">Trang hiện tại: <b>${book.currentPage} / ${book.totalPages}</b></p>
          <p style="margin:0.25rem 0 0 0;">Tiến trình: <b>${percent}%</b></p>
        </div>
        <div>
          <p style="margin:0;">Ngày bắt đầu: <b>${book.startDate || 'Chưa bắt đầu'}</b></p>
          <p style="margin:0.25rem 0 0 0;">Ngày kết thúc: <b>${book.endDate || 'Chưa xong'}</b></p>
        </div>
      </div>
      
      <div style="background: rgba(139, 90, 71, 0.05); padding: 0.5rem; border-radius: 6px; border: 1px dashed var(--border-color);">
        <div style="height:10px; background:#ddd; border-radius:5px; overflow:hidden;">
          <div style="height:100%; width:${percent}%; background:var(--primary); transition:width 0.3s ease;"></div>
        </div>
      </div>
      
      <!-- Cập nhật tiến độ hoặc Đọc sách -->
      <div style="border-top:1px solid var(--border-color); padding-top:0.5rem; display:flex; flex-direction:column; gap:0.5rem;">
        <span class="editor-label">Cập nhật trang hiện tại (Nhập tay):</span>
        <div style="display:flex; gap:0.4rem;">
          <input type="number" id="detail-current-page" value="${book.currentPage}" min="0" max="${book.totalPages}" style="width:80px; padding:0.35rem; border:1px solid var(--border-color); border-radius:4px;">
          <button class="btn btn-secondary" onclick="submitUpdateProgress('${book.id}')" style="padding:0.35rem 0.75rem;">Lưu trang</button>
          
          ${book.status === 'reading' ? `
            <button class="btn btn-primary" onclick="openBookIn3DReader('${book.id}')" style="flex:1; display:flex; justify-content:center; align-items:center; gap:0.3rem;">
              <i data-lucide="book-open" style="width:14px; height:14px;"></i> Đọc Trực Tiếp
            </button>
          ` : `
            <button class="btn btn-primary" onclick="changeBookStatus('${book.id}', 'reading')" style="flex:1;">
              Chuyển sang "Đang đọc"
            </button>
          `}
        </div>
        
        ${book.status !== 'finished' && book.status !== 'want' ? `
          <button class="btn btn-secondary" onclick="changeBookStatus('${book.id}', 'finished')" style="width:100%; font-size:0.8rem; padding:0.25rem;">
            Đánh dấu là "Đã đọc xong"
          </button>
        ` : ''}
      </div>

      <!-- Nhật ký buổi đọc -->
      <div style="border-top:1px solid var(--border-color); padding-top:0.5rem;">
        <span class="editor-label">Nhật ký phiên đọc:</span>
        <div style="max-height:130px; overflow-y:auto; margin-top:0.25rem; padding-right:5px;" id="detail-notes-list">
          ${notesHtml}
        </div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.5rem;">
        <button class="btn btn-secondary" style="background:#b87b80; color:#fff; font-size:0.8rem; padding:0.3rem 0.6rem;" onclick="deleteBook('${book.id}')">Xóa Sách</button>
        <button class="btn btn-secondary" onclick="closeCustomDialog()">Đóng</button>
      </div>
    </div>
  `;
  customAlert(detailsContent, "Chi tiết cuốn sách");
  lucide.createIcons();
};

window.toggleBookDetailsEditMode = function(isEdit) {
  const viewMode = document.getElementById('book-details-view-mode');
  const editMode = document.getElementById('book-details-edit-mode');
  if (viewMode && editMode) {
    if (isEdit) {
      viewMode.classList.add('hidden');
      editMode.classList.remove('hidden');
    } else {
      viewMode.classList.remove('hidden');
      editMode.classList.add('hidden');
    }
  }
};

window.setBookEditColor = function(colorHex, element) {
  selectedBookEditColor = colorHex;
  const swatches = document.querySelectorAll('#edit-color-swatches .color-dot-select');
  swatches.forEach(s => s.classList.remove('active'));
  if (element) element.classList.add('active');
};

window.saveBookDetails = function(bookId) {
  const titleInput = document.getElementById('txt-edit-title');
  const authorInput = document.getElementById('txt-edit-author');
  if (!titleInput || !authorInput) return;
  
  const newTitle = titleInput.value.trim();
  const newAuthor = authorInput.value.trim();
  
  if (!newTitle) {
    customAlert("Vui lòng nhập tên cuốn sách!");
    return;
  }
  
  const book = appState.books.find(b => b.id === bookId);
  if (book) {
    book.title = newTitle;
    book.author = newAuthor || "Tác giả tệp";
    book.coverColor = selectedBookEditColor;
    saveState();
    refreshReadingTab();
    
    // Update labels in the current dialog
    const lblTitle = document.getElementById('lbl-detail-title');
    const lblAuthor = document.getElementById('lbl-detail-author');
    if (lblTitle) lblTitle.textContent = book.title;
    if (lblAuthor) lblAuthor.textContent = book.author;
    
    // Switch back to view mode
    window.toggleBookDetailsEditMode(false);
    customAlert("Đã cập nhật thông tin sách thành công!");
  }
};

window.submitUpdateProgress = function(bookId) {
  const pageInput = document.getElementById('detail-current-page');
  if (!pageInput) return;
  const page = parseInt(pageInput.value) || 0;
  
  const book = appState.books.find(b => b.id === bookId);
  if (!book) return;
  
  if (page < 0 || page > book.totalPages) {
    customAlert(`Số trang không hợp lệ! Vui lòng nhập từ 0 đến ${book.totalPages}`);
    return;
  }
  
  book.currentPage = page;
  if (page === book.totalPages) {
    book.status = 'finished';
    book.endDate = getLocalDateString();
    playWindChime();
    triggerCelebrationEffect();
  } else if (book.status === 'finished') {
    book.status = 'reading';
    book.endDate = null;
  }
  
  saveState();
  closeCustomDialog();
  refreshReadingTab();
};

window.changeBookStatus = function(bookId, newStatus) {
  const book = appState.books.find(b => b.id === bookId);
  if (!book) return;
  
  book.status = newStatus;
  if (newStatus === 'reading') {
    book.startDate = getLocalDateString();
    book.endDate = null;
  } else if (newStatus === 'finished') {
    book.currentPage = book.totalPages;
    book.endDate = getLocalDateString();
    playWindChime();
    triggerCelebrationEffect();
  } else if (newStatus === 'want') {
    book.startDate = null;
    book.endDate = null;
    book.currentPage = 0;
  }
  
  saveState();
  closeCustomDialog();
  refreshReadingTab();
};

window.deleteBook = function(bookId) {
  customConfirm("Chị có chắc chắn muốn xóa cuốn sách này khỏi kệ không?").then(confirm => {
    if (confirm) {
      if (bookId === 'book-banh-chung') {
        localStorage.setItem('hasPreloadedBanhChungV2', 'true');
      }
      appState.books = appState.books.filter(b => b.id !== bookId);
      // Xóa file tương ứng khỏi IndexedDB nếu có
      deleteBookFileFromDB(bookId).catch(err => console.error("Error deleting book file:", err));
      
      if (readingActiveBookId === bookId) {
        readingActiveBookId = '';
        resetReadingTimer();
      }
      if (currentReaderBookId === bookId) {
        closeReaderActiveView();
      }
      
      saveState();
      closeCustomDialog();
      refreshReadingTab();
    }
  });
};

// =============================================
//  3D BOOK READER EPUB / TXT PARSER
// =============================================

function closeReaderActiveView() {
  currentReaderBookId = '';
  currentReaderPages = [];
  currentReaderCurrentPageIdx = 0;
  currentReaderRawText = '';
  document.getElementById('reader-empty-view').classList.remove('hidden');
  document.getElementById('reader-active-view').classList.add('hidden');
  const deleteBtn = document.getElementById('btn-reader-delete-book');
  if (deleteBtn) deleteBtn.classList.add('hidden');
  const toolbar = document.getElementById('reader-tool-bar');
  if (toolbar) toolbar.classList.add('hidden');
}

window.openBookIn3DReader = function(bookId) {
  closeCustomDialog();
  const book = appState.books.find(b => b.id === bookId);
  if (!book) return;
  
  // Set active book for stopwatch
  readingActiveBookId = bookId;
  updateReadingActiveBookSelect();
  
  // Load file content from IndexedDB
  getBookFileFromDB(bookId).then(bookData => {
    if (!bookData) {
      customAlert(`Cuốn sách "${book.title}" chưa được tải tệp tin văn bản (.epub / .txt) lên. Hãy bấm nút "Tải sách" ở góc trên bên phải để nạp tệp đọc cho sách nhé!`);
      return;
    }
    
    // Parse book data based on type
    const charsPerPage = Math.round(750 / (readerFontSize / 0.85));
    if (bookData.fileType === 'txt') {
      currentReaderRawText = bookData.fileData;
      currentReaderPages = partitionTextIntoPages(currentReaderRawText, charsPerPage);
      currentReaderBookId = bookId;
      
      // Calculate current page index based on book.currentPage percentage
      const progressPercent = book.totalPages > 0 ? (book.currentPage / book.totalPages) : 0;
      currentReaderCurrentPageIdx = Math.max(0, Math.min(currentReaderPages.length - 1, Math.floor(progressPercent * currentReaderPages.length)));
      // Make sure it is even for left/right spread
      if (currentReaderCurrentPageIdx % 2 !== 0 && currentReaderCurrentPageIdx > 0) {
        currentReaderCurrentPageIdx--;
      }
      
      displayPagesIn3DReader();
    } else if (bookData.fileType === 'epub') {
      // EPUB fileData is stored as ArrayBuffer
      parseEpubFile(bookData.fileData).then(fullText => {
        currentReaderRawText = fullText;
        currentReaderPages = partitionTextIntoPages(currentReaderRawText, charsPerPage);
        currentReaderBookId = bookId;
        
        const progressPercent = book.totalPages > 0 ? (book.currentPage / book.totalPages) : 0;
        currentReaderCurrentPageIdx = Math.max(0, Math.min(currentReaderPages.length - 1, Math.floor(progressPercent * currentReaderPages.length)));
        if (currentReaderCurrentPageIdx % 2 !== 0 && currentReaderCurrentPageIdx > 0) {
          currentReaderCurrentPageIdx--;
        }
        
        displayPagesIn3DReader();
      }).catch(err => {
        customAlert("Lỗi giải nén tệp EPUB: " + err);
        console.error(err);
      });
    }
  }).catch(err => {
    console.error("Error fetching book file:", err);
  });
};

function displayPagesIn3DReader() {
  const emptyView = document.getElementById('reader-empty-view');
  const activeView = document.getElementById('reader-active-view');
  if (!emptyView || !activeView) return;
  
  emptyView.classList.add('hidden');
  activeView.classList.remove('hidden');
  
  // Tự động kích hoạt chế độ đọc toàn phần chiếm toàn bộ tab
  window.enterReaderFullMode();
  
  const deleteBtn = document.getElementById('btn-reader-delete-book');
  if (deleteBtn) deleteBtn.classList.remove('hidden');
  
  const toolbar = document.getElementById('reader-tool-bar');
  if (toolbar) toolbar.classList.remove('hidden');
  
  const leftContent = document.getElementById('reader-page-left-content');
  const rightContent = document.getElementById('reader-page-right-content');
  const leftNum = document.getElementById('reader-page-left-num');
  const rightNum = document.getElementById('reader-page-right-num');
  const progressText = document.getElementById('reader-page-progress');

  // Apply current typography settings
  if (leftContent) leftContent.style.fontSize = `${readerFontSize}rem`;
  if (rightContent) rightContent.style.fontSize = `${readerFontSize}rem`;
  
  setTimeout(() => {
    window.changeReaderFont();
    window.changeReaderTheme();
  }, 10);
  
  if (currentReaderPages.length === 0) {
    leftContent.innerHTML = '<h3>Mở đầu</h3><p style="color:var(--text-muted); font-style:italic;">Tệp sách trống rỗng.</p>';
    rightContent.innerHTML = '';
    return;
  }
  
  const leftText = currentReaderPages[currentReaderCurrentPageIdx] || "";
  const rightText = currentReaderPages[currentReaderCurrentPageIdx + 1] || "";
  
  // Format paragraphs nicely
  leftContent.innerHTML = leftText.split('\n\n').map(p => `<p style="margin-bottom:0.75rem;">${p}</p>`).join('');
  rightContent.innerHTML = rightText.split('\n\n').map(p => `<p style="margin-bottom:0.75rem;">${p}</p>`).join('');
  
  leftNum.textContent = currentReaderCurrentPageIdx + 1;
  rightNum.textContent = currentReaderCurrentPageIdx + 2;
  
  const total = currentReaderPages.length;
  const currentProgress = Math.min(total, currentReaderCurrentPageIdx + 2);
  const percent = Math.round((currentProgress / total) * 100);
  progressText.textContent = `Trang ${currentProgress} / ${total} (${percent}%)`;
  
  // Update the book's currentPage in appState dynamically
  const book = appState.books.find(b => b.id === currentReaderBookId);
  if (book) {
    const calculatedPage = Math.round((currentProgress / total) * book.totalPages);
    book.currentPage = Math.min(book.totalPages, calculatedPage);
    saveState();
    renderBookshelf();
  }
}

window.enterReaderFullMode = function() {
  const grid = document.querySelector('.reading-grid');
  if (grid) grid.classList.add('reader-full-mode');
  const closeBtn = document.getElementById('btn-reader-close-book');
  if (closeBtn) closeBtn.classList.remove('hidden');
};

window.exitReaderFullMode = function() {
  const grid = document.querySelector('.reading-grid');
  if (grid) grid.classList.remove('reader-full-mode');
  const closeBtn = document.getElementById('btn-reader-close-book');
  if (closeBtn) closeBtn.classList.add('hidden');
};

window.nextBookPage = function() {
  if (currentReaderCurrentPageIdx + 2 >= currentReaderPages.length) return;
  
  const turningEl = document.getElementById('reader-page-turning-element');
  const turningContent = document.getElementById('reader-page-turning-content');
  
  if (turningEl && turningContent) {
    // Load next page text into turning overlay for 3D visual
    turningContent.innerHTML = (currentReaderPages[currentReaderCurrentPageIdx + 2] || "").split('\n\n').map(p => `<p>${p}</p>`).join('');
    turningEl.className = 'book-page book-page-turning turning-forward';
    
    // Play page turn sound!
    playPaperRustleSound();
    
    setTimeout(() => {
      turningEl.className = 'book-page book-page-turning hidden';
      currentReaderCurrentPageIdx += 2;
      displayPagesIn3DReader();
    }, 500);
  }
};

window.prevBookPage = function() {
  if (currentReaderCurrentPageIdx - 2 < 0) return;
  
  const turningEl = document.getElementById('reader-page-turning-element');
  const turningContent = document.getElementById('reader-page-turning-content');
  
  if (turningEl && turningContent) {
    // Load previous page text into turning overlay
    turningContent.innerHTML = (currentReaderPages[currentReaderCurrentPageIdx - 2] || "").split('\n\n').map(p => `<p>${p}</p>`).join('');
    turningEl.className = 'book-page book-page-turning turning-backward';
    
    playPaperRustleSound();
    
    setTimeout(() => {
      turningEl.className = 'book-page book-page-turning hidden';
      currentReaderCurrentPageIdx -= 2;
      displayPagesIn3DReader();
    }, 500);
  }
};

window.handleBookFileUpload = function(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const extension = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();
  
  // Prompt user to select which book on the shelf to bind this file to, or create a new one!
  const optionsHtml = appState.books.map(b => `<option value="${b.id}">${b.title}</option>`).join('');
  const selectHtml = `
    <div style="text-align:left; font-family:var(--font-body); display:flex; flex-direction:column; gap:0.5rem;">
      <p style="margin:0 0 0.5rem 0; font-size:0.85rem; color:var(--text-main);">Tải tệp <b>${file.name}</b> thành công! Hãy chọn cuốn sách trên kệ để nạp nội dung này:</p>
      <select id="bind-file-book-select" class="vintage-select" style="width:100%;">
        <option value="new">-- Tạo sách mới cho tệp này --</option>
        ${optionsHtml}
      </select>
      <div style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:0.5rem;">
        <button class="btn btn-secondary" onclick="closeCustomDialog()">Hủy</button>
        <button class="btn btn-primary" id="btn-bind-file-confirm">Xác nhận nạp sách</button>
      </div>
    </div>
  `;
  customAlert(selectHtml, "Nạp Tệp Sách");
  
  document.getElementById('btn-bind-file-confirm').addEventListener('click', () => {
    const choice = document.getElementById('bind-file-book-select').value;
    let bookId = choice;
    
    if (choice === 'new') {
      bookId = 'book-' + Date.now();
      const newBookName = file.name.replace(/\.[^/.]+$/, "");
      const colors = ['#8a5a47', '#3d5a80', '#386641', '#b5835a', '#6b705c'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      const newBook = {
        id: bookId,
        title: newBookName,
        author: "Tệp tải lên",
        totalPages: 200, // placeholder, will adjust if needed
        currentPage: 0,
        status: 'reading',
        startDate: getLocalDateString(),
        endDate: null,
        notes: [],
        coverColor: randomColor
      };
      
      appState.books.push(newBook);
    }
    
    // Read the file and store it in IndexedDB
    if (extension === 'txt') {
      const reader = new FileReader();
      reader.onload = function(e) {
        const textContent = e.target.result;
        // Count approximate words/pages
        const words = textContent.split(/\s+/).length;
        const targetBook = appState.books.find(b => b.id === bookId);
        if (targetBook) {
          targetBook.totalPages = Math.max(1, Math.round(words / 150)); // ~150 words per page
        }
        
        saveBookFileToDB(bookId, textContent, 'txt').then(() => {
          saveState();
          closeCustomDialog();
          refreshReadingTab();
          openBookIn3DReader(bookId);
          customAlert("Đã nạp tệp văn bản thành công vào giá sách!");
        }).catch(err => {
          console.error(err);
          customAlert("Lỗi lưu trữ tệp tin sách vào IndexedDB!");
        });
      };
      reader.readAsText(file);
    } else if (extension === 'epub') {
      const reader = new FileReader();
      reader.onload = function(e) {
        const arrayBuffer = e.target.result;
        
        // Storing EPUB as binary array buffer in IndexedDB
        saveBookFileToDB(bookId, arrayBuffer, 'epub').then(() => {
          // Parse title/author from OPF if possible or just use existing
          parseEpubFile(arrayBuffer).then(fullText => {
            const words = fullText.split(/\s+/).length;
            const targetBook = appState.books.find(b => b.id === bookId);
            if (targetBook) {
              targetBook.totalPages = Math.max(1, Math.round(words / 150));
            }
            saveState();
            closeCustomDialog();
            refreshReadingTab();
            openBookIn3DReader(bookId);
            customAlert("Đã nạp và giải nén tệp sách EPUB thành công vào giá sách!");
          }).catch(err => {
            console.error("Lỗi giải mã EPUB:", err);
            customAlert("Lỗi giải nén nội dung EPUB: " + err.message + ". Vui lòng thử lại với tệp EPUB khác hoặc tệp .txt nhé chị!");
          });
        }).catch(err => {
          console.error(err);
          customAlert("Lỗi lưu trữ tệp tin EPUB vào IndexedDB!");
        });
      };
      reader.readAsArrayBuffer(file);
    }
  });
};

// Simple self-contained offline EPUB parser using JSZip (Namespace-proof)
function parseEpubFile(arrayBuffer) {
  return JSZip.loadAsync(arrayBuffer).then(zip => {
    // Find container.xml to locate OPF path
    return zip.file("META-INF/container.xml").async("text").then(containerText => {
      const parser = new DOMParser();
      const containerDoc = parser.parseFromString(containerText, "text/xml");
      
      // Namespace-insensitive element lookup
      const rootfileEl = containerDoc.getElementsByTagName("rootfile")[0] || containerDoc.querySelector("rootfile");
      if (!rootfileEl) throw new Error("Không tìm thấy tệp cấu trúc rootfile trong file EPUB.");
      
      const opfPath = rootfileEl.getAttribute("full-path");
      let baseDir = "";
      if (opfPath.includes("/")) {
        baseDir = opfPath.substring(0, opfPath.lastIndexOf("/") + 1); // e.g. "OEBPS/"
      }
      
      return zip.file(opfPath).async("text").then(opfText => {
        const opfDoc = parser.parseFromString(opfText, "text/xml");
        
        // Get manifest items (map ID to href) using getElementsByTagName for namespace-safety
        const manifestItems = {};
        const items = opfDoc.getElementsByTagName("item");
        for (let i = 0; i < items.length; i++) {
          manifestItems[items[i].getAttribute("id")] = items[i].getAttribute("href");
        }
        
        // Get spine items (order of reading files)
        const itemrefs = opfDoc.getElementsByTagName("itemref");
        const spineItemIds = [];
        for (let i = 0; i < itemrefs.length; i++) {
          spineItemIds.push(itemrefs[i].getAttribute("idref"));
        }
        
        // Read XHTML files in spine order
        const promises = spineItemIds.map(id => {
          const href = manifestItems[id];
          if (!href) return Promise.resolve("");
          
          const cleanHref = href.replace(/^\.\.\//, "");
          const fullHref = baseDir + cleanHref;
          
          const file = zip.file(fullHref) || zip.file(baseDir + href) || zip.file(href);
          if (file) {
            return file.async("text");
          }
          return Promise.resolve("");
        });
        
        return Promise.all(promises).then(xhtmlContents => {
          let fullText = "";
          xhtmlContents.forEach(xhtml => {
            if (!xhtml) return;
            const doc = parser.parseFromString(xhtml, "text/html");
            
            // Loại bỏ các thẻ rác, thẻ style/script và đặc biệt là thẻ <nav> chứa mục lục để tránh hiển thị trùng lặp
            doc.querySelectorAll("script, style, head, nav").forEach(e => e.remove());
            
            const body = doc.body;
            if (body) {
              // Chỉ trích xuất từ các thẻ văn bản lá (block text elements), loại bỏ thẻ div chứa để tránh lặp chữ
              const blockElements = Array.from(body.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li, dt, dd, blockquote"));
              if (blockElements.length > 0) {
                blockElements.forEach(el => {
                  const t = el.textContent.replace(/\s+/g, ' ').trim();
                  if (t.length > 1) {
                    fullText += t + "\n\n";
                  }
                });
              } else {
                // Trực tiếp lấy text của body nếu file không có các thẻ block
                const textNodes = body.textContent.trim().split('\n');
                textNodes.forEach(line => {
                  const t = line.replace(/\s+/g, ' ').trim();
                  if (t) fullText += t + "\n\n";
                });
              }
            }
          });
          return fullText;
        });
      });
    });
  });
}

function partitionTextIntoPages(text, charsPerPage = 550) {
  if (!text) return [""];
  const paragraphs = text.split('\n\n');
  const pages = [];
  let currentPageText = "";
  
  paragraphs.forEach(para => {
    const cleanPara = para.replace(/\s+/g, ' ').trim();
    if (!cleanPara) return;
    
    // Nếu đoạn văn vừa với trang hiện tại thì nối tiếp vào và giữ nguyên xuống dòng \n\n
    if ((currentPageText + "\n\n" + cleanPara).length <= charsPerPage) {
      currentPageText += (currentPageText === "" ? "" : "\n\n") + cleanPara;
    } else {
      // Đẩy trang hiện tại ra nếu không trống
      if (currentPageText) {
        pages.push(currentPageText.trim());
        currentPageText = "";
      }
      
      // Nếu bản thân đoạn văn quá dài lớn hơn cả giới hạn của trang, ta cắt nhỏ nó theo từ
      if (cleanPara.length > charsPerPage) {
        const words = cleanPara.split(' ');
        let tempPage = "";
        words.forEach(w => {
          if ((tempPage + " " + w).length > charsPerPage) {
            pages.push(tempPage.trim());
            tempPage = w;
          } else {
            tempPage += (tempPage === "" ? "" : " ") + w;
          }
        });
        if (tempPage) {
          currentPageText = tempPage;
        }
      } else {
        currentPageText = cleanPara;
      }
    }
  });
  
  if (currentPageText) {
    pages.push(currentPageText.trim());
  }
  return pages;
}

window.deleteCurrentReaderBook = function() {
  if (currentReaderBookId) {
    window.deleteBook(currentReaderBookId);
  } else {
    customAlert("Không có sách nào đang mở trong trình đọc.");
  }
};

// =============================================
//  READING TIMER & POCKET DIARY
// =============================================

function updateReadingTimerUI() {
  const timerText = document.getElementById('reading-timer-text');
  const timerState = document.getElementById('reading-timer-state');
  const btnToggle = document.getElementById('btn-reading-timer-toggle');
  const iconToggle = document.getElementById('icon-reading-timer-play');
  const targetBadge = document.getElementById('reading-daily-target-badge');
  
  if (!timerText || !timerState || !btnToggle || !iconToggle || !targetBadge) return;
  
  // Calculate today's reading minutes accumulated
  const todayStr = getLocalDateString();
  const minutesToday = appState.readingSessions
    ? appState.readingSessions.filter(s => s.date === todayStr).reduce((acc, s) => acc + s.minutes, 0)
    : 0;
  
  targetBadge.textContent = `Mục tiêu: ${minutesToday}/20 phút`;
  if (minutesToday >= 20) {
    targetBadge.style.backgroundColor = 'rgba(140, 90, 71, 0.2)';
    targetBadge.style.color = '#386641';
    targetBadge.innerHTML = `<i data-lucide="check" style="width:12px;height:12px;display:inline-block;vertical-align:middle;margin-right:2px;"></i> Đạt mục tiêu (+10 xu)`;
    lucide.createIcons();
  }
  
  if (readingTimerStatus === 'idle') {
    timerText.textContent = '20:00';
    timerState.textContent = 'BẤM CHƠI';
    iconToggle.setAttribute('data-lucide', 'play');
  } else if (readingTimerStatus === 'running') {
    timerText.textContent = formatTimeDisplay(readingTimerSeconds);
    timerState.textContent = 'ĐANG ĐỌC';
    iconToggle.setAttribute('data-lucide', 'pause');
  } else if (readingTimerStatus === 'paused') {
    timerText.textContent = formatTimeDisplay(readingTimerSeconds);
    timerState.textContent = 'TẠM DỪNG';
    iconToggle.setAttribute('data-lucide', 'play');
  }
  lucide.createIcons();
}

window.toggleReadingTimer = function() {
  if (readingTimerStatus === 'idle') {
    readingTimerSeconds = 0;
    readingTimerStatus = 'running';
    readingTimerInterval = setInterval(() => {
      readingTimerSeconds++;
      updateReadingTimerUI();
    }, 1000);
    playPaperRustleSound();
  } else if (readingTimerStatus === 'running') {
    clearInterval(readingTimerInterval);
    readingTimerStatus = 'paused';
  } else if (readingTimerStatus === 'paused') {
    readingTimerStatus = 'running';
    readingTimerInterval = setInterval(() => {
      readingTimerSeconds++;
      updateReadingTimerUI();
    }, 1000);
  }
  updateReadingTimerUI();
};

window.resetReadingTimer = function() {
  if (readingTimerStatus === 'running' || readingTimerStatus === 'paused') {
    clearInterval(readingTimerInterval);
    readingTimerInterval = null;
    
    const minutes = Math.max(1, Math.round(readingTimerSeconds / 60));
    customConfirm(`Chị có muốn ghi nhận buổi đọc sách dài ${minutes} phút vừa rồi không?`).then(save => {
      if (save) {
        // Prompt for pages and notes
        const activeBook = appState.books.find(b => b.id === readingActiveBookId);
        const bookTitle = activeBook ? activeBook.title : 'Đọc tự do';
        
        const saveForm = `
          <div style="text-align:left; font-family:var(--font-body); display:flex; flex-direction:column; gap:0.75rem;">
            <p style="margin:0; font-size:0.85rem;">Ghi nhận buổi đọc cho cuốn: <b>${bookTitle}</b></p>
            <div>
              <label class="editor-label">Trang sách hiện tại:</label>
              <input type="number" id="timer-log-pages" value="${activeBook ? activeBook.currentPage : ''}" placeholder="z.B. 45" style="width:100%; padding:0.4rem; border:1px solid var(--border-color); border-radius:4px;">
            </div>
            <div>
              <label class="editor-label">Cảm nhận buổi đọc:</label>
              <textarea id="timer-log-note" placeholder="Hôm nay chị đọng lại được những ý gì..." style="width:100%; height:70px; padding:0.4rem; border:1px solid var(--border-color); border-radius:4px; font-family:var(--font-body);"></textarea>
            </div>
            <div style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:0.5rem;">
              <button class="btn btn-secondary" onclick="closeCustomDialog()">Hủy</button>
              <button class="btn btn-primary" id="btn-timer-log-confirm">Lưu buổi học</button>
            </div>
          </div>
        `;
        customAlert(saveForm, "Lưu Buổi Đọc Sách");
        
        document.getElementById('btn-timer-log-confirm').addEventListener('click', () => {
          const endPage = parseInt(document.getElementById('timer-log-pages').value) || 0;
          const noteText = document.getElementById('timer-log-note').value.trim();
          saveReadingSession(readingActiveBookId, minutes, endPage, noteText);
          closeCustomDialog();
          
          readingTimerSeconds = 0;
          readingTimerStatus = 'idle';
          updateReadingTimerUI();
        });
      } else {
        readingTimerSeconds = 0;
        readingTimerStatus = 'idle';
        updateReadingTimerUI();
      }
    });
  } else {
    readingTimerSeconds = 0;
    readingTimerStatus = 'idle';
    updateReadingTimerUI();
  }
};

window.openManualLogModal = function() {
  const booksOptionHtml = appState.books.filter(b => b.status === 'reading').map(b => `<option value="${b.id}">${b.title}</option>`).join('');
  const logContent = `
    <div style="text-align:left; font-family:var(--font-body); display:flex; flex-direction:column; gap:0.75rem;">
      <p style="margin:0; font-size:0.85rem; color:var(--text-main);">Ghi nhận thời gian đọc sách thủ công để tích lũy Đồng xu cổ:</p>
      
      <div>
        <label class="editor-label">Chọn sách đọc:</label>
        <select id="manual-log-book-id" class="vintage-select" style="width:100%;">
          <option value="">-- Đọc tự do (Không có trong danh sách) --</option>
          ${booksOptionHtml}
        </select>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem;">
        <div>
          <label class="editor-label">Thời gian đọc (phút):</label>
          <input type="number" id="manual-log-minutes" value="20" min="1" style="width:100%; padding:0.4rem; border:1px solid var(--border-color); border-radius:4px;">
        </div>
        <div>
          <label class="editor-label">Trang sách hiện tại:</label>
          <input type="number" id="manual-log-pages" value="" placeholder="Ví dụ: 65" style="width:100%; padding:0.4rem; border:1px solid var(--border-color); border-radius:4px;">
        </div>
      </div>

      <div>
        <label class="editor-label">Thu hoạch ngắn (Journal note):</label>
        <textarea id="manual-log-note" placeholder="Hôm nay chị đọng lại được những ý gì..." style="width:100%; height:70px; padding:0.4rem; border:1px solid var(--border-color); border-radius:4px; font-family:var(--font-body);"></textarea>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:0.5rem;">
        <button class="btn btn-secondary" onclick="closeCustomDialog()">Hủy</button>
        <button class="btn btn-primary" onclick="submitManualLog()">Ghi nhận</button>
      </div>
    </div>
  `;
  customAlert(logContent, "Ghi Nhận Đọc Sách");
};

window.submitManualLog = function() {
  const bookId = document.getElementById('manual-log-book-id').value;
  const minutes = parseInt(document.getElementById('manual-log-minutes').value) || 20;
  const endPage = parseInt(document.getElementById('manual-log-pages').value) || 0;
  const noteText = document.getElementById('manual-log-note').value.trim();
  
  if (minutes <= 0) {
    customAlert("Thời gian đọc phải lớn hơn 0 phút!");
    return;
  }
  
  saveReadingSession(bookId, minutes, endPage, noteText);
  closeCustomDialog();
};

function saveReadingSession(bookId, minutes, endPage, noteText) {
  const todayStr = getLocalDateString();
  const beforeMinutesToday = appState.readingSessions
    ? appState.readingSessions.filter(s => s.date === todayStr).reduce((acc, s) => acc + s.minutes, 0)
    : 0;
  
  let bookTitle = "Đọc tự do";
  let book = null;
  let startPage = 0;
  
  if (bookId) {
    book = appState.books.find(b => b.id === bookId);
    if (book) {
      bookTitle = book.title;
      startPage = book.currentPage;
      if (endPage > startPage) {
        book.currentPage = Math.min(book.totalPages, endPage);
        if (book.currentPage === book.totalPages) {
          book.status = 'finished';
          book.endDate = todayStr;
        }
      }
    }
  }
  
  const session = {
    id: 'read-sess-' + Date.now(),
    bookId,
    bookTitle,
    minutes,
    startPage,
    endPage: endPage || startPage,
    noteText: noteText || 'Chị đã đọc sách thư thái và tập trung.',
    date: todayStr
  };
  
  if (!Array.isArray(appState.readingSessions)) appState.readingSessions = [];
  appState.readingSessions.push(session);
  
  // Save notes directly on the book if selected
  if (book) {
    if (!Array.isArray(book.notes)) book.notes = [];
    book.notes.push({
      id: 'note-' + Date.now(),
      date: todayStr,
      minutes,
      startPage,
      endPage: endPage || startPage,
      text: noteText || 'Không có cảm nhận.',
      mood: 'happy'
    });
  }
  
  // Calculate if daily goal is achieved after this session
  const afterMinutesToday = beforeMinutesToday + minutes;
  if (beforeMinutesToday < 20 && afterMinutesToday >= 20) {
    // Reward 10 coins!
    appState.teaPoints += 10;
    setTimeout(() => {
      playWindChime();
      triggerCelebrationEffect();
      customAlert(`Gute Arbeit! Chị đã tích lũy đọc đủ 20 phút hôm nay và nhận được thưởng +10 Đồng xu cổ! 🪙✨`);
    }, 400);
  }
  
  saveState();
  checkAndLogActivityToday();
  refreshReadingTab();
  
  // Update coin counts on sidebar and boutique header
  try {
    document.getElementById('nav-tea-points').textContent = appState.teaPoints;
    if (document.getElementById('shop-user-points')) {
      document.getElementById('shop-user-points').textContent = appState.teaPoints;
    }
  } catch(e){}
}

window.changeActiveReadingBook = function() {
  const select = document.getElementById('reading-active-book-select');
  if (select) {
    readingActiveBookId = select.value;
    resetReadingTimer();
  }
};

// Render history of sessions in library card style
function renderLibraryCards() {
  const container = document.getElementById('library-cards-history');
  if (!container) return;
  
  if (!Array.isArray(appState.readingSessions) || appState.readingSessions.length === 0) {
    container.innerHTML = '<p style="text-align:center; color:var(--text-muted); font-style:italic; padding: 2rem 0;">Chưa có phiên đọc sách nào được ghi nhận.</p>';
    return;
  }
  
  container.innerHTML = '';
  // Sort reverse chronological
  const sorted = [...appState.readingSessions].sort((a,b) => b.id.localeCompare(a.id));
  
  sorted.forEach(sess => {
    const sealSvg = getWaxSealSVG('seal-default', 34);
    
    container.innerHTML += `
      <div class="vintage-library-card">
        <div class="library-card-header">
          <span class="library-card-date">${formatVietnameseDate(sess.date)}</span>
          <span class="library-card-pages">${sess.endPage > sess.startPage ? `Trang ${sess.startPage} -> ${sess.endPage}` : ''} (${sess.minutes} phút)</span>
        </div>
        <div class="library-card-book-title"><i data-lucide="bookmark" style="width:12px;height:12px;display:inline-block;vertical-align:middle;margin-right:4px;"></i> ${sess.bookTitle}</div>
        <div class="library-card-notes">"${sess.noteText}"</div>
        <div class="library-card-seal">${sealSvg}</div>
      </div>
    `;
  });
  lucide.createIcons();
}

window.switchTab = function(target) {
  const btn = document.querySelector(`.menu-item[data-tab="${target}"]`);
  if (btn) {
    btn.click();
  }
};

// Pocket German Vocabulary list inside Reading tab
function renderPocketVocab() {
  const list = document.getElementById('pocketbook-vocab-list');
  if (!list) return;
  list.innerHTML = '';
  
  if (!Array.isArray(appState.pocketVocab)) appState.pocketVocab = [];
  
  if (appState.pocketVocab.length === 0) {
    list.innerHTML = '<p style="text-align:center; color:var(--text-muted); font-size:0.8rem; font-style:italic; margin-top:0.5rem;">Chưa lưu từ vựng nào.</p>';
    return;
  }
  
  appState.pocketVocab.forEach((item, index) => {
    list.innerHTML += `
      <div class="pocket-vocab-item">
        <div>
          <b style="color:var(--primary); font-family:var(--font-title);">${item.word}</b>: <span>${item.meaning}</span>
        </div>
        <button onclick="deletePocketVocab(${index})">×</button>
      </div>
    `;
  });
}

window.addPocketVocabulary = function() {
  const wordEl = document.getElementById('pocket-vocab-word');
  const meaningEl = document.getElementById('pocket-vocab-meaning');
  if (!wordEl || !meaningEl) return;
  
  const word = wordEl.value.trim();
  const meaning = meaningEl.value.trim();
  
  if (!word || !meaning) {
    customAlert("Vui lòng điền cả từ mới và nghĩa tiếng Việt!");
    return;
  }
  
  // Trigger card animation & sound
  const card = document.querySelector('.vocab-pocketbook-card');
  if (card) {
    card.classList.add('adding-word');
    setTimeout(() => card.classList.remove('adding-word'), 800);
  }
  if (typeof window.playPaperRustleSound === 'function') {
    window.playPaperRustleSound();
  }
  
  if (!Array.isArray(appState.pocketVocab)) appState.pocketVocab = [];
  appState.pocketVocab.push({ word, meaning });
  saveState();
  renderPocketVocab();
  
  wordEl.value = '';
  meaningEl.value = '';
  wordEl.focus();
};

window.deletePocketVocab = function(index) {
  if (appState.pocketVocab) {
    appState.pocketVocab.splice(index, 1);
    saveState();
    renderPocketVocab();
  }
};

function renderDashboardBookDecor() {
  const container = document.getElementById('dashboard-book-decor');
  if (!container) return;
  
  const readingBooks = appState.books.filter(b => b.status === 'reading');
  if (readingBooks.length === 0) {
    container.classList.add('hidden');
    return;
  }
  
  container.classList.remove('hidden');
  let html = `<div class="dashboard-book-stack" onclick="switchTab('reading')" title="Góc Đọc Lese-Ecke">`;
  
  readingBooks.forEach((book, idx) => {
    const rotation = (idx % 2 === 0 ? 1 : -1) * (idx * 1.5 + 1.2); 
    const translation = (idx % 2 === 0 ? 1 : -1) * (idx * 2.2);    
    const width = 125 + (idx * 9) % 25; 
    const color = book.coverColor || '#8a5a47';
    
    html += `
      <div class="dashboard-stacked-book" style="background-color: ${color}; width: ${width}px; transform: rotate(${rotation}deg) translateX(${translation}px);">
        <span class="book-title-spine">${book.title}</span>
      </div>
    `;
  });
  
  html += `</div>`;
  container.innerHTML = html;
}

function updateReadingActiveBookSelect() {
  const select = document.getElementById('reading-active-book-select');
  if (!select) return;
  select.innerHTML = '<option value="">-- Chọn sách hoặc Đọc tự do --</option>';
  appState.books.forEach(b => {
    if (b.status === 'reading') {
      select.innerHTML += `<option value="${b.id}" ${b.id === readingActiveBookId ? 'selected' : ''}>${b.title} (${b.author})</option>`;
    }
  });
}

window.openManualBookAddDialog = function() {
  let selectedAddColor = '#8a5a47'; // Default color
  
  const formHtml = `
    <div style="text-align:left; font-family:var(--font-body); display:flex; flex-direction:column; gap:0.6rem;">
      <p style="margin:0 0 0.2rem 0; font-size:0.85rem; color:var(--text-main);">Nhập thông tin cuốn sách mới chị muốn thêm vào kệ:</p>
      
      <div>
        <label class="editor-label" style="display:block; margin-bottom:0.15rem;">Tên sách:</label>
        <input type="text" id="add-manual-title" placeholder="Ví dụ: Faust" class="vintage-input" style="width:100%; padding:0.4rem; border:1px solid var(--border-color); border-radius:4px;">
      </div>
      
      <div>
        <label class="editor-label" style="display:block; margin-bottom:0.15rem;">Tác giả:</label>
        <input type="text" id="add-manual-author" placeholder="Ví dụ: J. W. Goethe" class="vintage-input" style="width:100%; padding:0.4rem; border:1px solid var(--border-color); border-radius:4px;">
      </div>
      
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.5rem;">
        <div>
          <label class="editor-label" style="display:block; margin-bottom:0.15rem;">Tổng số trang:</label>
          <input type="number" id="add-manual-total-pages" value="200" min="1" class="vintage-input" style="width:100%; padding:0.4rem; border:1px solid var(--border-color); border-radius:4px;">
        </div>
        <div>
          <label class="editor-label" style="display:block; margin-bottom:0.15rem;">Trang hiện tại:</label>
          <input type="number" id="add-manual-current-page" value="0" min="0" class="vintage-input" style="width:100%; padding:0.4rem; border:1px solid var(--border-color); border-radius:4px;">
        </div>
      </div>
      
      <div>
        <label class="editor-label" style="display:block; margin-bottom:0.15rem;">Trạng thái kệ sách:</label>
        <select id="add-manual-status" class="vintage-select" style="width:100%; padding:0.4rem; border:1px solid var(--border-color); border-radius:4px; background:#fff; font-family:var(--font-body);">
          <option value="reading">Đang đọc (Lesen)</option>
          <option value="want">Muốn đọc (Möchte lesen)</option>
          <option value="finished">Đã xong (Gelesen)</option>
        </select>
      </div>
      
      <div>
        <label class="editor-label" style="display:block; margin-top:0.2rem; margin-bottom:0.15rem;">Chọn màu gáy sách:</label>
        <div style="display:flex; gap:0.45rem; flex-wrap:wrap; margin-top:0.1rem;" id="add-color-swatches">
          ${curatedSpineColors.map((c, i) => `
            <span class="color-dot-select ${i === 0 ? 'active' : ''}" style="background:${c.hex};" onclick="setBookAddColor('${c.hex}', this)" title="${c.name}"></span>
          `).join('')}
        </div>
      </div>
      
      <div style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:0.5rem; border-top:1px solid var(--border-color); padding-top:0.5rem;">
        <button class="btn btn-secondary" onclick="closeCustomDialog()">Hủy</button>
        <button class="btn btn-primary" id="btn-add-manual-confirm">Thêm lên kệ</button>
      </div>
    </div>
  `;
  
  // Track selected color locally on window
  window.selectedAddBookColor = selectedAddColor;
  window.setBookAddColor = function(colorHex, element) {
    window.selectedAddBookColor = colorHex;
    const swatches = document.querySelectorAll('#add-color-swatches .color-dot-select');
    swatches.forEach(s => s.classList.remove('active'));
    if (element) element.classList.add('active');
  };
  
  customAlert(formHtml, "Thêm Sách Lên Kệ");
  
  // Bind click event
  const confirmBtn = document.getElementById('btn-add-manual-confirm');
  if (confirmBtn) {
    confirmBtn.onclick = function() {
      const title = document.getElementById('add-manual-title').value.trim();
      const author = document.getElementById('add-manual-author').value.trim() || 'Khuyết danh';
      const totalPages = parseInt(document.getElementById('add-manual-total-pages').value) || 200;
      const currentPage = parseInt(document.getElementById('add-manual-current-page').value) || 0;
      const status = document.getElementById('add-manual-status').value;
      
      if (!title) {
        customAlert("Vui lòng nhập tên cuốn sách!");
        return;
      }
      if (currentPage < 0 || currentPage > totalPages) {
        customAlert(`Trang hiện tại phải từ 0 đến tổng số trang (${totalPages})!`);
        return;
      }
      
      const newBook = {
        id: 'book-' + Date.now(),
        title,
        author,
        totalPages,
        currentPage,
        status,
        startDate: status === 'reading' || status === 'finished' ? getLocalDateString() : null,
        endDate: status === 'finished' ? getLocalDateString() : null,
        notes: [],
        coverColor: window.selectedAddBookColor
      };
      
      if (!Array.isArray(appState.books)) appState.books = [];
      appState.books.push(newBook);
      saveState();
      closeCustomDialog();
      refreshReadingTab();
      customAlert(`Đã thêm thành công cuốn sách "${title}" lên kệ gỗ sồi!`);
    };
  }
};

window.adjustReaderFontSize = function(delta) {
  readerFontSize = Math.max(0.65, Math.min(1.2, readerFontSize + delta));
  const lbl = document.getElementById('lbl-reader-font-size');
  if (lbl) lbl.textContent = `${Math.round(readerFontSize * 118)}%`;
  
  // Apply font size
  const leftContent = document.getElementById('reader-page-left-content');
  const rightContent = document.getElementById('reader-page-right-content');
  if (leftContent) leftContent.style.fontSize = `${readerFontSize}rem`;
  if (rightContent) rightContent.style.fontSize = `${readerFontSize}rem`;
  
  repartitionCurrentReaderText();
};

window.changeReaderFont = function() {
  const select = document.getElementById('reader-font-select');
  if (select) {
    const font = select.value;
    const contents = document.querySelectorAll('.page-content');
    contents.forEach(c => c.style.fontFamily = font);
  }
};

window.changeReaderTheme = function() {
  const select = document.getElementById('reader-theme-select');
  if (!select) return;
  const theme = select.value;
  const book = document.querySelector('.cozy-3d-book');
  const pages = document.querySelectorAll('.book-page, .book-page-turning');
  const viewport = document.querySelector('.reader-viewport');
  
  if (theme === 'sepia') {
    if (viewport) viewport.style.background = '#f4ece1';
    if (book) book.style.background = '#eae2d5';
    pages.forEach(p => {
      p.style.background = '#fbf8f3';
      p.style.color = '#3b2f2f';
    });
  } else if (theme === 'cream') {
    if (viewport) viewport.style.background = '#faf6eb';
    if (book) book.style.background = '#e9dfcc';
    pages.forEach(p => {
      p.style.background = '#fefdfb';
      p.style.color = '#2c221e';
    });
  } else if (theme === 'dark') {
    if (viewport) viewport.style.background = '#221a17';
    if (book) book.style.background = '#362823';
    pages.forEach(p => {
      p.style.background = '#2c221e';
      p.style.color = '#eae2d5';
    });
  }
};

function repartitionCurrentReaderText() {
  if (!currentReaderRawText || !currentReaderBookId) return;
  
  const charsPerPage = Math.round(750 / (readerFontSize / 0.85));
  
  // Save page percentage before partitioning
  const book = appState.books.find(b => b.id === currentReaderBookId);
  const progressPercent = book && book.totalPages > 0 ? (book.currentPage / book.totalPages) : 0;
  
  // Re-partition
  currentReaderPages = partitionTextIntoPages(currentReaderRawText, charsPerPage);
  
  // Calculate new current page index matching the progress percentage
  currentReaderCurrentPageIdx = Math.max(0, Math.min(currentReaderPages.length - 1, Math.floor(progressPercent * currentReaderPages.length)));
  if (currentReaderCurrentPageIdx % 2 !== 0 && currentReaderCurrentPageIdx > 0) {
    currentReaderCurrentPageIdx--;
  }
  
  // Re-display
  displayPagesIn3DReader();
}

// =============================================
//  WOW-UPGRADE AUDIO SYNTHESIS & EFFECTS
// =============================================

window.playBloomSound = function() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    
    [1046.50, 1318.51].forEach((f, idx) => {
      const delay = idx * 0.08;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + delay);
      
      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(0.12, now + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.35);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + 0.38);
    });
  } catch(e){}
};

window.playMechanicalClickSound = function() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(12, now + 0.04);
    
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  } catch(e) {}
};

window.playBoutiqueBellSound = function() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    
    [987.77, 1318.51].forEach((f, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const delay = idx * 0.12;
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + delay);
      
      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(0.12, now + delay + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.7);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + 0.8);
    });
  } catch(e) {}
};

window.playWaxSealStampSound = function() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    
    // 1. Heavy thud/stomp
    const osc = audioCtx.createOscillator();
    const oscGain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(75, now);
    osc.frequency.exponentialRampToValueAtTime(8, now + 0.14);
    oscGain.gain.setValueAtTime(0.25, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    osc.connect(oscGain);
    oscGain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
    
    // 2. Melting wax sizzle (highpass noise)
    const bufferSize = audioCtx.sampleRate * 0.22;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioCtx.sampleRate * 0.05));
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 4200;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.05, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start(now + 0.02);
  } catch(e) {}
};

// =============================================
//  SOUND LOOPS GENERATION (OFFLINE SYNTHESIS)
// =============================================

function createVinylStaticBuffer(ctx) {
  const rate = ctx.sampleRate;
  const len = Math.floor(rate * 2.0); 
  const buf = ctx.createBuffer(1, len, rate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.015; // Tăng âm lượng xè xè của đĩa than
    
    if (Math.random() < 0.0004) {
      const spikeLen = Math.floor(Math.random() * 10) + 4;
      for (let j = 0; j < spikeLen && (i + j) < len; j++) {
        data[i + j] += (Math.random() * 2 - 1) * 0.25 * Math.exp(-j / 2.5); // Tiếng nổ tách tách lớn hơn
      }
    }
  }
  return buf;
}

function createCassetteMotorBuffer(ctx) {
  const rate = ctx.sampleRate;
  const len = Math.floor(rate * 2.0);
  const buf = ctx.createBuffer(1, len, rate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    const hum = Math.sin(2 * Math.PI * 55 * (i / rate)) * 0.07 + // Tiếng motor rõ hơn
                Math.sin(2 * Math.PI * 110 * (i / rate)) * 0.02;
    const hiss = (Math.random() * 2 - 1) * 0.01;
    data[i] = hum + hiss;
  }
  return buf;
}

function createSandTrickleBuffer(ctx) {
  const rate = ctx.sampleRate;
  const len = Math.floor(rate * 1.5);
  const buf = ctx.createBuffer(1, len, rate);
  const data = buf.getChannelData(0);
  let filterVal = 0;
  for (let i = 0; i < len; i++) {
    const n = (Math.random() * 2 - 1);
    filterVal = 0.9 * filterVal + 0.1 * n;
    const hp = n - filterVal;
    const amp = 0.025 + 0.01 * Math.sin(2 * Math.PI * 6.5 * (i / rate)) * Math.sin(2 * Math.PI * 0.6 * (i / rate)); // Tiếng cát chảy rõ hơn
    data[i] = hp * amp;
  }
  return buf;
}
// Soundscape states
let vinylStaticSource = null;
let cassetteMotorSource = null;
let sandTrickleSource = null;


// Wood Stamp Sound Synthesizer via Web Audio API (Wooden mechanical stamp click)
window.playStampSound = function() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;
    
    // First tap
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(140, now);
    osc1.frequency.exponentialRampToValueAtTime(35, now + 0.07);
    gain1.gain.setValueAtTime(0.4, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.07);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + 0.07);
    
    // Second tap (slight mechanical echo)
    const delay = 0.11;
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(110, now + delay);
    osc2.frequency.exponentialRampToValueAtTime(25, now + delay + 0.09);
    gain2.gain.setValueAtTime(0.3, now + delay);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.09);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(now + delay);
    osc2.stop(now + delay + 0.09);
  } catch(e) {
    console.error("Failed to play stamp sound:", e);
  }
};

// Premium Invoice Receipt overlay
window.showPremiumInvoiceReceipt = function(item) {
  // Clear any existing overlay
  const oldOverlay = document.getElementById('premium-invoice-overlay');
  if (oldOverlay) oldOverlay.remove();
  
  const overlay = document.createElement('div');
  overlay.id = 'premium-invoice-overlay';
  overlay.className = 'vintage-invoice-overlay';
  
  const dt = new Date();
  const dateStr = dt.toLocaleDateString('vi-VN') + ' ' + dt.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
  
  let headerTitle = 'TEEHAUS BOUTIQUE';
  let subTitle = 'Hóa Đơn Thanh Toán Cổ Điển';
  let sealColor = '#80081d';
  let borderStroke = '#ffe082';
  let insignia = '<circle cx="50" cy="50" r="12" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2"/>';

  if (item.skinClass === 'forest-moss') {
    headerTitle = 'RỪNG THÔNG XANH NẮNG';
    subTitle = 'Hóa Đơn Thảo Mộc Cổ Kính';
    sealColor = '#396153';
    borderStroke = '#B08F7A';
    insignia = '<path d="M50 25 L50 70 M50 60 L38 52 M50 60 L62 52 M50 48 L40 42 M50 48 L60 42 M50 36 L43 32 M50 36 L57 32" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="2.5" stroke-linecap="round"/>';
  } else if (item.skinClass === 'kaiserin-rose') {
    headerTitle = "NORDIC ROSE CABIN";
    subTitle = "Thư Gửi Từ Căn Nhà Gỗ";
    sealColor = '#b85a4b'; // Terracotta red wax seal
    borderStroke = '#7a6655'; // Aged Oak stroke
    insignia = '<path d="M50 20 C46 16 38 20 42 26 C36 22 32 30 40 34 C34 38 42 42 46 38" fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="2" stroke-linecap="round"/><path d="M46 38 Q46 54 36 60" fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="2" stroke-linecap="round"/>';
  } else if (item.skinClass === 'sea-glass') {
    headerTitle = 'TRANSATLANTIC VIỄN DƯƠNG';
    subTitle = 'Vé Tàu Hải Hành Thế Kỷ 19';
    sealColor = '#2A4D88'; // Deep Blue
    borderStroke = '#B1BBC8'; // Glacial Salt
    insignia = '<circle cx="50" cy="50" r="14" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="2"/><path d="M50 28 L50 72 M28 50 L72 50 M36 36 L64 64 M36 64 L64 36" stroke="rgba(255,255,255,0.85)" stroke-width="2" stroke-linecap="round"/><polygon points="50,42 53,50 50,58 47,50" fill="rgba(255,255,255,0.85)"/><polygon points="42,50 50,47 58,50 50,53" fill="rgba(255,255,255,0.85)"/>';
  } else if (item.skinClass === 'italian-summer') {
    headerTitle = 'ESTATE ITALIANA VIAGGIO';
    subTitle = 'Vé Tàu Tốc Hành Sorrento - Positano';
    sealColor = '#CA6702'; // Terracotta
    borderStroke = '#005F73'; // Majolica Blue
    insignia = '<circle cx="50" cy="50" r="8" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="2.5"/><path d="M50 28 L50 34 M50 66 L50 72 M28 50 L34 50 M66 50 L72 50 M34 34 L39 39 M61 61 L66 66 M34 66 L39 61 M61 39 L66 34" stroke="rgba(255,255,255,0.85)" stroke-width="2.5" stroke-linecap="round"/>';
  } else if (item.skinClass === 'kalligraphie') {
    headerTitle = 'KYOTO WASHI CO-DO';
    subTitle = 'Thư Điệp Hoa Anh Đào Cổ Đô';
    sealColor = '#705844';
    borderStroke = '#dfa2ad';
    insignia = '<path d="M50 34 C46 30 42 38 46 42 C40 38 34 42 38 46 C34 50 42 54 46 50 C42 54 46 62 50 58 C54 62 58 54 54 50 C58 54 66 50 62 46 C66 42 60 38 54 42 C58 38 54 30 50 34 Z" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="2" stroke-linejoin="round"/><circle cx="50" cy="46" r="3" fill="rgba(255,255,255,0.85)"/>';
  }
  
  overlay.innerHTML = 
    '<div class="vintage-invoice-receipt invoice-' + item.skinClass + '" id="invoice-receipt-card">' +
    '  <div style="text-align:center; border-bottom:1px dashed var(--border-color); padding-bottom:0.75rem; margin-bottom:1rem;">' +
    '    <h2 style="font-size:1.3rem; font-weight:700; margin:0; letter-spacing:1px;">' + headerTitle + '</h2>' +
    '    <span style="font-size:0.75rem; opacity:0.8;">' + subTitle + '</span>' +
    '  </div>' +
    '  <div style="font-size:0.85rem; line-height:1.6; margin-bottom:1.5rem;">' +
    '    <div><b>Thời gian:</b> ' + dateStr + '</div>' +
    '    <div><b>Giao dịch:</b> Mở khóa Combo Premium</div>' +
    '    <div style="margin-top:0.5rem; border-top:1px dashed var(--border-color); padding-top:0.5rem;">' +
    '      <div style="display:flex; justify-content:space-between;">' +
    '        <span>Combo: ' + item.name + '</span>' +
    '      </div>' +
    '      <div style="display:flex; justify-content:space-between; margin-top:0.25rem;">' +
    '        <span>Thành tiền:</span>' +
    '        <b>' + item.price + ' xu</b>' +
    '      </div>' +
    '    </div>' +
    '  </div>' +
    '  <div style="text-align:center; position:relative; height:70px; margin-bottom:1rem; display:flex; align-items:center; justify-content:center;">' +
    '    <!-- Wax Seal Placeholder -->' +
    '    <div id="invoice-seal" class="invoice-seal-stamp hidden">' +
    '      <svg viewBox="0 0 100 100" style="width:70px; height:70px;">' +
    '        <circle cx="50" cy="50" r="45" fill="' + sealColor + '" stroke-width="0"/>' +
    '        <circle cx="50" cy="50" r="38" fill="none" stroke="' + borderStroke + '" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.6"/>' +
    insignia +
    '      </svg>' +
    '    </div>' +
    '  </div>' +
    '  <div style="text-align:center;">' +
    '    <button class="btn btn-primary" id="invoice-apply-btn" style="width:100%; padding:0.6rem; border-radius:4px; cursor:pointer;">Nhận Hàng & Áp Dụng</button>' +
    '  </div>' +
    '</div>';
    
  document.body.appendChild(overlay);
  
  // Animate stamp after delay
  setTimeout(() => {
    const seal = document.getElementById('invoice-seal');
    if (seal) {
      seal.classList.remove('hidden');
      if (typeof window.playStampSound === 'function') {
        window.playStampSound();
      }
    }
  }, 600);
  
  // Close and apply click handler
  document.getElementById('invoice-apply-btn').onclick = function() {
    if (typeof window.playPaperRustleSound === 'function') {
      window.playPaperRustleSound();
    }
    
    // Page turn animation
    const card = document.getElementById('invoice-receipt-card');
    card.style.transformOrigin = 'left center';
    card.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.5s';
    card.style.transform = 'rotateY(-90deg) scale(0.9)';
    card.style.opacity = '0';
    
    setTimeout(() => {
      appState.selectedSkin = item.skinClass;
      appState.selectedTheme = item.themeClass;
      window.applySkin(item.skinClass);
      window.applyTheme(item.themeClass);
      saveState();
      refreshSettings();
      overlay.style.transition = 'opacity 0.4s';
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.remove();
        customAlert(`Kích hoạt thành công chủ đề "${item.name}"!`);
      }, 400);
    }, 450);
  };
};

// =============================================
//  CANVAS PARTICLES ENGINE (MOUSE INTERACTION)
// =============================================

let mouseX = -9999;
let mouseY = -9999;
window.initCanvasParticles = function() {
  const canvas = document.getElementById('bg-particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();
  
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  
  window.addEventListener('mouseleave', () => {
    mouseX = -9999;
    mouseY = -9999;
  });
  
  const particles = [];
  const maxParticles = 25;
  
  class Particle {
    constructor() {
      this.reset(true);
    }
    reset(init = false) {
      this.x = Math.random() * canvas.width;
      this.size = Math.random() * 8 + 4;
      this.vx = Math.random() * 0.8 - 0.4;
      this.vy = Math.random() * 0.5 + 0.25; 
      this.angle = Math.random() * Math.PI * 2;
      this.spin = Math.random() * 0.02 - 0.01;
      this.wobble = Math.random() * Math.PI * 2;
      this.wobbleSpeed = Math.random() * 0.03 + 0.015;
      this.particleType = Math.floor(Math.random() * 3);
      
      const skin = document.documentElement.getAttribute('data-skin') || 'lilac-birch';
      this.isFirefly = false;
      this.y = init ? Math.random() * canvas.height : -20;
      
      // Slow down velocity for kaiserin-rose (Nordic Rose Cabin) to feel like drifting winter snow
      if (skin === 'kaiserin-rose') {
        this.vx = Math.random() * 0.36 - 0.18;
        this.vy = Math.random() * 0.24 + 0.12; 
      } else if (skin === 'sea-glass') {
        this.vx = Math.random() * 0.32 - 0.16; // falling 60% slower
        this.vy = Math.random() * 0.2 + 0.1;
      } else if (skin === 'italian-summer') {
        this.vx = Math.random() * 0.4 - 0.2; // warm light breeze
        this.vy = Math.random() * 0.3 + 0.15; // falling slowly
      }
      
      if (skin === 'lilac-birch') this.color = 'rgba(181, 158, 201, 0.7)'; // tím oải hương nhạt
      else if (skin === 'brass') this.color = 'rgba(229, 192, 96, 0.75)'; // vàng nhũ gold
      else if (skin === 'mahogany') this.color = 'rgba(180, 75, 55, 0.7)'; // đỏ gỗ gụ
      else if (skin === 'silver') this.color = 'rgba(148, 163, 184, 0.65)'; // bạc sáng
      else if (skin === 'forest-moss') {
        // 35% are fireflies floating upwards, 65% are falling pine needles
        this.isFirefly = Math.random() < 0.35;
        if (this.isFirefly) {
          this.color = 'rgba(235, 220, 100, ' + (Math.random() * 0.5 + 0.35) + ')'; // warm yellow glow
          this.vy = -(Math.random() * 0.16 + 0.06); // float up 60% slower
          this.vx = Math.random() * 0.16 - 0.08;
          this.y = init ? Math.random() * canvas.height : canvas.height + 20; // fireflies start from bottom
        } else {
          this.color = 'rgba(80, 98, 53, 0.75)'; // Warm deep green/olive pine needle
          this.vx = Math.random() * 0.32 - 0.16; // falling 60% slower
          this.vy = Math.random() * 0.2 + 0.1;
        }
      }
      else if (skin === 'kaiserin-rose') {
        // Soft dusty rose & sand cream flower petals for Nordic Rose
        if (Math.random() < 0.45) {
          this.color = 'rgba(230, 210, 185, 0.75)'; // Sand from palette
        } else {
          this.color = 'rgba(203, 141, 149, 0.75)'; // Dusty Rose from palette
        }
      }
      else if (skin === 'sea-glass') {
        const colors = ['rgba(168, 211, 213, 0.65)', 'rgba(130, 186, 187, 0.65)', 'rgba(215, 238, 239, 0.75)'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }
      else if (skin === 'italian-summer') {
        // Lemon blossom petals (Cream Gelato) & lemon peel shavings (Citrus Zest)
        if (Math.random() < 0.4) {
          this.color = 'rgba(248, 230, 160, 0.85)'; // Cream Gelato white-yellow
        } else {
          this.color = 'rgba(255, 166, 43, 0.9)'; // Citrus Zest orange-yellow
        }
      }
      else if (skin === 'kalligraphie') this.color = 'rgba(255, 183, 197, 0.75)'; // hồng anh đào Nhật Bản
      else this.color = 'rgba(229, 192, 96, 0.7)';
      
      this.type = 'sparkle';
    }
    update() {
      this.angle += this.spin;
      
      const skin = document.documentElement.getAttribute('data-skin') || 'lilac-birch';
      if ((skin === 'forest-moss' && !this.isFirefly) || skin === 'sea-glass' || skin === 'italian-summer') {
        this.wobble += this.wobbleSpeed;
        this.x += Math.sin(this.wobble) * 0.25;
      }
      
      const dx = this.x - mouseX;
      const dy = this.y - mouseY;
      const dist = Math.hypot(dx, dy);
      const limit = 120;
      if (dist < limit) {
        const force = (limit - dist) / limit;
        const angle = Math.atan2(dy, dx);
        this.x += Math.cos(angle) * force * 4.5;
        this.y += Math.sin(angle) * force * 4.5;
      }
      
      this.x += this.vx;
      this.y += this.vy;
      
      if (this.y > canvas.height + 20 || this.y < -20 || this.x < -20 || this.x > canvas.width + 20) {
        this.reset(false);
      }
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      
      const skin = document.documentElement.getAttribute('data-skin') || 'lilac-birch';
      if (this.isFirefly) {
        ctx.fillStyle = this.color;
        ctx.shadowColor = 'rgba(235, 220, 100, 0.8)';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (skin === 'kaiserin-rose') {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.bezierCurveTo(this.size * 0.8, -this.size * 0.8, this.size * 0.8, this.size * 0.5, 0, this.size);
        ctx.bezierCurveTo(-this.size * 0.8, this.size * 0.5, -this.size * 0.8, -this.size * 0.8, 0, -this.size);
        ctx.fill();
      } else if (skin === 'forest-moss') {
        ctx.scale(Math.sin(this.wobble), 1);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        switch (this.particleType) {
          case 0: // Single slender needle
            ctx.moveTo(0, -this.size);
            ctx.lineTo(0, this.size);
            break;
          case 1: // Double needle (V-shape)
            ctx.moveTo(0, -this.size);
            ctx.lineTo(-2, this.size);
            ctx.moveTo(0, -this.size);
            ctx.lineTo(2, this.size);
            break;
          case 2: // Triple-needle branch (mini pine branch)
            ctx.moveTo(0, -this.size);
            ctx.lineTo(0, this.size);
            ctx.moveTo(0, -this.size * 0.4);
            ctx.lineTo(-3, this.size * 0.2);
            ctx.moveTo(0, -this.size * 0.4);
            ctx.lineTo(3, this.size * 0.2);
            break;
        }
        ctx.stroke();
      } else if (skin === 'sea-glass') {
        ctx.scale(Math.sin(this.wobble), 1);
        // Draw polished sea glass shards
        ctx.fillStyle = this.color;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.quadraticCurveTo(this.size * 0.7, -this.size * 0.4, this.size * 0.5, this.size * 0.5);
        ctx.quadraticCurveTo(0, this.size * 0.8, -this.size * 0.5, this.size * 0.5);
        ctx.quadraticCurveTo(-this.size * 0.7, -this.size * 0.4, 0, -this.size);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (skin === 'italian-summer') {
        ctx.scale(Math.sin(this.wobble), 1);
        if (this.particleType === 0) {
          // Lemon blossom petal
          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.moveTo(0, -this.size);
          ctx.bezierCurveTo(this.size * 0.5, -this.size * 0.5, this.size * 0.5, this.size * 0.5, 0, this.size);
          ctx.bezierCurveTo(-this.size * 0.5, this.size * 0.5, -this.size * 0.5, -this.size * 0.5, 0, -this.size);
          ctx.fill();
        } else {
          // Lemon peel shaving
          ctx.strokeStyle = this.color;
          ctx.lineWidth = 1.8;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(-this.size * 0.6, -this.size * 0.3);
          ctx.quadraticCurveTo(0, this.size * 0.6, this.size * 0.6, -this.size * 0.3);
          ctx.stroke();
        }
      } else if (skin === 'kalligraphie') {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.bezierCurveTo(-this.size * 0.6, -this.size * 0.8, -this.size * 0.8, 0, 0, this.size);
        ctx.bezierCurveTo(this.size * 0.8, 0, this.size * 0.6, -this.size * 0.8, 0, -this.size);
        ctx.lineTo(0, -this.size * 0.55); // Notch at top of sakura petal
        ctx.fill();
      } else {
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        grad.addColorStop(0, this.color);
        grad.addColorStop(0.3, this.color);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    }
  }
  
  for (let i = 0; i < maxParticles; i++) {
    particles.push(new Particle());
  }
  
  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(loop);
  }
  loop();
};

// =============================================
//  TEAPOT SKIN SVG & WELCOME LETTER & WAX SEAL ANIM
// =============================================

window.getTeapotSkinSVG = function(skin) {
  let bodyFill = '#faf0e6'; 
  let strokeColor = '#9b84b5'; 
  let handleStroke = '#7a6495';
  let patternHtml = ''; 
  
  if (skin === 'brass') {
    bodyFill = 'url(#brass-grad)';
    strokeColor = '#8b6508';
    handleStroke = '#8b6508';
    patternHtml = `
      <defs>
        <linearGradient id="brass-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffe082" />
          <stop offset="50%" stop-color="#b8860b" />
          <stop offset="100%" stop-color="#ffe082" />
        </linearGradient>
      </defs>
      <path d="M 28 26 Q 32 22, 36 26" fill="none" stroke="#7d5e27" stroke-width="1"/>
      <path d="M 26 30 Q 32 26, 38 30" fill="none" stroke="#7d5e27" stroke-width="1"/>
    `;
  } else if (skin === 'mahogany') {
    bodyFill = 'url(#mahogany-grad)';
    strokeColor = '#2a0c07';
    handleStroke = '#2a0c07';
    patternHtml = `
      <defs>
        <linearGradient id="mahogany-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#5a1e15" />
          <stop offset="50%" stop-color="#320d08" />
          <stop offset="100%" stop-color="#4a150e" />
        </linearGradient>
      </defs>
      <path d="M 26 22 C 30 23, 34 21, 38 23" fill="none" stroke="#1d0604" stroke-width="0.8" opacity="0.6"/>
      <path d="M 24 29 C 30 30, 33 27, 40 29" fill="none" stroke="#1d0604" stroke-width="0.8" opacity="0.6"/>
    `;
  } else if (skin === 'silver') {
    bodyFill = 'url(#silver-grad)';
    strokeColor = '#475569';
    handleStroke = '#475569';
    patternHtml = `
      <defs>
        <linearGradient id="silver-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f8fafc" />
          <stop offset="50%" stop-color="#cbd5e1" />
          <stop offset="100%" stop-color="#94a3b8" />
        </linearGradient>
      </defs>
    `;
  } else {
    patternHtml = `
      <g stroke="#9b84b5" stroke-width="1" fill="none">
        <path d="M 28 30 Q 28 22, 30 20 M 34 32 Q 35 24, 37 22" />
      </g>
      <circle cx="30" cy="20" r="1.5" fill="#8e62ad"/>
      <circle cx="28" cy="23" r="1.5" fill="#8e62ad"/>
      <circle cx="37" cy="22" r="1.5" fill="#8e62ad"/>
      <circle cx="35" cy="25" r="1.5" fill="#8e62ad"/>
    `;
  }
  
  return `
    <svg width="42" height="34" viewBox="0 0 64 50" xmlns="http://www.w3.org/2000/svg">
      ${patternHtml}
      <path d="M 16 28 C 4 28, 2 16, 12 12 C 15 11, 17 13, 17 14" fill="none" stroke="${handleStroke}" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M 48 26 Q 56 18, 58 10 Q 54 10, 46 18" fill="none" stroke="${strokeColor}" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M 16 28 C 16 14, 48 14, 48 28 C 48 40, 16 40, 16 28 Z" fill="${bodyFill}" stroke="${strokeColor}" stroke-width="2"/>
      <path d="M 22 14 Q 32 9, 42 14 L 40 11 H 24 Z" fill="${bodyFill}" stroke="${strokeColor}" stroke-width="2"/>
      <circle cx="32" cy="9" r="3" fill="${strokeColor}"/>
      <path d="M 25 39 L 27 42 H 37 L 39 39 Z" fill="${strokeColor}"/>
    </svg>
  `;
};

window.showWelcomeLetter = function() {
  const overlay = document.getElementById('welcome-quill-letter');
  const content = document.getElementById('welcome-letter-content');
  if (!overlay || !content) return;
  
  const hour = new Date().getHours();
  let greetingDe = '';
  let greetingVi = '';
  if (hour < 12) {
    greetingDe = 'Guten Morgen, meine liebe Schwester!';
    greetingVi = 'Chào buổi sáng chị yêu nhé!';
  } else if (hour < 18) {
    greetingDe = 'Guten Tag, meine liebe Schwester!';
    greetingVi = 'Chúc chị một ngày tốt lành nhé!';
  } else {
    greetingDe = 'Guten Abend, meine liebe Schwester!';
    greetingVi = 'Chào buổi tối ấm áp nhé chị!';
  }
  
  content.innerHTML = `
    <h3>${greetingDe}</h3>
    <p>${greetingVi} Chào mừng chị đã quay trở lại với <strong>Das TeeHaus</strong>. Hôm nay hãy cùng ủ một tách trà ấm, chọn một cuốn sách hay trên giá gỗ sồi và tiếp tục hành trình học tiếng Đức thật thư thái nhé!</p>
    <p style="font-style:italic; font-size:0.95rem; color:#5d4037; text-align:center; border-top:1px dashed #d7ccc8; padding-top:0.75rem; margin-top:1rem;">
      "Man reist nicht, um dem Leben zu entfliehen, sondern damit einem das Leben nicht entflieht."<br>
      <span style="font-size: 0.82rem; color: #795548; font-style: normal; display: block; margin-top: 0.25rem;">
        (Chúng ta đi không phải để trốn tránh cuộc đời, mà là để cuộc đời không trốn tránh chúng ta)
      </span>
    </p>
    <div class="signature">Das TeeHaus</div>
  `;
  
  overlay.classList.remove('hidden');
  
  setTimeout(() => {
    if (typeof playSynthChime === 'function') playSynthChime();
  }, 400);
};

window.closeWelcomeLetter = function() {
  const overlay = document.getElementById('welcome-quill-letter');
  if (overlay) {
    overlay.style.opacity = '0';
    setTimeout(() => {
      try {
        overlay.classList.add('hidden');
        overlay.style.opacity = '1';
      } catch (e) {
        console.error("Failed to hide welcome letter", e);
      }
      
      try {
        // Auto-trigger onboarding tour if never seen before
        if (localStorage.getItem('hasSeenOnboardingTour') !== 'true') {
          setTimeout(() => {
            if (typeof startOnboardingTour === 'function') startOnboardingTour();
          }, 600);
        }
      } catch (e) {
        console.warn("localStorage or tour startup blocked:", e);
      }
    }, 500);
  }
  try {
    if (typeof window.playPaperRustleSound === 'function') {
      window.playPaperRustleSound();
    }
  } catch (e) {}
};

window.triggerWaxSealAnimation = function(waxSealId) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'welcome-letter-overlay';
    overlay.style.zIndex = '999999';
    overlay.style.backgroundColor = 'rgba(26, 17, 14, 0.6)';
    
    const sealSvg = typeof getWaxSealSVG === 'function' ? getWaxSealSVG(waxSealId || 'seal-classic', 70) : '⚜️';
    
    overlay.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; position:relative; height: 260px; justify-content: flex-end;">
        <div id="stamp-brass-handle" style="font-size: 5.5rem; position: absolute; top: -140px; transform: translateY(0); transition: transform 0.5s cubic-bezier(0.6, -0.28, 0.735, 0.045); filter: drop-shadow(0 8px 12px rgba(0,0,0,0.4));">🪵</div>
        <div id="wax-hot-puddle" style="width: 80px; height: 80px; border-radius: 50%; background: radial-gradient(circle, #e63946 0%, #b71c1c 100%); box-shadow: 0 0 25px #ff4d6d; transform: scale(0.6); transition: all 0.4s ease; display:flex; align-items:center; justify-content:center;"></div>
        <div style="margin-top: 2rem; color: #fff; font-family: 'Playfair Display', serif; font-size: 1.15rem; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">Đang niêm phong nhật ký bằng sáp...</div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    if (typeof window.playWaxSealStampSound === 'function') {
      window.playWaxSealStampSound();
    }
    
    setTimeout(() => {
      const handle = document.getElementById('stamp-brass-handle');
      const puddle = document.getElementById('wax-hot-puddle');
      
      if (handle) handle.style.transform = 'translateY(140px)';
      if (puddle) {
        puddle.style.transform = 'scale(1.15)';
        puddle.style.boxShadow = '0 4px 10px rgba(0,0,0,0.3)';
      }
      
      setTimeout(() => {
        if (puddle) {
          puddle.innerHTML = sealSvg;
          puddle.style.background = 'radial-gradient(circle, #b71c1c 40%, #7f0000 100%)';
          puddle.style.boxShadow = '0 6px 12px rgba(0,0,0,0.4)';
        }
        
        setTimeout(() => {
          if (handle) handle.style.transform = 'translateY(-40px)';
          
          setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => {
              overlay.remove();
              resolve();
            }, 500);
          }, 800);
        }, 300);
      }, 250); 
    }, 300);
  });
};

// =============================================
//  SUPABASE DATABASE & AUTHENTICATION SYNC
// =============================================
let supabaseSyncTimeout = null;

function initSupabaseAuth() {
  const header = document.getElementById('auth-card-header');
  const configSection = document.getElementById('supabase-config-section');
  const saveConfigBtn = document.getElementById('sb-save-config-btn');
  const urlInput = document.getElementById('sb-url-input');
  const keyInput = document.getElementById('sb-key-input');

  // Double click header to show admin config
  if (header && configSection) {
    header.addEventListener('dblclick', () => {
      const isHidden = configSection.style.display === 'none';
      configSection.style.display = isHidden ? 'flex' : 'none';
    });
  }

  // Load configured keys from localStorage or default to hardcoded credentials
  const savedUrl = localStorage.getItem('supabase_url') || "https://swuupbyfvacotihivosf.supabase.co";
  const savedKey = localStorage.getItem('supabase_anon_key') || "sb_publishable_8eNltyK2KQRBEo5WWvf2_g_kp7NlD8n";
  
  if (urlInput) urlInput.value = savedUrl;
  if (keyInput) keyInput.value = savedKey;

  if (saveConfigBtn) {
    saveConfigBtn.addEventListener('click', () => {
      const url = urlInput.value.trim();
      const key = keyInput.value.trim();
      if (!url || !key) {
        customAlert('Vui lòng điền đầy đủ Supabase URL và Anon API Key.');
        return;
      }
      localStorage.setItem('supabase_url', url);
      localStorage.setItem('supabase_anon_key', key);
      customAlert('Đã lưu cấu hình kết nối! Trang web sẽ tải lại...');
      setTimeout(() => location.reload(), 1500);
    });
  }

  // Initialize Supabase if keys exist
  if (savedUrl && savedKey) {
    try {
      if (typeof supabase !== 'undefined') {
        window.supabaseClient = supabase.createClient(savedUrl, savedKey);
        setupAuthListeners();
        checkSupabaseSession();
      } else {
        console.warn("Supabase library not loaded yet.");
      }
    } catch(e) {
      console.error("Supabase init error:", e);
    }
  } else {
    showAuthStatus("Chưa cấu hình kết nối máy chủ. Nhấp đúp vào tiêu đề thẻ để thiết lập.", "var(--text-muted)");
  }
}

function showAuthStatus(msg, color) {
  const el = document.getElementById('auth-status-msg');
  if (el) {
    el.textContent = msg;
    el.style.color = color || 'var(--primary)';
  }
}

function updateAuthUI(user) {
  const loggedOutView = document.getElementById('auth-logged-out-view');
  const loggedInView = document.getElementById('auth-logged-in-view');
  const emailDisplay = document.getElementById('auth-user-email');

  if (user) {
    if (loggedOutView) loggedOutView.style.display = 'none';
    if (loggedInView) loggedInView.style.display = 'flex';
    if (emailDisplay) emailDisplay.textContent = user.email;
  } else {
    if (loggedOutView) loggedOutView.style.display = 'flex';
    if (loggedInView) loggedInView.style.display = 'none';
  }
  
  try { lucide.createIcons(); } catch(e) {}
}

function setupAuthListeners() {
  const loginBtn = document.getElementById('auth-login-btn');
  const signupBtn = document.getElementById('auth-signup-btn');
  const logoutBtn = document.getElementById('auth-logout-btn');
  const emailInput = document.getElementById('auth-email-input');
  const passwordInput = document.getElementById('auth-password-input');

  if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();
      if (!email || !password) {
        showAuthStatus('Vui lòng điền email và mật khẩu.', 'red');
        return;
      }
      showAuthStatus('Đang đăng nhập...', 'var(--primary)');
      try {
        const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email, password });
        if (error) {
          showAuthStatus(error.message, 'red');
        } else {
          showAuthStatus('Đăng nhập thành công!', '#386641');
          updateAuthUI(data.user);
          await loadStateFromSupabase(data.user.id);
        }
      } catch(e) {
        showAuthStatus('Lỗi đăng nhập: ' + e.message, 'red');
      }
    });
  }

  if (signupBtn) {
    signupBtn.addEventListener('click', async () => {
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();
      if (!email || !password) {
        showAuthStatus('Vui lòng điền email và mật khẩu.', 'red');
        return;
      }
      showAuthStatus('Đang đăng ký...', 'var(--primary)');
      try {
        const { data, error } = await window.supabaseClient.auth.signUp({ email, password });
        if (error) {
          showAuthStatus(error.message, 'red');
        } else {
          showAuthStatus('Đăng ký thành công! Hãy kiểm tra email để kích hoạt, hoặc thử đăng nhập.', '#386641');
        }
      } catch(e) {
        showAuthStatus('Lỗi đăng ký: ' + e.message, 'red');
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        const { error } = await window.supabaseClient.auth.signOut();
        if (error) {
          showAuthStatus(error.message, 'red');
        } else {
          updateAuthUI(null);
          showAuthStatus('Đã đăng xuất.', '#8c5a47');
        }
      } catch(e) {
        showAuthStatus('Lỗi đăng xuất: ' + e.message, 'red');
      }
    });
  }
}

async function checkSupabaseSession() {
  if (!window.supabaseClient) return;
  try {
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    if (session && session.user) {
      updateAuthUI(session.user);
      await loadStateFromSupabase(session.user.id);
    }
  } catch(e) {
    console.error("Session check failed:", e);
  }
}

async function loadStateFromSupabase(userId) {
  if (!window.supabaseClient) return;
  try {
    const { data, error } = await window.supabaseClient
      .from('user_data')
      .select('state')
      .eq('id', userId)
      .maybeSingle();
    if (error) {
      console.warn("Error fetching data from Supabase:", error.message);
      return;
    }
    if (data && data.state) {
      appState = { ...appState, ...data.state };
      localStorage.setItem(DB_KEY, JSON.stringify(appState));
      
      refreshDashboard();
      if (typeof renderBookshelf === 'function') renderBookshelf();
      if (typeof renderDiaryEntries === 'function') renderDiaryEntries();
      if (typeof initSettings === 'function') {
        const dailyGoalEl = document.getElementById('settings-daily-goal');
        if (dailyGoalEl && appState.settings) dailyGoalEl.value = appState.settings.dailyGoalMinutes || 45;
      }
      showAuthStatus('Đồng bộ dữ liệu đám mây thành công!', '#386641');
    } else {
      await triggerSupabaseUpload();
    }
  } catch(e) {
    console.error("Load state from Supabase failed:", e);
  }
}

async function triggerSupabaseUpload() {
  if (!window.supabaseClient) return;
  try {
    const { data: { user } } = await window.supabaseClient.auth.getUser();
    if (!user) return;
    
    const { error } = await window.supabaseClient
      .from('user_data')
      .upsert({
        id: user.id,
        state: appState,
        updated_at: new Date().toISOString()
      });
    if (error) {
      console.error("Supabase sync upload failed:", error.message);
    }
  } catch(e) {
    console.error("Supabase trigger upload failed:", e);
  }
}

function triggerSupabaseUploadDebounced() {
  if (supabaseSyncTimeout) clearTimeout(supabaseSyncTimeout);
  supabaseSyncTimeout = setTimeout(triggerSupabaseUpload, 1500);
}

// =============================================
//  INTERACTIVE ONBOARDING TOUR
// =============================================
const TOUR_STEPS = [
  {
    element: '.sidebar',
    title: 'Thanh Điều Hướng 🌸',
    text: 'Đây là nơi chị di chuyển giữa các phòng chức năng: Xem Thống kê, Tập trung ủ trà, Viết nhật ký, Đọc sách và vào Cửa hàng.',
    position: 'right'
  },
  {
    element: '.dashboard-grid',
    title: 'Phòng Trà Lịch Sử 🍵',
    text: 'Bảng điều khiển trung tâm hiển thị tiến trình học tập hôm nay, số đồng xu tích lũy và danh sách việc cần làm (To-Do).',
    position: 'bottom'
  },
  {
    element: '[data-tab="timer"]',
    title: 'Ủ Trà & Tập Trung ⏳',
    text: 'Bấm vào đây để chọn túi trà, mở nhạc Ambient thư giãn và tập trung học tập theo phương pháp Pomodoro cổ điển.',
    position: 'right'
  },
  {
    element: '[data-tab="diary"]',
    title: 'Nhật Ký Niêm Phong ✒️',
    text: 'Nơi viết nhật ký học tập mỗi ngày và niêm phong lại bằng dấu sáp nóng nghệ thuật để lưu trữ kỷ niệm.',
    position: 'right'
  },
  {
    element: '[data-tab="reading"]',
    title: 'Góc Đọc Lese-Ecke 📚',
    text: 'Không gian đọc sách ấm cúng. Chị có thể tải lên tệp sách Epub/Text để vừa đọc, vừa tra từ và ghi chú.',
    position: 'right'
  },
  {
    element: '[data-tab="settings"]',
    title: 'Tiệm Trà & Cài Đặt 🏪',
    text: 'Dùng đồng xu tích lũy mua thêm tách trà, nhạc mới trong cửa hàng và thiết lập tài khoản Supabase cho bạn bè cùng dùng.',
    position: 'right'
  }
];

let currentTourStep = 0;

function startOnboardingTour() {
  currentTourStep = 0;
  const overlay = document.getElementById('app-tour-overlay');
  if (overlay) {
    overlay.classList.remove('hidden');
    showTourStep(currentTourStep);
  }
  
  const nextBtn = document.getElementById('tour-next-btn');
  const skipBtn = document.getElementById('tour-skip-btn');
  const closeXBtn = document.getElementById('tour-close-x-btn');

  if (nextBtn && !nextBtn.dataset.listener) {
    nextBtn.dataset.listener = "true";
    nextBtn.addEventListener('click', () => {
      currentTourStep++;
      if (currentTourStep < TOUR_STEPS.length) {
        showTourStep(currentTourStep);
      } else {
        finishTour();
      }
    });
  }

  if (skipBtn && !skipBtn.dataset.listener) {
    skipBtn.dataset.listener = "true";
    skipBtn.addEventListener('click', skipTour);
  }

  if (closeXBtn && !closeXBtn.dataset.listener) {
    closeXBtn.dataset.listener = "true";
    closeXBtn.addEventListener('click', skipTour);
  }
}

function showTourStep(index) {
  const step = TOUR_STEPS[index];
  if (!step) return;

  const targetEl = document.querySelector(step.element);
  if (!targetEl) {
    currentTourStep++;
    if (currentTourStep < TOUR_STEPS.length) {
      showTourStep(currentTourStep);
    } else {
      finishTour();
    }
    return;
  }

  document.querySelectorAll('.tour-highlighted').forEach(el => {
    el.classList.remove('tour-highlighted');
  });

  if (targetEl) {
    targetEl.classList.add('tour-highlighted');
  }

  document.getElementById('tour-step-title').textContent = step.title;
  document.getElementById('tour-step-text').textContent = step.text;
  document.getElementById('tour-step-counter').textContent = `${index + 1}/${TOUR_STEPS.length}`;

  const nextBtn = document.getElementById('tour-next-btn');
  if (nextBtn) {
    nextBtn.textContent = (index === TOUR_STEPS.length - 1) ? 'Hoàn tất' : 'Tiếp theo';
  }

  if (targetEl) {
    setTimeout(() => {
      positionTourTooltip(targetEl, step.position);
    }, 50);
  }
}

function positionTourTooltip(element, position) {
  const rect = element.getBoundingClientRect();
  const tooltip = document.getElementById('app-tour-tooltip');
  const arrow = tooltip.querySelector('.tour-arrow');
  
  let top = 0;
  let left = 0;
  const margin = 15;

  if (position === 'right') {
    top = rect.top + (rect.height / 2) - (tooltip.offsetHeight / 2);
    left = rect.right + margin;
    arrow.className = 'tour-arrow arrow-left';
  } else if (position === 'bottom') {
    top = rect.bottom + margin;
    left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2);
    arrow.className = 'tour-arrow arrow-top';
  } else if (position === 'left') {
    top = rect.top + (rect.height / 2) - (tooltip.offsetHeight / 2);
    left = rect.left - tooltip.offsetWidth - margin;
    arrow.className = 'tour-arrow arrow-right';
  } else {
    top = rect.top - tooltip.offsetHeight - margin;
    left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2);
    arrow.className = 'tour-arrow arrow-bottom';
  }

  if (left < 10) left = 10;
  if (left + tooltip.offsetWidth > window.innerWidth - 10) {
    left = window.innerWidth - tooltip.offsetWidth - 10;
  }
  if (top < 10) top = 10;
  if (top + tooltip.offsetHeight > window.innerHeight - 10) {
    top = window.innerHeight - tooltip.offsetHeight - 10;
  }

  tooltip.style.top = top + 'px';
  tooltip.style.left = left + 'px';
}

function skipTour() {
  finishTour();
}

function finishTour() {
  const overlay = document.getElementById('app-tour-overlay');
  if (overlay) {
    overlay.classList.add('hidden');
  }
  document.querySelectorAll('.tour-highlighted').forEach(el => {
    el.classList.remove('tour-highlighted');
  });
  try {
    localStorage.setItem('hasSeenOnboardingTour', 'true');
  } catch (e) {
    console.warn("Could not save tour completion state:", e);
  }
  
  if (typeof playSynthChime === 'function') playSynthChime();
}




