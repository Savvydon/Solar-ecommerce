import accessoriesImage from "../assets/products/accessories.svg";
import batteryImage from "../assets/products/battery.svg";
import controllerImage from "../assets/products/charge-controller.svg";
import inverterImage from "../assets/products/inverter.svg";
import solarKitImage from "../assets/products/solar-kit.svg";
import solarPanelImage from "../assets/products/solar-panel.svg";

const bundledProductImages = {
  "accessories.svg": accessoriesImage,
  "battery.svg": batteryImage,
  "charge-controller.svg": controllerImage,
  "inverter.svg": inverterImage,
  "solar-kit.svg": solarKitImage,
  "solar-panel.svg": solarPanelImage,
};

/**
 * Older database rows refer to /products/*.svg in the public directory.
 * Map those legacy paths to Vite-managed assets so updates in src/assets are
 * included in the production build. Uploaded absolute URLs remain unchanged.
 */
export function productImageUrl(imageUrl) {
  const value = String(imageUrl || "/products/solar-panel.svg").trim();
  if (/^https?:\/\//i.test(value)) return value;

  const filename = value.split(/[/?#]/).filter(Boolean).pop();
  if (filename && bundledProductImages[filename]) {
    return bundledProductImages[filename];
  }
  return value;
}
