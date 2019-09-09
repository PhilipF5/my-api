export const setCors = (req, res) => {
	const { CORS: corsSetting } = process.env;
	if (!corsSetting) {
		return;
	}

	const allowedOrigins = corsSetting.split(",").map(o => o.trim().toLowerCase());
	const origin = req.headers.origin.toLowerCase();
	if (allowedOrigins.includes(origin)) {
		res.setHeader("Access-Control-Allow-Origin", origin);
	}
};
