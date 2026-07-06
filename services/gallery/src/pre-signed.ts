import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

async function getPresignedUrl(
	bucketName: string,
	objectKey: string,
	expiresInSeconds: number,
): Promise<{ getUrl: string; putUrl: string }> {
	const S3 = new S3Client({
		region: "auto",
		endpoint: "https://<ACCOUNT_ID>.r2.cloudflarestorage.com",
		credentials: {
			accessKeyId: "<ACCESS_KEY_ID>",
			secretAccessKey: "<SECRET_ACCESS_KEY>",
		},
	});

	const getUrl = await getSignedUrl(
		S3,
		new GetObjectCommand({ Bucket: bucketName, Key: objectKey }),
		{ expiresIn: expiresInSeconds },
	);

	const putUrl = await getSignedUrl(
		S3,
		new PutObjectCommand({
			Bucket: bucketName,
			Key: objectKey,
			ContentType: "image/png",
		}),
		{ expiresIn: expiresInSeconds },
	);

	return { getUrl, putUrl };
}

export { getPresignedUrl };
