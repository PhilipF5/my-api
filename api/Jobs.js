import { connect } from "mongodb";
import { setCors } from "../lib/CorsHandler";

export default async (req, res) => {
	const { MONGODB_URI, STORAGE_ROOT } = process.env;
	const client = await connect(MONGODB_URI);
	const collection = client.db("philipfulgham").collection("jobs");

	const documents = req.query.latest
		? (await collection
				.find()
				.sort("start", -1)
				.limit(1)
				.toArray())[0]
		: await collection
				.aggregate([
					{
						$addFields: {
							logo: { $concat: [STORAGE_ROOT, "orgs/", "$image"] },
						},
					},
					{ $sort: { start: -1 } },
				])
				.toArray();

	setCors(req, res);
	res.setHeader("Cache-Control", "s-maxage=86400, max-age=0");
	res.json(documents);
};
