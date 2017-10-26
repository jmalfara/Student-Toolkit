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
	
	if (componentData.type == "textbox"){
		componentData.type = "textarea";
		var rowSize = 22.5;
		var columnSize = 40;
	}
	console.log("Component data type: "+componentData.type)
	console.log("Component hint: "+componentData.hint)
	this.getHTML = function(callback) {
		// var componentHTML = "<div> Component "+componentData.type+" </div>";
		//Do stuff here to build the componenet
		var component = "<"
		+componentData.type+" "
		+"placeholder="+componentData.hint+" "
		+"rows="+rowSize+" "
		+"cols="+columnSize
		+";>"
		+" </"+componentData.type+">"
		console.log("Component end: "+component)
		//When done
		return new Promise(resolve => {
		    setTimeout(() => {
		      resolve(component);
		    }, 2000);
		});
	}
}
