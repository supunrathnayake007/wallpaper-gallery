import React, { useState } from "react";
//import HashLoaderC from "../../components/loaders/HashLoaderC";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const WallpaperUploader = (props) => {
  const commonButton =
    "m-1 px-2 py-1 bg-lime-500 rounded hover:bg-lime-600  text-white ";
  const commonInput = "m-1 w-full px-3 py-2 border rounded-md ";
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [Loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleUpload = () => {
    //debugger;
    const formData = new FormData();
    selectedFiles.forEach((file, index) => {
      formData.append("wallpaper", file); // Image file
      formData.append("fileName", file.name); // File name
    });
    formData.append("fileFieldsCount", selectedFiles.length);
    formData.append("userName", props.userName);

    //debugger;
    const xhr = new XMLHttpRequest();

    xhr.open("POST", "/api/wallpaperApp/upload", true);

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        setUploadProgress(percentComplete);
        console.log("percentComplete :" + percentComplete);
      }
    });

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          // Handle successful upload
          toast.success("Successful upload ...", {
            position: toast.POSITION.BOTTOM_LEFT,
            autoClose: 5000,
          });
        } else {
          // Handle upload error
          toast.error("Upload failed ...", {
            position: toast.POSITION.BOTTOM_LEFT,
            autoClose: 5000,
          });
        }
      }
    };

    xhr.send(formData);
  };

  return (
    <div>
      <h2>Upload Wallpapers ,User Name :{props.userName}</h2>
      <div className="flex">
        <input
          className={commonInput}
          type="file"
          multiple
          onChange={handleFileChange}
        />
        <button className={commonButton} onClick={handleUpload}>
          Upload
        </button>
      </div>
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="m-1 p-1 border rounded-md">
          <h3>Upload Progress:</h3>

          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className={"w-" + " bg-blue-600 h-2.5 rounded-full"}
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p>{Math.round(uploadProgress)}% Complete</p>
        </div>
      )}
      {selectedFiles.length > 0 && (
        <div className="m-1 p-1 border rounded-md">
          <h3>Selected Files:</h3>
          <ul className="flex">
            {selectedFiles.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default WallpaperUploader;
