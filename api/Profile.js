import { connect } from "mongodb";
import { setCors } from "../lib/CorsHandler";

export default async (req, res) => {
	const client = await connect(process.env.MONGODB_URI);
	const document = await client
		.db("philipfulgham")
		.collection("textBlocks")
		.findOne({ name: req.query.short ? "shortBio" : "bio" });
	setCors(req, res);
	res.setHeader("Cache-Control", "s-maxage=86400, max-age=0");
	res.json({ ...document });
};
