import { commonInsertMany } from "../../lib/mongodb";
import multer from "multer";
import sharp from "sharp";
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function apiHandler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  try {
    upload.any("wallpaper")(req, res, async (err) => {
      if (err) {
        return res
          .status(400)
          .json({ error: "File upload failed " + err.message });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      try {
        // Parse formData parameters
        const fileFieldsCount = parseInt(req.body.fileFieldsCount);
        const userName = req.body.userName;

        const generateThumbnail = async (fileBuffer) => {
          // Resize the image to generate thumbnail (you can adjust the width and height as needed)
          const thumbnailBuffer = await sharp(fileBuffer)
            .extract({ left: 100, top: 300, width: 350, height: 350 })
            .toBuffer();
          return thumbnailBuffer;
        };

        const wallpapersData = await Promise.all(
          req.files.map(async (file, index) => {
            const thumbnailBuffer = await generateThumbnail(file.buffer);
            return {
              file_name: Array.isArray(req.body.fileName)
                ? req.body.fileName[index]
                : req.body.fileName, // Get file name for each file
              file_data: file.buffer,
              thumbnail: thumbnailBuffer,
              downloads: 0,
              created_date: new Date(),
              created_userName: userName || "YourUserName",
            };
          })
        );

        const result = await commonInsertMany(wallpapersData, "wallpapers");
        if (result.error) {
          return res
            .status(500)
            .json({ error: result.error.message || "Internal server error" });
        }
        return res.status(200).json({ result });
      } catch (error) {
        console.error("Error:", error);
        return res
          .status(500)
          .json({ error: error.message || "Internal server error" });
      }
    });
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
}
