import { connect } from "mongodb";
import { setCors } from "../lib/CorsHandler";

export default async (req, res) => {
	const { MONGODB_URI, STORAGE_ROOT } = process.env;
	const client = await connect(MONGODB_URI);
	const documents = await client
		.db("philipfulgham")
		.collection("skills")
		.aggregate([
			{ $addFields: { icon: { $concat: [STORAGE_ROOT, "skills/", { $toString: "$_id" }, ".svg"] } } },
			{ $sort: { name: 1 } },
		])
		.toArray();
	setCors(req, res);
	res.setHeader("Cache-Control", "s-maxage=86400, max-age=0");
	res.json(documents);
};
