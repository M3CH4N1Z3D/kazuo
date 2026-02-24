"use client";
import Link from "next/link";
import { FaLinkedin, FaInstagram, FaGithub } from "react-icons/fa";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

type Platform = "instagram" | "linkedin" | "github";

// Definir tipo para los participantes
type Participant = {
  name: string;
  url: string;
};

export default function Footer() {
  const [t] = useTranslation("global");
  const pathname = usePathname();

  // Simulación de participantes por red social
  const participants: Record<Platform, Participant[]> = {
    instagram: [
      {
        name: "Fredy Rigueros",
        url: "https://www.instagram.com/fredyrigueros91",
      },
    ],
    linkedin: [
      {
        name: "Fredy Rigueros",
        url: "https://www.linkedin.com/in/fredy-rigueros-3a376a1b9/",
      },
    ],

    github: [
      { name: "Fredy Rigueros", url: "https://github.com/M3CH4N1Z3D" },
    ],
  };

  if (pathname === "/GestionInventario") return null;

  return (
    <footer className="bg-blue-900 text-white py-12 px-4">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-bold text-lg mb-4">{t("footer.followUs")}</h3>
          <div className="space-y-4">
            {Object.keys(participants).map((platform) => {
              const participant = participants[platform as Platform][0];
              return (
                <div key={platform}>
                  <Link
                    href={participant.url}
                    target="_blank"
                    className="flex items-center space-x-2 hover:underline"
                  >
                    {platform === "instagram" && (
                      <FaInstagram className="text-lg" />
                    )}
                    {platform === "linkedin" && (
                      <FaLinkedin className="text-lg" />
                    )}
                    {platform === "github" && <FaGithub className="text-lg" />}
                    <span>
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </span>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Secciones adicionales de Spot-On, Soluciones y Recursos */}
        <div>
          <h3 className="font-bold text-lg mb-4">{t("footer.kazuo")}</h3>
          <ul className="space-y-2">
            <li>
              <a href="/Nosotros" className="hover:underline">
                {t("footer.whoWeAre")}
              </a>
            </li>
            <li>
              <a href="/Ubicacion" className="hover:underline">
                {t("footer.location")}
              </a>
            </li>

            <li>
              <a href="/Contacto" className="hover:underline">
                {t("footer.contactUs")}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-4">{t("footer.solutions")}</h3>
          <ul className="space-y-2">
            <li>
              <a href="/Soluciones" className="hover:underline">
                {t("footer.managementSystem")}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-4">{t("footer.resources")}</h3>
          <ul className="space-y-2">
            <li>
              <a href="/Contacto" className="hover:underline">
                {t("footer.support")}
              </a>
            </li>
            <li>
              <a href="/Sobre Nosotros" className="hover:underline">
                {t("footer.developers")}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-12 text-sm text-blue-300">
        <p>
          {t("footer.cookiesDisclaimer")}{" "}
          <a href="#" className="underline">
            {t("footer.termsConditions")}
          </a>
        </p>
        <p className="mt-2">{t("footer.rightsReserved")}</p>
      </div>
    </footer>
  );
}
