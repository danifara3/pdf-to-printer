import { Printer } from "../index";

// map Windows-printer key to final printerData key
const properties: { [key: string]: keyof Printer } = {
  DeviceID: "deviceId",
  Name: "name",
  PrinterPaperNames: "paperSizes",
};

export default function isValidPrinter(printer: string): {
  isValid: boolean;
  printerData: Printer;
} {
  const printerData: Printer = {
    deviceId: "",
    name: "",
    paperSizes: [],
  };

  printer.split(/\r?\n/).forEach((line) => {
    const [labelRaw, valueRaw] = line.split(":").map((el) => el.trim());

    if (!labelRaw || !valueRaw) return; // skip invalid lines

    let value: string | string[] = valueRaw;

    // handle array dots safely
    if (typeof value === "string" && /^\{.*\.{3}\}$/.test(value)) {
      value = value.replace("...}", "}");
    }

    // handle array returns safely
    if (typeof value === "string") {
      const matches = value.match(/^{(.*)}$/);
      if (matches && matches[1]) {
        value = matches[1].split(", ");
      }
    }

    const key = properties[labelRaw];
    if (!key) return; // ignore unknown keys

    // assign safely
    // @ts-ignore
    printerData[key] = value;
  });

  const isValid = !!(printerData.deviceId && printerData.name);

  return { isValid, printerData };
}
