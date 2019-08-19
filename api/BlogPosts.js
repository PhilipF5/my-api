const mongodb = require("mongodb");

module.exports = async function(context, req) {
	let client = await mongodb.connect(process.env.MONGODB_URI);
	let db = await client.db("philipfulgham");

	let blogPosts = await db
		.collection("blogPosts")
		.find()
		.sort("publishDate", -1)
		.toArray();

	context.res = {
		body: blogPosts,
	};
};
