// read JSON data
getJsonObject('data.json', function(data) {
  charactersData = data.Characters; // Save the data for later
  filterAndSearch();
}, function(xhr) {
  console.error("Failed to fetch data:", xhr);
});

// get JSON object
function getJsonObject(path, success, error) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
              if (success) success(JSON.parse(xhr.responseText));
          } else {
              if (error) error(xhr);
          }
      }
  };
  xhr.open("GET", path, true);
  xhr.send();
}

// process searches
function processSearch(event) {
  if (event.type === 'input') {
    // Prevent default form submission behavior (no press enter)
    event.preventDefault();
  }
  filterAndSearch();
}

function enableDisableCheckbox() {
  // Disable or enable checkboxes based on the number of selected checkboxes
  const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
  allCheckboxes.forEach(checkbox => {
    checkbox.disabled = !checkbox.checked && selectedChecks >= 2;
  });
}

function handleCheckboxChange(checkbox) {
  const charID = checkbox.id;
  if (checkbox.checked) {
    selectedChecks++;
    checkboxStates[charID] = true;
    selectedCharacters.push(charID)
  } else {
    selectedChecks--;
    checkboxStates[charID] = false;
    const index = selectedCharacters.indexOf(charID);
        if (index > -1) {
            selectedCharacters.splice(index, 1);
        }
  }
  
  updateCharacterComparison();
  enableDisableCheckbox();

  if (selectedCharacters.length === 2) {
    const characterOne = charactersData.find(c => c.name === selectedCharacters[0]);
    const characterTwo = charactersData.find(c => c.name === selectedCharacters[1]);
    displayComparisonResults(characterOne, characterTwo);
  } else {
    resertComparisonResults();
  }

}

function updateCharacterComparison(){
  // start by resetting comparisons and getting values
  resetComparison('left');
  resetComparison('right');

  // Update comparisons based on selectedCharacters
  selectedCharacters.forEach((characterId, index) => {
      if (index < 2) { // Only update if it's the first or second character
          const side = index === 0 ? 'comparison-left' : 'comparison-right';
          const character = charactersData.find(c => c.name === characterId);
          if (character) {
              document.getElementById(`name-${side === 'comparison-left' ? 'left' : 'right'}`).textContent = character.name;
              document.getElementById(`image-${side === 'comparison-left' ? 'left' : 'right'}`).src = character.image_url;
          }
      }
  });
}

function resetComparison(side){
  document.getElementById(`name-${side}`).textContent = 'Unknown';
  document.getElementById(`image-${side}`).src = 'images/unknown-character.png'; // Reset to default unknown image
}

//populate table
function populateTable(data) {
  const tableBody = document.getElementById('character-table-body');
  let tableHTML = '';
  if (data.length == 0){
    tableHTML = '<tr><td colspan="9" style="text-align:center;">No results found</td></tr>';
  }else{
    data.forEach(character => {
      const isChecked = checkboxStates[character.name] ? 'checked' : '';
      const htmlCheck = `<td><input type="checkbox" id="${character.name}" ${isChecked}/></td>`;
      tableHTML += `
        <tr>
          <td>${character.name}</td>
          <td>${character.strength}</td>
          <td>${character.speed}</td>
          <td>${character.skill}</td>
          <td>${character.fear_factor}</td>
          <td>${character.power}</td>
          <td>${character.intelligence}</td>
          <td>${character.wealth}</td>
          ${htmlCheck}
        </tr>
      `;
    })
  }

  tableBody.innerHTML = tableHTML;
  enableDisableCheckbox();
}

// update the filter handles
function updateFilters() {
  Object.keys(filters).forEach(filter => {
    const fromSlider = document.getElementById(`${filter}From`);
    const toSlider = document.getElementById(`${filter}To`);
    let fromValue = parseInt(fromSlider.value, 10);
    let toValue = parseInt(toSlider.value, 10);

    if (fromValue >= toValue) {
      if (fromSlider === document.activeElement) {
        fromSlider.value = toValue - 1 >= parseInt(fromSlider.min, 10) ? toValue - 1 : parseInt(fromSlider.min, 10);
        fromValue = parseInt(fromSlider.value, 10);
      } else if (toSlider === document.activeElement) {
        toSlider.value = fromValue + 1 <= parseInt(toSlider.max, 10) ? fromValue + 1 : parseInt(toSlider.max, 10);
        toValue = parseInt(toSlider.value, 10); 
      };
    };

    filters[filter].from = fromValue;
    filters[filter].to = toValue;
  });

  filterAndSearch();
};

// no need for old search function now, i have combined filtering and searching into one
function filterAndSearch() {
  const searchValue = document.getElementById('search-input').value.toLowerCase();
  const filteredCharacters = charactersData.filter(character => {
    return Object.keys(filters).every(filter => {
      return character[filter] >= filters[filter].from && character[filter] <= filters[filter].to;
    }) && character.name.toLowerCase().includes(searchValue);
  });
  populateTable(filteredCharacters);
};

// function to update or create a value display for a slider
function updateSliderValue(slider) {
  let valueDisplayId = `${slider.id}-value`;
  let valueDisplay = document.getElementById(valueDisplayId);

  // create the value display if it does not exist
  if (!valueDisplay) {
    valueDisplay = document.createElement('div');
    valueDisplay.id = valueDisplayId;
    valueDisplay.classList.add('slider-value-display');
    document.body.appendChild(valueDisplay); // append to body to avoid positioning issues
  };

  // calculate the thumb position
  const sliderWidth = slider.offsetWidth;
  const min = slider.min ? parseInt(slider.min, 10) : 0;
  const max = slider.max ? parseInt(slider.max, 10) : 100;
  const currentValue = slider.value ? parseInt(slider.value, 10) : min;
  const percentage = (currentValue - min) / (max - min);
  const thumbOffset = percentage * sliderWidth;
  const sliderRect = slider.getBoundingClientRect();

  // set the content of the value display
  valueDisplay.textContent = slider.value;

  // adjust the position of the value display
  valueDisplay.style.position = 'absolute';
  valueDisplay.style.left = `${sliderRect.left + window.scrollX + thumbOffset}px`;
  valueDisplay.style.top = `${sliderRect.top + window.scrollY + 0}px`;
};

function displayComparisonResults(c1, c2){
  const attributes = ['strength', 'speed', 'skill', 'fear_factor', 'power', 'intelligence', 'wealth'];

  let c1winCount = 0;
  let c2winCount = 0;

  attributes.forEach(attr => {

    let c1Wins, c2Wins;
    if (c1[attr] > c2[attr]) {
      c1Wins = true;
      c2Wins = false;
    } else if (c1[attr] < c2[attr]) {
      c1Wins = false;
      c2Wins = true;
    } else {
      // attributes are equal, randomly decide the winner
      const randomWinner = Math.random() < 0.5;  // random true or false
      c1Wins = randomWinner;
      c2Wins = !randomWinner;
    }

    if (c1Wins) {
      c1winCount++;
      // If c1 wins, find the corresponding mark in left-results
      const Wmark = document.querySelector(`#left-results .mark[data-attribute="${attr}"]`);
      Wmark.innerHTML = '&#x2713;';
      const Lmark = document.querySelector(`#right-results .mark[data-attribute="${attr}"]`);
      Lmark.innerHTML = '&nbsp;'; // blank space for layout
    } else if (c2Wins) {
      c2winCount++;
      // c2 wins, find the corresponding mark in right-results 
      const Wmark = document.querySelector(`#right-results .mark[data-attribute="${attr}"]`);
      Wmark.innerHTML = '&#x2713;'; 
      const Lmark = document.querySelector(`#left-results .mark[data-attribute="${attr}"]`);
      Lmark.innerHTML = '&nbsp;'; // blank space for layout
    }

  });

  const leftResults = document.getElementById('left-results');
  const rightResults = document.getElementById('right-results');

  console.log(c1winCount)
  console.log(c2winCount)
  // now update the colour for the winner
  if (c1winCount > c2winCount){
    leftResults.style.backgroundColor = 'green'
    rightResults.style.backgroundColor = 'red'
  } else if (c1winCount < c2winCount){
    leftResults.style.backgroundColor = 'red'
    rightResults.style.backgroundColor = 'green'
  } else{
    leftResults.style.backgroundColor = 'rgb(31, 31, 31)'
    rightResults.style.backgroundColor = 'rgb(31, 31, 31)'
  }

  comparisonHistory.push({
    characters: [c1.name, c2.name],
  })
}

function resertComparisonResults(){
  const attributes = ['strength', 'speed', 'skill', 'fear_factor', 'power', 'intelligence', 'wealth'];
  attributes.forEach(attr => {
    const leftMark = document.querySelector(`#left-results .mark[data-attribute="${attr}"]`);
    const rightMark = document.querySelector(`#right-results .mark[data-attribute="${attr}"]`);
    if (leftMark && rightMark) {
      leftMark.innerHTML = ''; 
      rightMark.innerHTML = '';
    }
  });
  const leftResults = document.getElementById('left-results');
  const rightResults = document.getElementById('right-results');
  leftResults.style.backgroundColor = 'rgb(31, 31, 31)'
  rightResults.style.backgroundColor = 'rgb(31, 31, 31)'

};

// to store previous results
let comparisonHistory = []

// initialise variables to count the amount of selected checkboxes & object to maintain the currently selected ones
let selectedChecks = 0;
let checkboxStates = {};
let selectedCharacters = [];

let filters = {
  strength: {from: 0, to: 100},
  speed: {from: 0, to: 100},
  skill: {from: 0, to: 100},
  fear_factor: {from: 0, to: 100},
  power: {from: 0, to: 100},
  intelligence: {from: 0, to: 100},
  wealth: {from: 0, to: 100}
};

// update displays on window resize to ensure correct positioning
window.addEventListener('resize', () => {
  document.querySelectorAll('.slider-controls input[type="range"]').forEach(input => {
    updateSliderValue(input);
  });
});

//listen to sliders
document.querySelectorAll('.slider-controls input[type="range"]').forEach(input => {
  input.addEventListener('input', updateFilters);

  updateSliderValue(input);

  // add event listener for dynamic updates
  input.addEventListener('input', function() {
    updateSliderValue(input);
  });
});

// listening to searches
document.getElementById("search-input").addEventListener("input", processSearch);

// assuming tableBody is available when this script runs (script is called at end of html)
// handle checkbox changes for all checkboxes
document.getElementById('character-table-body').addEventListener('change', function(event) {
  if (event.target.type === 'checkbox') {
    handleCheckboxChange(event.target);
  };
});



