import { Inter } from "next/font/google";
import "./globals.css";
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SR Free Wallpapers",
  description:
    "SR Free Wallpaper app, AI generate mobile wallpapers download for free",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <meta name="google-adsense-account" content="ca-pub-9033090968990814" />
      </Head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
