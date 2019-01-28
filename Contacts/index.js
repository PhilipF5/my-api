const mongodb = require("mongodb");

module.exports = async function(context, req) {
	let client = await mongodb.connect(process.env.MONGODB_URI);
	let collection = client.db("philipfulgham").collection("contacts");

	let documents = await client
		.db("philipfulgham")
		.collection("contacts")
		.find()
		.sort("service", 1)
		.toArray();

	context.res = {
		body: documents,
	};
};
