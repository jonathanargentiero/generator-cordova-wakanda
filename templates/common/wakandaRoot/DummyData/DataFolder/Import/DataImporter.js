// A simple log for the output
var log = "before: " + ds.Contact.length;

ds.Contact.all().remove();

// Main function
function doImport() {
    var lines = loadText(ds.getModelFolder().path + "/DataFolder/Import/data.csv" ).split("\n");
    var columns = [],
    	newEntity = {};
    
    // first_name,last_name,company_name,address,city,county,state,zip,phone1,phone2,email,web
    lines.forEach(function(oneLine) {
        columns = oneLine.split(",");
        newEntity = new ds.Contact({
            first_name: columns[1],
            last_name: columns[2],
            company_name: columns[3],
            address: columns[4],
            city: columns[5],
            country: columns[6],
            state: columns[7],
            zip: columns[8],
            phone1: columns[9],
            phone2: columns[10],
            email: columns[11],
            web: columns[12]

        });
    	newEntity.save();
    });
}
// Call the function 
doImport();

// Log result
log += " / after: " + ds.Contact.length;