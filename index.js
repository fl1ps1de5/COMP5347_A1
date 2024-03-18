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
};

// process searches
function processSearch(event) {
  if (event.type === 'input') {
    // Prevent default form submission behavior (no press enter)
    event.preventDefault();
  }
  filterAndSearch();
};

function enableDisableCheckbox() {
  // Disable or enable checkboxes based on the number of selected checkboxes
  const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
  allCheckboxes.forEach(checkbox => {
    checkbox.disabled = !checkbox.checked && selectedChecks >= 2;
  });
};

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

  console.log(selectedChecks);

  updateCharacterComparison();
  enableDisableCheckbox();
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
  };

  tableBody.innerHTML = tableHTML;
  enableDisableCheckbox();
};

function updateFilters() {
  Object.keys(filters).forEach(filter => {
    const fromSlider = document.getElementById(`${filter}From`);
    const toSlider = document.getElementById(`${filter}To`);
    let fromValue = parseInt(fromSlider.value, 10);
    let toValue = parseInt(toSlider.value, 10);

    if (fromValue >= toValue) {
      if (fromSlider === document.activeElement) {
          toSlider.value = fromValue + 1 <= toSlider.max ? fromValue + 1 : toSlider.max;
          toValue = toSlider.value; // Update toValue after adjustment
      } else if (toSlider === document.activeElement) {
          fromSlider.value = toValue - 1 >= fromSlider.min ? toValue - 1 : fromSlider.min;
          fromValue = fromSlider.value; // Update fromValue after adjustment
      }
  }

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
function updateSliderValueDisplay(slider) {
  let valueDisplayId = `${slider.id}-value`;
  let valueDisplay = document.getElementById(valueDisplayId);

  // create the value display if it does not exist
  if (!valueDisplay) {
    valueDisplay = document.createElement('div');
    valueDisplay.id = valueDisplayId;
    valueDisplay.classList.add('slider-value-display');
    document.body.appendChild(valueDisplay); // append to body to avoid positioning issues
  }

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
  valueDisplay.style.left = `${sliderRect.left + thumbOffset}px`;
  valueDisplay.style.top = `${sliderRect.top + 0}px`; 
}

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
    updateSliderValueDisplay(input);
  });
});

//listen to sliders
document.querySelectorAll('.slider-controls input[type="range"]').forEach(input => {
  input.addEventListener('input', updateFilters);

  updateSliderValueDisplay(input);

  // add event listener for dynamic updates
  input.addEventListener('input', function() {
    updateSliderValueDisplay(input);
  });
});

// listening to searches
document.getElementById("search-input").addEventListener("input", processSearch);

// assuming tableBody is available when this script runs (script is called at end of html)
// handle checkbox changes for all checkboxes
document.getElementById('character-table-body').addEventListener('change', function(event) {
  if (event.target.type === 'checkbox') {
    handleCheckboxChange(event.target);
  }
});


