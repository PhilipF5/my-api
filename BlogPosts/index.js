const moment = require("moment");
const mongodb = require("mongodb");
const request = require("request-promise-native");

module.exports = async function(context, req) {
	let client = await mongodb.connect(process.env.MONGODB_URI);
	let db = await client.db("philipfulgham");
	let lastUpdate = await db
		.collection("cacheUpdates")
		.find({ type: "blogPosts" })
		.sort("time", -1)
		.limit(1)
		.toArray();

	let cacheTime = (lastUpdate[0] && lastUpdate[0].time) || "1900-01-01T00:00:00.000Z";
	if (moment().diff(moment(cacheTime), "minutes") > 60) {
		await refresh(db, context);
	}

	let blogPosts = await db
		.collection("blogPosts")
		.find()
		.toArray();

	context.res = {
		body: blogPosts,
	};
};

async function refresh(db) {
	let feed;
	try {
		feed = await request.get("https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@philipf5", {
			json: true,
		});
	} catch (error) {
		return;
	}

	db.collection("blogPosts").deleteMany({});
	let posts = feed.items.map(p => ({
		title: p.title,
		publishDate: p.pubDate,
		url: p.link.replace(/\?source.*/, ""),
	}));

	await Promise.all([
		db.collection("blogPosts").insertMany(posts),
		db.collection("cacheUpdates").insertOne({ type: "blogPosts", time: new Date() }),
	]);
}
