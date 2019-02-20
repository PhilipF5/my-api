const mongodb = require("mongodb");

module.exports = async function(context, req) {
	let client = await mongodb.connect(process.env.MONGODB_URI);
	let db = await client.db("philipfulgham");

	let projects = await db
		.collection("projects")
		.aggregate([
			{ $lookup: { from: "repos", localField: "repo", foreignField: "name", as: "repo" } },
			{ $lookup: { from: "skills", localField: "skills", foreignField: "name", as: "skills" } },
			{ $sort: { featured: -1, name: 1 } },
		])
		.toArray();

	context.res = {
		body: projects,
	};
};
