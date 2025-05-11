import { Options } from "twind";

export default {
  selfURL: import.meta.url,
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0038A8", // Philippine flag blue
          50: "#E6EEFF",
          100: "#CCDEFF",
          200: "#99BDFF",
          300: "#669CFF",
          400: "#337BFF",
          500: "#0052FF",
          600: "#0047DE",
          700: "#0038A8", // Default primary
          800: "#002875",
          900: "#001642"
        },
        secondary: {
          DEFAULT: "#CE1126", // Philippine flag red
          50: "#FFEAED",
          100: "#FFD5DB",
          200: "#FFB3BC",
          300: "#FF8A98",
          400: "#FF6275",
          500: "#FF3952",
          600: "#FF102F",
          700: "#CE1126", // Default secondary
          800: "#9B0D1D",
          900: "#680914"
        },
        accent: {
          DEFAULT: "#FCD116", // Philippine flag yellow
          50: "#FFFDE6",
          100: "#FFF9CC",
          200: "#FFF299",
          300: "#FFEB66",
          400: "#FFE533",
          500: "#FCD116", // Default accent
          600: "#DAB100",
          700: "#A78600",
          800: "#745C00",
          900: "#413300"
        }
      }
    }
  }
} as Options;