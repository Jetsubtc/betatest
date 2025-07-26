import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "../components/Web3/Web3Provider";
import { WalletConnect } from "../components/Web3/WalletConnect";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Axie Game Demo",
  description: "Axie Game Web3 Demo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3Provider>
          <WalletConnect />
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}