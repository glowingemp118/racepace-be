const { bucket } = require("../config/firebase");

const imgUrl=(name)=>{
    return `${process.env.IMAGEBASEURL+name}?alt=media`
  }

const uploadFileGetUrl = async (file) => {
  try {
    var ext = file?.name?.split(".");
    var imagenamefinal = file?.name?.replace(
      file?.name,
      new Date().getTime() + "." + ext[ext.length - 1]
    );
    // var imagenamefinal = sanitizeFileName(file?.name);
    const ContentType = imagenamefinal?.split(".");
    const fbFile = bucket.file(imagenamefinal);

    // Save file to Firebase Storage
    await fbFile.save(file.data, {
      contentType: ContentType,
    });
    return {
      fileName: imagenamefinal,
      path: imgUrl(imagenamefinal),
    };
  } catch (error) {
    console.log("Error uploading file:", error.message);
  }
};
const deleteFileByName = async (fileName) => {
  try {
    const file = bucket.file(fileName);
    await file.delete();
    res.send(`File ${fileName} deleted.`);
  } catch (error) {
    console.log("Error deleting file:", error.message);
  }
};
module.exports = { uploadFileGetUrl, deleteFileByName };
