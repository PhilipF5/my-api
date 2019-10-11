export const setCors = (req, res) => {
	const { CORS: corsSetting } = process.env;
	if (!corsSetting) {
		return;
	}

	const allowedOrigins = corsSetting.split(",").map(o => new RegExp(o.trim(), "i"));
	const origin = req.headers.origin.toLowerCase();
	if (allowedOrigins.find(o => origin.match(o))) {
		res.setHeader("Access-Control-Allow-Origin", origin);
	}
};
