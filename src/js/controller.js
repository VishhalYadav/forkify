import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/RecipeView';
import searchView from './views/searchView';
import resultsView from './views/resultsView';
import bookmarksView from './views/bookmarksView';
import addRecipeView from './views/addRecipeView';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import paginationView from './views/paginationView';
// https://forkify-api.herokuapp.com/v2

if (module.hot) {
  module.hot.accept();
}

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;

    // Spinner
    recipeView.spinnerLoading();
    // Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);

    // Loading recipe
    await model.loadRecipe(id);
    // Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.spinnerLoading();
    // 1.) Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2.) load search results
    await model.loadSearchResults(query);

    // 3.) Render results
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());
    // 4.) Render inital pagination buttons.
    paginationView.render(model.state.search);
  } catch (err) {
    console.error(err);
  }
};

const controlPagination = function (gotoPage) {
  // 1.) Render NEW results
  resultsView.render(model.getSearchResultsPage(gotoPage));
  // 2.) Render NEW pagination buttons.
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Update the recipe servings (in the state).
  model.updateServings(newServings);
  // Update the recipe view
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // Add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  // Update recipe view
  recipeView.update(model.state.recipe);

  // Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Show loading spinner
    addRecipeView.spinnerLoading();
    // Upload the new recipe data.
    await model.uploadRecipe(newRecipe);

    // Render recipe
    recipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // Render Bookmark View
    bookmarksView.render(model.state.bookmarks);

    // Change ID in URL.
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    // Close Form Window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC);
  } catch (err) {
    console.error(err);
    addRecipeView.renderError(err.message);
  }
};
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  console.log('Hello World');
};
init();
