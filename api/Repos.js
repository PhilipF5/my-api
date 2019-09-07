import * as octokit from "@octokit/rest";
import { DateTime } from "luxon";
import { connect } from "mongodb";
import { setCors } from "../lib/CorsHandler";

export default async (req, res) => {
	const db = (await connect(process.env.MONGODB_URI)).db("philipfulgham");
	const lastUpdate = await db
		.collection("cacheUpdates")
		.find({ type: "repos" })
		.sort("time", -1)
		.limit(1)
		.toArray();

	const cacheTime = (lastUpdate[0] && lastUpdate[0].time) || "1900-01-01T00:00:00.000Z";
	if (
		Math.abs(
			DateTime.fromISO(cacheTime)
				.diffNow()
				.as("minutes")
		) > 60
	) {
		await refresh(db);
	}

	const repos = await db
		.collection("repos")
		.find()
		.sort("lastPushed", -1)
		.toArray();

	setCors(req, res);
	res.setHeader("Cache-Control", "s-maxage=86400, max-age=0");
	res.json(repos);
};

const loadLanguages = async repo => {
	const { data: languages } = await octokit().repos.listLanguages({ owner: "philipf5", repo: repo.name });
	return { ...repo, languages };
};

const refresh = async db => {
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
	const repos = reposCall.data.map(r => ({
		name: r.name,
		url: r.html_url,
		lastPushed: new Date(r.pushed_at),
		topLanguage: r.language,
		topics: r.topics,
	}));

	await Promise.all(repos.map(loadLanguages));
	await Promise.all([
		db.collection("repos").insertMany(repos),
		db.collection("cacheUpdates").insertOne({ type: "repos", time: new Date() }),
	]);
};
