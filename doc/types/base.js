var baseProps = [{
	name: "add_property",
	type: "method",
	description: "Adds a property with a specified name and default value to this object" + 
		"defining a getter and a setter.",
	arguments: [{
		name: "propertyName",
		description: "Name of the property.",
		type: "string",
		optional: false
	}, {
		name: "defaultValue",
		description: "Default value for this property.",
		type: "any",
		optional: true
	}]
}];