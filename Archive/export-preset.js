//Get the existing configs/presets from the database and populate dropdowns
function Database_GetExportSettings() {
    fetch("//localhost:2492/get-export-settings")
    .then((response) => {
        if(!response.ok) {throw new Error("HTTP error ${response.status}");}
        return response.text();
    })
    .then((result) => {

    })
}