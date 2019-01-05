const moment = require("moment");
const mongodb = require("mongodb");
const octokit = require("@octokit/rest");

module.exports = async function(context, req) {
	let client = await mongodb.connect(process.env.MONGODB_URI);
	let db = await client.db("philipfulgham");
	let lastUpdate = await db.collection("cacheUpdates").find({ type: "repos" }).sort("time", -1).limit(1).toArray();
	let cacheTime = lastUpdate[0] && lastUpdate[0].time || "1900-01-01T00:00:00.000Z";
	if (moment().diff(moment(cacheTime), "minutes") > 60) {
		await refresh(db, context);
	}

	let documents = await db.collection("repos").find().toArray();
	context.res = {
		body: documents,
	};
};

async function loadLanguages(repo) {
	let res = await octokit().repos.listLanguages({ owner: "philipf5", repo: repo.name });
	repo.languages = res.data;
}

async function refresh(db) {
	db.collection("repos").deleteMany({});
	let repos = await octokit().repos.listForUser({
		username: "philipf5",
		sort: "pushed",
		direction: "desc",
		headers: {
			accept: "application/vnd.github.mercy-preview+json",
		},
	});

	await Promise.all(repos.data.map(r => loadLanguages(r)));
	await Promise.all([
		db.collection("repos").insertMany(repos.data),
		db.collection("cacheUpdates").insertOne({ type: "repos", time: new Date() }),
	]);
}
