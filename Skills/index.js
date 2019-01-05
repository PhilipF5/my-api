const mongodb = require("mongodb");

module.exports = async function(context, req) {
	let client = await mongodb.connect(process.env.MONGODB_URI);
	let documents = await client
		.db("philipfulgham")
		.collection("skills")
		.find()
		.toArray();

	context.res = {
		body: documents,
	};
};
