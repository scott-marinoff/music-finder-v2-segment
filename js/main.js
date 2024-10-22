$(document).ready(function(){

	mixpanel.track_links('#mixpanelLink', 'Clicked Mixpanel Link');



	$("input").first().focus();

	$(".playButton").click(function(){
		var song = {
			title: $(this).closest(".songContainer").attr("data-title"),
			artist: $(this).closest(".songContainer").attr("data-artist"),
			genre: $(this).closest(".songContainer").attr("data-genre"),
			duration: $(this).closest(".songContainer").attr("data-duration")
		}
		songPlayed(song);
		alert("Song was played!");
	});

	$(".purchaseButton").click(function(){
		var song = {
			title: $(this).closest(".songContainer").attr("data-title"),
			artist: $(this).closest(".songContainer").attr("data-artist"),
			genre: $(this).closest(".songContainer").attr("data-genre"),
			duration: $(this).closest(".songContainer").attr("data-duration"),
			price: $(this).closest(".songContainer").attr("data-price")
		}
		songPurchased(song);
		alert("Song was purchased!");
	});

	$("#upgradeButton").click(function(){
		var email = sessionStorage.email;
		const plan = "Premium";
		$.ajax({
			url: config.auth,
			crossDomain: true,
			dataType: "json",
			data:{
				action: "upgrade",
				email: email,
				plan: plan
			},
			success: function (data) {
				if (data.result == 0) {
					alert("Server Error: please contact Big Tuna");
				}
				else {
					sessionStorage.plan = plan;
					planUpgraded();
					$("#upgradeButton").hide();
					$("#downgradeButton").show();
					alert("Plan was upgraded!");
				}
			}
		});
	});

	$("#downgradeButton").click(function(){
		var email = sessionStorage.email;
		const plan = "Free";
		$.ajax({
			url: config.auth,
			crossDomain: true,
			dataType: "json",
			data:{
				action: "downgrade",
				email: email,
				plan: plan
			},
			success: function (data) {
				if (data == 0) {
					alert("Server Error: please contact Big Tuna");
				}
				else {
					sessionStorage.plan = plan;
					planDowngraded();
					$("#upgradeButton").show();
					$("#downgradeButton").hide();
					alert("Plan was downgraded :(");
				}
			}
		});
	});

	$("#loginButton").click(function(){

		var email = $("input[name='email']").val().toLowerCase();
		var password = $("input[name='password']").val();
		
		$.ajax({
			url: config.auth,
			crossDomain: true,
			dataType: "json",
			data:{
				action: "login",
				email: email,
				password: password
			},
			success: function(data){

				if (data.result == 0) {
					alert("Server Error: please contact Big Tuna");
				}
				else if (data.result == 2) {
					alert("Invalid credentials. Please try again.");
				}
				else {
					var user = data;
					sessionStorage.email = email;
					sessionStorage.genre = user.genre;
					sessionStorage.plan = user.plan;
					sessionStorage.loggedIn = true;
					sessionStorage.justLoggedIn = true;
					sessionStorage.id = user.id;
					setTimeout(function(){
						window.location.href = "home.html";
					},333);
				}
			}
		});
	});

	$("#signupButton").click(function(){
		
		var name = $("input[name='name']").val().toLowerCase();
		var email = $("input[name='email']").val().toLowerCase();
		var password = $("input[name='password']").val();
		var genre = $("select[name='genre']").val();
		var plan = "Free";
		if (config.plan) {
			plan = $("select[name='plan']").val();
		}
		$.ajax({
			url: config.auth,
			crossDomain: true,
			dataType: "json",
			data:{
				action: "signup",
				email: email,
				password: password,
				name: name,
				genre: genre,
				plan: plan
			},
			success: function (data) {
				if (data.result == 0) {
					alert("Server Error: please contact Big Tuna");
				}
				else if (data.result == 2) {
					alert("Sorry, that email address has already been used.");
				}
				else {
					var user = data;
					sessionStorage.id = user.id;
					sessionStorage.email = email;
					sessionStorage.name = name;
					sessionStorage.genre = genre;
					sessionStorage.plan = plan;
					sessionStorage.loggedIn = true;
					sessionStorage.justCreatedAccount = true;
					setTimeout(function(){
						window.location.href = "home.html";
					},333);
				}
			}
		});

	});

	if (sessionStorage.justLoggedIn) {
		sessionStorage.removeItem("justLoggedIn");
		var user = {
			name: sessionStorage.name,
			email: sessionStorage.email,
			favorite_genre: sessionStorage.genre,
			plan: sessionStorage.plan,
			id: sessionStorage.id
		}
		login(user);
	}

	if (sessionStorage.justCreatedAccount) {
		sessionStorage.removeItem("justCreatedAccount");
		var user = {
			name: sessionStorage.name,
			email: sessionStorage.email,
			favorite_genre: sessionStorage.genre,
			plan: sessionStorage.plan,
			id: sessionStorage.id
		}
		accountCreated(user);
	}

	$("#logoutButton").click(function(){
		sessionStorage.justLoggedOut = true;
		sessionStorage.removeItem("loggedIn");
		setTimeout(function(){
			window.location.replace("index.html");
		},333);
	});

	if (sessionStorage.justLoggedOut) {
		sessionStorage.removeItem("justLoggedOut");
		logout();
	}

	if (config.plan) {
		if (sessionStorage.plan == "Premium") {
			$("#upgradeButton").hide();
		}
		if (sessionStorage.plan == "Free") {
			$("#downgradeButton").hide();
		}
	}

	$('#changeGenre').change(function() {
	    // Retrieve the selected value
	    sessionStorage.genre = $(this).val();
	    
	    $('[data-genre="'+sessionStorage.genre+'"]').show();
	});

	if (sessionStorage.genre) {
		$('[data-genre="'+sessionStorage.genre+'"]').show();
	}

})