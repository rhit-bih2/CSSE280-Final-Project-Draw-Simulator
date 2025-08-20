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
	Rosefire.signIn("75ad617a-b1fd-4aaf-bce2-0f950c60c240", (err, rfUser) => {
		if (err) {
			console.log("Rosefire error!", err);
			return;
		}
		console.log("Rosefire success!", rfUser);


	});

};

firebase.auth().signInWithCustomToken(rfUser.token).catch(function(error) {
	const errorCode = error.code;
	const errorMessage = error.message;
	if (errorCode === 'auth/invalid-custom-token') {
		alert('The token you provided is not valid.');
	} else {
		console.error("Custom auth error", errorCode, errorMessage);
	}
});

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
