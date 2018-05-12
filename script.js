/* **********
 * BUGS:
 * ********
 * - Pressing submit button repeatedly will not reset the list, but add columns to it
 * // TBC: remove block of discontinued medications from inputVar, in case it has been submitted as well
 * - Elements in newArrayOfMeds are turned into references to same objecs as in oldArrayOfMeds with the assignment operations.
 *   The old array the does not contain the original status/values.
 * **********
 * PENDING FEATURES:
 * *********
 * - highlight changes when medication changed
 * *********
 */

// Medication constructor
var Medication = function(status, name, dose, unit, route, frequency, prn) {
	this.status = status;
	this.name = name;
	this.dose = dose;
	this.unit = unit;
	this.route = route;
	this.frequency = frequency;
	this.prn = prn;
};

// Define the regular expressions to identify the corresponding text parts
var reName = /^(\w+\s*\D*)/;
var reDose = /^\w+\s+(\d+,?\d*\.?\d*)/;
var reUnit = /\d\s?(g|mg|U|units|mcg|mL|cc|puff|spray|supp(ository)?)/i;
var reRoute = /\s(po|by mouth|oral(ly)?|inj(ect)? ?(SQ|subcutaneously|intramusc(\w)*)?|inh(\w)*|nose|(intra)?nasal(\w)*|rectal(\w)*|nostril(s)*|(each|left|right) ?eye|(each|left|right) ?ear|vaginal(\w)*)/i;
var reFrequency = /\s(daily|qd|qAM|qPM|BID|twice daily|TID|(three|3) ?(times|x) daily|QID|(four|4) ?(times|x) daily|qHS|(at )?bedtime|(q|every) ?\d+ ?(min\w*|h|hrs|hours|day(s)?|week(s)?|month(s)?))/i;
var rePrn = /\s((PRN|as needed)(\s|\w)*)$/i;

function assignText(text, regex) {
	if (regex.test(text) == true) {
		return text.match(regex)[1];
	} else {
		return "";
	};
};

var rtable = document.getElementById("responsiveTable"); //variable that contains the location of the target table in the html
var oldArrayOfMeds = []; // as read in from the input field, will never be modified to allow resetting to original state
var newArrayOfMeds = []; // will contain the changes made and be used to create the text output

var continueMed = function(row) {
	rtable.rows[row].cells[2].innerHTML = "<b>" + oldArrayOfMeds[row].name + "</b><br>" + oldArrayOfMeds[row].dose + " " + oldArrayOfMeds[row].unit + " " + oldArrayOfMeds[row].route + "<br>" + oldArrayOfMeds[row].frequency + " " + oldArrayOfMeds[row].prn;
	rtable.rows[row].cells[2].className = "withBorder continue";
	// newArrayOfMeds[row] = oldArrayOfMeds[row]; // commented out because it leads to assignment problems
	newArrayOfMeds[row].status = "continue";
};

var cancelAction = function(row) {
	/*console.log("Row index:");
	console.log(row);
	console.log("oldArray length:");
	console.log(oldArrayOfMeds.length);*/
	if (row < oldArrayOfMeds.length) {
		restoreMiddleCell(row);
	} else {
		rtable.deleteRow(row);
		createAddMedRow();
	};
};

var restoreMiddleCell = function(row) {
	rtable.rows[row].cells[1].setAttribute("colspan", 1);
/*	if (row > oldArrayOfMeds.length - 1) {
		if (row > newArrayOfMeds - 1) {
			rtable.rows[row].cells[0].innerHTML = '<input type="button" class="addButton" onclick="addMed(' + (rtable.rows.length - 1) + ')" value="Add Medication">';
		} else {
			rtable.rows[row].cells[0].innerHTML = "";
		};
			rtable.rows[row].cells[1].innerHTML = "";
	} else { */
		rtable.rows[row].cells[1].innerHTML = '\
		<table>\
		<tr>\
		<td><input type="button" class="tableButton" onclick="continueMed(' + row + ')" value="Continue"></td>\
		<td><input type="button" class="tableButton" onclick="changeAddForm(' + row + ')" value="Change"></td>\
		<td><input type="button" class="tableButton" onclick="discontinueMed(' + row + ')" value="Discontinue"></td>\
		</tr>\
		</table>\
		';
	/*};*/
};

var getPropertyOrEmpty = function(indx, property) {
	if (indx + 1 < rtable.rows.length) {
		return oldArrayOfMeds[indx][property];
	} else {
		return "";
	};
};

var changeAddForm = function(row) {
	rtable.rows[row].cells[2].innerHTML = "";
	rtable.rows[row].cells[2].className = "";
	rtable.rows[row].cells[1].setAttribute("colspan", 2);
	rtable.rows[row].cells[1].className = "changeForm";
	rtable.rows[row].cells[1].innerHTML = '\
		<table>\
		<tr>\
		<td>\
			<form id="changeForm' + row + '">\
			<table class="changeFormTable">\
			<tr>\
			<td class="changeFormText">Med:</td>\
			<td class="changeFormInput"><input type="text" class="changeFormTable" name="name" value="' + getPropertyOrEmpty(row, "name") + '"></td>\
			<td class="changeFormText">Dose:</td>\
			<td class="changeFormInput"><input type="text" class="changeFormTable" name="dose" value="' + getPropertyOrEmpty(row, "dose") + '"></td>\
			<td class="changeFormText">Unit:</td>\
			<td class="changeFormInput"><input type="text" class="changeFormTable" name="unit" value="' + getPropertyOrEmpty(row, "unit") + '"></td>\
			</tr>\
			<tr>\
			<td class="changeFormText">Route:</td>\
			<td class="changeFormInput"><input type="text" class="changeFormTable" name="route" value="' + getPropertyOrEmpty(row, "route") + '"></td>\
			<td class="changeFormText">Frequ:</td>\
			<td class="changeFormInput"><input type="text" class="changeFormTable" name="frequency" value="' + getPropertyOrEmpty(row, "frequency") + '"></td>\
			<td class="changeFormText">PRN:</td>\
			<td class="changeFormInput"><input type="text" class="changeFormTable" name="prn" value="' + getPropertyOrEmpty(row, "prn") + '"></td>\
			</tr>\
			</table>\
		</td>\
		<td>\
			<input type="button" id="acceptButton" class="changeFormButton" onclick="acceptAction(' + row + ')" value="Accept"><br>\
			<input type="button" class="changeFormButton" onclick="cancelAction(' + row + ')" value="Cancel">\
		</td>\
		</table>\
		';
};

var formEmpty = function(arrayOfFields) {
	/*console.log("Class of array:");
	console.log(arrayOfFields);
	console.log("Length of array:");
	console.log(arrayOfFields.length);
	console.log("Value of the first field:");
	console.log(arrayOfFields[0].value);
	console.log("Is the first field only whitespace?");
	console.log(/^\s*$/.test(arrayOfFields[0].value));
	console.log("Value of the second field:");
	console.log(arrayOfFields[1].value);
	console.log("Is the second field only whitespace?");
	console.log(/^\s*$/.test(arrayOfFields[1].value));*/
	var i = 0;
	for (i = 0; i < arrayOfFields.length; i++) {
		/*console.log("Element number:");
		console.log(i);
		console.log("Element is only whitespace:");
		console.log(/^\s*$/.test(arrayOfFields[i].value));*/
		if (/^\s*$/.test(arrayOfFields[i].value) == false) {
			return false;
		};
	};
	/*var i;
	for (i == 0; i < arrayOfFields.length; i++) {
		console.log(arrayOfFields[i].value);
		if (/(\w|\d)/.test(arrayOfFields[i].value) == true) {
			console.log("Form is not empty");
			return false;
		};
	};
	console.log("Form is empty");*/
	return true;
};

var acceptAction = function(row) {
	// Remove the Accept button first, otherwise it will show up in the newly created right-hand cell (this is likely a bug)
	var acceptButton = document.getElementById("acceptButton");
	acceptButton.parentNode.removeChild(acceptButton);

	var formName = "changeForm" + row;
	var formLocation = document.getElementById(formName);

	if (formEmpty(formLocation.elements) == true) {
		cancelAction(row);
		/*console.log("Form is empty");*/
		return;
	};
	/*console.log("Form is NOT empty");*/

	//read input into variables
	var changedName = formLocation.elements[0].value;
	var changedDose = formLocation.elements[1].value;
	var changedUnit = formLocation.elements[2].value;
	var changedRoute = formLocation.elements[3].value;
	var changedFrequency = formLocation.elements[4].value;
	var changedPrn = formLocation.elements[5].value;

	// Case 1: Accept button pressed in order to change old medication
	if (row < oldArrayOfMeds.length) {
		// leave the left cell [0] alone
		// restore buttons of the middle cell
		restoreMiddleCell(row);
		// update the entry in the newArrayOfMeds based on input
		newArrayOfMeds[row] = {
			status:"change",
			name:changedName,
			dose:changedDose,
			unit:changedUnit,
			route:changedRoute,
			frequency:changedFrequency,
			prn:changedPrn
		};
		// set layout of right hand cell [2]
		rtable.rows[row].cells[2].className = "withBorder change";

	// Case 2: Accept button pressed in order to add new medication
	} else {
		// clear left cell [0], give it the empty ('discontinued') layout
		rtable.rows[row].cells[0].innerHTML = "";
		rtable.rows[row].cells[0].className = "discontinue";
		// clear middle cell, leave blank and reset colspan to 1
		rtable.rows[row].cells[1].innerHTML = "";
		rtable.rows[row].cells[1].setAttribute("colspan", 1);
		// create new medication object and push onto newArrayOfMeds
		newArrayOfMeds.push(new Medication("new", changedName, changedDose, changedUnit, changedRoute, changedFrequency, changedPrn));
		// set layout of right hand cell [2] to the 'new' layout
		rtable.rows[row].cells[2].className = "withBorder new";
		// create new row with new button to add medication
		createAddMedRow();
	};

	// create the right cell [2] from entry created/adjusted in newArrayOfMeds
	rtable.rows[row].cells[2].innerHTML = '<b>' + newArrayOfMeds[row].name + '</b><br>\
	      ' + newArrayOfMeds[row].dose + ' ' + newArrayOfMeds[row].unit + ' ' + newArrayOfMeds[row].route + '<br>\
	      ' + newArrayOfMeds[row].frequency + ' ' + newArrayOfMeds[row].prn + '<input type="button"  onclick="undoChanges(' + row + ')" value="Undo changes">';
};

var undoChanges = function(row) {
	if (row < oldArrayOfMeds.length) {
		rtable.rows[row].cells[2].innerHTML = "";
		rtable.rows[row].cells[2].className = "";
		newArrayOfMeds[row].status = "initialized";
	} else {
		rtable.deleteRow(row);
		newArrayOfMeds.splice(row, 1);
		// In case the deleted entry is not in the last row, the entries for the following rows need to be decreased by 1 to prevent errors
		// TBC
	};
};

var discontinueMed = function(row) {
	rtable.rows[row].cells[2].innerHTML = "";
	rtable.rows[row].cells[2].className = "discontinue";
	newArrayOfMeds[row].status = "discontinue";
};

var createAddMedRow = function() {
	//add another row to create option to add medication
	var arow = rtable.insertRow(rtable.rows.length);
	var acell1 = arow.insertCell(0);
	var acell2 = arow.insertCell(1);
	var acell3 = arow.insertCell(2);
	acell1.innerHTML = '<input type="button" class="addButton" onclick="addMed()" value="Add Medication">';
};

var addMed = function() {
	var lastRow = rtable.rows.length - 1;
	rtable.rows[lastRow].cells[0].innerHTML = "";
	changeAddForm(lastRow);
};

var submitFunction = function() {
	var inputVar = document.getElementById("inputForm").elements[0].value; // This reads the text in the form into the variable.

	// Clean input text: remove leading and trailing whitespace
	inputVar = inputVar.replace(/^(\s|\n|\r|\t)+/, "");
	inputVar = inputVar.replace(/(\s|\n|\r|\t)+$/, "");
	inputVar = inputVar.replace(/\n(\s|\t|\n|\r)+/g, "\n");
	inputVar = inputVar.replace(/(\s|\t|\n|\r)+\n/g, "\n");

	// TBC: remove block of discontinued medications from inputVar, in case it has been submitted as well

	// split string into an array of separate lines
	var inputArray = inputVar.split("\n");

	// Read medication in each line into array of Medication objecs
	var i;
	for (i = 0; i < inputArray.length; i++) {
		var medName = assignText(inputArray[i], reName);
		var medDose = assignText(inputArray[i], reDose);
		var medUnit = assignText(inputArray[i], reUnit);
		var medRoute = assignText(inputArray[i], reRoute);
		var medFrequency = assignText(inputArray[i], reFrequency);
		var medPrn = assignText(inputArray[i], rePrn);
		oldArrayOfMeds.push(new Medication("initialized", medName, medDose, medUnit, medRoute, medFrequency, medPrn));
		/* Create newArrayOfMeds. This will be mostly empty now, but contain the status that will later contain changes.
		 * all values except the first one will be set to an empty string
		 */
		newArrayOfMeds.push(new Medication("initialized", "", "", "", "", "", ""));
	};


	// Create the HTML code for the table
	rtable.innerHTML = "";
	for (i = 0; i < oldArrayOfMeds.length; i++) {
		var row = rtable.insertRow(i);
		var cell1 = row.insertCell(0);
		var cell2 = row.insertCell(1);
		var cell3 = row.insertCell(2);
		cell1.innerHTML = "<b>" + oldArrayOfMeds[i].name + "</b><br>" + oldArrayOfMeds[i].dose + " " + oldArrayOfMeds[i].unit + " " + oldArrayOfMeds[i].route + "<br>" + oldArrayOfMeds[i].frequency + " " + oldArrayOfMeds[i].prn;
		cell1.className = "withBorder";
		restoreMiddleCell(i);
		cell3.innerHTML = "";
	};
	createAddMedRow();
	
	// make the create output button visible now
	document.getElementById("outputButton").style.display = "inline";
};

var createOutput = function() {
	// this is for development purposes - to see if the array is correct that will be used to create the output
	var outputString = "";
	outputString += "CURRENT MEDICATIONS:<br>";
	var discontinuedString = "";
	var i = 0;
	for (i = 0; i < newArrayOfMeds.length; i++) {
		console.log("Old:");
		console.log(oldArrayOfMeds[i]);
		console.log("New:");
		console.log(newArrayOfMeds[i]);
		switch(newArrayOfMeds[i].status) {
			case "initialized":
				outputString += "Medication not reconciled!<br>";
				break;
			case "continue":
				outputString += oldArrayOfMeds[i].name + " " + oldArrayOfMeds[i].dose + " " + oldArrayOfMeds[i].unit + " " + oldArrayOfMeds[i].route + " " + oldArrayOfMeds[i].frequency + " " + oldArrayOfMeds[i].prn + " - CONTINUED<br>";
				break;
			case "discontinue":
				discontinuedString += oldArrayOfMeds[i].name + "<br>";
				break;
			case "change":
				outputString += newArrayOfMeds[i].name + " " + oldArrayOfMeds[i].dose + " " + oldArrayOfMeds[i].unit + " " + oldArrayOfMeds[i].route + " " + oldArrayOfMeds[i].frequency + " " + oldArrayOfMeds[i].prn + " - CHANGED<br>";
				break;
			case "new":
				outputString += newArrayOfMeds[i].name + " " + newArrayOfMeds[i].dose + " " + newArrayOfMeds[i].unit + " " + newArrayOfMeds[i].route + " " + newArrayOfMeds[i].frequency + " " + newArrayOfMeds[i].prn + " - NEW<br>";
				break;
			default:
				outputString += "ERROR IN PROCESSING OF ENTRY";
		};
	};
	if (!(discontinuedString == "")) {
		outputString += "<br>DISCONTINUED MEDICATIONS:<br>" + discontinuedString;
	};
	document.getElementById("output").innerHTML = outputString;
};
