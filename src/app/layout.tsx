import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "../components/Web3/Web3Provider";
import { WalletConnect } from "../components/Web3/WalletConnect";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Axie Game Demo",
  description: "Axie Game Web3 Demo",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Axie Game',
    'msapplication-TileColor': '#14F195',
    'theme-color': '#14F195',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Axie Game" />
        <meta name="msapplication-TileColor" content="#14F195" />
        <meta name="theme-color" content="#14F195" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />
        {/* Mobile wallet browser optimizations */}
        <meta name="robots" content="noindex,nofollow" />
        <meta name="referrer" content="no-referrer" />
        <meta name="cache-control" content="no-cache" />
        <meta name="pragma" content="no-cache" />
        <meta name="expires" content="0" />
        {/* Prevent zoom on input focus */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className={inter.className}>
        <Web3Provider>
          <WalletConnect />
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}