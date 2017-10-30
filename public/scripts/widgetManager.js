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
			
		} 
		else if (componentData.type == "numberRow"){
			var component = buildNumberRow(componentData);
			
		} 
		else if (componentData.type == "button") {
			var component = buildButton(componentData);
		}

		//When done
		return new Promise(resolve => {
		    setTimeout(() => {
		      resolve(component);
		    }, 2000);
		});
	}
}

//Add functions to build

//Textbox
function buildTextbox(data) {
	var component = "<textarea "
		+"placeholder=\""+data.hint+"\" "
	
		+">"
		+data.value.trim()
		+"</textarea>"

    console.log("Component end: "+component)
    return component;
}


//numberRow
function buildNumberRow(data){

	var component = "<input type="
	+"\"number\""
	+"placeholder=\""+data.hint+"\" "
	+">"
	+"</input>"

    console.log("Component buildNumberRow: "+component)
    return component;
}

//numberRow
function buildButton(data){

	var component = "<br><button type="
	+"\"button\""
	+">"
	+data.value
	+"</button><br>"

    console.log("Component buildButton: "+component)
    return component;
}


