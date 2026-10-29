import accessoriesImage from "../assets/products/solar-accessories.jpg";
import batteryImage from "../assets/products/battery.jpg";
import controllerImage from "../assets/products/MPPT Charge Controller 60A.jpg";
import inverter1Image from "../assets/products/inverter1.jpg";
import inverter2Image from "../assets/products/inverter2.jpg";
import inverter3Image from "../assets/products/inverter3.jpg";
import inverter4Image from "../assets/products/inverter4.jpg";
import solarKitImage from "../assets/products/Home Solar Starter Kit.jpg";
import solarKit2Image from "../assets/products/solar kit2.jpg";
import solarPanelImage from "../assets/products/solar-panel.png";
import panel1Image from "../assets/products/panel1.jfif";
import panel2Image from "../assets/products/panel2.webp";
import panel4Image from "../assets/products/panel4.webp";
import solarBattery2Image from "../assets/products/sola battery2.png";
import solarAccessory3Image from "../assets/products/solar accessory3.webp";
import solarAccessory2Image from "../assets/products/solar-accessory2.webp";
import savvyImage from "../assets/products/savvy1.png";

const bundledProductImages = {
  // Legacy database image paths
  "accessories.svg": accessoriesImage,
  "battery.svg": batteryImage,
  "charge-controller.svg": controllerImage,
  "inverter.svg": inverter1Image,
  "solar-kit.svg": solarKitImage,
  "solar-panel.svg": solarPanelImage,
  // Current uploaded product assets
  "solar-accessories.jpg": accessoriesImage,
  "battery.jpg": batteryImage,
  "MPPT Charge Controller 60A.jpg": controllerImage,
  "inverter1.jpg": inverter1Image,
  "inverter2.jpg": inverter2Image,
  "inverter3.jpg": inverter3Image,
  "inverter4.jpg": inverter4Image,
  "Home Solar Starter Kit.jpg": solarKitImage,
  "solar kit2.jpg": solarKit2Image,
  "solar-panel.png": solarPanelImage,
  "panel1.jfif": panel1Image,
  "panel2.webp": panel2Image,
  "panel4.webp": panel4Image,
  "sola battery2.png": solarBattery2Image,
  "solar accessory3.webp": solarAccessory3Image,
  "solar-accessory2.webp": solarAccessory2Image,
  "savvy1.png": savvyImage,
};

/**
 * Map local database asset paths to Vite-managed imports. This lets product
 * records keep their image paths while ensuring images are bundled in builds.
 * Uploaded absolute URLs are passed through unchanged.
 */
export function productImageUrl(imageUrl) {
  const value = String(imageUrl || "/products/solar-panel.svg").trim();
  if (/^https?:\/\//i.test(value)) return value;

  const filename = value.split(/[/?#]/).filter(Boolean).pop();
  return (filename && bundledProductImages[filename]) || value;
}
