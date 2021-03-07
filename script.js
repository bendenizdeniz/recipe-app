const mealsEl = document.getElementById('meals');
const favouriteContainer = document.getElementById('favourite-meals');
const searchBtn = document.getElementById("search");
const searchTerm = document.getElementById("search-term");
const mealPopup = document.getElementById('meal-popup');
const mealInfoEl = document.getElementById('meal-info');
const popupCloseBtn = document.getElementById('close-popup');
const refreshBtn = document.getElementById('refresh-btn');

getRandomMeal();
fetchFavouriteMeals();

async function getRandomMeal() {
    const res =
        (
            (await (await fetch('https://www.themealdb.com/api/json/v1/1/random.php')).json())
        ).meals[0];
    addMeal(res, true);
}

async function getMealById(id) {
    const res = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id);

    const resData = await res.json();
    const meal = resData.meals[0];
    return meal;
}

async function getMealsBySearch(term) {
    const res = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' + term);

    const resData = (await res.json()).meals;

    return resData;
}

function addMeal(mealData, random = false) {
    const meal = document.createElement("div");
    meal.classList.add("meal");

    meal.innerHTML = `
        <div class="meal-header">
            ${random
            ? `
            <span class="random"> Random Recipe </span>`
            : ""
        }
            <img
                src="${mealData.strMealThumb}"
                alt="${mealData.strMeal}"
            />
        </div>
        <div class="meal-body">
            <h4>${mealData.strMeal}</h4>
            <button class='favourite-btn'>
            <i class="fas fa-heart"></i>
        </button>
        </button> 
        </div>
    `;

    const mealHeader = meal.querySelector('.meal-header');

    mealHeader.addEventListener('click', () => {
        showMealInfo(mealData);
    });

    const btn = meal.querySelector('.meal-body > .favourite-btn');

    btn.addEventListener('click', () => {
        if (btn.classList.contains('active')) { //if liked before, remove from fav list
            removeMealLocStorage(mealData.idMeal)
            btn.classList.toggle('active');
        } else {    //if didnt liked before, add the fav list
            addMealLocStorage(mealData.idMeal)
            btn.classList.add('active');
        }
        fetchFavouriteMeals();
    });

    mealsEl.appendChild(meal);
}

function addMealLocStorage(mealId) {
    const mealIds = getFavMealsLocStorage();
    localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealId]));
}

function getFavMealsLocStorage() {  //get FavMeal's id.
    const mealIds = JSON.parse(localStorage.getItem('mealIds'));
    return mealIds === null ? [] : mealIds;
}

function removeMealLocStorage(mealId) {
    const mealIds = getFavMealsLocStorage();

    localStorage.setItem('mealIds',
        JSON.stringify(mealIds.filter(id =>
            id !== mealId)));
}

async function fetchFavouriteMeals() {  //get FavMeal's content infos.

    // clean the container
    favouriteContainer.innerHTML = '';

    const mealIds = getFavMealsLocStorage();

    for (let i = 0; i < mealIds.length; i++) {
        const mealId = mealIds[i];
        meal = await getMealById(mealId);
        addFavouriteMeal(meal);
    }
}

function addFavouriteMeal(mealData) {   //insert FavMeal's content infos to FavMeal's list.

    const favMeal = document.createElement('li');

    favMeal.innerHTML =
        `
        <div class='favMeal-header'>
            <img src="${mealData.strMealThumb}"
            alt="${mealData.strMeal}">
            <span>${mealData.strMeal}</span>
        </div>
        <button class="clear"><i class="fas fa-window-close"></i></button>
    `;

    const btn = favMeal.querySelector('.clear');

    btn.addEventListener('click', () => {
        removeMealLocStorage(mealData.idMeal);

        fetchFavouriteMeals();
    });

    const favMealHeader = favMeal.querySelector('.favMeal-header');
    favMealHeader.addEventListener('click', () => {
        showMealInfo(mealData);
    });

    favouriteContainer.appendChild(favMeal);
}

function showMealInfo(mealData) {
    //clean it up
    mealInfoEl.innerHTML = '';

    //update the meals info
    const mealEl = document.createElement('div');

    // get ingredients and measures
    const ingredients = [];

    for (let i = 1; i <= 20; i++) {
        if (mealData["strIngredient" + i]) {
            ingredients.push(
                `${mealData["strIngredient" + i]} - ${mealData["strMeasure" + i]
                }`
            );
        } else {
            break;
        }
    }

    mealEl.innerHTML =
        `
                     <h1>${mealData.strMeal}</h1>
                    <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">

                    <p>${mealData.strInstructions}</p>
                    <h3>Ingredients</h3>
                    <ul>
            ${ingredients
            .map(
                (ing) => `
            <li>${ing}</li>
            `
            )
            .join("")}
        </ul>

                    <h3>Making On Youtube</h3>
                    <p>${mealData.strYoutube}</p>
        `;

    mealInfoEl.appendChild(mealEl);

    //show the popup
    mealPopup.classList.remove('hidden');
}


searchBtn.addEventListener('click', async () => {
    //clean on the initial state
    mealsEl.innerHTML = '';

    //getting search value then adding meal when searched
    const search = searchTerm.value;
    const meals = await getMealsBySearch(search);

    if (meals) {
        meals.forEach(meal => {
            addMeal(meal);
        });
    }
});

popupCloseBtn.addEventListener('click', () => {
    mealPopup.classList.add('hidden');
});

refreshBtn.addEventListener('click', () => {
    location.reload();
});