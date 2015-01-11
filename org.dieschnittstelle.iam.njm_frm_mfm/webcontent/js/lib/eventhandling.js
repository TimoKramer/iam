/**
 * @author Jörn Kreutel
 */

// some components for custom event handling, used for minimising dependencies between different controllers of a composite view
var iam = (function(parentmodule) {

	console.log("loading eventhandling as submodule eventhandling of: " + parentmodule);
	
	// trying to increase MasListeners because of warning in console	
	eventListeners.setMaxListeners(30);
	
	/*
	 * some custom event class
	 */
	function CustomEvent(_group, _type, _target, _data) {
		this.group = _group;
		this.type = _type;
		this.target = _target;
		if (_data) {
			this.data = _data;
		}
	}

	// declare some id function on CustomEvent (see for a non standard alternative: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/__defineGetter__)
	CustomEvent.prototype.desc = function() {
		return (this.group ? this.group : "") + "_" + (this.type ? this.type : "") + "_" + (this.target ? this.target : "");
	};
	/*
	 * some class that can be used for collecting event handlers and dispatching events, we call it eventdispatcher for the time being
	 */
	function EventDispatcher() {

		/*
		 * these functions are used for removing dependencies between the single components in favour of a central event handling
		 */
		eventListeners = {};

		// events will be characterised by the three string valued properties group (ui, crud, etc.), type, and target
		this.addEventListener = function(event, callback) {

			// check whether the event type contains a "|" symbol that identifies more than a single event
			if (event.type.indexOf("|") != -1) {
				console.log("event specifies a disjunction of types: " + event.type + ". Will add a listener for each concrete type");
				var etypes = event.type.split("|");
				for (var i = 0; i < etypes.length; i++) {
					this.addEventListener(iam.eventhandling.customEvent(event.group, etypes[i], event.target), callback);
					this.listeners(etypes[i]);
				}
			} else {
				console.log("adding new event listener for event " + event.desc());
				if (eventListeners[event.desc()]) {
					console.log("adding listener to existing listeners.");
					eventListeners[event.desc()].push(callback);
					event.listeners(event.type);
				} else {
					console.log("creating new event listener list.");
					eventListeners[event.desc()] = [callback];
					event.listeners(event.type);
				}
			}
		};

		this.notifyListeners = function(event) {
			var els = eventListeners[event.desc()];
			if (els) {
				console.log("will notify " + ( els ? els.length + " " : "0 ") + " listeners of event: " + event.desc());
				for (var i = 0; i < els.length; i++) {
					els[i](event);
				}
			}
		};
	}

	// export the CustomEvent and EventDispatcher APIs
	// export the functions
	parentmodule.eventhandling = {

		customEvent : function(group, type, target, data) {
			return new CustomEvent(group, type, target, data);
		},

		newEventDispatcher : function() {
			return new EventDispatcher();
		}
	};

	return parentmodule;

})(iam || {});
