import { connect } from "mongodb";

export default async (req, res) => {
	const client = await connect(process.env.MONGODB_URI);
	const document = await client
		.db("philipfulgham")
		.collection("textBlocks")
		.findOne({ name: req.query.short ? "shortBio" : "bio" });
	res.json({ ...document });
};
