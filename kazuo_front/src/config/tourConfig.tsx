import { Step } from "react-joyride";

export const getTourSteps = (t: (key: string) => string): Record<string, Step[]> => ({
  welcome: [
    {
      content: (
        <div className="text-center p-2">
          <h3 className="font-bold text-lg mb-2">{t("tour.welcome.title")}</h3>
          <p>{t("tour.welcome.content")}</p>
        </div>
      ),
      placement: "center",
      target: "body",
      disableBeacon: true,
    },
    {
      content: (
        <div className="p-2">
          <h3 className="font-bold text-lg mb-2">{t("tour.createStore.title")}</h3>
          <p>{t("tour.createStore.content")}</p>
        </div>
      ),
      target: "#tour-create-store-btn",
      placement: "bottom",
    },
    {
      content: (
        <div className="p-2">
          <h3 className="font-bold text-lg mb-2">{t("tour.profile.title")}</h3>
          <p>{t("tour.profile.content")}</p>
        </div>
      ),
      target: "#tour-profile-link",
      placement: "bottom",
    },
    {
      content: (
        <div className="p-2">
          <h3 className="font-bold text-lg mb-2">{t("tour.help.title")}</h3>
          <p>{t("tour.help.content")}</p>
        </div>
      ),
      target: "#tour-help-btn",
      placement: "bottom",
    },
  ],
  company: [
    {
      target: "#tour-company-section",
      content: (
        <div className="p-2">
          <h3 className="font-bold text-lg mb-2">{t("tour.company.title")}</h3>
          <p>{t("tour.company.content")}</p>
        </div>
      ),
      placement: "center",
    },
  ],
  inventory: [
    {
      target: "#tour-inventory-section",
      content: (
        <div className="p-2">
          <h3 className="font-bold text-lg mb-2">{t("tour.inventory.title")}</h3>
          <p>{t("tour.inventory.content")}</p>
        </div>
      ),
      placement: "center",
    },
  ],
  products: [
    {
      target: "#tour-products-section",
      content: (
        <div className="p-2">
          <h3 className="font-bold text-lg mb-2">{t("tour.products.title")}</h3>
          <p>{t("tour.products.content")}</p>
        </div>
      ),
      placement: "center",
    },
    {
      target: "#tour-add-product-btn",
      content: (
        <div className="p-2">
          <h3 className="font-bold text-lg mb-2">{t("tour.products.addBtnTitle")}</h3>
          <p>{t("tour.products.addBtnContent")}</p>
        </div>
      ),
      placement: "bottom",
    },
  ],
  statistics: [
    {
      target: "#tour-statistics-section",
      content: (
        <div className="p-2">
          <h3 className="font-bold text-lg mb-2">{t("tour.statistics.title")}</h3>
          <p>{t("tour.statistics.content")}</p>
        </div>
      ),
      placement: "center",
    },
  ],
  chatbot: [
    {
      target: "#tour-chatbot-btn",
      content: (
        <div className="p-2">
          <h3 className="font-bold text-lg mb-2">{t("tour.chatbot.title")}</h3>
          <p>{t("tour.chatbot.content")}</p>
        </div>
      ),
      placement: "top",
    },
  ],
});

export const RouteTourMap: Record<string, string> = {
  // "/": "welcome", // Removed to prevent broken tour on landing page
  "/Company": "company",
  "/register-company": "company",
  "/GestionInventario": "welcome", // Changed from "inventory" to "welcome" for better onboarding
  "/Products": "products",
  "/Statistics": "statistics",
};
