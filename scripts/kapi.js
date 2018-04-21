


SocketFace = new Object();

SocketFace.left 	= "LEFT";
SocketFace.top 		= "TOP";
SocketFace.right 	= "RIGHT";
SocketFace.bottom 	= "BOTTOM";

function SocketInfo(face, offset, label)
{
	this.face = face;
	this.offset = offset;
	this.label = label;
	
	this.isLeft 	= this.face == SocketFace.left;
	this.isTop 		= this.face == SocketFace.top;
	this.isRight 	= this.face == SocketFace.right;
	this.isBottom 	= this.face == SocketFace.bottom;
	
	this.getPosition = function(gateType, x, y)
	{
		return new Pos(
			x + 
			((this.face == SocketFace.left) ? 0
			: (this.face == SocketFace.right) ? gateType.width
			: this.offset * 8),
			y +
			((this.face == SocketFace.top) ? 0
			: (this.face == SocketFace.bottom) ? gateType.height
			: this.offset * 8)
		);
	}
}

function GateType(name, width, height, inputs, outputs)
{
	this.isGateType = true;

	this.name = name;

	this.width = width;
	this.height = height;
	
	this.inputs = inputs;
	this.outputs = outputs;
	
	this.func = function(gate, inputs)
	{
		return [false];
	}
	
	this.initialize = function(gate)
	{
		
	}
	
	this.click = function(gate)
	{
		
	}
	
	this.mouseDown = function(gate)
	{
	
	}
	
	this.mouseUp = function(gate)
	{
	
	}

	this.saveData = function(gate)
	{
		return null;
	}

	this.loadData = function(gate, data)
	{

	}
	
	this.render = function(context, x, y, gate)
	{
		context.strokeStyle = "#000000";
		context.lineWidth = 2;
		
		for (var i = 0; i < this.inputs.length + this.outputs.length; ++ i)
		{
			var inp = (i < this.inputs.length ? this.inputs[i] : this.outputs[i - this.inputs.length]);
			var start = inp.getPosition(this, x, y);
			var end = inp.getPosition(this, x, y);
			
			if (inp.face == SocketFace.left || inp.face == SocketFace.right)
				end.x = x + this.width / 2;
			else
				end.y = y + this.height / 2;
				
			context.beginPath();
			context.moveTo(start.x, start.y);
			context.lineTo(end.x, end.y);
			context.stroke();
			context.closePath();
		}
	}
}

function DefaultGate(name, image, renderOverride, inputs, outputs)
{
	this.__proto__ = new GateType(name, image.width, image.height, inputs, outputs);
	
	this.ctorname = arguments.callee.caller.name;

	this.image = image;
	this.renderOverride = renderOverride;
	
	this.render = function(context, x, y, gate)
	{
		this.__proto__.render(context, x, y, gate);
		if (!this.renderOverride)
			context.drawImage(this.image, x, y);
	}
}

function CustomIC(name, environment)
{
	var envInputs = environment.getInputs();
	var envOutputs = environment.getOutputs();

	var inputs = new Array();
	var outputs = new Array();

	this.ctorname = arguments.callee.name;

	this.environment = environment;
	
	for (var i = 0; i < envInputs.length; ++ i) {
		var input = envInputs[i];
		inputs[i] = new SocketInfo(SocketFace.left, 2 + i * 2, "I" + i)
	}

	for (var i = 0; i < envOutputs.length; ++ i) {
		var input = envOutputs[i];
		outputs[i] = new SocketInfo(SocketFace.right, 2 + i * 2, "O" + i)
	}

	this.__proto__ = new GateType(name, 64,
		Math.max(32, 16 * (Math.max(envInputs.length, envOutputs.length) + 1)),
		inputs, outputs);

	this.initialize = function(gate)
	{
		gate.environment = this.environment.clone();
	}

	this.func = function(gate, inputs)
	{
		var ins = gate.environment.getInputs();
		for (var i = 0; i < ins.length; ++ i) {
			ins[i].value = inputs[i];
		}

		gate.environment.step();

		var vals = new Array();
		var outs = gate.environment.getOutputs();
		for (var i = 0; i < outs.length; ++ i) {
			vals[i] = outs[i].value;
		}

		return vals;
	}

	this.render = function(context, x, y, gate)
	{
		this.__proto__.render(context, x, y, gate);

		context.strokeStyle = "#000000";
		context.fillStyle = "#ffffff";
		context.lineWidth = 3;

		context.beginPath();
		context.rect(x + 9.5, y + 1.5, this.width - 19, this.height - 3);
		context.fill();
		context.stroke();
		context.closePath();

		context.fillStyle = "#000000";
		context.font = "bold 16px sans-serif";
		context.textAlign = "center";
		context.textBaseline = "middle";

		var width = context.measureText(this.name).width;

		if (this.width - 16 > this.height) {
			context.fillText(this.name, x + this.width / 2, y + this.height / 2, this.width - 24);
		} else {
			context.save();
			context.translate(x + this.width / 2, y + this.height / 2);
			context.rotate(Math.PI / 2);
			context.fillText(this.name, 0, 0, this.height - 12);
			context.restore();
		}

		context.textAlign = "left";
		context.textBaseline = "alphabetic";
	}
}



function AndGate()
{
	this.__proto__ = new DefaultGate("AND", images.ve, false,
		[
			new SocketInfo(SocketFace.left, 1, "A"),
			new SocketInfo(SocketFace.left, 3, "B")
		],
		[
			new SocketInfo(SocketFace.right, 2, "Q")
		]
	);
	
	this.func = function(gate, inputs)
	{
		return [inputs[0] && inputs[1]];
	}
}

function OrGate()
{
	this.__proto__ = new DefaultGate("OR", images.veya, false,
		[
			new SocketInfo(SocketFace.left, 1, "A"),
			new SocketInfo(SocketFace.left, 3, "B")
		],
		[
			new SocketInfo(SocketFace.right, 2, "Q")
		]
	);
	
	this.func = function(gate, inputs)
	{
		return [inputs[0] || inputs[1]];
	}
}

function NotGate()
{
	this.__proto__ = new DefaultGate("NOT", images.degil, false,
		[
			new SocketInfo(SocketFace.left, 2, "A")
		],
		[
			new SocketInfo(SocketFace.right, 2, "Q")
		]
	);
	
	this.func = function(gate, inputs)
	{
		return [!inputs[0]];
	}
}

function NandGate()
{
	this.__proto__ = new DefaultGate("NAND", images.ucluVe, false,
		[
           new SocketInfo(SocketFace.left, 1, "B"),
           new SocketInfo(SocketFace.left, 2, "A"),
           new SocketInfo(SocketFace.left, 3, "B")
		],
		[
			new SocketInfo(SocketFace.right, 2, "Q")
		]
	);
	
	this.func = function(gate, inputs)
	{
		return [!inputs[0] || !inputs[1]];
	}
}

function NorGate()
{
	this.__proto__ = new DefaultGate("NOR", images.ucluVeya, false,
		[
            new SocketInfo(SocketFace.left, 1, "B"),
            new SocketInfo(SocketFace.left, 2, "A"),
            new SocketInfo(SocketFace.left, 3, "B")
		],
		[
			new SocketInfo(SocketFace.right, 2, "Q")
		]
	);
	
	this.func = function(gate, inputs)
	{
		return [!inputs[0] && !inputs[1]];
	}
}



function ConstInput()
{
	this.onImage = images.giris1;
	this.offImage = images.giris0;
	
	this.__proto__ = new DefaultGate("IN", this.onImage, true, [],
		[
			new SocketInfo(SocketFace.right, 2, "Q")
		]
	);
	
	this.initialize = function(gate)
	{
		gate.on = true;
	}
	
	this.click = function(gate)
	{
		gate.on = !gate.on;
	}
	
	this.func = function(gate, inputs)
	{
		return [gate.on];
	}

	this.saveData = function(gate)
	{
		return gate.on;
	}

	this.loadData = function(gate, data)
	{
		gate.on = data;
	}
	
	this.render = function(context, x, y, gate)
	{
		this.__proto__.render(context, x, y);
		context.drawImage(gate == null || gate.on ? this.onImage : this.offImage, x, y);
	}
}



function OutputDisplay()
{
	this.onImage = images.cikis1;
	this.offImage = images.cikis0;

	this.__proto__ = new DefaultGate("OUT", this.onImage, true,
		[
			new SocketInfo(SocketFace.left, 2, "A"),
		],
		[]
	);
	
	this.func = function(gate, inputs)
	{
		gate.on = inputs[0];
		return [];
	}
	
	this.initialize = function(gate)
	{
		gate.on = false;
	}
	
	this.render = function(context, x, y, gate)
	{
		this.__proto__.render(context, x, y);
		context.drawImage(gate == null || !gate.on ? this.offImage : this.onImage, x, y);
	}
}


function Link(gate, socket)
{
	this.gate = gate;
	this.socket = socket;
	
	this.getValue = function()
	{
		return this.gate.getOutput(this.socket);
	}
	
	this.equals = function(obj)
	{
		return this.gate == obj.gate && this.socket == obj.socket;
	}
}

function Gate(gateType, x, y, noInit)
{
	if (noInit == null) noInit = false;

	var myOutputs = new Array();
	var myNextOutputs = new Array();
	var myInLinks = new Array();
	
	this.type = gateType;
	
	this.x = x;
	this.y = y;
	
	this.isMouseDown = false;
	
	this.width = this.type.width;
	this.height = this.type.height;
	
	this.inputs = this.type.inputs;
	this.outputs = this.type.outputs;
	
	this.selected = false;

	for (var i = 0; i < this.type.inputs.length; ++i)
		myInLinks[i] = null;
	
	for (var i = 0; i < this.type.outputs.length; ++i)
		myOutputs[i] = false;

	this.clone = function(shallow)
	{
		if (shallow == null) shallow = false;

		var copy = new Gate(this.type, this.x, this.y, shallow);

		if (!shallow) copy.loadData(this.saveData());
		
		return copy;
	}
	
	this.getRect = function(gridSize)
	{
		if (!gridSize)
			gridSize = 1;
	
		var rl = Math.round(this.x);
		var rt = Math.round(this.y);
		var rr = Math.round(this.x + this.width);
		var rb = Math.round(this.y + this.height);
		
		rl = Math.floor(rl / gridSize) * gridSize;
		rt = Math.floor(rt / gridSize) * gridSize;
		rr = Math.ceil(rr / gridSize) * gridSize;
		rb = Math.ceil(rb / gridSize) * gridSize;
		
		return new Rect(rl, rt, rr - rl, rb - rt);
	}
	
	this.linkInput = function(gate, output, input)
	{
		var index = this.inputs.indexOf(input);
		myInLinks[index] = new Link(gate, output);
	}
	
	this.isLinked = function(gate)
	{
		for (var i = 0; i < this.inputs.length; ++ i)
			if (myInLinks[i] != null && myInLinks[i].gate == gate)
				return true;
		
		return false;
	}
	
	this.unlinkAll = function()
	{
		for (var i = 0; i < this.inputs.length; ++ i)
			myInLinks[i] = null;
	}
	
	this.unlinkGate = function(gate)
	{
		for (var i = 0; i < this.inputs.length; ++ i)
			if (myInLinks[i] != null && myInLinks[i].gate == gate)
				myInLinks[i] = null;
	}
	
	this.unlinkInput = function(input)
	{
		var index = this.inputs.indexOf(input);
		myInLinks[index] = null;
	}

	this.getOutputs = function()
	{
		return myOutputs;
	}
	
	this.setOutputs = function(outputs)
	{
		myOutputs = outputs;
	}

	this.getOutput = function(output)
	{
		var index = this.outputs.indexOf(output);
		return myOutputs[index];
	}
	
	this.click = function()
	{
		this.type.click(this);
	}
	
	this.mouseDown = function()
	{
		this.isMouseDown = true;
		this.type.mouseDown(this);
	}
	
	this.mouseUp = function()
	{
		this.isMouseDown = false;
		this.type.mouseUp(this);
	}
	
	this.step = function()
	{
		var inVals = new Array();
	
		for (var i = 0; i < this.inputs.length; ++ i)
		{
			var link = myInLinks[i];
			inVals[i] = (myInLinks[i] == null)
				? false : link.getValue();
		}
		
		myNextOutputs = this.type.func(this, inVals);
	}
	
	this.commit = function()
	{
		myOutputs = myNextOutputs;
	}

	this.saveData = function()
	{
		return this.type.saveData(this);
	}

	this.loadData = function(data)
	{
		this.type.loadData(this, data);
	}
	
	this.render = function(context, offset, selectClr)
	{
		if (this.selected) {
			var rect = this.getRect();

			if (selectClr == null) selectClr = "#6666FF";

			context.globalAlpha = 0.5;
			context.fillStyle = selectClr;
			context.fillRect(rect.left - 4 + offset.x, rect.top - 4 + offset.y,
				rect.width + 8, rect.height + 8);
			context.globalAlpha = 1.0;
		}

		this.type.render(context, this.x + offset.x, this.y + offset.y, this);
		
		context.strokeStyle = "#000000";
		context.lineWidth = 2;
		context.fillStyle = "#9999FF";
		
		for (var i = 0; i < this.inputs.length + this.outputs.length; ++ i) {
			var inp = (i < this.inputs.length ? this.inputs[i]
				: this.outputs[i - this.inputs.length]);
			var pos = inp.getPosition(this.type, this.x, this.y);
				
			if (i < this.inputs.length) {
				if (myInLinks[i] != null) {
					context.fillStyle = myInLinks[i].getValue() ? "#FF9999" : "#9999FF";
				} else {
					context.fillStyle = "#999999";
				}
			} else {
				context.fillStyle = myOutputs[i - this.inputs.length]
					? "#FF9999" : "#9999FF";
			}

			context.beginPath();
			context.arc(pos.x + offset.x, pos.y + offset.y, 4, 0, Math.PI * 2, true);
			context.fill();
			context.stroke();
			context.closePath();
		}
	}
	
	if (!noInit) {
		this.type.initialize(this);
	}
}
