import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { AppProviders } from "@/app/providers";
import "./globals.css";

const pretendard = localFont({ src: "./fonts/PretendardVariable.ttf", variable: "--font-pretendard", weight: "100 900", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Check-On", template: "%s | Check-On" },
  description: "학생의 국어 약점을 발견하고 보완하는 Check-On 학습 앱",
  applicationName: "Check-On",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#FFFCEC" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body><AppProviders>{children}</AppProviders></body>
    </html>
  );
}
