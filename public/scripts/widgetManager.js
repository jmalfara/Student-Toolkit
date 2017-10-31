function Widget(data){
	var widgetData = data;

	this.getHTML = async function (callback){
		var widget = "<div>"
		console.log(widgetData);
		for (componentIndex in widgetData.components) {
			component = new Component(widgetData.components[componentIndex]);
			widget += await component.getHTML();
			console.log("Done await "+data);
		}
		widget += "</div>"
		callback(widget);
	}
}

function Component(data){
	var componentData = data;
	console.log("Component data type: "+componentData.type)

	this.getHTML = function(callback) {
		// var componentHTML = "<div> Component "+componentData.type+" </div>";
		//Do stuff here to build the componenet
		if (componentData.type == "textbox"){
			var component = buildTextbox(componentData);
		} else if (componentData.type == "numberRow"){
			var component = buildNumberRow(componentData);
		} else if (componentData.type == "button") {
			var component = buildButton(componentData);
		} else if (componentData.type == "hidden") {
			var component = buildHidden(componentData);
		}

		//When done
		return new Promise(resolve => {
		    setTimeout(() => {
		      resolve(component);
		    }, 2000);
		});
	}
}


//Hidden
function buildHidden(data) {
    var component = "<input type=\"hidden\" id=\""+data.id+"\" value=\""+data.value+"\">";
    console.log("Component hidden: "+component)
    return component;
}

//Textbox
function buildTextbox(data) {
	var component = "<textarea id=\""+data.id+"\""
		+"placeholder=\""+data.hint+"\" "
		+">"
		+data.value.trim()
		+"</textarea>"

    console.log("Component end: "+component)
    return component;
}


//numberRow
function buildNumberRow(data){
	var component = "<input type=\"number\" id=\""+data.id+"\""
	+"placeholder=\""+data.hint+"\" "
	+">"
	+"</input>"

    console.log("Component buildNumberRow: "+component)
    return component;
}

//numberRow
function buildButton(data){
	action = new Action(data.action);
	var scriptHtml;
	var actionScript = action.getHTML(function(script) {
		scriptHtml = script;
	});

	var component = "<br><button id=\""+data.id+"\" onclick=\""+scriptHtml+"\">"+data.value+"</button><br>"

	console.log("Component buildButton: "+component)
	return component;
}


function Action(data, parentId) {
	actionData = data;
	var definedIds = [];

	this.getHTML = function(callback) {
		var scriptHtml = " var actions = new Action("+null+");\n";
		var actions = actionData.split(" ");

		for (actionIndex in actions) {
			var actionType = actions[actionIndex].split("(");
			var action = actionType[0];
			var params = actionType[1].split(",");
			if (params.length != 0) {
				params[params.length-1] = params[params.length-1].replace(')', ' ').trim();
			}
			console.log(params);

			if (action == "ADD") {
				scriptHtml += 'actions.add(\''+params[0]+'\', \''+params[1]+'\', \''+params[2]+'\');';
			} else if (action == "SUBTRACT") {
				scriptHtml += 'actions.subtract(\''+params[0]+'\', \''+params[1]+'\', \''+params[2]+'\');';
			} else if (action == "MULTIPLY") {
				scriptHtml += 'actions.multiply(\''+params[0]+'\', \''+params[1]+'\', \''+params[2]+'\');';
			} else if (action == "DIVIDE") {
				scriptHtml += 'actions.divide(\''+params[0]+'\', \''+params[1]+'\', \''+params[2]+'\');';
			} else if (action == "SETVALUE") {
				scriptHtml += 'actions.setValue(\''+params[0]+'\', \''+params[1]+'\');';
			} else if (action == "DEFINE") {
				scriptHtml += 'actions.define(\''+params[0]+'\');';
			} else {
				console.log("Undefined Action"+action);
			}

			scriptHtml += "\n";
		}

		scriptHtml += " ";
		callback(scriptHtml);
	}

	//This is private. We dont know what the tags are and some tags have different ways to get the value.
	this.getValueFromID = function(id) {
		var tag = document.getElementById(id);

		if (tag == null) {
			//It might be an id.
			return definedIds[id];
		}

		console.log(tag.nodeName);
		if (tag.nodeName == "INPUT") {
			return document.getElementById(id).value;
		} else {
			//Attempt to get the value from the innerHTML
			return document.getElementById(id).innerHTML;
		}
	}

	this.setValueFromId = function(id, value) {
		var tag = document.getElementById(id);

		if (tag == null) {
			//Treat it as a defined id.
			definedIds[id] = value;
			return;
		}

		console.log(tag.nodeName);
		if (tag.nodeName == "INPUT") {
			document.getElementById(id).value = value;
		} else {
			//Attempt to get the value from the innerHTML
			document.getElementById(id).innerHTML = value;
		}
	}

	//ADD
	this.add = function(src1, src2, dest) {
		element1 = this.getValueFromID(src1);
		element2 = this.getValueFromID(src2);

		var output = parseFloat(element1) + parseFloat(element2);
		this.setValueFromId(dest, output);
	}

	//SUBSTRACT
	this.subtract = function(src1, src2, dest) {
		element1 = this.getValueFromID(src1);
		element2 = this.getValueFromID(src2);

		var output = parseFloat(element1) - parseFloat(element2);
		this.setValueFromId(dest, output);
	}

	//MULTIPLY
	this.multiply = function(src1, src2, dest) {
		element1 = this.getValueFromID(src1);
		element2 = this.getValueFromID(src2);

		var output = parseFloat(element1) * parseFloat(element2);
		this.setValueFromId(dest, output);
	}

	//DIVIDE
	this.divide = function(num, denom, dest) {
		element1 = this.getValueFromID(num);
		element2 = this.getValueFromID(denom);

		var output = parseFloat(element1) / parseFloat(element2);
		this.setValueFromId(dest, output);
	}

	//SETVALUE
	this.setValue = function(value, dest) {
		this.setValueFromId(dest, value);
	}

	//Define a variable.
	this.define = function(dest) {
		definedIds[dest] = "";
	}
}
