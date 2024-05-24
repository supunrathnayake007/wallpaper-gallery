"use client"; // Add this line at the top
import React, { useEffect, useState } from "react";
import WallpaperUploader from "../components/wallpaperUploader";
import WallpaperThumbGrid from "../components/wallpaperThumbGrid";
import Head from "next/head";

export default function Home() {
  const [user, setUser] = useState();
  useEffect(() => {
    if (typeof window !== "undefined") {
      debugger;
      const username = localStorage.getItem("smc_username");
      setUser(username);
    }
  }, []);

  const handleContact = () => {
    window.location.href = "https://supunrathnayake007.github.io/#/contact";
  };

  return (
    <div>
      <Head>
        <title>Free Wallpapers</title>
        <meta
          name="description"
          content="SR Free Wallpaper app, AI generate mobile wallpapers download for free"
        />
        <meta
          name="keyword"
          content="SR Wallpapers, Free SR, Supun Rathnayake"
        />
      </Head>
      <div className="2xl:flex">
        <div className="2xl:m-4">
          <div className="flex justify-center text-7xl">Welcome</div>
          <div className="flex justify-center text-2xl">
            Free Mobile Wallpapers Web App
          </div>
        </div>
        <div className="flex justify-center text-lg">
          <button
            className="m-1 px-2 py-1 bg-yellow-500 rounded hover:bg-yellow-600  text-white 2xl:right-0 2xl:fixed"
            onClick={handleContact}
          >
            Contact Me here
          </button>
        </div>
        <div className="flex justify-center text-[0.7rem]">
          {/* <div className="text-center 2xl:text-left 2xl:items-center">
            Disclaimer: This project is a personal hobby endeavor.
            <br /> I do not own any of the wallpapers featured here, and I
            strongly advise against using them for commercial purposes.
          </div> */}
        </div>
      </div>
      <div>{user && <WallpaperUploader userName={user} />}</div>
      <div>
        <WallpaperThumbGrid />
      </div>
    </div>
  );
}
