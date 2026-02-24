"use client";

import Image from 'next/image';

import Link from 'next/link';

import React from 'react';
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function LandingPage() {
  const { t } = useTranslation("global");

  return (
    <div className="bg-background min-h-[calc(100vh-4rem)] flex items-center">
      <main className="container mx-auto px-4 py-12 md:py-24 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 text-center md:text-left space-y-6">
          <p className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
            {t("landing.managementSystem")}
          </p>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
            {t("landing.discover")} <span className="text-primary">{t("landing.efficientManagement")}</span>{" "}
            {t("landing.withAI")}
          </h1>
          
          <p className="text-xl text-muted-foreground md:pr-12 leading-relaxed">
            {t("landing.organizeInventory")} {t("landing.description")}
          </p>

        </div>

        <div className="md:w-1/2 relative">
          {/* <div className="absolute inset-0 bg-blue-100 rounded-full transform -rotate-6 scale-110 md:scale-125"></div> */}

          <Image
            src="https://www.soc.unicen.edu.ar/images/2024/Estadisticas-wp.jpg"
            className="rounded-3xl relative z-10"
            alt="logo"
            width={500}
            height={500}
          />
        </div>
      </main>
    </div>
  );
}
