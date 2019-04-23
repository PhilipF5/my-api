const mongodb = require("mongodb");

module.exports = async function(context, req) {
	const STORAGE_ROOT = process.env.STORAGE_ROOT;
	let client = await mongodb.connect(process.env.MONGODB_URI);
	let documents = await client
		.db("philipfulgham")
		.collection("skills")
		.aggregate([
			{ $addFields: { icon: { $concat: [STORAGE_ROOT, "skills/", { $toString: "$_id" }, ".svg"] } } },
			{ $sort: { name: 1 } },
		])
		.toArray();

	context.res = {
		body: documents,
	};
};
