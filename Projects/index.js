const mongodb = require("mongodb");

module.exports = async function(context, req) {
	let client = await mongodb.connect(process.env.MONGODB_URI);
	let db = await client.db("philipfulgham");

	let projects = await db
		.collection("projects")
		.find({}, { sort: { featured: -1, name: 1 } })
		.toArray();

	context.res = {
		body: projects,
	};
};
