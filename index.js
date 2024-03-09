// listening to searches
document.getElementById("search-input").addEventListener("input", processSearch);

function processSearch(event) {
  var searchValue = event.target.value;
  console.log(searchValue);
  search(searchValue);
}

// read JSON data
getJsonObject('data.json', function(data) {
  charactersData = data.Characters; // Save the data for later
  populateTable(charactersData); // Populate the table with all characters initially
}, function(xhr) {
  console.error("Failed to fetch data:", xhr);
});

function search(searchValue){
	// TODO: search JSON data for the searchValue
}

//populate the table
function populateTable(data) {
  const tableBody = document.getElementById('character-table-body');

  let tableHTML = '';

  data.forEach(character => {
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
      </tr>
    `;
  });

  tableBody.innerHTML = tableHTML;
}

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


