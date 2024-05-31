const log = console.log;
window.log = log;

window.vars = {
	fast_units: null,
	units: null,
	inv: null,
	inv_ids: null,
	n: null,
	chat: null,
	terminal: null,
	cam: null,
	// token: null,
	// token_id: null,
	team: null,
	socket: null,
	select_craft: null,
	drawSpike: null,
	pid: null,
	// cosmetic: "ⲆⵠⲆΔⵠ",
	// send_move: "ᐃΔᐃⵠⵠᐃᐃⵠⵠ",
	// Utils: "ⵠᐃᐃᐃ",
	// update: "ⵠⲆⲆ",
	// pos: "ⲆⵠᐃⲆ",
	// get_std_angle: "ΔΔᐃⵠⵠᐃⵠ",
	// mouse: "ⵠΔⵠᐃ",
	// previous: "ⲆᐃᐃⲆⵠᐃⵠ",
	// is_left: "ΔⲆᐃⵠⵠⲆⵠ",
	// is_right: "ⵠⲆᐃΔⲆᐃⵠ",
	// is_top: "ⵠⵠⵠⵠⲆΔⵠ",
	// is_bottom: "ⵠⲆⲆΔⲆΔᐃ",
	// STATE: "ᐃΔⲆΔ",
	// ATTACK: "ᐃⵠΔᐃⲆᐃⲆ",
	// CLIENT: "ΔᐃᐃⵠΔ",
	// ROTATE: "ⵠΔΔᐃⲆⲆᐃ",
	// nangle: "ⵠⵠᐃⲆᐃⲆΔ",
};
const packets = {
	extPut: 9,
	extTake: 26,
	placeBuild: 23,
	drop: 30,
	angle: 29,
	attack: 3,
	stopAttack: 38,
	chestPut: 13,
	chestTake: 18,
	equip: 22,
	craft: 1,
};

let user,
	world,
	client,
	mouseee,
	keyboard,
	master = Symbol();

function hooks() {
	Object.defineProperty(Object.prototype, "connect", {
		get() {
			return this[master];
		},
		set(data) {
			this[master] = data;
			if (!client) {
				client = this;
				log(client);
				window.client = client;
				log("window.client");
				log(window.client);
			}
		},
	});

	Object.defineProperty(Object.prototype, "opacity", {
		get() {
			this[master] = 0.5;
			return this[master];
		},
		set(data) {
			this[master] = data;
		},
	});
	Object.defineProperty(Screen.prototype, "width", {
		get: function () {
			return 3840;
		},
		set: function (v) {
			this[master] = v;
		},
	});
	Object.defineProperty(Screen.prototype, "height", {
		get: function () {
			return 2160;
		},
		set: function (v) {
			this[master] = v;
		},
	});
	Object.defineProperty(Object.prototype, "mode", {
		get() {
			return this[master];
		},
		set(data) {
			this[master] = data;
			if (!world) {
				world = this;
				log(world);
				window.world = world;
			}
		},
	});

	Object.defineProperty(Object.prototype, "control", {
		get() {
			return this[master];
		},
		set(data) {
			this[master] = data;
			if (!user) {
				user = this;
				log(user);
				window.user = user;
			}
		},
	});
}
hooks();

function pointer() {
	requestAnimationFrame(pointer);
	if (!world || !user || !client) return;

	let defined = true;
	for (const p in vars) if (vars[p] == null) defined = false;

	if (defined && user.token && user.token_id) return;

	if (!user.token) {
		document.cookie.split(";").forEach((e) => {
			if (e.trim().startsWith("starve_token")) user.token = e.split("=")[1];
		});
	}
	if (!user.token_id) {
		document.cookie.split(";").forEach((e) => {
			if (e.trim().startsWith("starve_token_id")) user.token_id = e.split("=")[1];
		});
	}

	for (const prop in client) {
		switch (typeof client[prop]) {
			case "object":
				if (client[prop] == null) break;
				if (client[prop].OPEN && vars.socket == null) vars.socket = prop;
				break;
			case "function":
				let code = client[prop].toString();
				if (code.includes(".max") && code.includes(".r") && code.includes("return 0") && vars.select_craft == null)
					vars.select_craft = prop;
				break;
			default:
				break;
		}
	}
	for (const prop in user) {
		switch (typeof user[prop]) {
			case "object":
				if (user[prop] == null) break;

				if (user[prop].max && vars.inv == null) vars.inv = prop;
				if (user[prop].x && vars.cam == null) vars.cam = prop;
				if (user[prop].prefix && vars.chat == null) vars.chat = prop;
				if (user[prop].style && !user[prop].prefix && vars.terminal == null) vars.terminal = prop;
				if (Array.isArray(user[prop])) if (user[prop].length == 0 && vars.team == null) vars.team = prop;

				if (vars.inv && (vars.n == null || vars.inv_ids == null)) {
					for (const p in user[vars.inv])
						if (Array.isArray(user[vars.inv][p]))
							if (user[vars.inv][p].length > 1 && typeof user[vars.inv][p][0] !== "object") vars.n = p;
					for (const p in user[vars.inv])
						if (Array.isArray(user[vars.inv][p]))
							if (user[vars.inv][p].length < 100 && user[vars.inv][p].length > 1) vars.inv_ids = p;
				}

				break;
			default:
				break;
		}
	}

	for (const prop in world) {
		switch (typeof world[prop]) {
			case "object":
				if ([prop] == null) break;
				if (Array.isArray(world[prop])) {
					if (world[prop].length > 1500 && vars.fast_units == null && !Array.isArray(world[prop][0]))
						vars.fast_units = prop;
					if (world[prop].length == 101 && vars.units == null) vars.units = prop;

					if (vars.units && vars.pid == null) {
						if (world[vars.units][0].length > 0)
							world[vars.units][0].forEach((obj) => {
								for (const e in obj) {
									if (obj[e] == user.id) vars.pid = e;
								}
							});
					}

					if (vars.units && (vars.drawSpike == null || vars.drawSpike == "null")) {
						[5, 12, 13, 14, 20, 52, 10, 15, 16, 17, 21, 51, 45, 46, 47, 48, 49, 53].forEach((id) => {
							if (world[vars.units][id].length > 0)
								for (let e in world[vars.units][id])
									for (const k in world[vars.units][id][e])
										if (typeof world[vars.units][id][e][k] == "function") {
											if (world[vars.units][id][e][k].toString().includes("width")) vars.drawSpike = k;
										}
						});
					}
				}
				break;
			default:
				break;
		}
	}
}

const spikeMap = {
	"Reidite Spike": 213 + 6,
	"Amethyst Spike": 117 + 6,
	"Diamond Spike": 164 + 6,
	"Gold Spike": 163 + 6,
	"Stone Spike": 162 + 6,
	"Wood Spike": 154 + 6,
	"Wood Wall": 156 + 6,
	Nothing: -1,
};

let readys = {
	AutoSpike: true,
	AutoWall: true,
	AutoCraft: true,
	SwordInChest: true,
};

let S = {
	AMB: {
		e: false,
		k: "KeyF",
		a: null,
		t: null,
	},
	AutoBook: true,
	AutoBreadPut: {
		e: false,
		k: "NONE",
	},
	AutoBreadTake: {
		e: false,
		k: "NONE",
	},
	AutoBuild: {
		e: false,
		k: "KeyT",
		m: false,
		c: ["Bridge"],
	},
	AutoCraft: {
		e: false,
		k: "KeyK",
		id: null,
	},
	AutoEme: {
		e: false,
		k: "Numpad2",
		a: null,
	},
	AutoExtPut: {
		e: false,
		k: "NONE",
	},
	AutoExtTake: {
		e: false,
		k: "NONE",
	},
	AutoFire: {
		k: "KeyZ",
	},
	AutoRecycle: {
		e: false,
		k: "KeyL",
	},
	AutoSeed: false,
	AutoSpike: {
		e: false,
		k: "Space",
		m: true,
		p: ["Reidite Spike", "Amethyst Spike", "Diamond Spike", "Gold Spike", "Stone Spike", "Wood Spike", "Wood Wall"],
	},
	AutoSpikee: {
		e: false,
		k: "Num5",
		m: true,
	},
	AutoSpikeee: {
		e: false,
		k: "KeyX",
		m: true,
	},
	AutoSteal: {
		e: false,
		k: "KeyQ",
		l: [],
		u: false,
		o: 0,
	},
	AutoTame: {
		e: false,
		k: "KeyJ",
		a: null,
	},
	AutoTotem: {
		e: false,
		k: "KeyH",
	},
	AutoWall: {
		e: false,
		k: "KeyC",
	},
	Autofarm: {
		e: false,
		k: "KeyU",
		a: null,
		w: false,
		x: null,
		xx: null,
		y: null,
		yy: null,
		sy: null,
		sx: null,
	},
	Bed: false,
	BlizzardStorm: "#ff0000",
	BlizzardStormShadow: "#000000",
	BoxInfo: true,
	BoxOntop: true,
	BS: true,
	BuildingInfo: true,
	chestinfo: false,
	ChestOntop: false,
	ColoredSpikes: true,
	Crown: true,
	Debug: false,
	DropSword: {
		k: "KeyV",
	},
	DrawItemsOnChest: true,
	EnabledHacks: "red",
	EnabledHacksShadow: "#000000",
	Esp: false,
	ex: false,
	Fly: {
		o: 0.5,
		e: false,
	},
	Hitbox: false,
	HpTimer: "red",
	HpTimerShadow: "#000000",
	Ice: false,
	JoinLeave: false,
	ListeHacks: true,
	LockedChests: true,
	LowFrame: {
		e: false,
		k: "Num3",
	},
	MarkDeath: true,
	MarkTotem: true,
	MovementPredicter: false,
	Moves: false,
	PathFinder: {
		e: false,
		g: false,
		k: "Numpad3",
	},
	PlayerOntop: true,
	PutInChest: 10,
	RangeBetweenMeAndEnemy: 120,
	Respawn: false,
	Roofs: true,
	SandwormTracers: false,
	showNames: true,
	spikea: {
		e: false,
		k: "KeyO",
		a: null,
	},
	Spectator: {
		k: "KeyP",
	},
	speed: 145,
	SwordInChest: {
		e: false,
		k: "KeyI",
	},
	Tame: {
		e: false,
		k: "KeyG",
		a: null,
	},
	Timer: true,
	Tokenjoin: {
		e: false,
		token: "",
		id: "",
	},
	Tracers: false,
	worldinfo: false,
	Xray: {
		e: false,
		k: "Backquote",
		o: 0.5,
	},
	KrakenTracers: false,
	AutoRes: {
		e: false,
		k: "NONE",
		a: null,
	},
	PCount: !1,
	ShowNames: !1,
};
window.S = S
const Utils = {
	initUI: () => {
		log(S);
		let e = new guify({
			title: "Aymen",
			theme: {
				name: "Aymen",
				colors: {
					panelBackground: "#00000099",
					componentBackground: "black",
					componentForeground: "#de00ff",
					textPrimary: "#de00ff",
					textSecondary: "#de00ff",
					textHover: "black ",
				},
				font: {
					fontFamily: "Baloo Paaji",
					fontSize: "20px",
					fontWeight: "1",
				},
			},
			align: "right",
			width: 550,
			barMode: "none",
			panelMode: "none",
			root: window.container,
			open: !1,
		});
		e.Register({
			type: "folder",
			label: "Visuals",
			open: !1,
		}),
			e.Register({
				type: "folder",
				label: "Misc",
				open: !1,
			}),
			e.Register({
				type: "folder",
				label: "Binds",
				open: !1,
			}),
			e.Register({
				type: "folder",
				label: "AutoFarm",
				open: !1,
			}),
			e.Register({
				type: "folder",
				label: "PathFinder",
				open: !1,
			}),
			e.Register({
				type: "folder",
				label: "AutoSteal",
				open: !1,
			}),
			e.Register({
				type: "folder",
				label: "AutoSpike",
				open: !1,
			}),
			e.Register({
				type: "folder",
				label: "AutoCraft&Recycle",
				open: !1,
			}),
			e.Register({
				type: "folder",
				label: "Resources",
				open: !1,
			}),
			e.Register({
				type: "folder",
				label: "Token",
				open: !1,
			}),
			e.Register({
				type: "folder",
				label: "Skin",
				open: !1,
			}),
			e.Register(
				[
					{
						type: "button",
						label: "Set AutoSpike k",
						action: (e) => {
							Utils.controls.setKeyBind("AutoSpike");
						},
					},
					{
						type: "display",
						label: "AutoSpike k:",
						object: S.AutoSpike,
						property: "k",
					},
					{
						type: "checkbox",
						label: "AutoSpike 2",
						object: S.AutoSpike,
						property: "m",
						onChange: (e) => {
							Utils.saveSettings();
						},
					},
					{
						type: "select",
						label: "1",
						object: S.AutoSpike.p,
						property: "0",
						options: [
							"Reidite Spike",
							"Amethyst Spike",
							"Diamond Spike",
							"Gold Spike",
							"Stone Spike",
							"Wood Spike",
							"Wood Wall",
							"Nothing",
						],
						onChange: (e) => {
							Utils.saveSettings();
						},
					},
					{
						type: "select",
						label: "2",
						object: S.AutoSpike.p,
						property: "1",
						options: [
							"Reidite Spike",
							"Amethyst Spike",
							"Diamond Spike",
							"Gold Spike",
							"Stone Spike",
							"Wood Spike",
							"Wood Wall",
							"Nothing",
						],
						onChange: (e) => {
							Utils.saveSettings();
						},
					},
					{
						type: "select",
						label: "3",
						object: S.AutoSpike.p,
						property: "2",
						options: [
							"Reidite Spike",
							"Amethyst Spike",
							"Diamond Spike",
							"Gold Spike",
							"Stone Spike",
							"Wood Spike",
							"Wood Wall",
							"Nothing",
						],
						onChange: (e) => {
							Utils.saveSettings();
						},
					},
					{
						type: "select",
						label: "4",
						object: S.AutoSpike.p,
						property: "3",
						options: [
							"Reidite Spike",
							"Amethyst Spike",
							"Diamond Spike",
							"Gold Spike",
							"Stone Spike",
							"Wood Spike",
							"Wood Wall",
							"Nothing",
						],
						onChange: (e) => {
							Utils.saveSettings();
						},
					},
					{
						type: "select",
						label: "5",
						object: S.AutoSpike.p,
						property: "4",
						options: [
							"Reidite Spike",
							"Amethyst Spike",
							"Diamond Spike",
							"Gold Spike",
							"Stone Spike",
							"Wood Spike",
							"Wood Wall",
							"Nothing",
						],
						onChange: (e) => {
							Utils.saveSettings();
						},
					},
					{
						type: "select",
						label: "6",
						object: S.AutoSpike.p,
						property: "5",
						options: [
							"Reidite Spike",
							"Amethyst Spike",
							"Diamond Spike",
							"Gold Spike",
							"Stone Spike",
							"Wood Spike",
							"Wood Wall",
							"Nothing",
						],
						onChange: (e) => {
							Utils.saveSettings();
						},
					},
					{
						type: "select",
						label: "7",
						object: S.AutoSpike.p,
						property: "6",
						options: [
							"Reidite Spike",
							"Amethyst Spike",
							"Diamond Spike",
							"Gold Spike",
							"Stone Spike",
							"Wood Spike",
							"Wood Wall",
							"Nothing",
						],
						onChange: (e) => {
							Utils.saveSettings();
						},
					},
				],
				{
					folder: "AutoSpike",
				}
			),
			e.Register(
				[
					{
						type: "button",
						label: "Set AutoSteal k",
						action: (e) => {
							Utils.controls.setKeyBind("AutoSteal");
						},
					},
					{
						type: "display",
						label: "AutoSteal k:",
						object: S.AutoSteal,
						property: "k",
					},
					{
						type: "checkbox",
						label: "AutoSteal",
						object: S.AutoSteal,
						property: "e",
						onChange: (e) => {
							Utils.saveSettings();
						},
					},
					{
						type: "checkbox",
						label: "AutoUnlock",
						object: S.AutoSteal,
						property: "u",
						onChange: (e) => {
							Utils.saveSettings();
						},
					},
					{
						type: "range",
						label: "ItemID",
						min: 0,
						max: 1e4,
						step: 1,
						object: S.AutoSteal,
						property: "o",
						onChange: (e) => {
							Utils.saveSettings();
						},
					},
					{
						type: "button",
						label: "Add Item ID to SmartSteal",
						action: (e) => {
							S.AutoSteal.l.push(S.AutoSteal.o), updateChest();
						},
					},
					{
						type: "button",
						label: "Delete ID",
						action: (e) => {
							let o = S.AutoSteal.l.indexOf(S.AutoSteal.o);
							-1 !== o && S.AutoSteal.l.splice(o, 1), updateChest();
						},
					},
					{
						type: "button",
						label: "Clear",
						action: (e) => {
							(S.AutoSteal.l = []), updateChest();
						},
					},
				],
				{
					folder: "AutoSteal",
				}
			),
			e.Register(
				[
					{
						type: "checkbox",
						label: "AutoCraft",
						object: S.AutoCraft,
						property: "e",
						onChange: (e) => {
							Utils.saveSettings();
						},
					},
					{
						type: "checkbox",
						label: "AutoRecycle",
						object: S.AutoRecycle,
						property: "e",
						onChange: (e) => {
							Utils.saveSettings();
						},
					},
					{
						type: "button",
						label: "Set AutoCraft k",
						action: (e) => {
							Utils.controls.setKeyBind("AutoCraft");
						},
					},
					{
						type: "display",
						label: "AutoCraft k:",
						object: S.AutoCraft,
						property: "k",
					},
					{
						type: "button",
						label: "Set AutoRecycle k",
						action: (e) => {
							Utils.controls.setKeyBind("AutoRecycle");
						},
					},
					{
						type: "display",
						label: "AutoRecycle k:",
						object: S.AutoRecycle,
						property: "k",
					},
				],
				{
					folder: "AutoCraft&Recycle",
				}
			),
			// e.Register(
			//     [
			//         {
			//             type: "checkbox",
			//             label: "Start PathFinder",
			//             object: S.PathFinder,
			//             property: "e",
			//             onChange: (e) => {
			//                 Utils.saveSettings();
			//             },
			//         },
			//         {
			//             type: "checkbox",
			//             label: "Put Your Inventory to Chest",
			//             object: S.PathFinder,
			//             property: "g",
			//             onChange: (e) => {
			//                 Utils.saveSettings();
			//             },
			//         },
			//         {
			//             type: "button",
			//             label: "Set target location",
			//             action: (e) => {
			//                 // let o = p.$Vu[user.vUU];
			//                 // o && ((PathfinderEnd.x = Math.floor(o.x / 100)), (PathfinderEnd.y = Math.floor(o.y / 100)));
			//             },
			//         },
			//         {
			//             type: "text",
			//             label: "Set X",
			//             object: PathfinderEnd,
			//             property: "x",
			//             onChange: (e) => {},
			//         },
			//         {
			//             type: "text",
			//             label: "Set Y",
			//             object: PathfinderEnd,
			//             property: "y",
			//             onChange: (e) => {},
			//         },
			//         {
			//             type: "display",
			//             label: "Target X",
			//             object: PathfinderEnd,
			//             property: "x",
			//         },
			//         {
			//             type: "display",
			//             label: "Target Y",
			//             object: PathfinderEnd,
			//             property: "y",
			//         },
			//     ],
			//     {
			//         folder: "PathFinder",
			//     }
			// ),
			e.Register(
				[
					{
						type: "button",
						label: "Set AutoWall Put k",
						action: (e) => {
							Utils.controls.setKeyBind("AutoWall");
						},
					},
					{
						type: "display",
						label: "AutoWall Put k:",
						object: S.AutoWall,
						property: "k",
					},
					{
						type: "button",
						label: "Set AutoExtractor Put k",
						action: (e) => {
							Utils.controls.setKeyBind("AutoExtPut");
						},
					},
					{
						type: "display",
						label: "AutoExtractor Put k:",
						object: S.AutoExtPut,
						property: "k",
					},
					{
						type: "button",
						label: "Set AutoExtractor Take k",
						action: (e) => {
							Utils.controls.setKeyBind("AutoExtTake");
						},
					},
					{
						type: "display",
						label: "AutoExtractor Take k:",
						object: S.AutoExtTake,
						property: "k",
					},
					{
						type: "button",
						label: "Set AutoBread Take k",
						action: (e) => {
							Utils.controls.setKeyBind("AutoBreadTake");
						},
					},
					{
						type: "display",
						label: "AutoBread Take k:",
						object: S.AutoBreadTake,
						property: "k",
					},
					{
						type: "button",
						label: "Set AutoBread Put k",
						action: (e) => {
							Utils.controls.setKeyBind("AutoBreadPut");
						},
					},
					{
						type: "display",
						label: "AutoBread Put k:",
						object: S.AutoBreadPut,
						property: "k",
					},
					{
						type: "button",
						label: "Set AMB k",
						action: (e) => {
							Utils.controls.setKeyBind("AMB");
						},
					},
					{
						type: "display",
						label: "AMB k:",
						object: S.AMB,
						property: "k",
					},
					{
						type: "button",
						label: "Set Tame k",
						action: (e) => {
							Utils.controls.setKeyBind("Tame");
						},
					},
					{
						type: "display",
						label: "AutoTame k:",
						object: S.Tame,
						property: "k",
					},
					{
						type: "button",
						label: "Set SwordInChest k",
						action: (e) => {
							Utils.controls.setKeyBind("SwordInChest");
						},
					},
					{
						type: "display",
						label: "SwordInChest k:",
						object: S.SwordInChest,
						property: "k",
					},
					{
						type: "button",
						label: "Set Xray k",
						action: (e) => {
							Utils.controls.setKeyBind("Xray");
						},
					},
					{
						type: "display",
						label: "Xray k:",
						object: S.Xray,
						property: "k",
					},
					{
						type: "button",
						label: "Set Auto Build k",
						action: (e) => {
							Utils.controls.setKeyBind("Auto Build");
						},
					},
					{
						type: "display",
						label: "Auto Build k:",
						object: S.AutoBuild,
						property: "k",
					},
					{
						type: "button",
						label: "Set PathFinder k",
						action: (e) => {
							Utils.controls.setKeyBind("PathFinder");
						},
					},
					{
						type: "display",
						label: "PathFinder k:",
						object: S.PathFinder,
						property: "k",
					},
					{
						type: "button",
						label: "Set AutoTotem k",
						action: (e) => {
							Utils.controls.setKeyBind("AutoTotem");
						},
					},
					{
						type: "display",
						label: "AutoTotem k:",
						object: S.AutoTotem,
						property: "k",
					},
					{
						type: "button",
						label: "Set Autofarm k",
						action: (e) => {
							Utils.controls.setKeyBind("Autofarm");
						},
					},
					{
						type: "display",
						label: "Autofarm k:",
						object: S.Autofarm,
						property: "k",
					},
					{
						type: "button",
						label: "Set AutoEmerald k",
						action: (e) => {
							Utils.controls.setKeyBind("AutoEme");
						},
					},
					{
						type: "display",
						label: "AutoEmerald k:",
						object: S.AutoEme,
						property: "k",
					},
					{
						type: "button",
						label: "Set Spectator k",
						action: (e) => {
							Utils.controls.setKeyBind("Spectator");
						},
					},
					{
						type: "display",
						label: "Spectator k:",
						object: S.Spectator,
						property: "k",
					},
					{
						type: "button",
						label: "Set AutoFire k",
						action: (e) => {
							Utils.controls.setKeyBind("AutoFire");
						},
					},
					{
						type: "display",
						label: "AutoFire k:",
						object: S.AutoFire,
						property: "k",
					},
					{
						type: "button",
						label: "Set DropSword k",
						action: (e) => {
							Utils.controls.setKeyBind("DropSword");
						},
					},
					{
						type: "display",
						label: "DropSword k:",
						object: S.DropSword,
						property: "k",
					},
				],
				{
					folder: "Binds",
				}
			),
			e.Register(
				[
					// {
					// 	type: "checkbox",
					// 	label: "Auto Build with G m",
					// 	object: S.AutoBuild,
					// 	property: "m",
					// 	onChange: (e) => {
					// 		Utils.saveSettings();
					// 	},
					// },
					// {
					// 	type: "select",
					// 	label: "Auto Build m:",
					// 	options: ["Bridge", "Roof", "Plot"],
					// 	onChange: (e) => (window.currentBuilding = e),
					// },
					// {
					// 	type: "checkbox",
					// 	label: "Equip after place",
					// 	object: S,
					// 	property: "Equip",
					// 	onChange: (e) => {
					// 		Utils.saveSettings();
					// 	},
					// },
					{
						type: "checkbox",
						label: "AutoExtractor Take",
						object: S.AutoExtTake,
						property: "e",
						onChange: (e) => {
							Utils.saveSettings();
						},
					},
					{
						type: "checkbox",
						label: "AutoExtractor Put",
						object: S.AutoExtPut,
						property: "e",
						onChange: (e) => {
							Utils.saveSettings();
						},
					},
					{
						type: "checkbox",
						label: "AutoBread Take",
						object: S.AutoBreadTake,
						property: "e",
						onChange: (e) => {
							Utils.saveSettings();
						},
					},
					{
						type: "checkbox",
						label: "AutoBread Put",
						object: S.AutoBreadPut,
						property: "e",
						onChange: (e) => {
							Utils.saveSettings();
						},
					},
					{
						type: "checkbox",
						label: "AutoEmerald",
						object: S.AutoEme,
						property: "e",
						onChange: (e) => {
							Utils.saveSettings();
						},
					},
					{
						type: "checkbox",
						label: "AutoRespawn",
						object: S,
						property: "Respawn",
						onChange: (e) => {
							Utils.saveSettings();
						},
					},
					{
						type: "checkbox",
						label: "AutoCrown",
						object: S,
						property: "Crown",
						onChange: (e) => {
							Utils.saveSettings();
						},
					},
					{
						type: "checkbox",
						label: "Auto-Book",
						object: S,
						property: "AutoBook",
						onChange: (e) => {
							Utils.saveSettings();
						},
					},
					{
						type: "checkbox",
						label: "AutoTotem",
						object: S.AutoTotem,
						property: "e",
						onChange: (e) => {
							Utils.saveSettings();
						},
					},
					{
						type: "checkbox",
						label: "AutoSeed",
						object: S,
						property: "AutoSeed",
						onChange: (e) => {
							Utils.saveSettings();
						},
					},
					{
						type: "checkbox",
						label: "AutoIce",
						object: S,
						property: "Ice",
						onChange: (e) => {
							Utils.saveSettings();
						},
					},
					{
						type: "checkbox",
						label: "AMB",
						object: S.AMB,
						property: "e",
						onChange: (e) => {
							Utils.saveSettings();
						},
					},
					{
						type: "checkbox",
						label: "AutoTame",
						object: S.Tame,
						property: "e",
						onChange: (e) => {
							Utils.saveSettings();
						},
					},
					{
						type: "range",
						label: "Put that much in chest",
						min: 10,
						max: 8e3,
						step: 1,
						object: S,
						property: "PutInChest",
						onChange: (e) => {
							Utils.saveSettings();
						},
					},
					{
						type: "range",
						label: "Adjust Auto-Feed",
						min: 5,
						max: 90,
						step: 1,
						onChange: (e) => {
							autoFeedRange = e / 100;
						},
					},
				],
				{
					folder: "Misc",
				}
			);
		e.Register(
			[
				{
					type: "checkbox",
					label: "BlizzardSandstorm",
					object: S,
					property: "BS",
					onChange: (e) => {
						Utils.saveSettings();
					},
				},
				{
					type: "checkbox",
					label: "MovementPredicter",
					object: S,
					property: "MovementPredicter",
					onChange: (e) => {
						Utils.saveSettings();
					},
				},
				{
					type: "checkbox",
					label: "Show Join&Leaves",
					object: S,
					property: "JoinLeave",
					onChange: (e) => {
						Utils.saveSettings();
					},
				},
				{
					type: "checkbox",
					label: "DrawItemsOnChest",
					object: S,
					property: "DrawItemsOnChest",
					onChange: (e) => {
						Utils.saveSettings();
					},
				},
				{
					type: "checkbox",
					label: "ListeHacks",
					object: S,
					property: "ListeHacks",
					onChange: (e) => {
						Utils.saveSettings();
					},
				},
				{
					type: "checkbox",
					label: "SandwormTracers",
					object: S,
					property: "SandwormTracers",
					onChange: (e) => {
						Utils.saveSettings();
					},
				},
				{
					type: "checkbox",
					label: "Show If in bed",
					object: S,
					property: "Bed",
					onChange: (e) => {
						Utils.saveSettings();
					},
				},
				{
					type: "checkbox",
					label: "KrakenTracers",
					object: S,
					property: "KrakenTracers",
					onChange: (e) => {
						Utils.saveSettings();
					},
				},
				{
					type: "checkbox",
					label: "ColoredSpikes",
					object: S,
					property: "ColoredSpikes",
					onChange: (e) => {
						Utils.saveSettings();
					},
				},
				{
					type: "checkbox",
					label: "LockedChests",
					object: S,
					property: "LockedChests",
					onChange: (e) => {
						Utils.saveSettings();
					},
				},
				{
					type: "checkbox",
					label: "BuildingInfo",
					object: S,
					property: "BuildingInfo",
					onChange: (e) => {
						Utils.saveSettings();
					},
				},
				{
					type: "checkbox",
					label: "PlayerOntop",
					object: S,
					property: "PlayerOntop",
					onChange: (e) => {
						Utils.saveSettings();
					},
				},
				{
					type: "checkbox",
					label: "ChestOntop",
					object: S,
					property: "ChestOntop",
					onChange: (e) => {
						Utils.saveSettings();
					},
				},
				{
					type: "checkbox",
					label: "BoxOntop",
					object: S,
					property: "BoxOntop",
					onChange: (e) => {
						Utils.saveSettings();
					},
				},
				{
					type: "checkbox",
					label: "PlayerInfo",
					object: S,
					property: "PCount",
					onChange: (e) => {
						Utils.saveSettings();
					},
				},
				{
					type: "checkbox",
					label: "MarkTotem",
					object: S,
					property: "MarkTotem",
					onChange: (e) => {
						Utils.saveSettings();
					},
				},
				{
					type: "checkbox",
					label: "MarkDeath",
					object: S,
					property: "MarkDeath",
					onChange: (e) => {
						Utils.saveSettings();
					},
				},
				{
					type: "checkbox",
					label: "Debugger",
					object: S,
					property: "Debug",
					onChange: (e) => {
						Utils.saveSettings();
					},
				},
				{
					type: "checkbox",
					label: "Hitboxes",
					object: S,
					property: "Hitbox",
					onChange: (e) => {
						for (let e in Hitboxes) delete Hitboxes[e];
						Utils.saveSettings();
					},
				},
				{
					type: "checkbox",
					label: "ShowName",
					object: S,
					property: "ShowNames",
					onChange: (e) => {
						Utils.saveSettings();
					},
				},
				{
					type: "checkbox",
					label: "BoxInfo",
					object: S,
					property: "BoxInfo",
					onChange: (e) => {
						Utils.saveSettings();
					},
				},
				{
					type: "checkbox",
					label: "Tracers",
					object: S,
					property: "Tracers",
					onChange: (e) => {
						Utils.saveSettings();
					},
				},
				{
					type: "checkbox",
					label: "Timers",
					object: S,
					property: "Timer",
					onChange: (e) => {
						Utils.saveSettings();
					},
				},
				// {
				// 	type: "checkbox",
				// 	label: "NoFog",
				// 	object: S,
				// 	property: "NoFog",
				// 	onChange: (e) => {
				// 		Utils.saveSettings();
				// 	},
				// },
				{
					type: "checkbox",
					label: "Roofs",
					object: S,
					property: "Roofs",
					onChange: (e) => {
						Utils.saveSettings();
					},
				},
				{
					type: "checkbox",
					label: "Xray",
					object: S.Xray,
					property: "e",
					onChange: (e) => {
						Utils.saveSettings();
					},
				},
				{
					type: "checkbox",
					label: "Vehicle Xray",
					object: S.Fly,
					property: "e",
					onChange: (e) => {
						Utils.saveSettings();
					},
				},
				{
					type: "checkbox",
					label: "Esp",
					object: S,
					property: "Esp",
					onChange: (e) => {
						Utils.saveSettings();
					},
				},
				{
					type: "range",
					label: "Xray Opacity",
					min: 0,
					max: 1,
					step: 0.1,
					object: S.Xray,
					property: "o",
					onChange: (e) => {
						Utils.saveSettings();
					},
				},
				{
					type: "range",
					label: "Vehicle Opacity",
					min: 0,
					max: 1,
					step: 0.1,
					object: S.Fly,
					property: "o",
					onChange: (e) => {
						Utils.saveSettings();
					},
				},
			],
			{
				folder: "Visuals",
			}
		),
			e.Register(
				[
					{
						type: "checkbox",
						label: "Start AutoFarm",
						object: S.Autofarm,
						property: "e",
						onChange: (e) => {
							Utils.saveSettings();
						},
					},
					{
						type: "checkbox",
						label: "AutoWater",
						object: S.Autofarm,
						property: "w",
						onChange: (e) => {
							Utils.saveSettings();
						},
					},
					{
						type: "button",
						label: "Top left of farm",
						action: (e) => {
							let o = world.ΔΔⲆⵠⲆ[user.id * 1000];
							o && ((S.Autofarm.x = o.x), (S.Autofarm.y = o.y));
						},
					},
					{
						type: "button",
						label: "Bottom right of farm",
						action: (e) => {
							let o = world.ΔΔⲆⵠⲆ[user.id * 1000];
							o && ((S.Autofarm.xx = o.x), (S.Autofarm.yy = o.y));
						},
					},
					{
						type: "button",
						label: "Safe Point",
						action: (e) => {
							let o = world.ΔΔⲆⵠⲆ[user.id * 1000];
							o && ((S.Autofarm.sx = o.x), (S.Autofarm.sy = o.y));
						},
					},
					{
						type: "display",
						label: "X",
						object: S.Autofarm,
						property: "x",
					},
					{
						type: "display",
						label: "Y",
						object: S.Autofarm,
						property: "y",
					},
					{
						type: "display",
						label: "X1",
						object: S.Autofarm,
						property: "xx",
					},
					{
						type: "display",
						label: "Y1",
						object: S.Autofarm,
						property: "yy",
					},
					{
						type: "display",
						label: "SX",
						object: S.Autofarm,
						property: "sx",
					},
					{
						type: "display",
						label: "SY",
						object: S.Autofarm,
						property: "sy",
					},
				],
				{
					folder: "AutoFarm",
				}
			),
			e.Register(
				[
					{
						type: "button",
						label: "Copy Token and TokenID",
						action: (e) => {
							let o = `\`\`\`Token: ${user.token}\nTokenID: ${user.token_id}\`\`\``;
							window.prompt("Press CTRL C", o);
						},
					},
				],
				{
					folder: "Token",
				}
			),
			e.Register(
				[
					{
						type: "text",
						label: "Token",
						onChange: (e) => (window.newToken = e),
					},
				],
				{
					folder: "Token",
				}
			),
			e.Register(
				[
					{
						type: "text",
						label: "Token ID",
						onChange: (e) => (window.newTokenId = e),
					},
				],
				{
					folder: "Token",
				}
			),
			e.Register(
				[
					{
						type: "button",
						label: "Set Token and TokenID",
						action: (e) => {
							user.token = newToken;
							user.token_id = newTokenId;
							alert("Set new token and token id");
						},
					},
				],
				{
					folder: "Token",
				}
			);
		// e.Register(
		//     [
		//         {
		//             type: "select",
		//             label: "Resource Type:",
		//             options: ["Wood", "Stone", "Gold", "Diamond", "Amethyst", "Reidite"],
		//             onChange: (e) => (currentResource = e),
		//         },
		//         ,
		//         {
		//             type: "range",
		//             label: "Resources Amount",
		//             min: 1,
		//             max: 100000,
		//             step: 1,
		//             onChange: (e) => {
		//                 resourceAmount = e;
		//             },
		//         },
		//         {
		//             type: "button",
		//             label: "Buy Resource",
		//             action: (e) => {
		//                 let requiredAmount;
		//                 switch (currentResource) {
		//                     case "Wood":
		//                         requiredAmount = Math.round(resourceAmount / 3);
		//                         if (requiredAmount > 83) {
		//                             for (let i = 0; i < Math.floor(requiredAmount / 83); i++)
		//                                 client.oOW.send(JSON.stringify([32, 83, 0]));
		//                             client.oOW.send(JSON.stringify([32, Math.ceil((requiredAmount % 83) / 3), 0]));
		//                         } else client.oOW.send(JSON.stringify([32, Math.floor(resourceAmount / 3), 0]));
		//                         break;
		//                     case "Stone":
		//                         requiredAmount = Math.round(resourceAmount / 4);
		//                         if (requiredAmount > 62) {
		//                             for (let i = 0; i < Math.floor(requiredAmount / 62); i++)
		//                                 client.oOW.send(JSON.stringify([32, 62, 1]));
		//                             client.oOW.send(JSON.stringify([32, Math.ceil((requiredAmount % 62) / 4), 1]));
		//                         } else client.oOW.send(JSON.stringify([32, Math.floor(resourceAmount / 4), 1]));
		//                         break;
		//                     case "Gold":
		//                         requiredAmount = Math.round(resourceAmount / 6);
		//                         if (requiredAmount > 41) {
		//                             for (let i = 0; i < Math.floor(requiredAmount / 41); i++)
		//                                 client.oOW.send(JSON.stringify([32, 41, 2]));
		//                             client.oOW.send(JSON.stringify([32, Math.ceil((requiredAmount % 41) / 6), 2]));
		//                         } else client.oOW.send(JSON.stringify([32, Math.floor(resourceAmount / 6), 2]));
		//                         break;
		//                     case "Diamond":
		//                         requiredAmount = Math.round(resourceAmount / 0.25);
		//                         if (requiredAmount > 252) {
		//                             for (let i = 0; i < Math.floor(requiredAmount / 252); i++)
		//                                 client.oOW.send(JSON.stringify([32, 252, 3]));
		//                             client.oOW.send(JSON.stringify([32, Math.ceil((requiredAmount % 252) / 0.25), 3]));
		//                         } else client.oOW.send(JSON.stringify([32, Math.floor(resourceAmount / 0.25), 3]));
		//                         break;
		//                     case "Amethyst":
		//                         requiredAmount = Math.round(resourceAmount / 0.125);
		//                         if (requiredAmount > 248) {
		//                             for (let i = 0; i < Math.floor(requiredAmount / 248); i++)
		//                                 client.oOW.send(JSON.stringify([32, 248, 4]));
		//                             client.oOW.send(JSON.stringify([32, Math.ceil((requiredAmount % 248) / 0.125), 4]));
		//                         } else client.oOW.send(JSON.stringify([32, Math.floor(resourceAmount / 0.125), 4]));
		//                         break;
		//                     case "Reidite":
		//                         requiredAmount = Math.round(resourceAmount / 0.0625);
		//                         if (requiredAmount > 240) {
		//                             for (let i = 0; i < Math.floor(requiredAmount / 240); i++)
		//                                 client.oOW.send(JSON.stringify([32, 240, 5]));
		//                             client.oOW.send(JSON.stringify([32, Math.ceil((requiredAmount % 240) / 0.0625), 5]));
		//                         } else client.oOW.send(JSON.stringify([32, Math.floor(resourceAmount / 0.0625), 5]));
		//                         break;
		//                 }
		//             },
		//         },
		//     ],
		//     {
		//         folder: "Resources",
		//     }
		// ),
	},
	controls: null,
	controller: class {
		setKeyBind(e) {
			S[e].k = "Press any k";
			let o = 0;
			document.addEventListener("keydown", function i(t) {
				o++,
					o >= 1 &&
						("Escape" == t.code ? (S[e].k = "NONE") : (S[e].k = t.code),
						document.removeEventListener("keydown", i),
						Utils.saveSettings());
			});
		}
	},
	saveSettings: () => {
		for (let e in S) localStorage.setItem(e + "louxlegacy", JSON.stringify(S[e]));
	},
	loadSettings: () => {
		for (let e in S) {
			let o = localStorage.getItem(e + "louxlegacy");
			o && (S[e] = JSON.parse(o));
		}
	},
	LoadHack: () => {
		Utils.loadSettings(),
			Utils.initUI(),
			Aymen(),
			Visuals(),
			coloredSpikes(),
			pointer(),
			(S.Xray.e = !1),
			(S.AutoSpike.e = !1),
			(S.SwordInChest.e = !1),
			(S.AutoBuild.e = !1),
			(S.AutoSteal.e = !1),
			(S.PathFinder.e = !1),
			(S.AMB.e = !1),
			(S.Tame.e = !1),
			(S.Autofarm.e = !1),
			(S.AutoEme.e = !1),
			(Utils.controls = new Utils.controller());
	},
};

function Define() {
	if (!user || !client) {
		requestAnimationFrame(Define);
		return;
	}
	document.addEventListener("keydown", (k) => {
		if (user[vars.chat].open || user[vars.terminal].open) return;
		if (k.code == S.Xray.k) S.Xray.e = !S.Xray.e;
		if (k.code == S.Spectator.k) S.Spectator.e = !S.Spectator.e;
		if (k.code == S.AutoBreadTake.k) S.AutoBreadTake.e = !S.AutoBreadTake.e;
		if (k.code == S.AutoBreadPut.k) S.AutoBreadPut.e = !S.AutoBreadPut.e;
		if (k.code == S.AutoExtTake.k) S.AutoExtTake.e = !S.AutoExtTake.e;
		if (k.code == S.AutoExtPut.k) S.AutoExtPut.e = !S.AutoExtPut.e;
		if (k.code == S.Autofarm.k) S.Autofarm.e = !S.Autofarm.e;
		if (k.code == S.PathFinder.k) S.PathFinder.e = !S.PathFinder.e;
		if (k.code == S.AMB.k) S.AMB.e = !S.AMB.e;
		if (k.code == S.Tame.k) S.Tame.e = !S.Tame.e;
		if (k.code == S.AutoBuild.k) S.AutoBuild.e = !S.AutoBuild.e;
		if (k.code == S.AutoTotem.k) S.AutoTotem.e = !S.AutoTotem.e;
		if (k.code == S.AutoCraft.k) S.AutoCraft.e = !S.AutoCraft.e;
		if (k.code == S.AutoRecycle.k) S.AutoRecycle.e = !S.AutoRecycle.e;

		if (k.code == S.AutoFire.k) S.AutoFire.e = true;
		if (k.code == S.AutoWall.k) S.AutoWall.e = true;
		if (k.code == S.AutoSpike.k) S.AutoSpike.e = true;
		if (k.code == S.AutoSteal.k) S.AutoSteal.e = true;
		if (k.code == S.SwordInChest.k) S.SwordInChest.e = true;
		if (k.code == S.DropSword.k) S.DropSword.e = true;
	});
	document.addEventListener("keyup", (k) => {
		if (k.code == S.AutoFire.k) S.AutoFire.e = false;
		if (k.code == S.AutoWall.k) S.AutoWall.e = false;
		if (k.code == S.AutoSpike.k) S.AutoSpike.e = false;
		if (k.code == S.AutoSteal.k) S.AutoSteal.e = false;
		if (k.code == S.SwordInChest.k) S.SwordInChest.e = false;
		if (k.code == S.DropSword.k) S.DropSword.e = false;
	});
}
Define();

function Visuals() {
	requestAnimationFrame(Visuals);
	try {
		window.ctx = document.getElementById("game_canvas").getContext("2d");
	} catch (error) {
		return;
	}

	let omgnigga = 22.5;
	for (hack in S) {
		if (S[hack].e && S[hack].k) {
			ctx.save();
			ctx.beginPath();
			ctx.lineWidth = 6;
			ctx.fillStyle = "red";
			ctx.strokeStyle = "black";
			ctx.font = "22px Baloo Paaji";
			ctx.strokeText(hack, 3, omgnigga);
			ctx.fillText(hack, 3, omgnigga);
			ctx.restore();
			omgnigga += 22.5;
		}
	}

	if (!world || !client || !user) return;
	if (!world[vars.units]) return;
	if (world[vars.units][0].length <= 0) return;
}

function Aymen() {
	requestAnimationFrame(Aymen);
	if (!window.world || !window.client || !window.user) return;
	if (!client[vars.socket]) return;
	if (client[vars.socket].readyState !== 1 || world[vars.units][0].length <= 0) return;

	const socket = client[vars.socket];
	let myPlayer = world[vars.units][0].find((e) => {
		return e[vars.pid] == user.id;
	});
	const extractor_ids = [24, 25, 26, 27, 28, 29];

	extractor_ids.forEach((id) => {
		world[vars.units][id].forEach((ext) => {
			if (getdist(myPlayer, ext) <= 330 && S.AutoExtTake.e)
				socket.send(JSON.stringify([packets.extTake, ext[vars.pid], ext.id, id]));
			if (getdist(myPlayer, ext) <= 330 && S.AutoExtPut.e)
				socket.send(JSON.stringify([packets.extPut, 255, ext[vars.pid], ext.id, id]));
		});
	});

	if (vars.select_craft) {
		client[vars.select_craft] = function (id) {
			if (myPlayer.right !== 28) client[vars.socket].send(JSON.stringify([packets.equip, 28]));

			S.AutoCraft.id = id;
			if (user[vars.inv][vars.inv_ids].length === user[vars.inv].max) {
				client.message("nigga your inv is full");
				return 0;
			}
			client[vars.socket].send(JSON.stringify([packets.craft, id]));

			return 1;
		};
	}

	if (S.AutoCraft.e && S.AutoCraft.id && readys.AutoCraft) {
		client[vars.socket].send(JSON.stringify([packets.craft, S.AutoCraft.id]));

		readys.AutoCraft = false;
		setTimeout(() => (readys.AutoCraft = true), 50);
	}

	if (S.AMB.e && myPlayer) {
		const weaponType = HoldWeapon(myPlayer.right, true);
		let myRange;
		switch (weaponType) {
			case 1:
				myRange = myPlayer.fly ? 196.8 : 157.6;
				break;
			case 2:
				myRange = myPlayer.fly ? 291.8 : 227.6;
				break;
			case 3:
				myRange = 620;
				break;
			case 4:
				myRange = myPlayer.fly ? 140 : 125;
				break;
			case 5:
				myRange =
					myPlayer.clothe == INV.WINTER_HOOD || myPlayer.clothe == INV.HOOD ? (myPlayer.fly ? 120.8 : 97.6) : null;
				break;
			default:
				myRange = null;
				break;
		}
		if (myRange) {
			const Enemy = EnemyToAttack(myPlayer, world[vars.units][ITEMS.PLAYERS]);
			if (Enemy) {
				const RangeBetweenMeAndEnemy = dist2dSQRT(myPlayer, Enemy);
				if (RangeBetweenMeAndEnemy <= myRange) {
					S.AMB.a = calcAngle(myPlayer, Enemy, true);
					S.AMB.t = Enemy;
					const e = 2 * Math.PI;
					const Angle255 = Math.floor((((S.AMB.a + e) % e) * 255) / e);
					socket.send(JSON.stringify([packets.angle, Angle255]));
					if (S.AMB.a && RangeBetweenMeAndEnemy <= myRange - 22) {
						socket.send(JSON.stringify([packets.attack, Angle255]));
						socket.send(JSON.stringify([packets.stopAttack]));
					}
				} else {
					S.AMB.a = null;
					S.AMB.t = null;
				}
			} else {
				S.AMB.a = null;
			}
		}
	}

	if (S.DropSword.e && myPlayer && HoldWeapon(myPlayer.right, true) !== 5 && HoldWeapon(myPlayer.right, true) !== 0) {
		socket.send(JSON.stringify([packets.drop, myPlayer.right]));
	}

	if (S.SwordInChest.e) {
		if (HoldWeapon(myPlayer.right, false) == 0) return;
		var e = Math.PI * 2;
		const i = Math.floor((((user.control.angle + e) % e) * 255) / e);
		let place = true;

		let CHEST = null;

		let closeDistance = Infinity;

		let oldChests = world[vars.units][ITEMS.CHEST].length;

		world[vars.units][ITEMS.CHEST].forEach((chest) => {
			if (getdist(myPlayer, chest) < 150 && getdist(myPlayer, chest) < closeDistance) {
				CHEST = chest;
				place = false;
				window.chest = chest;
				window.CHEST = CHEST;
			}
		});

		if (!readys.SwordInChest) {
			client[vars.socket].send(JSON.stringify([packets.chestPut, myPlayer.right, 8000, CHEST[vars.pid], CHEST.id]));
			client[vars.socket].send(JSON.stringify([packets.chestTake, CHEST[vars.pid], CHEST.id]));
			return;
		}

		if (place) {
			for (let index = 1; index < 30; index++) {
				client[vars.socket].send(JSON.stringify([packets.placeBuild, 167, (127 + index + 49 + i) % 255, 0]));
				client[vars.socket].send(JSON.stringify([packets.placeBuild, 167, (index + 49 + i) % 255, 0]));
			}
		}

		function chestDiff() {
			if (oldChests == world[vars.units][ITEMS.CHEST].length) {
				requestAnimationFrame(chestDiff);
				return;
			}
			world[vars.units][ITEMS.CHEST].forEach((chest) => {
				if (getdist(myPlayer, chest) < 150 && getdist(myPlayer, chest) < closeDistance) {
					CHEST = chest;
					place = false;
					window.chest = chest;
					window.CHEST = CHEST;
				}
			});
			client[vars.socket].send(JSON.stringify([packets.chestPut, myPlayer.right, 8000, CHEST[vars.pid], CHEST.id]));
			client[vars.socket].send(JSON.stringify([packets.chestTake, CHEST[vars.pid], CHEST.id]));
			readys.SwordInChest = false;
			setTimeout(() => (readys.SwordInChest = true), 50);
		}
		chestDiff();
	}

	if (S.AutoSpike.e && readys.AutoSpike) {
		window.sus = 1;
		readys.AutoSpike = false;
		setTimeout((e) => (readys.AutoSpike = true), 50);
		let spikeId = null;
		const e = 2 * Math.PI;
		for (const currentSpike of S.AutoSpike.p) {
			const mappedSpike = spikeMap[currentSpike];
			if (mappedSpike === -1 || !user[vars.inv][vars.n][mappedSpike]) continue;
			spikeId = mappedSpike;
			break;
		}
		if (spikeId) {
			let PInumb = 2 * Math.PI;
			let angle = user.control.angle;
			if (S.AMB.a && S.AMB.e) angle = S.AMB.a;

			let MYPLAYERANGLE = Math.floor((((angle + PInumb) % PInumb) * 255) / PInumb);
			if (!S.AutoSpike.m) {
				socket.send(JSON.stringify([packets.placeBuild, spikeId, MYPLAYERANGLE, 0]));
			}
			if (S.AutoSpike.m) {
				const i = Math.floor((((angle + e) % e) * 255) / e);
				socket.send(JSON.stringify([packets.placeBuild, spikeId, i, 0]));
				for (let index = 1; index < 30; index++) {
					socket.send(JSON.stringify([packets.placeBuild, spikeId, (-index + i) % 255, 0]));
					socket.send(JSON.stringify([packets.placeBuild, spikeId, (index + i) % 255, 0]));
				}
			}
		}
	}
	if (S.AutoWall.e && readys.AutoWall) {
		readys.AutoWall = false;
		setTimeout((e) => (readys.AutoWall = true), 50);
		let spikeId = 162;
		const e = 2 * Math.PI;

		if (spikeId) {
			let PInumb = 2 * Math.PI;
			let MYPLAYERANGLE = Math.floor((((user.control.angle + PInumb) % PInumb) * 255) / PInumb);
			if (!S.AutoSpike.m) {
				socket.send(JSON.stringify([packets.placeBuild, spikeId, MYPLAYERANGLE, 0]));
			}
			if (S.AutoSpike.m) {
				const i = Math.floor((((user.control.angle + e) % e) * 255) / e);
				socket.send(JSON.stringify([packets.placeBuild, spikeId, i, 0]));
				for (let index = 1; index < 30; index++) {
					socket.send(JSON.stringify([packets.placeBuild, spikeId, (-index + i) % 255, 0]));
					socket.send(JSON.stringify([packets.placeBuild, spikeId, (index + i) % 255, 0]));
				}
			}
		}
	}
}

document.addEventListener("DOMContentLoaded", () => {
	Utils.LoadHack();
});

function HoldWeapon(_, $) {
	switch (_) {
		case 34:
		case 18:
		case 33:
		case 15:
		case 14:
		case 13:
		case 12:
		case 16:
		case 17:
			return 2;
		case 57:
		case 5:
		case 6:
		case 30:
		case 62:
		case 9:
		case 0:
		case 63:
		case 19:
			return 1;
		case 64:
		case 65:
		case 66:
		case 67:
		case 68:
		case 70:
		case 69:
			return 3;
		case 45:
			if ($) return 4;
		case -1:
			if ($) return 5;
	}
	return 0;
}

function calcAngle(_, $, o) {
	return _ && $ ? (o ? Math.atan2($.r.y - _.r.y, $.r.x - _.r.x) : Math.atan2($.y - _.y, $.x - _.x)) : null;
}

function EnemyToAttack(myPlayer, PlayerList) {
	let nearest = null;
	let distSqrd = -1;
	let HoldingSpear = HoldWeapon(myPlayer.right, false) === 2 ? true : false;
	for (var i = 0, obj = null, d = null; i < PlayerList.length; ++i) {
		obj = PlayerList[i];
		if (obj[vars.pid] === myPlayer[vars.pid]) continue;
		if (user[vars.team].includes(obj[vars.pid])) continue;
		if (!obj.ally && myPlayer.fly === obj.fly && !obj.ghost) {
			d = (myPlayer.x - obj.x) ** 2 + (myPlayer.y - obj.y) ** 2;
			if (HoldingSpear && d < 330) continue;
			if (distSqrd === -1 || d < distSqrd) {
				distSqrd = d;
				nearest = obj;
			}
		}
	}
	return nearest;
}

function dist2dSQRT(p1, p2) {
	if (p1 && p2) {
		return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
	}
	return null;
}

function selectTool(tool1, tool2) {
	if (user[vars.inv][vars.n][tool1]) {
		if (myPlayer.right !== tool1) {
			socket.send(JSON.stringify([packets.equip, tool1]));
		}
	} else if (user[vars.inv][vars.n][tool2]) {
		if (myPlayer.right !== tool2) {
			socket.send(JSON.stringify([packets.equip, tool2]));
		}
	}
}

function getdist(a, b) {
	return Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y));
}

const IDS = {
	WOOD_AXE: 167,
	STONE_AXE: 168,
	GOLD_AXE: 169,
	DIAMOND_AXE: 170,
	AMETHYST_AXE: 171,
	REIDITE_AXE: 172,
};

let COUNTER = 0;

const INV = {
	SWORD: COUNTER++,
	// INV
	PICK: COUNTER++,
	// INV
	FUR: COUNTER++,
	// INV
	PICK_GOLD: COUNTER++,
	// INV
	PICK_DIAMOND: COUNTER++,
	// INV
	SWORD_GOLD: COUNTER++,
	// INV
	SWORD_DIAMOND: COUNTER++,
	// INV
	HAND: COUNTER++,
	// INV
	PICK_WOOD: COUNTER++,
	// INV
	PIRATE_SWORD: COUNTER++,
	// INV
	EARMUFFS: COUNTER++,
	// INV
	COAT: COUNTER++,
	// INV
	WOOD_SPEAR: COUNTER++,
	// INV
	SPEAR: COUNTER++,
	// INV
	GOLD_SPEAR: COUNTER++,
	// INV
	DIAMOND_SPEAR: COUNTER++,
	// INV
	DRAGON_SPEAR: COUNTER++,
	// INV
	LAVA_SPEAR: COUNTER++,
	// INV
	CRAB_SPEAR: COUNTER++,
	// INV
	REIDITE_SWORD: COUNTER++,
	// INV
	DIAMOND_PROTECTION: COUNTER++,
	// INV
	AMETHYST_PROTECTION: COUNTER++,
	// INV
	REIDITE_PROTECTION: COUNTER++,
	// INV
	EXPLORER_HAT: COUNTER++,
	// INV
	PIRATE_HAT: COUNTER++,
	// INV
	STONE_HELMET: COUNTER++,
	// INV
	GOLD_HELMET: COUNTER++,
	// INV
	DIAMOND_HELMET: COUNTER++,
	// INV
	BOOK: COUNTER++,
	// INV
	BAG: COUNTER++,
	// INV
	SWORD_AMETHYST: COUNTER++,
	// INV
	PICK_AMETHYST: COUNTER++,
	// INV
	PICK_REIDITE: COUNTER++,
	// INV
	AMETHYST_SPEAR: COUNTER++,
	// INV
	REIDITE_SPEAR: COUNTER++,
	// INV
	HAMMER: COUNTER++,
	// INV
	HAMMER_GOLD: COUNTER++,
	// INV
	HAMMER_DIAMOND: COUNTER++,
	// INV
	HAMMER_AMETHYST: COUNTER++,
	// INV
	HAMMER_REIDITE: COUNTER++,
	// INV
	CAP_SCARF: COUNTER++,
	// INV

	//Christmas
	CHRISTMAS_HAT: COUNTER++,
	// INV
	ELF_HAT: COUNTER++,
	// INV

	AMETHYST_HELMET: COUNTER++,
	// INV
	REIDITE_HELMET: COUNTER++,
	// INV
	SUPER_HAMMER: COUNTER++,
	// INV
	SHOVEL: COUNTER++,
	// INV
	SUPER_DIVING_SUIT: COUNTER++,
	// INV
	DIVING_MASK: COUNTER++,
	// INV
	WATERING_CAN_FULL: COUNTER++,
	// INV
	SHOVEL_GOLD: COUNTER++,
	// INV
	SHOVEL_DIAMOND: COUNTER++,
	// INV
	SHOVEL_AMETHYST: COUNTER++,
	// INV
	PITCHFORK: COUNTER++,
	// INV
	PITCHFORK2: COUNTER++,
	// INV
	SPANNER: COUNTER++,
	// INV
	MACHETE: COUNTER++,
	// INV
	SWORD_WOOD: COUNTER++,
	// INV
	WOOD_HELMET: COUNTER++,
	// INV
	DRAGON_HELMET: COUNTER++,
	// INV
	LAVA_HELMET: COUNTER++,
	// INV
	CROWN_CRAB: COUNTER++,
	// INV
	DRAGON_SWORD: COUNTER++,
	// INV
	LAVA_SWORD: COUNTER++,
	// INV
	WOOD_BOW: COUNTER++,
	// INV
	STONE_BOW: COUNTER++,
	// INV
	GOLD_BOW: COUNTER++,
	// INV
	DIAMOND_BOW: COUNTER++,
	// INV
	AMETHYST_BOW: COUNTER++,
	// INV
	REIDITE_BOW: COUNTER++,
	// INV
	DRAGON_BOW: COUNTER++,
	// INV
	WOOD_SHIELD: COUNTER++,
	// INV
	STONE_SHIELD: COUNTER++,
	// INV
	GOLD_SHIELD: COUNTER++,
	// INV
	DIAMOND_SHIELD: COUNTER++,
	// INV
	AMETHYST_SHIELD: COUNTER++,
	// INV
	REIDITE_SHIELD: COUNTER++,
	// INV
	CROWN_GREEN: COUNTER++,
	// INV
	CROWN_ORANGE: COUNTER++,
	// INV
	CROWN_BLUE: COUNTER++,
	// INV
	TURBAN1: COUNTER++,
	// INV
	TURBAN2: COUNTER++,
	// INV
	PILOT_HELMET: COUNTER++,
	// INV
	HOOD: COUNTER++,
	// INV
	PEASANT: COUNTER++,
	// INV
	WINTER_HOOD: COUNTER++,
	// INV
	WINTER_PEASANT: COUNTER++,
	// INV

	FLOWER_HAT: COUNTER++,
	// INV
	FUR_HAT: COUNTER++,
	// INV
	SADDLE: COUNTER++,
	// INV

	WITCH: COUNTER++,
	// INV
	NIMBUS: COUNTER++,
	// INV
	WAND1: COUNTER++,
	// INV
	WAND2: COUNTER++,
	// INV
	WOOD_AXE: COUNTER++,
	// INV
	STONE_AXE: COUNTER++,
	// INV
	GOLD_AXE: COUNTER++,
	// INV
	DIAMOND_AXE: COUNTER++,
	// INV
	AMETHYST_AXE: COUNTER++,
	// INV
	REIDITE_AXE: COUNTER++,
	// INV
	FIREFLY: COUNTER++,
	// INV
	WOOD_ARROW: COUNTER++,
	// INV
	STONE_ARROW: COUNTER++,
	// INV
	GOLD_ARROW: COUNTER++,
	// INV
	DIAMOND_ARROW: COUNTER++,
	// INV
	AMETHYST_ARROW: COUNTER++,
	// INV
	REIDITE_ARROW: COUNTER++,
	// INV
	DRAGON_ARROW: COUNTER++,
	// INV

	STONE: COUNTER++,
	// INV
	WOOD: COUNTER++,
	// INV
	PLANT: COUNTER++,
	// INV
	GOLD: COUNTER++,
	// INV
	DIAMOND: COUNTER++,
	// INV
	FIRE: COUNTER++,
	// INV
	WORKBENCH: COUNTER++,
	// INV
	SEED: COUNTER++,
	// INV
	MEAT: COUNTER++,
	// INV
	COOKED_MEAT: COUNTER++,
	// INV
	BIG_FIRE: COUNTER++,
	// INV
	FURNACE: COUNTER++,
	// INV
	PAPER: COUNTER++,
	// INV
	AMETHYST: COUNTER++,
	// INV
	AMETHYST_WALL: COUNTER++,
	// INV
	AMETHYST_SPIKE: COUNTER++,
	// INV
	AMETHYST_DOOR: COUNTER++,
	// INV
	BRIDGE: COUNTER++,
	// INV
	SAND: COUNTER++,
	// INV
	BOTTLE_FULL: COUNTER++,
	// INV
	BOTTLE_EMPTY: COUNTER++,
	// INV
	KRAKEN_SKIN: COUNTER++,
	// INV
	WATERING_CAN: COUNTER++,
	// INV
	FLOUR: COUNTER++,
	// INV
	WHEAT_SEED: COUNTER++,
	// INV
	COOKIE: COUNTER++,
	// INV
	WILD_WHEAT: COUNTER++,
	// INV
	WINDMILL: COUNTER++,
	// INV
	CAKE: COUNTER++,
	// INV
	FOODFISH: COUNTER++,
	// INV
	FOODFISH_COOKED: COUNTER++,
	// INV
	SCALES: COUNTER++,
	// INV
	GROUND: COUNTER++,
	// INV
	PLOT: COUNTER++,
	// INV
	ICE: COUNTER++,
	// INV
	BREAD: COUNTER++,
	// INV
	BREAD_OVEN: COUNTER++,
	// INV
	SANDWICH: COUNTER++,
	// INV

	FUR_WINTER: COUNTER++,
	// INV
	BLUE_CORD: COUNTER++,
	// INV
	LOCK: COUNTER++,
	// INV
	DRAGON_HEART: COUNTER++,
	// INV
	LAVA_HEART: COUNTER++,
	// INV
	RESURRECTION: COUNTER++,
	// INV
	EMERALD_MACHINE: COUNTER++,
	// INV

	EXTRACTOR_MACHINE_STONE: COUNTER++,
	// INV
	EXTRACTOR_MACHINE_GOLD: COUNTER++,
	// INV
	EXTRACTOR_MACHINE_DIAMOND: COUNTER++,
	// INV
	EXTRACTOR_MACHINE_AMETHYST: COUNTER++,
	// INV
	EXTRACTOR_MACHINE_REIDITE: COUNTER++,
	// INV

	LOCKPICK: COUNTER++,
	// INV
	TOTEM: COUNTER++,
	// INV
	SPIKE: COUNTER++,
	// INV
	CORD: COUNTER++,
	// INV
	WALL: COUNTER++,
	// INV
	STONE_WALL: COUNTER++,
	// INV
	GOLD_WALL: COUNTER++,
	// INV
	DIAMOND_WALL: COUNTER++,
	// INV
	WOOD_DOOR: COUNTER++,
	// INV
	CHEST: COUNTER++,
	// INV
	STONE_SPIKE: COUNTER++,
	// INV
	GOLD_SPIKE: COUNTER++,
	// INV
	DIAMOND_SPIKE: COUNTER++,
	// INV
	STONE_DOOR: COUNTER++,
	// INV
	GOLD_DOOR: COUNTER++,
	// INV
	DIAMOND_DOOR: COUNTER++,
	// INV
	FUR_WOLF: COUNTER++,
	// INV
	GEMME_GREEN: COUNTER++,
	// INV
	GEMME_ORANGE: COUNTER++,
	// INV
	GEMME_BLUE: COUNTER++,
	// INV
	SPECIAL_FUR: COUNTER++,
	// INV
	SPECIAL_FUR_2: COUNTER++,
	// INV
	BUCKET_FULL: COUNTER++,
	// INV
	BUCKET_EMPTY: COUNTER++,
	// INV
	WELL: COUNTER++,
	// INV
	SIGN: COUNTER++,
	// INV
	DRAGON_CUBE: COUNTER++,
	// INV
	DRAGON_ORB: COUNTER++,
	// INV
	LAVA_CUBE: COUNTER++,
	// INV
	LAVA_ORB: COUNTER++,
	// INV
	PUMPKIN_SEED: COUNTER++,
	// INV
	PUMPKIN: COUNTER++,
	// INV
	ROOF: COUNTER++,
	// INV
	GARLIC_SEED: COUNTER++,
	// INV
	GARLIC: COUNTER++,
	// INV
	THORNBUSH_SEED: COUNTER++,
	// INV
	THORNBUSH: COUNTER++,
	// INV
	BANDAGE: COUNTER++,
	// INV

	CRAB_STICK: COUNTER++,
	// INV
	CRAB_LOOT: COUNTER++,
	// INV
	BED: COUNTER++,
	// INV

	//Christmas
	SUGAR_CAN: COUNTER++,
	// INV
	CANDY: COUNTER++,
	// INV
	GARLAND: COUNTER++,
	// INV

	//LAVA BIOME
	REIDITE: COUNTER++,
	// INV
	FLAME: COUNTER++,
	// INV

	//FARMS UPDATE
	CARROT_SEED: COUNTER++,
	// INV
	CARROT: COUNTER++,
	// INV
	TOMATO_SEED: COUNTER++,
	// INV
	TOMATO: COUNTER++,
	// INV
	WATERMELON_SEED: COUNTER++,
	// INV
	WATERMELON: COUNTER++,
	// INV
	ALOE_VERA_SEED: COUNTER++,
	// INV
	ALOE_VERA: COUNTER++,
	// INV

	WOOD_DOOR_SPIKE: COUNTER++,
	// INV
	STONE_DOOR_SPIKE: COUNTER++,
	// INV
	GOLD_DOOR_SPIKE: COUNTER++,
	// INV
	DIAMOND_DOOR_SPIKE: COUNTER++,
	// INV
	AMETHYST_DOOR_SPIKE: COUNTER++,
	// INV
	REIDITE_WALL: COUNTER++,
	// INV
	REIDITE_DOOR: COUNTER++,
	// INV
	REIDITE_SPIKE: COUNTER++,
	// INV
	REIDITE_DOOR_SPIKE: COUNTER++,
	// INV
	WOOD_TOWER: COUNTER++,
	// INV
	PENGUIN_FEATHER: COUNTER++,
	// INV
	BOAT: COUNTER++,
	// INV
	SLED: COUNTER++,
	// INV
	MOUNT_BOAR: COUNTER++,
	// INV
	CRAB_BOSS: COUNTER++,
	// INV
	BABY_DRAGON: COUNTER++,
	// INV
	BABY_LAVA: COUNTER++,
	// INV
	HAWK: COUNTER++,
	// INV
	PLANE: COUNTER++,
	// INV
	HAWK_FEATHER: COUNTER++,
	// INV
	VULTURE_FEATHER: COUNTER++,
	// INV
	CACTUS: COUNTER++,
	// INV
	EMERALD: COUNTER++,
	// INV
	PITCHFORK_PART: COUNTER++,
	// INV
	PILOT_GLASSES: COUNTER++,
	// INV
	FUR_BOAR: COUNTER++,
	// INV
	SANDWORM_JUICE: COUNTER++,
	// INV
	BABY_MAMMOTH: COUNTER++,
	// INV
	FUR_MAMMOTH: COUNTER++,
	// INV
};
const ITEMS = {
	PLAYERS: 0,
	FIRE: 1,
	WORKBENCH: 2,
	SEED: 3,
	WALL: 4,
	SPIKE: 5,
	BIG_FIRE: 6,
	STONE_WALL: 7,
	GOLD_WALL: 8,
	DIAMOND_WALL: 9,
	WOOD_DOOR: 10,
	CHEST: 11,
	STONE_SPIKE: 12,
	GOLD_SPIKE: 13,
	DIAMOND_SPIKE: 14,
	STONE_DOOR: 15,
	GOLD_DOOR: 16,
	DIAMOND_DOOR: 17,
	FURNACE: 18,
	AMETHYST_WALL: 19,
	AMETHYST_SPIKE: 20,
	AMETHYST_DOOR: 21,
	RESURRECTION: 22,
	EMERALD_MACHINE: 23,

	EXTRACTOR_MACHINE_STONE: 24,
	EXTRACTOR_MACHINE_GOLD: 25,
	EXTRACTOR_MACHINE_DIAMOND: 26,
	EXTRACTOR_MACHINE_AMETHYST: 27,
	EXTRACTOR_MACHINE_REIDITE: 28,

	TOTEM: 29,
	BRIDGE: 30,
	WHEAT_SEED: 31,
	WINDMILL: 32,
	PLOT: 33,
	BREAD_OVEN: 34,
	WELL: 35,
	SIGN: 36,
	PUMPKIN_SEED: 37,
	ROOF: 38,
	GARLIC_SEED: 39,
	THORNBUSH_SEED: 40,
	BED: 41,
	//Christmas
	GARLAND: 42,
	TOMATO_SEED: 43,
	CARROT_SEED: 44,

	WOOD_DOOR_SPIKE: 45,
	STONE_DOOR_SPIKE: 46,
	GOLD_DOOR_SPIKE: 47,
	DIAMOND_DOOR_SPIKE: 48,
	AMETHYST_DOOR_SPIKE: 49,

	REIDITE_WALL: 50,
	REIDITE_DOOR: 51,
	REIDITE_SPIKE: 52,
	REIDITE_DOOR_SPIKE: 53,

	WATERMELON_SEED: 54,
	ALOE_VERA_SEED: 55,
	WOOD_TOWER: 56,

	WOLF: 60,
	SPIDER: 61,
	FOX: 62,
	BEAR: 63,
	DRAGON: 64,
	PIRANHA: 65,
	KRAKEN: 66,
	CRAB: 67,
	FLAME: 68,
	LAVA_DRAGON: 69,
	BOAR: 70,
	CRAB_BOSS: 71,
	BABY_DRAGON: 72,
	BABY_LAVA: 73,
	HAWK: 74,
	VULTURE: 75,
	SAND_WORM: 76,
	BABY_MAMMOTH: 77,
	MAMMOTH: 78,

	WHEAT_MOB: 79,
	RABBIT: 80,
	TREASURE_CHEST: 81,
	DEAD_BOX: 82,
	PUMPKIN_MOB: 83,
	GARLIC_MOB: 84,
	THORNBUSH_MOB: 85,
	CRATE: 86,

	//Christmas
	GIFT: 87,

	PENGUIN: 88,
	ALOE_VERA_MOB: 89,
	FIREFLY: 90,
	SPELL: 91,

	FRUIT: 100,
};

window.rs = new Image();
window.rs.src = "https://raw.githubusercontent.com/sfagasdzdgfhs/spikes/main/day-reidite-spike-ally.png";
window.rss = new Image();
window.rss.src = "https://raw.githubusercontent.com/sfagasdzdgfhs/spikes/main/day-amethyst-spike-ally.png";
window.rsss = new Image();
window.rsss.src = "https://raw.githubusercontent.com/sfagasdzdgfhs/spikes/main/day-diamond-spike-ally.png";
window.rssss = new Image();
window.rssss.src = "https://raw.githubusercontent.com/sfagasdzdgfhs/spikes/main/day-gold-spike-ally.png";
window.rsssss = new Image();
window.rsssss.src = "https://raw.githubusercontent.com/sfagasdzdgfhs/spikes/main/day-stone-spike-ally.png";
window.rssssss = new Image();
window.rssssss.src = "https://raw.githubusercontent.com/sfagasdzdgfhs/spikes/main/day-wood-spike-ally.png";

window.rsssssss = new Image();
window.rsssssss.src = "https://raw.githubusercontent.com/sfagasdzdgfhs/spikes/main/day-reidite-spike-enemy.png";
window.rssssssss = new Image();
window.rssssssss.src = "https://raw.githubusercontent.com/sfagasdzdgfhs/spikes/main/day-amethyst-spike-enemy.png";
window.rsssssssss = new Image();
window.rsssssssss.src = "https://raw.githubusercontent.com/sfagasdzdgfhs/spikes/main/day-diamond-spike-enemy.png";
window.rssssssssss = new Image();
window.rssssssssss.src = "https://raw.githubusercontent.com/sfagasdzdgfhs/spikes/main/day-gold-spike-enemy.png";
window.rsssssssssss = new Image();
window.rsssssssssss.src = "https://raw.githubusercontent.com/sfagasdzdgfhs/spikes/main/day-stone-spike-enemy.png";
window.rssssssssssss = new Image();
window.rssssssssssss.src = "https://raw.githubusercontent.com/sfagasdzdgfhs/spikes/main/day-wood-spike-enemy.png";

window.xs = new Image();
window.xs.src = "https://raw.githubusercontent.com/sfagasdzdgfhs/spikes/main/day-reidite-spike-door-ally.png";
window.xss = new Image();
window.xss.src = "https://raw.githubusercontent.com/sfagasdzdgfhs/spikes/main/day-amethyst-spike-door-ally.png";
window.xsss = new Image();
window.xsss.src = "https://raw.githubusercontent.com/sfagasdzdgfhs/spikes/main/day-diamond-spike-door-ally.png";
window.xssss = new Image();
window.xssss.src = "https://raw.githubusercontent.com/sfagasdzdgfhs/spikes/main/day-gold-spike-door-ally.png";
window.xsssss = new Image();
window.xsssss.src = "https://raw.githubusercontent.com/sfagasdzdgfhs/spikes/main/day-stone-spike-door-ally.png";
window.xssssss = new Image();
window.xssssss.src = "https://raw.githubusercontent.com/sfagasdzdgfhs/spikes/main/day-wood-spike-door-ally.png";

window.xsssssss = new Image();
window.xsssssss.src = "https://raw.githubusercontent.com/sfagasdzdgfhs/spikes/main/day-reidite-spike-door-enemy.png";
window.xssssssss = new Image();
window.xssssssss.src = "https://raw.githubusercontent.com/sfagasdzdgfhs/spikes/main/day-amethyst-spike-door-enemy.png";
window.cs = new Image();
window.cs.src = "https://raw.githubusercontent.com/sfagasdzdgfhs/spikes/main/day-diamond-spike-door-enemy.png";
window.css = new Image();
window.css.src = "https://raw.githubusercontent.com/sfagasdzdgfhs/spikes/main/day-gold-spike-door-enemy.png";
window.csss = new Image();
window.csss.src = "https://raw.githubusercontent.com/sfagasdzdgfhs/spikes/main/day-stone-spike-door-enemy.png";
window.cssss = new Image();
window.cssss.src = "https://raw.githubusercontent.com/sfagasdzdgfhs/spikes/main/day-wood-spike-door-enemy.png";

window.csssss = new Image();
window.csssss.src = "https://raw.githubusercontent.com/XmreLoux/images/main/door_reidite2.png";
window.yt = new Image();
window.yt.src = "https://raw.githubusercontent.com/XmreLoux/images/main/door_amethyst1.png";
window.ytt = new Image();
window.ytt.src = "https://raw.githubusercontent.com/XmreLoux/images/main/door_diamond2.png";
window.yttt = new Image();
window.yttt.src = "https://raw.githubusercontent.com/XmreLoux/images/main/door_gold2.png";
window.uii = new Image();
window.uii.src = "https://raw.githubusercontent.com/XmreLoux/images/main/door_stone1.png";
window.nn = new Image();
window.nn.src = "https://raw.githubusercontent.com/XmreLoux/images/main/door_wood2.png";

window.ii = new Image();
window.ii.src = "https://raw.githubusercontent.com/XmreLoux/images/main/door_reidite1.png";
window.gg = new Image();
window.gg.src = "https://raw.githubusercontent.com/XmreLoux/images/main/door_amethyst2.png";
window.ee = new Image();
window.ee.src = "https://raw.githubusercontent.com/XmreLoux/images/main/door_diamond1.png";
window.rrs = new Image();
window.rrs.src = "https://raw.githubusercontent.com/XmreLoux/images/main/door_gold1.png";
window.ff = new Image();
window.ff.src = "https://raw.githubusercontent.com/XmreLoux/images/main/door_stone2.png";
window.rr = new Image();
window.rr.src = "https://raw.githubusercontent.com/XmreLoux/images/main/door_wood1.png";

function coloredSpikes() {
	// window.sprite = ΔⲆ;
	let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMOPQRSTUVWXYZ_0123456789";

	for (let e in window) {
		if (!Array.isArray(window[e]) && chars.includes(e[0])) continue;
		if (window[e].length > 800 && window[e].length < 1500) window.sprite = window[e];
	}

	sprite[1000000] = [rssssss, rssssss];
	sprite[1000001] = [rssssssssssss, rssssssssssss];

	sprite[1000002] = [rsssss, rsssss];
	sprite[1000003] = [rsssssssssss, rsssssssssss];

	sprite[1000004] = [rssss, rssss];
	sprite[1000005] = [rssssssssss, rssssssssss];

	sprite[1000006] = [rsss, rsss];
	sprite[1000007] = [rsssssssss, rsssssssss];

	sprite[1000008] = [rss, rss];
	sprite[1000009] = [rssssssss, rssssssss];

	sprite[1000010] = [rs, rs];
	sprite[1000011] = [rsssssss, rsssssss];

	sprite[1000012] = [xssssss, xssssss];
	sprite[1000013] = [cssss, cssss];

	sprite[1000014] = [xsssss, xsssss];
	sprite[1000015] = [csss, csss];

	sprite[1000016] = [xssss, xssss];
	sprite[1000017] = [css, css];

	sprite[1000018] = [xsss, xsss];
	sprite[1000019] = [cs, cs];

	sprite[1000020] = [xss, xss];
	sprite[1000021] = [xssssssss, xssssssss];

	sprite[1000022] = [xs, xs];
	sprite[1000023] = [xsssssss, xsssssss];

	sprite[1000024] = [nn, nn];
	sprite[1000025] = [rr, rr];

	sprite[1000026] = [uii, uii];
	sprite[1000027] = [ff, ff];

	sprite[1000028] = [yttt, yttt];
	sprite[1000029] = [rrs, rrs];

	sprite[1000030] = [ytt, ytt];
	sprite[1000031] = [ee, ee];

	sprite[1000032] = [yt, yt];
	sprite[1000033] = [gg, gg];

	sprite[1000034] = [csssss, csssss];
	sprite[1000035] = [ii, ii];

	let checkAlly = (n) => {
		if (n === user.id) return true;
		return user[vars.team].includes(n);
	};
	// let InventoryHas = (n) => null != user.inv.n.find((e) => e.id === n);

	let push = Array.prototype.push;

	Array.prototype.push = function (p) {
		if (p) {
			let a = Object.keys(p);
			5 == a.length &&
				a.includes("draw") &&
				a.includes("in_button") &&
				32 !== p.id &&
				130 !== p.id &&
				127 !== p.id &&
				4 !== p.id &&
				25 !== p.id &&
				34 !== p.id &&
				87 !== p.id &&
				(window.inventory = this);
		}
		if (p && null != p.type && null != p.id && p.x && p.y)
			switch ((0 === p.type && p.id === window.playerID && (window.player = p), p.type)) {
				case 5: {
					p.ally = checkAlly(p[vars.pid]);
					let l = p[vars.drawSpike];

					p[vars.drawSpike] = function (a) {
						return S.ColoredSpikes
							? p.ally
								? l.apply(this, [1000000])
								: l.apply(this, [1000001])
							: l.apply(this, arguments);
					};
					break;
				}
				case 12: {
					p.ally = checkAlly(p[vars.pid]);

					let i = p[vars.drawSpike];

					p[vars.drawSpike] = function (a) {
						return S.ColoredSpikes
							? p.ally
								? i.apply(this, [1000002])
								: i.apply(this, [1000003])
							: i.apply(this, arguments);
					};
					break;
				}
				case 13: {
					p.ally = checkAlly(p[vars.pid]);

					let e = p[vars.drawSpike];

					p[vars.drawSpike] = function (a) {
						return S.ColoredSpikes
							? p.ally
								? e.apply(this, [1000004])
								: e.apply(this, [1000005])
							: e.apply(this, arguments);
					};
					break;
				}
				case 14: {
					p.ally = checkAlly(p[vars.pid]);

					let t = p[vars.drawSpike];

					p[vars.drawSpike] = function (a) {
						return S.ColoredSpikes
							? p.ally
								? t.apply(this, [1000006])
								: t.apply(this, [1000007])
							: t.apply(this, arguments);
					};
					break;
				}
				case 20: {
					p.ally = checkAlly(p[vars.pid]);

					let r = p[vars.drawSpike];

					p[vars.drawSpike] = function (a) {
						return S.ColoredSpikes
							? p.ally
								? r.apply(this, [1000008])
								: r.apply(this, [1000009])
							: r.apply(this, arguments);
					};
					break;
				}
				case 52: {
					p.ally = user.id === p[vars.pid] || checkAlly(p[vars.pid]);
					let y = p[vars.drawSpike];

					p[vars.drawSpike] = function (a) {
						return S.ColoredSpikes
							? p.ally
								? y.apply(this, [1000010])
								: y.apply(this, [1000011])
							: y.apply(this, arguments);
					};
					break;
				}
				case 10: {
					p.ally = checkAlly(p[vars.pid]);

					let s = p[vars.drawSpike];

					p[vars.drawSpike] = function (a) {
						return S.ColoredSpikes
							? a !== 187
								? s.apply(this, arguments)
								: p.ally
								? s.apply(this, [1000024])
								: s.apply(this, [1000025])
							: s.apply(this, arguments);
					};
					break;
				}
				case 15: {
					p.ally = checkAlly(p[vars.pid]);

					let d = p[vars.drawSpike];

					p[vars.drawSpike] = function (a) {
						return 0 != p.extra
							? d.apply(this, arguments)
							: S.ColoredSpikes
							? p.ally
								? d.apply(this, [1000026])
								: d.apply(this, [1000027])
							: d.apply(this, arguments);
					};
					break;
				}
				case 16: {
					p.ally = checkAlly(p[vars.pid]);

					let $ = p[vars.drawSpike];

					p[vars.drawSpike] = function (a) {
						return a !== 189
							? $.apply(this, arguments)
							: S.ColoredSpikes
							? p.ally
								? $.apply(this, [1000028])
								: $.apply(this, [1000029])
							: $.apply(this, arguments);
					};
					break;
				}
				case 17: {
					p.ally = checkAlly(p[vars.pid]);

					let h = p[vars.drawSpike];

					p[vars.drawSpike] = function (a) {
						return a !== 190
							? h.apply(this, arguments)
							: S.ColoredSpikes
							? p.ally
								? h.apply(this, [1000030])
								: h.apply(this, [1000031])
							: h.apply(this, arguments);
					};
					break;
				}
				case 21: {
					p.ally = checkAlly(p[vars.pid]);

					let n = p[vars.drawSpike];

					p[vars.drawSpike] = function (a) {
						return S.ColoredSpikes
							? a != 191
								? n.apply(this, arguments)
								: p.ally
								? n.apply(this, [1000032])
								: n.apply(this, [1000033])
							: n.apply(this, arguments);
					};
					break;
				}
				case 51: {
					p.ally = checkAlly(p[vars.pid]);

					let o = p[vars.drawSpike];

					p[vars.drawSpike] = function (a) {
						return a !== 192
							? o.apply(this, arguments)
							: S.ColoredSpikes
							? p.ally
								? o.apply(this, [1000034])
								: o.apply(this, [1000035])
							: o.apply(this, arguments);
					};
					break;
				}
				case 45: {
					p.ally = checkAlly(p[vars.pid]);

					let _ = p[vars.drawSpike];

					p[vars.drawSpike] = function (a) {
						return S.ColoredSpikes
							? a !== 193
								? _.apply(this, arguments)
								: p.ally
								? _.apply(this, [1000012])
								: _.apply(this, [1000013])
							: _.apply(this, arguments);
					};
					break;
				}
				case 46: {
					p.ally = checkAlly(p[vars.pid]);

					let D = p[vars.drawSpike];

					p[vars.drawSpike] = function (a) {
						return a !== 194
							? D.apply(this, arguments)
							: S.ColoredSpikes
							? p.ally
								? D.apply(this, [1000014])
								: D.apply(this, [1000015])
							: D.apply(this, arguments);
					};
					break;
				}
				case 47: {
					p.ally = checkAlly(p[vars.pid]);

					let u = p[vars.drawSpike];

					p[vars.drawSpike] = function (a) {
						return a !== 195
							? u.apply(this, arguments)
							: S.ColoredSpikes
							? p.ally
								? u.apply(this, [1000016])
								: u.apply(this, [1000017])
							: u.apply(this, arguments);
					};
					break;
				}
				case 48: {
					p.ally = checkAlly(p[vars.pid]);

					let c = p[vars.drawSpike];

					p[vars.drawSpike] = function (a) {
						return a !== 196
							? c.apply(this, arguments)
							: S.ColoredSpikes
							? p.ally
								? c.apply(this, [1000018])
								: c.apply(this, [1000019])
							: c.apply(this, arguments);
					};
					break;
				}
				case 49: {
					p.ally = checkAlly(p[vars.pid]);

					let I = p[vars.drawSpike];

					p[vars.drawSpike] = function (a) {
						return S.ColoredSpikes
							? a !== 197
								? I.apply(this, arguments)
								: p.ally
								? I.apply(this, [1000020])
								: I.apply(this, [1000021])
							: I.apply(this, arguments);
					};
					break;
				}
				case 53: {
					p.ally = checkAlly(p[vars.pid]);

					let w = p[vars.drawSpike];

					p[vars.drawSpike] = function (a) {
						return S.ColoredSpikes
							? a !== 198
								? w.apply(this, arguments)
								: p.ally
								? w.apply(this, [1000022])
								: w.apply(this, [1000023])
							: w.apply(this, arguments);
					};
					break;
				}
			}
		return push.apply(this, arguments);
	};
}
