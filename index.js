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

// read JSON data
getJsonObject('data.json', function(data) {
  charactersData = data.Characters; // Save the data for later
  populateTable(charactersData); // Populate the table with all characters initially
}, function(xhr) {
  console.error("Failed to fetch data:", xhr);
});

function processSearch(event) {
  // event.preventDefault(); // I dont want anything to happen when enter is pushed

  if (event.type === 'input') {
    // Prevent default form submission behavior (if applicable)
    event.preventDefault();
  }
  
  var searchValue = event.target.value;
  console.log(searchValue);
  search(searchValue);

}

function enableDisableCheckbox() {
  // Disable or enable checkboxes based on the number of selected checkboxes
  const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
  allCheckboxes.forEach(checkbox => {
    checkbox.disabled = !checkbox.checked && selectedChecks >= 2;
  });
}

// initialise variables to count the amount of selected checkboxes & object to maintain the currently selected ones
let selectedChecks = 0;
let checkboxStates = {};
let selectedCharacters = [];

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
  // start by resetting comparisons and ge
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

//process searchs
function search(searchValue) {
  const trimmedSearchValue = searchValue.trim();

  const filteredCharacters = charactersData.filter(character => {
    const searchIn = `${character.name}`.toLowerCase();
    return searchIn.includes(trimmedSearchValue.toLowerCase());
  });
  populateTable(filteredCharacters);
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
}

// listening to searches
document.getElementById("search-input").addEventListener("input", processSearch);

// assuming tableBody is available when this script runs (script is called at end of html)
// handle checkbox changes for all checkboxes
document.getElementById('character-table-body').addEventListener('change', function(event) {
  if (event.target.type === 'checkbox') {
    handleCheckboxChange(event.target);
  }
});