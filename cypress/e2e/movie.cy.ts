describe('Mostly Mundane Movies', () => {
    beforeEach(() => {
      cy.visit('https://mostly-mundane-movies.netlify.app/');
    });

//----------------------------------------------------------------------------------------------------------------------------------------------------------
	// Test to check if you can search without writing anything

	it("Can not search without writing a title", () => {
		cy.get('button[type="submit"]').click();
		cy.get('div[role="alert"].alert-warning.show').should('be.visible');
		cy.get('div[role="alert"].alert-warning.show').should('contain.text', 'Aww, that\'s cute').and('contain.text', 'You tried to search, good for you! 👀');
	});

//----------------------------------------------------------------------------------------------------------------------------------------------------------
	// Test to check if you can search with less than 3 characters

	it("Can not search if field does not contain at least 3 characters", () => {

		// Generate two random characters in a string
		const randomString = Math.random().toString(36).substring(2, 4);

		cy.get('input[placeholder="Enter movie title"]').type(randomString);
		cy.get('button[type="submit"]').click();
		cy.get('div[role="alert"].alert-warning.show').should('be.visible');
		cy.get('div[role="alert"].alert-warning.show').should('contain.text', 'Wow, that was stupid').and('contain.text', 'Search query must be at least 3 characters long, duh ^^ 🙄');
	});

//----------------------------------------------------------------------------------------------------------------------------------------------------------
	// Test to search and get search hits. Checks if there is atleast one

	it("Can search after 'The Matrix' and get at least one search hits", () => {
		cy.get('input[placeholder="Enter movie title"]').type('The Matrix');
		cy.get('button[type="submit"]').click();
		cy.get('.movie-list-item').should('have.length.at.least', 1);
	});

//----------------------------------------------------------------------------------------------------------------------------------------------------------
	// Test to see if loading spinner is visible

	it("When you wait you should see a loading spinner", () => {
		cy.get('input[placeholder="Enter movie title"]').type('The Matrix');
		cy.get('button[type="submit"]').click();
		cy.get('#loading-wrapper').should('be.visible');
		cy.get('img[src="/assets/popcorn_1f37f-c604ebb9.png"]').should('be.visible');
	});

//----------------------------------------------------------------------------------------------------------------------------------------------------------
	// Test to see if it can search for a movie and go to the first movie page

	it("Can click on first search hit and go to the movie page", () => {
    	cy.get('input[placeholder="Enter movie title"]').type('The Matrix');
    	cy.get('button[type="submit"]').click();
    	cy.get('.movie-list-item').first().should('be.visible').children().then($searchResult => {
        	const movieId = $searchResult.attr('data-imdb-id');
        	cy.wrap($searchResult).find('.card-link').click();
        	cy.url().should('include', `https://mostly-mundane-movies.netlify.app/movies/${movieId}`);
    	});
	});

//----------------------------------------------------------------------------------------------------------------------------------------------------------
	// Test to see if spinner disappears when search result is shown

	it("Loading spinner disappears when search results are visible", () => {
		cy.get('input[placeholder="Enter movie title"]').type('The Matrix');
		cy.get('button[type="submit"]').click();
		cy.get('#loading-wrapper').should('be.visible');
		cy.get('.movie-list-item').should('be.visible');
		cy.get('#loading-wrapper').should('not.exist');
	});

//----------------------------------------------------------------------------------------------------------------------------------------------------------
	// Test to search after "Cat Memes" and not get any hits

	it("Does not get any hits when searching for 'Cat Memes'", () => {
		cy.get('input[placeholder="Enter movie title"]').type('Cat Memes');
    	cy.get('button[type="submit"]').click();
    	cy.get('div[role="alert"].alert-warning.show').should('be.visible').and('contain.text', 'Movie not found!');
	});

//----------------------------------------------------------------------------------------------------------------------------------------------------------
	// Test to see if you search after "The Postman always rings twice" than the request should make a timeout and display an error message

	it("Should display an error message after a timeout when searching for 'The Postman always rings twice'", () => {
		cy.get('input[placeholder="Enter movie title"]').type('The Postman always rings twice');
		cy.get('button[type="submit"]').click();
		cy.wait(1000);
		cy.get('div[role="alert"].alert-warning.show').find('.alert-heading.h4').should('contain.text', '👀').siblings('p').should('contain.text', 'Does he, really?');
	});

//----------------------------------------------------------------------------------------------------------------------------------------------------------
	// Test to see if you navigate to the path for the movie with ID "tt1337" an error message should be displayed

	it("Should display the error message when navigating to a movie with ID 'tt1337'", () => {
		cy.visit('https://mostly-mundane-movies.netlify.app/movies/tt1337');
		cy.get('div[role="alert"].alert-warning.show').should('be.visible').and('contain.text', 'LOL, what a fail').and('contain.text', 'Haxx0r now, are we?');
	});

//----------------------------------------------------------------------------------------------------------------------------------------------------------
	// Test to go to a page that does not exist and get an error message

	it("Should display an error message when navigating to a page with an incorrect IMDb ID", () => {
		cy.visit('https://mostly-mundane-movies.netlify.app/movies/abc123');
		cy.get('div[role="alert"].alert-warning.show').should('be.visible').and('contain.text', 'Hey bro, wtf?').and('contain.text', 'Incorrect IMDb ID.');
	});

//----------------------------------------------------------------------------------------------------------------------------------------------------------
	// Test to mock search-request and get-request for 'The Matrix' and respond with data from two fixtures

	it("Mock search-request and get-request for 'The Matrix' and respond with data from two fixtures", () => {

		cy.intercept('GET', 'https://www.omdbapi.com/?s=The%20Matrix&type=movie&apikey=c407a477', { fixture: 'search_matrix.json' }).as('searchRequest');
		cy.intercept('GET', 'https://www.omdbapi.com/?i=tt0133093&apikey=c407a477', { fixture: 'matrix_movie.json' }).as('matrixRequest');

		cy.get('input[placeholder="Enter movie title"]').type('The Matrix');
		cy.get('button[type="submit"]').click();

		cy.wait('@searchRequest').then(() => {
			cy.get('.movie-list-item').should('contain.text', 'The Matrix');
			cy.get('.card-link').first().click();

			cy.wait('@matrixRequest', { timeout: 4000 }).then(() => {
				cy.get('.card-title').should('contain.text', 'The Matrix');
			});
		});
	});

});
