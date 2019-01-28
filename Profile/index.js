const mongodb = require("mongodb");

module.exports = async function(context, req) {
	let client = await mongodb.connect(process.env.MONGODB_URI);
	let document = await client
		.db("philipfulgham")
		.collection("textBlocks")
		.findOne({ name: req.query.short ? "shortBio": "bio" });

	context.res = {
		body: { ...document },
	};
};
