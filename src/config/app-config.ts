import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Share Path",
  version: packageJson.version,
  copyright: `© ${currentYear}, Share Path.`,
  meta: {
    title: "Share Path - Red social para compartir itinerarios turísticos",
    description:
      "Share Path es una plataforma que permite a los viajeros crear, compartir y descubrir itinerarios turísticos personalizados.",
  },
};
