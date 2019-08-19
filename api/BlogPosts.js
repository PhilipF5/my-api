import { connect } from "mongodb";

export default async (req, res) => {
	const client = await connect(process.env.MONGODB_URI);
	const blogPosts = await client
		.db("philipfulgham")
		.collection("blogPosts")
		.find()
		.sort("publishDate", -1)
		.toArray();
	res.json(blogPosts);
};
