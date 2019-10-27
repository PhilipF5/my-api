import { connect } from "mongodb";
import { setCors } from "../lib/CorsHandler";

export default async (req, res) => {
	const client = await connect(process.env.MONGODB_URI);
	const collection = client.db("philipfulgham").collection("employers");
	const documents = await collection
		.find()
		.sort("startDate", -1)
		.toArray();
	setCors(req, res);
	res.setHeader("Cache-Control", "s-maxage=86400, max-age=0");
	res.json(documents);
};
