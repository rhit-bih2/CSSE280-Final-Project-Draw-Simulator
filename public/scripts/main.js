var rhit = rhit || {};

/** globals */
rhit.FB_COLLECTION_DECKS = "Decks";
rhit.FB_KEY_AUTHOR = "Author";
rhit.FB_KEY_DECKNAME = "DeckName";
rhit.FB_KEY_CARDS = "Cards";

rhit.fbAuthManager = null;
rhit.fbDecksManager = null;
rhit.fbSingleDeckManager = null;

function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}

// ------ Data class ------
rhit.Deck = class {
	constructor(author, deckName) {
		this.author = author;
		this.deckName = deckName;
		this.cards = [];
	}
}

// ------ Login Page------
rhit.LoginPageController = class {
	constructor() {
		document.querySelector("#rosefireButton").onclick = (event) => {
			rhit.fbAuthManager.signIn();
		};
	}
}

rhit.FbAuthManager = class {
	constructor() {
		this._user = null;
	}
	beginListening(changeListener) {
		firebase.auth().onAuthStateChanged((user) => {
			this._user = user;
			changeListener();
		});
	}
	signIn() {
		console.log(`Sign in using Rosefire`);
		Rosefire.signIn("d3102d1c-50c1-44b0-b352-6b44f9c6a8e2", (err, rfUser) => {
			if (err) {
				console.log("Rosefire error!", err);
				return;
			}
			console.log("Rosefire success!", rfUser);

			firebase.auth().signInWithCustomToken(rfUser.token).catch((error) => {
				const errorCode = error.code;
				const errorMessage = error.message;
				if (errorCode === 'auth/invalid-custom-token') {
					alert('The token you provided is not valid.');
				} else {
					console.log("Custom auth error", errorCode, errorMessage);
				}
			});
		});

	}
	signOut() {
		firebase.auth().signOut().catch((error) => {
			console.log("Sign out error");
		});
	}
	get isSignedIn() {
		return !!this._user;
	}
	get uid() {
		return this._user.uid;
	}
}




// ------ List Page------
rhit.ListPageController = class {
	constructor() {
		document.querySelector("#submitAddDeck").addEventListener("click", (event) => {
			const Deck = document.querySelector("#inputDeck").value;
			rhit.fbMovieDecksManager.add(Deck);
		});
	}
	updateList() { }
}

rhit.FbDecksManager = class {
	constructor(uid) {
		this._uid = uid;
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_MOVIEQUOTE);
		this._unsubscribe = null;
	}
	add(quote, movie) {
		this._ref.add({
			[rhit.FB_KEY_QUOTE]: quote,
			[rhit.FB_KEY_MOVIE]: movie,
			[rhit.FB_KEY_AUTHOR]: rhit.fbAuthManager.uid,
			[rhit.FB_KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now(),
		})
			.then(function (docRef) {
				console.log("Document written with ID: ", docRef.id);
			})
			.catch(function (error) {
				console.error("Error adding document: ", error);
			});
	}
	beginListening(changeListener) {

		let query = this._ref.orderBy(rhit.FB_KEY_LAST_TOUCHED, "desc").limit(50);
		if (this._uid) {
			query = query.where(rhit.FB_KEY_AUTHOR, "==", this._uid);
		}

		this._unsubscribe = query.onSnapshot((querySnapshot) => {

			this._documentSnapshots = querySnapshot.docs;

			// querySnapshot.forEach((doc) => {
			// 	console.log(doc.data());
			// });

			if (changeListener) {
				changeListener();
			}
		});
	}
	stopListening() {
		this._unsubscribe();
	}
	// update(id, quote, movie) { }
	// delete(id) { }
	get length() {
		return this._documentSnapshots.length;
	}
	getMovieQuoteAtIndex(index) {
		const docSnapshot = this._documentSnapshots[index];
		const mq = new rhit.MovieQuote(
			docSnapshot.id,
			docSnapshot.get(rhit.FB_KEY_QUOTE),
			docSnapshot.get(rhit.FB_KEY_MOVIE),
		);
		return mq;
	}
}



// ------ Detail Page------
rhit.DetailPageController = class {
	constructor() {
		document.querySelector("#menuSignOut").onclick = (event) => {
			rhit.fbAuthManager.signOut();
		};

		//TODO: update

		document.querySelector("#submitDeleteDeck").onclick = (event) => {
			rhit.fbSingleDeckManager.delete().then(function () {
				console.log("Document successfully deleted");
				window.location.href = "/list.html";
			}).catch(function (error) {
				console.error("Error removing document: ", error);
			});
		};

		rhit.fbSingleDeckManager.beginListening(this.updateView.bind(this));
	}
	updateView() {
		document.querySelector("#deckNameText").innerHTML = rhit.fbSingleDeckManager.deckName;
		//TODO: update cards 

		if (rhit.fbSingleDeckManager.author == rhit.fbAuthManager.uid) {
			document.querySelector("#menuDelete").style.display = "flex";
			document.querySelector("#deckNameText").contentEditable = "true";
			for(let myElement of document.querySelectorAll(".deck-item")){
				myElement.contentEditable = "true";
			}
			document.querySelector("#deck-add-btn").style.display = "flex";
		}
	}
}

rhit.FbSingleDeckManager = class {
	constructor(deckId) {
		this._documentSnapshot = {};
		this._unsubscribe = null;
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_DECKS).doc(deckId);
	}
	beginListening(changeListener) {
		this._unsubscribe = this._ref.onSnapshot((doc) => {
			if (doc.exists) {
				console.log("Document data:", doc.data());
				this._documentSnapshot = doc;
				changeListener();
			} else {
				console.log("No such document!");
				// window.localStorage.href = "/";
			}
		});
	}
	stopListening() {
		this._unsubscribe();
	}

	update(name, cards) {
		this._ref.update({
			[rhit.FB_KEY_DECKNAME]: name,
			[rhit.FB_KEY_CARDS]: cards,
		})
			.then(() => {
				console.log("Document successfully updated");
			})
			.catch(function (error) {
				console.error("Error updating document: ", error);
			});
	}
	delete() {
		return this._ref.delete();
	}

	get cards() {
		return this._documentSnapshot.get(rhit.FB_KEY_CARDS);
	}
	get deckName() {
		return this._documentSnapshot.get(rhit.FB_KEY_DECKNAME);
	}
	get author() {
		return this._documentSnapshot.get(rhit.FB_KEY_AUTHOR);
	}
}

// ------ Main Helper ------
rhit.checkForRedirects = function () {
	if (document.querySelector("#loginPage") && rhit.fbAuthManager.isSignedIn) {
		window.location.href = "/list.html";
	}

	if (!document.querySelector("#loginPage") && !rhit.fbAuthManager.isSignedIn) {
		window.location.href = "/";
	}
};


rhit.initializePage = function () {
	let params = new URLSearchParams(document.location.search);
	if (document.querySelector("#listPage")) {
		console.log("You are on the list page.");
		const uid = params.get("uid");
		console.log('uid :>> ', uid);
		rhit.fbDecksManager = new rhit.FbDecksManager(uid);
		new rhit.ListPageController();
	}

	if (document.querySelector("#detailPage")) {
		console.log("You are on the detail page.");
		const deckId = params.get("id");
		if (!deckId) {
			console.log("Error: Missing deck id!");
			window.localStorage.href = "/";
		}
		rhit.fbSingleDeckManager = new rhit.FbSingleDeckManager(deckId);
		new rhit.DetailPageController();
	}

	if (document.querySelector("#loginPage")) {
		console.log("You are on the login page.");
		new rhit.LoginPageController();
	}
};

//------ Main------
rhit.main = function () {
	console.log("Ready");
	rhit.fbAuthManager = new rhit.FbAuthManager();
	rhit.fbAuthManager.beginListening(() => {
		console.log('isSignedIn :>> ', rhit.fbAuthManager.isSignedIn);
		console.log('uid: ', rhit.fbAuthManager.uid);
		rhit.checkForRedirects();
		rhit.initializePage();
	});
};

rhit.main();
