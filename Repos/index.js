const moment = require("moment");
const mongodb = require("mongodb");
const octokit = require("@octokit/rest");

module.exports = async function(context, req) {
	let client = await mongodb.connect(process.env.MONGODB_URI);
	let db = await client.db("philipfulgham");
	let lastUpdate = await db
		.collection("cacheUpdates")
		.find({ type: "repos" })
		.sort("time", -1)
		.limit(1)
		.toArray();

	let cacheTime = (lastUpdate[0] && lastUpdate[0].time) || "1900-01-01T00:00:00.000Z";
	if (moment().diff(moment(cacheTime), "minutes") > 60) {
		await refresh(db, context);
	}

	let repos = await db
		.collection("repos")
		.find()
		.toArray();

	context.res = {
		body: repos,
	};
};

async function loadLanguages(repo) {
	let res = await octokit().repos.listLanguages({ owner: "philipf5", repo: repo.name });
	repo.languages = res.data;
}

async function refresh(db) {
	let reposCall;
	try {
		reposCall = await octokit().repos.listForUser({
			username: "philipf5",
			sort: "pushed",
			direction: "desc",
			headers: {
				accept: "application/vnd.github.mercy-preview+json",
			},
		});
	} catch {
		return;
	}

	db.collection("repos").deleteMany({});
	let repos = reposCall.data.map(r => ({
		name: r.name,
		url: r.html_url,
		lastPushed: r.pushed_at,
		topLanguage: r.language,
		topics: r.topics,
	}));

	await Promise.all(repos.map(r => loadLanguages(r)));
	await Promise.all([
		db.collection("repos").insertMany(repos),
		db.collection("cacheUpdates").insertOne({ type: "repos", time: new Date() }),
	]);
}
