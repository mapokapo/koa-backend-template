import multer from "@koa/multer";

const fileUploadMiddleware = () => {
	return multer({
		dest: "./uploads",
		storage: multer.diskStorage({
			destination: (_, __, cb) => {
				cb(null, "./uploads");
			},
			filename: (_, file, cb) => {
				cb(null, Date.now() + "-" + file.originalname);
			},
		}),
		limits: {
			fileSize: 1024 * 1024 * 5, // 5 MB
		},
		fileFilter: (_, file, cb) => {
			if (!file.mimetype.startsWith("image/")) {
				cb(null, false);
				return;
			}
			cb(null, true);
		},
	});
};

export default fileUploadMiddleware;
