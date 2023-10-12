const childProcess = require("child_process");
const path = require("path");

const dev = process.argv[2] === "dev";

runCheck(() => {
	// Run migrations
	childProcess.spawnSync("node", ["-e", 'require("./utils/migration").up()'], {
		stdio: "inherit",
	});

	// Start GraphQL-server; uncomment the "acl" to turn on the acl rules
	if (dev)
		childProcess.spawnSync("npm", ["run", "dev", "acl"], {
			stdio: "inherit",
			shell: process.platform === "win32",
		});
	else
		childProcess.spawnSync("npm", ["start", "acl"], {
			stdio: "inherit",
			shell: process.platform === "win32",
		});
});

/**
 * Periodically check database connection until every connection is established.
 * Timeout after 60 tries. Execute callback after Success
 */
async function runCheck(callback) {
	let waited = 0;
	while (waited <= 60) {
		if (waited === 60) {
			console.error(
				"\nERROR: Time out reached while waiting for database connections to be available.\n"
			);
			process.exit(1);
		}

		const exitCode = await checkConnections();
		if (exitCode === 0) break;

		waited++;
	}
	callback();
}

/**
 * start child process to check database connections
 */
function checkConnections() {
	return new Promise((resolve) => {
		let child = childProcess.fork(
			path.normalize("./scripts/testDatabaseConnectionsAvailable.js"),
			{ stdio: "ignore" }
		);
		child.on("exit", (code) => {
			resolve(code);
		});
	});
}
