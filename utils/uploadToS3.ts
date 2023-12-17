const s3 = require("../config/s3config");

export const uploadToS3 = async (email: string, imageBuffer: Buffer) => {
  try {
    const s3UploadParams = {
      Bucket: "samanvaysamiti-uploads",
      Key: `profile-images/${email}-${Date.now()}.jpg`,
      Body: imageBuffer,
      ContentType: "image/jpeg",
      ACL: "public-read",
    };

    const s3UploadResult = await s3.upload(s3UploadParams).promise();
    return s3UploadResult.Location;
  } catch (error) {
    throw error;
  }
};