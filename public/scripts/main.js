/**
 * @fileoverview
 * Provides the JavaScript interactions for all pages.
 *
 * @author 
 * PUT_YOUR_NAME_HERE
 */

/** namespace. */
var rhit = rhit || {};

/** globals */
rhit.variableName = "";

/** function and class syntax examples */
rhit.functionName = function () {
	/** function body */
};

signIn() = function () {
	// Please note this needs to be the result of a user interaction
	// (like a button click) otherwise it will get blocked as a popup
	Rosefire.signIn("<REGISTRY_TOKEN>", (err, rfUser) => {
		if (err) {
			console.log("Rosefire error!", err);
			return;
		}
		console.log("Rosefire success!", rfUser);

		// TODO: Use the rfUser.token with your server.
	});

};

rhit.ClassName = class {
	constructor() {

	}

	methodName() {

	}
}

/* Main */
/** function and class syntax examples */
rhit.main = function () {
	console.log("Ready");
};

rhit.main();
