import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import HashLoaderC from "./loaders/HashLoaderC";
import Head from "next/head";
import Image from "next/image";
import { set, get } from "idb-keyval";

export default function WallpaperThumbGrid() {
  const [wallpapers, setWallpapers] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [wpLoading, setWpLoading] = useState(false);
  const [downLoading, setDownLoading] = useState(false);
  const [noMoreWallpapers, setNoMoreWallpapers] = useState(false);
  const [imageIds, setImageIds] = useState([]);
  const loaderRef = useRef(null);
  const loaderCurrent = loaderRef.current;

  const saveData = async (key, data) => {
    await set(key, data);
  };

  const loadData = async (key) => {
    return await get(key);
  };
  const clearIndexedDB = (name) => {
    const dbName = name; // Replace "your_database_name" with your database name
    const request = indexedDB.deleteDatabase(dbName);

    request.onsuccess = function () {
      console.log("IndexedDB cleared successfully");
    };

    request.onerror = function (event) {
      console.error("Failed to clear IndexedDB:", event.target.error);
    };
  };
  const getAllDownloadedImageIds = async () => {
    try {
      const wallpapers = await get("wg_Data");
      if (wallpapers && Array.isArray(wallpapers)) {
        const ids = wallpapers.map((wallpaper) => wallpaper._id);
        return ids;
      }
      return [];
    } catch (error) {
      console.error("Error getting image IDs from IndexedDB:", error);
      return [];
    }
  };

  useEffect(() => {
    debugger;
    //loadWallpapers(pageNumber).then(setIsLoading(false));
    let localPageNumber =
      parseInt(localStorage.getItem("wg_pageNumber"), 10) || 1;
    setPageNumber(localPageNumber);

    let noMoreWallpapers =
      JSON.parse(localStorage.getItem("wg_NoMoreWallpapers")) || false;
    setNoMoreWallpapers(noMoreWallpapers);

    //clearIndexedDB("wg_Data");
    let wallpaperDb = async () => {
      debugger;
      let wallpapers = await loadData("wg_Data");
      debugger;
      if (wallpapers) {
        setWallpapers(wallpapers);
      } else {
        console.log("IndexedDB empty ..");
      }
    };
    wallpaperDb();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !isLoading && !noMoreWallpapers) {
            setIsLoading(true);
            await loadWallpaperThumbs(pageNumber);
            setIsLoading(false);
          }
        }
      },
      {
        root: null, // Use the viewport as the root
        threshold: 0, // Trigger the observer as soon as any part of the target is visible
      }
    );
    const currentLoaderRef = loaderRef.current;
    if (loaderRef.current) {
      observer.observe(currentLoaderRef);
    }

    return () => {
      if (currentLoaderRef) {
        observer.unobserve(currentLoaderRef);
      }
    };
  }, [pageNumber, isLoading, noMoreWallpapers]);

  useEffect(() => {
    console.log("loaderRef.current:" + loaderRef.current);
  }, [loaderCurrent]);

  async function loadWallpaperThumbs(pageNumber) {
    try {
      const dataPerPage = 5;
      const fetchImageIds = async () => {
        const imageIds = await getAllDownloadedImageIds();
        setImageIds(imageIds);
        console.log("All image IDs:", imageIds);
      };

      //debugger;
      const res = await axios.post("/api/loadWallpapers", {
        action: "loadThumbs",
        downloadedIds: imageIds,
        dataPerPage,
        pageNumber,
      });
      const responseData = res.data;
      if (!responseData.moreWallpapersAvailable) {
        setNoMoreWallpapers(true);
        localStorage.setItem("wg_NoMoreWallpapers", JSON.stringify(true));
      } else {
        setWallpapers((prevWallpapers) => [
          ...prevWallpapers,
          ...responseData.wallpapers,
        ]);

        //trying to save data into local store
        const combinedWallpapers = [...wallpapers, ...responseData.wallpapers];
        await saveData("wg_Data", combinedWallpapers);
        const newPageNumber = pageNumber + 1;
        localStorage.setItem("wg_pageNumber", newPageNumber.toString());
        ///

        setPageNumber(pageNumber + 1);
      }
    } catch (error) {
      console.log("wallpaperThumbGrid|error:" + error.message);
    }
  }
  async function loadTheWallpaper(index) {
    try {
      debugger;
      if (!wallpapers[index].downloaded) {
        //setWpLoading(true);
        const res = await axios.post("/api/loadWallpapers", {
          action: "loadTheWallpaper",
          id: wallpapers[index]._id,
        });
        const updatedWallpapers = [...wallpapers];
        updatedWallpapers[index] = {
          ...updatedWallpapers[index],
          file_data: res.data.file_data,
          downloaded: true,
        };
        setWallpapers(updatedWallpapers);
        //setWpLoading(false);
      }
    } catch (error) {
      //setWpLoading(false);
      console.log("wallpaperThumbGrid|loadTheWallpaper|error:" + error.message);
    }
  }
  async function loadTheWallpapers(index) {
    try {
      debugger;
      if (!wallpapers[index].downloaded) {
        //setWpLoading(true);
        const ids = [];
        for (let i = index; i < index + 5 && i < wallpapers.length; i++) {
          if (wallpapers[i] && wallpapers[i]._id) {
            ids.push(wallpapers[i]._id);
          } else {
            console.error(
              "Invalid wallpaper object or missing _id at index",
              i
            );
          }
        }
        const res = await axios.post("/api/loadWallpapers", {
          action: "loadTheWallpapers",
          ids: ids,
        });
        const updatedWallpapers = [...wallpapers];
        for (let i = 0; i < Math.min(res.data.length, 5); i++) {
          const dataIndex = index + i;
          if (updatedWallpapers[dataIndex]) {
            updatedWallpapers[dataIndex] = {
              ...updatedWallpapers[dataIndex],
              file_data: res.data[i].file_data,
              downloaded: true,
            };
          } else {
            console.error(`Index ${dataIndex} out of bounds.`);
          }
        }
        await saveData("wg_Data", updatedWallpapers);
        setWallpapers(updatedWallpapers);
        //setWpLoading(false);
      }
    } catch (error) {
      //setWpLoading(false);
      console.log("wallpaperThumbGrid|loadTheWallpaper|error:" + error.message);
    }
  }
  async function updateDownloadCount() {
    try {
      setDownLoading(true);
      const res = await axios.post("/api/wallpaperApp/loadWallpapers", {
        action: "updateDownloadCount",
        id: wallpapers[currentImageIndex]._id,
        data: { downloads: wallpapers[currentImageIndex].downloads + 1 },
      });
      debugger;
      const responseData = res.data;
      const { acknowledged, matchedCount, modifiedCount } = res.data;
      if (acknowledged && matchedCount === 1 && modifiedCount === 1) {
        //updated success
      }

      setDownLoading(false);
    } catch (error) {
      setDownLoading(false);
      console.log(
        "wallpaperThumbGrid|updateDownloadCount|error:" + error.message
      );
    }
  }

  const openFullScreen = async (index) => {
    await loadTheWallpapers(index);
    setCurrentImageIndex(index);
  };

  const closeFullScreen = () => {
    setCurrentImageIndex(null);
  };

  const downloadImage = async (imageData) => {
    updateDownloadCount();
    const link = document.createElement("a");
    link.href = "data:image/png;base64," + imageData;
    link.download = "wallpaper.png";
    link.click();
  };

  const handleNext = async () => {
    debugger;
    if (
      currentImageIndex !== null &&
      currentImageIndex + 1 < wallpapers.length
    ) {
      setCurrentImageIndex(currentImageIndex + 1);
      await loadTheWallpapers(currentImageIndex + 1);
    } else {
      if (noMoreWallpapers) {
        setCurrentImageIndex(null);
      } else {
        setIsLoading(true);
        await loadWallpaperThumbs(pageNumber);
        setIsLoading(false);
        setCurrentImageIndex(currentImageIndex + 1);
        await loadTheWallpapers(currentImageIndex + 1);
      }
    }
  };

  const handlePrevious = async () => {
    await loadTheWallpapers(currentImageIndex - 1);
    setCurrentImageIndex((prevIndex) =>
      prevIndex !== null && prevIndex > 0 ? prevIndex - 1 : null
    );
  };
  return (
    <div>
      <div className="p-1 w-full flex flex-wrap justify-center">
        {wallpapers.map((wallpaper, index) => (
          <div
            key={index}
            className="relative aspect-square w-full xxxs:w-1/3 lg:w-1/6 xl:w-1/8  "
          >
            <img
              className="object-cover w-full h-full p-0.5"
              src={"data:image/png;base64," + wallpaper.thumbnail}
              alt={wallpaper.file_name}
              onClick={() => openFullScreen(index)}
              onError={(e) => {
                e.target.src = "/error_cloud_icon.svg"; // Replace with a fallback image URL
              }}
            />
          </div>
        ))}
        <div ref={loaderRef}>{isLoading && <div>Loading...</div>}</div>
      </div>
      {/* Full screen image view */}
      {currentImageIndex !== null && (
        <div className="fixed top-0 left-0 w-full h-full bg-black flex justify-center items-center">
          <Head>
            <title>SR Wallpapers</title>
          </Head>
          {wpLoading && (
            <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center">
              <div className="relative">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="h-full w-full lg:w-1/2 sm:w-1/2">
                    <HashLoaderC />
                  </div>
                </div>
              </div>
            </div>
          )}
          <img
            className={
              "max-h-full max-w-full " + `${wpLoading ? "opacity-10" : ""}`
            }
            src={
              "data:image/png;base64," + wallpapers[currentImageIndex].file_data
            }
            alt="Full Screen Wallpaper"
          />
          <div className="absolute top-0 right-0 mx-3 my-2">
            <button
              className="outline outline-offset-2 outline-green-500 bg-red-600 text-white px-2   rounded-md"
              onClick={closeFullScreen}
            >
              X
            </button>
          </div>
          <div className="absolute bottom-0 justify-center my-2">
            <button
              className="outline outline-offset-2 outline-pink-500 bg-lime-500 hover:bg-lime-600 bg-opacity-50 text-white px-2 py-1 rounded-md"
              onClick={() =>
                downloadImage(wallpapers[currentImageIndex].file_data)
              }
            >
              Download
            </button>
          </div>
          <button
            className="outline  outline-lime-500 bg-green-800 hover:bg-lime-600 bg-opacity-0 text-white px-1 py-2  rounded-md absolute right-0 top-1/2 transform -translate-y-1/2 mx-2"
            onClick={handleNext}
          >
            &gt;
          </button>
          <button
            className="outline  outline-lime-500 bg-green-800 hover:bg-lime-600 bg-opacity-0 text-white px-1 py-2 rounded-md absolute left-0 top-1/2 transform -translate-y-1/2 mx-2"
            onClick={handlePrevious}
          >
            &lt;
          </button>
          <label className="rounded-md absolute right-0 bottom-0 m-3 bg-slate-300 text-white p-2 bg-opacity-70 text-[0.5rem]">
            Download Count: {wallpapers[currentImageIndex].downloads}
          </label>
        </div>
      )}
    </div>
  );
}
