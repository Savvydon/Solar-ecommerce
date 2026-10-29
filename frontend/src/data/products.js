import solarPanelImage from "../assets/products/solar-panel.png";
import inverterImage from "../assets/products/inverter1.jpg";
import batteryImage from "../assets/products/battery.jpg";
import solarKitImage from "../assets/products/MPPT Charge Controller 60A.jpg";
import accessoriesImage from "../assets/products/solar-accessories.png";

export const categories = ["All products", "Solar panels", "Inverters", "Batteries", "Solar kits", "Accessories"];

const seedProducts = [
  {
    id: "panel-550",
    name: "Monocrystalline Solar Panel 550W",
    brand: "SunPeak",
    model: "SP-M550",
    category: "Solar panels",
    price: 320000,
    oldPrice: 355000,
    rating: 4.8,
    reviews: 24,
    stock: 18,
    badge: "Best seller",
    image: solarPanelImage,
    description: "A high-efficiency monocrystalline panel designed for residential and commercial solar installations. A dependable option for building a scalable solar array.",
    specs: { "Rated power": "550 W", "Cell type": "Monocrystalline", "Application": "Residential / Commercial", "Warranty": "Product warranty varies by supplier" }
  },
  {
    id: "inverter-5kw",
    name: "Hybrid Solar Inverter 5kW",
    brand: "VoltEdge",
    model: "VE-HY5K",
    category: "Inverters",
    price: 480000,
    oldPrice: null,
    rating: 4.7,
    reviews: 18,
    stock: 9,
    badge: "Popular",
    image: inverterImage,
    description: "A hybrid inverter for solar, battery and grid-connected energy setups. Confirm voltage, battery compatibility and installation requirements before purchase.",
    specs: { "Rated output": "5 kW", "Type": "Hybrid", "Use": "Home / Small business", "Compatibility": "Confirm against exact system configuration" }
  },
  {
    id: "battery-5kwh",
    name: "Lithium Energy Storage Battery 5kWh",
    brand: "EverCell",
    model: "EC-LV5",
    category: "Batteries",
    price: 650000,
    oldPrice: null,
    rating: 4.9,
    reviews: 31,
    stock: 7,
    badge: "Premium",
    image: batteryImage,
    description: "A compact energy-storage option for suitable solar backup systems. Check voltage, BMS communication, charge limits and inverter compatibility before installation.",
    specs: { "Nominal energy": "5 kWh", "Chemistry": "Confirm with supplier", "Application": "Solar energy storage", "Installation": "Qualified installer recommended" }
  },
  {
    id: "kit-home",
    name: "Home Solar Starter Kit",
    brand: "Savvy Select",
    model: "SS-HOME-1K",
    category: "Solar kits",
    price: 1200000,
    oldPrice: 1350000,
    rating: 4.6,
    reviews: 12,
    stock: 5,
    badge: "Bundle deal",
    image: solarKitImage,
    description: "A starter bundle concept for customers exploring home solar. Confirm the exact included components and expected load capacity before ordering.",
    specs: { "Bundle type": "Home starter kit", "Included items": "See confirmed supplier package", "Sizing": "Depends on appliances and usage", "Installation": "Site assessment recommended" }
  },
  {
    id: "controller-mppt",
    name: "MPPT Solar Charge Controller",
    brand: "ChargePro",
    model: "CP-MPPT-60",
    category: "Accessories",
    price: 185000,
    oldPrice: null,
    rating: 4.5,
    reviews: 9,
    stock: 14,
    badge: "",
    image: accessoriesImage,
    description: "A charge controller category example. Confirm current rating, maximum PV input voltage and supported battery chemistry for the exact model.",
    specs: { "Type": "MPPT", "Rated current": "Confirm exact model", "PV voltage": "Confirm datasheet", "Battery support": "Confirm datasheet" }
  },
  {
    id: "cable-solar",
    name: "Solar DC Cable Set",
    brand: "PowerLink",
    model: "PL-DC-6MM",
    category: "Accessories",
    price: 28000,
    oldPrice: null,
    rating: 4.4,
    reviews: 6,
    stock: 30,
    badge: "",
    image: accessoriesImage,
    description: "Solar cable accessory listing. Select the appropriate conductor size, insulation, voltage rating and length for the installation.",
    specs: { "Product type": "Solar DC cable", "Size": "Confirm listing variant", "Length": "Confirm selected option", "Use": "Solar DC wiring" }
  }
];

const extraProducts = Array.from({ length: 118 }, (_, index) => {
  const source = seedProducts[index % seedProducts.length];
  const serial = index + 7;
  return { ...source, id: `${source.id}-demo-${serial}`, name: `${source.name} — Series ${serial}`, model: `${source.model}-${serial}`, price: Math.round(source.price * (0.82 + ((index % 9) * 0.045))), oldPrice: null, rating: Number((4.1 + ((index % 9) * 0.1)).toFixed(1)), reviews: 3 + ((index * 7) % 45), stock: 2 + ((index * 3) % 26), badge: index % 11 === 0 ? "New arrival" : "" };
});
export const products = [...seedProducts, ...extraProducts];
