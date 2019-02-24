const mongodb = require("mongodb");

module.exports = async function(context, req) {
	const STORAGE_ROOT = process.env.STORAGE_ROOT;
	let client = await mongodb.connect(process.env.MONGODB_URI);
	let db = await client.db("philipfulgham");

	let projects = await db
		.collection("projects")
		.aggregate([
			{ $lookup: { from: "repos", localField: "repo", foreignField: "name", as: "repo" } },
			{ $lookup: { from: "skills", localField: "skills", foreignField: "name", as: "skills" } },
			{ $lookup: { from: "skills", localField: "platform", foreignField: "name", as: "platform" } },
			{ $unwind: { path: "$platform" } },
			{ $unwind: { path: "$repo", preserveNullAndEmptyArrays: true } },
			{
				$addFields: {
					image: { $concat: [STORAGE_ROOT, "projects/", { $toString: "$_id" }, ".png"] },
					"platform.icon": {
						$concat: [STORAGE_ROOT, "skills/", { $toString: "$platform._id" }, ".svg"],
					},
					skills: {
						$map: {
							input: "$skills",
							in: {
								$mergeObjects: [
									"$$this",
									{
										icon: {
											$concat: [STORAGE_ROOT, "skills/", { $toString: "$$this._id" }, ".svg"],
										},
									},
								],
							},
						},
					},
				},
			},
			{ $sort: { featured: -1, name: 1 } },
		])
		.toArray();

	context.res = {
		body: projects,
	};
};
