export const setCors = (req, res) => {
	const allowedOrigins = process.env.CORS.split(",").map(o => o.trim().toLowerCase());
	const origin = req.headers.origin.toLowerCase();
	if (allowedOrigins.includes(origin)) {
		res.setHeader("Access-Control-Allow-Origin", origin);
	}
};
