const products = [
  {
    id: 1,
    name: "Aura Soundwave ANC",
    tagline: "Uncompromised Acoustic Silence",
    category: "Audio",
    price: 299.00,
    rating: 4.8,
    image: "assets/soundwave.png",
    description: "Experience premium sound engineered for purists. Featuring custom 40mm dynamic drivers, hybrid active noise-cancellation (ANC), and up to 40 hours of battery life, the Aura Soundwave brings concert-hall acoustics to your daily commute.",
    longDescription: "Crafted for audiophiles who demand silence and fidelity. The Aura Soundwave ANC combines hybrid active noise-cancelling technology with custom-tuned 40mm beryllium drivers. The result is deep, articulate bass, rich midranges, and crystal-clear highs. Designed with a titanium headband wrap and memory-foam leatherette cups, it provides absolute comfort for long listening sessions. Seamless Bluetooth 5.2 connectivity and multi-device pairing ensure you stay connected across your phone and laptop.",
    specs: [
      { key: "Driver Size", value: "40mm Beryllium Dynamic" },
      { key: "Frequency Response", value: "10Hz - 40kHz" },
      { key: "ANC Depth", value: "Up to -42dB" },
      { key: "Battery Life", value: "40 Hours (ANC On) / 60 Hours (ANC Off)" },
      { key: "Connectivity", value: "Bluetooth 5.2 / 3.5mm Aux / USB-C" },
      { key: "Weight", value: "260g" }
    ],
    variants: {
      type: "Color",
      options: ["Matte Black", "Mineral Grey", "Sand Gold"]
    },
    reviews: [
      { author: "Evelyn K.", rating: 5, date: "2026-05-12", comment: "The noise cancellation is magical. Better than my studio monitors!" },
      { author: "Marcus T.", rating: 4, date: "2026-04-29", comment: "Sound quality is outstanding, and battery life is exactly as advertised. Slightly heavy on the headband." }
    ]
  },
  {
    id: 2,
    name: "Aura Keyset-X Keyboard",
    tagline: "Tactile Sophistication",
    category: "Accessories",
    price: 189.00,
    rating: 4.9,
    image: "assets/keyboard.png",
    description: "A solid walnut enclosure housing hot-swappable tactile switches, frosted brass accent plates, and premium PBT keycaps. Elegance meets functional longevity.",
    longDescription: "The Keyset-X redefines your workspace interface. Crafted from a single block of American walnut wood, each case displays a unique grain structure. The solid brass plate provides a rigid, satisfying typing feedback and a warm acoustic resonance. Pre-lubed linear switches and high-profile double-shot PBT keycaps provide a premium tactile feel that is soft on the hands and quiet enough for professional environments. Hot-swappable sockets let you customize your switches without soldering.",
    specs: [
      { key: "Form Factor", value: "75% Layout" },
      { key: "Case Material", value: "Genuine American Walnut" },
      { key: "Switch Type", value: "Lubed Linear Amber Switches (Hot-swappable)" },
      { key: "Mounting Style", value: "Gasket Mount" },
      { key: "Backlight", value: "Warm White Ambient LED" },
      { key: "Interface", value: "Detachable USB-C / Wireless 2.4GHz" }
    ],
    variants: {
      type: "Switch Type",
      options: ["Linear Amber (Silent)", "Tactile Jade (Clicky)", "Linear Ruby (Fast)"]
    },
    reviews: [
      { author: "Liam N.", rating: 5, date: "2026-05-20", comment: "A work of art on my desk. The wooden case gives a lovely deep sound profile." },
      { author: "Sophia R.", rating: 5, date: "2026-05-01", comment: "Incredibly responsive and absolutely gorgeous layout." }
    ]
  },
  {
    id: 3,
    name: "Aura Horizon Wool Mat",
    tagline: "Naturally Sourced Comfort",
    category: "Accessories",
    price: 59.00,
    rating: 4.7,
    image: "assets/woolmat.png",
    description: "Handcrafted from 100% Merino Wool felt and organic cork, providing a soft, thermal desk cover that enhances mouse tracking and workspace acoustics.",
    longDescription: "Transform your desktop with the Aura Horizon Desk Mat. Made from renewable Merino Wool felt, it acts as a soft layer under your keyboard, absorbing noise and providing thermal warmth. The base is made of natural Portuguese oak cork, preventing slippage while protecting your desk surface. Precision-stitched borders prevent fraying, guaranteeing a long-lasting addition to your setup.",
    specs: [
      { key: "Dimensions", value: "900mm x 300mm x 4mm" },
      { key: "Material", value: "100% Merino Wool Felt top, Organic Cork bottom" },
      { key: "Water Resistance", value: "Repellent to mild drops (Wool fat lanolin)" },
      { key: "Texture", value: "Medium-Soft Felt" }
    ],
    variants: {
      type: "Size",
      options: ["Medium (60x30cm)", "Large (90x30cm)", "Studio (120x60cm)"]
    },
    reviews: [
      { author: "Daniel H.", rating: 4, date: "2026-04-18", comment: "Feels amazing and keeps my wrists warm during winter work sessions." },
      { author: "Isabella L.", rating: 5, date: "2026-03-24", comment: "Premium texture, premium feel. Fits my desk layout perfectly!" }
    ]
  },
  {
    id: 4,
    name: "Aura Chrono-S Smartwatch",
    tagline: "Timeless Intelligence",
    category: "Wearables",
    price: 349.00,
    rating: 4.6,
    image: "assets/watch.png",
    description: "An elegant smartwatch styled as a classic chronograph. Encased in grade 5 titanium with an always-on sapphire glass AMOLED screen.",
    longDescription: "The Aura Chrono-S blends classic watchmaking heritage with cutting-edge health tracking. Constructed from aerospace-grade titanium, it is lightweight yet incredibly durable. Its vibrant, high-contrast always-on AMOLED display is protected by a scratch-resistant sapphire crystal dome. Running AuraOS, it tracks heart rate variability (HRV), blood oxygen saturation, sleep quality, and active stress, all while boasting a 7-day battery life.",
    specs: [
      { key: "Case Diameter", value: "42mm" },
      { key: "Case Material", value: "Grade 5 Titanium" },
      { key: "Glass Type", value: "Curved Sapphire Crystal" },
      { key: "Display", value: "1.39\" AMOLED (454x454, 326 ppi)" },
      { key: "Sensors", value: "Heart Rate, Pulse Ox, Gyroscope, Barometric Altimeter" },
      { key: "Battery Life", value: "Up to 7 Days (typical use)" }
    ],
    variants: {
      type: "Strap Material",
      options: ["Amber Leather", "Titanium Link Link", "Charcoal Sport Band"]
    },
    reviews: [
      { author: "Arthur J.", rating: 5, date: "2026-05-15", comment: "Finally, a smartwatch that actually looks like a premium watch." },
      { author: "Emma S.", rating: 4, date: "2026-05-02", comment: "Extremely lightweight. The health monitoring features are spot on, but custom faces are limited." }
    ]
  },
  {
    id: 5,
    name: "Aura Lumos Ambient Lamp",
    tagline: "Sculpted Illumination",
    category: "Home",
    price: 129.00,
    rating: 4.8,
    image: "assets/lamp.png",
    description: "A dimmable smart lamp featuring a hand-spun copper dome and a solid walnut base. Emits organic circadian lighting to mimic natural sunset profiles.",
    longDescription: "Create the perfect environment for focus and rest. Aura Lumos uses multi-channel warm LEDs covered by a hand-spun satin copper shade. The lamp features custom circadian programming that slowly shifts from bright daylight white to warm, soothing amber profiles as evening approaches. An integrated capacitive touch slider on the wooden base allows for granular dimming.",
    specs: [
      { key: "Brightness", value: "800 Lumens (Max)" },
      { key: "Color Temp Range", value: "1800K (Warm Amber) - 5000K (Cool White)" },
      { key: "Controls", value: "Touch Sensitive Wood Slider / Smart App Integration" },
      { key: "Power", value: "24W DC Power Adapter" },
      { key: "Base Diameter", value: "12cm" }
    ],
    variants: {
      type: "Finish",
      options: ["Satin Copper", "Carbon Black", "Chrome Silver"]
    },
    reviews: [
      { author: "Lucas M.", rating: 5, date: "2026-04-10", comment: "The circadian sunset dimming has improved my bedtime routine immensely." },
      { author: "Olivia P.", rating: 5, date: "2026-03-30", comment: "Beautiful sculptural piece even when it's turned off." }
    ]
  },
  {
    id: 6,
    name: "Aura Orbit Wireless Charger",
    tagline: "Magnetic Simplification",
    category: "Charging",
    price: 79.00,
    rating: 4.7,
    image: "assets/charger.png",
    description: "Qi2 wireless charging dock wrapped in premium Nappa leather and framed by an anodized aluminum ring, supporting MagSafe alignment up to 15W.",
    longDescription: "The Aura Orbit merges charging convenience with minimalist design. Built on the new Qi2 wireless standard, it magnetically locks your device into the optimal charging position. The charging surface is padded with top-grain Nappa leather, ensuring your phone's glass back remains pristine. Heavy enough to allow one-handed phone detachment.",
    specs: [
      { key: "Charging Standard", value: "Qi2 / MagSafe Compatible" },
      { key: "Output Power", value: "Up to 15W Fast Charge" },
      { key: "Materials", value: "Nappa Leather, Anodized Aluminum, Silicone Feet" },
      { key: "Cable", value: "Integrated 1.5m braided USB-C Cable" },
      { key: "Weight", value: "180g" }
    ],
    variants: {
      type: "Leather Color",
      options: ["Tan Nappa", "Obsidian Black", "Slate Grey"]
    },
    reviews: [
      { author: "Nathan D.", rating: 4, date: "2026-05-18", comment: "Solid charger. Heavy base means it doesn't move when I pick up my phone." },
      { author: "Chloe W.", rating: 5, date: "2026-05-09", comment: "The leather feels incredibly premium. It charges my iPhone fast." }
    ]
  }
];

// If using ES modules in browser or standard script include
if (typeof module !== 'undefined' && module.exports) {
  module.exports = products;
} else {
  window.products = products;
}
