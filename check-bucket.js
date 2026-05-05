const { S3Client, GetBucketLocationCommand } = require('@aws-sdk/client-s3');
const env = require('./.env'); // Wait, we can just use dotenv!
require('dotenv').config();

const client = new S3Client({
  region: 'us-east-1', // Default global region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});
(async () => {
  try {
    const data = await client.send(new GetBucketLocationCommand({ Bucket: process.env.AWS_BUCKET_NAME }));
    console.log("ACTUAL BUCKET REGION:", data.LocationConstraint || "us-east-1");
  } catch(e) {
    console.error("ERROR", e.message);
  }
})();
