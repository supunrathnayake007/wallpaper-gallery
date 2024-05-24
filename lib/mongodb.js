import { MongoClient } from "mongodb";
import { ObjectId } from "mongodb";

// Replace the uri string with your MongoDB deployment's connection string.
const uri = process.env.MONGODB_CONNECTION_STRING;

// Create a new client and connect to MongoDB
const client = new MongoClient(uri);

export async function getWallpapersThumb(
  viewedWallpaperIds,
  pageNumber,
  dataPerPage
) {
  try {
    const skipDataCount = (pageNumber - 1) * dataPerPage;
    const pipeline = [
      // Filter out already viewed wallpapers
      //{ $match: { _id: { $nin: viewedWallpaperIds } } },
      // Sort by whether they have been viewed or not
      //{ $addFields: { viewed: { $in: ["$_id", viewedWallpaperIds] } } },
      //{ $sort: { viewed: 1 } },
      // Projection to select specific fields
      {
        $project: {
          _id: 1,
          file_name: 1,
          thumbnail: 1,
          downloads: 1,
        },
      },
      // Add a new field file_data with the same values as thumbnail
      {
        $addFields: {
          file_data: "$thumbnail", // Create a new field file_data and assign the value of thumbnail to it
          downloaded: false,
        },
      },
      // Pagination
      { $skip: skipDataCount },
      { $limit: dataPerPage },
    ];
    let result = { wallpapers: [], moreWallpapersAvailable: true };
    await client.connect();
    const database = client.db("socialMediaClone");
    const collectionName = database.collection("wallpapers");
    const totalRecords = await collectionName.countDocuments();

    skipDataCount >= totalRecords + dataPerPage
      ? (result.moreWallpapersAvailable = false)
      : (result.moreWallpapersAvailable = true);

    if (result.moreWallpapersAvailable) {
      result.wallpapers = await collectionName.aggregate(pipeline).toArray();
    }
    return result;
  } catch (error) {
    console.log("catch from mongodb.js|getWallpapers|catch  -" + error.message);
    await client.close();
    return { error };
  }
}

export async function getFieldById(collection, field_name, id) {
  try {
    const objectId = new ObjectId(id);
    await client.connect();
    const database = client.db("socialMediaClone");
    const collectionName = database.collection(collection);
    const result = await collectionName.findOne(
      { _id: objectId },
      {
        projection: { [field_name]: 1 },
      }
    );
    return result;
  } catch (error) {
    console.log("catch from mongodb.js|getFieldById|catch  -" + error.message);
    await client.close();
    return { error };
  }
}

export async function UpdateRecodeById(collection, id, data) {
  try {
    const { ObjectId } = require("mongodb");
    const objectId = new ObjectId(id);
    await client.connect();
    const database = client.db("socialMediaClone");
    const collectionName = database.collection(collection);
    delete data._id;
    const result = await collectionName.updateOne(
      { _id: objectId },
      { $set: data },
      { upsert: true }
    );
    await client.close();
    return result;
  } catch (error) {
    console.log(
      "Error mongodb.js|removeRecodeById|collection:" +
        collection +
        "|catch:" +
        error.message
    );
    await client.close();
    return { error };
  }
}

export async function commonInsertMany(data, collection) {
  try {
    await client.connect();
    const database = client.db("socialMediaClone");
    const collectionName = database.collection(collection);

    const result = await collectionName.insertMany(data);
    console.log(
      `${result.insertedCount} documents inserted into ${collection}`
    );
    return result;
  } catch (error) {
    console.log(
      `Error mongodb.js|commonInsert|collection:${collection}|catch:${error.message}`
    );
    await client.close();
    return { error };
  }
}
