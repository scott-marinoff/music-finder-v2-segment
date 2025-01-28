// This function executes when a user loads the sign up page
function signupPageViewed() {

	// Set a 'Signup Page Views' count Super Property
	let pagesViewed = mixpanel.get_property("Signup Page Views (Session)");

	if (pagesViewed !== 'undefined') {
		mixpanel.register_once({
			"Signup Page Views (Session)": parseInt(1)
		});
	} else {
		mixpanel.register({
			"Signup Page Views (Session)": parseInt([pagesViewed]) + 1
		});
	}

	mixpanel.track("Viewed Signup Page");
	analytics.track("Viewed Signup Page");
}

// This function executes after a user successfully signs up
// The "user" object contains the following properties: name, email, favorite_genre, plan, id
// e.g. calling user.id will return the user's id
function accountCreated(user) {

	mixpanel.identify(user.id);

	const currentDate = new Date();
	const timestamp = currentDate.toISOString();

	mixpanel.people.set({

		"$name" : user.name,
		"$email" : user.email,
		"$created" : timestamp,
		"Plan" : user.plan,
		"Preferred Genre" : user.favorite_genre
	});

	mixpanel.people.union({
		"Genres Played" : user.favorite_genre
	});

	mixpanel.register({
		"User ID" : user.id,
		"Plan" : user.plan,
		"Preferred Genre" : user.favorite_genre
	});

	mixpanel.track("Created Account");
}

// This function executes when a user successfully logs in
// The "user" object contains the following properties: name, email, favorite_genre, plan, id
// e.g. calling user.id will return the user's id
function login(user) {

	mixpanel.identify(user.id);

	mixpanel.register({
		"User ID" : user.id,
		"Plan" : user.plan,
		"Preferred Genre" : user.favorite_genre
	});

	mixpanel.track("Logged In");
}

// This function executes when a user successfully logs out
// It clears super properties from the Mixpanel cookie
async function logout() {

	await mixpanel.track("Logged Out");
	mixpanel.reset();
}

// This function executes every time a song is played
// The "song" object contains the following properties: title, artist, genre, duration
// e.g. calling song.title will return the song's title
function songPlayed(song) {

	// Set a 'Songs Played' count Super Property
	let playedProperty = "Songs Played (Session)";
	let songsPlayed = mixpanel.get_property([playedProperty]);

	// Add Songs Played
	if (songsPlayed === 'undefined') {
		mixpanel.register_once({
			// Why does MP interpret this as a String when it's clearly a Number?
			[playedProperty] : parseInt(1)
		});
	} else {
		mixpanel.register({
			[playedProperty] : parseInt([songsPlayed]) + 1
		});
	};

	// Add Artists played to profile
	mixpanel.people.union({
		"Artists Played" : song.artist,
		"Genres Played" : song.genre
	});

	// Track songs played to profile
	mixpanel.people.set_once({
		"Songs Played" : parseInt(0)
	});

	mixpanel.people.increment("Songs Played", 1);

	// Track song played event
	mixpanel.track("Played Song",{
		"Title" : song.title,
		"Artist" : song.artist,
		"Genre" : song.genre,
		"Duration" : song.duration
	});

	analytics.track("Played Song", {
	  "Title": song.title,
	  "Artist" : song.artist
	});

	analytics.identify({
	  traits: {
	    '$add_to_songs_played': 1
	  }
	});
}

// This function executes every time a song is purchased
// The "song" object contains the following properties: title, artist, genre, duration, price
// e.g. calling song.title will return the song's title
function songPurchased(song) {

	// Set a 'Songs Purchased' count Super Property
	let purchasedProperty = "Songs Purchased (Session)";
	let songsPurchased = mixpanel.get_property([purchasedProperty]);

	let spentProperty = "Total Spent (Session)";
	let totalSpent = mixpanel.get_property([spentProperty]);

	// Add Songs Purchased and Total Spent as Super Properties
	if (songsPurchased === 'undefined') {
		// No purchases made this session
		mixpanel.register_once({
			// Set 'Songs Purchased' and 'Total Spent'
			[purchasedProperty] : parseInt(1),
			[spentProperty] : parseInt(song.price)
		});
	} else {
		// Purchases have already been made this session
		mixpanel.register({
			// Increment Songs Purchased and Total Spent
			[purchasedProperty] : parseInt([songsPurchased]) + 1,
			[spentProperty] : parseInt([totalSpent]) + parseInt(song.price)
		});
	};

	// Add songs purchased to profile
	mixpanel.people.union({
		"Artists Purchased" : song.artist,
		"Genres Purchased" : song.genre
	});

	// Add count and cost of songs purchased to profile
	mixpanel.people.set_once({
		"Songs Purchased" : parseInt(0),
		"Total Spent" : parseInt(0)
	});

	mixpanel.people.increment({
		"Songs Purchased" : parseInt(1), 
		"Total Spent" : parseInt(song.price)
	});

	// Track song purchase event
	mixpanel.track("Purchased Song",{
		"Title" : song.title,
		"Artist" : song.artist,
		"Genre" : song.genre,
		"Price" : parseInt(song.price)
	});
}

// This function executes when a user upgrades from a Free plan to a Premium plan
function planUpgraded() {
	
	// Get current date/time in ISO format
	const currentDate = new Date();
	const timestamp = currentDate.toISOString();

	// Grab properties from MP cookie
	let currentPlan = mixpanel.get_property('Plan');
	let lastChange = mixpanel.get_property('Last Upgraded');

	// Track upgrade with previous plan and date last changed
	// Will allow you to calc time between upgrade/downgrade
	mixpanel.track("Upgraded Plan",{
		"Upgraded From" : [currentPlan],
		"Last Upgraded" : [lastChange]
	});

	// Update user profile with new plan info
	mixpanel.people.set({
		"Plan" : "Premium",
		"Last Upgraded" : timestamp
	});

	// Track number of upgrades
	mixpanel.people.set_once({
		"Times Upgraded" : parseInt(0)
	});

	mixpanel.people.increment({
		"Times Upgraded" : parseInt(1)
	});

	// Update cookie with new plan info
	mixpanel.register({
		"Plan" : "Premium",
		"Last Upgraded" : timestamp
	});
}

// This function executes when a user downgrades from a Premium plan to a Free plan
function planDowngraded() {
	
	// Get current date/time in ISO format
	const currentDate = new Date();
	const timestamp = currentDate.toISOString();

	// Grab properties from MP cookie
	let currentPlan = mixpanel.get_property('Plan');
	let lastChange = mixpanel.get_property('Last Upgraded');

	// Track downgrade with previous plan and date last changed
	// Will allow you to calc time between upgrade/downgrade
	mixpanel.track("Downgraded Plan",{
		"Downgraded From" : currentPlan,
		"Last Upgraded" : [lastChange]
	});

	// Update user profile with new plan info
	mixpanel.people.set({
		"Plan" : "Free",
		"Last Downgraded" : timestamp
	});

	// Track number of downgrades
	mixpanel.people.set_once({
		"Times Downgraded" : parseInt(0)
	});

	mixpanel.people.increment({
		"Times Downgraded" : parseInt(1)
	});

	// Update cookie with new plan info
	mixpanel.register({
		"Plan" : "Free",
		"Last Downgraded" : timestamp
	});
}
