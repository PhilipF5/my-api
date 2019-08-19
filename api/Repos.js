import * as octokit from "@octokit/rest";
import * as moment from "moment";
import { connect } from "mongodb";

export default async (req, res) => {
	const db = await connect(process.env.MONGODB_URI).db("philipfulgham");
	const lastUpdate = await db
		.collection("cacheUpdates")
		.find({ type: "repos" })
		.sort("time", -1)
		.limit(1)
		.toArray();

	const cacheTime = (lastUpdate[0] && lastUpdate[0].time) || "1900-01-01T00:00:00.000Z";
	if (moment().diff(moment(cacheTime), "minutes") > 60) {
		await refresh(db);
	}

	const repos = await db
		.collection("repos")
		.find()
		.sort("lastPushed", -1)
		.toArray();

	res.json(repos);
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
	} catch (error) {
		return;
	}

	db.collection("repos").deleteMany({});
	let repos = reposCall.data.map(r => ({
		name: r.name,
		url: r.html_url,
		lastPushed: new Date(r.pushed_at),
		topLanguage: r.language,
		topics: r.topics,
	}));

	await Promise.all(repos.map(r => loadLanguages(r)));
	await Promise.all([
		db.collection("repos").insertMany(repos),
		db.collection("cacheUpdates").insertOne({ type: "repos", time: new Date() }),
	]);
}
