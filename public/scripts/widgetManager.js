function Widget(data){
    var widgetData = data;

    this.getHTML = async function(callback) {
		var widget = "<div class='widget' id="+'\''+widgetData.id+'\''+">";
		for (componentIndex in widgetData.components) {
			component = new Component(widgetData.components[componentIndex], widgetData.id);
			widget += await component.getHTML();
			console.log("Done await "+data);
		}
		widget += "</div>";
		callback(widget);
    }

    this.getUpdatedData = async function(callback) {
    	console.log("Get Updated Widget Data");
        var widgetID = widgetData.id;

        console.log("widget ID:     "+ widgetID);

        var childrenNodes = document.getElementById(widgetID).childNodes;
        var len = childrenNodes.length;
        if(len --) do {
            var attributeData = (childrenNodes[len].getAttribute('data'));
            var json = JSON.parse(attributeData);

            if (json.type == "numberRow"){
                var numberRowID = (json.id);
                var word = document.getElementById(numberRowID).value;
                var updatedData = "<input data=" +attributeData +" class=" +'"component"' +" type="+'"number"' + " id=" +'"' +numberRowID +'"' + " value=" +'"' +word +'"' +">";
                console.log(updatedData);

			}

        } while(len --);




        //TODO Dynamically build the widget from the elements on screen from widget id *
        callback(updatedData);

    }
}

function Component(data, id){
	var componentData = data;
	var parentId = id;
	console.log("Component data type: "+componentData.type);

	this.getHTML = function(callback) {
		return new Promise(function(resolve) {
            // var componentHTML = "<div> Component "+componentData.type+" </div>";
            //Do stuff here to build the componenet
            var promise;
            if (componentData.type === "textbox"){
                promise = buildTextbox(componentData);
            } else if (componentData.type === "numberRow"){
                promise = buildNumberRow(componentData);
            } else if (componentData.type === "button") {
                promise = buildButton(componentData, parentId);
            } else if (componentData.type === "hidden") {
                promise = buildHidden(componentData);
            }

            promise.then(function (componentData) {
                resolve(componentData);
            })
		});
	}
}

//Hidden
function buildHidden(data) {
	return new Promise(function (resolve) {
        	var component = "<input data="+'\''+JSON.stringify(data)+'\''+" type=\"hidden\" id=\""+data.id+"\" value=\""+data.value+"\">";
	        console.log("Component hidden: "+component);
		resolve(component);
  	});
}

//Textbox
function buildTextbox(data) {
	return new Promise(function (resolve) {
        var component = "<textarea data="+'\''+JSON.stringify(data)+'\''+" class='component' id=\""+data.id+"\" placeholder=\""+data.hint+"\">"+data.value.trim()+"</textarea>";
        console.log("Component end: "+component);
        resolve(component);
    });
}

//numberRow
function buildNumberRow(data){
	return new Promise(function (resolve) {
        	var component = "<input data="+'\''+JSON.stringify(data)+'\''+" class='component' type=\"number\" id=\""+data.id+"\" placeholder=\""+data.hint+"\">";
        	console.log("Component buildNumberRow: "+component);
        	resolve(component);
	});
}

//numberRow
function buildButton(data, widgetId){
	return new Promise(function (resolve) {
		console.log(data);
		if (data.action !== null && data.action.length !== 0) {
			action = new Action(data.action, widgetId);
            		var actionScript = action.getHTML(function (script) {
                		console.log("Component buildButton: " + component);
                		resolve("<button data="+'\''+JSON.stringify(data)+'\''+" class='component' id=\"" + data.id + "\" onclick=\"" + script + "\">" + data.value + "</button>");
            		});
        	} else {
            		resolve("<button data="+'\''+JSON.stringify(data)+'\''+" class='component' id=\"" + data.id + "\">" + data.value + "</button>");
		}
	});
}


var definedVars = [];
var definedComponents = [];
function Action(data, parent) {
	actionData = data;
	var parentId = parent;

	this.getHTML = function(callback) {
		//Attach the raw action data. This is used for saving widgets that have manually added components. This is not the best way but will be fine for now
		var scriptHtml = " var actions = new Action("+null+");\n";
		var actions = actionData.split(" ");

		for (actionIndex in actions) {
			var actionType = actions[actionIndex].split("(");
			var action = actionType[0];
			var params = actionType[1].split(",");
			if (params.length !== 0) {
				params[params.length-1] = params[params.length-1].replace(')', ' ').trim();
			}
			console.log("params: "+params);

			if (action === "ADD") {
				scriptHtml += 'actions.add(\''+params[0]+'\', \''+params[1]+'\', \''+params[2]+'\');';
			} else if (action === "SUBTRACT") {
				scriptHtml += 'actions.subtract(\''+params[0]+'\', \''+params[1]+'\', \''+params[2]+'\');';
			} else if (action === "MULTIPLY") {
				scriptHtml += 'actions.multiply(\''+params[0]+'\', \''+params[1]+'\', \''+params[2]+'\');';
			} else if (action === "DIVIDE") {
				scriptHtml += 'actions.divide(\''+params[0]+'\', \''+params[1]+'\', \''+params[2]+'\');';
			} else if (action === "SETVALUE") {
				scriptHtml += 'actions.setValue(\''+params[0]+'\', \''+params[1]+'\');';
			} else if (action === "DEFINE") {
				scriptHtml += 'actions.define(\''+params[0]+'\');';
			} else if (action === "CLONE") {
				scriptHtml += 'actions.clone(\''+params[0]+'\', \''+params[1]+'\', \''+params[2]+'\');';
			} else if (action === "PUSH") {
				scriptHtml += "pushWidget('"+parentId+"');";

			} else {
				console.log("Undefined Action"+action);
			}

			scriptHtml += "\n";
		}

		scriptHtml += " ";
		callback(scriptHtml);
	};

	//This is private. We dont know what the tags are and some tags have different ways to get the value.
	this.getValueFromID = function(id) {
		var tag = document.getElementById(id);

		if (tag === null) {
			//It might be an id.
			return definedVars[id];
		}

		if (tag.nodeName === "INPUT") {
			return document.getElementById(id).value;
		} else {
			//Attempt to get the value from the innerHTML
			return document.getElementById(id).innerHTML;
		}
	};

	this.setValueFromId = function(id, value) {
		var tag = document.getElementById(id);

		if (tag === null) {
			//Treat it as a defined id.
			definedVars[id] = value;
			return;
		}

		if (tag.nodeName === "INPUT") {
			document.getElementById(id).value = value;
		} else {
			//Attempt to get the value from the innerHTML
			document.getElementById(id).innerHTML = value;
		}
	};

	//ADD
	this.add = function(src1, src2, dest) {
		var element1 = this.getValueFromID(src1);
		var element2 = this.getValueFromID(src2);

		var output = parseFloat(element1) + parseFloat(element2);
		this.setValueFromId(dest, output);
	};

	//SUBSTRACT
	this.subtract = function(src1, src2, dest) {
		var element1 = this.getValueFromID(src1);
		var element2 = this.getValueFromID(src2);

		var output = parseFloat(element1) - parseFloat(element2);
		this.setValueFromId(dest, output);
	};

	//MULTIPLY
	this.multiply = function(src1, src2, dest) {
		var element1 = this.getValueFromID(src1);
		var element2 = this.getValueFromID(src2);

		var output = parseFloat(element1) * parseFloat(element2);
		this.setValueFromId(dest, output);
	};

	//DIVIDE
	this.divide = function(num, denom, dest) {
		var element1 = this.getValueFromID(num);
		var element2 = this.getValueFromID(denom);

		var output = parseFloat(element1) / parseFloat(element2);
		this.setValueFromId(dest, output);
	};

	//SETVALUE
	this.setValue = function(value, dest) {
		this.setValueFromId(dest, value);
	};

	//Define a variable.
	this.define = function(dest) {
		definedVars[dest] = "";
	};

	//Clone Component
	this.clone = function (src, dest, afterId) {
		console.log("CLONE "+ definedComponents[dest]);
		if( definedComponents[dest] !== undefined ) {
			//&& document.getElementById(dest) !== undefined
			//ID already defined.
			console.error("Dest. already exists");
			return;
		}

		var element = document.getElementById(src);
		var clone = element.cloneNode(true);

        	var timestamp = new Date();
        	var nId = timestamp.getTime()+dest;
		//Create unique id
		definedComponents[dest] = nId;
		clone.id = nId;

		//Chage the data ID
		data = JSON.parse(clone.getAttribute("data"));
		data.id = clone.id;
		clone.setAttribute("data", JSON.stringify(data));

		//Use jquery to push
		$(clone).insertAfter("#"+afterId);
	};

    //setError
}
