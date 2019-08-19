const mongodb = require("mongodb");

module.exports = async function(context, req) {
	const STORAGE_ROOT = process.env.STORAGE_ROOT;
	let client = await mongodb.connect(process.env.MONGODB_URI);
	let collection = client.db("philipfulgham").collection("credentials");

	let documents = req.query.latest
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
			])
			.toArray();

	context.res = {
		body: documents,
	};
};
