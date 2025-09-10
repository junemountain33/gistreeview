import React from "react";
import LoaderGis from "../../components/loader";
import { usePreloader } from "../../context/PreloaderContext";
import ThemeTogglerTwo from "../../components/ui/ThemeTogglerTwo";

interface AuthLayoutContentProps {
  children: React.ReactNode;
}

export default function AuthLayoutContent({
  children,
}: AuthLayoutContentProps) {
  const { showPreloader } = usePreloader();

  return (
    <div className="relative min-h-screen bg-white dark:bg-gray-900">
      {/* Preloader dengan z-index tertinggi */}
      {showPreloader && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm">
          <LoaderGis />
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-4 h-screen">{children}</div>
      <div className="fixed z-50 bottom-6 right-6 sm:block">
        <ThemeTogglerTwo />
      </div>
    </div>
  );
}
