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

        var childrenNodes = document.getElementById(widgetID).childNodes;
        var len = childrenNodes.length;
        var jsonArray=[];
        if(len --) do {

            var attributeData = (childrenNodes[len].getAttribute('data'));
            var json = JSON.parse(attributeData);
            var componentID = json.id;
            if (componentID != null){
                var newValue = document.getElementById(componentID).value;
                json.value = newValue;
            }
            jsonArray.push(json);
        } while(len --);

        var updatedData = {
            cellLocation: 1,
            components: jsonArray,
            id: widgetID
        }
        console.log(updatedData);
        api.postUserWidgets(updatedData,callback);
        //TODO Dynamically build the widget from the elements on screen from widget id *
        //callback(updatedData);

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
	    if (componentData.type === "textRow") {
		promise = buildTextRow(componentData, parentId);
	    } else if (componentData.type === "textBox"){
                promise = buildTextbox(componentData, parentId);
            } else if (componentData.type === "numberRow"){
                promise = buildNumberRow(componentData, parentId);
            } else if (componentData.type === "button") {
                promise = buildButton(componentData, parentId);
            } else if (componentData.type === "hidden") {
                promise = buildHidden(componentData);
            } else if (componentData.type === "iFrame") {
            	promise = buildIFrame(componentData);
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

//textRow
function buildTextRow(data, widgetId) {
	return new Promise(function (resolve) {
        var component = "<input "
	component += " data="+'\''+JSON.stringify(data)+'\'';
	component += " class='component' id=\""+data.id+"\"";
	component += " placeholder=\""+data.hint+"\"";
	if (data.action !== null && data.action.length !== 0) {
    		var action = new Action(data.action, widgetId);
		var actionScript = action.getHTML(function (script) {
               		console.log("Component buildButton: " + component);
               		component += " oninput=\"" + script + "\"";
			component += " value=\""+data.value+"\">";
      			resolve(component);
		});
	}
	component += " value=\""+data.value.trim()+"\">";
        console.log("Component end: "+component);
        resolve(component);
    });
}

function buildIFrame(data) {
    return new Promise(function (resolve) {
        var component = "<iframe "
        component += " data="+'\''+JSON.stringify(data)+'\'';
        component += " class='component' id=\""+data.id+"\"";
        component += " src=\""+data.value.trim()+"\" allowfullscreen> iFrames not supported on your browser </iframe>";
        console.log("Component end: "+component);
        resolve(component);
    });
}

//Textbox
function buildTextbox(data, widgetId) {
	return new Promise(function (resolve) {
	if (('action' in data) && data.action !== null && data.action.length !== 0) {
    		var action = new Action(data.action, widgetId);
		var actionScript = action.getHTML(function (script) {
	    		var component = "<textarea data="+'\''+JSON.stringify(data)+'\''+" oninput=\""+script+"\" class='component' id=\""+data.id+"\" placeholder=\""+data.hint+"\">"+data.value.trim()+"</textarea>";
      			resolve(component);
		});
	} else {
	        var component = "<textarea data="+'\''+JSON.stringify(data)+'\''+" class='component' id=\""+data.id+"\" placeholder=\""+data.hint+"\">"+data.value.trim()+"</textarea>";
	}
        console.log("Component end: "+component);
        resolve(component);
    });
}

//numberRow
function buildNumberRow(data, widgetId){
	console.log(data);
	return new Promise(function (resolve) {
        	var component = "<input "
		component += " data="+'\''+JSON.stringify(data)+'\'';
		component += " class='component'";
		component += " type=\"number\"";
		component += " id=\""+data.id+"\"";
		component += " placeholder=\""+data.hint+"\"";
		if (('action' in data) && data.action !== null && data.action.length !== 0) {
			var action = new Action(data.action, widgetId);
    			var actionScript = action.getHTML(function (script) {
       	        		component += " oninput=\"" + script + "\"";
				component += " value=\""+data.value+"\">";
	      			resolve(component);
			});
		}

		component += " value=\""+data.value+"\">";
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
                		resolve("<input type='button' data="+'\''+JSON.stringify(data)+'\''+" value = \""+data.value+"\" class='component' id=\"" + data.id + "\" onclick=\"" + script + "\">");
            		});
        	} else {
                	resolve("<input type='button' data="+'\''+JSON.stringify(data)+'\''+" value = \""+data.value+"\" class='component' id=\"" + data.id + "\">");
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
		var scriptHtml = "async function run() { \n var actions = new Action("+null+");\n";
		var actions = actionData.split(")");

		console.log(actions);
		for (actionIndex in actions) {
			if (actions[actionIndex].length == 0) {
				continue;
			}

			var actionType = actions[actionIndex].split("(");
			var action = actionType[0].trim();
			var params = actionType[1].split(",");
			console.log(actionType);
			if (params.length !== 0) {
				params[params.length-1] = params[params.length-1].replace(')', ' ').trim();
			}

			for (paramIndex in params) {
                            var regex = '"(.*)"';
                            var re = new RegExp(regex,"g");
                            params[paramIndex] = params[paramIndex].replace(re, "&quot;$1&quot;");
			}

			console.log("params: "+params);

			if (action === "CONCAT") {
				scriptHtml += 'await actions.concat(\''+params[0]+'\', \''+params[1]+'\', \''+params[2]+'\');';
			} else if (action === "ADD") {
				scriptHtml += 'await actions.add(\''+params[0]+'\', \''+params[1]+'\', \''+params[2]+'\');';
			} else if (action === "SUBTRACT") {
				scriptHtml += 'await actions.subtract(\''+params[0]+'\', \''+params[1]+'\', \''+params[2]+'\');';
			} else if (action === "MULTIPLY") {
				scriptHtml += 'await actions.multiply(\''+params[0]+'\', \''+params[1]+'\', \''+params[2]+'\');';
			} else if (action === "DIVIDE") {
				scriptHtml += 'await actions.divide(\''+params[0]+'\', \''+params[1]+'\', \''+params[2]+'\');';
			} else if (action === "SETVALUE") {
				scriptHtml += 'await actions.setValue(\''+params[0]+'\', \''+params[1]+'\');';
			} else if (action === "DEFINE") {
				scriptHtml += 'await actions.define(\''+params[0]+'\');';
			} else if (action === "CLONE") {
				scriptHtml += 'await actions.clone(\''+params[0]+'\', \''+params[1]+'\', \''+params[2]+'\');';
			} else if (action === "PUSH") {
                                scriptHtml += "pushWidget('" + parentId + "');";
                        } else if (action === "STOREFILE") {
                                scriptHtml += 'await actions.storeFile(\''+params[0]+'\', \''+params[1]+'\');';
			} else if (action === "RETRIEVEFILE") {
                                scriptHtml += 'await actions.retrieveFile(\''+params[0]+'\', \''+params[1]+'\');';
			} else {
				console.log("Undefined Action"+action);
			}

			scriptHtml += "\n";
                        scriptHtml += 'console.log(\'+Finshed Command'+actionIndex+'\');';
		}

		scriptHtml += " } run();";
		callback(scriptHtml);
	};

	//This is private. We dont know what the tags are and some tags have different ways to get the value.
	this.getValueFromID = function(id) {
		var tag = document.getElementById(id);

		if (tag === null) {
			//Check the regex to see if its a literal
                        var regex = '"(.*)"';
                        var re = new RegExp(regex,"g");
                        if (id.match(re) != null) {
                            //Its a match. Grab the group.
			    console.log("Returning Literal"+id.replace(re, "$1"));
                            return id.replace(re, "$1");
                        }
			//It might be an id.
			return definedVars[id];
		}

		return document.getElementById(id).value;
	};

	this.setValueFromId = function(id, value) {
		var tag = document.getElementById(id);
		value = this.getValueFromID(value);
		console.log("Setting: "+value);

		if (tag === null) {
			//Treat it as a defined id.
			console.log("Tag is null "+id);
			definedVars[id] = value;
			return;
		}

		document.getElementById(id).value = value;
	};

	//ADD
	this.add = function(src1, src2, dest) {
		var api = this;
                return new Promise(function(resolve) {
         	    var element1 = api.getValueFromID(src1);
		    var element2 = api.getValueFromID(src2);
                    console.log(element1+":"+element2);
		    if (isNaN(parseFloat(element1)) || isNaN(parseFloat(element2))) {
			alert("NaN");
                        resolve();
			return;
		    }
		    var output = parseFloat(element1) + parseFloat(element2);
		    api.setValueFromId(dest, "\""+output+"\"");
                    resolve();
		});
	};


	//SUBSTRACT
	this.subtract = function(src1, src2, dest) {
		var api = this;
                return new Promise(function(resolve) {
		    var element1 = api.getValueFromID(src1);
                    var element2 = api.getValueFromID(src2)
                    if (isNaN(parseFloat(element1)) || isNaN(parseFloat(element2))) {
			alert("NaN");
                        resolve();
			return;
		    }
		    var output = parseFloat(element1) - parseFloat(element2);
		    api.setValueFromId(dest, "\""+output+"\"");
                    resolve();
		});
	};

	//MULTIPLY
	this.multiply = function(src1, src2, dest) {
                var api = this;
                return new Promise(function(resolve) {
                    var element1 = api.getValueFromID(src1);
		    var element2 = api.getValueFromID(src2);
		    if (isNaN(parseFloat(element1)) || isNaN(parseFloat(element2))) {
			alert("NaN");
			resolve();
			return;
		    }
		    var output = parseFloat(element1) * parseFloat(element2);
		    api.setValueFromId(dest, "\""+output+"\"");
                    resolve();
                });
	};

	//DIVIDE
	this.divide = function(num, denom, dest) {
		var api = this;
                return new Promise(function(resolve) {
                    var element1 = api.getValueFromID(num);
		    var element2 = api.getValueFromID(denom);
	            if (isNaN(parseFloat(element1)) || isNaN(parseFloat(element2))) {
			alert("NaN");
                        resolve();
                        return;
		    }
		    var output = parseFloat(element1) / parseFloat(element2);
		    api.setValueFromId(dest, "\""+output+"\"");
                    resolve();
                });
	};

	//Concat
	this.concat = function(src1, src2, dest) {
	    var api = this;
            return new Promise(function(resolve) {
          	var element1 = this.getValueFromID(src1);
		var element2 = this.getValueFromID(src2);

		var output = element1 + element2;
		api.setValueFromId(dest, "\""+output+"\"");
                resolve();
            });
	}

	//StoreFile
	this.storeFile = async function (nameDest, urlDest) {
            var api = this;
	    return new Promise(function(resolve) {
                //Create the selector then manually click it<input id="file-input" type="file" name="name" style="display: none;" />
                fileSelector = document.createElement("input");
                fileSelector.setAttribute("id", "file-input");
                fileSelector.setAttribute("type", "file");

                //Create the change callback.
                fileSelector.addEventListener('change', function (e) {
                    var file = fileSelector.files[0];
                    console.log(file.name);
                    api.storeFile(file, function (referenceId) {
                        api.setValueFromId(urlDest, referenceId);
                        api.setValueFromId(nameDest, file.name);
                    });
                });

                //Trigger it
                $(fileSelector).trigger('click');
                console.log("Triggered");
                resolve();
            });
        }

	//RetrieveFile
	this.retrieveFile = function (filenameSrc, urlSrc) {
            var api = this;
            return new Promise(function(resolve) {
                var url= api.getValueFromID(urlSrc);
		var filename = api.getValueFromID(filenameSrc);
                // This can be downloaded directly:
                var xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.onload = function(event) {
                    var blob = xhr.response;
                    console.log(blob);
                    var a = document.createElement('a');
                    a.setAttribute("href",URL.createObjectURL(blob));
                    a.setAttribute("download", filename);
                    a.innerHTML = "CLICK ME";
                    a.click();
                    // $(a).insertAfter(".main");
                };
                console.log(url);
                xhr.open('GET', url);
                xhr.send();
                resolve();
            });
	}

	//SETVALUE
	this.setValue = function(value, dest) {
            var api = this;
            return new Promise(function(resolve) {
                api.setValueFromId(dest, value);
            });
	};

	//Define a variable.
	this.define = function(dest) {
            var api = this;
            return new Promise(function(resolve) {
		definedVars[dest] = 0;
                resolve();
            });
	};

	//Clone Component
	this.clone = function (src, dest, afterId) {
	     var api = this;
             return new Promise(function(resolve) {
               if( document.getElementById(dest) !== null ) {
			//ID already defined.
			console.error("Dest. already exists");
			return;
		}

		var element = document.getElementById(src);
		var clone = element.cloneNode(true);
		//change id
		clone.id = dest;

		//Change the data ID
		data = JSON.parse(clone.getAttribute("data"));
		data.id = clone.id;
		clone.setAttribute("data", JSON.stringify(data));

		//Use jquery to push
		$(clone).insertAfter("#"+afterId);
                resolve();
            });
	};

    //setError
}
