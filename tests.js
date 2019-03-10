var entities = [{
	name: "user",
	create: (function () {var counter = 0; return function(){ counter ++; return createUser(counter + [], counter + [])}}()),
	createFn: createUser,
	remove: deleteUser,
	getAll: users,
	addToGroup: addUserToGroup,
	removeFromGroup: removeUserFromGroup,
	inGroup: function(user, group) { return userGroups(user).indexOf(group) != -1; }
}, {
	name: "right",
	create: createRight,
	createFn: createRight,
	remove: deleteRight,
	getAll: rights,
	addToGroup: addRightToGroup,
	removeFromGroup: removeRightFromGroup,
	inGroup: function(right, group) { return groupRights(group).indexOf(right) != -1; }
}, {
	name: "group",
	create: createGroup, 
	createFn: createGroup,
	remove: deleteGroup, 
	getAll: groups
}];

entities.forEach(function(entity) {
	describe("Функция " + entity.getAll.name, function() {
		it("должна вернуть массив", function() {
			expect(entity.getAll()).toEqual(jasmine.any(Array));
		});
	});	

	describe("Функция " + entity.createFn.name, function() {
		var createdEntity;

		it("должна вернуть что-то вменяемое", function() {
			createdEntity = entity.create();
			expect(createdEntity).toBeTruthy();
		});

		it("должна создать " + entity.name, function() {
			expect(entity.getAll()).toContain(createdEntity);
		});
	});

	describe("Функция " + entity.remove.name, function() {
		it ("должна вернуть undefined", function() {
			var entityToRemove = entity.create();
			expect(entity.remove(entityToRemove)).toBeUndefined();
		});

		it("должна удалить " + entity.name, function() {
			var entityToRemove = entity.create();
			entity.remove(entityToRemove);

			entity.getAll().forEach(function(item) {
				expect(item).not.toBe(entityToRemove);
			});
		});

		it("должна бросить исключение, если ей передали плохой аргумент", function() {
			expect(function() { entity.remove(null)      }).toThrowError(Error);
			expect(function() { entity.remove(undefined) }).toThrowError(Error);
		});

		it("должна бросить исключение, если ей передали уже удаленн(ого/ое/ую) " + entity.name, function() {
			var entityToRemove = entity.create();
			entity.remove(entityToRemove);
			expect(function() { entity.remove(entityToRemove) }).toThrowError(Error);
		});
	});


	if (entity.addToGroup) {
		describe("Функция " +  entity.addToGroup.name, function() {
			it("Должна добавлять "+ entity.name +" в группу", function() {
				var createdEntity = entity.create();
				var group = createGroup();
				entity.addToGroup(createdEntity, group);
				expect(entity.inGroup(createdEntity, group)).toBe(true);
			});

			it("должна добавлять несколько "+ entity.name +" в группу последовательно", function() {
				var createdEntities = [entity.create(), entity.create(), entity.create()];
				var group = createGroup();
				createdEntities.forEach(function(createdEntity) { entity.addToGroup(createdEntity, group); });
				createdEntities.forEach(function(createdEntity) { expect(entity.inGroup(createdEntity, group)).toBe(true) });
			});

			it ("Должна вернуть undefined", function() {
				var createdEntity = entity.create();
				var group = createGroup();
				expect(entity.addToGroup(createdEntity, group)).toBeUndefined();
			});

			it("должна бросить исключение, если ей передали плохие аргументы", function() {
				var params = [[null, null], [undefined, undefined],
				[entity.create(), null], [entity.create(), undefined],
				[null, createGroup()], [undefined, createGroup()]];

				params.forEach(function(args) {
					expect(function() { entity.addToGroup.apply(null, args)}).toThrowError(Error);	
				});
			});

			it ("должна бросить исключение, если ей передали что-то удаленное", function() {
				var firstEntity  = entity.create();
				var secondEntity = entity.create();
				var group = createGroup();

				entity.remove(firstEntity);
				expect(function() { entity.addToGroup(firstEntity, group) }).toThrowError(Error);

				deleteGroup(group);
				expect(function() { addRightToGroup(secondEntity, group) }).toThrowError(Error);
			});
		});
	};

	if (entity.removeFromGroup) {
		describe("Функция " +  entity.removeFromGroup.name, function() {
			it ("должна удалить "+ entity.name +" из группы", function() {
				var createdEntity = entity.create();
				var group = createGroup();
				entity.addToGroup(createdEntity, group);
				entity.removeFromGroup(createdEntity, group);
				expect(entity.inGroup(createdEntity, group)).toBe(false);
			});

			it ("должна вернуть undefined", function() {
				var createdEntity = entity.create();
				var group = createGroup();
				entity.addToGroup(createdEntity, group);
				expect(entity.removeFromGroup(createdEntity, group)).toBeUndefined();
			});

			it ("должна должна бросить исключение при попытке удалить "+ entity.name +" из группы, которого там нет", function() {
				var createdEntity = entity.create();
				var group = createGroup();

				expect(function() { entity.removeFromGroup(createdEntity, group)}).toThrowError(Error);

				entity.addToGroup(createdEntity, group);
				entity.removeFromGroup(createdEntity, group);

				expect(function() { entity.removeFromGroup(createdEntity, group)}).toThrowError(Error);
			});

			it ("должна удалить "+ entity.name +" только из группы (а не вообще)", function() {
				var createdEntity = entity.create();
				var group = createGroup();
				entity.addToGroup(createdEntity, group);
				entity.removeFromGroup(createdEntity, group);
				expect(entity.getAll()).toContain(createdEntity);
			});

			it("должна бросить исключение, если ей передали плохой аргумент", function() {
				var params = [[null, null], [undefined, undefined],
				[entity.create(), null], [entity.create(), undefined],
				[null, createGroup()], [undefined, createGroup()]];

				params.forEach(function(args) {
					expect(function() { entity.removeFromGroup.apply(null, args)}).toThrowError(Error);
				});
			});

			it ("должна бросить исключение, если ей передали что-то удаленное", function() {
				var firstEntity  = entity.create();
				var secondEntity = entity.create();
				var group 		 = createGroup();

				entity.addToGroup(firstEntity,  group);
				entity.addToGroup(secondEntity, group);

				entity.remove(firstEntity);
				expect(function() { entity.removeFromGroup(firstEntity, group) }).toThrowError(Error);

				deleteGroup(group);
				expect(function() { entity.removeFromGroup(secondEntity, group) }).toThrowError(Error);
			});
		});
	};
});

describe("Функция groupRights", function() {
	it("должна вернуть массив", function() {
		createGroup();
		groups().forEach(function(group) {
			expect(groupRights(group)).toEqual(jasmine.any(Array));
		});
	});
});

describe("Функция userGroups", function() {
	it("должна вернуть массив", function() {
		createUser("x", "x");
		users().forEach(function(user) {
			expect(userGroups(user)).toEqual(jasmine.any(Array));
		});
	});
});

describe("После удаления", function() {
	it("какой-либо группы последующие вызовы функции userGroups не должны возвращать удаленную группу", function() {
		var user = createUser("y", "y");
		var group = createGroup();

		addUserToGroup(user, group);
		deleteGroup(group);

		expect(userGroups(user)).not.toContain(group);
	})

	it("какого-нибудь права последующие вызовы функции groupRights не должны возвращать удаленное право", function() {
		var right = createRight();
		var group = createGroup();

		addRightToGroup(right, group);
		deleteRight(right);

		expect(groupRights(group)).not.toContain(right);
	})
});

function consistentState() {
	var testUsers = users().reduce(function(result, user) {
		return result && userGroups(user).reduce(function(result, group) {
			if (groups().indexOf(group) == -1)
				throw [user, group];

			return result && groups().indexOf(group) != -1;
		}, true);
	}, true);

	var testGroups = groups().reduce(function(result, group) {
		return result && groupRights(group).reduce(function(result, right) {
			if (rights().indexOf(right) == -1)
				throw [right, group];

			return result && rights().indexOf(right) != -1;
		}, true);
	}, true);

	return testUsers && testGroups;
};

describe("Аутентификация:", function() {
	var user = createUser("pumpkin", "42");
	var anotherUser = createUser("tomato", "40");

	it("вначале сесси пользователя не существует", function() {
		expect(currentUser()).toBeUndefined();
	});

	it("мы входим в систему при помощи функции login", function() {
		expect(login("pumpkin", "42")).toBe(true);
	});

	it("текущий пользователь действительно тот, чье имя и пароль мы указали", function() {
		expect(currentUser()).toBe(user);
	});

	it("повторные попытки входа должны быть неуспешными", function() {
		expect(login("pumpkin", "42")).toBe(false);
		expect(login("tomto",   "40")).toBe(false);
	});

	it("завершаем сессию пользователя функцией logout", function() {
		logout();
		expect(currentUser()).toBeUndefined();
	});

	it("и теперь мы можем продолжить работу как другой пользователь", function() {
		expect(login("tomato", "40")).toBe(true);
		expect(currentUser()).toBe(anotherUser);
	});
});

describe("Авторизация:", function() {
	var user = createUser("batman", "i_wil_beat_superman_one_day");

	var group1 = createGroup();
	var group2 = createGroup();

	addUserToGroup(user, group1);
	addUserToGroup(user, group2);

	var right1 = createRight();
	var right2 = createRight();
	var right3 = createRight();
	var right4 = createRight();
	var right5 = createRight();

	addRightToGroup(right1, group1);
	addRightToGroup(right2, group1);
	addRightToGroup(right3, group2);
	addRightToGroup(right4, group2);

	it("простая проверка прав", function() {
		expect(isAuthorized(user, right1)).toBe(true);
		expect(isAuthorized(user, right2)).toBe(true);
		expect(isAuthorized(user, right3)).toBe(true);
		expect(isAuthorized(user, right4)).toBe(true);
		expect(isAuthorized(user, right5)).toBe(false);
	});

	it("проверка после добавления нового права в группу", function() {
		var right = createRight();
		expect(isAuthorized(user, right)).toBe(false);
		addRightToGroup(right, group2);
		expect(isAuthorized(user, right)).toBe(true);
	});

	it("проверка после добавления пользователя в новую группу", function() {
		var group = createGroup();
		var right = createRight();

		addRightToGroup(right, group);

		expect(isAuthorized(user, right)).toBe(false);
		addUserToGroup(user, group);
		expect(isAuthorized(user, right)).toBe(true);
	});

	it("проверка после удаления права из группы", function() {
		expect(isAuthorized(user, right1)).toBe(true);
		removeRightFromGroup(right1, group1);
		expect(isAuthorized(user, right1)).toBe(false);
	});

	it("проверка после удаления пользователя из группы", function() {
		expect(isAuthorized(user, right3)).toBe(true);
		removeUserFromGroup(user, group2);
		expect(isAuthorized(user, right3)).toBe(false);
	});

	it("проверка после удаления группы", function() {
		expect(isAuthorized(user, right2)).toBe(true);
		deleteGroup(group1);
		expect(isAuthorized(user, right2)).toBe(false);
	});

	it ("функция isAuthorized должна бросать исключения, когда её вызывают с плохими аргументами", function() {
		var params = [[null, null], [undefined, undefined],
			[createUser("asd", "asd"), null], [createUser("qwe", "qwe"), undefined],
			[null, createRight()], [undefined, createRight()]];

		params.forEach(function(args) {
			expect(function() { isAuthorized.apply(null, args)}).toThrowError(Error);
		});
	});

	it ("функция isAuthorized должна бросать исключения, когда либо пользователь, либо право было удалено", function() {
		var user = createUser("xxx", "xxx");
		var right1 = createRight();
		var right2 = createRight();

		
		deleteRight(right1);
		expect(function() { isAuthorized(user, right1)}).toThrowError(Error);

		deleteUser(user);
		expect(function() { isAuthorized(user, right2)}).toThrowError(Error);
	});
});

describe("После предварительного тестирования", function() {
	it("система должна находится в корректном состоянии", function() {
		expect(consistentState()).toBe(true);
	});
});

function randomElement(array) {
	return array[Math.floor(Math.random() * array.length)];
}

var actions = [
	entities[0].create,
	entities[1].create,
	entities[2].create,
	function() {
		if (users().length == 0) return;
		deleteUser(randomElement(users()));
	},
	function() {
		if (rights().length == 0) return;
		deleteRight(randomElement(rights()));
	},
	function() {
		if (groups().length == 0) return;
		deleteGroup(randomElement(groups()));
	},
	function() {
		if (groups().length == 0 || users().length == 0) return;
		var user = randomElement(users());
		var group = randomElement(groups());
		addUserToGroup(user, group);
	},
	function() {
		var usersWithGroups = users().filter(function(user) { return userGroups(user).length > 0; });
		if (usersWithGroups.length > 0) {
			var user = randomElement(usersWithGroups);
			removeUserFromGroup(user, randomElement(userGroups(user)));
		}
	},
	function() {
		if (groups().length == 0 || rights().length == 0) return;
		var right = randomElement(rights());
		var group = randomElement(groups());
		addRightToGroup(right, group);
	},
	function() {
		var groupsWithRights = groups().filter(function(group) { return groupRights(group).length > 0; });
		if (groupsWithRights.length > 0) {
			var group = randomElement(groupsWithRights);
			removeRightFromGroup(randomElement(groupRights(group)), group);
		}
	}
];

describe("Выполняем кучу разных действий", function() {
	it("и система снова должна находится в корректном состоянии", function() {
		for (var i = 0; i < 10000; i++) {
			randomElement(actions)();
		}

		expect(consistentState()).toBe(true);
	});
});