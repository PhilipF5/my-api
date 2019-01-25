const mongodb = require("mongodb");

module.exports = async function(context, req) {
	let client = await mongodb.connect(process.env.MONGODB_URI);
	let collection = client.db("philipfulgham").collection("jobs");

	let documents = req.query.latest
		? (await collection
				.find()
				.sort("start", -1)
				.limit(1)
				.toArray())[0]
		: await collection.find().toArray();

	context.res = {
		body: documents,
	};
};
