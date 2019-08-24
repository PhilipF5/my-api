import { connect } from "mongodb";

export default async (req, res) => {
	const client = await connect(process.env.MONGODB_URI);
	const documents = await client
		.db("philipfulgham")
		.collection("contacts")
		.find()
		.sort("service", 1)
		.toArray();
	res.setHeader("Cache-Control", "s-maxage=86400, max-age=0");
	res.json(documents);
};
