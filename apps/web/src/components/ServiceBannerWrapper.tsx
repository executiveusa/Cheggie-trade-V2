"use client";

import { useApp } from "@/lib/context";
import ServiceBanner from "./ServiceBanner";

export default function ServiceBannerWrapper() {
  const { locale } = useApp();
  return <ServiceBanner locale={locale} />;
}
