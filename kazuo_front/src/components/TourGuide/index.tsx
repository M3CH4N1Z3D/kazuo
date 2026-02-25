"use client";

import { useEffect, useState, useMemo } from "react";
import Joyride, { CallBackProps, STATUS, Step, TooltipRenderProps } from "react-joyride";
import { useTranslation } from "react-i18next";
import { useAppContext } from "@/context/AppContext";
import { usePathname } from "next/navigation";
import { getTourSteps, RouteTourMap } from "@/config/tourConfig";
import { Button } from "@/components/ui/button";

export default function TourGuide() {
  const { t } = useTranslation("global");
  const { userData, updateTourProgress } = useAppContext();
  const pathname = usePathname();
  const [run, setRun] = useState(false);
  const [activeTour, setActiveTour] = useState<string | null>(null);

  const stepsMap = useMemo(() => getTourSteps(t), [t]);

  useEffect(() => {
    if (!pathname || !userData) return;

    let foundTourKey: string | null = null;

    // Exact match
    if (RouteTourMap[pathname]) {
      foundTourKey = RouteTourMap[pathname];
    } else {
      // Partial match
      for (const [route, key] of Object.entries(RouteTourMap)) {
        if (route !== "/" && pathname.startsWith(route)) {
          foundTourKey = key;
          break;
        }
      }
    }

    if (foundTourKey) {
      setActiveTour(foundTourKey);
      // Check if already completed
      const isCompleted = userData.tourProgress?.[foundTourKey];
      if (!isCompleted) {
        setRun(true);
      } else {
        setRun(false);
      }
    } else {
      // Fallback: if we are on root but no match (unlikely given "/" is mapped), or some unmapped page
      // Maybe disable tour
      setActiveTour(null);
      setRun(false);
    }
  }, [pathname, userData, stepsMap]);

  // Listen for custom event "start-tour" to manually trigger it
  useEffect(() => {
    const handleStartTour = () => {
      if (activeTour) {
        setRun(true);
      } else {
         // If no active tour found for this page, maybe try welcome or nothing
         // For now, let's allow re-running 'welcome' if nothing else matches and we are at root
         if (pathname === "/") {
             setActiveTour("welcome");
             setRun(true);
         }
      }
    };
    window.addEventListener("start-tour", handleStartTour);
    return () => window.removeEventListener("start-tour", handleStartTour);
  }, [activeTour, pathname]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      if (activeTour && updateTourProgress) {
        updateTourProgress(activeTour, true);
      }
    }
  };

  if (!userData || !activeTour || !stepsMap[activeTour]) return null;

  const currentSteps = stepsMap[activeTour];

  const CustomTooltip = ({
    index,
    step,
    backProps,
    primaryProps,
    tooltipProps,
    isLastStep,
  }: TooltipRenderProps) => {
    return (
      <div
        {...tooltipProps}
        className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl max-w-sm z-50 border border-gray-200 dark:border-gray-700"
      >
        {step.title && <h3 className="font-bold text-lg mb-2 dark:text-white">{step.title}</h3>}
        <div className="mb-4 text-gray-700 dark:text-gray-300">{step.content}</div>
        <div className="flex justify-between items-center gap-2 mt-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {t("tour.step")} {index + 1} {t("tour.of")} {currentSteps.length}
          </div>
          <div className="flex gap-2">
            {index > 0 && (
              <Button variant="outline" size="sm" {...backProps}>
                {t("tour.back")}
              </Button>
            )}
            <Button size="sm" {...primaryProps}>
              {isLastStep ? t("tour.finish") : t("tour.next")}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={currentSteps}
      tooltipComponent={CustomTooltip}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: "#2563EB",
        },
      }}
      locale={{
        last: t("tour.finish"),
        next: t("tour.next"),
        skip: t("tour.skip"),
        back: t("tour.back"),
      }}
    />
  );
}
