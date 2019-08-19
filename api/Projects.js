import { connect } from "mongodb";

export default async (req, res) => {
	const { MONGODB_URI, STORAGE_ROOT } = process.env;
	const client = await connect(MONGODB_URI);

	const projects = await client
		.db("philipfulgham")
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
			{ $sort: { featured: -1, startDate: -1 } },
		])
		.toArray();

	res.json(projects);
};
