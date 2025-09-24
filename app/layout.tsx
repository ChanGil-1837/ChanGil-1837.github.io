import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./header/page";
import Footer from "./footer/page";
import Providers from "./components/provider";
import { LocaleProvider } from "./contexts/LocaleContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gil's Blog",
  description: "Powered by Next app",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="en">
      <body className="bg-primary">
        <LocaleProvider>
          <Providers>
          <Header></Header>
            {children}
          <Footer></Footer>
          </Providers>
        </LocaleProvider>
        </body>
    </html>
  );
}
